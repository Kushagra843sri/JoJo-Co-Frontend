import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';

// One nav layout at every screen size: the hamburger alone on the left (it
// opens the Sidebar drawer, which is the only place category/shop links
// live now — no duplicate "Shop Now" floating outside the drawer), the
// brand name centered (absolutely positioned so it stays dead-center
// regardless of how wide the left/right groups are), Sign In/Bag on the
// right — no separate desktop-vs-mobile modes, and no logo image (removed
// per the client's request; the wordmark alone is the identity now).
const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-ink/95 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-2 sm:gap-4 z-10">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 border border-white/15 text-white/70 transition-colors duration-300 hover:border-brand hover:text-brand"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <Link
        to="/"
        className="absolute left-1/2 -translate-x-1/2 max-w-[38vw] truncate font-serif text-base sm:text-xl tracking-[0.2em] uppercase text-brand transition-colors duration-300 hover:text-white"
      >
        JOJO&amp;CO
      </Link>

      <div className="flex items-center gap-2 sm:gap-3 z-10">
        {isAuthenticated ? (
          <Link
            to="/orders"
            className="h-9 sm:h-10 flex items-center justify-center px-2.5 sm:px-4 border border-white/15 text-[11px] sm:text-xs uppercase tracking-widest text-white/70 whitespace-nowrap max-w-[26vw] truncate transition-all duration-300 hover:border-brand hover:text-brand"
          >
            Hi, {user?.name?.split(' ')[0] || 'there'}
          </Link>
        ) : (
          <Link
            to="/login"
            className="h-9 sm:h-10 flex items-center justify-center px-2.5 sm:px-4 border border-white/15 text-[11px] sm:text-xs uppercase tracking-widest text-white/70 whitespace-nowrap transition-all duration-300 hover:border-brand hover:text-brand"
          >
            Sign In
          </Link>
        )}

        <Link
          to="/cart"
          aria-label="View bag"
          className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 flex-none border border-white/15 text-white/70 transition-all duration-300 hover:border-brand hover:text-brand hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.55)]"
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
      </div>
    </nav>

    {/* Rendered as a sibling of <nav>, not a descendant — nav's own
        backdrop-blur establishes a new containing block for fixed-position
        descendants, which silently breaks this drawer's h-full (it would
        resolve against nav's own 80px height instead of the viewport). */}
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      isAdmin={isAuthenticated && user?.role === 'admin'}
    />
    </>
  );
};

export default Navbar;
