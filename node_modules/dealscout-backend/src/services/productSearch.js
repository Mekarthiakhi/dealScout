import axios from 'axios';
import { getMockProducts } from './stores/mock.js';

/**
 * Determine if a product is a main product (phone) or an accessory
 */
function isMainProduct(title, price) {
  const titleLower = title.toLowerCase();
  
  // Phones/Main Products - typically cost more
  const phoneKeywords = /iphone|samsung|xiaomi|redmi|oneplus|realme|poco|motorola|nokia|pixel|galaxy|vivo|oppo|huawei|htc|sony|asus|lg|micromax|honor|nothing|tecno|infinix|zte|google pixel|oneplus|nord|pro|max|ultra|plus|turbo|note/i;
  
  // Accessories that should be filtered out
  const accessoryKeywords = /case|cover|protector|screen guard|tempered glass|cable|charger|adapter|silicone|foil|film|screen protector|hard case|soft case|flip case|book case|stand|mount|holder|strap|belt|pouch|sleeve|bag|back cover|bumper|shell|skin|anti-glare|matte|privacy|blue light|glass protector|privacy filter|charging dock|earbuds|headphone|speaker|warranty|protection|glass screen|foil cover|rear cover|front cover|flip cover/i;
  
  // If it matches phone keywords, it's likely a main product
  if (phoneKeywords.test(titleLower)) {
    return true;
  }
  
  // If it matches accessory keywords, it's likely an accessory
  if (accessoryKeywords.test(titleLower)) {
    return false;
  }
  
  // Price-based heuristic: phones are expensive (typically > 5000 INR)
  // Accessories are usually < 2000 INR
  if (price > 5000) {
    return true; // Likely a phone based on price
  }
  
  if (price < 2000) {
    return false; // Likely an accessory based on price
  }
  
  // Default to true if unclear (give benefit of doubt)
  return true;
}

/**
 * Search for products using real-time Google Shopping data via SerpApi.
 * Falls back to mock data if the API key is not configured.
 */
export async function searchProducts(query) {
  try {
    console.log(`🔍 Searching for real products: ${query}`);
    const SERPAPI_KEY_ENV = process.env.SERPAPI_KEY;

    // 1. Check if the user has provided a real SerpApi key
    if (SERPAPI_KEY_ENV && SERPAPI_KEY_ENV !== 'your_serpapi_key_here') {
      const keys = SERPAPI_KEY_ENV.split(',').map(k => k.trim()).filter(k => k);
      let shoppingResults = null;
      let lastApiError = null;

      // Try each key in sequence until one works
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        try {
          console.log(`📡 Fetching from SerpApi (using key ${i + 1} of ${keys.length})...`);
          const response = await axios.get("https://serpapi.com/search.json", {
            params: {
              engine: "google_shopping",
              q: query,
              api_key: currentKey,
              gl: "in", // Location: India (returns ₹ prices)
              hl: "en", // Language: English
            },
          });
          shoppingResults = response.data.shopping_results || [];
          break; // Success! Exit the loop
        } catch(apiError) {
          console.error(`❌ SerpApi Error on key ${i + 1}:`, apiError.message);
          lastApiError = apiError;
          // Loop will continue to the next key
        }
      }

      if (shoppingResults && shoppingResults.length > 0) {
          // 3. Map the real data to our UI format
          const products = shoppingResults.map((item, index) => {
             // Extract numeric price. Remove ₹, commas, etc.
             let extractedPrice = 0;
             if (item.extracted_price) {
                extractedPrice = item.extracted_price;
             } else if (item.price) {
                const numStr = String(item.price).replace(/[^\d.]/g, "");
                extractedPrice = Number(numStr) || 0;
             }

             return {
                id: `real-${Date.now()}-${index}`,
                title: item.title || query,
                price: extractedPrice,
                image: item.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
                platform: item.source || "Web Store",
                url: item.link || item.product_link || (item.merchants && item.merchants[0]?.link) || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
                rating: item.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)) // fallback rating if missing
             };
          });
          
          // Smart AI Accessory & Main Product Filter: 
          // Remove accessories UNLESS user explicitly searched for them
          const isLookingForAccessory = /case|cover|protector|screen guard|glass|cable|charger|adapter|tempered|foil|film|stand|mount|holder|strap|belt/i.test(query);

          let validProducts = products.filter(p => {
             if (p.price <= 0) return false;
             
             // Use intelligent product detection
             if (!isLookingForAccessory) {
                // If user is NOT looking for accessories, only show main products
                if (!isMainProduct(p.title, p.price)) {
                   return false; // Remove accessory
                }
             }
             
             return true;
          });
          
          const unique = [];
          const seen = new Set();
          
          validProducts.forEach(product => {
            const key = `${product.platform}-${Math.floor(product.price)}`;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(product);
            }
          });

          // Sort by lowest price first
          unique.sort((a, b) => a.price - b.price);
          
          console.log(`✅ Success: Found ${unique.length} real products!`);
          return unique;
        } else {
            console.log('⚠️ SerpApi returned no products (or all keys failed). Using fallback.');
        }
    } else {
        console.log('⚠️ SERPAPI_KEY missing or invalid. Using mock fallback data.');
    }

    // Fallback: If no API key or request fails, return mock data
    const mockData = getMockProducts(query);
    mockData.sort((a, b) => a.price - b.price);
    return mockData;

  } catch (error) {
    console.error('Search products error:', error);
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
