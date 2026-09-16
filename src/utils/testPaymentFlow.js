// STANDALONE LOCAL TEST HARNESS — NOT PART OF THE SHIPPED FRONTEND BUNDLE.
//
// This file lives under frontend/src/utils/ per this step's instructions, but it
// is never imported by App.jsx, any page, or any component, and must never be.
// It imports Node-only modules (mongoose) and reads BACKEND secrets
// (MONGODB_URI, CASHFREE_SECRET_KEY) directly from backend/.env — none of that
// may ever ship inside a Vite-bundled browser file. Run it directly with Node:
//
//   node frontend/src/utils/testPaymentFlow.js
//
// The backend dev server must already be running at http://localhost:5000,
// since Step 2 fires a real HTTP POST at its public webhook route.

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import crypto from 'crypto';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '../../../backend');

// Resolve mongoose through the BACKEND's own node_modules, not the frontend's.
// The dynamically-imported model files below (User.js, Product.js, Order.js)
// each do `import mongoose from 'mongoose'` themselves, which Node resolves
// relative to THEIR location in backend/ — a mongoose package installed in
// frontend/node_modules would be a second, entirely separate module instance
// with its own independent connection state, and models built against the
// backend's instance would never see a connection made on the frontend's.
const backendRequire = createRequire(pathToFileURL(path.join(BACKEND_ROOT, 'package.json')).href);
const { default: mongoose } = await import(pathToFileURL(backendRequire.resolve('mongoose')).href);
const BACKEND_URL = 'http://localhost:5000/api/v1';

// This harness deliberately bridges both halves of the stack, so it loads the
// backend's own .env rather than duplicating secrets into the frontend tree.
dotenv.config({ path: path.join(BACKEND_ROOT, '.env') });

// A minimal stand-in for the browser globals Checkout.jsx's loadCashfreeSdk()
// touches, so Step 1 can prove the FRONTEND's own reaction logic is correct —
// without a real browser and without real Cashfree.
function installFakeBrowserGlobals() {
  let injectedScriptSrc = null;
  let checkoutCallArgs = null;

  globalThis.document = {
    createElement: () => {
      const script = { onload: null, onerror: null };
      Object.defineProperty(script, 'src', {
        set(value) {
          injectedScriptSrc = value;
          // Simulate the SDK finishing its (real, network) load and exposing
          // window.Cashfree, exactly like the real <script onload> would.
          setTimeout(() => {
            globalThis.window.Cashfree = (config) => ({
              checkout: (args) => {
                checkoutCallArgs = { config, args };
              },
            });
            script.onload?.();
          }, 0);
        },
        get() {
          return injectedScriptSrc;
        },
      });
      return script;
    },
    body: { appendChild: () => {} },
  };
  globalThis.window = {};

  return {
    getInjectedScriptSrc: () => injectedScriptSrc,
    getCheckoutCallArgs: () => checkoutCallArgs,
  };
}

// The exact same loadCashfreeSdk implementation as Checkout.jsx. Duplicated
// here on purpose — this harness must not import a .jsx file, and this step
// must not alter Checkout.jsx to export internals it doesn't otherwise need to.
function loadCashfreeSdk() {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Failed to load Cashfree checkout SDK'));
    document.body.appendChild(script);
  });
}

