import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import productReducer from './slices/productSlice.js';
import cartReducer from './slices/cartSlice.js';
import ordersReducer from './slices/ordersSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import categoryReducer from './slices/categorySlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: ordersReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
  },
});

export default store;
