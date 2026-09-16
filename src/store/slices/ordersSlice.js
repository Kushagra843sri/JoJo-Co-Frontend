import { createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  orders: [],
  isLoading: false,
  error: null,
  myOrders: [],
  isMyOrdersLoading: false,
  myOrdersError: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateOrderSuccess: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex((order) => order._id === updatedOrder._id);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
      state.isLoading = false;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    fetchMyOrdersStart: (state) => {
      state.isMyOrdersLoading = true;
      state.myOrdersError = null;
    },
    fetchMyOrdersSuccess: (state, action) => {
      state.myOrders = action.payload;
      state.isMyOrdersLoading = false;
      state.myOrdersError = null;
    },
    fetchMyOrdersFailure: (state, action) => {
      state.myOrdersError = action.payload;
      state.isMyOrdersLoading = false;
    },
  },
});

export const {
  fetchStart,
  fetchOrdersSuccess,
  updateOrderSuccess,
  fetchFailure,
  fetchMyOrdersStart,
  fetchMyOrdersSuccess,
  fetchMyOrdersFailure,
} = ordersSlice.actions;
export default ordersSlice.reducer;

export const fetchMyOrders = () => async (dispatch) => {
  dispatch(fetchMyOrdersStart());
  try {
    const { data } = await api.get('/orders/my');
    dispatch(fetchMyOrdersSuccess(data.orders));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch your orders';
    dispatch(fetchMyOrdersFailure(message));
  }
};

export const fetchAllOrders = () => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.get('/orders');
    dispatch(fetchOrdersSuccess(data.orders));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch orders';
    dispatch(fetchFailure(message));
  }
};

export const updateOrderStatus = ({ id, status }) => async (dispatch) => {
  dispatch(fetchStart());
  try {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    dispatch(updateOrderSuccess(data));
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update order status';
    dispatch(fetchFailure(message));
  }
};
