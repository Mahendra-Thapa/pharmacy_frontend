"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  History, 
  Trash2, 
  User, 
  Cpu, 
  Maximize2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { axiosInstance } from '@/utils/axiosSetup';
import { getTokenFromCookies } from '@/utils/cookies';
import { toast } from 'react-hot-toast';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      const data = await getTokenFromCookies();
      if (data) {
          try {
              // Current cookies.ts only returns token and role.
              // We might need to fetch profile to get userId for history.
              const { data: profile } = await axiosInstance.get('/users/me/');
              setUser(profile);
              fetchHistory(profile.id);
          } catch (e) {
              setUser(data);
          }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const fetchHistory = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/ai/chat-history/${userId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data.map((m: any) => ({ role: m.role, text: m.message })));
      }
    } catch (e) { 
      // Silently fail if AI service is not running
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMsg, 
            userId: user?.id || 'anonymous' 
          })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) {
      toast.error("Telemetry failure");
      setMessages(prev => [...prev, { role: 'bot', text: "PharmaLogic AI connection lost... please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Skip on chat page or admin pages
  if (pathname === '/chat' || pathname?.startsWith('/admin') || pathname?.startsWith('/pos')) {
    return null;
  }

  return (
    <div className="fixed bottom-10 right-10 z-[45] flex flex-col items-end max-h-[80vh]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
            className="w-[400px] bg-white border border-slate-100 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col mb-8"
          >
             {/* Header */}
             <div className="p-7 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles size={60} className="text-pharma-green" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-11 h-11 bg-pharma-green rounded-2xl flex items-center justify-center shadow-lg shadow-pharma-green/20">
                      <Bot size={24} className="text-white animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-pharma-green mb-0.5">PharmaLogic AI</h3>
                      <p className="text-[13px] font-black tracking-tight">Active Health Guide</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                   <Link href="/chat" className="p-2.5 hover:bg-white/10 rounded-xl transition-all" title="Expand to Terminal"><Maximize2 size={18}/></Link>
                   <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><X size={18}/></button>
                </div>
             </div>

             {/* Messages */}
             <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30">
                {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 border border-dashed border-slate-300">
                         <Bot size={32} className="text-slate-400" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-loose text-slate-500">
                        Neural links active. Describe your condition or ask for medication info.
                      </p>
                   </div>
                )}
                {messages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[2rem] text-[14px] font-bold tracking-tight leading-relaxed shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-100 shadow-slate-200/50'
                      }`}>
                         {m.text}
                      </div>
                   </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 flex gap-1.5 shadow-sm">
                         <div className="w-1.5 h-1.5 bg-pharma-green/40 rounded-full animate-bounce" />
                         <div className="w-1.5 h-1.5 bg-pharma-green/40 rounded-full animate-bounce delay-100" />
                         <div className="w-1.5 h-1.5 bg-pharma-green/40 rounded-full animate-bounce delay-200" />
                      </div>
                   </div>
                )}
             </div>

             {/* Input */}
             <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-white">
                <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-[1.5rem] p-1.5 transition-all focus-within:border-pharma-green/30 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-pharma-green/5">
                   <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e as any);
                        }
                      }}
                      placeholder="Ask anything..."
                      className="w-full bg-transparent border-none px-4 py-3.5 text-[14px] font-bold tracking-tight outline-none resize-none placeholder:text-slate-400 max-h-32 min-h-[48px] custom-scrollbar overflow-y-auto"
                      rows={input.split('\n').length > 3 ? 3 : Math.max(1, input.split('\n').length)}
                   />
                   <button 
                     type="submit" 
                     disabled={loading || !input.trim()}
                     className="mb-1.5 mr-1.5 p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-pharma-green hover:shadow-xl hover:shadow-pharma-green/20 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 flex-shrink-0"
                   >
                      <Send size={18} strokeWidth={3} />
                   </button>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center mt-5 text-slate-300">Verified Health Intelligence</p>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] relative group overflow-hidden"
      >
         <div className="absolute inset-0 bg-pharma-green blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" />
         {isOpen ? <X size={32} strokeWidth={3} /> : <div className="relative flex items-center justify-center">
            <Bot size={32} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pharma-green border-4 border-slate-900 rounded-full animate-pulse" />
         </div>}
      </motion.button>
    </div>
  );
}
