/**
 * Search Flipkart for products
 */
export async function searchFlipkart(query) {
  try {
    // Mock Flipkart products with real-like data
    const flipkartProducts = [
      {
        id: `flipkart-${Date.now()}-1`,
        title: `${query} - Exclusive on Flipkart`,
        price: Math.floor(Math.random() * 48000) + 6000,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
        platform: 'Flipkart',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 3.8).toFixed(1))
      },
      {
        id: `flipkart-${Date.now()}-2`,
        title: `${query} - Super Saver on Flipkart`,
        price: Math.floor(Math.random() * 45000) + 4000,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
        platform: 'Flipkart',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 4).toFixed(1))
      }
    ];

    return flipkartProducts;
  } catch (error) {
    console.error('Flipkart search error:', error.message);
    return [];
  }
}
