'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ModernNavbar } from '@/components/ModernNavbar';
import { ProductCard } from '@/components/ProductCard';
import { ModernFooter } from '@/components/ModernFooter';
import { motion } from 'framer-motion';
import { LayoutGrid, Filter, ChevronRight, Home, AlertTriangle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from '@/utils/axiosSetup';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { LoginDialog } from '@/components/LoginDialog';
import { LogoutDialog } from '@/components/LogoutDialog';

export default function CategoryPage() {
  const { slug } = useParams();
  const { user, logout } = useAuth();
  const { addToCart, cartCount } = useCart();
  
  const slugStr = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : '';
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const formatSlug = (s: string ) => {
    if (!s) return '';
    // Convert vitamins-nutrition -> vitamins & nutrition or vitamins nutrition
    return s.split('-').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      const name = formatSlug(slugStr);
      setCategoryName(name);

      try {
        const res = await axios.get('/medicines/');
        const data = res.data;
        // Robust filtering: strip special chars and spaces for comparison
        const simplify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = simplify(slugStr);
        
        const filtered = data.filter((m: any) => {
          const mCatName = simplify(m.category_name || m.category?.name || '');
          return mCatName.includes(target) || target.includes(mCatName);
        });
        setMedicines(filtered);
      } catch (err: any) {
        console.error("Error fetching category medicines:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slugStr]);

  const [activeSub, setActiveSub] = useState('All Items');
  const filteredDisplay = activeSub === 'All Items' 
    ? medicines 
    : medicines.filter(m => (m.category_name || 'General') === activeSub);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-pharma-blue/10">
      <ModernNavbar 
        userLoggedIn={!!user} 
        onLogout={() => setShowLogoutDialog(true)} 
        onLogin={() => setShowLoginDialog(true)} 
        cartCount={cartCount} 
      />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={() => { logout(); setShowLogoutDialog(false); }} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-44 pb-24 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-slate-50/50 rounded-full blur-[120px] -z-10 opacity-60"></div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 px-2">
            <Link href="/" className="hover:text-pharma-blue transition-colors flex items-center gap-1.5">
              <Home size={12} className="translate-y-[-1px]" /> HOME
            </Link>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-pharma-blue bg-pharma-blue/5 px-2 py-0.5 rounded-md font-black">{categoryName}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-12 relative z-10">
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
           >
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                    <LayoutGrid size={20} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory Segment</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9] mb-6">
                 {categoryName}
              </h1>
              <p className="text-slate-500 text-lg font-bold leading-relaxed">
                 Clinically verified pharmaceutical solutions categorized for the <span className="text-slate-900">{categoryName}</span> vertical. All stock is monitored for thermal stability and authenticity.
              </p>
           </motion.div>
           
           <div className="flex items-center gap-4">
              <div className="px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Found</span>
                 <span className="text-xl font-black text-slate-900">{filteredDisplay.length}</span>
              </div>
           </div>
        </div>

        {/* Sub-category Refinement */}
        <div className="flex flex-wrap items-center gap-3 mb-16 relative z-10">
            <div className="flex items-center gap-2 mr-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
               <Filter size={14} className="text-slate-400" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Molecular Filtering</span>
            </div>
            {['All Items', ...Array.from(new Set(medicines.map(m => m.category_name || 'General')))].map((sub) => (
              <button 
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${activeSub === sub ? 'bg-pharma-blue text-white shadow-xl shadow-pharma-blue/20 border-transparent' : 'bg-white border border-slate-100 text-slate-500 hover:border-pharma-blue/30 hover:text-pharma-blue'}`}
              >
                {sub}
              </button>
            ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-slate-50 border border-slate-100 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[4rem] border border-rose-100 shadow-2xl shadow-rose-500/5">
             <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8 text-rose-500">
                <AlertCircle size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Access Interrupted</h3>
             <p className="text-slate-500 text-sm max-w-[320px] text-center mb-10 font-bold leading-relaxed uppercase tracking-wider">
                {error}
             </p>
             <button onClick={() => window.location.reload()} className="px-10 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-rose-500/20">
                Re-initialize
             </button>
          </div>
        ) : filteredDisplay.length > 0 ? (
          <motion.div 
             className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
             initial="hidden"
             animate="visible"
             variants={{
                hidden: { opacity: 0 },
                visible: {
                   opacity: 1,
                   transition: { staggerChildren: 0.1 }
                }
             }}
          >
             {filteredDisplay.map(med => (
                <motion.div 
                   key={med.id}
                   variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } }
                   }}
                >
                   <ProductCard 
                      medicine={{
                        ...med,
                        description: med.description || "Segmented pharmaceutical asset."
                      }} 
                      onAdd={(m) => addToCart(m)} 
                   />
                </motion.div>
             ))}
          </motion.div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl group-hover:bg-pharma-blue/5 transition duration-1000"></div>
             <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 relative z-10">
                <LayoutGrid size={40} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight relative z-10">Zero Match Result</h3>
             <p className="text-slate-500 text-sm max-w-[300px] text-center mb-12 font-bold uppercase tracking-widest leading-relaxed relative z-10">
                Our algorithmic index returned no assets for <span className="text-pharma-blue">{categoryName}</span>.
             </p>
             <Link href="/" className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all relative z-10">
                Return Terminal Home
             </Link>
          </div>
        )}
      </main>

      <div className="mt-20">
         <ModernFooter />
      </div>
    </div>
  );
}
