import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/ordersSlice.js';
import { logoutUser, updateProfile } from '../../store/slices/authSlice.js';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../utils/api.js';

const stepOrder = ['processing', 'shipped', 'delivered'];

const paymentStatusLabel = {
  paid: 'Paid',
  pending: 'Payment Pending',
  failed: 'Payment Failed',
};

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const { user, isProfileUpdating, profileError } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    zip: user?.shippingAddress?.zip || '',
  });
  const [justSaved, setJustSaved] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setJustSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(
      updateProfile({
        name: formData.name,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
      })
    );
    setJustSaved(true);
  };

  return (
    <div className="border border-white/10 p-8 flex flex-col gap-6 max-w-xl">
      <h2 className="font-serif text-2xl text-brand">Profile</h2>

      {user && !user.emailVerified && (
        <div className="border border-amber-500/40 bg-amber-950/40 text-amber-300 text-sm px-4 py-4 flex flex-col gap-3">
          <span>Your email isn't verified yet. You'll need to verify it before placing an order.</span>
          {resendMessage && <span className="text-xs">{resendMessage}</span>}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending}
            className="self-start border border-amber-500/60 text-amber-300 px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:bg-amber-950/60 disabled:opacity-60"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {profileError && (
        <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{profileError}</div>
      )}
      {justSaved && !profileError && (
        <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4">
          Profile updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-white/40">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isProfileUpdating}
            className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-white/40">Street Address</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={isProfileUpdating}
            className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={isProfileUpdating}
              className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isProfileUpdating}
              className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-white/40">ZIP Code</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            disabled={isProfileUpdating}
            className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isProfileUpdating}
          className="mt-2 w-full bg-brand-strong text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {isProfileUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const WishlistPanel = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (isLoading) {
    return <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading wishlist...</p>;
  }

  if (error) {
    return <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="border border-white/10 p-12 flex flex-col items-center gap-4 text-center">
        <p className="text-sm uppercase tracking-widest text-white/40">Your wishlist is empty</p>
        <Link
          to="/catalog"
          className="btn-glow text-white px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105"
        >
          Browse the Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {items.map((product) => {
        const imageUrl = product.images?.[0]?.urls?.[0];
        return (
          <div key={product._id} className="flex flex-col gap-4">
            <Link to={`/product/${product._id}`} className="tilt-card relative aspect-[4/5] overflow-hidden bg-white/5 block">
              {imageUrl && <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />}
            </Link>
            <div className="flex flex-col gap-2">
              <Link to={`/product/${product._id}`} className="font-serif text-lg text-brand hover:underline">
                {product.title}
              </Link>
              <p className="text-sm text-white/60">₹{product.salePrice ?? product.basePrice}</p>
              <button
                type="button"
                onClick={() => dispatch(removeFromWishlist(product._id))}
                className="self-start text-xs uppercase tracking-widest text-white/30 transition-colors duration-300 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrdersPanel = () => {
  const { myOrders, isMyOrdersLoading, myOrdersError } = useSelector((state) => state.orders);

  return (
    <div className="flex flex-col gap-8">
      {isMyOrdersLoading && (
        <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading your orders...</p>
      )}

      {myOrdersError && (
        <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{myOrdersError}</div>
      )}

      {!isMyOrdersLoading && !myOrdersError && myOrders.length === 0 && (
        <div className="border border-white/10 p-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm uppercase tracking-widest text-white/40">You haven't placed any orders yet</p>
          <Link
            to="/catalog"
            className="btn-glow text-white px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105"
          >
            Browse the Catalog
          </Link>
        </div>
      )}

      {!isMyOrdersLoading &&
        !myOrdersError &&
        myOrders.map((order) => {
          const currentStepIndex = stepOrder.indexOf(order.fulfillmentStatus);
          const isCancelled = order.fulfillmentStatus === 'cancelled';

          return (
            <div key={order._id} className="border border-white/10 p-6 flex flex-col gap-8">
              {/* Order card header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Order ID</span>
                    <span className="text-sm text-brand font-semibold">{order.razorpayOrderId}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Date</span>
                    <span className="text-sm text-white/70">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Total Amount</span>
                    <span className="text-sm text-white/70">₹{order.financialSummary.totalAmount}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Payment</span>
                    <span className="text-sm text-white/70">
                      {paymentStatusLabel[order.paymentStatus] || formatStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fulfillment stepper */}
              {isCancelled ? (
                <div className="border border-white/15 bg-white/5 text-white/40 text-xs uppercase tracking-widest px-4 py-4 text-center">
                  Order Cancelled
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center">
                    {stepOrder.map((step, index) => (
                      <Fragment key={step}>
                        <div
                          className={`h-12 w-12 flex-none rounded-full flex items-center justify-center text-xs font-medium transition-shadow duration-300 ${
                            index <= currentStepIndex
                              ? 'btn-glow text-white shadow-[0_0_16px_-2px_rgba(168,85,247,0.6)]'
                              : 'border border-white/15 text-white/30'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < stepOrder.length - 1 && (
                          <div
                            className={`flex-1 h-[2px] ${index < currentStepIndex ? 'bg-brand-strong' : 'bg-white/10'}`}
                          />
                        )}
                      </Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {stepOrder.map((step, index) => (
                      <span
                        key={step}
                        className={`w-12 text-center text-xs uppercase tracking-widest ${
                          index <= currentStepIndex ? 'text-brand font-semibold' : 'text-white/30'
                        }`}
                      >
                        {formatStatusLabel(step)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Item preview strip */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                {order.items.map((item, index) => {
                  const imageUrl = item.product?.images?.[0]?.urls?.[0];
                  return (
                    <div key={`${order._id}-${index}`} className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-none overflow-hidden bg-white/5">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={item.product?.title || 'Product'}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white/60">{item.product?.title || 'Product unavailable'}</span>
                        <span className="text-xs text-white/30">
                          {item.variant.size} / {item.variant.color} × {item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleSignOut = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const accountTabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Order History' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'signout', label: 'Sign Out' },
  ];

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        {/* Left account sidebar */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-col">
            {accountTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => (tab.id === 'signout' ? handleSignOut() : setActiveTab(tab.id))}
                  className={`text-left px-6 py-4 text-sm transition-colors duration-300 ${
                    isActive
                      ? 'border-l-4 border-brand font-semibold text-brand bg-white/5'
                      : 'border-l-4 border-transparent text-white/60 hover:text-brand'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right panel */}
        <section className="lg:col-span-9">
          {activeTab === 'profile' && <ProfilePanel />}
          {activeTab === 'orders' && <OrdersPanel />}
          {activeTab === 'wishlist' && <WishlistPanel />}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
