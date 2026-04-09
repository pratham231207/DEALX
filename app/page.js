"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";



export default function Home() {
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [recentClicks, setRecentClicks] = useState({});
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [dark, setDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const tabs = ["All", "Mobiles", "Laptops", "Appliances", "Audio"];
   const [viewers, setViewers] = useState({});

 useEffect(() => {
  const runFilter = async () => {
    let filtered = products;

   if (activeTab !== "All") {
  filtered = filtered.filter((p) => p.category === activeTab);
}

    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  };

  runFilter();
}, [query, activeTab, products]);

useEffect(() => {
  const fetchRecent = async () => {
    const res = await fetch("/api/recent-clicks");
    const data = await res.json();
    setRecentClicks(data);
  };

  fetchRecent();
  const interval = setInterval(fetchRecent, 1800000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setShowFloatingSearch(true);
    } else {
      setShowFloatingSearch(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  setTimeout(() => setLoaded(true), 200);
}, []);
 
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
}, []);

useEffect(() => {
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();

    console.log("DATA:", data); // 👈 ADD THIS LINE

    setProducts(data);
    setResults(data);
  };

  fetchProducts();
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetch("/api/update-prices");
  }, 10000); // every 10 seconds

  return () => clearInterval(interval);
}, []);

  const getBestDeal = (product) =>
  product.amazonPrice < product.flipkartPrice
    ? {
        platform: "Amazon",
        price: product.amazonPrice,
        link: product.amazonLink,
      }
    : {
        platform: "Flipkart",
        price: product.flipkartPrice,
        link: product.flipkartLink,
      };

  return (
    <div className={dark 
  ? "bg-[#121212] text-white min-h-screen px-3 sm:px-6 py-10 pb-24 overflow-x-hidden animate-fade-in" 
  : "bg-[#eef2f7] text-black min-h-screen px-3 sm:px-6 py-10 pb-24 overflow-x-hidden animate-fade-in"
}>
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none"></div>
      <div className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow sm ${
  dark 
    ? "bg-black/60 border-white/10" 
    : "bg-white/70 border-gray-200"
}`}>
  <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
    
    

    
    {/* Logo */}
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3"></div>

  <ShoppingCart
    className={`w-12 h-12 sm:w-20 sm:h-20 text-blue-500 transform transition-all duration-700 ${
      loaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
    }`}
  />

  <h1
    className={`text-4xl font-extrabold tracking-wide transform transition-all duration-700 hover:scale-105 cursor-pointer ${
      loaded ? "scale-100 opacity-100" : "scale-75 opacity-0"
    }`}
  >
    Deal<span className="text-blue-500">X</span>
  </h1>

</div>

    {/* Toggle */}
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-1 border rounded-lg transition-all duration-150
hover:bg-blue-500 hover:text-white
active:scale-95"
    >
      {dark ? "Light" : "Dark"}
    </button>
  </div>
</div>

{/* ✅ WRAPPER START */}
<div className="max-w-6xl mx-auto"></div>

{/* HERO */}
<div className="text-center mt-6 mb-4">
  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
    Find the <span className="text-grey-300">Best Deals</span> Instantly
  </h2>
  <p className="text-grey-300 font-semibold mt-1">
     Compare Amazon & Flipkart prices in seconds 

  </p>
  <div className="w-20 h-1 bg-blue-500 mx-auto mt-3 rounded-full"></div>
</div>
      {/* TABS */}
      <div className="flex gap-3 mb-6 overflow-x-auto sm:justify-center px-2 no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer border transition-all duration-300 ease-out
transform
${
  activeTab === tab
    ? "bg-red-500 text-white border-red-500 shadow-md scale-105"
    : "bg-blue-500 text-white border-blue-500 hover:-translate-y-1 hover:shadow-lg"
}`}
          >
            {tab === "Trending" ? "🔥 Trending" : tab}
          </div>
        ))}
      </div>

      {/* SEARCH */}
     <div className={`w-full max-w-2xl mx-auto flex gap-2 px-2 mb-10 px-2 transition-all duration-300 ${
  showFloatingSearch ? "opacity-0 pointer-events-none" : "opacity-100"
}`}>
  <input
    placeholder="Search products..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className={`flex-1 px-5 py-3 text-s rounded-xl border
      transition-all duration-300 ease-out transform
      hover:-translate-y-1 hover:shadow-lg
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
focus:shadow-[0_0_15px_rgba(0,0,255,0.4)]
${dark 
  ? "bg-[#1a1a1a] text-white border-gray-700 placeholder-gray-400" 
  : "bg-white text-black border-gray-300 placeholder-gray-500"
}`}
  />

  <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95">
    Search
  </button>
</div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product, index) => {
          const best = getBestDeal(product);
          const higher = Math.max(product.amazonPrice, product.flipkartPrice);
          const lower = Math.min(product.amazonPrice, product.flipkartPrice);
          const savings = higher - lower;

          return (
            <div className={`relative p-3 sm:p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer
