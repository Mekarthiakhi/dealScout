import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Render uses environment variables, so we fall back to a mock string if missing
const SERP_API_KEY = process.env.SERPAPI_KEY || "YOUR_SERPAPI_KEY";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/* -------------------------------- */
/* REDIS SETUP */
/* -------------------------------- */
const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("📦 Connected to Redis"));

// Connect asynchronously (don't await at top-level to prevent blocking express initialization)
redisClient.connect().catch(console.error);

/* -------------------------------- */
/* TYPES */
/* -------------------------------- */

interface ShoppingItem {
  title?: string;
  price?: string;
  thumbnail?: string;
  source?: string;
  rating?: number;
  link?: string;
}

/* -------------------------------- */
/* SEARCH PRODUCTS */
/* -------------------------------- */

app.get("/api/search", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ error: "Query is required" });
    }

    const cacheKey = `search:${q.toLowerCase()}`;
    
    // Check Cache
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for search: ${q}`);
        return res.json({ products: JSON.parse(cached) });
      }
    }
    
    console.log(`Cache MISS for search: ${q}, fetching from SerpAPI...`);

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q,
        api_key: SERP_API_KEY,
        gl: "in",
        hl: "en",
      },
    });

    const shoppingResults: ShoppingItem[] = response.data.shopping_results || [];

    const products = shoppingResults.map((item: ShoppingItem, index: number) => ({
      id: index.toString(),
      title: item.title || "No title",
      price: Number(item.price?.replace(/[^\d.]/g, "") || 0),
      image: item.thumbnail || "",
      platform: item.source || "Unknown",
      rating: item.rating || 0,
      url: item.link || "#",
    }));

    // Save to Cache for 1 hour (3600 seconds)
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    }

    res.json({ products });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* -------------------------------- */
/* SEARCH SUGGESTIONS */
/* -------------------------------- */

app.get("/api/suggestions", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res.json({ suggestions: [] });
    }

    const cacheKey = `suggestions:${q.toLowerCase()}`;

    // Check Cache
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json({ suggestions: JSON.parse(cached) });
      }
    }

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_autocomplete",
        q,
        api_key: SERP_API_KEY,
        gl: "in",
        hl: "en",
      },
    });

    const suggestions = response.data.suggestions?.map((item: { value: string }) => item.value) || [];

    // Save to Cache for 24 hours (suggestions rarely change)
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 86400, JSON.stringify(suggestions));
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Suggestions API Error:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

/* -------------------------------- */
/* SERVER */
/* -------------------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});