import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchProducts } from './services/productSearch.js';
import { getSuggestions } from './services/suggestions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Searching for: ${query}`);
    const products = await searchProducts(query);
    
    res.json({
      query,
      products: products.slice(0, 30), // Limit to top 30 results
      total: products.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search products', message: error.message });
  }
});

app.get('/api/suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query || query.trim() === '') {
      return res.json({ suggestions: [] });
    }

    const suggestions = await getSuggestions(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 DealScout Backend running on http://localhost:${PORT}`);
  console.log(`📍 API Endpoint: http://localhost:${PORT}/api/search?q=iphone`);
  console.log(`💡 Suggestions: http://localhost:${PORT}/api/suggestions?q=iph`);
});
