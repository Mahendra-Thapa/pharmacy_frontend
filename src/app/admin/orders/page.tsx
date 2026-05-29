"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const filtered = orders.filter(
    (o: any) =>
      (o.order_number || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (o.customer_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const openDelete = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  };

  const openStatusDialog = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setOrderToUpdateStatus(order);
    setNewStatus(order.status || "PENDING");
    setNewPaymentStatus(order.payment_status || "PENDING");
  };

  const handleDelete = async () => {
    setSubmitting(true);

    try {
      await axiosInstance.delete(`/sales/${selectedOrder.id}/`);

      toast.success("Order deleted");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!orderToUpdateStatus) return;

    setUpdating(true);

    try {
      await axiosInstance.patch(
        `/sales/${orderToUpdateStatus.id}/update_status/`,
        {
          status: newStatus,
          payment_status: newPaymentStatus,
        }
      );

      toast.success("Order updated");
      setOrderToUpdateStatus(null);
      refresh();
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500">
        Loading orders...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
              <ShoppingBag size={20} className="text-orange-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Orders
              </h2>
              <p className="text-sm text-slate-500">
                Manage customer orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-[260px] h-11 rounded-xl"
              />
            </div>

            <Button
              variant="outline"
              onClick={refresh}
              className="h-11 rounded-xl"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((order: any) => (
                <React.Fragment key={order.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          {expandedOrderId === order.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            #{order.id}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(
                              order.timestamp
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">
                          {order.customer_name || "Guest"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.user_email || "POS Order"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      Rs. {order.total_amount}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                        }
                      >
                        {order.status || "PENDING"}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={(e) =>
                            openStatusDialog(e, order)
                          }
                        >
                          Update
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={(e) => openDelete(e, order)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="bg-slate-50 px-6 py-5"
                        >
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4">
                              {order.items?.map(
                                (item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white border rounded-xl p-4"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {item.medicine_name}
                                      </p>

                                      <p className="text-sm text-slate-500">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="font-medium text-slate-900">
                                        Rs. {item.total}
                                      </p>

                                      <p className="text-sm text-slate-500">
                                        Rs. {item.price} each
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}

                              <div className="flex justify-between items-center pt-4 border-t">
                                <span className="font-medium text-slate-700">
                                  Total
                                </span>

                                <span className="text-lg font-semibold text-slate-900">
                                  Rs. {order.total_amount}
                                </span>
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
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="text-rose-500" size={28} />
            </div>
          </div>

          <DialogHeader className="text-center">
            <DialogTitle>Delete Order?</DialogTitle>

            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog
        open={!!orderToUpdateStatus}
        onOpenChange={(open) =>
          !open && setOrderToUpdateStatus(null)
        }
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>

            <DialogDescription>
              Change order and payment status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Order Status
              </label>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY">Ready</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Payment Status
              </label>

              <select
                value={newPaymentStatus}
                onChange={(e) =>
                  setNewPaymentStatus(e.target.value)
                }
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setOrderToUpdateStatus(null)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 rounded-xl"
              >
                {updating ? "Updating..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}