import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_URL = `${API_BASE}/cart`;

const buildAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getCart = createAsyncThunk('cart/getCart', async (_, thunkAPI) => {
  try {
    const config = buildAuthConfig();
    if (!config) throw new Error('Vui lòng đăng nhập để xem giỏ hàng');
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (payload, thunkAPI) => {
  try {
    const config = buildAuthConfig();
    if (!config) throw new Error('Vui lòng đăng nhập để thêm vào giỏ');
    const response = await axios.post(`${API_URL}/items`, payload, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, updates }, thunkAPI) => {
  try {
    const config = buildAuthConfig();
    if (!config) throw new Error('Vui lòng đăng nhập để cập nhật giỏ');
    const response = await axios.put(`${API_URL}/items/${itemId}`, updates, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, thunkAPI) => {
  try {
    const config = buildAuthConfig();
    if (!config) throw new Error('Vui lòng đăng nhập để xoá sản phẩm');
    const response = await axios.delete(`${API_URL}/items/${itemId}`, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    const config = buildAuthConfig();
    if (!config) throw new Error('Vui lòng đăng nhập để làm trống giỏ');
    const response = await axios.delete(`${API_URL}/clear`, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
  },
  reducers: {
    resetCartState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.data;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.data;
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.data;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.data;
      })
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.data;
      })
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
