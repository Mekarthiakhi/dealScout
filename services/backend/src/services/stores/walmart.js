/**
 * Search Walmart for products
 */
export async function searchWalmart(query) {
  try {
    // Mock Walmart products
    const walmartProducts = [
      {
        id: `walmart-${Date.now()}-1`,
        title: `${query} - Rollback Prices on Walmart`,
        price: Math.floor(Math.random() * 46000) + 5000,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
        platform: 'Walmart',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 3.9).toFixed(1))
      },
      {
        id: `walmart-${Date.now()}-2`,
        title: `${query} - Everyday Low Prices on Walmart`,
        price: Math.floor(Math.random() * 44000) + 4500,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
        platform: 'Walmart',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 3.6).toFixed(1))
      }
    ];

    return walmartProducts;
  } catch (error) {
    console.error('Walmart search error:', error.message);
    return [];
  }
}
