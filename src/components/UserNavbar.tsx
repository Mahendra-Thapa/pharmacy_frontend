'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User as UserIcon, Menu, ChevronDown, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import SearchComponent from './SearchComponent'
import { LogoutDialog } from './LogoutDialog'

export function UserNavbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-white border-b border-slate-100 shadow-sm h-16 lg:h-20 justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Left: Sidebar Toggle and Logo */}
          <div className="flex gap-4 items-center shrink-0">
            {/* Sidebar Toggle Button */}
            <button 
              onClick={onToggleSidebar}
              className="p-2.5 text-slate-600 hover:bg-slate-50 hover:text-pharma-blue rounded-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center border border-slate-100 shadow-sm bg-white"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Brand/Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative w-28 lg:w-32 overflow-hidden flex items-center justify-center">
                 <Image src="/logo.png" alt="Logo" width={128} height={40} className="object-contain" priority />
              </div>
            </Link>
          </div>
          
          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl">
             <SearchComponent />
          </div>

          {/* Right: Cart and Profile */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Basket/Cart Icon */}
            <Link href="/cart" className="relative group flex flex-col items-center gap-1 text-slate-400 hover:text-pharma-blue transition-all">
               <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-pharma-blue/10 group-active:scale-90 transition-all border border-slate-100">
                  <ShoppingCart size={20} className="group-hover:text-pharma-blue transition-colors" />
                  {cartCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 bg-pharma-orange text-white text-[8px] font-black h-4 w-4 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
               </div>
            </Link>

            <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pharma-blue/30 transition-all group active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md overflow-hidden">
                     <UserIcon size={18} />
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                     <span className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">{user.first_name}</span>
                     <span className="text-xs font-black text-slate-950 flex items-center gap-1">
                       Account 
                       <ChevronDown size={12} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                     </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={() => setShowUserMenu(false)} 
                        className="fixed inset-0 z-40" 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-[200px] bg-white rounded-sm border border-slate-100 shadow-2xl z-50 overflow-hidden divide-y divide-slate-50"
                      >
                         <div className="p-4 bg-slate-50/50 flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-700 truncate">{user.first_name} {user.last_name}</span>
                         </div>
                         <div className="p-2">
                            <button 
                              onClick={() => {
                                setShowUserMenu(false);
                                setShowLogoutConfirm(true);
                              }} 
                              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 text-slate-600 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer"
                            >
                               <LogIn size={14} className="rotate-180" /> Logout
                            </button>
                         </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="h-10 px-6 bg-slate-900 hover:bg-pharma-blue text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </header>

      <LogoutDialog 
        open={showLogoutConfirm} 
        onOpenChange={setShowLogoutConfirm} 
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }} 
      />
    </>
  )
}
