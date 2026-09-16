import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../../store/slices/authSlice.js';
import Navbar from '../../components/Navbar.jsx';

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(registerUser(formData));
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-ink">
      <div className="grain-overlay" />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-8 py-16 pt-32">
        <div className="relative w-full max-w-md border border-white/10 bg-ink/60 backdrop-blur p-8 flex flex-col gap-6 shadow-[0_0_60px_-20px_rgba(168,85,247,0.35)]">
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-sm uppercase tracking-widest transition-colors duration-300 ${
                isLogin ? 'text-brand border-b-2 border-brand font-semibold' : 'text-white/30'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-sm uppercase tracking-widest transition-colors duration-300 ${
                !isLogin ? 'text-brand border-b-2 border-brand font-semibold' : 'text-white/30'
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-serif text-2xl text-brand">
            {isLogin ? 'Welcome Back' : 'Join the Collection'}
          </h1>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={isLogin ? undefined : 8}
                className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-white/30">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Full-page navigation, not a fetch — OAuth requires the browser to
              actually leave the app and land on Google's own login screen. */}
          <a
            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1')}/auth/google`}
            className="w-full flex items-center justify-center gap-3 border border-white/15 text-white/70 py-4 text-sm uppercase tracking-widest transition-colors duration-300 hover:border-brand hover:text-brand"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
              />
            </svg>
            Continue with Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
