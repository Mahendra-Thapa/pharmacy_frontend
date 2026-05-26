'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { MapPin, Plus, Trash2, Home, Briefcase, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AddressesPage() {
  const addresses = [
    { id: 1, type: 'Home', address: '42 Emerald Heights, Block-C, Surat, Gujarat', icon: Home, default: true },
    { id: 2, type: 'Office', address: 'Cyber Plaza, 4th Floor, Sector 5, Surat', icon: Briefcase, default: false },
  ]

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
        <header className="flex items-end justify-between">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Saved Nodes</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Geospatial Delivery Destinations</p>
            </div>
            <Button className="h-12 px-6 bg-pharma-blue hover:bg-pharma-blue/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-pharma-blue/20 flex items-center gap-2">
                <Plus size={16} /> Add New Node
            </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
                <Card key={addr.id} className={`group relative rounded-[2.5rem] border-2 p-8 transition-all duration-500 overflow-hidden ${addr.default ? 'border-pharma-blue bg-white shadow-2xl shadow-pharma-blue/10' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}>
                    <div className="flex items-start justify-between mb-8">
                        <div className={`p-4 rounded-2xl ${addr.default ? 'bg-pharma-blue text-white' : 'bg-slate-50 text-slate-400'} transition-all`}>
                            <addr.icon size={24} />
                        </div>
                        {addr.default && <span className="text-[9px] font-black uppercase text-pharma-blue bg-pharma-blue/10 px-3 py-1 rounded-full">Primary Node</span>}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{addr.type} Protocol</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{addr.address}</p>
                    </div>

                    <div className="mt-8 flex items-center gap-3 pt-6 border-t border-slate-50">
                        <button className="text-[10px] font-black uppercase text-pharma-blue hover:underline">Recalibrate</button>
                        {!addr.default && <button className="text-[10px] font-black uppercase text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">Purge Node</button>}
                    </div>
                </Card>
            ))}
        </div>
    </motion.div>
  )
}
