'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ShoppingCart, Users, CreditCard, Check, Activity, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAdmin } from '@/lib/admin-context';
import Link from 'next/link';

export default function AdminDashboard() {
  const { inventory, orders, users, transactions, loading } = useAdmin();

  const totalRevenue = orders.reduce((acc: number, curr: any) => acc + (parseFloat(curr.total_amount) || 0), 0);
  const lowStockCount = inventory.filter((m: any) => m.stock < (m.reorder_level || 10)).length;

  const salesData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4500 },
    { name: 'May', amount: 6000 },
    { name: 'Jun', amount: 5500 },
    { name: 'Today', amount: totalRevenue },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Activity className="animate-spin text-pharma-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem title="Daily Income" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="emerald" />
        <KPIItem title="Low Stock" value={lowStockCount} icon={AlertTriangle} color="orange" />
        <KPIItem title="New Orders" value={orders.length} icon={ShoppingCart} color="blue" />
        <KPIItem title="Total Users" value={users.length} icon={Users} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="rounded-xl border-transparent  xl:col-span-2 overflow-hidden bg-white">
          <CardHeader className="p-10 pb-6">
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight italic">Revenue Graph</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly Performance Overview</CardDescription>
          </CardHeader>
          <CardContent className="p-0 px-10 pb-10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 50px -12px rgb(0 0 0 / 0.1)", fontWeight: 800 }} />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-xl bg-slate-950 border-transparent  text-white p-10 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Package size={24} className="text-pharma-blue" />
               </div>
               <h3 className="text-xl font-bold tracking-tight mb-2 italic">Add New Stock</h3>
               <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8">Quickly update your medicine inventory to ensure availability for your customers.</p>
               <Link href="/admin/inventory">
                 <Button className="w-full h-12 bg-pharma-blue hover:bg-white hover:text-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    Go to Inventory
                 </Button>
               </Link>
            </div>
          </Card>

          <Card className="rounded-xl border-transparent  p-10 bg-white">
            <h3 className="font-bold text-slate-900 tracking-tight mb-8 flex items-center gap-2 italic">
               <CreditCard size={18} className="text-indigo-500" /> Recent Activity
            </h3>
            <div className="space-y-5">
              {transactions.slice(0, 4).map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                        <Check size={18} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">Rs. {tx.amount}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.method} Payment</span>
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">#{tx.id}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function KPIItem({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-50",
    orange: "text-orange-500 bg-orange-50",
    blue: "text-blue-500 bg-blue-50",
    indigo: "text-indigo-500 bg-indigo-50"
  };

  return (
    <Card className="rounded-xl border-transparent shadow-lg p-8 flex items-center gap-6 bg-white group hover: transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${colorMap[color] || 'bg-slate-50'}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </Card>
  );
}
