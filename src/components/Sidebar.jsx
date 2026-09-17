import { Link } from 'react-router-dom';

// Must stay byte-for-byte in sync with the `categories`/`categoryOptions`
// lists in Catalog.jsx and admin/ProductForm.jsx — Catalog's filter does an
// exact match against whatever's saved on a product, so a category link here
// that doesn't match a real value would silently show zero products.
const categories = ['Outerwear', 'Knitwear', 'Denim', 'Shirting', 'Accessories'];

// The primary nav drawer on every screen size (not just mobile) — opened from
// the hamburger button at the navbar's top-left. Links straight into a
// pre-filtered Catalog view per category (via ?category=), plus whatever
// doesn't fit in the always-visible top bar (Sign In/Bag stay in the navbar
// itself; this is for everything else, like Admin Dashboard).
const Sidebar = ({ isOpen, onClose, isAdmin }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed top-0 left-0 z-50 h-full w-72 max-w-[80vw] bg-ink border-r border-white/10 flex flex-col gap-1 p-6 pt-24 overflow-y-auto shadow-[16px_0_40px_-20px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-5 right-5 flex items-center justify-center h-9 w-9 border border-white/15 text-white/70 transition-colors duration-300 hover:border-brand hover:text-brand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <Link
          to="/"
          onClick={onClose}
          className="px-2 py-3 text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
        >
          Home
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            onClick={onClose}
            className="px-2 py-3 text-sm uppercase tracking-widest text-brand-strong transition-colors duration-300 hover:text-brand"
          >
            Admin Dashboard
          </Link>
        )}

        <span className="mt-4 px-2 text-xs uppercase tracking-widest text-white/30">Shop By Category</span>
        {categories.map((category) => (
          <Link
            key={category}
            to={`/catalog?category=${encodeURIComponent(category)}`}
            onClick={onClose}
            className="px-2 py-3 text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
          >
            {category}
          </Link>
        ))}

        <Link
          to="/catalog"
          onClick={onClose}
          className="mt-2 px-2 py-3 text-sm uppercase tracking-widest text-white/40 transition-colors duration-300 hover:text-brand"
        >
          View All Products
        </Link>
      </aside>
    </>
  );
};

export default Sidebar;
