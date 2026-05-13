export async function searchProducts(
  query: string
) {
  const response = await fetch(
    `http://localhost:5000/api/search?q=${query}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch products"
    );
  }

  return response.json();
}