'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { ModernNavbar } from '@/components/ModernNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  ShieldCheck, 
  Shield, 
  Check, 
  QrCode, 
  Upload, 
  ArrowLeft, 
  CheckCircle,
  FileImage,
  RefreshCw,
  PlusCircle,
  X,
  Building,
  Home,
  Map
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from '@/utils/axiosSetup'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LoginDialog } from '@/components/LoginDialog'
import { LogoutDialog } from '@/components/LogoutDialog'
import { Input } from '@/components/ui/input'

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

   // Workflow Steps: 1: Basket, 2: Logistics, 3: Settlement
   const [step, setStep] = useState(1)
   const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR'>('COD')
   const [pharmacySettings, setPharmacySettings] = useState<any>(null)
   const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
   const [screenshotUrl, setScreenshotUrl] = useState('')

   // Address Management State
   const [addresses, setAddresses] = useState<any[]>([])
   const [selectedAddress, setSelectedAddress] = useState<any>(null)
   const [showAddressForm, setShowAddressForm] = useState(false)
   const [newAddress, setNewAddress] = useState({
      label: '',
      address_type: 'HOME',
      address_line: '',
      city: '',
      is_default: false
   })
   const [savingAddress, setSavingAddress] = useState(false)

   // Fetch logistics & pharmacy settings
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

      const fetchSettings = async () => {
         try {
            const res = await axios.get('/pharmacy-settings/')
            if (res.data.length > 0) {
               setPharmacySettings(res.data[0])
            }
         } catch (err) {
            console.error("Failed to fetch pharmacy settings", err)
         }
      }

      fetchDelivery()
      fetchSettings()
   }, [])

   // Fetch user addresses
   const fetchAddresses = async () => {
      if (!user) return
      try {
         const res = await axios.get('/addresses/')
         setAddresses(res.data)
         if (res.data.length > 0) {
            // Default address promotion
            const def = res.data.find((a: any) => a.is_default)
            setSelectedAddress(def || res.data[0])
         } else {
            setSelectedAddress(null)
         }
      } catch (err) {
         console.error("Failed to fetch addresses")
      }
   }

   useEffect(() => {
      fetchAddresses()
   }, [user])

   // Handle file upload for payment screenshot
   const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploadingScreenshot(true)
      const t = toast.loading("Uploading payment screenshot...")
      const formData = new FormData()
      formData.append("file", file)

      try {
         const res = await axios.post("/upload/", formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         })
         setScreenshotUrl(res.data.secure_url)
         toast.success("Screenshot uploaded successfully!", { id: t })
      } catch (err) {
         console.error("Upload error", err)
         toast.error("Failed to upload screenshot. Please try again.", { id: t })
      } finally {
         setUploadingScreenshot(false)
      }
   }

   // Handle saving new address inline
   const handleSaveAddress = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newAddress.label || !newAddress.address_line || !newAddress.city) {
         toast.error("Please fill in all fields")
         return
      }

      setSavingAddress(true)
      try {
         await axios.post('/addresses/', newAddress)
         toast.success("Address added successfully!")
         setShowAddressForm(false)
         setNewAddress({
            label: '',
            address_type: 'HOME',
            address_line: '',
            city: '',
            is_default: false
         })
         await fetchAddresses()
      } catch (err) {
         toast.error("Failed to save address")
      } finally {
         setSavingAddress(false)
      }
   }

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

      if (!selectedAddress) {
         toast.error("Please select a shipping address")
         setStep(2)
         return
      }

      if (paymentMethod === 'QR' && !screenshotUrl) {
         toast.error("Please upload the payment screenshot")
         return
      }

      setIsCheckingOut(true)
      try {
         const payload = {
            items: cart.map(i => ({ medicine_id: i.id, quantity: i.qty })),
            payment_method: paymentMethod,
            payment_screenshot: paymentMethod === 'QR' ? screenshotUrl : null,
            delivery_option: selectedDelivery?.id,
            distance_km: distance
         }

         await axios.post('/sales/', payload)
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
         <div className="min-h-screen bg-slate-50 flex flex-col pt-[150px]">
            <ModernNavbar userLoggedIn={!!user} cartCount={0} onLogin={() => setShowLoginDialog(true)} onLogout={() => setShowLogoutDialog(true)} />
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300">
                     <ShoppingBag size={48} />
                  </div>
                  <div>
                     <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Medicine Cart is Empty</h1>
                     <p className="text-slate-500 mt-2 font-medium">Browse our apothecary to find essential treatments.</p>
                  </div>
                  <Button onClick={() => router.push('/')} className="bg-pharma-blue hover:bg-pharma-blue/90 text-white rounded-xl h-14 px-10 font-bold uppercase tracking-widest shadow-pharma-blue/20">
                     Return to Pharmacy
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
            cartCount={cart.reduce((a, c) => a + c.qty, 0)}
            onLogin={() => setShowLoginDialog(true)}
            onLogout={() => setShowLogoutDialog(true)}
         />

         <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
         <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={() => { logout(); setShowLogoutDialog(false); }} />

         <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-24">
            
            {/* Stepper Workflow Header */}
            <div className="mb-12 max-w-3xl mx-auto w-full">
               <div className="flex items-center justify-between relative px-2">
                  <div className="absolute left-6 right-6 top-[20px] h-[3px] bg-slate-200 -z-10 rounded-full" />
                  <div 
                     className="absolute left-6 top-[20px] h-[3px] bg-emerald-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                     style={{ width: `${step === 1 ? '0%' : step === 2 ? '50%' : '100%'}` }}
                  />

                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer z-10" onClick={() => setStep(1)}>
                     <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                        step >= 1 
                           ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                           : 'bg-white border-slate-300 text-slate-400'
                     }`}>
                        {step > 1 ? <Check size={18} /> : '1'}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>Cart</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer z-10" onClick={() => { if(user) setStep(2) }}>
                     <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                        step >= 2 
                           ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                           : 'bg-white border-slate-300 text-slate-400'
                     }`}>
                        {step > 2 ? <Check size={18} /> : '2'}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>Shipping Details</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-2 z-10">
                     <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                        step === 3 
                           ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                           : 'bg-white border-slate-300 text-slate-400'
                     }`}>
                        3
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 3 ? 'text-emerald-600' : 'text-slate-400'}`}>Payment</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start">

               {/* Left Column: Variable Content based on Step */}
               <div className="flex-1 w-full space-y-6">

                  {/* STEP 1: BASKET REVIEW */}
                  {step === 1 && (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                     >
                        <div className="flex items-center justify-between mb-6">
                           <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                              Medicine Cart <Badge className="bg-pharma-blue/10 text-pharma-blue border-transparent px-3">{cart.length} Item Types</Badge>
                           </h1>
                           <button onClick={clearCart} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition">Empty Cart</button>
                        </div>

                        <div className="space-y-4">
                           {cart.map((item) => (
                              <Card key={item.id} className="rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition bg-white overflow-hidden p-6">
                                 <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden relative shrink-0">
                                       {item.image_url ? (
                                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                       ) : (
                                          <ShoppingBag size={24} className="text-pharma-blue" />
                                       )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                       <span className="text-[10px] font-bold uppercase tracking-widest text-pharma-blue mb-1 block">{item.category || 'General'}</span>
                                       <h3 className="text-lg font-bold text-slate-900 leading-none">{item.name}</h3>
                                       <p className="text-sm font-bold text-emerald-600 mt-2">Rs. {parseFloat(item.price.toString()).toFixed(2)}</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                       <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-pharma-blue active:scale-90 transition">
                                          <Minus size={14} />
                                       </button>
                                       <span className="w-8 text-center font-bold text-slate-900">{item.qty}</span>
                                       <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-pharma-blue active:scale-90 transition">
                                          <Plus size={14} />
                                       </button>
                                    </div>

                                    <div className="text-right flex flex-col items-center sm:items-end">
                                       <p className="text-lg font-bold text-slate-900">Rs. {(item.price * item.qty).toFixed(2)}</p>
                                       <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition mt-1">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </div>
                              </Card>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {/* STEP 2: LOGISTICS & SHIPPING */}
                  {step === 2 && (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                     >
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shipping Details</h2>
                           <p className="text-slate-500 text-sm mt-1">Select where and how you want your medical order delivered.</p>
                        </div>

                        {/* Shipping Address Section */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <MapPin size={16} className="text-rose-500" /> Shipping Address
                              </label>
                              <button 
                                 onClick={() => setShowAddressForm(!showAddressForm)} 
                                 className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full transition"
                              >
                                 <PlusCircle size={14} /> Add New Address
                              </button>
                           </div>

                           {/* Inline Add Address Form */}
                           <AnimatePresence>
                              {showAddressForm && (
                                 <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                 >
                                    <Card className="p-6 border-dashed border-emerald-300 bg-emerald-50/10 rounded-xl space-y-4">
                                       <h3 className="text-sm font-bold text-slate-900 flex justify-between items-center">
                                          Create Shipping Address
                                          <button onClick={() => setShowAddressForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                                       </h3>
                                       <form onSubmit={handleSaveAddress} className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                             <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Address Label</label>
                                                <Input 
                                                   value={newAddress.label} 
                                                   onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                                                   placeholder="e.g. My Home, Work Office" 
                                                   className="h-11 rounded-xl bg-white"
                                                   required
                                                />
                                             </div>
                                             <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Address Type</label>
                                                <select 
                                                   value={newAddress.address_type} 
                                                   onChange={e => setNewAddress({...newAddress, address_type: e.target.value})}
                                                   className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                                                >
                                                   <option value="HOME">Home</option>
                                                   <option value="OFFICE">Office</option>
                                                   <option value="OTHER">Other</option>
                                                </select>
                                             </div>
                                          </div>
                                          <div>
                                             <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Street Address</label>
                                             <Input 
                                                value={newAddress.address_line} 
                                                onChange={e => setNewAddress({...newAddress, address_line: e.target.value})}
                                                placeholder="e.g. 123 Main Street, Apt 4B" 
                                                className="h-11 rounded-xl bg-white"
                                                required
                                             />
                                          </div>
                                          <div>
                                             <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">City</label>
                                             <Input 
                                                value={newAddress.city} 
                                                onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                                placeholder="e.g. Kathmandu" 
                                                className="h-11 rounded-xl bg-white"
                                                required
                                             />
                                          </div>
                                          <div className="flex justify-end gap-3 pt-2">
                                             <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)} className="rounded-xl h-10 px-4 text-xs font-bold text-slate-500">
                                                Cancel
                                             </Button>
                                             <Button type="submit" disabled={savingAddress} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-bold">
                                                {savingAddress ? 'Saving...' : 'Save Address'}
                                             </Button>
                                          </div>
                                       </form>
                                    </Card>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           {/* Saved Addresses Grid */}
                           {addresses.length === 0 ? (
                              <div className="text-center py-10 bg-white border border-slate-200 rounded-xl p-6">
                                 <Map className="mx-auto h-12 w-12 text-slate-300" />
                                 <h3 className="mt-2 text-sm font-bold text-slate-900">No addresses saved</h3>
                                 <p className="mt-1 text-xs text-slate-500">Add a shipping address above to proceed with delivery.</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {addresses.map((addr) => {
                                    const isSelected = selectedAddress?.id === addr.id
                                    return (
                                       <button
                                          key={addr.id}
                                          type="button"
                                          onClick={() => setSelectedAddress(addr)}
                                          className={`p-5 rounded-xl border text-left transition-all relative overflow-hidden ${
                                             isSelected 
                                                ? 'border-emerald-500 bg-emerald-50/10 shadow-sm shadow-emerald-500/5' 
                                                : 'border-slate-100 hover:border-slate-200 bg-white'
                                          }`}
                                       >
                                          {isSelected && (
                                             <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1.5 rounded-bl-xl">
                                                <Check size={12} />
                                             </div>
                                          )}
                                          <div className="flex items-center gap-2 mb-2">
                                             {addr.address_type === 'OFFICE' ? <Building size={16} className="text-slate-400" /> : <Home size={16} className="text-slate-400" />}
                                             <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                                             {addr.is_default && <Badge className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Default</Badge>}
                                          </div>
                                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{addr.address_line}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{addr.city}</p>
                                       </button>
                                    )
                                 })}
                              </div>
                           )}
                        </div>

                        {/* Delivery Option Selector */}
                        <div className="space-y-4">
                           <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <Truck size={16} className="text-pharma-blue" /> Delivery Options
                           </label>
                           <div className="grid grid-cols-1 gap-3">
                              {deliveryOptions.map(opt => (
                                 <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setSelectedDelivery(opt)}
                                    className={`p-5 rounded-xl border transition-all text-left group relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${selectedDelivery?.id === opt.id ? 'border-pharma-blue bg-pharma-blue/5 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                 >
                                    <div className="flex items-start gap-4">
                                       <div className={`p-3 rounded-xl border ${selectedDelivery?.id === opt.id ? 'bg-pharma-blue text-white' : 'bg-slate-50 text-slate-400'}`}>
                                          <Truck size={18} />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-slate-900">{opt.name}</p>
                                          <p className="text-xs text-slate-400 font-medium mt-0.5 leading-tight">{opt.description}</p>
                                       </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                       <p className="text-xs font-bold text-slate-900 uppercase">Base: Rs. {opt.base_charge}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">+Rs. {opt.per_km_charge}/KM surcharge</p>
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Distance Simulator */}
                        <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <MapPin size={16} className="text-pharma-orange" />
                                 <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Distance Simulation</span>
                              </div>
                              <span className="text-sm font-bold text-pharma-orange">{distance} KM</span>
                           </div>
                           <input
                              type="range"
                              min="1"
                              max="50"
                              value={distance}
                              onChange={(e) => setDistance(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pharma-orange"
                           />
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Simulating delivery from pharmacy dispatch center to shipping location</p>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP 3: PAYMENT / SETTLEMENT */}
                  {step === 3 && (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                     >
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settlement & Verification</h2>
                           <p className="text-slate-500 text-sm mt-1">Verify details and choose your payment protocol.</p>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-4">
                           <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <CreditCard size={16} className="text-emerald-500" /> Select Payment Method
                           </label>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              
                              {/* COD Option */}
                              <button
                                 type="button"
                                 onClick={() => { setPaymentMethod('COD'); setScreenshotUrl(''); }}
                                 className={`p-6 rounded-xl border text-left transition-all flex items-center gap-4 relative overflow-hidden ${
                                    paymentMethod === 'COD' 
                                       ? 'border-emerald-500 bg-emerald-50/10 shadow-sm shadow-emerald-500/5' 
                                       : 'border-slate-100 hover:border-slate-200 bg-white'
                                 }`}
                              >
                                 {paymentMethod === 'COD' && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1.5 rounded-bl-xl">
                                       <Check size={12} />
                                    </div>
                                 )}
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <Truck size={22} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Pay with cash upon delivery</p>
                                 </div>
                              </button>

                              {/* Online Payment Option */}
                              <button
                                 type="button"
                                 onClick={() => setPaymentMethod('QR')}
                                 className={`p-6 rounded-xl border text-left transition-all flex items-center gap-4 relative overflow-hidden ${
                                    paymentMethod === 'QR' 
                                       ? 'border-emerald-500 bg-emerald-50/10 shadow-sm shadow-emerald-500/5' 
                                       : 'border-slate-100 hover:border-slate-200 bg-white'
                                 }`}
                              >
                                 {paymentMethod === 'QR' && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1.5 rounded-bl-xl">
                                       <Check size={12} />
                                    </div>
                                 )}
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'QR' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <QrCode size={22} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">Online QR Payment</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Scan code & upload receipt</p>
                                 </div>
                              </button>
                           </div>
                        </div>

                        {/* COD Info Panel */}
                        {paymentMethod === 'COD' && (
                           <Card className="rounded-xl border-emerald-100 bg-emerald-50/20 p-6 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                 <CheckCircle size={20} />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-slate-900">Cash on Delivery Selection</h4>
                                 <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    No immediate payment is required. You will settle the bill directly with the delivery agent when your medical order arrives. Please ensure you have the exact amount ready (<strong>Rs. {finalTotal.toFixed(2)}</strong>) if possible.
                                 </p>
                              </div>
                           </Card>
                        )}

                        {/* Online QR payment Panel */}
                        {paymentMethod === 'QR' && (
                           <div className="space-y-6">
                              {/* QR Scan box */}
                              <Card className="rounded-xl border border-slate-100 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                                 <div className="w-48 h-48 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-3 relative overflow-hidden shadow-inner shrink-0">
                                    {pharmacySettings?.qr_code_url ? (
                                       <Image 
                                          src={pharmacySettings.qr_code_url} 
                                          alt="Merchant Payment QR" 
                                          fill 
                                          className="object-contain p-2"
                                       />
                                    ) : (
                                       <div className="text-center p-4">
                                          <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QR Code Not Configured</p>
                                       </div>
                                    )}
                                 </div>

                                 <div className="space-y-3 text-center md:text-left">
                                    <Badge className="bg-pharma-blue/10 text-pharma-blue border-transparent px-3 py-1 font-bold tracking-widest text-[9px] uppercase">Scan & Pay</Badge>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Secure Digital Settlement</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                                       Scan the merchant QR code using your mobile banking or digital wallet app (like eSewa, Fonepay, Khalti) and complete the payment of <strong>Rs. {finalTotal.toFixed(2)}</strong>.
                                    </p>
                                 </div>
                              </Card>

                              {/* Upload screenshot */}
                              <div className="space-y-3">
                                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Upload size={16} className="text-slate-400" /> Upload Payment Receipt / Screenshot
                                 </label>
                                 <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                    <div className="flex-1">
                                       <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={handleScreenshotUpload}
                                          className="hidden" 
                                          id="screenshot-uploader"
                                          disabled={uploadingScreenshot}
                                       />
                                       <label 
                                          htmlFor="screenshot-uploader"
                                          className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center ${
                                             screenshotUrl 
                                                ? 'border-emerald-300 bg-emerald-50/5' 
                                                : 'border-slate-200 hover:border-slate-400 bg-white'
                                          }`}
                                       >
                                          {uploadingScreenshot ? (
                                             <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-bold">
                                                <RefreshCw className="h-6 w-6 animate-spin" />
                                                Uploading...
                                             </div>
                                          ) : screenshotUrl ? (
                                             <div className="flex flex-col items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                                <CheckCircle className="h-6 w-6" />
                                                Screenshot Saved
                                             </div>
                                          ) : (
                                             <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                <Upload className="h-6 w-6 text-slate-300" />
                                                Upload Receipt Image
                                                <span className="text-[10px] font-medium text-slate-300">JPG, PNG, WEBP</span>
                                             </div>
                                          )}
                                       </label>
                                    </div>

                                    {/* Preview container */}
                                    {screenshotUrl && (
                                       <div className="w-28 h-28 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shrink-0 shadow-inner group">
                                          <img 
                                             src={screenshotUrl} 
                                             alt="Payment Screenshot Preview" 
                                             className="w-full h-full object-cover"
                                          />
                                          <button 
                                             onClick={() => setScreenshotUrl('')}
                                             className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition opacity-90"
                                          >
                                             <X size={12} />
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}
                     </motion.div>
                  )}
               </div>

               {/* Right Column: Sticky Order Summary & Navigation Controls */}
               <div className="w-full lg:w-[420px] space-y-8 sticky top-32">
                  <Card className="rounded-xl border-transparent shadow-slate-200/50 bg-white p-8">
                     <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Order Summary</h2>

                     <div className="space-y-8">
                        
                        {/* Address Summary (Shown in Steps 2 & 3) */}
                        {step > 1 && selectedAddress && (
                           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                              <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Shipping Address</p>
                                 <p className="text-xs font-bold text-slate-800">{selectedAddress.label}</p>
                                 <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">{selectedAddress.address_line}, {selectedAddress.city}</p>
                              </div>
                           </div>
                        )}

                        {/* Delivery Option Summary (Shown in Steps 2 & 3) */}
                        {step > 1 && selectedDelivery && (
                           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                              <Truck size={16} className="text-pharma-blue shrink-0 mt-0.5" />
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Delivery Option</p>
                                 <p className="text-xs font-bold text-slate-800">{selectedDelivery.name}</p>
                                 <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">{selectedDelivery.description} (Dist: {distance} KM)</p>
                              </div>
                           </div>
                        )}

                        {/* Cost Breakdown */}
                        <div className="pt-2 space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Medicine Total</span>
                              <span className="font-bold text-slate-900 uppercase tracking-tighter">Rs. {cartTotal.toFixed(2)}</span>
                           </div>
                           
                           {step > 1 && (
                              <div className="flex justify-between items-center text-sm">
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Delivery Charge</span>
                                    <AlertCircle size={14} className="text-slate-300" />
                                 </div>
                                 <span className="font-bold text-pharma-blue uppercase tracking-tighter">+ Rs. {deliveryCharge.toFixed(2)}</span>
                              </div>
                           )}
                           
                           <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Total Cost</p>
                                 <p className="text-2xl font-bold text-slate-900 tracking-tighter leading-none">
                                    <span className="text-emerald-600 text-sm mr-1">Rs.</span>
                                    {step > 1 ? finalTotal.toFixed(2) : cartTotal.toFixed(2)}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="space-y-3 pt-2">
                           
                           {/* Step 1 Actions */}
                           {step === 1 && (
                              <Button
                                 onClick={() => {
                                    if (!user) {
                                       toast.error("Please login to proceed with shipping")
                                       setShowLoginDialog(true)
                                    } else {
                                       setStep(2)
                                    }
                                 }}
                                 className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-xl h-14 font-bold uppercase tracking-widest shadow-slate-900/10 flex items-center justify-center gap-2 transition group"
                              >
                                 {user ? 'Proceed to Shipping' : 'Login to Continue'}
                                 <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                              </Button>
                           )}

                           {/* Step 2 Actions */}
                           {step === 2 && (
                              <div className="space-y-3">
                                 <Button
                                    disabled={!selectedAddress || !selectedDelivery}
                                    onClick={() => setStep(3)}
                                    className="w-full bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl h-14 font-bold uppercase tracking-widest shadow-slate-900/10 flex items-center justify-center gap-2 transition group"
                                 >
                                    Proceed to Payment
                                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                                 </Button>
                                 <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="w-full rounded-xl h-14 border-slate-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 transition"
                                 >
                                    <ArrowLeft size={14} /> Back to Cart
                                 </Button>
                              </div>
                           )}

                           {/* Step 3 Actions */}
                           {step === 3 && (
                              <div className="space-y-3">
                                 <Button
                                    disabled={isCheckingOut || (paymentMethod === 'QR' && !screenshotUrl)}
                                    onClick={handleCheckout}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl h-16 font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2 transition"
                                 >
                                    {isCheckingOut ? (
                                       <div className="flex items-center gap-2">
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                          Processing...
                                       </div>
                                    ) : paymentMethod === 'QR' ? (
                                       'Place Order (Online)'
                                    ) : (
                                       'Place Order (COD)'
                                    )}
                                 </Button>
                                 <Button
                                    variant="outline"
                                    onClick={() => setStep(2)}
                                    className="w-full rounded-xl h-14 border-slate-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 transition"
                                 >
                                    <ArrowLeft size={14} /> Back to Shipping
                                 </Button>
                              </div>
                           )}
                        </div>

                        {/* <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                           <ShieldCheck size={14} /> Encrypted Settlement
                        </div> */}
                     </div>
                  </Card>
               </div>
            </div>
         </main>

         <ModernFooter />
      </div>
   )
}
