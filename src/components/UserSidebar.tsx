'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, ShieldCheck, MapPin, Bell, LogOut, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { LogoutDialog } from '@/components/LogoutDialog'

export function UserSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const navItems = [
    { name: 'My Profile', href: '/user/profile', icon: User },
    { name: 'Order History', href: '/user/orders', icon: ShoppingBag },
    { name: 'Security Settings', href: '/user/security', icon: ShieldCheck },
    { name: 'Saved Addresses', href: '/user/addresses', icon: MapPin },
    // { name: 'Notifications', href: '/user/notifications', icon: Bell },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100]"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 h-full w-[320px] max-w-[calc(100vw-60px)] bg-white z-[110] shadow-2xl border-r border-slate-100 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* User Profile Banner with Close Button */}
                <div className="p-8 bg-slate-900 text-white relative overflow-hidden group shrink-0 lg:p-6 lg:bg-white lg:text-slate-950 lg:border-b lg:border-slate-100">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pharma-green/10 blur-3xl lg:hidden"></div>

                  {/* Close button inside Sidebar at top-right */}
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2 text-slate-400 hover:text-white hover:bg-white/10 lg:text-slate-400 lg:hover:bg-slate-100 lg:hover:text-slate-900 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X size={20} />
                  </button>

                  {/* Profile info - visible on small screens, hidden on large screens */}
                  <div className="flex lg:hidden items-center gap-4 relative z-10 pr-8">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                      <User size={28} className="text-pharma-green" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight">{user?.first_name} {user?.last_name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level 1 Patient</span>
                    </div>
                  </div>

                  {/* On large screen, render a clean header title instead of profile info */}
                  <div className="hidden lg:block font-black text-xs uppercase tracking-widest text-slate-800">
                    Navigation Menu
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-pharma-green text-white shadow-lg shadow-pharma-green/20' : 'text-slate-500 hover:bg-slate-50 hover:text-pharma-blue'}`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-pharma-blue'} />
                          <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} />}
                      </Link>
                    )
                  })}

                  {/* <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group mt-4 border border-transparent hover:border-rose-100"
                  >
                    <LogOut size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                  </button> */}
                </div>

                {/* Consultation Promo Banner */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 shrink-0">
                  <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-600 to-pharma-blue text-white relative overflow-hidden">

                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 blur-2xl"></div>

                    <h4 className="text-lg font-black mb-2 tracking-tight">
                      Need Health Consultation?
                    </h4>

                    <p className="text-white/80 text-[11px] leading-relaxed mb-5">
                      Get expert guidance about medicines, dosage, side effects, prescriptions,
                      and common health concerns directly from our pharmacy support team.
                    </p>

                    <a
                      href="https://wa.me/97798XXXXXXXX?text=Hello%20I%20need%20consultation%20regarding%20medicine%20or%20health%20issues."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 transition-all duration-300 active:scale-95">
                        Chat on WhatsApp
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
          onClose();
        }}
      />
    </>
  )
}
