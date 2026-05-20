import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_URL = `${API_BASE}/products`;

export const getHomeProducts = createAsyncThunk(
  'products/getHomeProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/home`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ queryParams }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/search?${queryParams}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTopProducts = createAsyncThunk(
  'products/getTopProducts',
  async ({ type }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/top?type=${type}`);
      return { type, payload: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'products/getProductDetails',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, thunkAPI) => {
    try {
  const response = await axios.get(`${API_BASE}/categories`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    homeProducts: {
      newProducts: [],
      bestSelling: [],
      promotional: []
    },
    topProducts: {
      bestSelling: [],
      mostViewed: []
    },
    categories: [],
    searchResults: null,
    searchPagination: null,
    currentProduct: null,
    similarProducts: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
  },
  reducers: {
    resetProductState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
      state.searchPagination = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getHomeProducts
      .addCase(getHomeProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomeProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.homeProducts = action.payload.data;
      })
      .addCase(getHomeProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // searchProducts
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.meta.arg?.append) {
          state.searchResults = [...(state.searchResults || []), ...action.payload.data];
        } else {
          state.searchResults = action.payload.data;
        }
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // getTopProducts
      .addCase(getTopProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTopProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.type === 'most_viewed') {
          state.topProducts.mostViewed = action.payload.payload.data;
        } else {
          state.topProducts.bestSelling = action.payload.payload.data;
        }
      })
      .addCase(getTopProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // getProductDetails
      .addCase(getProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProduct = action.payload.data.product;
        state.similarProducts = action.payload.data.similarProducts;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // getCategories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categories = action.payload.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetProductState, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
