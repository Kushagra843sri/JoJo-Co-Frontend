import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  totalProducts: 0,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.products = action.payload.products;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalProducts = action.payload.totalProducts;
      state.isLoading = false;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.currentProduct = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    removeProductSuccess: (state, action) => {
      state.products = state.products.filter((product) => product._id !== action.payload);
    },
  },
});

export const {
  fetchStart,
  fetchProductsSuccess,
  fetchProductByIdSuccess,
  fetchFailure,
  removeProductSuccess,
} = productSlice.actions;
export default productSlice.reducer;

export const fetchCatalogProducts = (filters = {}) => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.get('/products', { params: filters });
    dispatch(fetchProductsSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to load products';
    dispatch(fetchFailure(message));
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.get(`/products/${id}`);
    dispatch(fetchProductByIdSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to load products';
    dispatch(fetchFailure(message));
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    await api.delete(`/products/${id}`);
    dispatch(removeProductSuccess(id));
    return true;
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to delete product';
    dispatch(fetchFailure(message));
    return false;
  }
};
