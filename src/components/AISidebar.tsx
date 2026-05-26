'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

interface Rec {
  id: number;
  name: string;
  reason: string;
  price: number;
  side_effects?: string;
  disclaimer?: string;
}

export function AISidebar({ 
  recommendations, 
  onAdd, 
  isPulsing,
  onSymptomSearch
}: { 
  recommendations: Rec[], 
  onAdd: (id: number) => void,
  isPulsing: boolean,
  onSymptomSearch?: (symptoms: string) => void
}) {
  const [symptomsInput, setSymptomsInput] = React.useState('');

  const handleSearch = () => {
    if (symptomsInput.trim() && onSymptomSearch) {
      onSymptomSearch(symptomsInput);
      setSymptomsInput('');
    }
  };

  return (
    <aside className="w-full md:w-96 flex-shrink-0">
      <div className="sticky top-24 rounded-[2.5rem] overflow-hidden group shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pharma-green/5 via-transparent to-pharma-blue/5 pointer-events-none -z-10"></div>
        
        <div className="bg-white/90 backdrop-blur-3xl border border-slate-100 p-8 flex flex-col h-[700px]">
          {/* Active AI Indicator Bar */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isPulsing ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1.5 bg-pharma-green transform origin-left"
          />
          
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 ${isPulsing ? 'animate-pulse ring-4 ring-pharma-green/20' : ''}`}>
              <Sparkles size={20} className="text-pharma-green" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1">AI Health Guide</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Medical Intelligence v2.0</p>
            </div>
          </div>

          <div className="mb-8 relative group/input">
             <input 
               type="text" 
               placeholder="How are you feeling?"
               value={symptomsInput}
               onChange={(e) => setSymptomsInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pharma-green/30 placeholder-slate-400 pr-12 transition-all shadow-inner"
             />
             <button 
                onClick={handleSearch} 
                className="absolute right-2 top-2 p-2.5 rounded-xl bg-slate-900 text-white hover:bg-pharma-green transition-all duration-300 shadow-lg active:scale-95"
             >
               <ArrowRight size={16} strokeWidth={3} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-6">
            {recommendations.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-dashed border-slate-200 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                   <Sparkles size={32} className="text-slate-200"/>
                </div>
                <h4 className="font-black text-slate-400 text-[10px] items-center uppercase tracking-[0.2em] mb-3">System Idle</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed px-4">Describe your symptoms to receive AI-powered medication suggestions based on our pharmacy database.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {recommendations.map((rec, idx) => (
                  <motion.div 
                    key={`${rec.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100, delay: idx * 0.1 }}
                    className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-lg shadow-slate-200/40 group/rec hover:border-pharma-green/30 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-sm text-slate-900 group-hover/rec:text-pharma-green transition-colors tracking-tight pr-4">
                        {rec.name}
                      </h4>
                      <span className="text-slate-950 font-black text-xs">Rs.{rec.price}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-pharma-green bg-pharma-green/5 px-2.5 py-1 rounded-full border border-pharma-green/10">
                           <ShoppingBag size={10} />
                           {rec.reason}
                        </div>
                        {rec.side_effects && (
                             <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                Side Effects: {rec.side_effects}
                             </div>
                        )}
                    </div>

                    {rec.disclaimer && (
                        <p className="text-[9px] text-slate-400 font-bold mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 uppercase tracking-wider leading-relaxed">
                            {rec.disclaimer}
                        </p>
                    )}

                    <button 
                        onClick={() => onAdd(rec.id)}
                        className="w-full p-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-pharma-green transition-all duration-300 shadow-xl shadow-slate-900/10 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                       Secure for Basket
                       <ArrowRight size={14} strokeWidth={3} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <div className="w-2 h-2 rounded-full bg-pharma-green animate-ping"></div>
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.15em]">RAG Engine: Synchronized</span>
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
