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
      <nav className="flex flex-col">
        {adminTabs.map((tab) => {
          const isActive = tab.path === location.pathname;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`text-left px-6 py-4 text-sm transition-colors duration-300 ${
                isActive
                  ? 'border-l-4 border-[#2F5DA8] font-semibold text-[#2F5DA8] bg-stone-50'
                  : 'border-l-4 border-transparent text-stone-600 hover:text-[#2F5DA8]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => dispatch(logoutUser())}
          className="text-left px-6 py-4 text-sm border-l-4 border-transparent text-stone-600 transition-colors duration-300 hover:text-[#2F5DA8]"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
