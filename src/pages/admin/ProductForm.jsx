import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { fetchCatalogProducts, deleteProduct } from '../../store/slices/productSlice.js';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import Select, { SelectOption } from '../../components/Select.jsx';
import { categories as categoryOptions, subcategoriesByCategory } from '../../constants/taxonomy.js';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];

const labelClasses = 'text-xs uppercase tracking-widest text-white/40';
const inputClasses =
  'w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60';
const textareaClasses = inputClasses;

// Lazily injects Cloudinary's real upload widget script, caching window.cloudinary
// so repeated calls (mount preload + the button click) never re-inject it.
const loadCloudinaryWidget = () => {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) {
      resolve(window.cloudinary);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = () => resolve(window.cloudinary);
    script.onerror = () => reject(new Error('Failed to load Cloudinary upload widget'));
    document.body.appendChild(script);
  });
};

const ProductForm = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    salePrice: '',
    category: '',
    subcategory: '',
    tags: '',
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  // Shades share the same uploaded photo(s) above — the product page tints that
  // shared photo live with each shade's hex instead of requiring a distinct
  // photo per color. Naming an uploaded image group after a shade name later
  // (a separate feature, not in this form) lets a specific shade "graduate" to
  // a real photo — see the ProductDetail.jsx comment next to shouldTintPreview.
  const [shades, setShades] = useState(() => [{ id: 'shade-1', name: '', hex: '#1a1a1a' }]);
  const [variants, setVariants] = useState(() => [{ id: 'variant-1', size: 'M', shadeId: 'shade-1', sku: '', stock: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Preload the widget script in the background as soon as this screen mounts,
  // so the first click on "Upload Lookbook Image" isn't the moment it starts loading.
  useEffect(() => {
    loadCloudinaryWidget().catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(fetchCatalogProducts({ limit: 50 }));
  }, [dispatch]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    await dispatch(deleteProduct(product._id));
    setDeletingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // A subcategory from the old category almost never belongs to the
      // newly-picked one's list (see subcategoriesByCategory), so carrying
      // it forward would silently save a mismatched category/subcategory pair.
      if (name === 'category') {
        return { ...prev, category: value, subcategory: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleOpenUploadWidget = async () => {
    const cloudinary = await loadCloudinaryWidget();
    cloudinary
      .createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        },
        (uploadError, result) => {
          // The widget sets overflow:hidden on <body> while it's open and is
          // supposed to clear it on close — but a hard failure (e.g. a
          // missing/misconfigured upload preset) can leave that lock in place
          // even after the widget itself is dismissed, since <body> persists
          // across route changes in this single-page app.
          if (uploadError || result?.event === 'close') {
            document.body.style.overflow = '';
          }
          if (uploadError) {
            setError(uploadError.statusText || uploadError.message || 'Image upload failed');
            return;
          }
          if (result?.event === 'success') {
            setUploadedImages((prev) => [...prev, result.info.secure_url]);
          }
        }
      )
      .open();
  };

  const handleShadeChange = (id, field, value) => {
    setShades((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addShadeRow = () => {
    const id = `shade-${Date.now()}`;
    setShades((prev) => [...prev, { id, name: '', hex: '#1a1a1a' }]);
  };

  const removeShadeRow = (id) => {
    setShades((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
    // Any variant row pointing at the removed shade falls back to whatever
    // shade ends up first, rather than silently keeping a dangling reference.
    setVariants((prev) => prev.map((v) => (v.shadeId === id ? { ...v, shadeId: null } : v)));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const addVariantRow = () => {
    setVariants((prev) => [...prev, { id: `variant-${Date.now()}`, size: 'M', shadeId: shades[0]?.id || null, sku: '', stock: 0 }]);
  };

  const removeVariantRow = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim() || !formData.basePrice || !formData.category) {
      setError('Title, Base Price, and Category are required.');
      return;
    }
    if (shades.some((s) => !s.name.trim())) {
      setError('Every shade needs a name.');
      return;
    }
    if (variants.some((v) => !v.sku.trim())) {
      setError('Every variant row needs a SKU.');
      return;
    }
    if (variants.some((v) => !v.shadeId || !shades.some((s) => s.id === v.shadeId))) {
      setError('Every variant row needs a shade selected.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shadeById = new Map(shades.map((s) => [s.id, s]));

      const payload = {
        title: formData.title,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: uploadedImages.length > 0 ? [{ color: 'Base', urls: uploadedImages }] : [],
        variants: variants.map((v) => {
          const shade = shadeById.get(v.shadeId);
          return {
            size: v.size,
            color: shade.name,
            colorHex: shade.hex,
            sku: v.sku,
            stock: Number(v.stock),
          };
        }),
      };

      await api.post('/products', payload);
      setSuccess(true);
      dispatch(fetchCatalogProducts({ limit: 50 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
        <AdminSidebar />

        {/* Right workspace form panel */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          <h1 className="font-serif text-3xl text-brand">Publishing Terminal</h1>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}
          {success && (
            <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4">
              Product published to the live catalog.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contents">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left form column — core attributes */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Merino Crew Sweater"
                    className={inputClasses}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    placeholder="Full-grain merino crewneck, garment-dyed."
                    className={textareaClasses}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Base Price</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min="0"
                    placeholder="3100"
                    className={inputClasses}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Sale Price</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min="0"
                    placeholder="2480"
                    className={inputClasses}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Category</label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${inputClasses} bg-ink`}
                  >
                    <SelectOption value="" disabled>
                      Select a category
                    </SelectOption>
                    {categoryOptions.map((category) => (
                      <SelectOption key={category} value={category}>
                        {category}
                      </SelectOption>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Subcategory</label>
                  <Select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    disabled={isSubmitting || !formData.category}
                    className={`${inputClasses} bg-ink`}
                  >
                    <SelectOption value="" disabled>
                      {formData.category ? 'Select a subcategory' : 'Select a category first'}
                    </SelectOption>
                    {(subcategoriesByCategory[formData.category] || []).map((subcategory) => (
                      <SelectOption key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectOption>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClasses}>Product Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="new-arrival, winter, limited-edition"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Right form column — apparel data matrices */}
              <div className="lg:col-span-6 flex flex-col gap-8">
                {/* Section A — shared lookbook photo(s) */}
                <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
                  <h2 className="font-serif text-lg text-brand">Lookbook Photo</h2>
                  <p className="text-xs text-white/40 -mt-2">
                    Shared across every shade below — the product page tints this same photo live per shade rather
                    than needing a reshoot per color.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={handleOpenUploadWidget}
                      disabled={isSubmitting}
                      className="border border-brand text-brand px-4 py-4 text-xs uppercase tracking-widest transition-colors duration-300 hover:bg-brand hover:text-white disabled:opacity-60"
                    >
                      Upload Lookbook Image
                    </button>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((url) => (
                          <div key={url} className="relative aspect-square overflow-hidden bg-white/5">
                            <img src={url} alt="Uploaded lookbook asset" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setUploadedImages((prev) => prev.filter((u) => u !== url))}
                              disabled={isSubmitting}
                              aria-label="Remove image"
                              className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center bg-ink/80 border border-white/20 text-white/70 transition-colors duration-200 hover:border-red-400 hover:text-red-400 disabled:opacity-40"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B — shade card definitions */}
                <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
                  <h2 className="font-serif text-lg text-brand">Shade Card</h2>
                  <p className="text-xs text-white/40 -mt-2">
                    Each shade needs an exact color so its swatch and live preview tint match. Reference it from a
                    variant row below.
                  </p>
                  <div className="flex flex-col gap-4">
                    {shades.map((shade) => (
                      <div key={shade.id} className="flex items-center gap-4">
                        <input
                          type="color"
                          value={shade.hex}
                          onChange={(e) => handleShadeChange(shade.id, 'hex', e.target.value)}
                          disabled={isSubmitting}
                          className="h-10 w-10 flex-none border border-white/15 bg-transparent disabled:opacity-60"
                          aria-label={`${shade.name || 'Shade'} color`}
                        />
                        <input
                          type="text"
                          value={shade.name}
                          onChange={(e) => handleShadeChange(shade.id, 'name', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Jet Black"
                          className="flex-1 bg-transparent border border-white/15 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
                        />
                        <span className="w-20 flex-none font-mono text-xs uppercase text-white/40">{shade.hex}</span>
                        <button
                          type="button"
                          onClick={() => removeShadeRow(shade.id)}
                          disabled={isSubmitting || shades.length <= 1}
                          aria-label="Remove shade"
                          className="h-8 w-8 flex-none flex items-center justify-center border border-white/15 text-white/40 transition-colors duration-300 hover:border-red-400 hover:text-red-400 disabled:opacity-40"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addShadeRow}
                    disabled={isSubmitting}
                    className="border border-white/15 text-white/60 px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-brand hover:text-brand disabled:opacity-60 self-start"
                  >
                    + Add Shade
                  </button>
                </div>

                {/* Section B — inventory variant matrix */}
                <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
                  <h2 className="font-serif text-lg text-brand">Inventory Variant Matrix</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/40">
                          <th className="py-4 pr-6 font-medium">Shade</th>
                          <th className="py-4 pr-6 font-medium">Size</th>
                          <th className="py-4 pr-6 font-medium">SKU</th>
                          <th className="py-4 pr-6 font-medium">Stock</th>
                          <th className="py-4 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((row) => (
                          <tr key={row.id} className="border-b border-white/10">
                            <td className="py-4 pr-6">
                              <Select
                                value={row.shadeId || ''}
                                onChange={(e) => handleVariantChange(row.id, 'shadeId', e.target.value)}
                                disabled={isSubmitting}
                                className="bg-ink border border-white/15 px-4 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
                              >
                                <SelectOption value="" disabled>
                                  Select a shade
                                </SelectOption>
                                {shades.map((shade) => (
                                  <SelectOption key={shade.id} value={shade.id}>
                                    {shade.name || 'Untitled shade'}
                                  </SelectOption>
                                ))}
                              </Select>
                            </td>
                            <td className="py-4 pr-6">
                              <Select
                                value={row.size}
                                onChange={(e) => handleVariantChange(row.id, 'size', e.target.value)}
                                disabled={isSubmitting}
                                className="bg-ink border border-white/15 px-4 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
                              >
                                {sizeOptions.map((size) => (
                                  <SelectOption key={size} value={size}>
                                    {size}
                                  </SelectOption>
                                ))}
                              </Select>
                            </td>
                            <td className="py-4 pr-6">
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) => handleVariantChange(row.id, 'sku', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-transparent border border-white/15 px-4 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
                              />
                            </td>
                            <td className="py-4 pr-6">
                              <input
                                type="number"
                                min="0"
                                value={row.stock}
                                onChange={(e) => handleVariantChange(row.id, 'stock', e.target.value)}
                                disabled={isSubmitting}
                                className="w-24 bg-transparent border border-white/15 px-4 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60"
                              />
                              {Number(row.stock) === 0 && (
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-amber-400">
                                  0 stock shows as "Out of Stock"
                                </p>
                              )}
                            </td>
                            <td className="py-4">
                              <button
                                type="button"
                                onClick={() => removeVariantRow(row.id)}
                                disabled={isSubmitting}
                                aria-label="Remove variant row"
                                className="h-8 w-8 flex items-center justify-center border border-white/15 text-white/40 transition-colors duration-300 hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    disabled={isSubmitting}
                    className="border border-white/15 text-white/60 px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-brand hover:text-brand disabled:opacity-60 self-start"
                  >
                    + Add Variant Row
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? 'Publishing to Live Catalog...' : 'Publish Clothing Article to Live Catalog'}
            </button>
          </form>

          {/* Published products — inventory management */}
          <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-6">
            <h2 className="font-serif text-lg text-brand">Published Products</h2>

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
                            ₹{product.salePrice ?? product.basePrice}
                          </td>
                          <td className="py-4 pr-6">
                            <span className={totalStock === 0 ? 'text-red-400' : 'text-white/80'}>
                              {totalStock}
                            </span>
                          </td>
                          <td className="py-4">
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product._id}
                              className="border border-white/15 text-white/50 px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                            >
                              {deletingId === product._id ? 'Deleting...' : 'Delete'}
                            </button>
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

export default ProductForm;
