import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jojoLogo from '../assets/jojo-logo.png';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-ink/95 backdrop-blur border-b border-white/10 flex items-center justify-between px-8">
      <Link to="/" className="group flex items-center gap-3">
        <img
          src={jojoLogo}
          alt="JOJO&CO"
          className="h-12 w-12 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.65)]"
        />
        <span className="font-serif text-xl tracking-[0.2em] uppercase text-brand transition-colors duration-300 group-hover:text-white">
          JOJO&amp;CO
        </span>
      </Link>

      <div className="flex items-center gap-8">
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
    </nav>
  );
};

export default Navbar;
