'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User as UserIcon, Activity, Star, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORE_MEDICINES = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', price: 10.0, rating: 4.8 },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 45.5, rating: 4.5 },
    { id: 3, name: 'Cough Syrup', category: 'Cold & Flu', price: 120.0, rating: 4.2 },
    { id: 4, name: 'Vitamin C 1000mg', category: 'Supplement', price: 80.0, rating: 4.9 },
    { id: 5, name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 15.0, rating: 4.6 },
    { id: 6, name: 'Antacid Liquid', category: 'Digestion', price: 95.0, rating: 4.0 },
];

export default function Home() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cart, setCart] = useState<{ id: number, qty: number }[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [showAiPulse, setShowAiPulse] = useState(false);

  // Cart derivation
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const fetchRecommendations = async (medId: number) => {
    setShowAiPulse(true);
    try {
      // Try real AI backend
      const res = await fetch('http://localhost:5001/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medId })
      });
      if(res.ok) {
        const data = await res.json();
        setAiRecommendations(data.recommendations || []);
      } else { throw new Error("Fallback required"); }
    } catch(e) {
      // Mock Fallback
      setAiRecommendations([
        { id: STORE_MEDICINES[4].id, name: STORE_MEDICINES[4].name, reason: "Similar category" },
        { id: STORE_MEDICINES[3].id, name: STORE_MEDICINES[3].name, reason: "Frequently bought together" }
      ]);
    }
    setTimeout(() => setShowAiPulse(false), 1000);
  };

  const handleAddToCart = (medId: number) => {
    setCart(prev => {
        const exists = prev.find(i => i.id === medId);
        if (exists) return prev.map(i => i.id === medId ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { id: medId, qty: 1 }];
    });
    // Trigger AI Recs
    fetchRecommendations(medId);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><Activity size={24}/></div>
                <span className="font-extrabold text-xl tracking-tight text-slate-800">SmartPharma</span>
            </div>
            <div className="flex flex-1 justify-center max-w-lg px-8">
                <input type="text" placeholder="Search medicines..." className="w-full bg-slate-100 border-none rounded-full py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"/>
            </div>
            <div className="flex items-center gap-6">
                <Link href="/admin" className="text-slate-600 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition">
                    <ShieldCheck size={16}/> Admin
                </Link>
                <div className="relative cursor-pointer hover:text-indigo-600 transition" title="Proceed to checkout (Guest or Logged in)">
                    <ShoppingCart size={24}/>
                    {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{cartItemCount}</span>}
                </div>
                <div className="h-6 w-px bg-slate-300"></div>
                {userLoggedIn ? (
                    <button onClick={()=>setUserLoggedIn(false)} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">JD</div>
                        Logout
                    </button>
                ) : (
                    <button onClick={()=>setUserLoggedIn(true)} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 px-4 py-2 rounded-full transition">
                        <UserIcon size={16}/> Login
                    </button>
                )}
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Main Store Area */}
        <section className="flex-1">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Order Medication</h1>
                    <p className="text-slate-500 text-sm">You can order directly as a Guest or Login for order tracking.</p>
                </div>
                {userLoggedIn && (
                    <span className="bg-green-100 text-green-700 font-medium px-3 py-1 text-xs rounded-full border border-green-200">User Account Active</span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {STORE_MEDICINES.map(med => (
                    <div key={med.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition flex flex-col justify-between h-full group">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{med.category}</span>
                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><Star size={12} className="fill-yellow-500"/> {med.rating}</div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{med.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">High quality, medically approved standard dose for effective treatment.</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-xl font-black text-slate-800">Rs. {med.price}</span>
                            <button onClick={() => handleAddToCart(med.id)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm">
                                <Plus size={20}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {cartItemCount > 0 && (
                <div className="mt-12 bg-indigo-600 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg shadow-indigo-200">
                    <div>
                        <h3 className="font-bold text-lg">Ready to checkout?</h3>
                        <p className="text-indigo-100 text-sm">Proceed to billing and get your digital receipt.</p>
                    </div>
                    <Link href="/pos" className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition shadow-sm">
                        Checkout ({cartItemCount} items)
                    </Link>
                </div>
            )}
        </section>

        {/* AI Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 bg-indigo-600 transform origin-left transition-transform duration-1000 ${showAiPulse ? 'scale-x-100' : 'scale-x-0'}`}></div>
                <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 rounded-lg bg-indigo-100 text-indigo-600 ${showAiPulse ? 'animate-pulse' : ''}`}><Sparkles size={20}/></div>
                    <h3 className="font-bold text-indigo-900 text-lg">AI Assistant</h3>
                </div>

                <div className="space-y-4">
                    {aiRecommendations.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">Add items to your cart to get smart recommendations.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {aiRecommendations.map((rec, idx) => {
                                const medMatch = STORE_MEDICINES.find(m => m.id === rec.id) || STORE_MEDICINES[0];
                                return (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-white border border-indigo-50 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition group cursor-pointer" onClick={() => handleAddToCart(medMatch.id)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">{rec.name}</h4>
                                        <span className="text-indigo-600 font-bold text-sm">Rs.{medMatch.price}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded border border-emerald-100">{rec.reason}</p>
                                    <button className="mt-3 text-xs w-full py-1.5 bg-slate-50 text-slate-600 font-medium rounded-lg group-hover:bg-indigo-50 transition border border-slate-100">Add to Cart</button>
                                </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </aside>

      </main>
    </div>
  );
}
