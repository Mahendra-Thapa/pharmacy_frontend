'use client'

import React, { useState } from 'react'
import { ModernNavbar } from '@/components/ModernNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { LogoutDialog } from '@/components/LogoutDialog'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Package, Shield, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const tabs = [
    { name: 'My Profile', href: '/user/profile', icon: User },
    { name: 'Order History', href: '/user/orders', icon: Package },
    { name: 'Security Settings', href: '/user/security', icon: Shield },
    { name: 'Saved Addresses', href: '/user/addresses', icon: MapPin },
    { name: 'Notifications', href: '/user/notifications', icon: Bell },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ModernNavbar 
        userLoggedIn={!!user} 
        onLogout={() => setShowLogoutConfirm(true)} 
        onLogin={() => {}} 
        cartCount={0} 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            {children}
        </motion.div>
      </main>

      <ModernFooter />

      <LogoutDialog 
        open={showLogoutConfirm} 
        onOpenChange={setShowLogoutConfirm}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
      />
    </div>
  )
}
