import axios from 'axios';

async function testML() {
  try {
    const { data } = await axios.get('https://api.mercadolibre.com/sites/MLA/search?q=iphone+15');
    
    const products = data.results.slice(0, 3).map(item => ({
      title: item.title,
      price: item.price,
      currency: item.currency_id,
      image: item.thumbnail
    }));
    
    console.log("ML Results:", products);
  } catch(e) {
    console.error("Error:", e.message);
  }
}

testML();
