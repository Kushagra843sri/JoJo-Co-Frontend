import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice.js';

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin' },
  { id: 'inventory', label: 'Inventory Manager', path: '/admin/products' },
  { id: 'fulfillment', label: 'Fulfillment Logs', path: '/admin/orders' },
  { id: 'store', label: 'Store View', path: '/' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  return (
    <aside className="lg:col-span-3">
      <nav className="flex flex-col border border-white/10 bg-surface/40 overflow-hidden">
        {adminTabs.map((tab) => {
          const isActive = tab.path === location.pathname;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`text-left px-6 py-4 text-sm transition-colors duration-300 border-l-2 ${
                isActive
                  ? 'border-brand font-semibold text-brand bg-brand/10'
                  : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => dispatch(logoutUser())}
          className="text-left px-6 py-4 text-sm border-l-2 border-transparent text-white/50 transition-colors duration-300 hover:text-white hover:bg-white/5"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
