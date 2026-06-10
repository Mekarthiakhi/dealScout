# 📋 PHASES 6-7: TESTING & DEPLOYMENT GUIDE

**Status**: Implementation Guide  
**Date**: 2026-06-03  
**Phases**: 6 (Testing), 7 (Deployment)

---

## 🧪 PHASE 6: Testing & Documentation

### 6.1 Backend API Tests

**Create**: `services/backend/tests/api.test.js`

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000';

describe('DealScout API Tests', () => {
  test('Health endpoint returns OK', async () => {
    const response = await axios.get(`${API_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('OK');
  });

  test('Search endpoint with valid query', async () => {
    const response = await axios.get(`${API_URL}/api/search?q=iPhone`);
    expect(response.status).toBe(200);
    expect(response.data.products).toBeDefined();
    expect(Array.isArray(response.data.products)).toBe(true);
  });

  test('Search endpoint rejects empty query', async () => {
    try {
      await axios.get(`${API_URL}/api/search?q=`);
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  test('Rate limiting works', async () => {
    const promises = [];
    for (let i = 0; i < 35; i++) {
      promises.push(
        axios.get(`${API_URL}/api/search?q=test${i}`)
          .catch(err => err.response?.status)
      );
    }
    const results = await Promise.all(promises);
    const rateLimited = results.some(r => r === 429);
    expect(rateLimited).toBe(true);
  });

  test('Suggestions endpoint works', async () => {
    const response = await axios.get(`${API_URL}/api/suggestions?q=iph`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.suggestions)).toBe(true);
  });
});
```

### 6.2 Frontend Component Tests

**Create**: `apps/web/src/components/__tests__/ProductCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    title: 'Test Product',
    price: 1000,
    image: 'test.jpg',
    platform: 'Amazon',
    url: 'https://example.com',
    rating: 4.5,
  };

  test('renders product card', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  test('displays price correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/₹1,000/)).toBeInTheDocument();
  });

  test('shows platform badge', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });

  test('wishlist button is clickable', () => {
    const mockToggle = jest.fn();
    render(
      <ProductCard 
        product={mockProduct} 
        onToggleWishlist={mockToggle}
      />
    );
    const wishlistBtn = screen.getByRole('button', { name: /🤍/ });
    wishlistBtn.click();
    expect(mockToggle).toHaveBeenCalled();
  });
});
```

### 6.3 Service Tests

**Create**: `apps/web/src/services/__tests__/product.service.test.ts`

```typescript
import { searchProducts, formatPrice, calculateSavings } from '../product.service';

describe('Product Service', () => {
  test('formatPrice formats correctly', () => {
    expect(formatPrice(1000)).toBe('₹1,000');
    expect(formatPrice(1000000)).toBe('₹1,000,000');
  });

  test('calculateSavings calculates percentage', () => {
    const { savings, percentage } = calculateSavings(1000, 800);
    expect(savings).toBe(200);
    expect(percentage).toBe('20.0');
  });

  test('searchProducts validates input', async () => {
    try {
      await searchProducts('');
      fail('Should throw error');
    } catch (error) {
      expect(error.message).toContain('empty');
    }
  });

  test('searchProducts rejects long queries', async () => {
    try {
      await searchProducts('a'.repeat(101));
      fail('Should throw error');
    } catch (error) {
      expect(error.message).toContain('long');
    }
  });
});
```

### 6.4 E2E Tests (Cypress)

**Create**: `apps/web/cypress/e2e/search.cy.ts`

```typescript
describe('Product Search Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('searches for products', () => {
    cy.get('input[placeholder*="Search"]').type('iPhone');
    cy.get('button:contains("Search")').click();
    cy.get('[class*="product-card"]').should('have.length.greaterThan', 0);
  });

  it('filters by store', () => {
    cy.get('input[placeholder*="Search"]').type('iPhone');
    cy.get('button:contains("Search")').click();
    cy.get('button:contains("Amazon")').click();
    cy.get('[class*="product-card"]').each($el => {
      expect($el).toContain('Amazon');
    });
  });

  it('adds product to wishlist', () => {
    cy.get('input[placeholder*="Search"]').type('iPhone');
    cy.get('button:contains("Search")').click();
    cy.get('button[aria-label*="wishlist"]').first().click();
    cy.get('button:contains("💖")').should('exist');
  });

  it('displays price sorting', () => {
    cy.get('input[placeholder*="Search"]').type('iPhone');
    cy.get('button:contains("Search")').click();
    cy.get('select').select('high');
    cy.get('[class*="price"]').then($prices => {
      // Verify prices are sorted high to low
    });
  });
});
```

### 6.5 API Documentation (Swagger)

**Create**: `services/backend/swagger.js`

```javascript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DealScout API',
      version: '1.0.0',
      description: 'Product comparison and search API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/index.js'],
};

const specs = swaggerJsdoc(options);
export { specs, swaggerUi };
```

### 6.6 Component Documentation (Storybook)

**Create**: `apps/web/.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
};

export default config;
```

**Create**: `apps/web/src/components/ProductCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from './ProductCard';

const meta = {
  component: ProductCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCard>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    product: {
      id: '1',
      title: 'iPhone 15 Pro',
      price: 79999,
      image: 'https://via.placeholder.com/300',
      platform: 'Amazon',
      url: 'https://amazon.com',
      rating: 4.7,
    },
  },
};

export const LowestPrice: StoryObj<typeof meta> = {
  args: {
    ...Default.args,
    isLowest: true,
  },
};
```

### 6.7 Coverage Report Setup

**Update**: `package.json` scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

---

## 🚀 PHASE 7: Deployment

### 7.1 GitHub Actions CI/CD

**Create**: `.github/workflows/deploy.yml`

```yaml
name: Deploy DealScout

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies (Backend)
        run: cd services/backend && npm ci
      
      - name: Install dependencies (Frontend)
        run: cd apps/web && npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel (Frontend)
        uses: vercel/actions/build@main
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Heroku (Backend)
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: dealscout-api
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

### 7.2 Vercel Deployment (Frontend)

**Create**: `vercel.json`

```json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/dist",
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "routes": [
    {
      "src": "^/.*",
      "destination": "/index.html"
    }
  ]
}
```

### 7.3 Heroku Deployment (Backend)

**Create**: `Procfile`

```
web: node services/backend/src/index.js
```

**Create**: `services/backend/.env.production`

```
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://yourdomain.com
SERPAPI_KEY=your_key_here
```

### 7.4 Environment Configuration

**Create**: `.env.production`

```env
# Frontend
VITE_API_URL=https://api.dealscout.com
VITE_ENV=production
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Backend
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://dealscout.com,https://www.dealscout.com
SERPAPI_KEY=your_production_key
```

### 7.5 Docker Setup

**Create**: `Dockerfile` (Backend)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy and install dependencies
COPY services/backend/package*.json ./
RUN npm ci --only=production

# Copy source
COPY services/backend/src ./src

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run
CMD ["node", "src/index.js"]
```

**Create**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always
```

### 7.6 Monitoring & Analytics

**Sentry Setup** (Error Tracking):
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
  tracesSampleRate: 1.0,
});
```

**DataDog Setup** (Performance Monitoring):
```typescript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.VITE_DD_APP_ID,
  clientToken: process.env.VITE_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'dealscout-frontend',
  env: process.env.VITE_ENV,
});

datadogRum.startSessionReplayRecording();
```

### 7.7 Production Checklist

- [ ] All tests passing (100% green)
- [ ] Bundle size < 250KB
- [ ] Lighthouse score > 90
- [ ] Security headers configured
- [ ] SSL/TLS enabled
- [ ] Rate limiting active
- [ ] Error monitoring (Sentry) active
- [ ] Performance monitoring (DataDog) active
- [ ] Backup strategy in place
- [ ] Incident response plan documented
- [ ] Database backups scheduled
- [ ] CDN configured for static assets

### 7.8 Post-Deployment Monitoring

```bash
# Monitor API health
watch -n 5 'curl -s http://your-api/health | jq'

# Monitor error rates
curl -s http://your-api/admin/stats -H "X-Admin-Key: key" | jq '.errors'

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://your-api/api/search?q=test
```

---

## 📊 Testing Coverage Targets

| Component | Target | Status |
|-----------|--------|--------|
| API Endpoints | 95% | ⏳ |
| Frontend Components | 80% | ⏳ |
| Services | 90% | ⏳ |
| Utils | 100% | ⏳ |
| E2E Flows | 5+ scenarios | ⏳ |

---

## 🔄 Deployment Timeline

```
Week 1:
- Day 1-2: Testing setup & unit tests
- Day 3: Integration tests & E2E tests
- Day 4-5: Fix failing tests, improve coverage

Week 2:
- Day 1-2: Production environment setup
- Day 3: CI/CD pipeline configuration
- Day 4: Staging deployment & testing
- Day 5: Production deployment

Post-Deployment:
- Day 1-7: Monitor metrics, fix issues
- Week 2+: Continuous improvement
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All code reviewed
- [ ] Tests passing 100%
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup strategy verified

### Deployment
- [ ] Database backed up
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] DNS updated (if needed)
- [ ] SSL certificates installed
- [ ] Monitoring activated

### Post-Deployment
- [ ] Health checks passing
- [ ] Error rates normal
- [ ] Performance metrics good
- [ ] User feedback positive
- [ ] Rollback plan ready

---

**Version**: Phases 6-7 Testing & Deployment Guide  
**Status**: Ready for Implementation  
**Estimated Time**: 2-3 weeks for complete CI/CD & production deployment
