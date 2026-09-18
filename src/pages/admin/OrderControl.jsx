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
  paid: 'bg-[#2F5DA8]/10 text-[#2F5DA8]',
  pending: 'bg-amber-500/10 text-amber-600',
  failed: 'bg-red-500/10 text-red-600',
};

const fulfillmentStatusStyles = {
  processing: 'border-amber-500 text-amber-600',
  shipped: 'border-[#2F5DA8] text-[#2F5DA8]',
  delivered: 'border-emerald-600 text-emerald-700',
  cancelled: 'border-stone-400 text-stone-500',
};

const formatLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const OrderDetails = ({ order }) => {
  const addr = order.shippingAddress || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 border-t border-stone-200 px-6 py-6 text-sm">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-2">Items</h3>
        <ul className="flex flex-col gap-1 text-stone-700">
          {order.items.map((item, index) => (
            <li key={index}>
              {item.quantity} × {item.product?.title || 'Unknown product'}{' '}
              <span className="text-stone-500">
                ({item.variant.size} / {item.variant.color})
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-2">Deliver To</h3>
        <p className="text-stone-700">
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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        <AdminSidebar />

        {/* Right fulfillment workspace */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-[#2F5DA8]">Order Fulfillment Control Center</h1>

          {error && (
            <div className="border border-red-400 bg-red-50 text-red-700 text-sm px-4 py-4">{error}</div>
          )}

          <div className="border border-stone-200 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-[#2F5DA8]">Fulfillment Stream Registry</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('active')}
                  className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-300 ${
                    view === 'active'
                      ? 'border-[#2F5DA8] text-[#2F5DA8] bg-[#2F5DA8]/10'
                      : 'border-stone-300 text-stone-500 hover:border-stone-400'
                  }`}
                >
                  Active ({activeOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setView('resolved')}
                  className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-300 ${
                    view === 'resolved'
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-600/10'
                      : 'border-stone-300 text-stone-500 hover:border-stone-400'
                  }`}
                >
                  Resolved ({resolvedOrders.length})
                </button>
              </div>
            </div>

            {isLoading && (
              <p className="text-sm uppercase tracking-widest text-stone-500 animate-pulse">Loading orders...</p>
            )}

            {!isLoading && visibleOrders.length === 0 && (
              <p className="text-sm text-stone-500">
                {view === 'active' ? 'No orders awaiting fulfillment.' : 'No resolved orders yet.'}
              </p>
            )}

            {!isLoading && visibleOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-widest text-stone-500">
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
                            className="border-b border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors duration-150"
                          >
                            <td className="py-4 pr-6 font-mono text-right text-stone-700">
                              {order.cashfreeOrderId}
                            </td>
                            <td className="py-4 pr-6 text-stone-700">{order.user?.name || 'Unknown'}</td>
                            <td className="py-4 pr-6 text-stone-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 pr-6 font-mono text-right text-stone-700">
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
                                className={`border px-4 py-2 text-xs uppercase tracking-widest bg-white focus:outline-none focus:border-[#2F5DA8] transition-colors duration-300 ${
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
                                  className="w-8 h-8 inline-flex items-center justify-center border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
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
