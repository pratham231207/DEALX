"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShoppingCart as CartIcon,
  Search as SearchIcon,
  Sparkles as SparkleIcon,
  X as CloseIcon,
  Share2 as ShareIcon,
  Smartphone, Laptop, Tv, Headphones, LayoutGrid, RefreshCw,
  ChevronDown, ChevronLeft, ChevronRight, Menu as MenuIcon,
  Plus, Watch, Camera, Gamepad2, Home as HomeIcon,
  Bell, TrendingUp, ArrowUpDown, Filter, Layers,
  Zap, Clock, Sun, Moon, Copy, Check, Star, ExternalLink,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring as useMotionSpring } from "framer-motion";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── HAPTICS — richer multi-pattern system ───────────────────────────────────
const triggerHaptic = (type = "light") => {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  const patterns = {
    light:    [6],
    medium:   [14],
    heavy:    [30],
    success:  [8, 60, 8],          // double-tap feel
    error:    [40, 30, 40],        // buzz-buzz
    select:   [10],
    tab:      [4],
    purchase: [10, 40, 20, 40, 10], // triple pulse
    longPress:[40, 30, 8],
    dismiss:  [6, 20, 6],
  };
  navigator.vibrate(patterns[type] ?? [6]);
};

// ─── MOTION PRESETS ───────────────────────────────────────────────────────────
const appleSpring  = { type: "spring", stiffness: 340, damping: 32, mass: 0.85 };
const gentleSpring = { type: "spring", stiffness: 220, damping: 28, mass: 0.8  };
const snappySpring = { type: "spring", stiffness: 500, damping: 42, mass: 0.9  };
const appleEase    = [0.25, 0.46, 0.45, 0.94];
const heroEase     = [0.16, 1, 0.3, 1]; // Apple-style over-shoot ease

// ─── SCROLL-DOWN ARROW (Apple bounce) ────────────────────────────────────────
function ScrollArrow({ accentColor, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Scroll down to search"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, ...gentleSpring }}
      className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-none"
      onPointerDown={() => triggerHaptic("light")}
    >
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: appleEase }}
        className="text-white/60 text-[11px] font-semibold tracking-[0.2em] uppercase select-none"
      >
        Scroll to Search
      </motion.span>

      {/* Bouncing arrow container */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{
          y: {
            duration: 1.4,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
            repeatType: "loop",
          },
        }}
        className="flex flex-col items-center"
      >
        {/* Three chevrons stacked — Apple's classic fade-cascade arrow */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2 + i * 0.28, 0.9, 0.2 + i * 0.28] }}
            transition={{
              opacity: {
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              },
            }}
          >
            <ChevronDown
              className="w-5 h-5 text-white -mt-1.5"
              strokeWidth={2.5}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.button>
  );
}

