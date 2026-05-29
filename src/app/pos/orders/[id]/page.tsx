"use client"

import { PosNavbar } from "@/components/PosNavbar"
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"

import { Card, CardContent } from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAdmin } from "@/lib/admin-context"
import { useAuth } from "@/lib/auth-context"
import axiosInstance from "@/utils/axiosSetup"

import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  PackageCheck,
  Receipt,
  User2,
  Loader2,
  Clock3,
} from "lucide-react"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminOrderDetail() {
  const router = useRouter()
  const { id } = useParams()
   const { user, logout } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [newPaymentStatus, setNewPaymentStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  const STATUS_CONFIG: Record<
    string,
    {
      color: string
      bg: string
      label: string
      dot: string
    }
  > = {
    PENDING: {
      color: "text-amber-700",
      bg: "bg-amber-50 border border-amber-200",
      label: "Pending",
      dot: "bg-amber-500",
    },
    CONFIRMED: {
      color: "text-blue-700",
      bg: "bg-blue-50 border border-blue-200",
      label: "Confirmed",
      dot: "bg-blue-500",
    },
    PROCESSING: {
      color: "text-purple-700",
      bg: "bg-purple-50 border border-purple-200",
      label: "Processing",
      dot: "bg-purple-500",
    },
    READY: {
      color: "text-teal-700",
      bg: "bg-teal-50 border border-teal-200",
      label: "Ready",
      dot: "bg-teal-500",
    },
    DISPATCHED: {
      color: "text-indigo-700",
      bg: "bg-indigo-50 border border-indigo-200",
      label: "Dispatched",
      dot: "bg-indigo-500",
    },
    DELIVERED: {
      color: "text-emerald-700",
      bg: "bg-emerald-50 border border-emerald-200",
      label: "Delivered",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      color: "text-rose-700",
      bg: "bg-rose-50 border border-rose-200",
      label: "Cancelled",
      dot: "bg-rose-500",
    },
  }
const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "bg-amber-100", color: "text-amber-700" },
  COMPLETED: { bg: "bg-emerald-100", color: "text-emerald-700" },
  FAILED: { bg: "bg-rose-100", color: "text-rose-700" },
  REFUNDED: { bg: "bg-slate-100", color: "text-slate-700" },
};
  const fetchOrder = async () => {
    setLoading(true)

    try {
      const res = await axiosInstance.get(`/sales/${id}/`)
      setOrder(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Unable to load order")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const openStatusDialog = () => {
    setNewStatus(order.status || "PENDING")
    setNewPaymentStatus(order.payment?.status || "PENDING")
    setStatusDialogOpen(true)
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)

    try {
      await axiosInstance.patch(`/sales/${order.id}/update_status/`, {
        status: newStatus,
        payment_status: newPaymentStatus,
      })

      toast.success("Order updated successfully")
      setStatusDialogOpen(false)
      fetchOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update order")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <PosNavbar />
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
          <p className="text-sm text-slate-600 font-medium">
            Loading order details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen   ">
      <PosNavbar />
      <div className="max-w-7xl mx-auto py-28 px-4">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">

          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all mb-4"
            >
              <ArrowLeft size={17} />
              <span className="text-sm font-medium">
                Back to Orders
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-md md:text-xl font-bold text-slate-900">
                Order #{order.id}
              </h1>

              <Badge
                className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${STATUS_CONFIG[order.status]?.dot}`}
                />
                {STATUS_CONFIG[order.status]?.label || order.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
              <CalendarDays size={15} />
              {new Date(order.timestamp).toLocaleString()}
            </div>
          </div>

          <Button
            onClick={openStatusDialog}
            className="h-11 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
          >
            Update Status
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Side */}
          <div className="xl:col-span-2 space-y-6">

            {/* Order Items */}
            <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">

                <div className="p-6 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="text-slate-700" size={20} />
                    <h2 className="text-md font-semibold text-slate-900">
                      Ordered Medicines
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 hover:bg-slate-100">
                        <TableHead>Medicine</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-right">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {order.items?.map((item: any, idx: number) => (
                        <TableRow
                          key={idx}
                          className="hover:bg-slate-50 transition-all"
                        >
                          <TableCell className="font-medium text-slate-800 whitespace-nowrap">
                            {item.medicine_name}
                          </TableCell>

                          <TableCell>
                            {item.quantity}
                          </TableCell>

                          <TableCell className="text-right whitespace-nowrap">
                            Rs. {item.price}
                          </TableCell>

                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            Rs. {item.total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>


             {/* Order Summary */}
            <Card className="rounded-xl border-0 shadow-sm bg-slate-900 text-white overflow-hidden">
              <CardContent className="p-6">

                <div className="flex items-center gap-3 mb-6">
                  {/* <Receipt size={20} /> */}
                  <h2 className="text-md font-semibold">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      Rs.{" "}
                      {order.total_amount - order.delivery_charge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      Delivery Charge
                    </span>

                    <span className="font-medium">
                      Rs. {order.delivery_charge}
                    </span>
                  </div>

                  <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                    <span className="font-semibold text-md">
                      Total Amount
                    </span>

                    <span className="text-md font-bold whitespace-nowrap">
                      Rs. {order.total_amount }
                    </span>
                  </div>

                </div>
              </CardContent>
            </Card>
            {/* Status History */}
            <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">

                <div className="p-6 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <Clock3 className="text-slate-700" size={20} />
                    <h2 className="text-md font-semibold text-slate-900">
                      Status History
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 hover:bg-slate-100">
                        <TableHead>Changed At</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">
                          Changed By
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {order.status_history?.length > 0 ? (
                        order.status_history.map((h: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(h.changed_at).toLocaleString()}
                            </TableCell>

                            <TableCell>
                              {h.old_status || "-"}
                            </TableCell>

                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                                {h.new_status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right whitespace-nowrap">
                              {h.changed_by_name} ({h.changed_by_role})
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-10 text-slate-500"
                          >
                            No status history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Right Side */}
          <div className="space-y-6">

            {/* Customer + Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">

              {/* Customer Info */}
              <Card className="rounded-xl border-0 shadow-sm h-full">
                <CardContent className="p-6">

                  <div className="flex items-center gap-3 mb-5">
                    <User2 className="text-slate-700" size={20} />
                    <h2 className="text-md font-semibold text-slate-900">
                      Customer Info
                    </h2>
                  </div>

                  <div className="space-y-5">

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Customer Name
                      </p>

                      <p className="font-semibold text-slate-900">
                        {order.customer_name || "Guest"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Email Address
                      </p>

                      <p className="text-slate-900 text-sm break-all">
                        {order.customer_email || "N/A"}
                      </p>
                    </div>

                     <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        phone number
                      </p>

                      <p className="text-slate-900 text-sm break-all">
                        {order.customer_phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Address
                      </p>
                      <p className="text-slate-900 text-sm break-all">
                        {order.customer_address || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Delivery Option
                      </p>

                      <p className="text-slate-700">
                        {order.delivery_option === 1
                          ? "Standard Delivery"
                          : "Express Delivery"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Distance
                      </p>

                      <p className="text-slate-700">
                        {order.distance_km} km
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="rounded-xl border-0 shadow-sm h-full">
                <CardContent className="p-6">

                  <div className="flex items-center gap-3 mb-5">
                    <CreditCard className="text-slate-700" size={20} />
                    <h2 className="text-md font-semibold text-slate-900">
                      Payment Details
                    </h2>
                  </div>

                  <div className="space-y-5">

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Payment Method
                      </p>

                      <p className="font-medium text-slate-800">
                        {order.payment?.method || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                        Payment Status
                      </p>

                      <Badge className={`${PAYMENT_STATUS_CONFIG[order.payment?.status || ""]?.bg || "bg-slate-100"} ${PAYMENT_STATUS_CONFIG[order.payment?.status || ""]?.color || "text-slate-700"} border border-slate-200`}>
  {order.payment?.status || "N/A"}
</Badge>
                    </div>

                    {order.payment?.qr_payment_url && (
                      <a
                        href={order.payment.qr_payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 hover:underl9ne text-sm break-all"
                      >
                        View QR Payment Link
                      </a>
                    )}

                    {order.payment?.payment_screenshot && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-3">
                          Payment Screenshot
                        </p>

                        <img
                          src={order.payment.payment_screenshot}
                          alt="Payment screenshot"
                          className="rounded-xl border w-full object-cover max-h-[300px]"
                        />
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            </div>

           
          </div>
        </div>
      </div>

      {/* Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] rounded-xl border-0 p-0 overflow-hidden">

          <div className="bg-slate-900 text-white px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Update Order #{order?.id}
              </DialogTitle>

              <DialogDescription className="text-slate-300">
                Change order and payment status
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Order Status
              </label>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-slate-900"
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status
              </label>

              <select
                value={newPaymentStatus}
                onChange={(e) =>
                  setNewPaymentStatus(e.target.value)
                }
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => setStatusDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
                onClick={handleStatusUpdate}
                disabled={updating}
              >
                {updating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Updating...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}