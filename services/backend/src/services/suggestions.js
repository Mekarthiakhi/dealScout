/**
 * Generate search suggestions based on popular products
 */
export async function getSuggestions(query) {
  const allSuggestions = [
    // Electronics
    'iPhone 15', 'iPhone 15 Pro', 'Samsung Galaxy S24', 'Pixel 8',
    'MacBook Pro', 'MacBook Air', 'Dell XPS', 'HP Pavilion',
    'iPad Pro', 'Samsung Tab', 'iPad Air',
    'Apple Watch', 'Samsung Watch', 'Fitbit',
    'Sony Headphones', 'Bose', 'Apple AirPods',
    
    // Fashion
    'Nike Shoes', 'Adidas Shoes', 'Puma Shoes', 'Running Shoes',
    'T-Shirt', 'Jeans', 'Jacket', 'Sneakers',
    'Casual Shoes', 'Formal Shoes', 'Boots',
    
    // Home & Kitchen
    'Coffee Maker', 'Blender', 'Mixer', 'Microwave',
    'Refrigerator', 'Washing Machine', 'Vacuum Cleaner',
    'Lamp', 'Fan', 'Heater',
    
    // Sports
    'Yoga Mat', 'Dumbbells', 'Treadmill', 'Bicycle',
    'Cricket Bat', 'Badminton Racket', 'Tennis Racket',
    
    // Books
    'Self Help Books', 'Fiction', 'Mystery', 'Romance'
  ];

  // Filter suggestions based on query
  const lowercaseQuery = query.toLowerCase();
  const filtered = allSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(lowercaseQuery) ||
    lowercaseQuery.split(' ').some(word => suggestion.toLowerCase().includes(word))
  );

  // If not enough matches, add fuzzy matches
  if (filtered.length < 3) {
    const fuzzy = allSuggestions.filter(suggestion => {
      const suggestionWords = suggestion.toLowerCase().split(' ');
      return suggestionWords.some(word => 
        word.startsWith(lowercaseQuery.charAt(0))
      );
    });
    filtered.push(...fuzzy);
  }

  // Return top 8 unique suggestions
  return [...new Set(filtered)].slice(0, 8);
}