async function step1MockCheckoutSuccess({ User, Product, Order }) {
  console.log('\n--- STEP 1: Mock Checkout Success ---');

  const user = await User.create({
    name: 'Harness Test User',
    email: `harness-${Date.now()}@example.com`,
    password: 'placeholder',
  });
  const product = await Product.create({
    title: 'Harness Test Jacket',
    description: 'x',
    basePrice: 4000,
    category: 'HarnessTest',
    variants: [{ size: 'M', color: 'Black', sku: `HARNESS-${Date.now()}`, stock: 5 }],
  });

  const testOrderId = `order_harness_${Date.now()}`;
  const mockPaymentSessionId = `session_harness_${Date.now()}`;

  // Mirrors exactly what initializePayment does up to (but not including) the
  // real external Cashfree fetch() call — the one part of the real pipeline
  // that genuinely cannot run without real Cashfree credentials.
  const order = await Order.create({
    user: user._id,
    items: [
      {
        product: product._id,
        variant: { size: 'M', color: 'Black', sku: product.variants[0].sku },
        quantity: 1,
        priceAtPurchase: product.basePrice,
      },
    ],
    shippingAddress: {
      fullName: 'Harness Tester',
      street: '1 Test St',
      city: 'Mumbai',
      state: 'MH',
      zip: '400001',
    },
    financialSummary: { subtotal: 4000, shipping: 0, tax: 200, totalAmount: 4200 },
    cashfreeOrderId: testOrderId,
    paymentStatus: 'pending',
  });

  console.log('Mock "checkout succeeded" response fabricated:', {
    payment_session_id: mockPaymentSessionId,
    orderId: testOrderId,
  });
  console.log('Real pending Order document created in MongoDB:', order._id.toString());

  // Now prove the FRONTEND side reacts correctly to that mock response — this
  // is the exact branch handleSubmit takes in Checkout.jsx on success.
  const fakeGlobals = installFakeBrowserGlobals();
  const paymentSessionId = mockPaymentSessionId;

  if (paymentSessionId) {
    const Cashfree = await loadCashfreeSdk();
    const cashfree = Cashfree({ mode: 'sandbox' });
    cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
  }

  // The SDK-loading path is asynchronous (script onload); give it a tick.
  await new Promise((resolve) => setTimeout(resolve, 10));

  const scriptSrc = fakeGlobals.getInjectedScriptSrc();
  const checkoutArgs = fakeGlobals.getCheckoutCallArgs();
  console.log('SDK script injection targeted:', scriptSrc);
  console.log('cashfree.checkout() called with:', JSON.stringify(checkoutArgs));
  console.log(
    '  -> paymentSessionId matches mock session:',
    checkoutArgs?.args?.paymentSessionId === mockPaymentSessionId
  );
  console.log('  -> redirectTarget correct:', checkoutArgs?.args?.redirectTarget === '_self');

  return { user, product, order, testOrderId };
}

async function step2MockWebhookClearance(testOrderId) {
  console.log('\n--- STEP 2: Mock Webhook Clearance ---');

  const payload = {
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: { order_id: testOrderId },
      payment: { payment_status: 'SUCCESS', payment_amount: 4200, payment_currency: 'INR' },
    },
  };
  const rawBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
    .update(timestamp + rawBody)
    .digest('base64');

  const res = await fetch(`${BACKEND_URL}/payments/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': signature,
      'x-webhook-timestamp': timestamp,
    },
    body: rawBody,
  });

  const data = await res.json();
  console.log('Webhook POST response:', res.status, data);
  return res.status === 200;
}

async function step3VerifyDatabase(Order, orderDocId, testOrderId) {
  console.log('\n--- STEP 3: Database Verification ---');

  const order = await Order.findById(orderDocId);
  console.log('paymentStatus:', order.paymentStatus);
  console.log('  -> transitioned pending -> paid:', order.paymentStatus === 'paid');
  console.log('webhookLogs count:', order.webhookLogs.length);
  console.log('  -> event recorded:', order.webhookLogs[0]?.event === 'PAYMENT_SUCCESS_WEBHOOK');
  console.log(
    '  -> payload preserved with correct order_id:',
    order.webhookLogs[0]?.payload?.data?.order?.order_id === testOrderId
  );

  return order;
}

async function runHarness() {
  const { default: User } = await import(pathToFileURL(path.join(BACKEND_ROOT, 'models/User.js')).href);
  const { default: Product } = await import(pathToFileURL(path.join(BACKEND_ROOT, 'models/Product.js')).href);
  const { default: Order } = await import(pathToFileURL(path.join(BACKEND_ROOT, 'models/Order.js')).href);

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to db:', mongoose.connection.name);

  const { user, product, order, testOrderId } = await step1MockCheckoutSuccess({ User, Product, Order });
  const webhookAccepted = await step2MockWebhookClearance(testOrderId);
  const finalOrder = await step3VerifyDatabase(Order, order._id, testOrderId);

  console.log('\n--- HARNESS RESULT ---');
  console.log('Webhook accepted (200):', webhookAccepted);
  console.log('Order flipped pending -> paid:', finalOrder.paymentStatus === 'paid');

  await Order.deleteOne({ _id: order._id });
  await Product.deleteOne({ _id: product._id });
  await User.deleteOne({ _id: user._id });
  console.log('\nTest data cleaned up.');

  await mongoose.disconnect();
}

runHarness().catch((err) => {
  console.error('Harness failed:', err);
  process.exit(1);
});
