"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  LayoutGrid,
  ChevronRight,
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// New Specialized Components
import { ModernNavbar } from "@/components/ModernNavbar";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { AISidebar } from "@/components/AISidebar";
import { ModernFooter } from "@/components/ModernFooter";
import { WelcomeAlert } from "@/components/WelcomeAlert";
import { useAuth } from "@/lib/auth-context";
import { LoginDialog } from "@/components/LoginDialog";
import { LogoutDialog } from "@/components/LogoutDialog";
import { useCart } from "@/lib/cart-context";
import { axiosInstance } from "@/utils/axiosSetup";

const STORE_MEDICINES = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 10.0,
    rating: 4.8,
    description: "Rapid action formula for fever and acute pain management.",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Antibiotic",
    price: 45.5,
    rating: 4.5,
    description: "Broad-spectrum antibiotic for bacterial infections.",
  },
  {
    id: 3,
    name: "Cough Syrup",
    category: "Cold & Flu",
    price: 120.0,
    rating: 4.2,
    description:
      "Non-drowsy relief for persistent cough and throat irritation.",
  },
  {
    id: 4,
    name: "Vitamin C 1000mg",
    category: "Supplement",
    price: 80.0,
    rating: 4.9,
    description: "High-potency antioxidant for immune system fortification.",
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    price: 15.0,
    rating: 4.6,
    description: "Effective anti-inflammatory for joint and muscle soreness.",
  },
  {
    id: 6,
    name: "Antacid Liquid",
    category: "Digestion",
    price: 95.0,
    rating: 4.0,
    description: "Fast-acting relief from indigestion and acid reflux.",
  },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { addToCart, cartCount, cartTotal } = useCart();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [trendingPulse, setTrendingPulse] = useState<any[]>([]);
  const [showAiPulse, setShowAiPulse] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    fetchTrending();
    fetchCategories();
    fetchMedicines();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories/');
      setCategories(res.data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err.message);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await axiosInstance.get('/medicines/');
      setMedicines(res.data);
    } catch (err: any) {
      console.error("Failed to fetch medicines:", err.message);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/ai/trending");
      const data = await res.json();
      if (data.status === "success") {
        setTrendingPulse(data.data);
      }
    } catch (err) {
      console.log("AI Trending Hub Offline");
    }
  };

  const fetchRecommendations = async (medId?: number, symptoms?: string) => {
    setShowAiPulse(true);
    try {
      const bodyPayload = medId
        ? { medicine_id: medId }
        : { symptoms: symptoms };
      const res = await fetch("http://localhost:5001/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecommendations(data.recommendations || []);
      } else {
        throw new Error("Fallback required");
      }
    } catch (e) {
      setAiRecommendations([
        {
          id: STORE_MEDICINES[4].id,
          name: STORE_MEDICINES[4].name,
          reason: "Similar category",
          price: STORE_MEDICINES[4].price,
        },
        {
          id: STORE_MEDICINES[3].id,
          name: STORE_MEDICINES[3].name,
          reason: "Frequently bought together",
          price: STORE_MEDICINES[3].price,
        },
      ]);
    }
    setTimeout(() => setShowAiPulse(false), 1000);
  };

  const handleSymptomSearch = (symptoms: string) => {
    fetchRecommendations(undefined, symptoms);
  };

  const onAddToCart = (med: any) => {
    addToCart(med);
    fetchRecommendations(med.id);
  };

  return (
    <div className="min-h-screen bg-slate-50/30 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans">
      <ModernNavbar
        userLoggedIn={!!user}
        cartCount={cartCount}
        onLogin={() => setShowLoginDialog(true)}
        onLogout={() => setShowLogoutDialog(true)}
      />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={() => {
          logout();
          setShowLogoutDialog(false);
        }}
      />

      <WelcomeAlert />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-24">
        {/* Entrance Animation Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Hero />
        </motion.div>

        {/* Section Headings & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-inner group/icon">
                <LayoutGrid
                  size={18}
                  className="group-hover/icon:rotate-90 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                Featured Catalog
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-tight">
              Healthcare <br />
              <span className="text-emerald-600">Essentials</span>
            </h2>
          </motion.div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide max-w-full">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-widest hidden md:block">
              Filter By
            </span>
            {["All", ...categories.filter(c => !c.parent).map(c => c.name)].slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveCategory(tag)}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition shadow-sm active:scale-95 whitespace-nowrap ${activeCategory === tag ? "bg-slate-950 text-white shadow-xl shadow-slate-900/20" : "bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-100"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Store Grid */}
          <section className="flex-1">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {(activeCategory === 'All' ? medicines : medicines.filter(m => m.category_name === activeCategory || m.category === categories.find(c => c.name === activeCategory)?.id)).map(med => (
                <motion.div
                  key={med.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard medicine={med} onAdd={onAddToCart} />
                </motion.div>
              ))}
            </motion.div>

            {/* Info Banners */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-[80px] rounded-full"></div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 group-hover:rotate-12 transition">
                    <Zap size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">
                    Express Delivery
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[240px]">
                    Get your medications delivered within 2 hours in selected
                    metropolitan areas.
                  </p>
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition">
                    Learn More <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full"></div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 border border-emerald-50 group-hover:-rotate-12 transition">
                    <ShieldCheck size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900">
                    Health Security
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[240px]">
                    All prescriptions are verified by licensed medical
                    professionals before dispensing.
                  </p>
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 transition">
                    Transparency Portal <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Trending Pulse Section */}
            <div className="mt-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Activity
                    className="text-emerald-500 animate-pulse"
                    size={20}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                    Trending Pulse
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    AI-Market Intelligence
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingPulse.length > 0
                  ? trendingPulse.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 group hover:-translate-y-1 transition-all duration-500"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-transparent text-[8px] font-black tracking-widest">
                            TRENDING
                          </Badge>
                          <TrendingUp
                            size={14}
                            className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <h4 className="font-black text-slate-950 mb-2 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                          "{item.trend_reason}"
                        </p>
                      </motion.div>
                    ))
                  : [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-32 bg-slate-50 animate-pulse rounded-[2rem]"
                      ></div>
                    ))}
              </div>
            </div>
          </section>

          {/* Sidebar with AI context */}
          <div className="relative">
            <AISidebar
              recommendations={aiRecommendations}
              onAdd={id => {
                const med = medicines.find(m => m.id === id);
                if (med) onAddToCart(med);
              }}
              isPulsing={showAiPulse}
              onSymptomSearch={handleSymptomSearch}
            />

            {/* Cart CTA card for persistent visibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-950 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-950/40 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <ShoppingCart size={28} className="text-white" />
                  </div>
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black">
                      {cartCount}
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-black mb-1">Basket Status</h4>
                <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">
                  {cartCount > 0
                    ? `${cartCount} Active Items`
                    : "Ready for items"}
                </p>

                <Link
                  href="/cart"
                  className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center transition-all shadow-lg active:scale-95 ${cartCount > 0 ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-emerald-500/20" : "bg-slate-800 text-slate-500 pointer-events-none"}`}
                >
                  {cartCount > 0
                    ? `Checkout Rs. ${cartTotal.toFixed(2)}`
                    : "Cart Empty"}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
