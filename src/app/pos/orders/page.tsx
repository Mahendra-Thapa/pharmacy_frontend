"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Clock,
  ChevronLeft,
  Activity,
  Hash,
  ChevronRight,
  Edit3,
  AlertCircle,
  ShoppingBag,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import axios from "@/utils/axiosSetup";
import { LogoutDialog } from "@/components/LogoutDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PosNavbar } from "@/components/PosNavbar";

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  PENDING: {
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    label: "Pending",
  },
  CONFIRMED: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    label: "Confirmed",
  },
  PROCESSING: {
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    label: "Processing",
  },
  READY: {
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
    label: "Ready",
  },
  DISPATCHED: {
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    label: "Dispatched",
  },
  DELIVERED: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Delivered",
  },
  CANCELLED: {
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    label: "Cancelled",
  },
};

const ITEMS_PER_PAGE = 10;

export default function POSOrdersPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await axios.get(`/sales/${params}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side filter (backend also supports search param)
  const filtered = orders.filter(
    o =>
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.handled_by_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.status?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // 30-minute edit check
  const isEditable = (order: any) => {
    const diff = Date.now() - new Date(order.date_added).getTime();
    return diff < 30 * 60 * 1000;
  };

  const handleStatusUpdate = async () => {
    if (!orderToUpdateStatus || (!newStatus && !newPaymentStatus)) return;
    setUpdating(true);
    try {
      await axios.patch(`/sales/${orderToUpdateStatus.id}/update_status/`, {
        status: newStatus,
        payment_status: newPaymentStatus,
        note: `Status transition by POS agent ${user?.username}`,
      });
      showToast(
        `Order ${orderToUpdateStatus.order_number} lifecycle updated successfully`,
      );
      setOrderToUpdateStatus(null);
      setNewStatus("");
      setNewPaymentStatus("");
      fetchOrders();
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to update status",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (order: any) => {
    setOrderToUpdateStatus(order);
    setNewStatus(order.status || "PENDING");
    setNewPaymentStatus(order.payment_status || "PENDING");
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
     <PosNavbar  />
      <main className="pt-28 pb-16 px-8 max-w-7xl mx-auto">
        {/* Search & header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tighter">
              Order List
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              All POS orders & tracking
            </p>
          </div>
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pharma-green transition"
            />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by username, order#, status..."
              className="h-12 pl-11 pr-10 bg-white border border-slate-200 rounded-xl outline-none focus:border-pharma-green/50 focus:ring-4 focus:ring-pharma-green/5 transition text-sm font-medium w-72"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[3rem]  border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-16 bg-slate-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Order #
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Customer
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Total
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Date
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right px-8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest"
                    >
                      No records found in the active queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(order => {
                    const statusCfg =
                      STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
                    const isExpanded = selectedOrder?.id === order.id;

                    return (
                      <React.Fragment key={order.id}>
                        <TableRow
                          onClick={() => router.push(`/pos/orders/${order.id}`)}
                          className={`transition-all cursor-pointer ${isExpanded ? "bg-pharma-blue/5" : "hover:bg-slate-50/60"}`}
                        >
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-xl transition-all ${isExpanded ? "bg-pharma-blue text-white shadow-lg shadow-pharma-blue/20" : "bg-slate-50 text-slate-300"}`}
                              >
                                {isExpanded ? (
                                  <ChevronDown
                                    size={14}
                                    className="rotate-180 transition-transform"
                                  />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </div>
                              <span className="font-bold text-slate-950 text-sm tracking-tighter">
                                {order.order_number ||
                                  `RX-${order.id.toString().padStart(5, "0")}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div>
                              <p className="font-bold text-slate-900 text-xs tracking-tight">
                                {order.customer_name || "Walk-in Client"}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Contact: {order.customer_phone || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 font-bold text-pharma-green">
                            Rs. {order.total_amount}
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge
                              className={`text-[9px] font-bold uppercase tracking-widest border px-3 py-1 rounded-lg ${statusCfg.bg} ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6 text-[10px] font-bold text-slate-400">
                            {new Date(order.date_added).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-right">
                            <div
                              className="flex gap-2 justify-end"
                              onClick={e => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-pharma-blue shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                                onClick={() => openStatusDialog(order)}
                              >
                                Transition Lifecycle
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* SUB-ROW EXPANSION (FAQ STYLE) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <TableRow className="bg-white/50 border-none hover:bg-white/50">
                              <TableCell colSpan={6} className="p-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-24 py-12 grid grid-cols-12 gap-12 bg-slate-50/30">
                                    {/* Fulfillment Context */}
                                    <div className="col-span-4 space-y-6">
                                      <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <Activity
                                            size={12}
                                            className="text-pharma-blue"
                                          />{" "}
                                          Order Matrix
                                        </p>
                                        <div className="p-6 bg-white rounded-xl border border-slate-100  shadow-slate-200/40 space-y-5">
                                          <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                              Time Designation
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                              <Clock
                                                size={12}
                                                className="text-slate-300"
                                              />{" "}
                                              {new Date(
                                                order.date_added,
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                              POS Agent
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">
                                              {order.handled_by_name ||
                                                "System Terminal"}
                                            </span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                              Fiscal ID
                                            </span>
                                            <span className="text-xs font-bold text-pharma-blue tracking-tighter">
                                              #TXN-
                                              {order.id
                                                .toString()
                                                .padStart(6, "0")}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Itemized Audit */}
                                    <div className="col-span-8 space-y-4">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingBag
                                          size={12}
                                          className="text-pharma-green"
                                        />{" "}
                                        Itemized Fulfillment Audit
                                      </p>
                                      <div className="space-y-3">
                                        {order.items?.map((item: any) => (
                                          <div
                                            key={item.id}
                                            className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group/item hover:border-pharma-blue/20 transition-all"
                                          >
                                            <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-pharma-green text-xs border border-slate-100 group-hover/item:bg-pharma-blue/5 transition-colors">
                                                {item.quantity}×
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold text-slate-950 tracking-tight">
                                                  {item.medicine_name}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                  Rate: Rs.{" "}
                                                  {parseFloat(
                                                    item.price,
                                                  ).toFixed(2)}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm font-bold text-slate-950 tracking-tighter">
                                                Rs.{" "}
                                                {parseFloat(item.total).toFixed(
                                                  2,
                                                )}
                                              </p>
                                              <p className="text-[9px] font-bold text-pharma-green uppercase tracking-widest">
                                                Validated
                                              </p>
                                            </div>
                                          </div>
                                        ))}

                                        <div className="mt-8 p-6 bg-slate-950 rounded-xl flex justify-between items-center  shadow-slate-900/20">
                                          <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              Aggregate Valuation
                                            </span>
                                            <span className="text-[10px] font-bold text-pharma-blue/60 uppercase">
                                              Including Medical Taxes
                                            </span>
                                          </div>
                                          <span className="text-2xl font-bold text-white italic tracking-tighter">
                                            Rs.{" "}
                                            {parseFloat(
                                              order.total_amount,
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400">
                Page {page} of {totalPages} · {filtered.length} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl h-9 w-9 p-0"
                >
                  ‹
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page + i - 2;
                  if (pg < 1 || pg > totalPages) return null;
                  return (
                    <Button
                      key={pg}
                      variant={pg === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pg)}
                      className={`rounded-xl h-9 w-9 p-0 text-xs font-bold ${pg === page ? "bg-pharma-green text-white border-pharma-green" : ""}`}
                    >
                      {pg}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl h-9 w-9 p-0"
                >
                  ›
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Update Status Dialog */}
      <Dialog
        open={!!orderToUpdateStatus}
        onOpenChange={open => !open && setOrderToUpdateStatus(null)}
      >
        <DialogContent className="sm:max-w-[480px] rounded-xl p-0 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] bg-white overflow-hidden">
          {/* Dark Header */}
          <div className="p-8 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pharma-blue/20 blur-[60px] rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pharma-green/10 blur-[50px] rounded-full" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pharma-blue rounded-xl flex items-center justify-center shadow-lg shadow-pharma-blue/30">
                    <Activity size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-pharma-blue uppercase tracking-[0.3em]">POS Management</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Control</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight italic leading-tight">
                  Order Transition
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  <Hash size={10} className="text-pharma-blue" />
                  {orderToUpdateStatus?.order_number}
                </DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 inline-block px-3 py-1 rounded-lg ${(STATUS_CONFIG[orderToUpdateStatus?.status] || STATUS_CONFIG["PENDING"]).bg} ${(STATUS_CONFIG[orderToUpdateStatus?.status] || STATUS_CONFIG["PENDING"]).color}`}>
                  {orderToUpdateStatus?.status || "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6 bg-white">
            {/* Fulfillment Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-l-4 border-pharma-blue pl-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Fulfillment Status
                </Label>
              </div>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-5 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:border-pharma-blue/40 focus:bg-white transition-all uppercase tracking-wider appearance-none cursor-pointer shadow-sm"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {/* Status preview pill */}
              {newStatus && (
                <div className="flex items-center gap-2 pl-1">
                  <div className={`w-2 h-2 rounded-full ${newStatus === 'DELIVERED' ? 'bg-emerald-500' : newStatus === 'CANCELLED' ? 'bg-rose-500' : newStatus === 'CONFIRMED' ? 'bg-blue-500' : newStatus === 'PROCESSING' ? 'bg-purple-500' : newStatus === 'DISPATCHED' ? 'bg-indigo-500' : newStatus === 'READY' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{STATUS_CONFIG[newStatus]?.label} selected</span>
                </div>
              )}
            </div>

            {/* Financial State */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-l-4 border-pharma-green pl-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Financial State
                </Label>
              </div>
              <div className="relative">
                <select
                  value={newPaymentStatus}
                  onChange={e => setNewPaymentStatus(e.target.value)}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-5 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:border-pharma-green/40 focus:bg-white transition-all uppercase tracking-wider appearance-none cursor-pointer shadow-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {newPaymentStatus && (
                <div className="flex items-center gap-2 pl-1">
                  <div className={`w-2 h-2 rounded-full ${newPaymentStatus === 'COMPLETED' ? 'bg-pharma-green' : newPaymentStatus === 'FAILED' ? 'bg-rose-500' : newPaymentStatus === 'REFUNDED' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{newPaymentStatus} state applied</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <Button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full h-14 bg-slate-950 hover:bg-pharma-blue text-white rounded-xl font-bold uppercase tracking-widest  shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-[11px]"
            >
              {updating ? (
                <><Activity size={16} className="animate-spin" /> Synchronizing...</>
              ) : (
                <><Activity size={16} /> Commit Transition</>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOrderToUpdateStatus(null)}
              className="w-full h-11 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel Operation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl  font-bold uppercase tracking-widest text-xs z-[200] ${toast.type === "error" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation */}
      <LogoutDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={() => {
          logout?.();
          setShowLogoutConfirm(false);
        }}
      />
    </div>
  );
}
