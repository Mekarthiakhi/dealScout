# DealScout AI - Product Comparison API Documentation

## 🎯 Overview

DealScout AI is a real-time product comparison platform that aggregates prices from multiple online stores and identifies the best deals available. The system consists of:

- **Backend API** (Node.js/Express) running on port 5000
- **Frontend** (React/Vite) running on port 5173
- **Multi-store integration** (Amazon, Flipkart, eBay, Walmart, Best Buy, Newegg)

---

## 🚀 Quick Start

### Backend API Setup

```bash
cd services/backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd apps/web
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Environment Variables

Create `.env` file in `apps/web/`:
```
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### 1. Search Products

**Endpoint:** `GET /api/search`

**Description:** Search for products across multiple online stores and get the best deals.

**Query Parameters:**
- `q` (required): Search query (e.g., "iPhone 15", "Nike Shoes")

**Example Request:**
```bash
curl "http://localhost:5000/api/search?q=iPhone+15"
```

**Example Response:**
```json
{
  "query": "iPhone 15",
  "products": [
    {
      "id": "walmart-1778739721752-2",
      "title": "iPhone 15 - Everyday Low Prices on Walmart",
      "price": 10077,
      "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      "platform": "Walmart",
      "url": "https://www.walmart.com/search?q=iPhone+15",
      "rating": 4.3
    },
    {
      "id": "flipkart-1778739721752-1",
      "title": "iPhone 15 - Best Price Guarantee",
      "price": 11499,
      "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
      "platform": "Flipkart",
      "url": "https://www.flipkart.com/search?q=iPhone+15",
      "rating": 4.7
    }
  ],
  "total": 14
}
```

**Response Fields:**
- `id`: Unique product identifier
- `title`: Product name/title
- `price`: Price in INR (or local currency)
- `image`: Product image URL
- `platform`: Online store name
- `url`: Direct link to product on the store
- `rating`: Store/product rating (0-5 stars)

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad request (missing query parameter)
- `500`: Server error

---

### 2. Search Suggestions

**Endpoint:** `GET /api/suggestions`

**Description:** Get search suggestions based on popular products.

**Query Parameters:**
- `q` (required): Partial search query

**Example Request:**
```bash
curl "http://localhost:5000/api/suggestions?q=iph"
```

**Example Response:**
```json
{
  "suggestions": [
    "iPhone 15",
    "iPhone 15 Pro",
    "iPad Pro",
    "iPad Air"
  ]
}
```

**HTTP Status Codes:**
- `200`: Success (returns empty array if no matches)

---

### 3. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API server is running.

**Example Request:**
```bash
curl "http://localhost:5000/health"
```

**Example Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-05-14T06:23:12.991869+00:00"
}
```

---

## 🏗️ Architecture

### Directory Structure

```
dealScout/
├── apps/
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── App.tsx         # Main app component
│       │   ├── components/     # React components
│       │   ├── services/       # API services
│       │   ├── types/          # TypeScript types
│       │   └── index.css       # Tailwind CSS
│       └── package.json
│
├── services/
│   └── backend/                # Express backend
│       ├── src/
│       │   ├── index.js        # Main server
│       │   ├── services/
│       │   │   ├── productSearch.js
│       │   │   ├── suggestions.js
│       │   │   └── stores/
│       │   │       ├── amazon.js
│       │   │       ├── flipkart.js
│       │   │       ├── ebay.js
│       │   │       ├── walmart.js
│       │   │       └── mock.js
│       └── package.json
│
└── README.md
```

---

## 🔧 How It Works

### Product Search Flow

1. **User Input** → Frontend (React)
2. **API Request** → Backend `/api/search` endpoint
3. **Multi-Store Search** → Parallel requests to:
   - Amazon
   - Flipkart
   - eBay
   - Walmart
   - Best Buy
   - Newegg
4. **Data Aggregation** → Combine and deduplicate results
5. **Price Sorting** → Sort by lowest price first
6. **Response** → Return top 30 best deals to frontend

### Duplicate Removal

Products are deduplicated based on:
- Exact title match (case-insensitive)
- Price range (within ±1000 rupees)

This ensures users don't see the same product listed multiple times.

### Best Deal Highlighting

The product with the lowest price is automatically marked with a "🔥 Best Deal" badge.

---

## 🛒 Supported Online Stores

| Store | Status | Integration |
|-------|--------|-------------|
| Amazon | ✅ Active | API + Mock |
| Flipkart | ✅ Active | API + Mock |
| eBay | ✅ Active | API + Mock |
| Walmart | ✅ Active | API + Mock |
| Best Buy | ✅ Active | Mock (Ready for real API) |
| Newegg | ✅ Active | Mock (Ready for real API) |

**Note:** Currently using enhanced mock data. To integrate real APIs:
- Use RapidAPI for product search
- Configure store-specific API keys
- Update `services/backend/src/services/stores/` files

---

## 🎨 Frontend Features

### UI Components

1. **Search Bar**
   - Real-time suggestions
   - Keyboard navigation (↑↓ to navigate, Enter to select)
   - Glass-morphism design with cyan/blue gradient

2. **Product Cards**
   - Product image, title, price
   - Store rating (⭐)
   - "Best Deal" badge for lowest price
   - Direct link to store

3. **Product Modal**
   - Detailed product information
   - Store rating and price display
   - AI Deal Summary
   - View Deal button (links to store)

4. **Sort Options**
   - Price: Low to High
   - Price: High to Low
   - Rating

### Design System

- **Color Palette**: Deep navy gradient background, cyan/blue accents
- **Glass-morphism**: Frosted glass effect on cards
- **Typography**: Modern, readable fonts
- **Animations**: Smooth transitions and hover effects

---

## 📊 Data Structure

### Product Object

```typescript
interface Product {
  id: string;              // Unique identifier
  title: string;           // Product name
  price: number;           // Price in INR
  image: string;           // Product image URL
  platform: string;        // Store name
  url: string;            // Direct product link
  rating?: number;        // Store/product rating (0-5)
  isLowest?: boolean;     // Is this the lowest price?
}
```

### API Response Structure

```typescript
interface SearchResponse {
  query: string;          // Original search query
  products: Product[];    // Array of products
  total: number;          // Total results count
}

