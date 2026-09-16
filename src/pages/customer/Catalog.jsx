import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCatalogProducts } from '../../store/slices/productSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

const categories = ['Outerwear', 'Knitwear', 'Denim', 'Shirting', 'Accessories'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];

const Catalog = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchCatalogProducts({
          category: selectedCategory,
          size: selectedSize,
          search: searchTerm,
          sort: sortOrder,
        })
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [dispatch, selectedCategory, selectedSize, searchTerm, sortOrder]);

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-8 pt-28 pb-8">
        {/* Left filter sidebar */}
        <aside className="md:col-span-3 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-lg text-brand mb-2">Categories</h2>
            <div className="flex flex-col gap-4">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-4 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={selectedCategory === category}
                    onChange={() =>
                      setSelectedCategory((prev) => (prev === category ? '' : category))
                    }
                    className="h-4 w-4 accent-brand"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-lg text-brand mb-2">Available Sizes</h2>
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize((prev) => (prev === size ? '' : size))}
                  className={`h-8 w-8 flex items-center justify-center border text-xs transition-colors duration-300 ${
                    selectedSize === size
                      ? 'border-brand text-brand bg-white/5'
                      : 'border-white/15 text-white/70 hover:border-brand hover:text-brand'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right catalog workspace */}
        <section className="md:col-span-9 flex flex-col gap-8">
          {/* Control strip */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-4 border border-white/10">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the collection"
              className="w-full sm:w-64 px-4 py-2 text-sm bg-transparent text-white border border-white/15 placeholder:text-white/30 focus:outline-none focus:border-brand"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 text-sm bg-ink text-white/70 border border-white/15 focus:outline-none focus:border-brand"
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          {/* Fallback states */}
          {isLoading && <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading catalog...</p>}
          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          {/* Product showcase grid — live data */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const imageUrl = product.images?.[0]?.urls?.[0];
                const onSale = product.salePrice != null;

                return (
                  <Link key={product._id} to={`/product/${product._id}`} className="flex flex-col gap-4">
                    <div className="tilt-card relative aspect-[4/5] overflow-hidden bg-white/5">
                      {imageUrl && (
                        <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
                      )}
                      {onSale && (
                        <span className="absolute top-4 left-4 btn-glow text-white text-xs uppercase tracking-widest px-4 py-2">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-serif text-lg text-brand">{product.title}</h3>
                      <p className="text-sm text-white/60">₹{product.salePrice ?? product.basePrice}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
