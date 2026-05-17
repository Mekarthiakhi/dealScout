const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function searchProducts(query: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Map the response to ensure product structure is correct
    return {
      products: (data.products || []).map((product: any) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        platform: product.platform,
        url: product.url,
        rating: product.rating || 0
      })),
      query: data.query,
      total: data.total || 0
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}