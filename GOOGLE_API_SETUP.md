# DealScout AI - Google Custom Search API Integration Guide

## 🎯 Overview

Your DealScout product comparison website now includes **Google Custom Search API integration** for real, dynamic product data. This document explains how to set it up and use it.

---

## 🔑 Step 1: Get Google API Credentials

### 1.1 Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click "Select a Project" → "New Project"
   - Name it "DealScout"
   - Click "Create"

3. Enable Custom Search API:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click on it
   - Click "ENABLE"

4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API Key (looks like: `AIzaSyD...`)
   - **Keep this secret! Don't share it publicly!**

### 1.2 Get Search Engine ID (CX)

1. Go to [Google Custom Search Engine](https://cse.google.com/cse/)
2. Click "Create"
3. Enter:
   - Sites to search: `amazon.com flipkart.com ebay.com walmart.com`
   - Search engine name: "DealScout"
   - Click "Create"

4. Go to "Setup" → "Basics"
5. Under "Details", find your **Search Engine ID** (looks like: `d1b2c3d4e5f6g7h8i9`)
6. Copy this ID

---

## 🚀 Step 2: Configure Backend with Google API

### 2.1 Update Backend .env File

Edit `/workspace/dealScout/services/backend/.env`:

```bash
PORT=5000
NODE_ENV=development

# Google Custom Search API
GOOGLE_API_KEY=AIzaSyD_YOUR_API_KEY_HERE
GOOGLE_SEARCH_ENGINE_ID=d1b2c3d4e5f6g7h8i9

# Optional: Store API Keys
AMAZON_API_KEY=optional
FLIPKART_API_KEY=optional
```

### 2.2 Verify Integration

The backend now includes:
- ✅ `services/backend/src/services/googleSearch.js` - Google API integration
- ✅ Updated `productSearch.js` - Uses Google API as primary source
- ✅ Fallback to mock data if API not configured

---

## 📱 Step 3: Test the Google API Integration

### Test 1: Check Backend Logs

Start the backend and search for a product:

```bash
cd /workspace/dealScout/services/backend
npm start
```

In the logs, you should see:
```
🔍 Searching for: iPhone
✅ Source 0: Got 10 products (from Google)
📊 Total products before dedup: 24
✨ Final results: 14 unique products
```

### Test 2: Test via cURL

```bash
# Search for products
curl "http://localhost:5000/api/search?q=iPhone+15"

# Expected response includes products from Google Search
{
  "query": "iPhone 15",
  "products": [
    {
      "id": "google-1778739721752-0",
      "title": "iPhone 15 - Product Title",
      "price": 82000,
      "image": "https://...",
      "platform": "Google Shopping",
      "url": "https://...",
      "rating": 4.5
    }
  ],
  "total": 14
}
```

### Test 3: Frontend Integration

1. Start both servers:
   ```bash
   # Terminal 1
   cd apps/web && npm run dev
   
   # Terminal 2
   cd services/backend && npm start
   ```

2. Go to `http://localhost:5173`

3. Search for any product (e.g., "iPhone 15")

4. You should see results including products from Google Search!

---

## 🔧 How It Works

### Data Flow with Google API

```
User Search Query
       ↓
  Frontend (React)
       ↓
Backend /api/search endpoint
       ↓
   ┌───┴────────────────────────┐
   ↓                            ↓
Google Custom Search API    Store APIs (Amazon, Flipkart, etc.)
   ↓                            ↓
Extract product data        Extract product data
   └───┬────────────────────────┘
       ↓
  Aggregate Results
       ↓
  Deduplicate Products
       ↓
  Sort by Price (Lowest First)
       ↓
  Return Top 30 Results
       ↓
  Frontend displays results
```

### Price Extraction

The `googleSearch.js` file automatically extracts prices from search results:

```javascript
// Finds prices like: $10.99, ₹1000, €50
const priceRegex = /[\$₹€£]?\s*(\d+(?:[.,]\d{2})?)/;

// Converts USD to INR (if needed)
if (price < 1000) {
  price = price * 82; // USD to INR
}
```

---

## ✅ TypeScript Fixes Applied

All TypeScript errors have been fixed:

### 1. ✅ Fixed Type Definitions
```typescript
// apps/web/src/types/product.ts
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  platform: string;
  url: string;
  rating?: number;
  isLowest?: boolean;
  savings?: number;
  description?: string;
  availability?: string;
  category?: string;
  source?: string;
}

export interface SearchResponse {
  query: string;
  products: Product[];
  total: number;
  timestamp?: string;
}
```

### 2. ✅ Fixed Component Props
```typescript
// apps/web/src/components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  isLowest?: boolean;
  savings?: number;
  onClick?: () => void;
}
```

### 3. ✅ Fixed Vite Environment Types
```typescript
// apps/web/src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

### 4. ✅ Fixed index.html Script Reference
```html
<!-- Changed from: src="/src/main.jsx" -->
<!-- To: src="/src/main.tsx" -->
```

---

## 🚀 Frontend Build Status

**Build Result: ✅ SUCCESS**

```
✓ 436 modules transformed.
dist/index.html                   0.55 kB │ gzip:   0.35 kB
dist/assets/index-Cdn9bBgO.css   14.38 kB │ gzip:   3.70 kB
dist/assets/index-D16N54RV.js   403.78 kB │ gzip: 132.52 kB
✓ built in 2.16s
```

**TypeScript Errors: ✅ NONE**

All TypeScript compilation errors have been resolved!

---

## 🎯 Using the Product Search

### Search Query Examples

```bash
# Electronics
curl "http://localhost:5000/api/search?q=iPhone+15+Pro"
curl "http://localhost:5000/api/search?q=Samsung+Galaxy+S24"
curl "http://localhost:5000/api/search?q=MacBook+Pro+16"

# Fashion
curl "http://localhost:5000/api/search?q=Nike+Running+Shoes"
curl "http://localhost:5000/api/search?q=Levi+Jeans"

# Home & Kitchen
curl "http://localhost:5000/api/search?q=Coffee+Maker"
curl "http://localhost:5000/api/search?q=Washing+Machine"
```

### Response Structure

```json
{
  "query": "iPhone 15",
  "products": [
    {
      "id": "google-1234567890-0",
      "title": "Apple iPhone 15 Pro Max 256GB",
      "price": 139999,
      "image": "https://example.com/image.jpg",
      "platform": "Google Shopping",
      "url": "https://shopping.google.com/...",
      "rating": 4.7,
      "source": "google"
    },
    {
      "id": "amazon-1234567890-1",
      "title": "Apple iPhone 15",
      "price": 129999,
      "image": "https://example.com/image.jpg",
      "platform": "Amazon",
      "url": "https://amazon.in/...",
      "rating": 4.8
    }
  ],
  "total": 12
}
```

---

## 📊 API Priority

The backend searches in this order:

1. **Google Custom Search API** (if configured) - Real search data
2. **Amazon API** - Store-specific prices
3. **Flipkart API** - Store-specific prices
4. **eBay API** - Store-specific prices
5. **Walmart API** - Store-specific prices
6. **Mock Data** - Fallback (always available)

---

## 🔐 Security Best Practices

### 1. Protect Your API Keys

**DO:**
- ✅ Keep API keys in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Rotate API keys regularly

**DON'T:**
- ❌ Commit API keys to GitHub
- ❌ Share API keys in messages/emails
- ❌ Expose API keys in frontend code
- ❌ Use free tier keys in production

### 2. Rate Limiting

Google Custom Search API limits:
- **Free tier**: 100 queries/day
- **Paid tier**: Up to 10,000 queries/day

For production, upgrade to paid:
- Go to Google Cloud Console
- Enable billing
- Pricing: $5 per 1,000 queries

### 3. .gitignore Setup

Make sure `.env` is in `.gitignore`:

```bash
# .env files
.env
.env.local
.env.*.local

# Don't commit API keys!
```

---

## 🐛 Troubleshooting

### Issue: "Google API not configured. Using fallback mock data."

**Cause:** `.env` file missing or API keys not set

**Solution:**
```bash
cd services/backend
# Create .env file with your API keys
cat > .env << EOF
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_cx_id_here
EOF
npm start
```

### Issue: "Invalid API Key"

**Cause:** API key is incorrect or expired

**Solution:**
1. Go to Google Cloud Console
2. Regenerate API key
3. Update `.env` file
4. Restart backend

### Issue: "No results from Google"

**Cause:** Search Engine not configured correctly

**Solution:**
1. Go to https://cse.google.com/cse/
2. Verify sites are added: amazon.com, flipkart.com, ebay.com, walmart.com
3. Copy correct Search Engine ID
4. Update `.env` file

### Issue: "403 Forbidden"

**Cause:** Rate limit exceeded or billing not set up

**Solution:**
- For free tier: Wait 24 hours for quota reset
- For production: Enable billing in Google Cloud Console

---

## 📈 Performance Optimization

### Caching Search Results

Add caching to reduce API calls:

```javascript
// Cache search results for 5 minutes
const cache = new Map();

export async function searchProductsWithCache(query) {
  if (cache.has(query)) {
    return cache.get(query);
  }
  
  const results = await searchProducts(query);
  cache.set(query, results);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(query), 5 * 60 * 1000);
  
  return results;
}
```

### Parallel API Calls

Current implementation already uses `Promise.allSettled()` for parallel API calls:

```javascript
const results = await Promise.allSettled([
  googleSearch,
  amazonSearch,
  flipkartSearch,
  ebaySearch,
  walmartSearch
]);
```

This means all APIs are called simultaneously, not sequentially!

---

## 🚀 Live Preview URLs

Your application is running at:

**Frontend (React App):**
```
https://iron-scripted-gazelle.5173.dev.raccoonai.tech
```

**Backend API:**
```
https://iron-scripted-gazelle.5000.dev.raccoonai.tech
```

**Test API:**
```
https://iron-scripted-gazelle.5000.dev.raccoonai.tech/api/search?q=iPhone
```

---

## 📝 Complete Setup Checklist

- [ ] Create Google Cloud Project
- [ ] Enable Custom Search API
- [ ] Create API Key
- [ ] Create Custom Search Engine (CSE)
- [ ] Get Search Engine ID (CX)
- [ ] Update `/services/backend/.env` with API keys
- [ ] Restart backend: `npm start`
- [ ] Test API: `curl http://localhost:5000/api/search?q=iPhone`
- [ ] Start frontend: `npm run dev`
- [ ] Test website: Visit `http://localhost:5173`
- [ ] Search for products and verify results

---

## 💡 Next Steps

1. **Get Google API credentials** (see Step 1 above)
2. **Configure backend** with your API keys
3. **Test the API** with cURL
4. **Use the website** to search for products
5. **Deploy to production** when ready

---

## 📚 Useful Links

- [Google Cloud Console](https://console.cloud.google.com)
- [Google Custom Search Engine](https://cse.google.com/cse/)
- [Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [API Pricing](https://developers.google.com/custom-search/pricing)

---

**Status:** ✅ Ready for Google API Integration
**TypeScript Errors:** ✅ All Fixed
**Frontend Build:** ✅ Successful
**Backend Syntax:** ✅ Valid
**Date:** May 14, 2026