// ─── SKELETON CARD (memoised + shimmer) ──────────────────────────────────────
const SkeletonCard = ({ dark }) => (
  <div
    className={`rounded-2xl border overflow-hidden ${
      dark ? "bg-[#141414] border-white/[0.06]" : "bg-white border-gray-200/70"
    }`}
  >
    <div className="p-3 sm:p-4">
      <div
        className="h-28 sm:h-36 rounded-xl mb-3 relative overflow-hidden"
        style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f0f0f0" }}
      >
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
      <div
        className="h-2.5 rounded-full mb-2 w-full"
        style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f0f0f0" }}
      />
      <div
        className="h-2.5 rounded-full w-2/3"
        style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f0f0f0" }}
      />
    </div>
    <div
      className={`p-3 sm:p-4 border-t ${
        dark ? "border-white/[0.04]" : "border-gray-100"
      }`}
    >
      <div
        className="h-4 w-1/3 rounded-full mb-3"
        style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f0f0f0" }}
      />
      <div
        className="h-9 rounded-xl"
        style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f0f0f0" }}
      />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  // ─── STATE ──────────────────────────────────────────────────────────────────
  const [products,       setProducts]      = useState([]);
  const [query,          setQuery]         = useState("");
  const [results,        setResults]       = useState([]);
  const [activeTab,      setActiveTab]     = useState("All");
  const [dark,           setDark]          = useState(true);
  const [isLoading,      setIsLoading]     = useState(true);
  const [isSearching,    setIsSearching]   = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isScrolled,     setIsScrolled]    = useState(false);
  const [isFabOpen,      setIsFabOpen]     = useState(false);
  const [isMenuOpen,     setIsMenuOpen]    = useState(false);
  const [isMoreOpen,     setIsMoreOpen]    = useState(false);
  const [suggestions,    setSuggestions]   = useState([]);
  const [showSuggestions,setShowSuggestions] = useState(false);
  const [currentPage,    setCurrentPage]   = useState(1);
  const [isMobile,       setIsMobile]      = useState(false);
  const [selectedProduct,setSelectedProduct] = useState(null);
  const [watchedDeals,   setWatchedDeals]  = useState([]);
  const [liveNotification,setLiveNotification] = useState(null);
  const [compareList,    setCompareList]   = useState([]);
  const [isCompareOpen,  setIsCompareOpen] = useState(false);
  const [maxPrice,       setMaxPrice]      = useState(200000);
  const [sortOrder,      setSortOrder]     = useState("relevance");
  const [isFilterOpen,   setIsFilterOpen]  = useState(false);
  const [hourTimer,      setHourTimer]     = useState("");
  const [user,           setUser]          = useState(null);
  const [copiedDeal,     setCopiedDeal]    = useState(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [heroVisible,    setHeroVisible]   = useState(true);

  // ─── REFS ───────────────────────────────────────────────────────────────────
  const suggestionContainerRef = useRef(null);
  const moreMenuRef            = useRef(null);
  const inputRef               = useRef(null);
  const searchContainerRef     = useRef(null);
  const heroIntervalRef        = useRef(null);
  const heroSectionRef         = useRef(null);

  // ─── SCROLL PHYSICS ─────────────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const heroScale   = useTransform(scrollY, [0, 600], [1, 1.06]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const springScrollY = useMotionSpring(scrollY, { stiffness: 100, damping: 30 });

  // ─── DEVICE CHECK ───────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── AUTH ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    triggerHaptic("medium");
    if (user) {
      await supabase.auth.signOut();
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    }
  };

  // ─── WATCHLIST ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const sync = async () => {
      const saved = localStorage.getItem("dealx_watchlist");
      if (saved) setWatchedDeals(JSON.parse(saved));
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const { data, error } = await supabase
          .from("user_watchlists")
          .select("product_name")
          .eq("user_id", u.id);
        if (data && !error) {
          const names = data.map((r) => r.product_name);
          setWatchedDeals(names);
          localStorage.setItem("dealx_watchlist", JSON.stringify(names));
        }
      }
    };
    sync();
  }, [user]);

  const toggleWatch = useCallback(async (e, product) => {
    e.stopPropagation();
    triggerHaptic("success");
    const { data: { user: u } } = await supabase.auth.getUser();
    const watching = watchedDeals.includes(product.name);
    const updated  = watching
      ? watchedDeals.filter((n) => n !== product.name)
      : [...watchedDeals, product.name];
    if (u) {
      if (watching) {
        await supabase.from("user_watchlists").delete().match({ user_id: u.id, product_name: product.name });
      } else {
        await supabase.from("user_watchlists").insert({ user_id: u.id, product_name: product.name });
      }
    }
    setWatchedDeals(updated);
    localStorage.setItem("dealx_watchlist", JSON.stringify(updated));
  }, [watchedDeals]);

  // ─── LIVE NOTIFICATIONS ─────────────────────────────────────────────────────
  useEffect(() => {
    const events = [
      "just grabbed an iPhone 15 Pro deal!",
      "found a 45% price drop on AirPods Pro.",
      "is comparing M3 MacBook prices.",
      "added a 4K OLED TV to their watchlist.",
      "saved ₹5,200 on a Gaming Laptop.",
    ];
    const names = ["Arav", "Sanya", "Rahul", "Priya", "Vikram"];
    const id = setInterval(() => {
      setLiveNotification(
        `${names[Math.floor(Math.random() * names.length)]} ${events[Math.floor(Math.random() * events.length)]}`
      );
      setTimeout(() => setLiveNotification(null), 5000);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  // ─── COMPARE ────────────────────────────────────────────────────────────────
  const toggleCompare = useCallback((e, product) => {
    e.stopPropagation();
    triggerHaptic("select");
    if (compareList.find((p) => p.name === product.name)) {
      setCompareList((c) => c.filter((p) => p.name !== product.name));
    } else if (compareList.length < 3) {
      setCompareList((c) => [...c, product]);
      setIsCompareOpen(true);
    }
  }, [compareList]);

  // ─── DEAL LOGIC ─────────────────────────────────────────────────────────────
  const getBestDeal = useCallback((product) => {
    if (!product) return { platform: "None", price: 0, link: "#", savings: 0 };
    const offers = [
      { platform: "Amazon",   price: product.amazonPrice,   link: product.amazonLink   },
      { platform: "Flipkart", price: product.flipkartPrice, link: product.flipkartLink },
      { platform: "Myntra",   price: product.myntraPrice,   link: product.myntraLink   },
      { platform: "Nykaa",    price: product.nykaaPrice,    link: product.nykaaLink    },
    ].filter((o) => o.price > 0);
    if (!offers.length) return { platform: "None", price: 0, link: "#", savings: 0 };
    const sorted = [...offers].sort((a, b) => a.price - b.price);
    return { ...sorted[0], savings: sorted[sorted.length - 1].price - sorted[0].price };
  }, []);

  const getDealScore = useCallback((product) => {
    const { price, savings } = getBestDeal(product);
    if (!price) return { score: 0, percent: "0" };
    const pct = (savings / (price + savings)) * 100;
    return {
      score: Math.min(Math.max((pct / 5) + 5, 4.2), 9.9).toFixed(1),
      percent: pct.toFixed(0),
    };
  }, [getBestDeal]);

  // ─── ENRICHED RESULTS (compute once) ────────────────────────────────────────
  const enrichedResults = useMemo(
    () => results.map((p) => ({ ...p, _best: getBestDeal(p), _score: getDealScore(p) })),
    [results, getBestDeal, getDealScore]
  );

  const finalResults = useMemo(() => {
    let list = enrichedResults.filter((p) => p._best.price <= maxPrice || p._best.price === 0);
    if (sortOrder === "priceLow") list = [...list].sort((a, b) => a._best.price - b._best.price);
    else if (sortOrder === "savings") list = [...list].sort((a, b) => parseFloat(b._score.percent) - parseFloat(a._score.percent));
    return list;
  }, [enrichedResults, maxPrice, sortOrder]);

  // ─── PAGINATION ─────────────────────────────────────────────────────────────
  const itemsPerPage  = isMobile ? 40 : 80;
  const pageLimit     = isMobile ? 4 : 8;
  const totalPages    = Math.ceil(finalResults.length / itemsPerPage);
  const paginatedResults = useMemo(
    () => finalResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [finalResults, currentPage, itemsPerPage]
  );

  const getPageNumbers = () => {
    const half  = Math.floor(pageLimit / 2);
    let start   = Math.max(currentPage - half, 1);
    let end     = Math.min(start + pageLimit - 1, totalPages);
    if (end - start + 1 < pageLimit) start = Math.max(end - pageLimit + 1, 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // ─── HOUR TIMER ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const n = new Date();
      setHourTimer(`${59 - n.getMinutes()}:${String(59 - n.getSeconds()).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── HERO AUTO-PLAY ─────────────────────────────────────────────────────────
  useEffect(() => {
    heroIntervalRef.current = setInterval(
      () => setCurrentHeroIndex((p) => (p + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(heroIntervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── SCROLL DETECTION ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 10);
      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        if (rect.top < 0) {
          setIsScrolled(true);
          setHeroVisible(false);
        } else {
          setIsScrolled(false);
          setIsFabOpen(false);
          setIsMenuOpen(false);
          setHeroVisible(true);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── OUTSIDE CLICK ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(e.target))
        setShowSuggestions(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target))
        setIsMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── PRODUCTS FETCH ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/products");
        const data = await res.json();
        setProducts(data || []);
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── SEARCH DEBOUNCE ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsSearching(true);
    setCurrentPage(1);
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      if (q.length > 1) {
        setSuggestions(products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      let filtered = [...products];
      if (activeTab === "Aesthetic Centre") filtered = filtered.filter((p) => p.isAesthetic);
      else if (activeTab !== "All" && activeTab !== "More")
        filtered = filtered.filter((p) => p.category === activeTab);
      setResults(filtered.filter((p) => p.name.toLowerCase().includes(q)));
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query, activeTab, products]);

  // ─── SHARE ──────────────────────────────────────────────────────────────────
  const handleShare = useCallback((name, link) => {
    triggerHaptic("success");
    navigator.clipboard.writeText(`Check out this deal: ${link} — Shared via DealX`);
    setCopiedDeal(name);
    setTimeout(() => setCopiedDeal(null), 2000);
  }, []);

  // ─── SCROLL TO SEARCH ───────────────────────────────────────────────────────
  const scrollToSearch = useCallback(() => {
    triggerHaptic("light");
    searchContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ─── STATIC DATA ────────────────────────────────────────────────────────────
  const heroSlides = [
    {
      title: "The Aesthetic Edit",
      sub:   "Minimalist Tech & Decor",
      img:   "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1664&auto=format&fit=crop",
    },
    {
      title: "Ultimate Workstations",
      sub:   "M3 MacBooks at Best Prices",
      img:   "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1652&auto=format&fit=crop",
    },
    {
      title: "Premium Sound",
      sub:   "Studio Quality Audio",
      img:   "https://images.unsplash.com/photo-1502798985865-1ab60332f46c?q=80&w=1332&auto=format&fit=crop",
    },
  ];

  const tabs = [
    { name: "All",              icon: <LayoutGrid  className="w-4 h-4" /> },
    { name: "Aesthetic Centre", icon: <SparkleIcon className="w-4 h-4" /> },
    { name: "Mobiles",          icon: <Smartphone  className="w-4 h-4" /> },
    { name: "Laptops",          icon: <Laptop      className="w-4 h-4" /> },
    { name: "Appliances",       icon: <Tv          className="w-4 h-4" /> },
    { name: "Audio",            icon: <Headphones  className="w-4 h-4" /> },
    { name: "More",             icon: <Plus        className="w-4 h-4" />, isDropdown: true },
  ];

  const moreCategories = [
    { name: "Watches", icon: <Watch    className="w-4 h-4" /> },
    { name: "Cameras", icon: <Camera   className="w-4 h-4" /> },
    { name: "Gaming",  icon: <Gamepad2 className="w-4 h-4" /> },
    { name: "Home",    icon: <HomeIcon className="w-4 h-4" /> },
  ];

  const isAestheticMode = activeTab === "Aesthetic Centre";

  // ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
  const T = {
    bg:          isAestheticMode ? "bg-gradient-to-br from-[#F5F5F0] to-[#EFEFEA]" : dark ? "bg-[#090909]" : "bg-[#F0F2F5]",
    text:        isAestheticMode ? "text-[#2C2421]" : dark ? "text-white" : "text-gray-900",
    subtext:     dark ? "text-white/35" : "text-gray-400",
    card:        isAestheticMode ? "bg-[#F5F5F0] border-[#D6D2C4]" : dark ? "bg-[#141414] border-white/[0.06]" : "bg-white border-gray-200/70",
    header:      isAestheticMode ? "bg-white/85 border-[#D6D2C4]/60" : dark ? "bg-[#090909]/85 border-white/[0.06]" : "bg-white/92 border-gray-200/60",
    surface:     isAestheticMode ? "bg-white/90 border-[#D6D2C4]"   : dark ? "bg-[#1a1a1a] border-white/[0.06]" : "bg-white border-gray-200",
    accent:      isAestheticMode ? "#8E8475" : "#2563eb",
    accentCls:   isAestheticMode ? "bg-[#8E8475]"   : "bg-blue-600",
    accentTextCls: isAestheticMode ? "text-[#8E8475]" : "text-blue-600",
    pill:        isAestheticMode ? "bg-[#8E8475] border-[#6d6659] text-white shadow-md" : "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/25",
    pillIdle:    isAestheticMode
      ? "border-[#D6D2C4] text-[#8E8475] bg-[#F0EFE8] hover:bg-[#E8E7DF]"
      : dark
        ? "border-white/[0.07] text-white/45 hover:border-white/18 hover:text-white bg-white/[0.03] hover:bg-white/[0.07]"
        : "border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 bg-white shadow-sm",
    inputBg:     isAestheticMode
      ? "border-[#D6D2C4] bg-white/80 focus-within:border-[#8E8475]"
      : dark
        ? "border-white/[0.07] bg-white/[0.04] focus-within:border-blue-500/35 focus-within:bg-white/[0.06]"
        : "border-gray-200 bg-white focus-within:border-blue-500 shadow-sm focus-within:shadow-blue-500/12",
    priceCls:    isAestheticMode ? "text-[#8E8475]" : "text-emerald-500",
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className={`relative min-h-screen ${T.bg} ${T.text}`}
      style={{ transition: "background 0.6s cubic-bezier(0.25,0.46,0.45,0.94), color 0.3s ease" }}
    >

      {/* ── GLOBAL STYLES ──────────────────────────────────────────────────── */}
      <style jsx global>{`
        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        html {
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
          /* prevent layout bounce on iOS */
          overscroll-behavior-y: none;
        }
        body {
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          /* GPU-accelerate scrolling on iOS */
          -webkit-overflow-scrolling: touch;
        }

        /* No scrollbar util */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Thin global scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(120,120,128,0.28); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(120,120,128,0.48); }

        /* Range input */
        input[type="range"] { -webkit-appearance: none; appearance: none; cursor: pointer; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #2563eb; cursor: pointer;
          border: 2.5px solid white;
          box-shadow: 0 2px 10px rgba(37,99,235,0.50);
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover  { transform: scale(1.25); }
        input[type="range"]::-webkit-slider-thumb:active { transform: scale(1.15); }
        input[type="range"]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #2563eb; border: 2.5px solid white;
          box-shadow: 0 2px 10px rgba(37,99,235,0.50);
        }

        /* Skeleton shimmer */
        @keyframes skshimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: skshimmer 1.4s infinite linear;
        }
        @keyframes skshimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

        /* Spinner */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Full-height hero — only on desktop */
        .hero-fullscreen {
          height: 100dvh;
          min-height: 600px;
        }
        @media (max-width: 767px) {
          .hero-fullscreen {
            height: 64vw;
            min-height: 220px;
            max-height: 380px;
          }
        }

        /* Prevent text selection during swipe */
        .no-select { user-select: none; -webkit-user-select: none; }

        /* Bigger tap targets on mobile */
        @media (max-width: 767px) {
          button, [role="button"] { min-height: 44px; min-width: 44px; }
          .tap-sm { min-height: 36px; min-width: 36px; }
        }
      `}</style>

      {/* ── AMBIENT BLOBS ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {dark && !isAestheticMode && (
          <>
            <div className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full opacity-[0.03]"
              style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
            <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          </>
        )}
        {!dark && !isAestheticMode && (
          <>
            <div className="absolute -top-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-[0.07]"
              style={{ background: "radial-gradient(circle, #93c5fd, transparent 70%)" }} />
            <div className="absolute -bottom-1/4 -left-1/4 w-[40vw] h-[40vw] rounded-full opacity-[0.05]"
              style={{ background: "radial-gradient(circle, #a5b4fc, transparent 70%)" }} />
          </>
        )}
      </div>

      {/* ── LIVE NOTIFICATION ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {liveNotification && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 6 }}
            transition={appleSpring}
            className={`fixed bottom-24 sm:bottom-28 left-4 sm:left-5 z-[100] max-w-[260px] sm:max-w-xs backdrop-blur-2xl rounded-2xl border overflow-hidden pointer-events-auto ${
              dark
                ? "bg-[#1c1c1e]/96 border-white/[0.09] shadow-2xl shadow-black/50"
                : "bg-white/97 border-gray-200/80 shadow-xl shadow-black/[0.07]"
            }`}
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className={`text-[11px] sm:text-xs font-medium leading-snug ${dark ? "text-white/75" : "text-gray-700"}`}>
                {liveNotification}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPARE DRAWER ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCompareOpen && compareList.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsCompareOpen(false)}
              className="fixed inset-0 z-[190] bg-black/25 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={appleSpring}
              drag="y" dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 80) { triggerHaptic("dismiss"); setIsCompareOpen(false); } }}
              className={`fixed bottom-0 left-0 right-0 z-[200] border-t backdrop-blur-2xl rounded-t-[28px] overflow-hidden ${
                isAestheticMode
                  ? "bg-white/98 border-[#D6D2C4]"
                  : dark
                    ? "bg-[#1c1c1e]/98 border-white/[0.08]"
                    : "bg-white/98 border-gray-200"
              } shadow-2xl`}
            >
              <div className="flex justify-center pt-3 pb-0.5">
                <div className={`w-8 h-1 rounded-full ${dark ? "bg-white/20" : "bg-gray-300"}`} />
              </div>
              <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-8">
                <div className="flex justify-between items-center mb-5">
                  <h3 className={`text-base font-semibold ${T.text}`}>Compare ({compareList.length}/3)</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={snappySpring}
                    onClick={() => { setIsCompareOpen(false); triggerHaptic("dismiss"); }}
                    className={`p-2 rounded-full ${dark ? "hover:bg-white/[0.08]" : "hover:bg-gray-100"} transition-colors`}
                  >
                    <CloseIcon className="w-[18px] h-[18px]" />
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {compareList.map((p, i) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ ...appleSpring, delay: i * 0.07 }}
                      className="relative group"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={snappySpring}
                        onClick={() => { setCompareList((c) => c.filter((x) => x.name !== p.name)); triggerHaptic("light"); }}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1.5 z-10 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </motion.button>
                      <div className={`rounded-2xl border p-3.5 space-y-3 ${
                        isAestheticMode ? "bg-[#F5F5F0] border-[#D6D2C4]"
                          : dark ? "bg-[#222] border-white/[0.07]"
                          : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="h-24 bg-white rounded-xl p-2.5 flex items-center justify-center">
                          <img src={p.image} className="h-full object-contain" alt={p.name} />
                        </div>
                        <p className={`text-xs font-semibold line-clamp-2 leading-snug ${T.text}`}>{p.name}</p>
                        <p className={`text-base font-bold ${T.priceCls}`}>₹{getBestDeal(p).price.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  {compareList.length < 3 && (
                    <div className={`rounded-2xl border-2 border-dashed flex items-center justify-center p-8 ${
                      dark ? "border-white/[0.08] text-white/20" : "border-gray-200 text-gray-300"
                    }`}>
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                        <p className="text-xs font-medium">Add product</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PRODUCT DETAIL MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: appleEase }}
              onClick={() => { setSelectedProduct(null); triggerHaptic("dismiss"); }}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={appleSpring}
              drag="y" dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 60) { triggerHaptic("dismiss"); setSelectedProduct(null); } }}
              className={`relative w-full sm:max-w-xl rounded-t-[32px] sm:rounded-3xl overflow-y-auto max-h-[90vh] border ${
                isAestheticMode
                  ? "bg-[#F5F5F0] border-[#D6D2C4]"
                  : dark ? "bg-[#1c1c1e] border-white/[0.08]"
                  : "bg-white border-gray-100"
              } shadow-2xl`}
            >
              <div className="flex justify-center pt-3.5 sm:hidden">
                <div className={`w-8 h-1 rounded-full ${dark ? "bg-white/20" : "bg-gray-300"}`} />
              </div>
              <div className="p-6 sm:p-8">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={snappySpring}
                  onClick={() => { setSelectedProduct(null); triggerHaptic("dismiss"); }}
                  className={`hidden sm:flex absolute top-5 right-5 p-2 rounded-full items-center justify-center ${
                    dark ? "bg-white/[0.08] hover:bg-white/[0.14] text-white/60" : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                  } transition-colors`}
                >
                  <CloseIcon className="w-[18px] h-[18px]" />
                </motion.button>
                <div className="flex flex-col items-center gap-5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...appleSpring, delay: 0.06 }}
                    className={`w-48 h-48 sm:w-56 sm:h-56 rounded-3xl p-5 flex items-center justify-center ${
                      dark ? "bg-white/[0.04]" : "bg-gray-50"
                    } border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}
                  >
                    <img src={selectedProduct.image} className="w-full h-full object-contain" alt={selectedProduct.name} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...appleSpring, delay: 0.1 }}
                    className="text-center"
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${T.accentTextCls}`}>
                      Best on {getBestDeal(selectedProduct).platform}
                    </p>
                    <h2 className={`text-lg sm:text-xl font-bold leading-snug ${T.text}`}>{selectedProduct.name}</h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...appleSpring, delay: 0.14 }}
                    className="w-full space-y-2.5"
                  >
                    <motion.button
                      whileHover={{ scale: 1.015, filter: "brightness(1.06)" }}
                      whileTap={{ scale: 0.985 }}
                      transition={snappySpring}
                      onPointerDown={() => triggerHaptic("purchase")}
                      onClick={() => window.open(getBestDeal(selectedProduct).link, "_blank")}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white ${T.accentCls}`}
                      style={{ boxShadow: `0 4px 20px ${T.accent}40` }}
                    >
                      <CartIcon className="w-[18px] h-[18px]" />
                      Buy for ₹{getBestDeal(selectedProduct).price.toLocaleString("en-IN")}
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </motion.button>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          active: copiedDeal === selectedProduct.name,
                          activeCls: "bg-emerald-500/12 text-emerald-500 border-emerald-500/20",
                          icon: copiedDeal === selectedProduct.name
                            ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                            : <><Copy className="w-3.5 h-3.5" /> Share</>,
                          action: () => handleShare(selectedProduct.name, getBestDeal(selectedProduct).link),
                        },
                        {
                          active: watchedDeals.includes(selectedProduct.name),
                          activeCls: "bg-amber-500/12 text-amber-500 border-amber-500/20",
                          icon: <>
                            <Bell className={`w-3.5 h-3.5 ${watchedDeals.includes(selectedProduct.name) ? "fill-current" : ""}`} />
                            {watchedDeals.includes(selectedProduct.name) ? "Watching" : "Watch"}
                          </>,
                          action: (e) => toggleWatch(e ?? { stopPropagation: () => {} }, selectedProduct),
                        },
                      ].map((b, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={snappySpring}
                          onPointerDown={() => triggerHaptic("light")}
                          onClick={b.action}
                          className={`py-3.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 border transition-all ${
                            b.active ? b.activeCls
                              : dark ? "bg-white/[0.05] hover:bg-white/[0.1] text-white/70 border-white/[0.08]"
                              : "bg-gray-100 hover:bg-gray-150 text-gray-700 border-gray-200"
                          }`}
                        >
                          {b.icon}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-[60] border-b transition-all duration-500 ${T.header} ${
          headerScrolled ? "backdrop-blur-2xl" : "backdrop-blur-xl"
        }`}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
          style={{ height: isMobile ? "52px" : "60px" }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={snappySpring}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); triggerHaptic("light"); }}
          >
            <div className={`p-2 rounded-xl ${isAestheticMode ? "bg-[#8E8475]/10" : dark ? "bg-blue-500/10" : "bg-blue-600/8"}`}>
              <CartIcon className={`w-5 h-5 ${isAestheticMode ? "text-[#8E8475]" : "text-blue-600"}`} />
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              DEAL<span className={isAestheticMode ? "text-[#8E8475]" : "text-blue-600"}>X</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={snappySpring}
              onPointerDown={() => triggerHaptic("medium")}
              onClick={handleAuth}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl border transition-all ${
                user
                  ? isAestheticMode ? "border-[#8E8475] bg-[#8E8475] text-white"
                    : "border-blue-600 bg-blue-600 text-white"
                  : isAestheticMode ? "border-[#D6D2C4] text-[#8E8475] hover:bg-[#EDECE5]"
                  : dark ? "border-white/[0.08] text-white/60 hover:bg-white/[0.07] hover:text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100 bg-white"
              }`}
            >
              {user ? (
                <>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="hidden sm:inline">Sign Out</span>
                </>
              ) : "Sign In"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} transition={snappySpring}
              onPointerDown={() => triggerHaptic("light")}
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2.5 rounded-xl border transition-all ${
                isAestheticMode ? "border-[#D6D2C4] hover:bg-[#EDECE5]"
                  : dark ? "border-white/[0.08] hover:bg-white/[0.07]"
                  : "border-gray-200 hover:bg-gray-100 bg-white"
              }`}
            >
              <AnimatePresence mode="wait">
                {dark
                  ? <motion.div key="sun" initial={{ rotate: -25, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 25, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Sun className="w-4 h-4 text-amber-400" />
                    </motion.div>
                  : <motion.div key="moon" initial={{ rotate: 25, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -25, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Moon className="w-4 h-4 text-slate-500" />
                    </motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── HERO ──────────────────────────────────────────────────────────
            PC  = 100dvh (full screen)
            Mobile = capped at ~380px via CSS class 'hero-fullscreen'
        ─────────────────────────────────────────────────────────────────── */}
        <div className="pt-5 sm:pt-0 pb-0 sm:pb-0 -mx-4 sm:-mx-6">
          <div
            ref={heroSectionRef}
            className={`hero-fullscreen relative overflow-hidden ${
              isAestheticMode ? "border-b border-[#D6D2C4]"
                : dark ? "border-b border-white/[0.06]"
                : "border-b border-gray-200/70"
            }`}
          >
            {/* Parallax image layer */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroIndex}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: heroEase }}
                className="absolute inset-0"
              >
                <motion.img
                  src={heroSlides[currentHeroIndex].img}
                  className="w-full h-full object-cover"
                  alt={heroSlides[currentHeroIndex].title}
                  loading="eager"
                  /* Subtle parallax on desktop only */
                  style={{ scale: isMobile ? 1 : heroScale }}
                />
                {/* Gradient overlay — stronger at bottom for text legibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.08) 75%, transparent 100%)",
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Text content (bottom-left) */}
            <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-14 px-5 sm:px-10 pointer-events-none">
              <motion.span
                key={`sub-${currentHeroIndex}`}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...appleSpring, delay: 0.1 }}
                className="text-blue-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1.5"
              >
                {heroSlides[currentHeroIndex].sub}
              </motion.span>
              <motion.h2
                key={`title-${currentHeroIndex}`}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...appleSpring, delay: 0.18 }}
                className="text-white text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
              >
                {heroSlides[currentHeroIndex].title}
              </motion.h2>
            </div>

            {/* Dot nav (bottom-right) */}
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-1.5 z-20">
              {heroSlides.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    setCurrentHeroIndex(i);
                    clearInterval(heroIntervalRef.current);
                    triggerHaptic("tab");
                  }}
                  animate={{ width: i === currentHeroIndex ? 20 : 6, opacity: i === currentHeroIndex ? 1 : 0.4 }}
                  transition={snappySpring}
                  aria-label={`Slide ${i + 1}`}
                  className="h-1.5 rounded-full bg-white tap-sm"
                />
              ))}
            </div>

            {/* ── SCROLL ARROW — desktop only, centered at very bottom ───── */}
            {!isMobile && (
              <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
                style={{ opacity: heroOpacity }}
              >
                <ScrollArrow accentColor={T.accent} onClick={scrollToSearch} />
              </motion.div>
            )}
          </div>

          {/* Mobile 'scroll to search' hint — appears below hero, not overlaid */}
          {isMobile && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ...gentleSpring }}
              onClick={scrollToSearch}
              onPointerDown={() => triggerHaptic("light")}
              className={`w-full flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest uppercase ${T.subtext}`}
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </motion.div>
              Scroll to Search
            </motion.button>
          )}
        </div>

        {/* Spacing after hero */}
        <div className="pt-7 sm:pt-10" />

        {/* ── CATEGORY TABS ─────────────────────────────────────────────── */}
        <div className="mb-7">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {tabs.map((tab, i) => (
              <motion.button
                key={tab.name}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...gentleSpring, delay: i * 0.04 }}
                whileHover={{ y: -1.5, scale: 1.015 }} whileTap={{ scale: 0.96 }}
                onPointerDown={() => triggerHaptic("tab")}
                onClick={() => tab.isDropdown ? setIsMoreOpen(!isMoreOpen) : setActiveTab(tab.name)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full border-2 flex-shrink-0 transition-all duration-200 ${
                  activeTab === tab.name || (tab.isDropdown && moreCategories.some((c) => c.name === activeTab))
                    ? T.pill : T.pillIdle
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.name}</span>
                {tab.isDropdown && (
                  <motion.div animate={{ rotate: isMoreOpen ? 180 : 0 }} transition={snappySpring}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {isMoreOpen && (
              <motion.div
                ref={moreMenuRef}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={appleSpring}
                className={`mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl border ${T.surface}`}
              >
                {moreCategories.map((cat, i) => (
                  <motion.button
                    key={cat.name}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...appleSpring, delay: i * 0.04 }}
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                    onPointerDown={() => triggerHaptic("tab")}
                    onClick={() => { setActiveTab(cat.name); setIsMoreOpen(false); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === cat.name
                        ? isAestheticMode ? "bg-[#8E8475] text-white" : "bg-blue-600 text-white"
                        : dark ? "text-white/45 hover:bg-white/[0.07] hover:text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SEARCH BAR ────────────────────────────────────────────────── */}
        <motion.div
          ref={searchContainerRef}
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={appleSpring}
          className={`relative ${showSuggestions ? "z-40" : "z-10"} mb-9`}
        >
          <motion.div
            whileFocusWithin={{ scale: 1.006 }} transition={gentleSpring}
            className={`relative flex items-center rounded-2xl border-2 overflow-hidden transition-all duration-200 ${T.inputBg}`}
          >
            <SearchIcon className={`ml-4 sm:ml-5 w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0 ${T.subtext}`} />
            <input
              ref={inputRef}
              placeholder="Search deals, products, brands…"
              value={query}
              onFocus={() => query.length > 1 && setShowSuggestions(true)}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full bg-transparent px-3 sm:px-4 py-3.5 sm:py-4 text-sm sm:text-base font-medium outline-none ${
                dark ? "placeholder:text-white/22 text-white" : "placeholder:text-gray-400 text-gray-900"
              }`}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                  transition={snappySpring} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onPointerDown={() => triggerHaptic("light")}
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className={`mr-2 p-1.5 rounded-full transition-colors ${
                    dark ? "hover:bg-white/[0.08] text-white/35" : "hover:bg-gray-100 text-gray-400"
                  }`}
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} transition={snappySpring}
              onPointerDown={() => triggerHaptic("light")}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`mr-2 sm:mr-3 p-2.5 rounded-xl transition-all ${
                isFilterOpen
                  ? isAestheticMode ? "bg-[#8E8475] text-white" : "bg-blue-600 text-white"
                  : dark ? "hover:bg-white/[0.07] text-white/35 hover:text-white"
                  : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              }`}
            >
              <Filter className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
            </motion.button>
          </motion.div>

          {/* Filter panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ ...appleSpring, height: { type: "tween", duration: 0.3, ease: appleEase } }}
                className={`mt-3 rounded-2xl border p-5 sm:p-6 space-y-5 overflow-hidden ${T.surface}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${T.subtext}`}>Max Price</label>
                    <span className={`text-sm font-bold tabular-nums ${T.accentTextCls}`}>₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="500" max="200000" step="1000" value={maxPrice}
                    onChange={(e) => { setMaxPrice(parseInt(e.target.value)); triggerHaptic("light"); }}
                    className="w-full"
                    style={{
                      height: "4px", borderRadius: "99px",
                      background: `linear-gradient(to right, ${T.accent} 0%, ${T.accent} ${(maxPrice / 200000) * 100}%, ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} ${(maxPrice / 200000) * 100}%)`,
                    }}
                  />
                  <div className={`flex justify-between text-[10px] mt-2 font-medium ${T.subtext}`}>
                    <span>₹500</span><span>₹2,00,000</span>
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider block mb-3 ${T.subtext}`}>Sort By</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "relevance", label: "Relevant",     icon: <SparkleIcon  className="w-3.5 h-3.5" /> },
                      { id: "priceLow",  label: "Cheapest",     icon: <ArrowUpDown  className="w-3.5 h-3.5" /> },
                      { id: "savings",   label: "Most Savings", icon: <TrendingUp   className="w-3.5 h-3.5" /> },
                    ].map((s) => (
                      <motion.button
                        key={s.id} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.96 }} transition={snappySpring}
                        onPointerDown={() => triggerHaptic("select")}
                        onClick={() => setSortOrder(s.id)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-semibold border transition-all ${
                          sortOrder === s.id
                            ? isAestheticMode ? "bg-[#8E8475] border-[#8E8475] text-white"
                              : "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/25"
                            : dark ? "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08] text-white/45 hover:text-white"
                            : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-500 hover:text-blue-600"
                        }`}
                      >
                        {s.icon}{s.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionContainerRef}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 6, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={appleSpring}
                className={`absolute left-0 right-0 top-full z-50 rounded-2xl border backdrop-blur-2xl overflow-hidden ${
                  isAestheticMode ? "bg-white/97 border-[#D6D2C4]"
                    : dark ? "bg-[#1c1c1e]/97 border-white/[0.08] shadow-2xl shadow-black/40"
                    : "bg-white/97 border-gray-200 shadow-xl"
                }`}
              >
                {suggestions.map((p, i) => (
                  <motion.button
                    key={p.id || i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ ...appleSpring, delay: i * 0.035 }}
                    whileHover={{ x: 3, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
                    onPointerDown={() => triggerHaptic("light")}
                    onClick={() => { setQuery(p.name); setShowSuggestions(false); }}
                    className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left border-b last:border-b-0 ${
                      dark ? "border-white/[0.05]" : "border-gray-100"
                    }`}
                  >
                    <SearchIcon className={`w-3.5 h-3.5 flex-shrink-0 ${T.subtext}`} />
                    <span className={`text-sm font-medium flex-1 line-clamp-1 ${T.text}`}>{p.name}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${T.accentTextCls} opacity-80`}>{p.category}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── DEAL OF THE HOUR ──────────────────────────────────────────── */}
        {!isLoading && finalResults.length > 0 && currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.08 }}
            className={`mb-9 rounded-[22px] p-0.5 bg-gradient-to-r ${
              isAestheticMode
                ? "from-[#8E8475] via-[#B0A89A] to-[#8E8475]"
                : "from-blue-500 via-violet-500 to-blue-600"
            }`}
            style={{
              boxShadow: isAestheticMode
                ? "0 6px 32px rgba(142,132,117,0.22)"
                : "0 6px 32px rgba(37,99,235,0.22)",
            }}
          >
            <div className={`rounded-[21px] p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-9 ${
              isAestheticMode ? "bg-[#F5F5F0]" : dark ? "bg-[#111]" : "bg-white"
            }`}>
              <motion.div
                whileHover={{ scale: 1.04 }} transition={gentleSpring}
                onClick={() => { setSelectedProduct(finalResults[0]); triggerHaptic("light"); }}
                className="relative cursor-pointer flex-shrink-0 group"
              >
                <div className={`absolute -inset-5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                  dark ? "bg-blue-500/20" : "bg-blue-300/20"
                }`} />
                <img
                  src={finalResults[0].image}
                  className="w-28 sm:w-44 h-28 sm:h-44 object-contain relative z-10 drop-shadow-2xl"
                  alt={finalResults[0].name}
                />
              </motion.div>
              <div className="flex-1 text-center sm:text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold mb-3 ${
                  isAestheticMode ? "bg-[#8E8475]/12 text-[#8E8475]" : "bg-blue-600/10 text-blue-500"
                }`}>
                  <Zap className="w-3 h-3" /> Deal of the Hour
                  <span className={`ml-1.5 font-bold tabular-nums ${T.subtext}`}>{hourTimer}</span>
                </div>
                <h3 className={`text-lg sm:text-2xl font-black leading-tight mb-2 ${T.text}`}>
                  {finalResults[0].name}
                </h3>
                <p className={`text-2xl sm:text-3xl font-black mb-1 ${T.priceCls}`}>
                  ₹{getBestDeal(finalResults[0]).price.toLocaleString("en-IN")}
                </p>
                {getBestDeal(finalResults[0]).savings > 0 && (
                  <p className={`text-xs font-semibold mb-4 ${T.subtext}`}>
                    Save ₹{getBestDeal(finalResults[0]).savings.toLocaleString("en-IN")} vs highest listed price
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02, filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}
                  transition={snappySpring}
                  onPointerDown={() => triggerHaptic("purchase")}
                  onClick={() => window.open(getBestDeal(finalResults[0]).link, "_blank")}
                  className={`px-7 py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center gap-2 justify-center sm:inline-flex ${T.accentCls}`}
                  style={{ boxShadow: `0 4px 20px ${T.accent}35` }}
                >
                  <CartIcon className="w-4 h-4" /> Grab This Deal
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PRODUCT GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            {isLoading || isSearching ? (
              Array.from({ length: isMobile ? 8 : 12 }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} dark={dark} />
              ))
            ) : paginatedResults.length > 0 ? (
              paginatedResults.map((product, index) => {
                const best       = product._best  ?? getBestDeal(product);
                const deal       = product._score ?? getDealScore(product);
                const isWatched  = watchedDeals.includes(product.name);
                const isComparing = compareList.some((p) => p.name === product.name);

                return (
                  <motion.div
                    key={product.id || product.name}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ ...appleSpring, delay: Math.min(index * 0.022, 0.28) }}
                    whileHover={{ y: -5, scale: 1.016 }}
                    whileTap={{ scale: 0.972 }}
                    onClick={() => { setSelectedProduct(product); triggerHaptic("light"); }}
                    className={`group relative rounded-2xl sm:rounded-[18px] border overflow-hidden flex flex-col cursor-pointer select-none ${T.card} ${
                      isAestheticMode
                        ? "hover:border-[#8E8475] hover:shadow-lg"
                        : dark
                          ? "hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/[0.06]"
                          : "hover:border-blue-300/70 hover:shadow-xl hover:shadow-blue-500/[0.09] shadow-sm"
                    }`}
                    style={{ transition: "box-shadow 0.3s ease, border-color 0.2s ease" }}
                  >
                    {/* Score badge */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <motion.div
                        initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ ...appleSpring, delay: 0.06 }}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 ${
                          isAestheticMode ? "bg-[#8E8475] text-white" : "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        }`}
                      >
                        <Star className="w-2.5 h-2.5 fill-white" />{deal.score}
                      </motion.div>
                    </div>

                    {/* Discount badge */}
                    {best.savings > 0 && (
                      <div className="absolute top-2.5 left-2.5 z-20 px-2 py-1 rounded-full text-[10px] font-black bg-red-500 text-white shadow-sm shadow-red-500/25">
                        -{deal.percent}%
                      </div>
                    )}

                    {/* Desktop hover actions */}
                    {!isMobile && (
                      <div className="absolute top-10 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        {[
                          {
                            active: isComparing,
                            activeCls: isAestheticMode ? "bg-[#8E8475] text-white border-transparent" : "bg-blue-600 text-white border-transparent shadow-sm shadow-blue-600/30",
                            icon: <Layers className="w-3.5 h-3.5" />,
                            action: (e) => { toggleCompare(e, product); },
                          },
                          {
                            active: isWatched,
                            activeCls: "bg-amber-500 text-white border-transparent shadow-sm shadow-amber-500/30",
                            icon: <Bell className={`w-3.5 h-3.5 ${isWatched ? "fill-current" : ""}`} />,
                            action: (e) => toggleWatch(e, product),
                          },
                          {
                            active: copiedDeal === product.name,
                            activeCls: "bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/30",
                            icon: copiedDeal === product.name ? <Check className="w-3.5 h-3.5" /> : <ShareIcon className="w-3.5 h-3.5" />,
                            action: (e) => { e.stopPropagation(); handleShare(product.name, best.link); },
                          },
                        ].map((btn, bi) => (
                          <motion.button
                            key={bi}
                            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} transition={snappySpring}
                            onPointerDown={() => triggerHaptic("light")}
                            onClick={btn.action}
                            className={`p-2 rounded-full border backdrop-blur-xl transition-all ${
                              btn.active ? btn.activeCls
                                : dark ? "bg-black/70 text-white/45 border-white/10 hover:text-white hover:border-white/20"
                                : "bg-white/95 text-gray-500 border-gray-200/80 hover:text-gray-800"
                            }`}
                          >
                            {btn.icon}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Mobile swipe-row actions */}
                    {isMobile && (
                      <div className="absolute bottom-[52px] left-0 right-0 z-20 flex justify-end gap-2 px-3 pb-1 opacity-0 group-active:opacity-100 transition-opacity">
                        <motion.button
                          whileTap={{ scale: 0.85 }} transition={snappySpring}
                          onPointerDown={() => triggerHaptic("light")}
                          onClick={(e) => toggleWatch(e, product)}
                          className={`p-2 rounded-full border backdrop-blur-xl ${
                            isWatched ? "bg-amber-500 text-white border-transparent" : "bg-black/60 text-white/50 border-white/10"
                          }`}
                        >
                          <Bell className={`w-3.5 h-3.5 ${isWatched ? "fill-current" : ""}`} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }} transition={snappySpring}
                          onPointerDown={() => triggerHaptic("light")}
                          onClick={(e) => toggleCompare(e, product)}
                          className={`p-2 rounded-full border backdrop-blur-xl ${
                            isComparing ? "bg-blue-600 text-white border-transparent" : "bg-black/60 text-white/50 border-white/10"
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    )}

                    {/* Product image */}
                    <div className="p-3 sm:p-4 flex-1">
                      <div className={`relative h-28 sm:h-36 rounded-xl overflow-hidden flex items-center justify-center mb-3 ${
                        dark ? "bg-white/[0.025]" : "bg-gray-50"
                      }`}>
                        <motion.img
                          whileHover={{ scale: 1.07 }} transition={gentleSpring}
                          src={product.image} className="w-full h-full object-contain p-2"
                          alt={product.name} loading="lazy"
                        />
                      </div>
                      <h3 className={`text-[11px] sm:text-xs font-semibold line-clamp-2 leading-snug mb-1 ${T.text}`}>{product.name}</h3>
                      <p className={`text-[10px] font-semibold uppercase tracking-wide ${T.accentTextCls} opacity-65`}>{product.category}</p>
                    </div>

                    {/* Price & CTA */}
                    <div className={`px-3 sm:px-4 pb-3 sm:pb-4 pt-3 border-t ${
                      isAestheticMode ? "border-[#D6D2C4]" : dark ? "border-white/[0.04]" : "border-gray-100"
                    }`}>
                      <div className="flex items-end justify-between mb-2.5">
                        <div>
                          <p className={`text-[9px] uppercase tracking-wide font-semibold mb-0.5 ${T.subtext}`}>{best.platform}</p>
                          <p className={`text-base sm:text-lg font-black leading-none ${T.priceCls}`}>
                            ₹{best.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        {best.savings > 0 && (
                          <span className={`text-[10px] font-medium ${T.subtext} line-through tabular-nums`}>
                            ₹{(best.price + best.savings).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02, filter: "brightness(1.06)" }}
                        whileTap={{ scale: 0.97 }}
                        transition={snappySpring}
                        onPointerDown={() => triggerHaptic("purchase")}
                        onClick={(e) => { e.stopPropagation(); window.open(best.link, "_blank"); }}
                        className={`w-full py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold text-white ${T.accentCls}`}
                        style={{ boxShadow: `0 2px 10px ${T.accent}30` }}
                      >
                        View Deal
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="col-span-full flex flex-col items-center py-20"
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ duration: 1.8, delay: 0.3 }}
                  className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-4 ${
                    dark ? "bg-white/[0.04]" : "bg-gray-100"
                  }`}
                >
                  <SearchIcon className="w-7 h-7 opacity-20" />
                </motion.div>
                <p className={`text-sm font-semibold mb-1 ${T.text}`}>No deals found</p>
                <p className={`text-xs ${T.subtext}`}>Try adjusting your search or filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PAGINATION ────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mb-20"
          >
            <motion.button
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }} transition={snappySpring}
              disabled={currentPage === 1}
              onPointerDown={() => triggerHaptic("light")}
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 600, behavior: "smooth" }); }}
              className={`p-3 rounded-xl border transition-all disabled:opacity-25 ${
                dark ? "border-white/[0.07] hover:bg-white/[0.07]" : "border-gray-200 hover:bg-gray-100 bg-white shadow-sm"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {getPageNumbers().map((num) => (
              <motion.button
                key={num} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }} transition={snappySpring}
                onPointerDown={() => triggerHaptic("light")}
                onClick={() => { setCurrentPage(num); window.scrollTo({ top: 600, behavior: "smooth" }); }}
                aria-current={currentPage === num ? "page" : undefined}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm font-semibold border transition-all ${
                  currentPage === num
                    ? isAestheticMode ? "bg-[#8E8475] text-white border-transparent"
                      : "bg-blue-600 text-white border-transparent shadow-sm shadow-blue-600/25"
                    : dark ? "text-white/35 border-white/[0.07] hover:bg-white/[0.07] hover:text-white"
                    : "text-gray-500 border-gray-200 hover:bg-gray-100 bg-white shadow-sm"
                }`}
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }} transition={snappySpring}
              disabled={currentPage === totalPages}
              onPointerDown={() => triggerHaptic("light")}
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 600, behavior: "smooth" }); }}
              className={`p-3 rounded-xl border transition-all disabled:opacity-25 ${
                dark ? "border-white/[0.07] hover:bg-white/[0.07]" : "border-gray-200 hover:bg-gray-100 bg-white shadow-sm"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className={`py-10 border-t text-center space-y-4 ${dark ? "border-white/[0.04]" : "border-gray-100"}`}>
          <div className={`flex items-center justify-center gap-2 text-[11px] font-medium ${T.subtext}`}>
            <RefreshCw className="w-3 h-3" style={{ animation: "spin 3s linear infinite" }} />
            Real-time Price Updates
          </div>
          <div className="flex gap-6 justify-center">
            {["Privacy", "Terms", "About"].map((l) => (
              <a key={l} href="#" className={`text-xs font-medium ${T.subtext} hover:opacity-100 transition-opacity`}>{l}</a>
            ))}
          </div>
          <p className={`text-[10px] leading-relaxed max-w-xs mx-auto ${T.subtext} opacity-70`}>
            DealX is an independent price comparison engine. Prices updated in real-time.
          </p>
        </footer>

        {/* ── FLOATING SEARCH FAB (when scrolled) ───────────────────────── */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={appleSpring}
              className="fixed bottom-5 sm:bottom-6 left-0 right-0 z-[200] px-5 flex justify-center pointer-events-auto"
            >
              <motion.div
                layout transition={gentleSpring}
                className={`flex items-center overflow-hidden ${
                  isFabOpen ? "w-full max-w-xs h-14 rounded-2xl" : "w-14 h-14 rounded-2xl"
                } ${T.accentCls}`}
                style={{ boxShadow: `0 8px 36px ${T.accent}55` }}
              >
                <motion.button
                  whileTap={{ scale: 0.88 }} transition={snappySpring}
                  onPointerDown={() => triggerHaptic("medium")}
                  onClick={() => setIsFabOpen(!isFabOpen)}
                  className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-white"
                >
                  <AnimatePresence mode="wait">
                    {isFabOpen
                      ? <motion.div key="c" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon className="w-5 h-5" /></motion.div>
                      : <motion.div key="s" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}><SearchIcon className="w-5 h-5" /></motion.div>
                    }
                  </AnimatePresence>
                </motion.button>
                <AnimatePresence>
                  {isFabOpen && (
                    <motion.input
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: 0.08 }}
                      autoFocus type="text" placeholder="Search deals…" value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent text-white text-sm font-medium placeholder:text-white/50 outline-none px-2 flex-1"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}