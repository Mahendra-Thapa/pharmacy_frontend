"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Eye,
  RefreshCcw,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  Clock,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdmin } from "@/lib/admin-context";
import { axiosInstance } from "@/utils/axiosSetup";
import { toast } from "react-hot-toast";

export default function OrdersPage() {
  const { orders, loading, refresh } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Status Update States
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const filtered = orders.filter(
    (o: any) =>
      (o.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const openDelete = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!orderToUpdateStatus || (!newStatus && !newPaymentStatus)) return;
    setUpdating(true);
    try {
      await axiosInstance.patch(
        `/sales/${orderToUpdateStatus.id}/update_status/`,
        {
          status: newStatus,
          payment_status: newPaymentStatus,
          note: `Status transition by Admin`,
        },
      );
      toast.success("Order lifecycle updated successfully");
      setOrderToUpdateStatus(null);
      refresh();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/sales/${selectedOrder.id}/`);
      toast.success("Order purged from Pharmalogic records");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete order");
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusDialog = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setOrderToUpdateStatus(order);
    setNewStatus(order.status || "PENDING");
    setNewPaymentStatus(order.payment_status || "PENDING");
  };

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        Loading PharmaLogic Order List...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <Card className="rounded-xl shadow-2xl border border-slate-100 overflow-hidden bg-white">
        <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShoppingBag size={24} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                Order List
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                All POS Orders & Tracking
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search Order ID or Name..."
                className="pl-11 w-64 h-12 text-xs font-bold rounded-2xl border-white focus:ring-orange-500/20 shadow-sm"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              onClick={refresh}
              variant="ghost"
              className="h-12 w-12 p-0 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-orange-500 shadow-sm"
            >
              <RefreshCcw size={18} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/10 hover:bg-transparent border-none">
                <TableHead className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">
                  Order Designation
                </TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">
                  Client Metadata
                </TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">
                  Fiscal Valuation
                </TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">
                  Lifecycle Status
                </TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 text-right px-10">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((order: any) => (
                <React.Fragment key={order.id}>
                  <TableRow
                    onClick={() => toggleExpand(order.id)}
                    className={`group transition-all cursor-pointer ${expandedOrderId === order.id ? "bg-orange-50/30" : "hover:bg-slate-50/50"}`}
                  >
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg transition-colors ${expandedOrderId === order.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500"}`}
                        >
                          {expandedOrderId === order.id ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                        <div>
                          <span className="font-black text-slate-950 text-sm tracking-tight">
                            #{order.id.toString().padStart(5, "0")}
                          </span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 tracking-tight">
                          {order.customer_name || "Generic Client"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          ID: {order.user_email || "POS Transaction"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-black text-emerald-600">
                      Rs. {order.total_amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest transition-all ${order.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}
                      >
                        {order.status || "PROCESSED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={e => openStatusDialog(e, order)}
                          className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                        >
                          Update Status
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={e => openDelete(e, order)}
                          className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* EXPANDED DETAILS PANEL */}
                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none">
                        <TableCell colSpan={5} className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-24 py-10 grid grid-cols-12 gap-10">
                              {/* Order Context */}
                              <div className="col-span-4 space-y-6">
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={12} /> Fulfillment Data
                                  </p>
                                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Customer
                                      </p>
                                      <p className="text-sm font-black text-slate-900">
                                        {order.customer_name || "Anonymous"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Timeline
                                      </p>
                                      <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <Clock size={12} />{" "}
                                        {new Date(
                                          order.timestamp,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Fiscal Status
                                      </p>
                                      <p className="text-sm font-black text-emerald-600 flex items-center gap-2">
                                        <CreditCard size={12} />{" "}
                                        {order.status || "PROCESSED"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Itemized Inventory List */}
                              <div className="col-span-8 space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Package size={12} /> Itemized Inventory Audit
                                </p>
                                <div className="space-y-3">
                                  {order.items?.map(
                                    (item: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group/item hover:border-orange-200 transition-all"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-sm text-slate-400 group-hover/item:text-orange-500 group-hover/item:bg-orange-50 transition-all">
                                            {item.medicine_name?.[0]}
                                          </div>
                                          <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">
                                              {item.medicine_name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5">
                                              PURCHASE QTY: {item.quantity}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-black text-slate-900">
                                            Rs. {item.total}
                                          </p>
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Rate: Rs. {item.price}
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  <div className="p-6 bg-slate-900 rounded-[2rem] flex justify-between items-center mt-6">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      Aggregate Valuation
                                    </span>
                                    <span className="text-xl font-black text-white italic">
                                      Rs. {order.total_amount}
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
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="h-11 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-orange-50 hover:text-orange-500 border-none shadow-sm"
            >
              Previous
            </Button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-6 py-2 rounded-xl shadow-inner shadow-slate-200/50">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              className="h-11 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-orange-50 hover:text-orange-500 border-none shadow-sm"
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* DELETE CONFIRM DIALOG - FIXED NOMENCLATURE */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[400px] rounded-xl p-10 border-none shadow-3xl bg-white text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-100">
            <AlertTriangle size={40} className="animate-pulse" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight italic">
              Purge Order?
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2 text-center leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="text-rose-500 font-black">
                #{selectedOrder?.id}
              </span>{" "}
              from the PharmaLogic database? This action is irreducible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-10">
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200"
            >
              {submitting ? "Purging..." : "Confirm Destruction"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Abort Operation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* UPDATE STATUS DIALOG */}
      <Dialog
        open={!!orderToUpdateStatus}
        onOpenChange={open => !open && setOrderToUpdateStatus(null)}
      >
        <DialogContent className="max-w-[425px] rounded-xl p-10 border-none shadow-3xl bg-white">
          <DialogHeader className="mb-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mb-4 border border-orange-100">
              <RefreshCcw size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight italic">
              Transition Lifecycle
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-1">
              Refining status for Order{" "}
              <span className="text-orange-500 font-black">
                #{orderToUpdateStatus?.id}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Fulfillment Path
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 outline-none transition-all uppercase tracking-widest"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="READY">READY</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Financial Reconciliation
              </label>
              <select
                value={newPaymentStatus}
                onChange={e => setNewPaymentStatus(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all uppercase tracking-widest"
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <Button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              {updating ? "Synchronizing..." : "Commit Lifecycle Transition"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOrderToUpdateStatus(null)}
              className="w-full h-14 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all font-black"
            >
              Abort Transition
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
