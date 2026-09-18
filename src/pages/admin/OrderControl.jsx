import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/ordersSlice.js';
import AdminSidebar from '../../components/AdminSidebar.jsx';

const fulfillmentOptions = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Keyed on the real Order schema enums (paymentStatus / fulfillmentStatus).
const paymentStatusStyles = {
  paid: 'bg-brand/10 text-brand',
  pending: 'bg-amber-500/10 text-amber-400',
  failed: 'bg-red-500/10 text-red-400',
};

const fulfillmentStatusStyles = {
  processing: 'border-amber-500/50 text-amber-400',
  shipped: 'border-brand/50 text-brand',
  delivered: 'border-emerald-500/50 text-emerald-400',
  cancelled: 'border-white/20 text-white/40',
};

const formatLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const OrderDetails = ({ order }) => {
  const addr = order.shippingAddress || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.03] border-t border-white/10 px-6 py-6 text-sm">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Items</h3>
        <ul className="flex flex-col gap-1 text-white/80">
          {order.items.map((item, index) => (
            <li key={index}>
              {item.quantity} × {item.product?.title || 'Unknown product'}{' '}
              <span className="text-white/40">
                ({item.variant.size} / {item.variant.color})
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Deliver To</h3>
        <p className="text-white/80">
          {addr.fullName}
          <br />
          {addr.phone}
          <br />
          {addr.street}
          <br />
          {addr.city}, {addr.state} {addr.zip}
          <br />
          {addr.country}
        </p>
      </div>
    </div>
  );
};

const OrderControl = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.orders);
  const [view, setView] = useState('active');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
  };

  const activeOrders = orders.filter((order) => order.fulfillmentStatus !== 'delivered');
  const resolvedOrders = orders.filter((order) => order.fulfillmentStatus === 'delivered');
  const visibleOrders = view === 'active' ? activeOrders : resolvedOrders;

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        <AdminSidebar />

        {/* Right fulfillment workspace */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-brand">Order Fulfillment Control Center</h1>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-serif text-lg text-brand">Fulfillment Stream Registry</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('active')}
                  className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-300 ${
                    view === 'active'
                      ? 'border-brand text-brand bg-brand/10'
                      : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  Active ({activeOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setView('resolved')}
                  className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-300 ${
                    view === 'resolved'
                      ? 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10'
                      : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  Resolved ({resolvedOrders.length})
                </button>
              </div>
            </div>

            {isLoading && (
              <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading orders...</p>
            )}

            {!isLoading && visibleOrders.length === 0 && (
              <p className="text-sm text-white/50">
                {view === 'active' ? 'No orders awaiting fulfillment.' : 'No resolved orders yet.'}
              </p>
            )}

            {!isLoading && visibleOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                      <th className="py-4 pr-6 font-medium text-right">Order ID</th>
                      <th className="py-4 pr-6 font-medium">Customer</th>
                      <th className="py-4 pr-6 font-medium">Date</th>
                      <th className="py-4 pr-6 font-medium text-right">Total Amount</th>
                      <th className="py-4 pr-6 font-medium">Payment Status</th>
                      <th className="py-4 pr-6 font-medium">Fulfillment Status Action</th>
                      {view === 'active' && <th className="py-4 font-medium text-center">Resolve</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;
                      return (
                        <Fragment key={order._id}>
                          <tr
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className="border-b border-white/10 cursor-pointer hover:bg-white/[0.03] transition-colors duration-150"
                          >
                            <td className="py-4 pr-6 font-mono text-right text-white/80">
                              {order.cashfreeOrderId}
                            </td>
                            <td className="py-4 pr-6 text-white/80">{order.user?.name || 'Unknown'}</td>
                            <td className="py-4 pr-6 text-white/50">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 pr-6 font-mono text-right text-white/80">
                              ₹{order.financialSummary.totalAmount}
                            </td>
                            <td className="py-4 pr-6">
                              <span
                                className={`inline-block text-xs uppercase tracking-widest px-4 py-2 ${
                                  paymentStatusStyles[order.paymentStatus]
                                }`}
                              >
                                {formatLabel(order.paymentStatus)}
                              </span>
                            </td>
                            <td className="py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={order.fulfillmentStatus}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className={`bg-ink border px-4 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-brand transition-colors duration-300 ${
                                  fulfillmentStatusStyles[order.fulfillmentStatus]
                                }`}
                              >
                                {fulfillmentOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {view === 'active' && (
                              <td className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  title="Mark delivered and move out of the active queue"
                                  onClick={() => handleStatusChange(order._id, 'delivered')}
                                  className="w-8 h-8 inline-flex items-center justify-center border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors duration-200"
                                >
                                  ✓
                                </button>
                              </td>
                            )}
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={view === 'active' ? 7 : 6} className="p-0">
                                <OrderDetails order={order} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderControl;
