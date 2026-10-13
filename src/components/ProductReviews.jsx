import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api.js';
import { loadCloudinaryWidget } from '../utils/cloudinaryWidget.js';
import ImageLightbox from './ImageLightbox.jsx';

const MAX_PHOTOS = 3;
const MAX_TEXT = 1000;

const Stars = ({ value, size = 'text-base' }) => (
  <span className={`${size} tracking-widest text-brand`} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= Math.round(value) ? '' : 'text-white/20'}>
        ★
      </span>
    ))}
  </span>
);

const StarPicker = ({ value, onChange, disabled }) => (
  <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        role="radio"
        aria-checked={value === n}
        aria-label={`${n} star${n > 1 ? 's' : ''}`}
        disabled={disabled}
        onClick={() => onChange(n)}
        className={`text-3xl leading-none transition-colors duration-200 hover:text-brand disabled:opacity-60 ${
          n <= value ? 'text-brand' : 'text-white/20'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Customer reviews for one product: list, plus a form (stars, text, optional
// photos) for signed-in customers. One review per customer — saving again edits it.
const ProductReviews = ({ productId }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [data, setData] = useState({ reviews: [], count: 0, averageRating: 0 });
  const [isOpen, setIsOpen] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  const [viewer, setViewer] = useState(null); // { images, index }

  const myReview = isAuthenticated && user ? data.reviews.find((r) => String(r.user) === String(user._id)) : null;

  const load = useCallback(async () => {
    try {
      const { data: res } = await api.get(`/products/${productId}/reviews`);
      setData(res);
      setLoadError(null);
    } catch {
      setLoadError('Could not load reviews right now.');
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  // Prefill the form with the customer's existing review so they can edit it.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setText(myReview.text || '');
      setPhotos(myReview.photos || []);
    } else {
      setRating(0);
      setText('');
      setPhotos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?._id, productId]);

  const handleAddPhotos = async () => {
    setFormError(null);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    try {
      const cloudinary = await loadCloudinaryWidget();
      cloudinary
        .createUploadWidget(
          {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
            multiple: remaining > 1,
            maxFiles: remaining,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxImageFileSize: 8 * 1024 * 1024,
            sources: ['local', 'camera'],
          },
          (uploadError, result) => {
            // A failed upload can leave the widget's body scroll-lock behind.
            if (uploadError || result?.event === 'close') document.body.style.overflow = '';
            if (uploadError) {
              setFormError(uploadError.statusText || uploadError.message || 'Photo upload failed');
              return;
            }
            if (result?.event === 'success') {
              const url = result.info.secure_url;
              setPhotos((prev) => (prev.includes(url) || prev.length >= MAX_PHOTOS ? prev : [...prev, url]));
            }
          }
        )
        .open();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormMessage(null);
    if (rating < 1) {
      setFormError('Please tap a star rating.');
      return;
    }
    setIsSaving(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, text, photos });
      await load();
      setFormMessage(myReview ? 'Your review was updated.' : 'Thanks! Your review is live.');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save your review. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      setFormMessage(null);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not delete your review.');
    }
  };

  const inputClasses =
    'w-full bg-transparent border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors duration-300 disabled:opacity-60';

  return (
    <div className="border border-white/10">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-white/40">Customer Reviews ({data.count})</span>
          {data.count > 0 && (
            <span className="flex items-center gap-2">
              <Stars value={data.averageRating} size="text-sm" />
              <span className="text-xs text-white/40">{data.averageRating.toFixed(1)}</span>
            </span>
          )}
        </span>
        <span className="text-white/30 text-sm">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-6 px-6 pb-6">
          {/* Write / edit a review */}
          <div className="border-t border-white/5 pt-6">
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <span className="text-xs uppercase tracking-widest text-brand">
                  {myReview ? 'Edit your review' : 'Write a review'}
                </span>
                <StarPicker value={rating} onChange={setRating} disabled={isSaving} />
                <div className="flex flex-col gap-1">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={MAX_TEXT}
                    rows={4}
                    disabled={isSaving}
                    placeholder="How do the fit, fabric and print feel? (optional)"
                    className={inputClasses}
                  />
                  <span className="self-end text-[10px] text-white/30">
                    {text.length}/{MAX_TEXT}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {photos.map((url) => (
                    <div key={url} className="relative h-20 w-16 border border-white/15 bg-black">
                      <img src={url} alt="Your review" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((u) => u !== url))}
                        disabled={isSaving}
                        aria-label="Remove photo"
                        className="absolute -top-2 -right-2 h-5 w-5 bg-ink border border-white/30 text-[10px] text-white/70 hover:border-red-400 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={handleAddPhotos}
                      disabled={isSaving}
                      className="h-20 px-4 border border-dashed border-white/20 text-xs uppercase tracking-widest text-white/50 transition-colors duration-300 hover:border-brand hover:text-brand disabled:opacity-60"
                    >
                      + Add photo
                    </button>
                  )}
                  <span className="text-[10px] text-white/30">Optional · up to {MAX_PHOTOS}</span>
                </div>

                {formError && <p className="text-sm text-red-400">{formError}</p>}
                {formMessage && <p className="text-sm text-brand">{formMessage}</p>}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-glow text-white text-xs uppercase tracking-widest px-6 py-3 disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  {myReview && (
                    <button
                      type="button"
                      onClick={() => handleDelete(myReview._id)}
                      disabled={isSaving}
                      className="text-xs uppercase tracking-widest text-white/40 transition-colors duration-300 hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <p className="text-sm text-white/60">
                <Link to="/login" state={{ from: location.pathname }} className="text-brand underline underline-offset-4">
                  Log in
                </Link>{' '}
                to rate this product and share your thoughts or a photo.
              </p>
            )}
          </div>

          {/* Existing reviews */}
          {loadError && <p className="text-sm text-red-400">{loadError}</p>}
          {!loadError && data.count === 0 && (
            <p className="border-t border-white/5 pt-4 text-sm text-white/40">No reviews yet — be the first.</p>
          )}
          {data.reviews.map((review) => (
            <div key={review._id} className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-brand">{review.authorName}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30">{formatDate(review.createdAt)}</span>
              </div>
              <Stars value={review.rating} size="text-sm" />
              {review.text && <p className="text-sm text-white/60 whitespace-pre-line break-words">{review.text}</p>}
              {review.photos?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {review.photos.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setViewer({ images: review.photos, index: i })}
                      aria-label="Enlarge review photo"
                      className="h-20 w-16 overflow-hidden border border-white/15 bg-black transition-colors duration-300 hover:border-brand"
                    >
                      <img src={url} alt="Customer" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewer && (
        <ImageLightbox
          images={viewer.images}
          index={viewer.index}
          title="Customer photo"
          onIndexChange={(index) => setViewer((v) => ({ ...v, index }))}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

export default ProductReviews;
