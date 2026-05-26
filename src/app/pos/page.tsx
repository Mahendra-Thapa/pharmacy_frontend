"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  UserCircle, 
  QrCode, 
  Banknote, 
  CheckCircle, 
  ChevronLeft, 
  AlertTriangle, 
  Activity, 
  ShoppingBag, 
  LockIcon, 
  TrendingUp, 
  ChevronRightCircle,
  Settings,
  LogOut
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import axios from "@/utils/axiosSetup";
import { LogoutDialog } from "@/components/LogoutDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function POSPage() {
  const { user, login, logout } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<{ med: any; qty: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "QR">("CASH");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Login State for restricted POS terminal
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Financial Logs State
  const [showLogs, setShowLogs] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [agentPass, setAgentPass] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [updatingAgentPass, setUpdatingAgentPass] = useState(false);

  const totalAmount = cart.reduce(
    (acc, item) => acc + parseFloat(item.med.price) * item.qty,
    0,
  );

  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchCustQuery, setSearchCustQuery] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [pharmacySettings, setPharmacySettings] = useState<any>(null);

  const fetchPharmacySettings = async () => {
    try {
      const res = await axios.get("/pharmacy-settings/");
      const data = Array.isArray(res.data) ? res.data : [res.data];
      if (data.length > 0) setPharmacySettings(data[0]);
    } catch (err) {
      console.error("Failed to fetch pharmacy settings");
    }
  };

  useEffect(() => {
    if (user && (user.role === "POS" || user.role === "ADMIN")) {
      fetchInventory();
      fetchCustomers();
      fetchPharmacySettings();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers/");
      setAllCustomers(res.data);
    } catch (error) {
      console.error("Failed to load customers");
    }
  };

  // When payment mode changes, generate QR immediately & re-fetch latest settings
  useEffect(() => {
    if (paymentMode === "QR" && totalAmount > 0) {
      generateDynamicQR();
    }
    if (paymentMode === "QR") {
      fetchPharmacySettings();
    }
  }, [paymentMode]);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("/medicines/");
      setInventory(res.data);
    } catch (error) {
      console.error("Failed to load inventory");
    }
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTransactions = async (openModal: boolean = true) => {
    try {
      const res = await axios
        .get("/payment-transactions/")
        .catch(() => axios.get("/transactions/"));
      setTransactions(res.data);
      if (openModal) {
        setShowLogs(true);
      }
    } catch (error) {
      showToast("Failed to fetch financial logs", "error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err: any) {
      setLoginError("Invalid POS Access");
    }
  };

  const handleRegisterCustomer = async () => {
    if (!customerName || !customerPhone)
      return showToast("Name and Phone required", "error");
    try {
      const res = await axios.post("/customers/", {
        name: customerName,
        phone: customerPhone,
      });
      setAllCustomers([...allCustomers, res.data]);
      setSelectedCustomer(res.data);
      setIsCreatingCustomer(false);
      showToast("Customer Registered", "success");
    } catch (err) {
      showToast("Registration failed", "error");
    }
  };

  const handleAgentPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentPass.current.trim())
      return showToast("Current password is required!", "error");
    if (agentPass.new.length < 6)
      return showToast("New password must be at least 6 characters!", "error");
    if (agentPass.new !== agentPass.confirm)
      return showToast("Passwords do not match!", "error");
    setUpdatingAgentPass(true);
    try {
      await axios.patch("/users/me/", {
        current_password: agentPass.current,
        password: agentPass.new,
      });
      showToast("Password updated successfully", "success");
      setShowSettings(false);
      setAgentPass({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Password update failed",
        "error",
      );
    } finally {
      setUpdatingAgentPass(false);
    }
  };

  const generateDynamicQR = () => {
    setQrLoading(true);
    // Simulate fetch delay to get merchant QR
    setTimeout(() => {
      const newTotal = cart.reduce(
        (acc, item) => acc + parseFloat(item.med.price) * item.qty,
        0,
      );
      setQrData(
        `https://merchant.esewa.com.np/qr?merchant=PHARMA_GATEWAY&amount=${newTotal.toFixed(2)}&tx=${Date.now()}`,
      );
      setQrLoading(false);
    }, 600);
  };

  if (!user || (user.role !== "POS" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pharma-green/20 via-slate-950 to-slate-950"></div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[40px] shadow-2xl w-full max-w-md relative z-10"
        >
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-pharma-green text-white rounded-2xl shadow-2xl shadow-pharma-green/20 mb-6">
              <QrCode size={40} className="stroke-[2.5px]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
              POS Terminal
            </h1>
            <p className="text-pharma-blue/60 text-xs font-bold uppercase tracking-widest px-8">
              Agent Authentication Required
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl text-center border border-rose-500/20">
                {loginError}
              </p>
            )}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Agent ID"
                value={credentials.username}
                onChange={e =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:ring-2 focus:ring-pharma-blue/50 outline-none transition-all placeholder:text-slate-600 font-bold text-sm"
              />
              <div className="relative group">
                <PasswordInput
                  placeholder="Passcode"
                  value={credentials.password}
                  onChange={e =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                  className="w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-14 bg-pharma-green hover:bg-pharma-green/90 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-500 shadow-2xl shadow-pharma-green/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Unlock Terminal <Activity size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const addToCart = (medicine: any) => {
    if (medicine.stock <= 0)
      return showToast(`${medicine.name} is out of stock!`, "error");
    setCart(prev => {
      const existing = prev.find(item => item.med.id === medicine.id);
      if (existing) {
        if (existing.qty >= medicine.stock) {
          showToast(`Only ${medicine.stock} units available!`, "error");
          return prev;
        }
        return prev.map(item =>
          item.med.id === medicine.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { med: medicine, qty: 1 }];
    });

    // Dynamic QR Generation effect on total amount change simulation
    if (paymentMode === "QR") {
      generateDynamicQR();
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.med.id !== id));
    if (paymentMode === "QR") {
      generateDynamicQR();
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return showToast("Cart is empty!", "error");

    setLoading(true);
    const payload = {
      customer_id: selectedCustomer?.id || null,
      items: cart.map(c => ({ medicine_id: c.med.id, quantity: c.qty })),
      payment_method: paymentMode,
    };

    try {
      const res = await axios.post("/sales/", payload);
      setReceiptData(res.data);
      setShowReceipt(true);
      showToast("Checkout successful! Receipts generated.", "success");
      // Refresh inventory dynamically locally
      fetchInventory();
      fetchTransactions(false);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to complete transaction",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = inventory.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredCustomers = allCustomers.filter(
    c =>
      c.name?.toLowerCase().includes(searchCustQuery.toLowerCase()) ||
      c.phone?.includes(searchCustQuery),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-pharma-blue/10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-pharma-green transition shadow-lg active:scale-90"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition duration-500 overflow-hidden shrink-0 border border-slate-100">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Pharma<span className="text-pharma-blue">POS</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Medical Terminal Alpha
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/pos/orders"
            className="bg-slate-100 hover:bg-pharma-green hover:text-white text-slate-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center gap-2"
          >
            <ShoppingBag size={16} /> Orders
          </Link>
          <button
            onClick={() => fetchTransactions(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center gap-2"
          >
            <Activity size={16} /> Logs
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-2"></div>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 w-10 h-10 rounded-xl transition flex items-center justify-center"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white w-10 h-10 rounded-xl transition flex items-center justify-center shadow-lg shadow-rose-500/10"
          >
             <LogOut size={18} />
          </button>
          
          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-black text-slate-900">
              {user.first_name} {user.last_name || "Agent"}
            </span>
            <span className="text-[9px] font-bold text-pharma-blue uppercase tracking-widest bg-pharma-blue/5 px-2 py-0.5 rounded-full border border-pharma-blue/20">
              Role: {user.role}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pharma-green transition cursor-pointer">
            <UserCircle size={22} />
          </div>
        </div>

        {/* Agent Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={(o) => { setShowSettings(o); if (!o) setAgentPass({ current: "", new: "", confirm: "" }); }}>
          <DialogContent className="sm:max-w-md rounded-xl p-0 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden bg-white">
            {/* Header */}
            <div className="p-8 bg-slate-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-green/10 blur-3xl rounded-full" />
              <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white relative z-10">
                Update Password
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">
                POS Terminal · Security Settings
              </p>
            </div>
            <form
              onSubmit={handleAgentPasswordUpdate}
              className="p-8 space-y-5"
            >
              {/* Current Password */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Current Password
                </Label>
                <PasswordInput
                  value={agentPass.current}
                  onChange={e =>
                    setAgentPass({ ...agentPass, current: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  required
                />
              </div>
              <div className="h-px bg-slate-100" />
              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  New Password
                </Label>
                <PasswordInput
                  value={agentPass.new}
                  onChange={e =>
                    setAgentPass({ ...agentPass, new: e.target.value })
                  }
                  placeholder="Enter new password (min. 6 chars)"
                  className="h-12 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className={`text-[10px] font-black uppercase tracking-widest ${
                  agentPass.confirm && agentPass.new !== agentPass.confirm
                    ? "text-rose-500"
                    : "text-slate-400"
                }`}>
                  Confirm Password
                </Label>
                <PasswordInput
                  value={agentPass.confirm}
                  onChange={e =>
                    setAgentPass({ ...agentPass, confirm: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className={`h-12 rounded-2xl font-bold ${
                    agentPass.confirm && agentPass.new !== agentPass.confirm
                      ? "border-rose-300 bg-rose-50"
                      : "bg-slate-50 border-slate-100"
                  }`}
                  required
                />
                {agentPass.confirm && agentPass.new !== agentPass.confirm && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Passwords do not match</p>
                )}
                {agentPass.confirm && agentPass.new === agentPass.confirm && agentPass.new && (
                  <p className="text-[10px] font-black text-pharma-green uppercase tracking-widest">✓ Passwords match</p>
                )}
              </div>
              <Button
                disabled={updatingAgentPass}
                type="submit"
                className="w-full h-14 bg-pharma-green text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-pharma-green/20 mt-2 transition active:scale-95"
              >
                {updatingAgentPass ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <main className="mt-20 flex-grow flex flex-col lg:flex-row p-4 lg:p-8 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden h-auto lg:h-[calc(100vh-80px)]">
        {/* Left Panel: Inventory & Search */}
        <section className="flex-[3] flex flex-col gap-6 lg:gap-8 overflow-visible lg:overflow-hidden">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pharma-green transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search inventory or scan barcode..."
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-pharma-blue/20 focus:ring-4 focus:ring-pharma-blue/5 transition shadow-sm text-sm font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pharma-green animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Database: {inventory.length} SKUs
              </span>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto pr-4 scrollbar-hide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max pb-8">
            {filteredMedicines.map(med => (
              <motion.div
                key={med.id}
                whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(22, 163, 74, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(med)}
                className={`p-0 rounded-[2.5rem] border bg-white shadow-xl hover:shadow-2xl hover:border-pharma-green/40 transition-all duration-500 group flex flex-col h-[320px] relative overflow-hidden ${med.stock <= 0 ? "opacity-50 grayscale" : "border-slate-100"}`}
              >
                {/* Image Section */}
                <div className="h-40 relative bg-slate-50 overflow-hidden border-b border-slate-100">
                  {med.image_url ? (
                    <Image src={med.image_url} alt={med.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                       <Activity size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest">No Visual</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-sm ${med.stock <= 0 ? "text-white bg-rose-500/80" : "text-white bg-slate-950/80"}`}
                    >
                      {med.stock <= 0 ? "Out of Stock" : `${med.stock} In Shelf`}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/90 text-pharma-blue border border-slate-100 shadow-sm">
                      {med.category_name || "Pharma"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
                  <div className="absolute top-0 right-0 p-8 bg-pharma-green/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                  
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-pharma-green transition tracking-tight text-lg leading-tight mb-2">
                      {med.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 line-clamp-2 uppercase tracking-widest">
                       {med.manufacturer}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Retail Price</span>
                       <span className="text-2xl font-black text-slate-950 tracking-tighter">
                         <span className="text-pharma-green text-sm mr-1">Rs.</span>
                         {parseFloat(med.price).toFixed(2)}
                       </span>
                    </div>
                    {med.stock > 0 && (
                      <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center group-hover:bg-pharma-green transition-all shadow-xl shadow-slate-900/10 group-active:scale-90">
                        <Plus size={22} className="stroke-[3px]" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right Panel: Cart & Checkout */}
        <section className="flex-[1.2] flex flex-col gap-6 h-full lg:h-full relative min-h-[500px]  ">
          <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[40px] shadow-2xl flex flex-col h-full overflow-hidden relative overflow-y-scroll sidebar-thin">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-black text-slate-950 text-2xl tracking-tighter">
                  Current Register
                </h2>
                <p className="text-[10px] font-bold text-pharma-blue uppercase tracking-widest">
                  Active Transaction
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-pharma-green">
                <ShoppingBag size={20} />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-50/30 min-h-[300px] ">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                      <QrCode size={40} className="text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">
                      Terminal Ready
                    </h4>
                    <p className="text-xs text-slate-400 px-8 leading-relaxed font-medium">
                      Select medications from the inventory to begin checkout
                      flow.
                    </p>
                  </motion.div>
                )}
                {cart.map(item => (
                  <motion.div
                    key={item.med.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-pharma-blue/40 transition duration-300 shadow-sm"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden relative shrink-0">
                      {item.med.image_url ? (
                        <Image src={item.med.image_url} alt={item.med.name} fill className="object-cover" />
                      ) : (
                        <span className="text-pharma-green font-black text-xs">{item.qty}x</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-sm truncate leading-none mb-1">
                        {item.med.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Rs.{parseFloat(item.med.price).toFixed(2)} / unit
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-black text-slate-900 text-sm leading-none">
                        Rs.{(parseFloat(item.med.price) * item.qty).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.med.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Customer Manifest
                  </span>
                </div>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-pharma-blue/5 border border-pharma-blue/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pharma-blue text-white rounded-xl flex items-center justify-center font-black">
                        {selectedCustomer.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">
                          {selectedCustomer.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-[10px] font-black text-rose-500 uppercase"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchCustQuery}
                        onChange={e => setSearchCustQuery(e.target.value)}
                        className="w-full text-sm pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-pharma-blue/20 transition font-medium"
                      />
                      <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <button
                        onClick={() => setIsCreatingCustomer(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-pharma-green transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {searchCustQuery && filteredCustomers.length > 0 && (
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-50 max-h-48 overflow-y-auto">
                        {filteredCustomers.map(cust => (
                          <button
                            key={cust.id}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setSearchCustQuery("");
                            }}
                            className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">
                                {cust.name}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {cust.phone}
                              </span>
                            </div>
                            <ChevronRightCircle
                              size={14}
                              className="text-slate-200"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Customer Dialog */}
              <Dialog
                open={isCreatingCustomer}
                onOpenChange={setIsCreatingCustomer}
              >
                <DialogContent className="rounded-[2.5rem] border-transparent shadow-2xl bg-white p-8 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                      Register Agent
                    </DialogTitle>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      New Customer Onboarding
                    </p>
                  </DialogHeader>
                  <div className="space-y-4 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Full Identity
                      </Label>
                      <input
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-pharma-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Contact String
                      </Label>
                      <input
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-pharma-blue/20"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleRegisterCustomer}
                    className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    Commit Profile
                  </Button>
                </DialogContent>
              </Dialog>

              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 pb-6">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Net Total
                </span>
                <span className="text-2xl font-black text-pharma-green tracking-tighter">
                  <span className="text-pharma-green/70 text-lg mr-1 serif">
                    Rs.
                  </span>
                  {totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMode("CASH")}
                  className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === "CASH" ? "bg-slate-950 text-white shadow-xl shadow-slate-900/20 border-slate-950 scale-100" : "bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200 scale-[0.98]"}`}
                >
                  <Banknote
                    size={20}
                    className={
                      paymentMode === "CASH" ? "text-white" : "text-slate-300"
                    }
                  />
                   Cash
                </button>
                <button
                  onClick={() => setPaymentMode("QR")}
                  className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === "QR" ? "bg-pharma-green text-white shadow-xl shadow-pharma-green/30 border-pharma-green scale-100" : "bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200 scale-[0.98]"}`}
                >
                  <QrCode
                    size={20}
                    className={
                      paymentMode === "QR" ? "text-white" : "text-slate-300"
                    }
                  />
                  Digital Scan
                </button>
              </div>

              <AnimatePresence>
                {paymentMode === "QR" && totalAmount > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-950 text-white p-6 rounded-[32px] flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-green/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="bg-white p-3 rounded-2xl shadow-2xl relative z-10 w-44 h-44 flex items-center justify-center">
                        {pharmacySettings?.qr_code_url ? (
                           <Image src={pharmacySettings.qr_code_url} alt="Payment QR" fill className="object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <QrCode className="text-slate-200 mb-2" size={48} />
                            <span className="text-slate-400 font-bold text-[8px] uppercase tracking-widest text-center">Admin QR Not Set<br/>Using Multi-Gateway</span>
                          </div>
                        )}
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] text-pharma-green font-black uppercase tracking-[0.2em] mb-1">
                          Scan to Pay Rs.{totalAmount.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-4 h-4 relative">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Digital Terminal
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="group relative w-full h-16 bg-pharma-green hover:bg-pharma-green/90 text-white font-black uppercase tracking-[0.15em] rounded-[2rem] transition-all duration-500 shadow-2xl shadow-pharma-green/30 active:scale-[0.98] overflow-hidden flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%] bg-left group-hover:block hidden motion-safe:animate-[shimmer_2s_infinite]"></div>
                {loading ? (
                  <Activity className="animate-spin" size={22} />
                ) : (
                  <CheckCircle
                    size={22}
                    className="relative z-10 stroke-[2.5px]"
                  />
                )}
                <span className="relative z-10 text-[10px]">
                  {loading ? "Processing..." : "Authorize Transaction"}
                </span>
              </button>
            </div>
          </div>

          {/* Receipt Modal Overlay */}
          <AnimatePresence>
            {showReceipt && receiptData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]"
                >
                  <div className="p-10 overflow-y-auto print:p-0 print:text-black text-slate-800 flex-1 hide-scrollbar">
                    <div className="text-center mb-10">
                      <div className="w-24 h-16 relative mx-auto mb-4">
                        <Image src="/logo.png" alt="Pharmacy Logo" fill className="object-contain" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        POS Terminal Receipt
                      </p>
                      <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="h-px border-t border-dashed border-slate-200 flex-1"></div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          {receiptData.order_number || `TX-${receiptData.id}`}
                        </p>
                        <div className="h-px border-t border-dashed border-slate-200 flex-1"></div>
                      </div>
                    </div>

                    <div className="mb-8 p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-4 font-medium relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                        <Activity size={100} />
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3 relative z-10">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">
                          Patient
                        </span>
                        <span className="text-slate-950 font-black">
                          {customerName || "Walk-in"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3 relative z-10">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">
                          Handler
                        </span>
                        <span className="text-slate-950 font-black">
                          {receiptData.handled_by_name || "Automated Terminal"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-1 relative z-10">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">
                          Status / Modality
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-pharma-green font-black tracking-widest bg-pharma-blue/5 px-2 py-0.5 rounded-lg text-[10px]">
                            VERIFIED
                          </span>
                          <span className="text-slate-950 font-black tracking-widest bg-slate-200 px-2 py-0.5 rounded-lg text-[10px]">
                            {paymentMode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-xs mb-8">
                      <thead>
                        <tr className="text-left text-slate-400">
                          <th className="pb-4 font-black uppercase tracking-widest text-[9px] w-[50%]">
                            Dispensation
                          </th>
                          <th className="pb-4 text-center font-black uppercase tracking-widest text-[9px]">
                            Vol
                          </th>
                          <th className="pb-4 text-right font-black uppercase tracking-widest text-[9px]">
                            Sum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="space-y-4">
                        {receiptData.items?.map((item: any) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                          >
                            <td className="py-4 pr-2 text-slate-950 font-black tracking-tight leading-tight">
                              {item.medicine_name}
                            </td>
                            <td className="py-4 text-center font-black text-slate-400">
                              {item.quantity}
                            </td>
                            <td className="py-4 text-right font-black text-slate-950 text-sm">
                              {(parseFloat(item.price) * item.quantity).toFixed(
                                1,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="pt-6 border-t border-slate-950">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[12px] font-black text-slate-950 uppercase tracking-[0.2em] block">
                          Grand Total
                        </span>
                        <span className="text-4xl font-black text-pharma-green tracking-tighter">
                          Rs.{parseFloat(receiptData.total_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-950 text-white rounded-2xl flex items-center justify-center gap-3">
                        <CheckCircle className="text-pharma-green" size={20} />
                        <span className="font-black text-xs uppercase tracking-widest text-pharma-green">
                          Financial Log Committed
                        </span>
                      </div>
                    </div>

                    <div className="mt-10 mb-4 text-center print:mt-16">
                      <div className="inline-block p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm mx-auto">
                        <QRCodeSVG
                          value={`VAL-${receiptData.payment?.transaction_id || receiptData.id}`}
                          size={64}
                          fgColor="#0f172a"
                        />
                      </div>
                      <p className="mt-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        Cryptographic Proof of Sequence
                      </p>
                      <p className="mt-1 text-[9px] font-black text-slate-300 tracking-widest">
                        {receiptData.payment?.transaction_id ||
                          `0x${Math.random().toString(16).slice(2, 10)}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t flex gap-4 print:hidden shrink-0">
                    <button
                      onClick={() => window.print()}
                      className="group h-16 w-16 bg-white border border-slate-200 text-slate-900 rounded-[20px] flex items-center justify-center hover:bg-slate-950 hover:text-white transition shadow-sm active:scale-90"
                    >
                      <Printer size={22} />
                    </button>
                    <button
                      onClick={() => {
                        setCart([]);
                        setCustomerName("");
                        setCustomerPhone("");
                        setPaymentMode("CASH");
                        setShowReceipt(false);
                        setReceiptData(null);
                      }}
                      className="flex-1 h-16 bg-pharma-green hover:bg-pharma-green/90 text-white font-black uppercase tracking-[0.15em] rounded-[20px] flex justify-center items-center gap-3 transition-all shadow-xl shadow-pharma-green/20 active:scale-95"
                    >
                      <ShoppingBag size={20} />
                      Start New Cycle
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Financial Logs Modal */}
          <Dialog open={showLogs} onOpenChange={setShowLogs}>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 border-transparent shadow-2xl bg-white overflow-hidden max-h-[80vh] flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                    Terminal Logs
                  </DialogTitle>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Immutable View-only Ledger
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-sm">
                  <Activity size={20} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">
                        ID
                      </TableHead>
                      <TableHead className="py-5 text-[9px] font-black uppercase tracking-widest">
                        Amount
                      </TableHead>
                      <TableHead className="py-5 text-[9px] font-black uppercase tracking-widest">
                        Method
                      </TableHead>
                      <TableHead className="py-5 text-[9px] font-black uppercase tracking-widest">
                        Status
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-right">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(tx => (
                      <TableRow key={tx.id} className="hover:bg-slate-50">
                        <TableCell className="px-8 py-4 font-black text-xs text-slate-900">
                          {tx.transaction_id || `TRX-${tx.id}`}
                        </TableCell>
                        <TableCell className="py-4 font-bold text-xs">
                          Rs. {tx.amount}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="text-[8px] font-black leading-none uppercase"
                          >
                            {tx.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={
                              tx.status === "COMPLETED"
                                ? "bg-pharma-green/10 text-pharma-green"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right text-[10px] font-bold text-slate-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] font-black uppercase tracking-[0.1em] text-[11px] flex items-center gap-4 z-[200] backdrop-blur-xl border border-white/20 ${toastType === "error" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${toastType === "error" ? "bg-white/20" : "bg-pharma-green"}`}
                >
                  {toastType === "error" ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                </div>
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
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
