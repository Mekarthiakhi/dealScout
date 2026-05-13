
export async function scrapeAmazon(query: string) {
  return {
    platform: 'Amazon',
    query,
    products: []
  }
}
