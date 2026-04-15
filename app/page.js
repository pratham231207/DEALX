"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingCart as CartIcon, 
  Search as SearchIcon, 
  Sparkles as SparkleIcon,
  PackageSearch as EmptyIcon,
  X as CloseIcon 
} from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [dark, setDark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const inputRef = useRef(null);

  const tabs = ["All", "Aesthetic Centre", "Mobiles", "Laptops", "Appliances", "Audio"];
  const isAestheticMode = activeTab === "Aesthetic Centre";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setIsScrolled(true);
      else { setIsScrolled(false); setIsFabOpen(false); }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isFabOpen && inputRef.current) inputRef.current.focus();
  }, [isFabOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data || []);
        setResults(data || []);
      } catch (err) { console.error(err); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...products];
      if (activeTab === "Aesthetic Centre") filtered = filtered.filter((p) => p.isAesthetic);
      else if (activeTab !== "All") filtered = filtered.filter((p) => p.category === activeTab);
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
      setResults(filtered);
      setIsLoading(false);
    }, 500); // Slightly increased for a visible "alive" loading state
    return () => clearTimeout(timer);
  }, [query, activeTab, products]);

  const getBestDeal = (product) => {
    const offers = [
      { platform: "Amazon", price: product.amazonPrice, link: product.amazonLink },
      { platform: "Flipkart", price: product.flipkartPrice, link: product.flipkartLink },
      { platform: "Myntra", price: product.myntraPrice, link: product.myntraLink },
      { platform: "Nykaa", price: product.nykaaPrice, link: product.nykaaLink },
    ].filter(offer => offer.price > 0);
    return offers.sort((a, b) => a.price - b.price)[0] || { platform: "None", price: 0, link: "#" };
  };

  return (
    <div className={`relative min-h-screen px-3 pb-24 transition-colors duration-700 ${
      isAestheticMode ? "bg-[#F5F5F0]" : (dark ? "bg-[#0a0a0a]" : "bg-[#f8fafc]")
    } ${isAestheticMode ? "text-[#4A4238]" : (dark ? "text-white" : "text-black")}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b -mx-3 mb-6 transition-all ${
        isAestheticMode ? "bg-white/40 border-[#D6D2C4]" : (dark ? "bg-black/40 border-white/5" : "bg-white/60 border-gray-200")
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center px-5 py-3 sm:py-5 relative">
          <div className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <CartIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${isAestheticMode ? "text-[#A89F91]" : "text-blue-500"}`} />
            <h1 className="text-lg sm:text-3xl font-bold tracking-tighter uppercase">DEAL<span className={isAestheticMode ? "text-[#A89F91]" : "text-blue-500"}>X</span></h1>
          </div>
          <div className="sm:absolute sm:right-8 top-1/2 sm:-translate-y-1/2">
            <button onClick={() => setDark(!dark)} className={`text-[9px] font-bold border-2 px-3 py-1 rounded-full uppercase transition-all hover:scale-110 active:scale-90 ${isAestheticMode ? "border-[#A89F91]/40 text-[#A89F91]" : "border-blue-500/20"}`}>
                {dark ? "LIGHT" : "DARK"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 mt-2 sm:mt-4">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight uppercase">
            FIND THE <span className={isAestheticMode ? "text-[#A89F91]" : "text-blue-500"}>{isAestheticMode ? "AESTHETIC" : "BEST DEALS"}</span> INSTANTLY
          </h2>
          <p className="text-gray-500 font-bold mt-1.5 text-[7px] sm:text-[10px] uppercase tracking-[0.4em]">Compare • Click • Save</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 justify-start sm:justify-center mb-10 overflow-x-auto pb-3 no-scrollbar px-4">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`whitespace-nowrap px-5 py-2 text-[9px] sm:text-[11px] font-bold rounded-full border-2 transition-all duration-300 hover:scale-105 active:scale-95 active:opacity-80 ${
                activeTab === tab 
                  ? (tab === "Aesthetic Centre" ? "bg-[#A89F91] border-[#8E8475] text-white" : "bg-blue-600 border-blue-500 text-white shadow-lg") 
                  : (isAestheticMode ? "border-[#D6D2C4] text-[#A89F91]" : (dark ? "bg-transparent border-white/10 text-gray-400" : "bg-white border-black/5 text-gray-500"))
              }`}
            >
              {tab === "Aesthetic Centre" && <SparkleIcon className="w-3 h-3 inline mr-1" />} {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TOP SEARCH BAR */}
        <div className={`w-full max-w-3xl mx-auto mb-16 px-4 transition-all duration-500 ${isScrolled ? "opacity-0 pointer-events-none -translate-y-10" : "opacity-100"}`}>
            <div className={`flex items-center rounded-2xl border-2 p-1 transition-all duration-300 focus-within:border-blue-500 ${
              isAestheticMode ? "bg-[#EAE7DD] border-[#D6D2C4]" : (dark ? "bg-white/5 border-white/10" : "bg-white border-black/10 shadow-sm")
            }`}>
              <SearchIcon className={`ml-5 w-4 h-4 text-gray-400 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
              
              <input 
                placeholder="Search products..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="w-full bg-transparent px-4 py-2 text-sm sm:text-base font-bold outline-none placeholder:text-gray-500" 
              />

              <button className={`
                hidden sm:block px-8 py-2.5 rounded-xl font-bold transition-all duration-300 mr-1
                hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]
                active:scale-95 active:brightness-90
                ${isAestheticMode 
                  ? "bg-[#8E8475] text-white hover:shadow-[0_0_20px_rgba(142,132,117,0.4)]" 
                  : "bg-red-600 text-white shadow-lg shadow-red-600/20"
                }
              `}>
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
        </div>

        {/* RESULTS GRID OR EMPTY STATE */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 px-4">
            {results.map((product, index) => {
              const best = getBestDeal(product);
              return (
                <div key={index} className={`group relative p-3 sm:p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between hover:-translate-y-3 active:scale-[0.98] ${
                  isAestheticMode ? "bg-[#EAE7DD] border-[#D6D2C4]" : (dark ? "bg-[#111] border-white/5 hover:border-blue-500/40" : "bg-white border-black/5 hover:border-blue-500/20")
                }`}>
                  <div className="flex flex-col gap-2 items-center text-center">
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-2 w-full sm:aspect-square aspect-[4/3] flex items-center justify-center">
                      <img src={product.image} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                    </div>
                    <h2 className="text-[10px] sm:text-sm font-bold line-clamp-2 leading-tight h-8 sm:h-10">{product.name}</h2>
                  </div>
                  
                  <div className={`mt-4 border-t pt-3 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 ${isAestheticMode ? "border-[#D6D2C4]" : "border-white/5"}`}>
                    <div className="flex flex-col items-center sm:items-start">
                      <span className={`text-lg sm:text-2xl font-bold tracking-tighter ${isAestheticMode ? "text-[#8E8475]" : "text-green-500"}`}>₹{best.price}</span>
                      <span className="text-[7px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">ON {best.platform}</span>
                    </div>
                    <button onClick={() => window.open(best.link, "_blank")} className={`w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[9px] sm:text-[11px] font-bold transition-all active:scale-90 ${
                      isAestheticMode ? "bg-[#8E8475] text-white hover:bg-[#746C5F]" : "bg-red-600 text-white hover:bg-red-700"
                    }`}>GRAB DEAL</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in duration-500">
            <EmptyIcon className={`w-16 h-16 mb-4 opacity-20 ${isAestheticMode ? "text-[#8E8475]" : "text-blue-500"}`} />
            <h3 className="text-xl font-bold uppercase tracking-tight">No Items Found</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">We couldn't find any deals for "{query}". Try checking your spelling or use different keywords.</p>
          </div>
        )}

        {/* FLOATING ACTION SEARCH */}
        <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-700 ${isScrolled ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-50"}`}>
          <div className={`flex items-center shadow-2xl border border-white/20 backdrop-blur-md rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden 
            ${isFabOpen ? "w-[280px] sm:w-[450px] h-14" : "w-14 h-14 animate-pulse-slow hover:scale-110 hover:shadow-blue-500/50"} 
            ${isAestheticMode ? "bg-[#8E8475] hover:bg-[#746C5F]" : "bg-blue-600 shadow-[0_10px_40px_rgba(37,99,235,0.5)]"}`}
          >
            <button 
              onClick={() => setIsFabOpen(!isFabOpen)} 
              className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-white active:scale-75 transition-all"
            >
              {isFabOpen ? <CloseIcon className="w-6 h-6" /> : <SearchIcon className="w-6 h-6" />}
            </button>
            <input 
              ref={inputRef} 
              type="text" 
              placeholder={isAestheticMode ? "Search aesthetic..." : "Search deals..."} 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className={`bg-transparent text-white font-bold placeholder:text-white/60 outline-none w-full transition-all duration-500 ${isFabOpen ? "px-2 opacity-100" : "w-0 opacity-0"}`} 
            />
          </div>
        </div>

        <style jsx global>{`
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.03); opacity: 0.95; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
          }
        `}</style>
      </main>
    </div>
  );
}
