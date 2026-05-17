import axios from 'axios';

async function testSerpApi() {
  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: "iphone",
        api_key: "3062fbaac0c3405ea1e10658b19b04d677fe594f88d",
        gl: "in",
        hl: "en",
      },
    });
    console.log("SerpAPI Success. Items found:", response.data.shopping_results?.length);
  } catch (error) {
    console.error("SerpAPI Error:", error.response?.data || error.message);
  }
}

testSerpApi();
