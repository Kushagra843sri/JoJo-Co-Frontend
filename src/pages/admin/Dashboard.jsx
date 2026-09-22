import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../store/slices/ordersSlice.js';
import { fetchCatalogProducts } from '../../store/slices/productSlice.js';
import AdminSidebar from '../../components/AdminSidebar.jsx';

// Keyed on the real Order schema's fulfillmentStatus enum values.
const statusStyles = {
  processing: 'bg-amber-500/10 text-amber-400',
  shipped: 'bg-brand/10 text-brand',
  delivered: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-white/10 text-white/40',
};

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const LOW_STOCK_THRESHOLD = 5;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.orders);
  // Capped at the API's max page size (50) — fine for a boutique-sized catalog;
  // revisit with a dedicated aggregation endpoint if the catalog grows past that.
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchCatalogProducts({ limit: 50 }));
  }, [dispatch]);

  const totalRevenue = orders
    .filter((order) => order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.financialSummary.totalAmount, 0);

  const orderVolume = orders.length;
  const recentActivity = orders.slice(0, 5);
  const lowStockCount = products.filter((product) =>
    product.variants?.some((v) => v.stock <= LOW_STOCK_THRESHOLD)
  ).length;

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        <AdminSidebar />

        {/* Right operational workspace */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-brand mb-8">Operations Control Hub</h1>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          {/* Analytics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-white/40">Total Revenue</span>
              <span className="font-mono text-3xl text-right text-brand">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-white/40">Order Volume</span>
              <span className="font-mono text-3xl text-right text-brand">{orderVolume}</span>
            </div>
            <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-white/40">Low Stock Alerts</span>
              <span className="font-mono text-3xl text-right text-brand">{lowStockCount} Items</span>
            </div>
          </div>

          {/* Recent activity data table */}
          <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
            <h2 className="font-serif text-lg text-brand">Recent Activity</h2>

            {isLoading && (
              <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading orders...</p>
            )}

            {!isLoading && recentActivity.length === 0 && (
              <p className="text-sm text-white/50">No orders yet.</p>
            )}

            {!isLoading && recentActivity.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                      <th className="py-4 pr-6 font-medium">Order ID</th>
                      <th className="py-4 pr-6 font-medium">Customer</th>
                      <th className="py-4 pr-6 font-medium">Date</th>
                      <th className="py-4 pr-6 font-medium">Status</th>
                      <th className="py-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((order) => (
                      <tr key={order._id} className="border-b border-white/10">
                        <td className="py-4 pr-6 font-mono text-white/80">{order.razorpayOrderId}</td>
                        <td className="py-4 pr-6 text-white/80">{order.user?.name || 'Unknown'}</td>
                        <td className="py-4 pr-6 text-white/50">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={`inline-block text-xs uppercase tracking-widest px-4 py-2 ${
                              statusStyles[order.fulfillmentStatus]
                            }`}
                          >
                            {formatStatusLabel(order.fulfillmentStatus)}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-right text-white/80">
                          ₹{order.financialSummary.totalAmount}
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

export default Dashboard;
