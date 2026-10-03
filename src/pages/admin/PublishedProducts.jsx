import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCatalogProducts, deleteProduct } from '../../store/slices/productSlice.js';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { getUnitPrice } from '../../utils/productImages.js';

const PublishedProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.products);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCatalogProducts({ limit: 50 }));
  }, [dispatch]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    await dispatch(deleteProduct(product._id));
    setDeletingId(null);
  };

  // Editing happens in the Inventory Manager form — hand it the product id.
  const handleStartEdit = (product) => navigate('/admin/products', { state: { editProductId: product._id } });

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        <AdminSidebar />

        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-brand">Published Products</h1>

          <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">

            {products.length === 0 ? (
              <p className="text-sm text-white/50">No products published yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                      <th className="py-4 pr-6 font-medium">Title</th>
                      <th className="py-4 pr-6 font-medium">Category</th>
                      <th className="py-4 pr-6 font-medium">Price</th>
                      <th className="py-4 pr-6 font-medium">Total Stock</th>
                      <th className="py-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                      return (
                        <tr key={product._id} className="border-b border-white/10">
                          <td className="py-4 pr-6 text-white/80">{product.title}</td>
                          <td className="py-4 pr-6 text-white/50">{product.category}</td>
                          <td className="py-4 pr-6 font-mono text-white/80">
                            ₹{getUnitPrice(product)}
                          </td>
                          <td className="py-4 pr-6">
                            <span className={totalStock === 0 ? 'text-red-400' : 'text-white/80'}>
                              {totalStock}
                            </span>
                          </td>
                          <td className="py-4"><div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(product)}
                              className={`border px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-brand hover:text-brand disabled:opacity-60 ${
                                'border-white/15 text-white/50'
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product._id}
                              className="border border-white/15 text-white/50 px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                            >
                              {deletingId === product._id ? 'Deleting...' : 'Delete'}
                            </button>
                            </div>
                          </td>
                        </tr>
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

export default PublishedProducts;
