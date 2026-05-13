import express, {
  Request,
  Response,
} from "express";

import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const SERP_API_KEY =
  "YOUR_SERPAPI_KEY";

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

app.get(
  "/api/search",
  async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;

      if (!q) {
        return res.status(400).json({
          error: "Query is required",
        });
      }

      const response = await axios.get(
        "https://serpapi.com/search.json",
        {
          params: {
            engine: "google_shopping",
            q,
            api_key: SERP_API_KEY,
            gl: "in",
            hl: "en",
          },
        }
      );

      const shoppingResults: ShoppingItem[] =
        response.data.shopping_results || [];

      const products = shoppingResults.map(
        (
          item: ShoppingItem,
          index: number
        ) => ({
          id: index.toString(),

          title: item.title || "No title",

          price: Number(
            item.price?.replace(/[^\d.]/g, "") || 0
          ),

          image: item.thumbnail || "",

          platform: item.source || "Unknown",

          rating: item.rating || 0,

          url: item.link || "#",
        })
      );

      res.json({
        products,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch products",
      });
    }
  }
);

/* -------------------------------- */
/* SEARCH SUGGESTIONS */
/* -------------------------------- */

app.get(
  "/api/suggestions",
  async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;

      if (!q) {
        return res.json({
          suggestions: [],
        });
      }

      const response = await axios.get(
        "https://serpapi.com/search.json",
        {
          params: {
            engine: "google_autocomplete",
            q,
            api_key: SERP_API_KEY,
            gl: "in",
            hl: "en",
          },
        }
      );

      const suggestions =
        response.data.suggestions?.map(
          (item: { value: string }) =>
            item.value
        ) || [];

      res.json({
        suggestions,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch suggestions",
      });
    }
  }
);

/* -------------------------------- */
/* SERVER */
/* -------------------------------- */

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});