import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchProducts } from '../../services/product.service';
import { Product } from '../../types/product';

interface SearchState {
  query: string;
  products: Product[];
  loading: boolean;
  error: string | null;
  suggestions: string[];
  activeStoreFilter: string;
  sortBy: string;
}

const initialState: SearchState = {
  query: '',
  products: [],
  loading: false,
  error: null,
  suggestions: [],
  activeStoreFilter: 'All',
  sortBy: 'low',
};

// Async thunk for searching products
export const fetchProductsAsync = createAsyncThunk(
  'search/fetchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const data = await searchProducts(query);
      return data.products || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

// Async thunk for fetching suggestions
export const fetchSuggestionsAsync = createAsyncThunk(
  'search/fetchSuggestions',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) return [];
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch suggestions');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setActiveStoreFilter: (state, action: PayloadAction<string>) => {
      state.activeStoreFilter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    }
  },
  extraReducers: (builder) => {
    // Search Products
    builder.addCase(fetchProductsAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.activeStoreFilter = 'All'; // Reset filter on new search
    });
    builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProductsAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Suggestions
    builder.addCase(fetchSuggestionsAsync.fulfilled, (state, action) => {
      state.suggestions = action.payload;
    });
    builder.addCase(fetchSuggestionsAsync.rejected, (state) => {
      state.suggestions = [];
    });
  },
});

export const { setQuery, setActiveStoreFilter, setSortBy, clearSuggestions } = searchSlice.actions;

export default searchSlice.reducer;
