'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Monitor,
  UserCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { LogoutDialog } from '@/components/LogoutDialog'

interface POSSidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogs: () => void
  onOpenSettings: () => void
}

export function POSSidebar({ isOpen, onClose, onOpenLogs, onOpenSettings }: POSSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const navItems = [
    { name: 'POS Terminal', href: '/pos', icon: Monitor },
    { name: 'Orders', href: '/pos/orders', icon: ShoppingBag },
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
              className="fixed top-0 left-0 h-full w-[320px] max-w-[calc(100vw-60px)] bg-white z-[110]  border-r border-slate-100 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header Banner with Close Button */}
                <div className="p-8 bg-slate-900 text-white relative overflow-hidden group shrink-0 lg:p-6 lg:bg-white lg:text-slate-950 lg:border-b lg:border-slate-100">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pharma-green/10 blur-3xl lg:hidden"></div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2 text-slate-400 hover:text-white hover:bg-white/10 lg:text-slate-400 lg:hover:bg-slate-100 lg:hover:text-slate-900 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X size={20} />
                  </button>

                  {/* Agent info - visible on small screens */}
                  <div className="flex lg:hidden items-center gap-4 relative z-10 pr-8">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                      <UserCircle size={28} className="text-pharma-green" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">
                        {user?.first_name} {user?.last_name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {user?.role} Agent
                      </span>
                    </div>
                  </div>

                  {/* On large screen, render a clean header title */}
                  <div className="hidden lg:block font-bold text-xs uppercase tracking-widest text-slate-800">
                    POS Navigation
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {/* Page Links */}
                  {navItems.map((item) => {
                    const isActive =
                      item.href === '/pos'
                        ? pathname === '/pos'
                        : pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                            ? 'bg-pharma-green text-white shadow-lg shadow-pharma-green/20'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-pharma-blue'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon
                            size={18}
                            className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-pharma-blue'}
                          />
                          <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} />}
                      </Link>
                    )
                  })}

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-2" />

                  {/* Settings */}
                  <Link
                    href="/pos/passwordChange"
                    onClick={onClose}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-pharma-blue w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <Settings size={18} className="text-slate-400 group-hover:text-pharma-blue" />
                      <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                    </div>
                  </Link>
                </div>

                {/* POS Info Banner */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 shrink-0">
                  <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-pharma-green/20 blur-2xl"></div>
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-pharma-green animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-pharma-green">
                        Terminal Active
                      </span>
                    </div>
                    <h4 className="text-base font-bold mb-1 tracking-tight relative z-10">
                      PharmaPos Terminal
                    </h4>
                    <p className="text-white/60 text-[11px] leading-relaxed relative z-10">
                      Agent: <span className="text-white font-bold">{user?.first_name} {user?.last_name}</span>
                      <br />
                      Role: <span className="text-pharma-green font-bold uppercase">{user?.role}</span>
                    </p>
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
          logout?.();
          setShowLogoutConfirm(false);
          onClose();
        }}
      />
    </>
  )
}
