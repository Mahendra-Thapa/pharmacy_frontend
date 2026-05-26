'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  ShoppingCart, 
  Users as UsersIcon, 
  CreditCard, 
  Settings as SettingsIcon, 
  QrCode, 
  Package, 
  Truck, 
  History, 
  Menu, X, Bell, Activity, ShieldAlert, ChevronRight, LogOut,
  Mail,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AdminProvider, useAdmin } from '@/lib/admin-context';
import { LogoutDialog } from '@/components/LogoutDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { aiAlerts } = useAdmin() || { aiAlerts: [] };
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const sidebarItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutGrid, href: "/admin" },
    { id: "inventory", name: "Inventory", icon: Package, href: "/admin/inventory" },
    { id: "categories", name: "Categories", icon: LayoutGrid, href: "/admin/categories" },
    { id: "orders", name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { id: "users", name: "Users", icon: UsersIcon, href: "/admin/users" },
    { id: "transactions", name: "Transactions", icon: CreditCard, href: "/admin/transactions" },
    { id: "qr-manager", name: "QR Manager", icon: QrCode, href: "/admin/qr-manager" },
    { id: "delivery", name: "Delivery", icon: Truck, href: "/admin/delivery" },
    { id: "chat-history", name: "AI Archive", icon: History, href: "/admin/chat-history" },
    { id: "settings", name: "Settings", icon: SettingsIcon, href: "/admin/settings" },
  ];

  const getBreadcrumb = () => {
     const parts = pathname.split('/').filter(Boolean);
     if (parts.length === 1 && parts[0] === 'admin') return "Dashboard";
     return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' / ');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-100 transform transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <Link href="/" className="flex items-center gap-4 mb-14 shrink-0">
            {/* <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl">
               <Activity size={24} className="text-pharma-blue" />
            </div> */}
            <div>
              {/* <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">Admin<span className="text-pharma-blue">Panel</span></h2> */}
              {/* <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Hub</p> */}
              <Image src="/logo.png" alt="Logo" width={1000} height={500} className='w-32' />
            </div>
          </Link>

          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-pharma-blue'}`}
                >
                  <item.icon size={18} className={isActive ? 'text-pharma-blue' : 'text-slate-400'} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                  {!isActive && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />}
                </Link>
              );
            })}
          </nav>

          <button onClick={() => setShowLogoutConfirm(true)} className="mt-8 flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black shrink-0">
             <LogOut size={18} />
             <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:pl-80">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[20] px-6 lg:px-12 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-100 rounded-xl">
                <Menu size={20} />
              </button>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">{getBreadcrumb()}</h1>
           </div>

           <div className="flex items-center gap-4">
              <button onClick={() => setNotificationsOpen(true)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-pharma-blue transition-all relative">
                 <Bell size={20} />
                 {aiAlerts?.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}
              </button>
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-100">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Session Active</p>
                    <p className="text-xs font-black text-slate-950">{user?.username}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-white font-black">
                    {user?.username?.[0]?.toUpperCase()}
                 </div>
              </div>
           </div>
        </header>

        <main className="p-8 lg:p-12">
           <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
           </AnimatePresence>
        </main>
      </div>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden bg-white border-none shadow-3xl text-left">
           <DialogHeader className="p-8 bg-slate-950 text-white relative">
              <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                 <Bell size={18} className="text-pharma-blue" /> Notifications
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase text-slate-400 mt-1">System Alerts & Updates</DialogDescription>
           </DialogHeader>
           
           <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {aiAlerts?.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-20">
                    <Mail size={40} className="mb-4 text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">No new notifications</p>
                 </div>
              ) : (
                <div className="space-y-3">
                  {aiAlerts.map((alert: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                       <Zap size={16} className="text-rose-500 mt-1 shrink-0" />
                       <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">{alert.message}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">{new Date().toLocaleTimeString()}</p>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
           <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <Button onClick={() => setNotificationsOpen(false)} className="rounded-xl h-12 px-8 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest">Close</Button>
           </div>
        </DialogContent>
      </Dialog>

      <LogoutDialog 
        open={showLogoutConfirm} 
        onOpenChange={setShowLogoutConfirm}
        onConfirm={() => {
          logout();
          window.location.href = '/';
        }}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
   return (
      <AdminProvider>
         <AdminLayoutInner>
            {children}
         </AdminLayoutInner>
      </AdminProvider>
   );
}
