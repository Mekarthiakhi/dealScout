import axios from 'axios';
import { searchAmazon } from './stores/amazon.js';
import { searchFlipkart } from './stores/flipkart.js';
import { searchEbay } from './stores/ebay.js';
import { searchWalmart } from './stores/walmart.js';
import { getMockProducts } from './stores/mock.js';
import { searchWithGoogle } from './googleSearch.js';

/**
 * Search for products across multiple stores and return the best deals
 * Includes real Google API integration for dynamic product search
 */
export async function searchProducts(query) {
  try {
    console.log(`🔍 Searching for: ${query}`);

    // Try to fetch from real stores with fallback to mock data
    const storeSearches = [
      // Try Google Custom Search API first (real data)
      searchWithGoogle(query).catch(e => {
        console.warn('Google Search failed:', e.message);
        return [];
      }),
      
      // Try store-specific APIs
      searchAmazon(query).catch(e => {
        console.warn('Amazon search failed:', e.message);
        return [];
      }),
      searchFlipkart(query).catch(e => {
        console.warn('Flipkart search failed:', e.message);
        return [];
      }),
      searchEbay(query).catch(e => {
        console.warn('eBay search failed:', e.message);
        return [];
      }),
      searchWalmart(query).catch(e => {
        console.warn('Walmart search failed:', e.message);
        return [];
      }),
      
      // Always include mock data as fallback
      getMockProducts(query)
    ];

    const results = await Promise.allSettled(storeSearches);
    
    // Collect all products from successful searches
    let allProducts = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        console.log(`✅ Source ${index}: Got ${result.value.length} products`);
        allProducts = allProducts.concat(result.value);
      }
    });

    console.log(`📊 Total products before dedup: ${allProducts.length}`);

    // If no real results, use mock data
    if (allProducts.length === 0) {
      console.log('⚠️  No real results found, using mock data');
      allProducts = getMockProducts(query);
    }

    // Sort by price (lowest first)
    allProducts.sort((a, b) => a.price - b.price);

    // Remove duplicates (same title and similar price)
    const unique = [];
    const seen = new Set();
    
    allProducts.forEach(product => {
      const key = `${product.title.toLowerCase()}-${Math.floor(product.price / 1000)}k`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(product);
      }
    });

    console.log(`✨ Final results: ${unique.length} unique products`);
    return unique;
  } catch (error) {
    console.error('Search products error:', error);
    // Return mock data as fallback
    return getMockProducts(query);
  }
}

/**
 * Get the best deal for a specific product
 */
export function getBestDeal(products) {
  if (!products || products.length === 0) return null;
  return products[0]; // Already sorted by price
}
