import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/ordersSlice.js';
import Navbar from '../../components/Navbar.jsx';

const statusCopy = {
  paid: {
    heading: 'Payment Confirmed',
    message: 'Your order has been placed successfully. A confirmation has been recorded against your account.',
  },
  pending: {
    heading: 'Confirming Your Payment',
    message: "We're still confirming your payment with the gateway. This usually settles within a minute — refresh to check again.",
  },
  failed: {
    heading: 'Payment Failed',
    message: 'The payment for this order did not go through. No amount has been captured. Please try checking out again.',
  },
};

const OrderResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const dispatch = useDispatch();
  const { myOrders, isMyOrdersLoading, myOrdersError } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const matchedOrder = useMemo(
    () => myOrders.find((order) => order.cashfreeOrderId === orderId),
    [myOrders, orderId]
  );

  const copy = statusCopy[matchedOrder?.paymentStatus] || statusCopy.pending;

  return (
    <div className="w-full min-h-screen flex flex-col bg-ink">
      <div className="grain-overlay" />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 pt-32">
        <div className="w-full max-w-md border border-white/10 p-8 flex flex-col items-center gap-6 text-center">
          {isMyOrdersLoading && (
            <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">
              Checking payment status...
            </p>
          )}

          {myOrdersError && (
            <div className="w-full border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">
              {myOrdersError}
            </div>
          )}

          {!isMyOrdersLoading && !myOrdersError && (
            <>
              <h1 className="font-serif text-2xl text-brand">{copy.heading}</h1>
              <p className="text-sm text-white/60">{copy.message}</p>

              {orderId && <p className="text-xs uppercase tracking-widest text-white/30">Order ID: {orderId}</p>}

              {matchedOrder && (
                <p className="text-sm text-white/70">
                  Total charged: <span className="font-semibold text-white">₹{matchedOrder.financialSummary.totalAmount}</span>
                </p>
              )}

              <div className="flex gap-4 mt-2">
                {matchedOrder?.paymentStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => dispatch(fetchMyOrders())}
                    className="border border-white/15 text-white/60 px-6 py-3 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-brand hover:text-brand"
                  >
                    Refresh Status
                  </button>
                )}
                <Link
                  to="/orders"
                  className="btn-glow text-white px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-[0.98]"
                >
                  View Order History
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderResult;
