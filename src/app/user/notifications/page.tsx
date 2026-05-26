'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Bell, Zap, Percent, Package, AlertCircle } from 'lucide-react'

export default function NotificationsPage() {
  const alerts = [
    { id: 1, title: 'Order Dispatched', desc: 'Protocol RX-84920 has been cleared for delivery.', time: '2h ago', icon: Package, type: 'status' },
    { id: 2, title: 'Stock Alert', desc: 'Your saved item "Multivitamin Gold" is back in inventory.', time: '5h ago', icon: Zap, type: 'info' },
    { id: 3, title: 'Exclusive Voucher', desc: 'New promotion detected: Use PHARMA25 for 25% discount.', time: '1d ago', icon: Percent, type: 'promo' },
  ]

  return (
    <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Notifications</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Real-time Environmental Notifications</p>
        </header>

        <Card className="rounded-[3rem] border-transparent shadow-xl bg-white overflow-hidden divide-y divide-slate-50">
            {alerts.map(alert => (
                <div key={alert.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-start gap-6 group">
                    <div className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                        alert.type === 'status' ? 'bg-emerald-50 text-emerald-500' :
                        alert.type === 'info' ? 'bg-pharma-blue/5 text-pharma-blue' :
                        'bg-rose-50 text-rose-500'
                    }`}>
                        <alert.icon size={20} />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{alert.title}</h3>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{alert.time}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed opacity-70">{alert.desc}</p>
                    </div>

                    <div className="w-2 h-2 rounded-full bg-pharma-blue opacity-0 group-hover:opacity-100 transition-opacity self-center"></div>
                </div>
            ))}
        </Card>
    </motion.div>
  )
}
