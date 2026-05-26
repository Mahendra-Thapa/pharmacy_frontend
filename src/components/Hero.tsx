'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Plus } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-[400px] flex items-center overflow-hidden rounded-3xl mb-12">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner.png" 
          alt="Modern Pharmacy" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-pharma-blue/60 to-slate-900/20 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pharma-blue/20 border border-pharma-blue/30 text-pharma-blue font-semibold mb-6 backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="text-pharma-orange" />
            <span className="text-white text-xs">AI-Driven Healthcare Solutions</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Your Health, <br />
            Our <span className="text-pharma-green">Innovation</span>
          </h1>
          
          <p className="text-lg text-slate-100/90 mb-8 max-w-lg leading-relaxed">
            Experience the future of pharmacy management. Precision medications, 
            instant consultations, and AI-powered recommendations tailored for your well-being.
          </p>
          
          {/* <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-pharma-orange hover:bg-pharma-orange/90 text-white font-bold rounded-2xl transition shadow-lg shadow-pharma-orange/20 active:scale-95">
              Explore Pharmacy
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition backdrop-blur-md border border-white/20 active:scale-95">
              Read Reviews
            </button>
          </div> */}

          <div className="mt-12 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pharma-green/20 border border-pharma-green/30">
                <ShieldCheck className="text-pharma-green" size={20} />
              </div>
              <div className="text-sm">
                <p className="font-bold text-white">Verified Service</p>
                <p className="text-slate-300 text-xs">ISO 27001 Certified</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pharma-blue/20 border border-pharma-blue/30">
                <Plus className="text-pharma-blue" size={20} />
              </div>
              <div className="text-sm">
                <p className="font-bold text-white">24/7 Support</p>
                <p className="text-slate-300 text-xs">Live Pharmacists</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Visual floaty element */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute right-20 top-20 w-32 h-32 bg-pharma-blue/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-[40%] w-40 h-40 bg-pharma-green/20 rounded-full blur-3xl"
      />
    </section>
  );
}
