"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search } from "lucide-react";

export default function Home() {
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [recentClicks, setRecentClicks] = useState({});
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [dark, setDark] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [viewers, setViewers] = useState({});

  const tabs = ["All", "Mobiles", "Laptops", "Appliances", "Audio"];

  // restored original viewer logic
  useEffect(() => {
    const updateViewers = () => {
      const newViewers = {};
      products.forEach((p, i) => {
        newViewers[i] = Math.floor(Math.random() * 40) + 10;
      });
      setViewers(newViewers);
    };
    updateViewers();
    const interval = setInterval(updateViewers, 4000);
    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setResults(data);
    };
    fetchProducts();
    setTimeout(() => setLoaded(true), 200);
  }, []);

  useEffect(() => {
    let filtered = products;
    if (activeTab !== "All") {
      filtered = filtered.filter((p) => p.category === activeTab);
    }
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, activeTab, products]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingSearch(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getBestDeal = (product) =>
    product.amazonPrice < product.flipkartPrice
      ? { platform: "Amazon", price: product.amazonPrice, link: product.amazonLink }
      : { platform: "Flipkart", price: product.flipkartPrice, link: product.flipkartLink };

  return (
    <div className={dark ? "bg-[#121212] text-white min-h-screen px-4 sm:px-6 py-10 animate-fade-in" : "bg-[#eef2f7] text-black min-h-screen px-4 sm:px-6 py-10 animate-fade-in"}>
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none"></div>

      {/* STICKY HEADER */}
<div className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow-sm -mx-4 sm:-mx-6 mb-6 ${dark ? "bg-black/60 border-white/10" : "bg-white/70 border-gray-200"}`}>
  <div className="max-w-6xl mx-auto flex flex-row sm:flex-col items-center justify-between sm:justify-center px-5 py-3 sm:py-6 relative">
    
    {/* Logo Container */}
    <div className="flex items-center gap-3">
      <ShoppingCart
        className={`w-8 h-8 sm:w-16 sm:h-16 text-blue-500 transform transition-all duration-700 ${
          loaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
        }`}
      />
      <h1
        className={`text-2xl sm:text-5xl font-extrabold tracking-wide transform transition-all duration-700 hover:scale-105 cursor-pointer ${
          loaded ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        Deal<span className="text-blue-500">X</span>
      </h1>
    </div>

    {/* Toggle Button - Absolute on desktop to keep logo centered */}
    <div className="sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
      <button 
        onClick={() => setDark(!dark)} 
        className="px-3 py-1 border rounded-lg transition-all hover:bg-blue-500 hover:text-white active:scale-95 text-xs sm:text-sm font-medium"
      >
        {dark ? "Light" : "Dark"}
      </button>
    </div>

  </div>
</div>

      <div className="max-w-6xl mx-auto">
        {/* HERO */}
        <div className="text-center mt-6 mb-4">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Find the <span className="text-blue-500">Best Deals</span> Instantly
          </h2>
          <p className="text-gray-400 font-semibold mt-1 text-sm sm:text-base">Compare Amazon & Flipkart prices in seconds</p>
          <div className="w-20 h-1 bg-blue-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-6 flex-wrap">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-full cursor-pointer border transition-all duration-300 transform ${
                activeTab === tab
                  ? "bg-red-500 text-white border-red-500 shadow-md scale-105"
                  : "bg-blue-500 text-white border-blue-500 hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* SEARCH BAR WITH ENHANCED MICRO-INTERACTIONS */}
<div className={`w-full max-w-2xl mx-auto flex gap-2 mb-10 px-2 transition-all duration-500 ease-in-out
  ${showFloatingSearch ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"}
`}>
  
  {/* The Search Input Wrapper */}
  <div className={`flex-1 flex items-center rounded-xl border transition-all duration-300 transform 
    hover:-translate-y-1 hover:shadow-xl group
    ${dark 
      ? "bg-[#1a1a1a] border-gray-700 focus-within:border-blue-500 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
      : "bg-white border-gray-300 focus-within:border-blue-500 focus-within:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
    }`}
  >
    <input
      placeholder="Search products..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full bg-transparent px-5 py-3 text-sm sm:text-base outline-none rounded-xl"
    />
  </div>

  {/* The "Soft Click" Search Button */}
  <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold 
    transition-all duration-200 
    hover:scale-105 hover:shadow-lg 
    active:scale-90 active:brightness-90 active:shadow-inner
    focus:outline-none"
  >
    Search
  </button>
</div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product, index) => {
            const best = getBestDeal(product);
            const higher = Math.max(product.amazonPrice, product.flipkartPrice);
            const lower = Math.min(product.amazonPrice, product.flipkartPrice);
            const savings = higher - lower;

            return (
              <div key={index} className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer transform hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_25px_50px_rgba(0,0,255,0.15)] 
                before:absolute before:inset-0 before:rounded-2xl before:opacity-0 hover:before:opacity-100 before:pointer-events-none before:transition before:duration-300 
                before:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_70%)] 
                ${dark ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"}`}>
                
                <div className="flex gap-4 items-center">
                  <img src={product.image} className="w-20 h-20 sm:w-28 sm:h-28 rounded-md object-cover transition-transform duration-300 hover:scale-110" />
                  <h2 className="text-sm sm:text-lg font-semibold hover:text-blue-500 transition line-clamp-2">{product.name}</h2>
                </div>

                {/* PRICES ROW */}
                <div className="flex justify-between items-start mt-4 font-extrabold gap-2">
                  <div className="flex flex-col">
                    <span className={`text-base sm:text-lg ${product.amazonPrice > product.flipkartPrice ? "line-through opacity-60 text-red-500" : "text-green-500"}`}>
                      Amazon ₹{product.amazonPrice}
                    </span>
                    {best.platform === "Amazon" && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-md mt-1 w-max">🔥 Best</span>}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-base sm:text-lg ${product.flipkartPrice > product.amazonPrice ? "line-through opacity-60 text-red-500" : "text-green-500"}`}>
                      Flipkart ₹{product.flipkartPrice}
                    </span>
                    {best.platform === "Flipkart" && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-md mt-1 w-max">🔥 Best</span>}
                  </div>
                </div>

                {/* ALERTS & SAVINGS */}
                <div className="mt-2 space-y-0.5">
                  {savings > 0 && <div className="text-blue-500 text-xs font-semibold">You save ₹{savings}</div>}
                  {product.previousPrice && Math.min(product.amazonPrice, product.flipkartPrice) < product.previousPrice && (
                    <div className="text-red-500 text-xs font-semibold">🔻 Price dropped ₹{product.previousPrice - Math.min(product.amazonPrice, product.flipkartPrice)}</div>
                  )}
                  <div className="text-[10px] sm:text-xs text-blue-500 font-semibold pt-1">👆 {recentClicks[product.name] || 0} clicks recently</div>
                  <div className="text-[10px] text-green-700">⚡ Price checked across platforms</div>
                  <div className="text-[10px] text-gray-500">⏱ Updated {product.lastUpdated}</div>
                </div>

               {/* BUTTONS GRID (3 columns) with Soft Click Effects */}
<div className="grid grid-cols-3 gap-2 mt-4">
  <button 
    onClick={() => window.open(product.amazonLink, "_blank")} 
    className="py-2.5 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-bold 
      transition-all duration-150 
      hover:scale-105 hover:bg-blue-500 hover:shadow-md
      active:scale-95 active:brightness-90 active:shadow-inner"
  >
    Amazon
  </button>
  
  <button 
    onClick={() => window.open(product.flipkartLink, "_blank")} 
    className="py-2.5 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-bold 
      transition-all duration-150 
      hover:scale-105 hover:bg-blue-500 hover:shadow-md
      active:scale-95 active:brightness-90 active:shadow-inner"
  >
    Flipkart
  </button>
  
  <button 
    onClick={() => window.open(best.link, "_blank")} 
    className="py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-800 text-white text-[10px] sm:text-xs font-bold 
      transition-all duration-150 
      hover:scale-105 hover:shadow-lg shadow-red-900/20
      active:scale-95 active:brightness-90 active:shadow-inner"
  >
    Buy
  </button>
</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING ACTION */}
      {showFloatingSearch && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-red-600 text-white shadow-lg hover:scale-110 active:scale-95 transition-all">
          <Search size={20} />
        </button>
      )}
    </div>
  );
}