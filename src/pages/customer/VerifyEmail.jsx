import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api.js';
import { checkAuth } from '../../store/slices/authSlice.js';
import Navbar from '../../components/Navbar.jsx';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const [status, setStatus] = useState(token ? 'checking' : 'error'); // checking | success | error
  const [message, setMessage] = useState(
    token ? 'Verifying your email...' : 'This verification link is missing its token.'
  );

  useEffect(() => {
    if (!token) return;

    api
      .post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Your email is verified. You can now place orders.');
        // Refreshes the cached user so emailVerified flips to true immediately,
        // without asking them to log out and back in.
        dispatch(checkAuth());
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
      });
  }, [token, dispatch]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-ink">
      <div className="grain-overlay" />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-8 py-16 pt-32">
        <div className="w-full max-w-md border border-white/10 p-8 flex flex-col items-center gap-6 text-center">
          <h1 className="font-serif text-2xl text-brand">
            {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'One Moment'}
          </h1>
          <p
            className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-white/60'}`}
          >
            {message}
          </p>
          {status === 'error' && (
            <p className="text-xs text-white/40">
              If you're signed in, you can request a fresh link from your account page.
            </p>
          )}
          <Link
            to="/"
            className="btn-glow text-white px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-[0.98]"
          >
            Continue to JOJO&amp;CO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
