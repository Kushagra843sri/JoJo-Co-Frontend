import { useEffect } from 'react';
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

const OrderControl = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 py-8">
        <AdminSidebar />

        {/* Right fulfillment workspace */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-[#2F5DA8]">Order Fulfillment Control Center</h1>

          {error && (
            <div className="border border-red-400 bg-red-50 text-red-700 text-sm px-4 py-4">{error}</div>
          )}

          <div className="border border-stone-200 p-6 flex flex-col gap-6">
            <h2 className="font-serif text-lg text-[#2F5DA8]">Fulfillment Stream Registry</h2>

            {isLoading && (
              <p className="text-sm uppercase tracking-widest text-stone-500 animate-pulse">Loading orders...</p>
            )}

            {!isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-widest text-stone-500">
                      <th className="py-4 pr-6 font-medium text-right">Order ID</th>
                      <th className="py-4 pr-6 font-medium">Customer</th>
                      <th className="py-4 pr-6 font-medium">Date</th>
                      <th className="py-4 pr-6 font-medium text-right">Total Amount</th>
                      <th className="py-4 pr-6 font-medium">Payment Status</th>
                      <th className="py-4 font-medium">Fulfillment Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-stone-200">
                        <td className="py-4 pr-6 font-mono text-right text-stone-700">{order.cashfreeOrderId}</td>
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
                        <td className="py-4">
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
                      </tr>
                    ))}
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
