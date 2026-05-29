'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Plus, Info } from 'lucide-react'
import Link from 'next/link'
import { FiShoppingCart } from "react-icons/fi";

interface Medicine {
  id: number
  name: string
  category: string
  category_name: string
  price: number
  rating: number
  description?: string
  image_url?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Antibiotic:  'bg-emerald-50',
  Analgesic:   'bg-blue-50',
  Vitamin:     'bg-amber-50',
  default:     'bg-slate-50',
}

export function ProductCard({
  medicine,
  onAdd,
}: {
  medicine: Medicine
  onAdd: (medicine: Medicine) => void
}) {
  const imageBg = CATEGORY_COLORS[medicine.category] ?? CATEGORY_COLORS.default

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow duration-300 hover: hover:shadow-slate-200/60"
    >
      {/* Image area */}
      <Link href={`/medicine/${medicine.id}`} className="flex flex-col flex-1">
        <div className={`relative flex h-44 items-center justify-center overflow-hidden ${imageBg}`}>
          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {medicine.category_name}
          </span>

          {medicine.image_url ? (
            <img
              src={medicine.image_url}
              alt={medicine.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderPill />
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* Rating row */}
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <Star size={10} className="fill-amber-500 text-amber-500" />
              {medicine.rating ?? '4.5'}
            </div> */}
            {/* <Info
              size={15}
              className="text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            /> */}
          </div>

          {/* Name & description */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold leading-snug text-slate-900">
              {medicine.name}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
              {medicine.description ??
                'Premium grade medication, formulated for maximum efficacy and minimal side effects.'}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
            
              <span className="flex items-baseline gap-0.5 text-2xl font-bold text-slate-900">
                <span className="text-sm font-semibold text-emerald-500">Rs.</span>
                {Number(medicine.price)?.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add button — outside Link to avoid nested interactive elements */}
      <button
        onClick={() => onAdd(medicine)}
        className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white  transition-colors duration-200 hover:bg-emerald-500 active:scale-95"
        aria-label={`Add ${medicine.name} to cart`}
      >
        <FiShoppingCart   size={18} />
      </button>
    </motion.div>
  )
}

function PlaceholderPill() {
  return (
    <div className="flex h-[72px] w-[48px] rotate-3 flex-col items-center overflow-hidden rounded-t-3xl rounded-b-lg border border-slate-100 bg-white px-2 pb-2 pt-2.5 shadow-sm transition-transform duration-500 group-hover:rotate-0">
      <div className="mb-1.5 h-1.5 w-7 rounded-full bg-emerald-300/70" />
      <div className="mb-2 h-1 w-5 rounded-full bg-slate-100" />
      <div className="mt-auto flex gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-300/70" />
        <div className="h-1.5 w-1.5 rounded-full bg-blue-300/70" />
        <div className="h-1.5 w-1.5 rounded-full bg-blue-300/70" />
      </div>
    </div>
  )
}