'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, RefreshCcw, Download, ShieldCheck, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/lib/admin-context';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function QRManagerPage() {
  const { pharmacySettings, loading, refresh } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success("Security Node Synchronized");
    } catch (err) {
      toast.error("Node Synchronization Fail");
    } finally {
      setRefreshing(false);
    }
  };

  // The QR code is part of the pharmacy settings
  const qrCode = pharmacySettings?.qr_code_url;

  if (loading) return <div className="h-64 flex items-center justify-center">Transmitting Encryption Matrix...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <Card className="rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden bg-white p-12 flex flex-col items-center justify-center text-center relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-pharma-blue/5 blur-[80px] rounded-full"></div>
             
             <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-10 shadow-2xl relative z-10">
                <QrCode size={36} className="text-pharma-blue" />
             </div>
             
             <div className="relative z-10 space-y-4 mb-12">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">System Access Node</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[300px] leading-relaxed">
                   Encrypted QR protocol for mobile fulfillment and client authentication.
                </p>
             </div>

             <div className="relative z-10 w-72 h-72 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 flex items-center justify-center group flex-col">
                {refreshing ? (
                   <RefreshCcw className="animate-spin text-slate-300" size={40} />
                ) : qrCode ? (
                   <div className="relative w-full h-full">
                      <Image src={qrCode} alt="QR Code" fill className="object-contain" priority />
                   </div>
                ) : (
                   <div className="flex flex-col items-center gap-4 opacity-30">
                      <Database size={40} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Data Offline</p>
                   </div>
                )}
             </div>

             <div className="flex gap-4 mt-12 relative z-10">
                <Button onClick={handleSync} disabled={refreshing} className="bg-slate-950 hover:bg-pharma-blue text-white rounded-2xl h-14 px-8 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-900/20">
                   {refreshing ? 'Synchronizing...' : 'Regenerate Protocol'}
                </Button>
                <Button variant="outline" className="rounded-2xl h-14 w-14 border-slate-100 text-slate-400 hover:text-pharma-blue hover:bg-slate-50">
                   <Download size={20} />
                </Button>
             </div>
          </Card>

          <div className="space-y-8">
             <Card className="rounded-[3rem] p-10 border-transparent shadow-xl bg-slate-950 text-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-pharma-blue/20 blur-3xl opacity-50"></div>
                <div className="relative z-10 flex items-start gap-6">
                   <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                      <ShieldCheck size={28} className="text-pharma-blue" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black tracking-tight mb-2">Fulfillment Security</h4>
                      <p className="text-xs text-slate-400 font-bold leading-relaxed">This QR code acts as the master authentication key for on-site medicine dispensing and mobile verifying protocols.</p>
                   </div>
                </div>
             </Card>

             <Card className="rounded-[3rem] p-10 border-slate-100 shadow-sm bg-white">
                <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest mb-6 flex items-center gap-3">
                   <Database size={18} className="text-pharma-blue" /> Node Configuration
                </h4>
                <div className="space-y-6">
                   <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Store Node</span>
                      <span className="text-xs font-black text-slate-900">{pharmacySettings?.name || 'Main PhamaOS'}</span>
                   </div>
                   <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Encrypted Payload</span>
                      <span className="text-[10px] font-mono text-slate-400">AES-256-GCM_v4</span>
                   </div>
                </div>
             </Card>
          </div>
       </div>
    </motion.div>
  );
}
