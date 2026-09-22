import { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';

const inputClasses =
  'w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors duration-300';
const labelClasses = 'text-xs uppercase tracking-widest text-white/40';

// Dynamically injects the official Razorpay Checkout SDK the first time it's
// needed, rather than requiring a permanent <script> tag in index.html.
const loadRazorpaySdk = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout SDK'));
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);
    try {
      const { data } = await api.post('/auth/resend-verification');
      setResendMessage(data.message);
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.fullName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
      };

      const { data } = await api.post('/payments/checkout', payload);
      const { razorpayOrderId, amount, currency, keyId, customer } = data;

      if (razorpayOrderId) {
        const Razorpay = await loadRazorpaySdk();
        const rzp = new Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: razorpayOrderId,
          name: 'JOJO & CO',
          description: 'Order Payment',
          prefill: {
            name: customer?.name,
            email: customer?.email,
            contact: customer?.phone,
          },
          theme: { color: '#a855f7' },
          // The Checkout widget's own success callback — actual order
          // confirmation still waits on the server-verified webhook, this
          // just moves the shopper on to the status page.
          handler: () => {
            window.location.href = `/order-result?order_id=${razorpayOrderId}`;
          },
          modal: {
            ondismiss: () => {
              setSubmitError('Payment was cancelled.');
              setIsSubmitting(false);
            },
          },
        });
        rzp.on('payment.failed', () => {
          window.location.href = `/order-result?order_id=${razorpayOrderId}`;
        });
        rzp.open();
      } else {
        setSubmitError('Payment session could not be initialized');
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to initialize checkout');
      setIsSubmitting(false);
    }
  };

  if (user && !user.emailVerified) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-ink">
        <div className="grain-overlay" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 pt-32">
          <div className="w-full max-w-md border border-white/10 p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="font-serif text-2xl text-brand">Verify Your Email to Check Out</h1>
            <p className="text-sm text-white/60">
              We sent a verification link to <span className="font-medium text-white">{user.email}</span> when you
              signed up. Please confirm it before placing an order — this is how we make sure order updates and
              invoices actually reach you.
            </p>
            {resendMessage && (
              <p className="text-sm text-white/70 border border-white/10 px-4 py-3 w-full">{resendMessage}</p>
            )}
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="btn-glow text-white px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 sm:px-8 pt-28 pb-8">
        {/* Left column — shipping + payment */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-2xl text-brand">Shipping Details</h2>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jordan Ellis"
                required
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="221B Baker Street"
                required
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className={labelClasses}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  required
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClasses}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="400001"
                required
                className={inputClasses}
              />
            </div>
          </div>

          {/* Payment method frame */}
          <div className="flex flex-col gap-4 border border-white/10 p-6">
            <h2 className="font-serif text-lg text-brand">Payment Method</h2>
            <div className="flex items-center justify-between border border-white/15 px-4 py-4">
              <span className="text-sm text-white/60">Razorpay Payment Gateway</span>
              <span className="text-xs uppercase tracking-widest border border-brand text-brand px-4 py-2">
                Secured
              </span>
            </div>
          </div>
        </div>

        {/* Right column — order summary */}
        <div className="lg:col-span-5">
          <div className="border border-white/10 p-8 flex flex-col gap-6">
            <h2 className="font-serif text-2xl text-brand">Order Summary</h2>

            <div className="flex flex-col gap-4">
              {items.length === 0 ? (
                <p className="text-sm text-white/50">Your shopping bag is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-none overflow-hidden bg-white/5">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <h3 className="text-sm text-brand">{item.title}</h3>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-white/60">₹{item.price}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 text-sm text-white/60 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-brand pt-2 border-t border-white/10">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {submitError && (
              <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{submitError}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Processing...' : 'Place Order & Pay via Razorpay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
