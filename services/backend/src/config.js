/**
 * Configuration module for DealScout Backend
 */

export const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    SEARCH_WINDOW_MS: 60 * 1000, // 1 minute
    SEARCH_MAX_REQUESTS: 30,
    SUGGESTIONS_WINDOW_MS: 60 * 1000,
    SUGGESTIONS_MAX_REQUESTS: 50,
  },
  
  // Cache
  CACHE: {
    TTL: 60, // 60 seconds
    CHECK_PERIOD: 120,
  },
  
  // Validation
  VALIDATION: {
    SEARCH_MIN_LENGTH: 2,
    SEARCH_MAX_LENGTH: 100,
    SUGGESTION_MIN_LENGTH: 1,
    SUGGESTION_MAX_LENGTH: 50,
  },
  
  // API Keys
  SERPAPI_KEY: process.env.SERPAPI_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID,
  ADMIN_KEY: process.env.ADMIN_KEY,
  
  // Timeouts
  API_TIMEOUT: 15000, // 15 seconds
  
  isDevelopment: () => config.NODE_ENV === 'development',
  isProduction: () => config.NODE_ENV === 'production',
};

export default config;
