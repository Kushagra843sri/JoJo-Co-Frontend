import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// A request that never got a response (network drop, or the backend still
// booting from an idle/cold-start state on free hosting tiers) looks
// identical to axios as any other failure — err.response is just undefined.
// Surfacing that as "Registration failed"/"Invalid email or password" reads
// as a rejection when the truth is "we don't know yet, the server didn't
// answer in time." Distinguishing it here means the account/login attempt
// might actually still be inflight (see PRODUCTION_DEPLOYMENT.md's Render
// free-tier cold-start caveat), so tell the user to wait, not to fix their input.
const describeAuthError = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (!err.response) {
    return "Couldn't reach the server — it may be waking up after a period of inactivity. Please wait a few seconds and try again.";
  }
  return fallback;
};

const loadCachedUser = () => {
  try {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const cachedUser = loadCachedUser();

const initialState = {
  user: cachedUser,
  // Hydrated synchronously alongside `user` so ProtectedRoute's very first
  // render (before App.jsx's checkAuth effect resolves) doesn't see a false
  // logged-out state and bounce a hard page load (e.g. the post-checkout
  // redirect to /order-result) through /login back to home. checkAuth() below corrects
  // this moments later if the cookie actually turns out to be invalid/expired.
  isAuthenticated: Boolean(cachedUser),
  isLoading: false,
  error: null,
  isProfileUpdating: false,
  profileError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateProfileStart: (state) => {
      state.isProfileUpdating = true;
      state.profileError = null;
    },
    updateProfileSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isProfileUpdating = false;
      state.profileError = null;
    },
    updateProfileFailure: (state, action) => {
      state.profileError = action.payload;
      state.isProfileUpdating = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} = authSlice.actions;
export default authSlice.reducer;

export const registerUser = (userData) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(loginSuccess(data));
  } catch (err) {
    dispatch(loginFailure(describeAuthError(err, 'Registration failed')));
  }
};

export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(loginSuccess(data));
  } catch (err) {
    dispatch(loginFailure(describeAuthError(err, 'Invalid email or password')));
  }
};

export const updateProfile = (profileData) => async (dispatch) => {
  dispatch(updateProfileStart());
  try {
    const { data } = await api.patch('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(updateProfileSuccess(data));
  } catch (err) {
    dispatch(updateProfileFailure(describeAuthError(err, 'Failed to update profile')));
  }
};

// Reconciles the cached-in-localStorage profile against the actual httpOnly
// session cookie. The cache alone can't be trusted: it survives cookie
// expiry/logout-elsewhere indefinitely, and a viewer could hand-edit it (e.g.
// role: 'admin') to render admin UI locally, even though every real admin API
// call would still be rejected server-side. Call on app load to catch both.
export const checkAuth = () => async (dispatch) => {
  try {
    const { data } = await api.get('/auth/profile');
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(loginSuccess(data));
  } catch {
    localStorage.removeItem('user');
    dispatch(logoutSuccess());
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error(`logoutUser API call failed: ${err.message}`);
  } finally {
    localStorage.removeItem('user');
    dispatch(logoutSuccess());
  }
};
