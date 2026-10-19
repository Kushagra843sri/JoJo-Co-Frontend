import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import GlowOrbs from '../../components/GlowOrbs.jsx';
import MarqueeStrip from '../../components/MarqueeStrip.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { getCoverPhoto, getUnitPrice, hasSale } from '../../utils/productImages.js';

const INSTAGRAM_URL = 'https://www.instagram.com/jojo.and.c0mpany/';

const categories = [
  { id: 1, label: 'New Arrivals' },
  { id: 2, label: 'Core Collection' },
];

// Real customer DMs/stories the client shared; files live in public/reviews.
const reviewShots = [
  { src: '/reviews/review-1.jpg', width: 800, height: 1102, alt: 'Customer message: they’re lovely, the stickers look so dope too' },
  { src: '/reviews/review-2.jpg', width: 800, height: 1260, alt: 'Customer story wearing JoJo & Co on stage: everyone loved the drip' },
  { src: '/reviews/review-3.jpg', width: 800, height: 1406, alt: 'Customer styling JoJo & Co jorts with a leopard scarf' },
  { src: '/reviews/review-4.jpg', width: 800, height: 1416, alt: 'Customer message: really like the fit and the look of the T-shirt' },
];

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const [aboutRef, aboutVisible] = useReveal();
  const [categoryRef, categoryVisible] = useReveal();
  const [dmsRef, dmsVisible] = useReveal();
  const [openShot, setOpenShot] = useState(null);
  const [cultRef, cultVisible] = useReveal();

  useEffect(() => {
    if (!openShot) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpenShot(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openShot]);

  // Products ticked "Best Seller" in the admin form. Fetched locally (not via the
  // store) because the store's list also feeds the hero photo strip below.
  useEffect(() => {
    api
      .get('/products', { params: { bestSeller: true, limit: 50, sort: 'newest' } })
      .then(({ data }) => setBestSellers(data.products))
      .catch(() => setBestSellers([]))
      .finally(() => setBestSellersLoading(false));
  }, []);

  // Lightweight cursor-driven 3D tilt on the hero copy — pure CSS transform,
  // no WebGL/three.js, so it's cheap on low-end phones and degrades to a flat
  // hero (see .reduced-motion handling for the other animations) when the
  // pointer never moves, e.g. touch devices.
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({ x: px * 12, y: py * -10 });
  };

  const resetHeroTilt = () => setHeroTilt({ x: 0, y: 0 });

  return (
    <div className="w-full bg-ink">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-20">
      {/* Full-bleed hero */}
      <section
        className="relative w-full h-[560px] md:h-[640px] bg-black flex items-center justify-center overflow-hidden [perspective:1200px]"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroTilt}
      >
        {/* Silent looping brand video behind the headline. Muted + playsInline are
            required for autoplay on mobile; the poster shows while it loads. */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-ink" />

        <div
          className="relative z-10 flex flex-col items-center text-center gap-6 px-4 sm:px-8 transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)` }}
        >
          <h1 className="font-serif text-white text-5xl md:text-7xl leading-tight max-w-3xl">
            <span className="text-gradient-brand">Delhi Lanes To</span> Dystopia
          </h1>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-brand">
            A wearable movement
          </span>
          <p className="text-white/60 max-w-md text-base">
            Gender fluid. Every piece helps feed a life.
          </p>
        </div>
      </section>

      <MarqueeStrip />

      {/* About the company */}
      <section
        ref={aboutRef}
        className={`reveal-on-scroll ${aboutVisible ? 'is-visible' : ''} relative w-full px-4 sm:px-8 py-20 bg-ink overflow-hidden`}
      >
        <GlowOrbs />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-brand">About The Company</span>
          <h2 className="font-serif text-3xl md:text-4xl text-gradient-brand leading-tight">
            From Delhi Lanes To Dystopia
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            » Discover the art of clothes that are born in Delhi, Raised in Chaos. We fuse our desi vibes with
            alt grunge without compromising quality or style. Every piece is limited so grab them before
            they're gone &amp; we'll be back as always with something FIRE.
          </p>
          <p className="text-white/60 text-base leading-relaxed">
            » We provide customisation and upcycling services as well. DM or Email regarding the same.
          </p>
        </div>
      </section>

      {/* Best Sellers product grid — hidden until at least one product is ticked */}
      {!bestSellersLoading && bestSellers.length > 0 && (
        // No scroll-reveal here: useReveal only observes the node present on first
        // render, and this section mounts later (after the fetch), so it would stay
        // at opacity 0 forever.
        <section className="w-full px-4 sm:px-8 py-16">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-serif text-3xl text-brand">Best Sellers</h2>
            <span className="text-xs uppercase tracking-widest text-white/40">
              {String(bestSellers.length).padStart(2, '0')} Pieces
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-6 sm:gap-8">
            {bestSellers.map((product) => {
              const imageUrl = getCoverPhoto(product);
              const onSale = hasSale(product);

              return (
                <Link key={product._id} to={`/product/${product._id}`} className="flex min-w-0 flex-col gap-3 sm:gap-4">
                  <div className="tilt-card relative aspect-[4/5] bg-white/5 overflow-hidden">
                    {imageUrl && (
                      <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 btn-glow text-white text-[10px] sm:text-xs uppercase tracking-widest px-2 py-1 sm:px-4 sm:py-2">
                      {onSale ? 'Sale' : 'Best Seller'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-base sm:text-lg text-brand">{product.title}</h3>
                    <p className="text-sm text-white/60">₹{getUnitPrice(product)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Category navigation strip */}
      <section
        ref={categoryRef}
        className={`reveal-on-scroll ${categoryVisible ? 'is-visible' : ''} w-full px-4 sm:px-8 py-16`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/catalog"
              className="group border border-white/10 px-8 py-12 flex flex-col items-center gap-2 transition-all duration-300 hover:border-brand hover:shadow-[0_0_30px_-8px_rgba(168,85,247,0.5)] hover:-translate-y-1"
            >
              <span className="font-serif text-2xl text-brand">{category.label}</span>
              <span className="text-xs uppercase tracking-widest text-white/40 transition-colors duration-300 group-hover:text-brand">
                Explore
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Customer DMs / stories */}
      <section
        ref={dmsRef}
        className={`reveal-on-scroll ${dmsVisible ? 'is-visible' : ''} relative w-full px-4 sm:px-8 py-16 bg-surface overflow-hidden`}
      >
        <GlowOrbs />
        {/* Wall of love — real customer chats & stories, tap to enlarge */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-10">
          <div className="flex flex-col items-center text-center gap-2">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-brand">#jojocult</span>
            <h2 className="font-serif text-2xl md:text-3xl text-gradient-brand">Straight From Our DMs</h2>
          </div>
          <div className="columns-2 md:columns-4 gap-4 w-full">
            {reviewShots.map((shot, index) => (
              <button
                key={shot.src}
                type="button"
                onClick={() => setOpenShot(shot)}
                aria-label={`Enlarge: ${shot.alt}`}
                className={`group mb-4 block w-full break-inside-avoid overflow-hidden border border-white/10 bg-black transition-all duration-300 hover:border-brand/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)] hover:-translate-y-1 ${
                  index % 2 === 1 ? 'md:mt-8' : ''
                }`}
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  loading="lazy"
                  className="block h-auto w-full opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {openShot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openShot.alt}
          onClick={() => setOpenShot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setOpenShot(null)}
            aria-label="Close"
            className="absolute top-4 right-4 h-10 w-10 border border-white/20 text-white/70 transition-colors duration-300 hover:border-brand hover:text-brand"
          >
            ✕
          </button>
          <img
            src={openShot.src}
            alt={openShot.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain border border-white/10"
          />
        </div>
      )}

      {/* Join The Cult — Instagram CTA */}
      <section
        ref={cultRef}
        className={`reveal-on-scroll ${cultVisible ? 'is-visible' : ''} relative w-full px-4 sm:px-8 py-24 bg-black border-y border-white/10 flex flex-col items-center text-center gap-6 overflow-hidden`}
      >
        <GlowOrbs />
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative z-10 flex items-center gap-4 font-serif text-4xl md:text-6xl uppercase tracking-widest text-white transition-all duration-300 hover:scale-105"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="flex-none transition-colors duration-300 group-hover:text-brand"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span className="text-gradient-brand transition-[filter] duration-300 group-hover:drop-shadow-[0_0_18px_rgba(192,132,252,0.6)]">
            Join The Cult
          </span>
        </a>
        <span className="relative z-10 text-sm text-white/50 max-w-md">
          And don&rsquo;t miss the chaos behind the brand, along with special drops for members only.
        </span>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
