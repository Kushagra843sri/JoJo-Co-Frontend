import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addItem } from '../../store/slices/cartSlice.js';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { getVideoDeliveryUrl } from '../../utils/cloudinaryVideo.js';

const dummyReviews = [
  { id: 1, author: 'Ananya R.', rating: 5, text: 'Premium heavy-weight fabric, beautiful drape. 5/5 stars.' },
  { id: 2, author: 'Rohan K.', rating: 4, text: 'True to size and holds shape after washing. 4/5 stars.' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  // Nullable overrides: only set once the shopper actually clicks a swatch/size.
  // The effective selection below falls back to a sane default whenever the
  // override doesn't apply (nothing chosen yet, or the product changed under it) —
  // derived during render instead of synced via effects, so there's no risk of the
  // dependent-effect chain settling a render behind the data it's deriving from.
  const [selectedColorOverride, setSelectedColorOverride] = useState(null);
  const [selectedSizeOverride, setSelectedSizeOverride] = useState(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [addedMessage, setAddedMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // The shades a shopper can actually buy — driven by real variant data, not a
  // hardcoded guess, so a selectable option always maps to a real SKU. Each
  // shade also carries its colorHex (if the admin set one) for the shade-card
  // swatch and the live tint preview below.
  const variants = useMemo(() => currentProduct?.variants || [], [currentProduct]);
  const shades = useMemo(() => {
    const seen = new Map();
    variants.forEach((v) => {
      if (!seen.has(v.color)) {
        seen.set(v.color, { name: v.color, hex: v.colorHex || null });
      }
    });
    return [...seen.values()];
  }, [variants]);
  const colors = useMemo(() => shades.map((shade) => shade.name), [shades]);
  const selectedColor =
    selectedColorOverride && colors.includes(selectedColorOverride) ? selectedColorOverride : colors[0] || null;
  const activeShade = shades.find((shade) => shade.name === selectedColor);

  const sizesForColor = useMemo(
    () => variants.filter((v) => v.color === selectedColor),
    [variants, selectedColor]
  );
  const selectedSize = useMemo(() => {
    if (selectedSizeOverride && sizesForColor.some((v) => v.size === selectedSizeOverride)) {
      return selectedSizeOverride;
    }
    const firstInStock = sizesForColor.find((v) => v.stock > 0) || sizesForColor[0];
    return firstInStock?.size || null;
  }, [selectedSizeOverride, sizesForColor]);

  const activeVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize);

  const imageGroupForColor = currentProduct?.images?.find((group) => group.color === selectedColor);
  const galleryImages = imageGroupForColor?.urls || currentProduct?.images?.[0]?.urls || [];
  // Only tint when there's no dedicated photo for this exact shade — a real
  // uploaded photo always wins over the simulated color, so an admin can
  // upgrade any shade to real photography later just by naming an image
  // group after it (see Product.js / ProductForm.jsx).
  const shouldTintPreview = Boolean(!imageGroupForColor && activeShade?.hex);
  const isWishlisted = wishlistItems.some((product) => product._id === currentProduct?._id);

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(currentProduct._id));
    } else {
      dispatch(addToWishlist(currentProduct._id));
    }
  };

  const handleAddToBag = () => {
    if (!activeVariant || activeVariant.stock < 1) return;

    dispatch(
      addItem({
        productId: currentProduct._id,
        title: currentProduct.title,
        price: currentProduct.salePrice ?? currentProduct.basePrice,
        image: galleryImages[0],
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      })
    );
    setAddedMessage('Added to your bag.');
  };

  const handleBuyNow = () => {
    if (!activeVariant || activeVariant.stock < 1) return;

    dispatch(
      addItem({
        productId: currentProduct._id,
        title: currentProduct.title,
        price: currentProduct.salePrice ?? currentProduct.basePrice,
        image: galleryImages[0],
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      })
    );

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-20">
      {isLoading && (
        <p className="px-4 sm:px-8 py-8 text-sm uppercase tracking-widest text-white/40 animate-pulse">
          Loading product...
        </p>
      )}

      {error && (
        <div className="mx-4 sm:mx-8 my-8 border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
      )}

      {!isLoading && !error && currentProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-8 py-8">
          {/* Left column — image gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="tilt-card relative aspect-[4/5] overflow-hidden bg-white/5">
              {galleryImages[0] && (
                <img
                  src={galleryImages[0]}
                  alt={`${currentProduct.title} — main`}
                  className={`h-full w-full object-cover transition-[filter] duration-500 ${
                    shouldTintPreview ? 'filter grayscale contrast-125 brightness-110' : ''
                  }`}
                />
              )}
              {shouldTintPreview && (
                <div
                  className="absolute inset-0 mix-blend-color transition-colors duration-500"
                  style={{ backgroundColor: activeShade.hex }}
                  aria-hidden="true"
                />
              )}
              {shouldTintPreview && (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                  Shade preview
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.slice(1).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`aspect-square overflow-hidden border ${
                    index === 0 ? 'border-brand' : 'border-white/10'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.title} — view ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            {currentProduct.lookbookVideo?.url && (
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                {/* muted + playsInline are what let iOS Safari autoplay it;
                    preload="metadata" keeps the clip off the critical path. */}
                <video
                  src={getVideoDeliveryUrl(currentProduct.lookbookVideo.url)}
                  poster={currentProduct.lookbookVideo.posterUrl}
                  aria-label={`${currentProduct.title} — lookbook video`}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Right column — product details */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <nav className="text-xs text-white/40">
              Home <span className="mx-2">/</span> {currentProduct.category} <span className="mx-2">/</span>{' '}
              <span className="text-brand">{currentProduct.title}</span>
            </nav>

            <h1 className="font-serif text-3xl text-brand">{currentProduct.title}</h1>

            <p className="text-sm text-white/60 leading-relaxed">{currentProduct.description}</p>

            <div className="flex items-baseline gap-4">
              {currentProduct.salePrice != null ? (
                <>
                  <span className="text-white/30 line-through text-lg">₹{currentProduct.basePrice}</span>
                  <span className="text-brand-strong font-semibold text-xl">₹{currentProduct.salePrice}</span>
                </>
              ) : (
                <span className="text-brand font-semibold text-xl">₹{currentProduct.basePrice}</span>
              )}
            </div>

            {shades.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/40">Shade Card</span>
                  <span className="text-xs text-white/50">{activeShade?.name}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {shades.map((shade) => {
                    const isActive = shade.name === selectedColor;
                    return (
                      <button
                        key={shade.name}
                        type="button"
                        title={shade.name}
                        aria-label={`Preview in ${shade.name}`}
                        onClick={() => {
                          setSelectedColorOverride(shade.name);
                          setAddedMessage(null);
                        }}
                        className={`relative h-12 w-12 flex-none rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? 'border-brand scale-110 shadow-[0_0_20px_-2px_rgba(168,85,247,0.65)]'
                            : 'border-white/15 hover:border-brand/60 hover:scale-105'
                        }`}
                        style={{ backgroundColor: shade.hex || '#3f3f46' }}
                      >
                        {isActive && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-white/30">Pick a shade — the preview updates instantly.</span>
              </div>
            )}

            {sizesForColor.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-xs uppercase tracking-widest text-white/40">Size</span>
                <div className="flex flex-wrap gap-4">
                  {sizesForColor.map((variant) => {
                    const outOfStock = variant.stock < 1;
                    return (
                      <button
                        key={variant.size}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          setSelectedSizeOverride(variant.size);
                          setAddedMessage(null);
                        }}
                        title={outOfStock ? 'Out of stock' : undefined}
                        className={`h-12 w-12 flex items-center justify-center border text-sm transition-colors duration-300 ${
                          outOfStock
                            ? 'border-white/10 text-white/20 line-through cursor-not-allowed'
                            : variant.size === selectedSize
                              ? 'border-brand text-brand'
                              : 'border-white/15 text-white/60 hover:border-brand hover:text-brand'
                        }`}
                      >
                        {variant.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {addedMessage && (
                <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4">
                  {addedMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={!activeVariant || activeVariant.stock < 1}
                  className="w-full border border-brand text-brand py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:bg-brand hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeVariant ? (activeVariant.stock < 1 ? 'Out of Stock' : 'Add to Bag') : 'Select a Size'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!activeVariant || activeVariant.stock < 1}
                  className="w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {activeVariant ? (activeVariant.stock < 1 ? 'Out of Stock' : 'Buy Now') : 'Select a Size'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`w-full border py-4 text-sm uppercase tracking-widest transition-colors duration-300 ${
                  isWishlisted
                    ? 'border-brand text-brand bg-white/5'
                    : 'border-white/15 text-white/60 hover:border-brand hover:text-brand'
                }`}
              >
                {isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
              <span className="text-xs uppercase tracking-widest text-white/40">Fulfillment &amp; Trust</span>
              <p className="text-sm text-white/60">
                Accepted Payment Methods: UPI, Cash on Delivery (COD), Credit/Debit Cards
              </p>
            </div>

            <div className="border border-white/10">
              <button
                type="button"
                onClick={() => setIsReviewsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                aria-expanded={isReviewsOpen}
              >
                <span className="text-xs uppercase tracking-widest text-white/40">
                  Customer Reviews ({dummyReviews.length})
                </span>
                <span className="text-white/30 text-sm">{isReviewsOpen ? '−' : '+'}</span>
              </button>
              {isReviewsOpen && (
                <div className="flex flex-col gap-4 px-6 pb-6">
                  {dummyReviews.map((review) => (
                    <div key={review.id} className="flex flex-col gap-2 border-t border-white/5 pt-4">
                      <span className="text-sm font-medium text-brand">
                        {review.author} — {review.rating}/5
                      </span>
                      <p className="text-sm text-white/60">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
