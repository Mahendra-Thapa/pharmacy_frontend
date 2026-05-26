"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, ShoppingCart, Star, ShieldCheck, 
  Truck, Clock, Database, ArrowRight, Zap, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModernNavbar } from "@/components/ModernNavbar";
import { ModernFooter } from "@/components/ModernFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { axiosInstance } from "@/utils/axiosSetup";
import { LoginDialog } from "@/components/LoginDialog";
import { LogoutDialog } from "@/components/LogoutDialog";

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart, cartCount } = useCart();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await axiosInstance.get(`/medicines/${id}/`);
        setMedicine(res.data);
      } catch (err) {
        console.error("Failed to fetch medicine");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Pharma Intelligence Loading...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Product Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">The medicine identification protocol failed to find this item in our decentralized database.</p>
        <Button onClick={() => router.push("/")} className="bg-slate-900 rounded-2xl h-12 px-8 uppercase font-black tracking-widest text-xs">Return to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
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

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 lg:pt-40">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 p-0 hover:bg-transparent text-slate-400 hover:text-slate-900 transition-colors uppercase font-black tracking-widest text-[10px] flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Left: Product Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-slate-200/50">
               {medicine.image_url ? (
                 <Image src={medicine.image_url} alt={medicine.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
               ) : (
                 <div className="flex flex-col items-center gap-4 text-slate-200">
                    <Database size={100} strokeWidth={1} />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em]">No Visual Uplink</span>
                 </div>
               )}
               <div className="absolute top-8 left-8">
                  <Badge className="bg-white/90 backdrop-blur-md text-emerald-600 border-none shadow-sm px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                    {medicine.category_name || medicine.category}
                  </Badge>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                  <ShieldCheck size={20} className="mx-auto text-emerald-600" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                  <Clock size={20} className="mx-auto text-emerald-600" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fast Track</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                  <Truck size={20} className="mx-auto text-emerald-600" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shipping</p>
               </div>
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 text-yellow-500 mb-4 bg-yellow-50 w-fit px-3 py-1 rounded-full border border-yellow-100 shadow-sm">
                <Star size={14} className="fill-yellow-500" />
                <span className="text-sm font-black tracking-tight">{medicine.rating || "4.5"} Rating</span>
                <span className="text-xs text-yellow-600 font-bold ml-1">(120 Reviews)</span>
              </div>
              
              <h1 className="text-5xl font-black text-slate-950 tracking-tighter leading-none mb-6">
                {medicine.name}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {parseFloat(medicine.price).toFixed(2)}</span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Inc. Taxes</span>
              </div>

              <div className="p-6 bg-slate-950 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-slate-900/40 group hover:scale-[1.02] transition-transform duration-500">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Status</span>
                    <span className={`text-sm font-black uppercase tracking-tight ${medicine.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {medicine.stock > 0 ? `${medicine.stock} Units Available` : 'Out of Stock'}
                    </span>
                 </div>
                 <Button 
                    disabled={medicine.stock <= 0}
                    onClick={() => addToCart(medicine)}
                    className="bg-white text-slate-950 hover:bg-emerald-500 hover:text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 overflow-hidden relative group/btn"
                 >
                    <ShoppingCart size={16} />
                    Add to Basket
                 </Button>
              </div>
            </div>

            {/* Tabs for Info */}
            <div className="mt-4 flex-1">
               <div className="flex gap-8 border-b border-slate-100 mb-8">
                  {['description', 'uses', 'side effects'].map(tab => (
                    <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       {tab}
                       {activeTab === tab && (
                         <motion.div layoutId="details-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                       )}
                    </button>
                  ))}
               </div>

               <div className="min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'description' && (
                      <motion.div 
                        key="desc"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         <p className="text-slate-600 leading-relaxed text-sm font-medium">
                            {medicine.description || "No detailed description provided by the manufacturer. This medicine is a professional-grade healthcare product verified by our pharmacological assessment team."}
                         </p>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Manufacturer</p>
                               <p className="font-black text-slate-900 text-xs">{medicine.manufacturer || "Generic Pharma Labs"}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Expiry Protocol</p>
                               <p className="font-black text-slate-900 text-xs">{medicine.expiry_date || "Validated"}</p>
                            </div>
                         </div>
                      </motion.div>
                    )}
                    {activeTab === 'uses' && (
                      <motion.div 
                        key="uses"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-inner"
                      >
                         <div className="flex items-center gap-3 mb-4">
                            <Zap size={20} className="text-emerald-600" />
                            <h4 className="font-black text-emerald-900 uppercase text-xs tracking-tight">Indicated Uses</h4>
                         </div>
                         <p className="text-emerald-800/80 leading-relaxed text-sm font-semibold italic">
                            {medicine.uses || "Primary therapeutic usage for general physiological maintenance and symptom relief as per medical standards."}
                         </p>
                      </motion.div>
                    )}
                    {activeTab === 'side effects' && (
                      <motion.div 
                        key="side"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-slate-100 rounded-[2rem] border border-slate-200"
                      >
                         <div className="flex items-center gap-3 mb-4 text-slate-700">
                            <Info size={20} />
                            <h4 className="font-black uppercase text-xs tracking-tight">Safety Profile</h4>
                         </div>
                         <p className="text-slate-500 leading-relaxed text-sm font-medium">
                            {medicine.side_effects || "Low risk profile when administered under clinical guidance. Consult your healthcare provider for personalized contraindications."}
                         </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* CTA Help */}
            <div className="mt-12 p-8 bg-emerald-600 rounded-[3rem] text-white flex items-center justify-between group overflow-hidden relative shadow-2xl shadow-emerald-600/20">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="relative z-10">
                  <h4 className="text-xl font-black tracking-tight mb-1">Need specialized help?</h4>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">AI Medical Assistant is available 24/7</p>
               </div>
               <Button className="relative z-10 bg-white text-emerald-600 hover:bg-slate-900 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] h-10 px-6 active:scale-95 transition-all flex items-center gap-2 shadow-xl">
                  Consult AI <ArrowRight size={14} />
               </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
