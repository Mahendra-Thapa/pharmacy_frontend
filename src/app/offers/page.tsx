'use client'

import React, { useState, useEffect } from 'react'
import { ModernNavbar } from '@/components/ModernNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { useAuth } from '@/lib/auth-context'
import { LoginDialog } from '@/components/LoginDialog'
import { LogoutDialog } from '@/components/LogoutDialog'
import { ProductCard } from '@/components/ProductCard'
import { motion } from 'framer-motion'
import { Tag, Sparkles, TrendingDown, Clock, ChevronRight, Badge } from 'lucide-react'
import axios from '@/utils/axiosSetup'
import { useCart } from '@/lib/cart-context'

export default function OffersPage() {
   const { user, logout } = useAuth()
   const { addToCart, cartCount } = useCart()
   const [showLoginDialog, setShowLoginDialog] = useState(false)
   const [showLogoutDialog, setShowLogoutDialog] = useState(false)
   const [offers, setOffers] = useState<any[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      // For now, we'll fetch all medicines and simulate offers (e.g. price > 50)
      // In real app, backend should have an is_offer or discount_price field.
      const fetchOffers = async () => {
         try {
            const res = await axios.get('/medicines/')
            // Filter medicines that are 'offers' (mock logic)
            const offerItems = res.data.map((m: any) => ({
               ...m,
               discount: Math.floor(Math.random() * 20) + 5, // 5% to 25% discount mock
               original_price: (parseFloat(m.price) * 1.2).toFixed(2)
            })).slice(0, 8)
            setOffers(offerItems)
         } catch (err) {
            console.error("Failed to fetch offers")
         } finally {
            setLoading(false)
         }
      }
      fetchOffers()
   }, [])

   return (
      <div className="min-h-screen bg-white flex flex-col selection:bg-orange-100 selection:text-orange-900">
         <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pharma-orange to-pharma-blue z-[100]"></div>

         <ModernNavbar
            userLoggedIn={!!user}
            cartCount={cartCount}
            onLogin={() => setShowLoginDialog(true)}
            onLogout={() => setShowLogoutDialog(true)}
         />

         <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
         <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={() => { logout(); setShowLogoutDialog(false); }} />

         <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-44 pb-24 relative">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-slate-50 rounded-full blur-[120px] -z-10 opacity-50"></div>

            <div className="mb-20">
               <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-16 rounded-xl bg-slate-950 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
               >
                  <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-pharma-orange/10 blur-[120px] rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-pharma-blue/10 blur-[100px] rounded-full"></div>

                  <div className="relative z-10 space-y-8 max-w-2xl text-center lg:text-left">
                     <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-pharma-orange animate-ping"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-pharma-orange">Exclusive Liquidation Event</span>
                     </div>
                     <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                        PREMIUM <br />
                        <span className="text-pharma-orange">SAVINGS.</span>
                     </h1>
                     <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-lg">
                        Experience medical-grade excellence with optimized cost-efficiency. Our algorithmic pricing ensures the best value for your health assets.
                     </p>

                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ends In</span>
                           <span className="text-xl font-black text-white font-mono tracking-wider tabular-nums">08 : 42 : 12</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inventory</span>
                           <span className="text-xl font-black text-pharma-green uppercase tracking-tighter">Verified Stock</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative z-10 w-full max-w-sm aspect-square bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl rounded-xl border border-white/10 flex flex-col items-center justify-center p-12 text-center group/card">
                     <div className="absolute inset-0 bg-pharma-orange/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 rounded-xl"></div>
                     <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pharma-orange to-orange-400 mb-4 tracking-tighter">25<span className="text-4xl -translate-y-6 inline-block">%</span></div>
                     <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-10 leading-tight">Elite Tier <br /> Rebate Cap</div>
                     <button className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-pharma-orange hover:text-white transition-all duration-500 active:scale-95 group/btn">
                        <span className="flex items-center justify-center gap-3">
                           Initialize Access <ChevronRight size={18} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                     </button>
                  </div>
               </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
               <div className="lg:col-span-1 space-y-10 sticky top-32">
                  <div>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Discovery Filters</h3>
                     <div className="space-y-3">
                        {['Price: High to Low', 'Max Discount', 'New Arrivals', 'Expiry Near'].map((f, i) => (
                           <button key={f} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${i === 1 ? 'bg-slate-100 text-slate-950 border border-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                              {f}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 rounded-xl bg-orange-50/50 border border-orange-100 relative overflow-hidden group">
                     <div className="relative z-10">
                        <Tag className="text-pharma-orange mb-4" size={24} />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Member Bonus</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Additional 5% off for verified account holders on selected lines.</p>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10">
                           <Tag size={24} className="text-pharma-orange" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-slate-950 tracking-tight uppercase">Discounted Assets</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time pricing adjustments based on demand</p>
                        </div>
                     </div>
                  </div>

                  {loading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                           <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-[3rem]"></div>
                        ))}
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {offers.map((m) => (
                           <motion.div
                              key={m.id}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                           >
                              <div className="relative group">
                                 <ProductCard medicine={m} onAdd={(med) => addToCart(med)} />
                                 <div className="absolute top-6 right-6 z-20">
                                    <Badge className="bg-pharma-orange text-white border-2 border-white shadow-lg text-[10px] font-black px-3 py-1 rounded-full">-{m.discount}%</Badge>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </main>

         <div className="mt-20">
            <ModernFooter />
         </div>
      </div>
   )
}
