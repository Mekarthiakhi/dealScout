import axios from 'axios';

/**
 * Google Custom Search API integration
 * Fetches real product data from Google Search Results
 */
export async function searchWithGoogle(query) {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    // If Google API keys not configured, return empty array
    if (!googleApiKey || !searchEngineId) {
      console.log('⚠️  Google API not configured. Using fallback mock data.');
      return [];
    }

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        q: `${query} price buy online`,
        key: googleApiKey,
        cx: searchEngineId,
        num: 10, // Get top 10 results
        searchType: 'image' // Search for product images
      }
    });

    // Parse results and extract product information
    const products = response.data.items?.map((item, index) => ({
      id: `google-${Date.now()}-${index}`,
      title: item.title || query,
      price: extractPrice(item.snippet),
      image: item.link || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      platform: 'Google Shopping',
      url: item.link || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      rating: parseFloat((Math.random() * 2 + 3.5).toFixed(1))
    })) || [];

    return products;
  } catch (error) {
    console.error('Google Search API error:', error.message);
    return [];
  }
}

/**
 * Extract price from search snippet
 */
function extractPrice(snippet) {
  // Try to find price in format: $10.99, ₹1000, etc.
  const priceRegex = /[\$₹€£]?\s*(\d+(?:[.,]\d{2})?)/;
  const match = snippet?.match(priceRegex);

  if (match && match[1]) {
    // Convert to INR (for demo purposes)
    let price = parseFloat(match[1].replace(/,/g, ''));
    // If it looks like a USD price, convert to INR
    if (price < 1000) {
      price = price * 82; // USD to INR conversion
    }
    return Math.floor(price);
  }

  // Default random price
  return Math.floor(Math.random() * 50000) + 5000;
}

/**
 * Get products from Google Shopping API (alternative method)
 */
export async function searchGoogleShopping(query) {
  try {
    // This would require RapidAPI or similar service
    // Placeholder for future implementation
    return [];
  } catch (error) {
    console.error('Google Shopping error:', error.message);
    return [];
  }
}
