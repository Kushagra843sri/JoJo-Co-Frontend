import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const loadCachedUser = () => {
  try {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadCachedUser(),
  isAuthenticated: false,
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
    const message = err.response?.data?.message || 'Registration failed';
    dispatch(loginFailure(message));
  }
};

export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(loginSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Invalid email or password';
    dispatch(loginFailure(message));
  }
};

export const updateProfile = (profileData) => async (dispatch) => {
  dispatch(updateProfileStart());
  try {
    const { data } = await api.patch('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(data));
    dispatch(updateProfileSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update profile';
    dispatch(updateProfileFailure(message));
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
