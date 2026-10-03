import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addItem } from '../../store/slices/cartSlice.js';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import ImageLightbox from '../../components/ImageLightbox.jsx';
import useSwipe from '../../hooks/useSwipe.js';
import { getCoverPhoto, getShowcasePhotos, getSizeCharts, getUnitPrice, hasSale } from '../../utils/productImages.js';
import { getVideoDeliveryUrl } from '../../utils/cloudinaryVideo.js';

const dummyReviews = [
  { id: 1, author: 'Ananya R.', rating: 5, text: 'Premium heavy-weight fabric, beautiful drape. 5/5 stars.' },
  { id: 2, author: 'Rohan K.', rating: 4, text: 'True to size and holds shape after washing. 4/5 stars.' },
];

// Image-to-image transition: when `src` changes (the shopper flips to another
// photo) the new photo is stacked on top and fades in only once it
// has actually loaded, while the previous one stays fully visible underneath —
// so the shopper never sees a blank frame or a hard cut. Superseded layers are
// dropped shortly after the new one is fully opaque.
const CrossfadeImage = ({ src, alt }) => {
  const [layers, setLayers] = useState([]);
  const nextKey = useRef(0);

  useEffect(() => {
    if (!src) return;
    setLayers((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].src === src) return prev;
      return [...prev, { key: nextKey.current++, src, loaded: false }];
    });
  }, [src]);

  useEffect(() => {
    const top = layers[layers.length - 1];
    if (layers.length < 2 || !top?.loaded) return undefined;
    const timer = setTimeout(() => setLayers((prev) => prev.slice(-1)), 700);
    return () => clearTimeout(timer);
  }, [layers]);

  const markLoaded = (key) =>
    setLayers((prev) => (prev.some((l) => l.key === key && !l.loaded) ? prev.map((l) => (l.key === key ? { ...l, loaded: true } : l)) : prev));

  return layers.map((layer, index) => (
    <img
      key={layer.key}
      ref={(el) => {
        // Cached images can finish loading before React attaches onLoad.
        if (el && el.complete && el.naturalWidth > 0) markLoaded(layer.key);
      }}
      src={layer.src}
      alt={index === layers.length - 1 ? alt : ''}
      onLoad={() => markLoaded(layer.key)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
        layer.loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  ));
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  // Nullable override: only set once the shopper actually clicks a size.
  // The effective selection below falls back to a sane default whenever the
  // override doesn't apply (nothing chosen yet, or the product changed under it) —
  // derived during render instead of synced via effects, so there's no risk of the
  // dependent-effect chain settling a render behind the data it's deriving from.
  const [selectedSizeOverride, setSelectedSizeOverride] = useState(null);
  // Photo being viewed, remembered with its product so opening another product
  // always starts on that product's first photo.
  const [imagePick, setImagePick] = useState({ productId: null, index: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [sizeChartIndex, setSizeChartIndex] = useState(0);
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

  // Warm the cache with every photo so flipping between them crossfades
  // straight away instead of waiting on the network.
  useEffect(() => {
    (currentProduct?.images || []).forEach((group) =>
      group.urls.forEach((url) => {
        new Image().src = url;
      })
    );
  }, [currentProduct]);

  // Sizes a shopper can actually buy — driven by real variant data so a
  // selectable option always maps to a real SKU. One entry per size.
  const variants = useMemo(() => currentProduct?.variants || [], [currentProduct]);
  const sizeOptions = useMemo(() => {
    const seen = new Map();
    variants.forEach((v) => {
      if (!seen.has(v.size)) seen.set(v.size, v);
    });
    return [...seen.values()];
  }, [variants]);
  const selectedSize = useMemo(() => {
    if (selectedSizeOverride && sizeOptions.some((v) => v.size === selectedSizeOverride)) {
      return selectedSizeOverride;
    }
    const firstInStock = sizeOptions.find((v) => v.stock > 0) || sizeOptions[0];
    return firstInStock?.size || null;
  }, [selectedSizeOverride, sizeOptions]);

  const activeVariant = sizeOptions.find((v) => v.size === selectedSize);

  // Every photo of the product, in order. Older products stored photos in
  // per-shade groups; they're all just photos of the product now.
  // Size charts are excluded here — they open from the "View size chart" link instead.
  const galleryImages = useMemo(() => getShowcasePhotos(currentProduct), [currentProduct]);
  const sizeCharts = useMemo(() => getSizeCharts(currentProduct), [currentProduct]);
  const activeImageIndex =
    imagePick.productId === currentProduct?._id && imagePick.index < galleryImages.length ? imagePick.index : 0;
  const mainImage = galleryImages[activeImageIndex];

  const showImage = (index) => {
    if (galleryImages.length === 0) return;
    setImagePick({ productId: currentProduct._id, index: (index + galleryImages.length) % galleryImages.length });
  };
  // Swipe left/right on touch screens to flip photos (ignores pinch-zoom).
  const swipeHandlers = useSwipe((direction) => showImage(activeImageIndex + direction));
  const handleGalleryKeyDown = (e) => {
    if (e.key === 'ArrowLeft') showImage(activeImageIndex - 1);
    if (e.key === 'ArrowRight') showImage(activeImageIndex + 1);
  };
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
        price: getUnitPrice(currentProduct),
        image: getCoverPhoto(currentProduct),
        size: selectedSize,
        color: activeVariant.color || undefined,
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
        price: getUnitPrice(currentProduct),
        image: getCoverPhoto(currentProduct),
        size: selectedSize,
        color: activeVariant.color || undefined,
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
            <div
              className="tilt-card relative aspect-[4/5] overflow-hidden bg-white/5 focus:outline-none"
              tabIndex={0}
              onKeyDown={handleGalleryKeyDown}
              {...swipeHandlers}
            >
              <CrossfadeImage src={mainImage} alt={`${currentProduct.title} — photo ${activeImageIndex + 1}`} />
              {mainImage && (
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View photo full screen"
                  className="absolute inset-0 z-0 cursor-zoom-in"
                />
              )}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => showImage(activeImageIndex - 1)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors duration-300 hover:bg-black/70 hover:text-brand active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => showImage(activeImageIndex + 1)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors duration-300 hover:bg-black/70 hover:text-brand active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70 backdrop-blur">
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => showImage(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={index === activeImageIndex}
                    className={`aspect-square overflow-hidden border transition-colors duration-300 ${
                      index === activeImageIndex ? 'border-brand' : 'border-white/10 hover:border-brand/60'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.title} — view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
              {hasSale(currentProduct) ? (
                <>
                  <span className="text-white/30 line-through text-lg">₹{currentProduct.basePrice}</span>
                  <span className="text-brand-strong font-semibold text-xl">₹{currentProduct.salePrice}</span>
                </>
              ) : (
                <span className="text-brand font-semibold text-xl">₹{currentProduct.basePrice}</span>
              )}
            </div>

            {sizeOptions.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-widest text-white/40">Size</span>
                  {sizeCharts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSizeChartIndex(0);
                        setIsSizeChartOpen(true);
                      }}
                      className="text-xs uppercase tracking-widest text-brand underline underline-offset-4 transition-colors duration-300 hover:text-white"
                    >
                      View size chart
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {sizeOptions.map((variant) => {
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
                Accepted Payment Methods: UPI, Credit/Debit Cards
              </p>
              <p className="text-xs text-white/40">Since every piece is made to order we don’t offer COD.</p>
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

      {isLightboxOpen && galleryImages.length > 0 && (
        <ImageLightbox
          images={galleryImages}
          index={activeImageIndex}
          title={currentProduct.title}
          onIndexChange={showImage}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {isSizeChartOpen && sizeCharts.length > 0 && (
        <ImageLightbox
          images={sizeCharts}
          index={sizeChartIndex}
          title={`${currentProduct.title} size chart`}
          onIndexChange={setSizeChartIndex}
          onClose={() => setIsSizeChartOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
