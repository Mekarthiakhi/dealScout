/**
 * Product interface for DealScout
 * Represents a product from an online store with pricing and details
 */
export interface Product {
  // Required fields
  id: string;                    // Unique identifier for the product
  title: string;                 // Product name/title
  price: number;                 // Price in INR (or local currency)
  image: string;                 // Product image URL
  platform: string;              // Online store name (Amazon, Flipkart, etc.)
  url: string;                   // Direct product URL on the store
  
  // Optional fields
  rating?: number;               // Store/product rating (0-5 stars)
  isLowest?: boolean;            // Is this the lowest price?
  savings?: number;              // Amount saved compared to highest price
  description?: string;          // Product description
  availability?: string;         // Availability status (In Stock, Out of Stock)
  category?: string;             // Product category
  source?: string;               // Source of product data
}

/**
 * Search response from the API
 */
export interface SearchResponse {
  query: string;
  products: Product[];
  total: number;
  timestamp?: string;
}

/**
 * Suggestions response from the API
 */
export interface SuggestionsResponse {
  suggestions: string[];
}

/**
 * Error response from the API
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: number;
}