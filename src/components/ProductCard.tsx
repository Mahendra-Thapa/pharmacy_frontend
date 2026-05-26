'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Plus, Info } from 'lucide-react'
import Link from 'next/link'

interface Medicine {
  id: number
  name: string
  category: string
  price: number
  rating: number
  description?: string
  image_url?: string
}

export function ProductCard({ 
  medicine, 
  onAdd 
}: { 
  medicine: Medicine, 
  onAdd: (medicine: Medicine) => void 
}) {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white group relative overflow-hidden rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-pharma-green/10 transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/medicine/${medicine.id}`} className="flex-1 flex flex-col">
          {/* Badge container */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-slate-900/40 px-2.5 py-1 rounded-full border border-white/20 shadow-sm backdrop-blur-md">
               {medicine.category}
            </span>
          </div>

          {/* Visual Container */}
          <div className="h-56 bg-gradient-to-br from-slate-50 to-white flex items-center justify-center relative overflow-hidden group-hover:from-pharma-blue/5 transition-colors duration-500">
            {medicine.image_url ? (
                <img 
                  src={medicine.image_url} 
                  alt={medicine.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
            ) : (
                <>
                    <div className="w-24 h-24 bg-white/60 rounded-full blur-2xl absolute -top-10 -right-10 opacity-60 group-hover:bg-pharma-green/20"></div>
                    <div className="w-32 h-32 bg-pharma-blue/10 rounded-full blur-3xl absolute -bottom-10 -left-10 opacity-60 group-hover:bg-pharma-blue/20"></div>
                    
                    {/* Placeholder Medicine Visual */}
                    <div className="relative z-0 group-hover:scale-110 transition-transform duration-500 ease-out">
                        <div className="w-20 h-28 bg-white border border-slate-100 rounded-lg shadow-lg flex flex-col p-2 gap-1 overflow-hidden transform rotate-3">
                            <div className="h-4 w-full bg-pharma-green/20 rounded"></div>
                            <div className="h-1 w-3/4 bg-slate-100 rounded"></div>
                            <div className="h-1 w-1/2 bg-slate-100 rounded"></div>
                            <div className="mt-auto h-2 w-full bg-slate-50 border border-slate-100 rounded flex items-center justify-around">
                                <div className="w-1 h-1 rounded-full bg-pharma-blue"></div>
                                <div className="w-1 h-1 rounded-full bg-pharma-blue"></div>
                                <div className="w-1 h-1 rounded-full bg-pharma-blue"></div>
                            </div>
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1 gap-4">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                <Star size={10} className="fill-yellow-500" /> {medicine.rating || "4.5"}
              </div>
              <div className="p-1.5 rounded-full text-slate-400 hover:text-pharma-blue hover:bg-pharma-blue/10 transition opacity-0 group-hover:opacity-100 duration-300">
                <Info size={16} />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xl leading-tight mb-2 group-hover:text-pharma-green transition">
                {medicine.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {medicine.description || 'Premium grade medication, formulated for maximum efficacy and minimal side effects.'}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Retail Price</span>
                <span className="text-2xl font-black text-slate-900 regular-price-span">
                  <span className="text-pharma-green text-lg mr-0.5">Rs.</span>
                  {medicine.price}
                </span>
              </div>
            </div>
          </div>
      </Link>

      <div className="absolute bottom-6 right-6">
          <button 
            onClick={() => onAdd(medicine)} 
            className="group/btn relative w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-pharma-green transition shadow-xl shadow-slate-900/10 active:scale-95 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-pharma-blue translate-y-12 group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"
            />
            <Plus size={24} className="relative z-10" />
          </button>
      </div>
    </motion.div>
  )
}
