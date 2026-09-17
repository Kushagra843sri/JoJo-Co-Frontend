import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCatalogProducts } from '../../store/slices/productSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import GlowOrbs from '../../components/GlowOrbs.jsx';
import MarqueeStrip from '../../components/MarqueeStrip.jsx';
import { useReveal } from '../../hooks/useReveal.js';

const INSTAGRAM_URL = 'https://www.instagram.com/jojo.and.c0mpany/';

const categories = [
  { id: 1, label: 'New Arrivals' },
  { id: 2, label: 'Core Collection' },
  { id: 3, label: 'Editorial' },
];

const testimonials = [
  {
    id: 1,
    quote: 'The fabric weight is unlike anything I’ve bought online — it actually looks better in person.',
    author: 'Aisha M.',
  },
  {
    id: 2,
    quote: 'Fit was true to size and delivery was faster than expected. Already ordered a second piece.',
    author: 'Rohan K.',
  },
  {
    id: 3,
    quote: 'Understated, well-made, and the kind of pieces that don’t date after one season.',
    author: 'Priya S.',
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const [aboutRef, aboutVisible] = useReveal();
  const [categoryRef, categoryVisible] = useReveal();
  const [arrivalsRef, arrivalsVisible] = useReveal();
  const [testimonialsRef, testimonialsVisible] = useReveal();
  const [cultRef, cultVisible] = useReveal();

  useEffect(() => {
    dispatch(fetchCatalogProducts({ sort: 'newest', limit: 4 }));
  }, [dispatch]);

  // Every lookbook image across the fetched products, doubled below so the
  // strip can loop seamlessly (a plain translateX(-100%) would snap back to
  // start; -50% on a doubled list is invisible since the second half is an
  // exact copy of the first).
  const heroImages = useMemo(
    () => products.flatMap((product) => product.images?.flatMap((group) => group.urls) || []).filter(Boolean),
    [products]
  );

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
        {heroImages.length > 0 && (
          <div className="absolute inset-0 flex animate-hero-scroll opacity-60">
            {[...heroImages, ...heroImages].map((url, index) => (
              <div key={`${url}-${index}`} className="h-full w-[50vw] sm:w-[33.33vw] md:w-[25vw] flex-none">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-ink" />

        <div
          className="relative z-10 flex flex-col items-center text-center gap-6 px-4 sm:px-8 transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)` }}
        >
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-brand">
            Delhi Lanes To Dystopia
          </span>
          <h1 className="font-serif text-white text-5xl md:text-7xl leading-tight max-w-3xl">
            Tailored for the <span className="text-gradient-brand">Season Ahead</span>
          </h1>
          <p className="text-white/60 max-w-md text-base">
            Considered fabrics. Structured silhouettes. Built to outlast the trend cycle.
          </p>
          <Link
            to="/catalog"
            className="mt-4 rounded-full btn-glow text-white px-10 py-4 text-sm uppercase tracking-widest shadow-lg transition-all duration-300 hover:scale-105 active:scale-100"
          >
            Shop the Collection
          </Link>
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

      {/* Category navigation strip */}
      <section
        ref={categoryRef}
        className={`reveal-on-scroll ${categoryVisible ? 'is-visible' : ''} w-full px-4 sm:px-8 py-16`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* New Arrivals product grid */}
      <section
        ref={arrivalsRef}
        className={`reveal-on-scroll ${arrivalsVisible ? 'is-visible' : ''} w-full px-4 sm:px-8 py-16`}
      >
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-serif text-3xl text-brand">New Arrivals</h2>
          <span className="text-xs uppercase tracking-widest text-white/40">
            {String(products.length).padStart(2, '0')} Pieces
          </span>
        </div>

        {isLoading && (
          <p className="text-sm uppercase tracking-widest text-white/40 animate-pulse">Loading new arrivals...</p>
        )}

        {!isLoading && products.length === 0 && (
          <p className="text-sm text-white/50 border border-white/10 px-8 py-12 text-center">
            No products published yet — check back soon.
          </p>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => {
              const imageUrl = product.images?.[0]?.urls?.[0];
              const onSale = product.salePrice != null;

              return (
                <Link key={product._id} to={`/product/${product._id}`} className="flex flex-col gap-4">
                  <div className="tilt-card relative aspect-[4/5] bg-white/5 overflow-hidden">
                    {imageUrl && (
                      <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute top-4 left-4 btn-glow text-white text-xs uppercase tracking-widest px-4 py-2">
                      {onSale ? 'Sale' : 'New'}
                    </span>
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

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        className={`reveal-on-scroll ${testimonialsVisible ? 'is-visible' : ''} relative w-full px-4 sm:px-8 py-16 bg-surface overflow-hidden`}
      >
        <GlowOrbs />
        <div className="relative z-10 flex flex-col items-center text-center gap-2 mb-12">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/40">What Customers Say</span>
          <h2 className="font-serif text-3xl text-brand">In Their Words</h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="border border-white/10 bg-ink/80 backdrop-blur p-8 flex flex-col gap-6 transition-all duration-300 hover:border-brand/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)] hover:-translate-y-1"
            >
              <span className="font-serif text-4xl text-brand-strong leading-none">“</span>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{testimonial.quote}</p>
              <span className="text-xs uppercase tracking-widest text-white/40">— {testimonial.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Join The Cult — Instagram CTA */}
      <section
        ref={cultRef}
        className={`reveal-on-scroll ${cultVisible ? 'is-visible' : ''} relative w-full px-4 sm:px-8 py-24 bg-black border-y border-white/10 flex flex-col items-center text-center gap-6 overflow-hidden`}
      >
        <GlowOrbs />
        <span className="relative z-10 font-mono text-xs tracking-[0.2em] uppercase text-white/40">
          Follow @jojo.and.c0mpany
        </span>
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
          Limited drops, restocks, and behind-the-scenes chaos — first on the &#39;gram.
        </span>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
