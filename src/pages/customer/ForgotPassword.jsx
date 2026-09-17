import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
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
          <h1 className="font-serif text-2xl text-brand">Reset Your Password</h1>
          <p className="text-sm text-white/60">
            Enter the email on your account and we'll send you a link to choose a new password.
          </p>

          {error && (
            <div className="border border-red-500/40 bg-red-950/40 text-red-300 text-sm px-4 py-4">{error}</div>
          )}

          {message ? (
            <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border border-white/15 px-4 py-4 text-sm text-white focus:outline-none focus:border-brand transition-colors duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
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

export default ForgotPassword;
