import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jojoLogo from '../assets/jojo-logo.png';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-ink/95 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 sm:px-8">
      <Link to="/" className="group flex items-center gap-3 min-w-0" onClick={closeMenu}>
        <img
          src={jojoLogo}
          alt="JOJO&CO"
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.65)]"
        />
        <span className="font-serif text-base sm:text-xl tracking-[0.2em] uppercase text-brand transition-colors duration-300 group-hover:text-white truncate">
          JOJO&amp;CO
        </span>
      </Link>

      {/* Desktop nav — hidden below md, full link row above it */}
      <div className="hidden md:flex items-center gap-8">
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/admin"
            className="text-sm uppercase tracking-widest text-brand-strong transition-colors duration-300 hover:text-brand"
          >
            Admin Dashboard
          </Link>
        )}

        {isAuthenticated ? (
          <Link
            to="/orders"
            className="text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
          >
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
          >
            Sign In
          </Link>
        )}

        <Link
          to="/cart"
          className="relative flex items-center justify-center h-10 w-10 border border-white/15 text-xs uppercase tracking-widest text-white/60 transition-all duration-300 hover:border-brand hover:text-brand hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.55)]"
        >
          Bag
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full btn-glow text-white text-[10px] animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile controls — cart icon always visible, hamburger opens the rest */}
      <div className="flex md:hidden items-center gap-3">
        <Link
          to="/cart"
          onClick={closeMenu}
          className="relative flex items-center justify-center h-9 w-9 border border-white/15 text-white/60 transition-all duration-300 hover:border-brand hover:text-brand"
          aria-label="View bag"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full btn-glow text-white text-[10px] animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          className="flex items-center justify-center h-9 w-9 border border-white/15 text-white/70 transition-colors duration-300 hover:border-brand hover:text-brand"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel — absolutely positioned so it never changes the
          fixed h-20 nav height every page already offsets against (pt-20/28/32). */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full inset-x-0 bg-ink/98 backdrop-blur border-b border-white/10 flex flex-col px-4 py-4 gap-1 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className="px-2 py-3 text-sm uppercase tracking-widest text-brand-strong transition-colors duration-300 hover:text-brand"
            >
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              to="/orders"
              onClick={closeMenu}
              className="px-2 py-3 text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
            >
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="px-2 py-3 text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
            >
              Sign In
            </Link>
          )}

          <Link
            to="/catalog"
            onClick={closeMenu}
            className="px-2 py-3 text-sm uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-brand"
          >
            Catalog
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
