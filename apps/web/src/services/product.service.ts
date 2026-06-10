import axios, { AxiosError } from 'axios';
import { Product, SearchResponse, SuggestionsResponse, ErrorResponse } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with timeout and error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout to handle Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid search query.');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The server is taking too long to respond.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
);

/**
 * Search for products
 * @param query - Search query string
 * @returns Promise containing products array and metadata
 */
export async function searchProducts(query: string): Promise<SearchResponse> {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    if (query.length > 100) {
      throw new Error('Search query is too long (max 100 characters)');
    }

    const response = await apiClient.get<SearchResponse>('/api/search', {
      params: { q: query.trim() },
    });

    // Validate and transform response
    if (!response.data.products || !Array.isArray(response.data.products)) {
      throw new Error('Invalid response format from server');
    }

    // Filter out invalid products
    const validProducts = response.data.products.filter((product) => {
      return (
        product.id &&
        product.title &&
        typeof product.price === 'number' &&
        product.price >= 0 &&
        product.platform &&
        product.url
      );
    });

    return {
      query: response.data.query,
      products: validProducts,
      total: validProducts.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to search products'
      );
    }
    throw error;
  }
}

/**
 * Get product suggestions
 * @param query - Partial search query
 * @returns Promise containing suggestions array
 */
export async function getSuggestions(query: string): Promise<string[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (query.length > 50) {
      return [];
    }

    const response = await apiClient.get<SuggestionsResponse>('/api/suggestions', {
      params: { q: query.trim() },
    });

    if (!response.data.suggestions || !Array.isArray(response.data.suggestions)) {
      return [];
    }

    return response.data.suggestions.slice(0, 8); // Limit to 8 suggestions
  } catch (error) {
    console.error('Suggestions error:', error);
    return []; // Return empty array on error to prevent UI breakage
  }
}

/**
 * Check API health
 * @returns Promise<boolean> indicating if API is healthy
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health', {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Format price for display
 * @param price - Price number
 * @param currency - Currency symbol (default ₹)
 */
export function formatPrice(price: number, currency = '₹'): string {
  return `${currency}${price.toLocaleString()}`;
}

/**
 * Calculate savings between two prices
 * @param originalPrice - Original price
 * @param currentPrice - Current price
 * @returns Savings amount and percentage
 */
export function calculateSavings(originalPrice: number, currentPrice: number) {
  const savings = originalPrice - currentPrice;
  const percentage = ((savings / originalPrice) * 100).toFixed(1);
  return { savings, percentage };
}

/**
 * Sort products by field
 * @param products - Array of products
 * @param sortBy - Field to sort by (price, rating)
 * @param order - Sort order (asc, desc)
 */
export function sortProducts(
  products: Product[],
  sortBy: 'price' | 'rating' = 'price',
  order: 'asc' | 'desc' = 'asc'
): Product[] {
  const sorted = [...products];

  if (sortBy === 'price') {
    sorted.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
  } else if (sortBy === 'rating') {
    sorted.sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      return order === 'asc' ? aRating - bRating : bRating - aRating;
    });
  }

  return sorted;
}

/**
 * Filter products by platform
 * @param products - Array of products
 * @param platform - Platform name
 */
export function filterByPlatform(products: Product[], platform: string): Product[] {
  if (platform === 'All') return products;
  return products.filter((p) => p.platform === platform);
}

export default {
  searchProducts,
  getSuggestions,
  checkAPIHealth,
  formatPrice,
  calculateSavings,
  sortProducts,
  filterByPlatform,
};
