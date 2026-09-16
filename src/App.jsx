import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Home from './pages/customer/Home.jsx';
import Catalog from './pages/customer/Catalog.jsx';
import ProductDetail from './pages/customer/ProductDetail.jsx';
import Cart from './pages/customer/Cart.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import OrderResult from './pages/customer/OrderResult.jsx';
import OrderHistory from './pages/customer/OrderHistory.jsx';
import AuthPage from './pages/customer/AuthPage.jsx';
import VerifyEmail from './pages/customer/VerifyEmail.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import OrderControl from './pages/admin/OrderControl.jsx';
import { loginSuccess, checkAuth } from './store/slices/authSlice.js';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();
  const cachedUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Hydrate instantly from the cache so protected routes don't flash a
    // logged-out state on load, then reconcile against the server — the
    // session cookie may have expired, or been revoked, since the cache was
    // written, and role must always come from the server, never local cache.
    if (cachedUser) {
      dispatch(loginSuccess(cachedUser));
    }
    dispatch(checkAuth());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-result"
          element={
            <ProtectedRoute>
              <OrderResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ProductForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <OrderControl />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
