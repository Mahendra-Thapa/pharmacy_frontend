'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import axios from '@/utils/axiosSetup'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, Clock, MapPin, ChevronRight, Search, X, 
  ChevronLeft, ChevronDown, ShoppingBag, Activity,
  CreditCard, Truck, Hash, Edit3, AlertCircle, CheckCircle,
  Plus, Minus, Trash2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:    { color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',    label: 'Pending' },
  CONFIRMED:  { color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',      label: 'Confirmed' },
  PROCESSING: { color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-200',  label: 'Processing' },
  READY:      { color: 'text-teal-600',    bg: 'bg-teal-50 border-teal-200',      label: 'Ready' },
  DISPATCHED: { color: 'text-indigo-600',  bg: 'bg-indigo-50 border-indigo-200',  label: 'Dispatched' },
  DELIVERED:  { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',label: 'Delivered' },
  CANCELLED:  { color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200',      label: 'Cancelled' },
}

const ITEMS_PER_PAGE = 10

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  
  // Edit State
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [editItems, setEditItems] = useState<any[]>([])
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('/sales/my_orders/')
      setOrders(res.data)
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Filter & Paginate
  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.status?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Check if order is editable (within 30 minutes)
  const isEditable = (order: any) => {
    if (order.status !== 'PENDING') return false
    const orderDate = new Date(order.date_added)
    const now = new Date()
    const diffMs = now.getTime() - orderDate.getTime()
    return diffMs < 30 * 60 * 1000 // 30 minutes
  }

  const getEditTimeRemaining = (order: any) => {
    const orderDate = new Date(order.date_added)
    const now = new Date()
    const diffMs = now.getTime() - orderDate.getTime()
    const remaining = 30 * 60 * 1000 - diffMs
    if (remaining <= 0) return null
    const mins = Math.floor(remaining / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    return `${mins}m ${secs}s`
  }

  const handleStartEdit = (order: any) => {
    setEditingOrder(order)
    setEditItems(order.items.map((i: any) => ({ ...i })))
  }

  const handleUpdateItemQty = (medicineId: number, delta: number) => {
    setEditItems(prev => prev.map(item => {
      if (item.medicine === medicineId) {
        const newQty = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(i => i.quantity > 0))
  }

  const handleSaveOrderChanges = async () => {
    if (!editingOrder) return
    if (editItems.length === 0) {
      toast.error("Order must have at least one item. Consider canceling instead.")
      return
    }
    
    setIsUpdatingOrder(true)
    try {
      const payload = {
        items: editItems.map(i => ({ medicine_id: i.medicine, quantity: i.quantity }))
      }
      await axios.patch(`/sales/${editingOrder.id}/`, payload)
      toast.success("Order protocol updated successfully")
      setEditingOrder(null)
      fetchOrders()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update order protocol")
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">My Orders</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Track all your pharmacy orders</p>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search by order# or status..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-12 pl-12 pr-10 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-pharma-blue/20 w-full md:w-72 transition-all" 
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pharma-blue transition-colors" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Package size={40} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">No Orders Found</h3>
          <p className="text-sm font-bold text-slate-400 max-w-xs uppercase tracking-widest leading-loose">
            {search ? 'No orders match your search.' : 'Place your first order to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {paginated.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING']
                const editable = isEditable(order)
                const timeLeft = getEditTimeRemaining(order)

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="group rounded-[2.5rem] border-transparent shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden">
                      <div className="p-6 lg:p-8">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-pharma-blue/5 rounded-[1.5rem] flex items-center justify-center group-hover:bg-pharma-blue group-hover:text-white transition-all duration-500 shrink-0">
                              <Package size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Hash size={12} className="text-slate-400" />
                                <span className="text-sm font-black text-slate-900 tracking-tight">{order.order_number || `RX-${order.id.toString().padStart(5,'0')}`}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">
                                  {new Date(order.date_added).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`text-[9px] font-black uppercase tracking-widest border px-3 py-1 ${statusCfg.bg} ${statusCfg.color}`}>
                              {statusCfg.label}
                            </Badge>
                            {editable && timeLeft && (
                              <button
                                onClick={() => handleStartEdit(order)}
                                className="text-[9px] bg-amber-50 border border-amber-200 text-amber-600 font-black uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-2 hover:bg-amber-100 transition-colors"
                              >
                                <Edit3 size={10} /> Edit: {timeLeft}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                              className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-pharma-blue group-hover:text-white transition-all"
                            >
                              <ChevronDown size={18} className={`transition-transform ${selectedOrder?.id === order.id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</span>
                            <p className="text-sm font-black text-slate-900">{order.items?.length || 0} Products</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                            <p className="text-sm font-black text-pharma-green">Rs. {parseFloat(order.total_amount).toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                            <p className="text-sm font-bold text-slate-600">{order.payment?.method || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handler</span>
                            <p className="text-sm font-bold text-slate-600">{order.handled_by_name || 'Online'}</p>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {selectedOrder?.id === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-6 border-t border-slate-100 space-y-6">
                                {/* Items */}
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <ShoppingBag size={12} /> Order Items
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items?.map((item: any) => (
                                      <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                          <p className="text-sm font-black text-slate-900">{item.medicine_name}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rs. {parseFloat(item.price).toFixed(2)} / unit</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-slate-500">×{item.quantity}</p>
                                          <p className="text-sm font-black text-pharma-green">Rs. {parseFloat(item.total).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Status Timeline */}
                                {order.status_history && order.status_history.length > 0 && (
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                      <Activity size={12} /> Status Timeline
                                    </h4>
                                    <div className="space-y-2">
                                      {order.status_history.slice(0, 5).map((hist: any, i: number) => (
                                        <div key={hist.id || i} className="flex items-center gap-4 text-xs">
                                          <div className="w-2 h-2 rounded-full bg-pharma-blue shrink-0" />
                                          <span className="font-black text-slate-900 uppercase text-[10px]">{hist.new_status}</span>
                                          <span className="text-slate-400 font-bold">by {hist.changed_by_name || 'System'}</span>
                                          <span className="text-slate-300 font-bold ml-auto">
                                            {new Date(hist.changed_at).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Edit Notice */}
                                {editable ? (
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-amber-50 border border-amber-200 rounded-[2rem]">
                                    <div className="flex items-start gap-3">
                                      <Edit3 size={18} className="text-amber-600 shrink-0 mt-1" />
                                      <div>
                                        <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Order Modification Active</p>
                                        <p className="text-[10px] font-bold text-amber-600 max-w-sm uppercase tracking-widest leading-relaxed">
                                          You have {timeLeft} remaining to adjust this protocol before it is finalized.
                                        </p>
                                      </div>
                                    </div>
                                    <Button 
                                      onClick={() => handleStartEdit(order)}
                                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-600/20 w-full sm:w-auto mt-2 sm:mt-0"
                                    >
                                      Modify Protocol
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Order editing window has closed (30 min limit). Contact medical support for changes.</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {page} of {totalPages} • {filtered.length} orders
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl h-9 w-9 p-0 shadow-sm"><ChevronLeft size={16} /></Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page + i - 2
                  if (pg < 1 || pg > totalPages) return null
                  return (
                    <Button key={pg} variant={pg === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(pg)} className={`rounded-xl h-9 w-9 p-0 text-xs font-black shadow-sm ${pg === page ? 'bg-pharma-blue text-white border-pharma-blue' : ''}`}>{pg}</Button>
                  )
                })}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl h-9 w-9 p-0 shadow-sm"><ChevronRight size={16} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 border-transparent shadow-3xl bg-white overflow-hidden">
          <DialogHeader>
            <div className="w-16 h-16 bg-pharma-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-pharma-blue/10">
              <Edit3 size={32} className="text-pharma-blue" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Modify Protocol</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Adjusting Order {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {editItems.map((item) => (
              <div key={item.id} className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-pharma-blue/20 transition-all duration-300">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 leading-tight">{item.medicine_name}</p>
                  <p className="text-[10px] font-bold text-pharma-green uppercase tracking-widest">
                    Rs. {parseFloat(item.price).toFixed(2)} / unit
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                  <button 
                    onClick={() => handleUpdateItemQty(item.medicine, -1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateItemQty(item.medicine, 1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-pharma-blue/10 hover:text-pharma-blue transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {editItems.length === 0 && (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 opacity-50">
                   <ShoppingBag size={24} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No items remaining.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Valuation</p>
                <p className="text-xl font-black text-pharma-green">
                   Rs. {editItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)}
                </p>
             </div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right max-w-[150px]">
                Final total will be updated in your ledger.
             </p>
          </div>

          <DialogFooter className="gap-4">
            <Button 
              variant="outline" 
              onClick={() => setEditingOrder(null)}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200"
            >
              Discard Changes
            </Button>
            <Button 
              onClick={handleSaveOrderChanges}
              disabled={isUpdatingOrder || editItems.length === 0}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-pharma-blue hover:bg-pharma-blue/90 text-white shadow-xl shadow-pharma-blue/20"
            >
              {isUpdatingOrder ? 'Transmitting...' : 'Commit Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

