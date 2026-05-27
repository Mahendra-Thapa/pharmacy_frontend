'use client'

import React, { useState } from 'react'
import { UserNavbar } from '@/components/UserNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { UserSidebar } from '@/components/UserSidebar'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-40 pb-24">
        <div className="max-w-4xl mx-auto w-full">
          <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <div className="flex-1 min-w-0 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {children}
            </motion.div>
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
