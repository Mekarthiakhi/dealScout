import axios from 'axios';

async function testDummy() {
  try {
    const { data } = await axios.get('https://dummyjson.com/products/search?q=iphone');
    console.log("DummyJSON Results:", data.products.slice(0, 3).map(p => p.title));
  } catch(e) {
    console.error("Error:", e.message);
  }
}

testDummy();
