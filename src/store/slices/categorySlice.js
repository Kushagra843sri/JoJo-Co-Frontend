import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  categories: [],
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.categories = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    addCategorySuccess: (state, action) => {
      state.categories.push(action.payload);
    },
    updateCategorySuccess: (state, action) => {
      const index = state.categories.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) state.categories[index] = action.payload;
    },
    removeCategorySuccess: (state, action) => {
      state.categories = state.categories.filter((c) => c._id !== action.payload);
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addCategorySuccess,
  updateCategorySuccess,
  removeCategorySuccess,
} = categorySlice.actions;
export default categorySlice.reducer;

export const fetchCategories = () => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.get('/categories');
    dispatch(fetchSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to load categories';
    dispatch(fetchFailure(message));
  }
};

export const createCategory = (payload) => async (dispatch) => {
  try {
    const { data } = await api.post('/categories', payload);
    dispatch(addCategorySuccess(data));
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to create category';
    return { success: false, message };
  }
};

export const updateCategory = (id, payload) => async (dispatch) => {
  try {
    const { data } = await api.patch(`/categories/${id}`, payload);
    dispatch(updateCategorySuccess(data));
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update category';
    return { success: false, message };
  }
};

export const deleteCategory = (id) => async (dispatch) => {
  try {
    await api.delete(`/categories/${id}`);
    dispatch(removeCategorySuccess(id));
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to delete category';
    return { success: false, message };
  }
};
