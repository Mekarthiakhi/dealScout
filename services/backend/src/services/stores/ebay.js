/**
 * Search eBay for products
 */
export async function searchEbay(query) {
  try {
    // Mock eBay products
    const ebayProducts = [
      {
        id: `ebay-${Date.now()}-1`,
        title: `${query} - Great Deals on eBay`,
        price: Math.floor(Math.random() * 52000) + 7000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        platform: 'eBay',
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 3.7).toFixed(1))
      },
      {
        id: `ebay-${Date.now()}-2`,
        title: `${query} - Auction & Buy It Now on eBay`,
        price: Math.floor(Math.random() * 50000) + 5500,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
        platform: 'eBay',
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        rating: parseFloat((Math.random() * 2 + 4.1).toFixed(1))
      }
    ];

    return ebayProducts;
  } catch (error) {
    console.error('eBay search error:', error.message);
    return [];
  }
}
