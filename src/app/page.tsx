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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// New Specialized Components
import { ModernNavbar } from "@/components/ModernNavbar";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";

import { ModernFooter } from "@/components/ModernFooter";
import { WelcomeAlert } from "@/components/WelcomeAlert";
import { useAuth } from "@/lib/auth-context";
import { LoginDialog } from "@/components/LoginDialog";
import { LogoutDialog } from "@/components/LogoutDialog";
import { useCart } from "@/lib/cart-context";
import { axiosInstance } from "@/utils/axiosSetup";


export default function Home() {
  const { user, logout } = useAuth();
  const { addToCart, cartCount, cartTotal } = useCart();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
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

  const onAddToCart = (med: any) => {
    addToCart(med);
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
                Featured Categories
              </span>
            </div>
            <h2 className="text-3xl md:text-3xl font-black text-slate-950 tracking-tighter leading-tight">
              Healthcare
              <span className="text-emerald-600"> Essentials</span>
            </h2>
          </motion.div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-widest hidden md:block">
              Filter By
            </span>
            <Select onValueChange={(value) => setActiveCategory(value)} defaultValue="All">
              <SelectTrigger className="w-[180px] rounded-md text-[11px] font-black uppercase tracking-widest transition shadow-sm active:scale-95 whitespace-nowrap bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-100">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {["All", ...categories.filter(c => !c.parent).map(c => c.name)].slice(0, 5).map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Store Grid */}
          <section className="flex-1">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
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
          </section>
          
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