interface SuggestionsResponse {
  suggestions: string[];  // Array of suggested searches
}
```

---

## 🔐 Error Handling

### Error Responses

```json
{
  "error": "Error message description",
  "message": "Detailed error information"
}
```

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Query parameter is required" | 400 | Empty search query | Provide search term |
| "Failed to search products" | 500 | Server error | Check backend logs |
| "API unreachable" | 500 | Backend down | Start backend server |

---

## 📈 Performance Optimization

### Caching Strategy

- Search results are cached for 5 minutes
- Suggestions are pre-generated from popular products
- Images are lazy-loaded on frontend

### Database Considerations

For production, implement:
- PostgreSQL for product cache
- Redis for search suggestions
- Elasticsearch for full-text search

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
cd apps/web
npm run build

# Deploy dist folder
```

### Backend Deployment (Heroku/Railway/AWS)

```bash
# Set environment variables
VITE_API_URL=https://your-backend-domain.com

# Deploy services/backend folder
npm start
```

---

## 🔄 Real API Integration Guide

### Adding Amazon Product Advertising API

1. **Get API Credentials**
   - Access Key ID
   - Secret Access Key
   - Partner Tag

2. **Install SDK**
   ```bash
   npm install paapi5-nodejs-sdk
   ```

3. **Update `services/backend/src/services/stores/amazon.js`**
   ```javascript
   import { DefaultClient, SearchItemsRequest } from 'paapi5-nodejs-sdk';
   
   export async function searchAmazon(query) {
     const client = new DefaultClient();
     const request = new SearchItemsRequest();
     // ... implementation
   }
   ```

### Adding Google Custom Search API

1. **Get API Key**
   - Visit Google Cloud Console
   - Enable Custom Search API
   - Get API key

2. **Update `services/backend/src/services/productSearch.js`**
   ```javascript
   const googleSearchKey = process.env.GOOGLE_SEARCH_API_KEY;
   const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
   ```

---

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
AMAZON_API_KEY=your_api_key
FLIPKART_API_KEY=your_api_key
EBAY_API_KEY=your_api_key
WALMART_API_KEY=your_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Debugging

### Enable Verbose Logging

Backend:
```bash
NODE_DEBUG=* npm start
```

Frontend (Browser Console):
```javascript
localStorage.setItem('debug', '*');
```

### Common Issues

**Issue:** "Cannot GET /api/search"
- **Cause:** Backend not running
- **Solution:** `cd services/backend && npm start`

**Issue:** "CORS error"
- **Cause:** Frontend and backend on different origins
- **Solution:** Update `VITE_API_URL` in frontend `.env`

**Issue:** "No products returned"
- **Cause:** Store APIs down or rate limited
- **Solution:** Check backend logs, verify API credentials

---

## 📱 Usage Examples

### JavaScript/Fetch

```javascript
const API_URL = 'http://localhost:5000';

// Search products
async function searchProducts(query) {
  const response = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  console.log(data.products);
}

// Get suggestions
async function getSuggestions(query) {
  const response = await fetch(
    `${API_URL}/api/suggestions?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  console.log(data.suggestions);
}

// Usage
searchProducts('iPhone 15');
getSuggestions('iph');
```

### cURL Examples

```bash
# Search
curl "http://localhost:5000/api/search?q=iPhone+15"

# Get suggestions
curl "http://localhost:5000/api/suggestions?q=iph"

# Health check
curl "http://localhost:5000/health"
```

---

## 📞 Support & Troubleshooting

### Check Backend Status
```bash
curl http://localhost:5000/health
```

### View Backend Logs
```bash
cd services/backend
npm start
# Logs will show in terminal
```

### Test API Endpoints
- Use Postman or Insomnia
- Import API endpoints
- Set query parameters
- Send requests

---

## 🎯 Future Enhancements

- [ ] Real-time price tracking notifications
- [ ] User wishlists and price alerts
- [ ] Product reviews aggregation
- [ ] Historical price charts
- [ ] Mobile app (React Native)
- [ ] Advanced filters (brand, specs, etc.)
- [ ] AI-powered recommendations
- [ ] Multi-language support

---

## 📄 License

DealScout AI is open source and available under the MIT License.

---

## 👨‍💻 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push
5. Create a Pull Request

---

**Last Updated:** May 14, 2026
**API Version:** 1.0.0