transform
hover:-translate-y-2 hover:scale-[1.02] active:scale-95
hover:border-blue-500
hover:shadow-[0_25px_50px_rgba(0,0,255,0.25)]
before:absolute before:inset-0 before:rounded-2xl before:opacity-0 hover:before:opacity-100
before:pointer-events-none
before:transition before:duration-300
before:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_70%)]
${dark ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"}`}
>
              <div className="flex gap-4 items-center">
                <img 
  src={product.image}
  className="w-20 h-20 sm:w-28 sm:h-28 rounded-md object-cover transition-transform duration-300 hover:scale-110"
/>
                <h2 className="text-sm sm:text-lg font-semibold hover:text-blue-500 transition cursor-pointer">{product.name}</h2>
              </div>

             <div className="flex justify-between mt-4 text-sm sm:text-lg font-extrabold">

  {/* AMAZON */}
  <div className="flex flex-col items-start">
    <span className={`text-lg ${
      product.amazonPrice > product.flipkartPrice 
        ? "line-through opacity-85 text-red-500" 
        : "text-green-500 font-bold"
    }`}>
      Amazon ₹{product.amazonPrice}
    </span>

    {best.platform === "Amazon" && (
      <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-md mt-1 shadow">
        🔥 Best Deal
      </span>
    )}
  </div>

  {/* FLIPKART */}
  <div className="flex flex-col items-end">
    <span className={`text-lg ${
      product.flipkartPrice > product.amazonPrice 
        ? "line-through opacity-85 text-red-500" 
        : "text-green-500 font-bold"
    }`}>
      Flipkart ₹{product.flipkartPrice}
    </span>

    {best.platform === "Flipkart" && (
      <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-md mt-1 shadow">
        🔥 Best Deal
      </span>
    )}
  </div>

</div>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px]  rounded-full pointer-events-none"></div>

             {savings > 0 && (
  <div className="text-blue-500 text-s mt-1 font-semibold">
    You save ₹{savings}
  </div>
)}

{/* 🔻 PRICE DROP ALERT */}
{product.previousPrice && 
 Math.min(product.amazonPrice, product.flipkartPrice) < product.previousPrice && (
  <div className="text-red-500 text-sm font-semibold mt-1">
    🔻 Price dropped ₹{
      product.previousPrice - 
      Math.min(product.amazonPrice, product.flipkartPrice)
    }
  </div>
)}

              <div className="flex justify-end text-l mt-2">
  <span className="text-blue-500 font-semibold">
   👆 {recentClicks[product.name] || 0} clicks recently
  </span>
</div>
<div className="text-s text-green-700 mt-1">
  ⚡ Price checked across platforms
</div>
<div className="text-xs text-gray-400 mt-1">
  ⏱ Updated at {product.lastUpdated}
</div>
<div className="text-xs text-gray-400 mt-2">
  🔒 Safe redirect to Amazon / Flipkart
</div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
  onClick={() => {
  fetch("/api/click", {
    method: "POST",
    body: JSON.stringify({
      productName: product.name,
      platform: "Amazon"
    })
  });

  window.open(product.amazonLink, "_blank");
}}
  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
>
  Amazon
</button>

                <button
  onClick={async () => {
  fetch("/api/click", {
    method: "POST",
    body: JSON.stringify({
      productName: product.name,
      platform: "Flipkart"
    })
  });

  window.open(product.flipkartLink, "_blank");
}}
  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
>
  Flipkart
</button>
                

               <button
  onClick={async () => {
  fetch("/api/click", {
    method: "POST",
    body: JSON.stringify({
      productName: product.name,
      platform: best.platform
    })
  });

  window.open(best.link, "_blank");
}}
 className="w-full sm:w-auto px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-800 text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
>
  Buy
</button>
              </div>
            </div>
          );
        })}
      </div>
      

      {/* EMPTY */}
      {results.length === 0 && (
        <div className="text-center mt-10 text-gray-400">
          😔 No products found
          </div>  // ✅ WRAPPER END
        
        
        
      )}

      {/* FLOATING SEARCH BUTTON */}
{showFloatingSearch && (
  <button
    onClick={() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setShowFloatingSearch(false);
    }}
    className="fixed bottom-6 right-6 sm:hidden z-50 p-4 rounded-full
bg-gradient-to-r from-red-500 to-red-700 text-white
shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
    >
    🔍
  </button>
)}
    </div>
  );
}