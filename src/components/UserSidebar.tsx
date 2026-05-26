'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, ShieldCheck, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { LogoutDialog } from '@/components/LogoutDialog'

export function UserSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const navItems = [
    { name: 'My Profile', href: '/user/profile', icon: User },
    { name: 'Order History', href: '/user/orders', icon: ShoppingBag },
    { name: 'Security Settings', href: '/user/security', icon: ShieldCheck },
    { name: 'Saved Addresses', href: '/user/addresses', icon: MapPin },
    { name: 'Notifications', href: '/user/notifications', icon: Bell },
  ]

  return (
    <div className="w-full lg:w-[320px] flex flex-col gap-6">
      <Card className="rounded-[2.5rem] border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="p-8 bg-slate-900 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-pharma-green/10 blur-3xl"></div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                 <User size={28} className="text-pharma-green" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black tracking-tight">{user?.first_name} {user?.last_name}</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level 1 Patient</span>
              </div>
           </div>
        </div>
        
        <div className="p-4 flex flex-col gap-1">
           {navItems.map((item) => {
             const isActive = pathname === item.href
             return (
               <Link 
                 key={item.href} 
                 href={item.href}
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
           
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group mt-4 border border-transparent hover:border-rose-100"
           >
              <LogOut size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Logout</span>
           </button>
        </div>
      </Card>

      <LogoutDialog 
        open={showLogoutConfirm} 
        onOpenChange={setShowLogoutConfirm}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
      />
      
      <Card className="rounded-[2.5rem] p-8 border-slate-200 shadow-sm bg-gradient-to-br from-indigo-600 to-pharma-blue text-white relative overflow-hidden">
         <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 blur-2xl"></div>
         <h4 className="text-lg font-black mb-2 tracking-tight">Need Medical Assistance?</h4>
         <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-6 leading-relaxed">Our pharmacists are ready to guide your recovery.</p>
         <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-900/20 active:scale-95 transition">
            Start Consultation
         </button>
      </Card>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}
