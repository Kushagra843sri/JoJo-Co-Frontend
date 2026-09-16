import { createSlice } from '@reduxjs/toolkit';

const makeLineId = (productId, size, color) => `${productId}-${size}-${color}`;

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { productId, title, image, size, color, price, quantity = 1 } = action.payload;
      const id = makeLineId(productId, size, color);
      const existing = state.items.find((item) => item.id === id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id, productId, title, image, size, color, price, quantity });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
