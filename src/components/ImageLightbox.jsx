import { useEffect, useRef, useState } from 'react';

// Full-screen photo viewer for the product page. Controlled by the parent
// (`index` / `onIndexChange`) so flipping photos here also moves the page's own
// gallery. Closes on ✕, Esc, or a click on the dark backdrop; flips with the
// < > buttons, ← → keys, or a swipe on touch screens.
const ImageLightbox = ({ images, index, title, onIndexChange, onClose }) => {
  const closeButtonRef = useRef(null);
  const touchStartX = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const count = images.length;
  const src = images[index];

  const go = (next) => onIndexChange((next + count) % count);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (count > 1 && e.key === 'ArrowLeft') onIndexChange((index - 1 + count) % count);
      if (count > 1 && e.key === 'ArrowRight') onIndexChange((index + 1) % count);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, count, onClose, onIndexChange]);

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null || count < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
  };

  const arrowClasses =
    'absolute top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 hover:text-brand active:scale-95';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photos`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close full screen"
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 hover:text-brand"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(index - 1);
            }}
            aria-label="Previous photo (full screen)"
            className={`${arrowClasses} left-3 sm:left-6`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(index + 1);
            }}
            aria-label="Next photo (full screen)"
            className={`${arrowClasses} right-3 sm:right-6`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-widest text-white/80 backdrop-blur">
            {index + 1} / {count}
          </span>
        </>
      )}

      {/* The spacing lives on this wrapper, not on the <img>, so only the photo
          itself (not the dark margin around it) swallows clicks — tapping the
          margin closes the viewer. */}
      <div className="pointer-events-none flex h-full w-full items-center justify-center px-0 py-16 sm:px-24">
        <img
          key={src}
          src={src}
          alt={`${title} — photo ${index + 1} of ${count}`}
          onClick={(e) => e.stopPropagation()}
          onLoad={() => setLoadedSrc(src)}
          className={`pointer-events-auto max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${
            loadedSrc === src ? 'opacity-100' : 'opacity-0'
          }`}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
