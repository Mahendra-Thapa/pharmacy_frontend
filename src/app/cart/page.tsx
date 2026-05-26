'use client'

import Image from 'next/image'

import React, { useState, useEffect } from 'react'
import { ModernNavbar } from '@/components/ModernNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, Truck, MapPin, CreditCard, ChevronRight, AlertCircle, ShieldCheck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from '@/utils/axiosSetup'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LoginDialog } from '@/components/LoginDialog'
import { LogoutDialog } from '@/components/LogoutDialog'

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [distance, setDistance] = useState(5) // Default 5km simulator
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await axios.get('/delivery-options/')
        setDeliveryOptions(res.data)
        if (res.data.length > 0) setSelectedDelivery(res.data[0])
      } catch (err) {
        console.error("Failed to fetch delivery options")
      }
    }
    fetchDelivery()
  }, [])

  const deliveryCharge = selectedDelivery 
    ? (parseFloat(selectedDelivery.base_charge) + (distance * parseFloat(selectedDelivery.per_km_charge)))
    : 0

  const finalTotal = cartTotal + deliveryCharge

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to proceed with the medical order")
      setShowLoginDialog(true)
      return
    }

    setIsCheckingOut(true)
    try {
      const payload = {
        items: cart.map(i => ({ medicine_id: i.id, quantity: i.qty })),
        payment_method: 'CASH', 
        delivery_option: selectedDelivery?.id,
        distance_km: distance
      }
      
      const res = await axios.post('/sales/', payload)
      toast.success("Order Placed Successfully!")
      clearCart()
      router.push('/user/orders')
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Checkout failed. Please check stock levels.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ModernNavbar userLoggedIn={!!user} cartCount={0} onLogin={() => setShowLoginDialog(true)} onLogout={() => setShowLogoutDialog(true)} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
               <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300">
                  <ShoppingBag size={48} />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Medical Basket is Empty</h1>
                  <p className="text-slate-500 mt-2 font-medium">Browse our apothecary to find essential treatments.</p>
               </div>
               <Button onClick={() => router.push('/')} className="bg-pharma-blue hover:bg-pharma-blue/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-pharma-blue/20">
                  Return to Dispensary
               </Button>
            </motion.div>
        </main>
        <ModernFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ModernNavbar 
        userLoggedIn={!!user} 
        cartCount={cart.reduce((a,c) => a+c.qty, 0)} 
        onLogin={() => setShowLoginDialog(true)}
        onLogout={() => setShowLogoutDialog(true)}
      />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={() => { logout(); setShowLogoutDialog(false); }} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-24">
         <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left: Cart Items */}
            <div className="flex-1 w-full space-y-6">
               <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                     Medical Basket <Badge className="bg-pharma-blue/10 text-pharma-blue border-transparent px-3">{cart.length} Unit Types</Badge>
                  </h1>
                  <button onClick={clearCart} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition">Empty All</button>
               </div>

               <div className="space-y-4">
                  <AnimatePresence>
                     {cart.map((item) => (
                        <motion.div 
                           key={item.id} 
                           layout
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                        >
                           <Card className="rounded-[2.5rem] border-transparent shadow-sm hover:shadow-md transition bg-white overflow-hidden p-6">
                              <div className="flex flex-col sm:flex-row items-center gap-6">
                                 <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
                                    {item.image_url ? (
                                       <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                    ) : (
                                       <ShoppingBag size={24} className="text-pharma-blue" />
                                    )}
                                 </div>
                                 <div className="flex-1 text-center sm:text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-pharma-blue mb-1 block">{item.category || 'General Pharma'}</span>
                                    <h3 className="text-lg font-black text-slate-900 leading-none">{item.name}</h3>
                                    <p className="text-sm font-black text-pharma-green mt-2">Rs. {parseFloat(item.price.toString()).toFixed(2)}</p>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-pharma-blue active:scale-90 transition">
                                       <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-black text-slate-900">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-pharma-blue active:scale-90 transition">
                                       <Plus size={14} />
                                    </button>
                                 </div>

                                 <div className="text-right flex flex-col items-center sm:items-end">
                                    <p className="text-lg font-black text-slate-900">Rs. {(item.price * item.qty).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition">
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            {/* Right: Summary & Logistics */}
            <div className="w-full lg:w-[420px] space-y-8 sticky top-32">
               <Card className="rounded-[3rem] border-transparent shadow-2xl shadow-slate-200/50 bg-white p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Supply Logistics</h2>
                  
                  <div className="space-y-8">
                     {/* Delivery Selection */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <Truck size={18} className="text-pharma-blue" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Mode</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           {deliveryOptions.map(opt => (
                              <button 
                                 key={opt.id}
                                 onClick={() => setSelectedDelivery(opt)}
                                 className={`p-4 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${selectedDelivery?.id === opt.id ? 'border-pharma-blue bg-pharma-blue/5 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'}`}
                              >
                                 {selectedDelivery?.id === opt.id && <div className="absolute top-0 right-0 p-3 bg-pharma-blue text-white rounded-bl-3xl"><CheckCircle2 size={14} /></div>}
                                 <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">{opt.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold leading-tight">{opt.description}</p>
                                 <p className="mt-3 text-[11px] font-black text-pharma-blue uppercase">Base: Rs. {opt.base_charge} <span className="text-slate-300 mx-1">/</span> +Rs. {opt.per_km_charge}/KM</p>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Distance Simulator */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-pharma-orange" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distance Simulation</span>
                           </div>
                           <span className="text-xs font-black text-pharma-orange">{distance} KM</span>
                        </div>
                        <input 
                           type="range" 
                           min="1" 
                           max="50" 
                           value={distance} 
                           onChange={(e) => setDistance(parseInt(e.target.value))}
                           className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pharma-orange"
                        />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Simulating delivery from central warehouse to local address</p>
                     </div>

                     <div className="pt-8 border-t border-slate-50 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Medical Subtotal</span>
                           <span className="font-black text-slate-900 uppercase tracking-tighter">Rs. {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Logistic Surcharge</span>
                              <AlertCircle size={14} className="text-slate-300" />
                           </div>
                           <span className="font-black text-pharma-blue uppercase tracking-tighter">+ Rs. {deliveryCharge.toFixed(2)}</span>
                        </div>
                        <div className="pt-6 border-t border-pharma-blue/10 flex justify-between items-end">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Total Protocol Cost</p>
                              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                 <span className="text-pharma-green text-sm mr-1">Rs.</span>
                                 {finalTotal.toFixed(2)}
                              </p>
                           </div>
                        </div>
                     </div>

                     <Button 
                       disabled={isCheckingOut || !selectedDelivery}
                       onClick={handleCheckout}
                       className="w-full bg-slate-900 hover:bg-pharma-green text-white rounded-[2rem] h-16 font-black uppercase tracking-widest shadow-2xl shadow-slate-900/40 mt-4 group"
                     >
                        {isCheckingOut ? (
                           <div className="flex items-center gap-3">
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                              Processing Protocols...
                           </div>
                        ) : (
                           <div className="flex items-center gap-3">
                              Place Order <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </div>
                        )}
                     </Button>
                     
                     <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <ShieldCheck size={14} /> Encrypted Settlement
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </main>

      <ModernFooter />
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
