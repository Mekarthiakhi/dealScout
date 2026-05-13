import { useState } from "react";
import { debounce } from "lodash";

import { motion, AnimatePresence } from "framer-motion";

import { searchProducts } from "./services/product.service";
import { Product } from "./types/product";
import ProductCard from "./components/ProductCard";

export default function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("low");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [suggestions, setSuggestions] =
    useState<string[]>([]);

  const [selectedSuggestion, setSelectedSuggestion] =
    useState(-1);

  /* -------------------------------- */
  /* SEARCH PRODUCTS */
  /* -------------------------------- */

  const handleSearch = async (
    customQuery?: string
  ) => {
    const finalQuery = customQuery || query;

    if (!finalQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await searchProducts(
        finalQuery
      );

      setProducts(data.products || []);

    } catch (err) {
      console.error(err);

      setError(
        "Failed to fetch products"
      );

    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* FETCH SUGGESTIONS */
  /* -------------------------------- */

  const fetchSuggestions = async (
    value: string
  ) => {
    try {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/suggestions?q=${value}`
      );

      const data = await response.json();

      setSuggestions(
        data.suggestions || []
      );

    } catch (error) {
      console.error(error);
    }
  };

  const debouncedFetchSuggestions =
    debounce(fetchSuggestions, 400);

  /* -------------------------------- */
  /* SORTING */
  /* -------------------------------- */

  const lowestPrice = Math.min(
    ...products.map((p) => p.price)
  );

  const highestPrice = Math.max(
    ...products.map((p) => p.price)
  );

  const sortedProducts = [...products];

  if (sortBy === "low") {
    sortedProducts.sort(
      (a, b) => a.price - b.price
    );
  }

  if (sortBy === "high") {
    sortedProducts.sort(
      (a, b) => b.price - a.price
    );
  }

  if (sortBy === "rating") {
    sortedProducts.sort(
      (a, b) =>
        (b.rating || 0) -
        (a.rating || 0)
    );
  }

  /* -------------------------------- */
  /* WISHLIST */
  /* -------------------------------- */

  const toggleWishlist = (
    id: string
  ) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <h1 className="text-5xl font-bold">
          DealScout AI
        </h1>

        <p className="text-zinc-400 mt-3 text-lg">
          Compare prices across
          multiple platforms instantly
        </p>

        {/* SEARCH + SORT */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">

          {/* SEARCH */}

          <div className="relative flex-1">

            {/* SEARCH ICON */}

            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl z-10">
              🔍
            </div>

            <input
              value={query}
              onChange={(e) => {
                const value =
                  e.target.value;

                setQuery(value);

                setShowSuggestions(
                  true
                );

                setSelectedSuggestion(
                  -1
                );

                debouncedFetchSuggestions(
                  value
                );
              }}
              onFocus={() =>
                setShowSuggestions(true)
              }
              onKeyDown={(e) => {

                /* DOWN */

                if (
                  e.key ===
                  "ArrowDown"
                ) {
                  e.preventDefault();

                  setSelectedSuggestion(
                    (prev) =>
                      prev <
                      suggestions.length -
                        1
                        ? prev + 1
                        : 0
                  );
                }

                /* UP */

                if (
                  e.key ===
                  "ArrowUp"
                ) {
                  e.preventDefault();

                  setSelectedSuggestion(
                    (prev) =>
                      prev > 0
                        ? prev - 1
                        : suggestions.length -
                          1
                  );
                }

                /* ENTER */

                if (
                  e.key ===
                  "Enter"
                ) {
                  e.preventDefault();

                  let selectedValue =
                    query;

                  if (
                    selectedSuggestion >=
                    0
                  ) {
                    selectedValue =
                      suggestions[
                        selectedSuggestion
                      ];

                    setQuery(
                      selectedValue
                    );
                  }

                  handleSearch(
                    selectedValue
                  );

                  setShowSuggestions(
                    false
                  );
                }

                /* ESC */

                if (
                  e.key ===
                  "Escape"
                ) {
                  setShowSuggestions(
                    false
                  );
                }
              }}
              placeholder="Search iPhone, Shoes, Laptop..."
              className="w-full pl-14 pr-4 py-4 rounded-2xl text-black outline-none text-lg"
            />

            {/* SUGGESTIONS */}

            {showSuggestions &&
              query && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl z-50">

                  {suggestions.length >
                  0 ? (
                    suggestions.map(
                      (
                        item,
                        index
                      ) => (
                        <button
                          key={item}
                          onClick={() => {
                            setQuery(
                              item
                            );

                            handleSearch(
                              item
                            );

                            setShowSuggestions(
                              false
                            );
                          }}
                          className={`w-full text-left px-5 py-4 transition border-b border-zinc-800 last:border-none
                          ${
                            selectedSuggestion ===
                            index
                              ? "bg-zinc-700 text-white"
                              : "hover:bg-zinc-800 text-white"
                          }`}
                        >
                          🔍 {item}
                        </button>
                      )
                    )
                  ) : (
                    <div className="px-5 py-4 text-zinc-400">
                      No suggestions
                      found
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl border border-zinc-700"
          >
            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

            <option value="rating">
              Rating
            </option>
          </select>
        </div>

        {/* ERROR */}

        {error && (
          <p className="text-red-500 mt-6">
            {error}
          </p>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          products.length === 0 && (
            <div className="mt-16 text-center text-zinc-500">
              <p className="text-xl">
                Search products to
                compare deals
              </p>
            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">

            {[...Array(6)].map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden animate-pulse"
                >
                  <div className="bg-zinc-800 h-64 w-full"></div>

                  <div className="p-5 space-y-4">

                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-zinc-800 rounded w-24"></div>

                      <div className="h-5 bg-zinc-800 rounded w-12"></div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-full"></div>

                      <div className="h-4 bg-zinc-800 rounded w-4/5"></div>
                    </div>

                    <div className="h-8 bg-zinc-800 rounded w-32"></div>

                    <div className="h-12 bg-zinc-800 rounded-xl w-full"></div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* PRODUCT GRID */}

        {!loading &&
          products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">

              {sortedProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isLowest={
                      product.price ===
                      lowestPrice
                    }
                    savings={
                      highestPrice -
                      product.price
                    }
                    onClick={() =>
                      setSelectedProduct(
                        product
                      )
                    }
                  />
                )
              )}
            </div>
          )}

        {/* PRODUCT MODAL */}

        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              {/* BACKDROP */}

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setSelectedProduct(
                    null
                  )
                }
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* MODAL */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 40,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="relative bg-zinc-900 rounded-3xl max-w-5xl w-full overflow-hidden border border-zinc-800 shadow-2xl z-10"
              >

                {/* CLOSE */}

                <button
                  onClick={() =>
                    setSelectedProduct(
                      null
                    )
                  }
                  className="absolute top-5 right-5 text-white text-3xl z-20 hover:text-red-400 transition"
                >
                  ✕
                </button>

                <div className="grid md:grid-cols-2">

                  {/* LEFT */}

                  <div className="bg-white p-6">

                    <button
                      onClick={() =>
                        toggleWishlist(
                          selectedProduct.id
                        )
                      }
                      className="absolute left-5 top-5 bg-white rounded-full p-3 shadow-lg text-2xl"
                    >
                      {wishlist.includes(
                        selectedProduct.id
                      )
                        ? "❤️"
                        : "🤍"}
                    </button>

                    <div className="h-96 flex items-center justify-center">
                      <img
                        src={
                          selectedProduct.image
                        }
                        alt={
                          selectedProduct.title
                        }
                        className="max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="p-8">

                    <div className="flex items-center justify-between">
                      <h2 className="text-4xl font-bold text-white">
                        {
                          selectedProduct.platform
                        }
                      </h2>

                      {selectedProduct.rating && (
                        <span className="text-yellow-400 text-xl font-semibold">
                          ⭐{" "}
                          {
                            selectedProduct.rating
                          }
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-300 mt-5 text-lg leading-8">
                      {
                        selectedProduct.title
                      }
                    </p>

                    <p className="text-5xl font-bold text-white mt-8">
                      ₹
                      {selectedProduct.price.toLocaleString()}
                    </p>

                    <div className="mt-8 bg-zinc-800 rounded-2xl p-5 border border-zinc-700">
                      <h3 className="text-xl font-bold mb-3">
                        🤖 AI Deal
                        Summary
                      </h3>

                      <p className="text-zinc-300 leading-7">
                        This is currently
                        one of the
                        best-value deals
                        available.
                      </p>
                    </div>

                    <a
                      href={
                        selectedProduct.url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center mt-10 bg-white text-black py-4 rounded-2xl font-bold hover:bg-zinc-200 transition"
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}