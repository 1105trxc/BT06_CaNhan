import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_URL = `${API_BASE}/orders`;

const buildAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const checkoutCOD = createAsyncThunk('orders/checkoutCOD', async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/checkout`, payload, buildAuthConfig());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMyOrders = createAsyncThunk('orders/getMyOrders', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/my`, buildAuthConfig());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getOrderDetails = createAsyncThunk('orders/getOrderDetails', async (orderId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`, buildAuthConfig());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async ({ orderId, reason }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/${orderId}/cancel`, { reason }, buildAuthConfig());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    selectedOrder: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
  },
  reducers: {
    resetOrderState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutCOD.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkoutCOD.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedOrder = action.payload.data;
      })
      .addCase(checkoutCOD.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orders = action.payload.data;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedOrder = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedOrder = action.payload.data;
        state.orders = state.orders.map((order) =>
          order._id === action.payload.data._id ? action.payload.data : order
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
