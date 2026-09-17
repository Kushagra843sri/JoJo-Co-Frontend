import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(token ? null : 'This reset link is missing its token.');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-ink">
      <div className="grain-overlay" />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 pt-32">
        <div className="w-full max-w-md border border-white/10 bg-ink/60 backdrop-blur p-8 flex flex-col gap-6 shadow-[0_0_60px_-20px_rgba(168,85,247,0.35)]">
          <h1 className="font-serif text-2xl text-brand">Choose a New Password</h1>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          {success ? (
            <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4">
              Password reset — redirecting you to sign in...
            </div>
          ) : (
            token && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            )
          )}

          <Link
            to="/login"
            className="text-center text-xs uppercase tracking-widest text-white/40 transition-colors duration-300 hover:text-brand"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
