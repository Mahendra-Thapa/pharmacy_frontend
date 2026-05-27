'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, Sparkles, Bell } from 'lucide-react'

export function WelcomeAlert() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('pharmalogic_welcome_seen')
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const closeAlert = () => {
    setIsVisible(false)
    localStorage.setItem('pharmalogic_welcome_seen', 'true')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-8 left-8 z-50 max-w-sm w-full"
        >
          <div className="bg-slate-950 text-white p-6 rounded-xl shadow-3xl shadow-slate-950/40 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-green/20 blur-3xl rounded-full"></div>

            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-5 relative z-10">
              <div className="w-12 h-12 bg-pharma-green rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-pharma-green/20 rotate-3 group-hover:rotate-0 transition duration-500">
                <Bell size={24} className="text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm uppercase tracking-tight">Welcome to Pharmacy</h4>
                  <Sparkles size={12} className="text-pharma-green" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                  You are now connected to our AI-enhanced pharmaceutical grid. Real-time stock tracking and medical guidance active.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between relative z-10 pl-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-pharma-green" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secured Node</span>
              </div>
              <button
                onClick={closeAlert}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
