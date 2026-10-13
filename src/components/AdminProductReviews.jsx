import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api.js';

// Admin-only list of a product's customer reviews with a delete button each,
// shown under the edit form so unwanted reviews can be removed.
const AdminProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/products/${productId}/reviews`);
      setReviews(data.reviews);
      setError(null);
    } catch {
      setError('Could not load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (review) => {
    if (!window.confirm(`Delete ${review.authorName}'s review? This cannot be undone.`)) return;
    setDeletingId(review._id);
    setError(null);
    try {
      await api.delete(`/products/${productId}/reviews/${review._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the review.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border border-white/10 bg-surface/30 p-6 flex flex-col gap-4">
      <h2 className="font-serif text-lg text-brand">Customer Reviews ({reviews.length})</h2>

      {isLoading && <p className="text-xs uppercase tracking-widest text-white/40 animate-pulse">Loading reviews...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!isLoading && !error && reviews.length === 0 && (
        <p className="text-sm text-white/40">No customer reviews on this product yet.</p>
      )}

      {reviews.map((review) => (
        <div key={review._id} className="flex flex-col gap-2 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-brand">
              {review.authorName} <span className="text-white/40">· {'★'.repeat(review.rating)}</span>
            </span>
            <button
              type="button"
              onClick={() => handleDelete(review)}
              disabled={deletingId === review._id}
              className="border border-white/15 px-3 py-1 text-xs uppercase tracking-widest text-white/50 transition-colors duration-300 hover:border-red-400 hover:text-red-400 disabled:opacity-40"
            >
              {deletingId === review._id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {review.text && <p className="text-sm text-white/60 whitespace-pre-line break-words">{review.text}</p>}
          {review.photos?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.photos.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="h-16 w-12 border border-white/15 bg-black">
                  <img src={url} alt="Customer" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminProductReviews;
