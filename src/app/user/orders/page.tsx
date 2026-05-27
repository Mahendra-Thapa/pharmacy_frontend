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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; borderLeft: string }> = {
  PENDING: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Pending', borderLeft: 'border-l-amber-500' },
  CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Confirmed', borderLeft: 'border-l-blue-500' },
  PROCESSING: { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Processing', borderLeft: 'border-l-purple-500' },
  READY: { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', label: 'Ready', borderLeft: 'border-l-teal-500' },
  DISPATCHED: { color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', label: 'Dispatched', borderLeft: 'border-l-indigo-500' },
  DELIVERED: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Delivered', borderLeft: 'border-l-emerald-500' },
  CANCELLED: { color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', label: 'Cancelled', borderLeft: 'border-l-rose-500' },
}

const ITEMS_PER_PAGE = 10

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED'>('ALL')

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
  const filtered = orders.filter(o => {
    if (activeTab === 'PENDING' && o.status !== 'PENDING') return false
    if (activeTab === 'CONFIRMED' && o.status !== 'CONFIRMED') return false
    if (activeTab === 'DELIVERED' && o.status !== 'DELIVERED') return false

    return (
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.status?.toLowerCase().includes(search.toLowerCase())
    )
  })
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-1.5">My Orders</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Track all your pharmacy orders</p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search by order# or status..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-pharma-blue focus:ring-1 focus:ring-pharma-blue/20 w-full md:w-64 transition-all"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pharma-blue transition-colors" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
              <X size={12} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Tabs Dropdown */}
      <div className="md:hidden w-full relative mb-4">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Filter by Status</label>
        <Select
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as any);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-pharma-blue/20 focus:border-pharma-blue">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>

          <SelectContent className="rounded-xl border border-slate-200">
            <SelectItem value="ALL">
              All Orders ({orders.length})
            </SelectItem>

            <SelectItem value="PENDING">
              Pending ({orders.filter((o) => o.status === "PENDING").length})
            </SelectItem>

            <SelectItem value="CONFIRMED">
              Confirmed ({orders.filter((o) => o.status === "CONFIRMED").length})
            </SelectItem>

            <SelectItem value="DELIVERED">
              Completed ({orders.filter((o) => o.status === "DELIVERED").length})
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="absolute right-4 bottom-3.5 pointer-events-none text-slate-400">
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Desktop Tabs Bar */}
      <div className="hidden md:flex border-b border-slate-100 pb-px gap-6 overflow-x-auto scrollbar-hide shrink-0 mb-2">
        {[
          { id: 'ALL', label: 'All Orders', count: orders.length },
          { id: 'PENDING', label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
          { id: 'CONFIRMED', label: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length },
          { id: 'DELIVERED', label: 'Completed', count: orders.filter(o => o.status === 'DELIVERED').length },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setPage(1) }}
              className={`relative pb-3 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${isActive ? 'text-pharma-blue' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-pharma-blue/10 text-pharma-blue' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharma-blue"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center bg-white rounded-xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-slate-300" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">No Orders Found</h3>
          <p className="text-xs font-bold text-slate-400 max-w-xs uppercase tracking-widest leading-loose">
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
                    <Card className={`group rounded-xl border border-slate-100 border-l-4 ${statusCfg.borderLeft} shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden`}>
                      <div className="p-5 lg:p-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID:</span>
                                <span className="text-sm font-black text-slate-900 tracking-tight">{order.order_number || `RX-${order.id.toString().padStart(5, '0')}`}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={11} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-400">
                                  {new Date(order.date_added).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                              {statusCfg.label}
                            </Badge>
                            {editable && timeLeft && (
                              <button
                                onClick={() => handleStartEdit(order)}
                                className="text-[9px] bg-amber-50 border border-amber-200 text-amber-600 font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                <Edit3 size={10} /> Edit: {timeLeft}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                              className="w-8 h-8 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-500 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-slate-100"
                            >
                              <ChevronDown size={16} className={`transition-transform duration-300 ${selectedOrder?.id === order.id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Order Summary Grid */}
                        <div className="bg-slate-50/60 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Items</span>
                            <p className="text-xs font-black text-slate-850">{order.items?.length || 0} Products</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</span>
                            <p className="text-xs font-black text-pharma-green">Rs. {parseFloat(order.total_amount).toFixed(2)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</span>
                            <p className="text-xs font-bold text-slate-600">{order.payment?.method || 'N/A'}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Handler</span>
                            <p className="text-xs font-bold text-slate-600">{order.handled_by_name || 'Online'}</p>
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
                              <div className="pt-5 mt-4 border-t border-slate-100 space-y-5">
                                {/* Items */}
                                <div>
                                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                    <ShoppingBag size={11} /> Order Items
                                  </h4>
                                  <div className="space-y-2">
                                    {order.items?.map((item: any) => (
                                      <div key={item.id} className="flex justify-between items-center p-3.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div>
                                          <p className="text-xs font-black text-slate-850">{item.medicine_name}</p>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rs. {parseFloat(item.price).toFixed(2)} / unit</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-bold text-slate-500">×{item.quantity}</p>
                                          <p className="text-xs font-black text-pharma-green">Rs. {parseFloat(item.total).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Status Timeline */}
                                {order.status_history && order.status_history.length > 0 && (
                                  <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                                      <Activity size={11} /> Status Timeline
                                    </h4>
                                    <div className="relative pl-5 space-y-4 border-l border-slate-100 ml-2">
                                      {order.status_history.slice(0, 5).map((hist: any, i: number) => (
                                        <div key={hist.id || i} className="relative flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[11px]">
                                          {/* Circle indicator */}
                                          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-pharma-blue flex items-center justify-center shadow-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pharma-blue" />
                                          </div>
                                          <span className="font-black text-slate-900 uppercase text-[9px] tracking-wider">{hist.new_status}</span>
                                          <span className="text-slate-400 font-bold">Updated by {hist.changed_by_name || 'System'}</span>
                                          <span className="text-slate-350 font-bold sm:ml-auto">
                                            {new Date(hist.changed_at).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Edit Notice */}
                                {editable ? (
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
                                    <div className="flex items-start gap-2.5">
                                      <Edit3 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-black text-amber-850 uppercase tracking-tight">Order Modification Window Open</p>
                                        <p className="text-[9px] font-bold text-amber-600 max-w-sm uppercase tracking-widest leading-relaxed">
                                          You have {timeLeft} remaining to adjust this protocol before it is finalized.
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => handleStartEdit(order)}
                                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-9 px-4 font-black uppercase tracking-widest text-[9px] shadow-sm w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
                                    >
                                      Modify Protocol
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                                    <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Order editing window has closed (30 min limit). Contact medical support for changes.</p>
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
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Page {page} of {totalPages} • {filtered.length} orders
              </p>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg h-8 w-8 p-0 shadow-xs cursor-pointer"><ChevronLeft size={14} /></Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page + i - 2
                  if (pg < 1 || pg > totalPages) return null
                  return (
                    <Button key={pg} variant={pg === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(pg)} className={`rounded-lg h-8 w-8 p-0 text-[11px] font-black shadow-xs cursor-pointer ${pg === page ? 'bg-pharma-blue text-white border-pharma-blue' : ''}`}>{pg}</Button>
                  )
                })}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg h-8 w-8 p-0 shadow-xs cursor-pointer"><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-xl p-8 border border-slate-100 shadow-3xl bg-white overflow-hidden">
          <DialogHeader>
            <div className="w-12 h-12 bg-pharma-blue/10 rounded-xl flex items-center justify-center mb-4 border border-pharma-blue/10">
              <Edit3 size={24} className="text-pharma-blue" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tighter mb-1">Modify Protocol</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
              Adjusting Order {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {editItems.map((item) => (
              <div key={item.id} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-pharma-blue/20 transition-all duration-300">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-900 leading-tight">{item.medicine_name}</p>
                  <p className="text-[9px] font-bold text-pharma-green uppercase tracking-widest">
                    Rs. {parseFloat(item.price).toFixed(2)} / unit
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-100 shadow-xs">
                  <button
                    onClick={() => handleUpdateItemQty(item.medicine, -1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="w-5 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateItemQty(item.medicine, 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-pharma-blue/10 hover:text-pharma-blue transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}

            {editItems.length === 0 && (
              <div className="py-10 text-center space-y-3">
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 opacity-55">
                  <ShoppingBag size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No items remaining.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">New Valuation</p>
              <p className="text-base font-black text-pharma-green">
                Rs. {editItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)}
              </p>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right max-w-[150px] leading-normal">
              Final total will be updated in your ledger.
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingOrder(null)}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] border-slate-200 cursor-pointer"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSaveOrderChanges}
              disabled={isUpdatingOrder || editItems.length === 0}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] bg-pharma-blue hover:bg-pharma-blue/90 text-white shadow-lg shadow-pharma-blue/20 cursor-pointer"
            >
              {isUpdatingOrder ? 'Transmitting...' : 'Commit Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
