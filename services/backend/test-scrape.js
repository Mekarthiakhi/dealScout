import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScraping() {
  try {
    console.log("Testing eBay...");
    const { data } = await axios.get('https://www.ebay.com/sch/i.html?_nkw=iphone+15', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const $ = cheerio.load(data);
    const products = [];
    $('.s-item').each((i, el) => {
      if(i > 5) return;
      const title = $(el).find('.s-item__title').text();
      const priceText = $(el).find('.s-item__price').text();
      if(title && priceText && title !== "Shop on eBay") {
        products.push({ title, price: priceText });
      }
    });
    console.log("eBay Results:", products.slice(0, 3));
  } catch(e) {
    console.error("eBay Error:", e.message);
  }
}

testScraping();
