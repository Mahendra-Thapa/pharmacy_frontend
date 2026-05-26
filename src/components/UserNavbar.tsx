'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Activity, User, ShoppingBag, LogOut, Heart, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { LogoutDialog } from './LogoutDialog'

export function UserNavbar() {
  const { user, logout } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 flex items-center justify-center p-4">
        <nav className="w-full max-w-7xl h-full flex items-center justify-between px-6 bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-pharma-green/5 rounded-3xl transition-all duration-500 hover:shadow-pharma-green/10">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group relative overflow-hidden">
            <img src="/logo.png" alt="Pharmalogic" className="h-12 w-auto relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pharma-blue/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition duration-1000"></div>
          </Link>
          
          {/* Dashboard Links */}
          <div className="hidden lg:flex items-center bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner gap-1">
             <Link href="/user/profile" className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-pharma-green hover:bg-white transition-all rounded-xl flex items-center gap-2 group">
               <User size={14} className="group-hover:text-pharma-green transition-colors" /> Profile
             </Link>
             <Link href="/user/orders" className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-pharma-green hover:bg-white transition-all rounded-xl flex items-center gap-2 group">
               <ShoppingBag size={14} className="group-hover:text-pharma-green transition-colors" /> My Orders
             </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs font-black text-slate-900 leading-none mb-0.5">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-[9px] font-bold text-pharma-blue uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              <button 
                onClick={() => setShowLogoutDialog(true)}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl transition duration-500 shadow-xl shadow-slate-950/10 active:scale-95 group"
              >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
              </button>
          </div>
        </nav>
      </header>

      <LogoutDialog 
        open={showLogoutDialog} 
        onOpenChange={setShowLogoutDialog} 
        onConfirm={logout} 
      />
    </>
  )
}
