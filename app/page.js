"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingCart as CartIcon, 
  Search as SearchIcon, 
  Sparkles as SparkleIcon,
  X as CloseIcon, 
  Share2 as ShareIcon,
  Loader2 as WheelIcon,
  Smartphone, 
  Laptop, 
  Tv, 
  Headphones, 
  LayoutGrid,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [dark, setDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSearching, setIsSearching] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const tabs = [
    { name: "All", icon: <LayoutGrid className="w-3 h-3 mr-1" /> },
    { name: "Aesthetic Centre", icon: <SparkleIcon className="w-3 h-3 mr-1" /> },
    { name: "Mobiles", icon: <Smartphone className="w-3 h-3 mr-1" /> },
    { name: "Laptops", icon: <Laptop className="w-3 h-3 mr-1" /> },
    { name: "Appliances", icon: <Tv className="w-3 h-3 mr-1" /> },
    { name: "Audio", icon: <Headphones className="w-3 h-3 mr-1" /> }
  ];

  const isAestheticMode = activeTab === "Aesthetic Centre";

  // Change 'heroImages' to 'heroSlides'
// Change 'heroImages' to 'heroSlides'
  const heroSlides = [
    { 
      title: "The Aesthetic Edit", 
      sub: "Minimalist Tech & Decor", 
      img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1664&auto=format&fit=crop" 
    },
    { 
      title: "Ultimate Workstations", 
      sub: "M3 Macbooks at Scraped Prices", 
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1652&auto=format&fit=crop" 
    },
    { 
    title: "Marshall Sound", 
    sub: "Vintage Design, Modern Power", 
    img: "https://images.unsplash.com/photo-1502798985865-1ab60332f46c?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
  }
  ];

  const softAppleSpring = { 
    type: "spring", 
    stiffness: 180, 
    damping: 24, 
    mass: 1.2 
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        if (rect.top < 0) setIsScrolled(true);
        else { setIsScrolled(false); setIsFabOpen(false); }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data || []);
        setResults(data || []);
        setIsLoading(false);
      } catch (err) { 
        console.error(err); 
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      let filtered = [...products];
      if (activeTab === "Aesthetic Centre") filtered = filtered.filter((p) => p.isAesthetic);
      else if (activeTab !== "All") filtered = filtered.filter((p) => p.category === activeTab);
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
      setResults(filtered);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, activeTab, products]);

  const getBestDeal = (product) => {
    const offers = [
      { platform: "Amazon", price: product.amazonPrice, link: product.amazonLink },
      { platform: "Flipkart", price: product.flipkartPrice, link: product.flipkartLink },
      { platform: "Myntra", price: product.myntraPrice, link: product.myntraLink },
      { platform: "Nykaa", price: product.nykaaPrice, link: product.nykaaLink },
    ].filter(offer => offer.price > 0);
    if (offers.length === 0) return { platform: "None", price: 0, link: "#", savings: 0 };
    const sorted = offers.sort((a, b) => a.price - b.price);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    return { ...best, savings: worst.price - best.price };
  };

  const handleShare = (name, link) => {
    navigator.clipboard.writeText(`Check out this deal on ${name}: ${link} - Shared via DealX`);
    alert("Deal link copied to clipboard!");
  };

  return (
    <div className={`relative min-h-screen px-3 pb-32 transition-colors duration-1000 ${
      isAestheticMode ? "bg-[#F5F5F0]" : (dark ? "bg-[#0a0a0a]" : "bg-[#f8fafc]")
    } ${isAestheticMode ? "text-[#4A4238]" : (dark ? "text-white" : "text-black")}`}>
      
      {/* HEADER - REMAINS IDENTICAL FOR PC */}
      <header className={`sticky top-0 z-[60] backdrop-blur-xl border-b -mx-3 mb-6 transition-colors duration-500 ${
        isAestheticMode ? "bg-white/40 border-[#D6D2C4]" : (dark ? "bg-black/40 border-white/5" : "bg-white/60 border-gray-200")
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center px-5 py-3 sm:py-5 relative">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={softAppleSpring} className="flex items-center gap-2 cursor-pointer">
            <CartIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${isAestheticMode ? "text-[#A89F91]" : "text-blue-500"}`} />
            <h1 className="text-lg sm:text-3xl font-bold tracking-tighter uppercase">DEAL<span className={isAestheticMode ? "text-[#A89F91]" : "text-blue-500"}>X</span></h1>
          </motion.div>
          <div className="sm:absolute sm:right-8 top-1/2 sm:-translate-y-1/2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={softAppleSpring} onClick={() => setDark(!dark)} className={`text-[10px] sm:text-[9px] font-bold border-2 px-3 py-1 rounded-full uppercase transition-colors duration-300 ${isAestheticMode ? "border-[#A89F91]/40 text-[#A89F91]" : "border-blue-500/20"}`}>
                {dark ? "LIGHT" : "DARK"}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto">
        
        {/* HERO SECTION - MOBILE HEIGHT OPTIMIZED */}
        <div className="px-2 sm:px-4 mb-8 sm:mb-12">
          <div className={`relative h-60 sm:h-[450px] w-full overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl transition-colors duration-700 ${isAestheticMode ? "border-4 border-white" : "border border-white/10"}`}>
            <AnimatePresence mode="wait">
              <motion.div key={currentHeroIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
                <img src={heroSlides[currentHeroIndex].img} className="w-full h-full object-cover scale-105" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end pb-10 sm:pb-24 px-8 sm:px-16 text-left">
                  <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-blue-400 text-[8px] sm:text-xs font-black uppercase tracking-[0.4em] mb-2 sm:mb-3">Hero Section</motion.span>
                  <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white text-2xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] sm:leading-[0.85] mb-3 sm:mb-4">{heroSlides[currentHeroIndex].title}</motion.h2>
                  <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/50 text-[9px] sm:text-sm font-bold uppercase tracking-widest">{heroSlides[currentHeroIndex].sub}</motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 opacity-70">
                <span className="text-white text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-md">Scroll down to search</span>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                    <ChevronDown className="text-white w-6 h-6 drop-shadow-md" />
                </motion.div>
            </div>
          </div>
        </div>

        {/* TABS - NO-SCROLLBAR FOR MOBILE */}
        <div className="flex gap-2 justify-start sm:justify-center mb-10 overflow-x-auto pb-4 no-scrollbar px-4">
          {tabs.map((tab, i) => (
            <motion.button 
              key={tab.name} 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...softAppleSpring, delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.name)} 
              className={`flex items-center whitespace-nowrap px-5 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[11px] font-bold rounded-full border-2 transition-colors duration-300 ${
                activeTab === tab.name 
                  ? (tab.name === "Aesthetic Centre" ? "bg-[#A89F91] border-[#8E8475] text-white shadow-lg" : "bg-blue-600 border-blue-500 text-white shadow-lg") 
                  : (isAestheticMode ? "border-[#D6D2C4] text-[#A89F91]" : (dark ? "bg-transparent border-white/10 text-gray-400" : "bg-white border-black/5 text-gray-500"))
              }`}>
              {tab.icon} {tab.name.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* SEARCH BAR - PC ONLY */}
        <motion.div 
          ref={searchContainerRef} 
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={softAppleSpring}
          className={`w-full max-w-3xl mx-auto mb-16 px-4 transition-all duration-700 ${isScrolled ? "opacity-0 pointer-events-none -translate-y-10" : "opacity-100"}`}
        >
            <motion.div whileFocusWithin={{ scale: 1.01 }} transition={softAppleSpring} className={`flex items-center rounded-[2rem] border-2 p-1.5 transition-colors duration-300 focus-within:border-blue-500 ${isAestheticMode ? "bg-[#EAE7DD] border-[#D6D2C4]" : (dark ? "bg-white/5 border-white/10" : "bg-white border-black/10 shadow-sm")}`}>
              <SearchIcon className="ml-5 w-4 h-4 text-gray-400" />
              <input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent px-4 py-3 text-sm sm:text-base font-bold outline-none placeholder:text-gray-500" />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={softAppleSpring} className={`hidden sm:flex items-center gap-2 px-10 py-3 rounded-[1.2rem] font-bold transition-colors duration-300 mr-1 ${isAestheticMode ? "bg-[#8E8475] text-white" : "bg-red-600 text-white"}`}>SEARCH</motion.button>
            </motion.div>
        </motion.div>

        {/* PRODUCT GRID - MOBILE DENSITY OPTIMIZED */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 px-2 sm:px-4 pb-10">
          <AnimatePresence>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="p-3 sm:p-6 rounded-[1.8rem] sm:rounded-[2.5rem] border animate-pulse bg-gray-300/10 border-white/5 h-64" />
              ))
            ) : results.length > 0 ? (
              results.map((product, index) => {
                const best = getBestDeal(product);
                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    whileHover={{ 
                        y: -10, 
                        scale: 1.02,
                        boxShadow: dark ? "0 20px 40px -20px rgba(59, 130, 246, 0.2)" : "0 20px 40px -20px rgba(0, 0, 0, 0.1)"
                    }} 
                    whileTap={{ scale: 0.98 }}
                    transition={softAppleSpring} 
                    key={index} 
                    className={`group relative p-4 sm:p-6 rounded-[1.8rem] sm:rounded-[2.5rem] border flex flex-col justify-between transition-colors duration-500 ${
                        isAestheticMode 
                        ? "bg-[#EAE7DD] border-[#D6D2C4]" 
                        : (dark ? "bg-[#111] border-white/5 hover:border-blue-500/30" : "bg-white border-black/5 hover:border-blue-500/10")
                    }`}
                  >
                    {best.savings > 0 && (
                      <div className={`absolute top-3 left-3 sm:top-5 sm:left-5 z-20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-tighter shadow-xl ${isAestheticMode ? "bg-white text-[#8E8475]" : "bg-green-500 text-white"}`}>
                        -₹{best.savings.toLocaleString('en-IN')}
                      </div>
                    )}
                    <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.8 }} transition={softAppleSpring} onClick={() => handleShare(product.name, best.link)} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-white/5 text-gray-500 hover:text-white transition-colors">
                      <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                    <div className="flex flex-col gap-2 items-center text-center">
                      <div className="relative overflow-hidden rounded-[1.2rem] sm:rounded-[1.5rem] bg-white p-2 w-full aspect-square flex items-center justify-center">
                        <motion.img whileHover={{ scale: 1.1 }} transition={softAppleSpring} src={product.image} className="w-full h-full object-contain" alt={product.name} />
                      </div>
                      <h2 className="text-[10px] sm:text-sm font-bold line-clamp-2 h-8 sm:h-10 px-1 leading-tight">{product.name}</h2>
                    </div>
                    <div className={`mt-3 sm:mt-4 border-t pt-2 sm:pt-3 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2 sm:gap-3 ${isAestheticMode ? "border-[#D6D2C4]" : "border-white/5"}`}>
                      <div className="flex flex-row justify-between w-full sm:w-auto sm:flex-col items-center sm:items-start">
                        <span className={`text-[13px] sm:text-2xl font-bold tracking-tighter ${isAestheticMode ? "text-[#8E8475]" : "text-green-500"}`}>₹{best.price.toLocaleString('en-IN')}</span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest sm:mt-1">{best.platform}</span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.04 }} 
                        whileTap={{ scale: 0.96 }} 
                        transition={softAppleSpring}
                        onClick={() => window.open(best.link, "_blank")} 
                        className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-[0.9rem] sm:rounded-xl text-[9px] sm:text-[11px] font-black transition-colors duration-300 ${isAestheticMode ? "bg-[#8E8475] text-white" : "bg-red-600 text-white"}`}
                      >
                        GRAB DEAL
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center py-20 opacity-30 uppercase tracking-[0.5em] font-bold text-[10px]">No Items Found</div>
            )}
          </AnimatePresence>
        </div>

        {/* STATUS FOOTER */}
        <div className="mt-20 sm:mt-32 py-10 border-t border-white/5 flex flex-col items-center gap-2 opacity-30">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
             <RefreshCw className="w-3 h-3 animate-spin-slow text-green-500" />
             <span>Engine Active</span>
             <span className="mx-2 opacity-20">|</span>
             <span>Last Sync: 2m ago</span>
           </div>
        </div>

        {/* HYBRID FAB - MOBILE ONLY SEARCH */}
        <div className={`fixed bottom-6 left-0 right-0 z-[100] px-4 flex justify-center transition-all duration-1000 ${isScrolled ? "translate-y-0 opacity-100 scale-100" : "translate-y-24 opacity-0 scale-50"}`}>
          <motion.div layout transition={softAppleSpring} className={`flex items-center shadow-2xl border border-white/20 backdrop-blur-xl rounded-[2rem] overflow-hidden 
            ${isFabOpen ? "w-full max-w-md h-16" : "w-14 h-14 animate-pulse-slow"} 
            ${isAestheticMode ? "bg-[#8E8475]" : "bg-blue-600"}`}>
            <button onClick={() => setIsFabOpen(!isFabOpen)} className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-white active:scale-75 transition-all">
              {isFabOpen ? <CloseIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
            </button>
            <input ref={inputRef} type="text" placeholder="Search Deals..." value={query} onChange={(e) => setQuery(e.target.value)} className={`bg-transparent text-white font-bold placeholder:text-white/60 outline-none w-full text-sm transition-all duration-500 ${isFabOpen ? "px-2 opacity-100" : "w-0 opacity-0"}`} />
            {isFabOpen && query && <button onClick={() => setQuery("")} className="px-4 text-white/50"><CloseIcon className="w-4 h-4" /></button>}
          </motion.div>
        </div>

        <style jsx global>{`
          @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.03); opacity: 0.97; } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
          .animate-spin-slow { animation: spin-slow 10s linear infinite; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          body { -webkit-tap-highlight-color: transparent; }
        `}</style>
      </main>
    </div>
  );
}
