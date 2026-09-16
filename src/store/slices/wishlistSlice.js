import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const fetchWishlist = () => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.get('/users/wishlist');
    dispatch(fetchSuccess(data.wishlist));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch wishlist';
    dispatch(fetchFailure(message));
  }
};

export const addToWishlist = (productId) => async (dispatch) => {
  try {
    const { data } = await api.post(`/users/wishlist/${productId}`);
    dispatch(fetchSuccess(data.wishlist));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to add to wishlist';
    dispatch(fetchFailure(message));
  }
};

export const removeFromWishlist = (productId) => async (dispatch) => {
  try {
    const { data } = await api.delete(`/users/wishlist/${productId}`);
    dispatch(fetchSuccess(data.wishlist));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to remove from wishlist';
    dispatch(fetchFailure(message));
  }
};
