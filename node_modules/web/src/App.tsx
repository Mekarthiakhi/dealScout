import { useState, useMemo, useEffect } from "react";
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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Expanded wishlist to store full product objects for persistence
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const [activeStoreFilter, setActiveStoreFilter] = useState("All");

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dealscout-wishlist-v2');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load wishlist");
      }
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('dealscout-wishlist-v2', JSON.stringify(wishlist));
  }, [wishlist]);

  /* -------------------------------- */
  /* SEARCH PRODUCTS */
  /* -------------------------------- */

  const handleSearch = async (customQuery?: string) => {
    const finalQuery = customQuery || query;

    if (!finalQuery.trim()) return;

    setLoading(true);
    setError("");
    setActiveStoreFilter("All");

    try {
      const data = await searchProducts(finalQuery);
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* FETCH SUGGESTIONS */
  /* -------------------------------- */

  const fetchSuggestions = async (value: string) => {
    try {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/suggestions?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 400), []);

  /* -------------------------------- */
  /* DERIVED STATE & ANALYTICS */
  /* -------------------------------- */

  const stores = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.platform)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return activeStoreFilter === "All"
      ? products
      : products.filter((p) => p.platform === activeStoreFilter);
  }, [products, activeStoreFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === "low") sorted.sort((a, b) => a.price - b.price);
    if (sortBy === "high") sorted.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [filteredProducts, sortBy]);

  // Analytics for the glowing dashboard
  const prices = filteredProducts.map((p) => p.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const averagePrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const bestDealProduct = sortedProducts.find((p) => p.price === lowestPrice);

  /* -------------------------------- */
  /* WISHLIST & TOASTS */
  /* -------------------------------- */

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from Wishlist`);
        return prev.filter((p) => p.id !== product.id);
      }
      showToast(`✨ Added to Wishlist!`);
      return [...prev, product];
    });
  };

  /* -------------------------------- */
  /* PRICE CHART LOGIC */
  /* -------------------------------- */

  // Aggregate average price per store for the chart
  const storeChartData = useMemo(() => {
    if (products.length === 0) return [];

    const storeMap = new Map<string, { total: number, count: number }>();
    products.forEach(p => {
      const current = storeMap.get(p.platform) || { total: 0, count: 0 };
      storeMap.set(p.platform, { total: current.total + p.price, count: current.count + 1 });
    });

    const chartData = Array.from(storeMap.entries()).map(([platform, data]) => ({
      platform,
      avgPrice: Math.round(data.total / data.count)
    })).sort((a, b) => a.avgPrice - b.avgPrice);

    // Limit to top 6 for clean visual
    return chartData.slice(0, 6);
  }, [products]);

  const maxChartPrice = storeChartData.length > 0 ? Math.max(...storeChartData.map(d => d.avgPrice)) : 0;

  /* -------------------------------- */
  /* SPECIFICATION EXTRACTOR (AI) */
  /* -------------------------------- */
  const extractSpecs = (title: string) => {
    const specs = [];
    const t = title.toUpperCase();

    // Storage
    const storageMatch = t.match(/(\d+(GB|TB))\s*(ROM|STORAGE)/i) || t.match(/\b(64GB|128GB|256GB|512GB|1TB|2TB)\b/i);
    if (storageMatch) specs.push({ label: 'Storage', value: storageMatch[0], icon: '💾' });

    // RAM (Exclude common storage numbers if not explicitly labeled)
    const ramMatch = t.match(/(\d+GB)\s*RAM/i) || t.match(/\b(4GB|6GB|8GB|12GB|16GB)\b(?!\s*(ROM|STORAGE))/i);
    if (ramMatch && (!storageMatch || ramMatch[0] !== storageMatch[0])) specs.push({ label: 'Memory', value: ramMatch[0], icon: '🧠' });

    // Network & Display & Condition
    if (t.includes('5G')) specs.push({ label: 'Network', value: '5G Ready', icon: '📶' });
    if (t.includes('OLED') || t.includes('AMOLED')) specs.push({ label: 'Display', value: 'OLED', icon: '📱' });
    if (t.includes('RENEWED') || t.includes('REFURBISHED')) specs.push({ label: 'Condition', value: 'Renewed', icon: '♻️' });

    return specs;
  };

  /* -------------------------------- */
  /* AI ANALYSIS GENERATOR */
  /* -------------------------------- */
  const generateAIAnalysis = (product: Product, lowest: number, average: number) => {
    let analysis = `This ${product.platform} deal is currently priced at ₹${product.price.toLocaleString()}. `;

    // Price Analysis
    if (product.price === lowest) {
      analysis += `🔥 This is the absolute best value across all tracked platforms today! You are saving ₹${(average - product.price).toLocaleString()} compared to the market average. `;
    } else if (product.price < average) {
      analysis += `✅ This is a solid deal, priced below the market average of ₹${average.toLocaleString()}. `;
    } else {
      analysis += `⚠️ This item is priced above the market average of ₹${average.toLocaleString()}. You might find cheaper alternatives in your search grid. `;
    }

    // Rating Analysis
    if (product.rating) {
      if (product.rating >= 4.5) {
        analysis += `With a stellar ⭐${product.rating} rating, this product is highly trusted by buyers and offers premium quality. `;
      } else if (product.rating >= 4.0) {
        analysis += `It holds a strong ⭐${product.rating} rating, making it a reliable choice. `;
      } else {
        analysis += `Note: It has a moderate ⭐${product.rating} rating, so reviewing seller feedback is recommended. `;
      }
    }

    // Spec/Keyword Analysis
    const title = product.title.toLowerCase();
    if (title.includes('pro') || title.includes('max') || title.includes('ultra') || title.includes('plus')) {
      analysis += `Perfect for power users seeking top-tier specifications and pro-level performance.`;
    } else if (title.includes('5g')) {
      analysis += `Future-proofed with 5G connectivity for ultra-fast network speeds.`;
    } else if (title.includes('refurbished') || title.includes('renewed')) {
      analysis += `Note: This is a refurbished/renewed item, which explains the excellent discount.`;
    }

    return analysis;
  };

  return (
    <div className="cyber-bg text-slate-200 font-sans min-h-screen relative overflow-x-hidden">

      {/* ---------------- NAVBAR / HEADER ---------------- */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <span className="text-xl font-bold text-white">D</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white hidden sm:block">
              Deal<span className="text-cyan-400">Scout</span> AI
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl">💖</span>
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-950">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            Compare Prices. <br />
            <span className="gradient-text">Save Instantly.</span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl">
            Our AI searches across multiple platforms to find you the absolute best deals in real-time.
          </p>
        </div>

        {/* ---------------- SEARCH BAR ---------------- */}
        <div className="max-w-3xl mx-auto relative z-30 mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-700 focus-within:border-cyan-400 transition-colors shadow-2xl">

              <div className="pl-6 text-cyan-400 text-xl">🔍</div>

              <input
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  setShowSuggestions(true);
                  setSelectedSuggestion(-1);
                  debouncedFetchSuggestions(value);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedSuggestion((prev) => prev < suggestions.length - 1 ? prev + 1 : 0);
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedSuggestion((prev) => prev > 0 ? prev - 1 : suggestions.length - 1);
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    let selectedValue = query;
                    if (selectedSuggestion >= 0) {
                      selectedValue = suggestions[selectedSuggestion];
                      setQuery(selectedValue);
                    }
                    e.currentTarget.blur();
                    handleSearch(selectedValue);
                    setShowSuggestions(false);
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search iPhone, Shoes, Laptop..."
                className="w-full bg-transparent text-white px-4 py-5 outline-none text-lg placeholder-slate-500"
              />

              <button
                onClick={() => { handleSearch(); setShowSuggestions(false); }}
                className="mr-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && query && (
            <div className="absolute top-full left-0 w-full mt-3 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
              {suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                      setShowSuggestions(false);
                    }}
                    className={`w-full text-left px-6 py-4 transition flex items-center gap-3 border-b border-slate-800 last:border-none
                    ${selectedSuggestion === index ? "bg-slate-800 text-cyan-400" : "hover:bg-slate-800 text-slate-300"}`}
                  >
                    <span className="text-slate-500 text-sm">🔍</span> {item}
                  </button>
                ))
              ) : (
                <div className="px-6 py-4 text-slate-500">No suggestions found</div>
              )}
            </div>
          )}
        </div>

        {/* ---------------- ERROR STATE ---------------- */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 mb-10">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ---------------- LOADING STATE ---------------- */}
        {loading && (
          <div className="space-y-10">
            {/* Mock Dashboard Loader */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/50"></div>
              ))}
            </div>

            {/* Mock Grid Loader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="glass-card rounded-3xl overflow-hidden animate-pulse">
                  <div className="bg-slate-800 h-56 w-full"></div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-slate-800 rounded w-24"></div>
                      <div className="h-5 bg-slate-800 rounded w-12"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                      <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                    </div>
                    <div className="h-8 bg-slate-800 rounded w-32"></div>
                    <div className="h-12 bg-slate-800 rounded-xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- RESULTS DASHBOARD ---------------- */}
        {!loading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >

            {/* STATS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel rounded-3xl p-6 flex items-center justify-between border-cyan-400/30">
                <div>
                  <p className="text-cyan-400/80 text-sm font-bold uppercase tracking-wider mb-1">Lowest Price Found</p>
                  <p className="text-4xl font-black text-white">₹{lowestPrice.toLocaleString()}</p>
                  {bestDealProduct && (
                    <p className="text-slate-400 text-sm mt-2">on <span className="text-cyan-300">{bestDealProduct.platform}</span></p>
                  )}
                </div>
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl border border-cyan-500/20">
                  🔥
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Average Market Price</p>
                  <p className="text-4xl font-black text-slate-200">₹{averagePrice.toLocaleString()}</p>
                  <p className="text-slate-500 text-sm mt-2">Across {stores.length - 1} platforms</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-3xl border border-slate-700">
                  📊
                </div>
              </div>

              {/* DYNAMIC CHART */}

            </div>

            {/* CONTROLS (FILTERS & SORT) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">

              <div className="flex flex-wrap gap-2">
                {stores.map(store => (
                  <button
                    key={store}
                    onClick={() => setActiveStoreFilter(store)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                      ${activeStoreFilter === store
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                  >
                    {store}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer text-sm font-semibold min-w-[160px]"
              >
                <option value="low">Price: Lowest First</option>
                <option value="high">Price: Highest First</option>
                <option value="rating">Top Rated First</option>
              </select>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLowest={product.price === lowestPrice}
                  savings={highestPrice - product.price}
                  onClick={() => setSelectedProduct(product)}
                  onToggleWishlist={() => toggleWishlist(product)}
                  isWishlisted={wishlist.some(p => p.id === product.id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-xl">No products match this filter.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && !error && (
          <div className="mt-20 text-center">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-xl">
              <span className="text-4xl opacity-50">🛒</span>
            </div>
            <p className="text-slate-400 text-xl font-medium">Search for a product to find the best deals.</p>
          </div>
        )}
      </main>

      {/* ---------------- WISHLIST SIDEBAR DRAWER ---------------- */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>💖</span> Saved Deals
                </h2>
                <button onClick={() => setIsWishlistOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center text-slate-500 mt-20">
                    <p className="text-5xl mb-4 opacity-30">🤍</p>
                    <p>Your wishlist is empty.</p>
                  </div>
                ) : (
                  wishlist.map(item => (
                    <div key={item.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex gap-4 items-center group">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-contain bg-slate-900 p-2 rounded-xl border border-slate-800" />
                      <div className="flex-1">
                        <p className="text-xs text-cyan-400 font-bold mb-1">{item.platform}</p>
                        <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">{item.title}</h4>
                        <p className="text-lg font-bold text-white mt-1">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a href={item.url} target="_blank" rel="noreferrer" className="w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-colors">
                          →
                        </a>
                        <button onClick={() => toggleWishlist(item)} className="w-8 h-8 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {wishlist.length > 0 && (
                <div className="p-6 border-t border-slate-800 bg-slate-900">
                  <button onClick={() => setWishlist([])} className="w-full py-3 text-slate-400 font-medium hover:text-red-400 transition-colors">
                    Clear All Items
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- PRODUCT MODAL (QUICK VIEW) ---------------- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-slate-900 rounded-3xl max-w-5xl w-full overflow-hidden border border-slate-700 shadow-2xl z-10 flex flex-col md:flex-row">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-slate-800 text-slate-400 p-2 rounded-full hover:bg-slate-700 hover:text-white transition z-20">✕</button>

              {/* Left Image */}
              <div className="w-full md:w-1/2 bg-slate-950 p-10 flex items-center justify-center relative">
                <button onClick={() => toggleWishlist(selectedProduct)} className="absolute top-6 left-6 bg-slate-800 p-3 rounded-full text-xl shadow-lg border border-slate-700 hover:scale-110 transition z-20">
                  {wishlist.some(p => p.id === selectedProduct.id) ? '💖' : '🤍'}
                </button>
                <img src={selectedProduct.image} alt={selectedProduct.title} className="max-h-[400px] object-contain drop-shadow-2xl relative z-10" />
              </div>

              {/* Right Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

                <span className="text-sm font-black tracking-widest text-cyan-400 uppercase mb-4">{selectedProduct.platform}</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6">{selectedProduct.title}</h2>

                <div className="flex items-end gap-4 mb-6">
                  <p className="text-5xl font-black text-white">₹{selectedProduct.price.toLocaleString()}</p>
                  {selectedProduct.rating && (
                    <p className="text-yellow-400 font-bold mb-2 flex items-center gap-1">⭐ {selectedProduct.rating}</p>
                  )}
                </div>

                {/* Specs Badges */}
                {(() => {
                  const specs = extractSpecs(selectedProduct.title);
                  if (specs.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300">
                          <span>{spec.icon}</span>
                          <span className="text-cyan-400">{spec.label}:</span>
                          <span>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl mb-8">
                  <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">🤖 AI Analysis</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {generateAIAnalysis(selectedProduct, lowestPrice, averagePrice)}
                  </p>
                </div>

                <a href={selectedProduct.url} target="_blank" rel="noreferrer" className="block text-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-lg py-4 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all transform hover:scale-[1.02]">
                  Visit Store & Buy
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- TOAST NOTIFICATION ---------------- */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(34,211,238,0.3)] flex items-center gap-3 font-medium pointer-events-none"
          >
            <span className="text-cyan-400 text-xl">✓</span> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}