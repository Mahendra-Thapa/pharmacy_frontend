"use client";

import React, { useState, useEffect, useRef } from "react";
import { ModernNavbar } from "@/components/ModernNavbar";
import { ModernFooter } from "@/components/ModernFooter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Cpu,
  Trash2,
  Plus,
  MessageSquare,
  History,
  Globe,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { axiosInstance, axiosAuthInstance } from "@/utils/axiosSetup";
import { getTokenFromCookies } from "@/utils/cookies";
import { toast } from "react-hot-toast";
import { LoginDialog } from "@/components/LoginDialog";

export default function ChatTerminalPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historySessions, setHistorySessions] = useState<{ sessionId: string, title: string, msgs: any[] }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Sync Cart Count
      const savedCart = localStorage.getItem("pharmacy_cart");
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          setCartCount(items.length);
        } catch (e) {
          console.error("Cart sync fail");
        }
      }

      const data = await getTokenFromCookies();
      if (data) {
        try {
          // Using axiosAuthInstance ensures the token is included
          const { data: profile } = await axiosAuthInstance.get('/users/me/');
          setUser(profile);
          fetchHistory(profile.id);
        } catch (e) {
          console.error("Profile fetch fail, following token fallback");
          // Check if data has role/token and simulate a user if profile fetch fails
          setUser({ ...data, id: 'anonymous', username: 'Guest User' });
        }
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setUser(null);
    router.push("/");
    toast.success("Identity Disconnected");
  };

  const handleLogin = () => {
    setShowLoginDialog(true);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-pharma-blue hover:underline font-bold break-all">
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const fetchHistory = async (userId: number) => {
    try {
      // Calling the Flask AI service via the proxy or direct URL (port 5001)
      // Assuming NEXT_PUBLIC_BASE_URL is handled or we use the specific AI base
      const AI_BASE = 'http://localhost:5001/api/ai';
      const response = await fetch(`${AI_BASE}/chat-history/${userId}`);
      if (!response.ok) return;
      const data = await response.json();

      if (!Array.isArray(data)) return;

      const sessionsMap: Record<string, any[]> = {};
      let legacyCounter = 0;

      data.forEach((m: any) => {
        let sid = m.session_id || 'default_session';
        if (sid === 'default_session') {
          if (m.role === 'user') legacyCounter++;
          sid = `session_${legacyCounter}`;
        }
        if (!sessionsMap[sid]) sessionsMap[sid] = [];
        sessionsMap[sid].push({ role: m.role, text: m.message });
      });

      const parsedSessions = Object.keys(sessionsMap).map(sid => {
        const firstUserMsg = sessionsMap[sid].find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.text : 'Health Query';
        return { sessionId: sid, title, msgs: sessionsMap[sid] };
      }).reverse();

      setHistorySessions(parsedSessions);

      if (currentSessionId) {
        const current = parsedSessions.find(s => s.sessionId === currentSessionId);
        if (current) setMessages(current.msgs);
      }
    } catch (e) {
      // Silently fail if AI service is not running
    }
  };

  const clearHistory = async () => {
    if (!user?.id) return;
    if (!confirm("Confirm complete diagnostic archive purging?")) return;
    try {
      const AI_BASE = 'http://localhost:5001/api/ai';
      await fetch(`${AI_BASE}/chat-history/${user.id}`, { method: 'DELETE' });
      setHistorySessions([]);
      setMessages([]);
      setCurrentSessionId(null);
      toast.success("Archive Vault Purged");
    } catch (e) {
      toast.error("Cleanup Protocol Interrupted");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    const sessionToUse = currentSessionId || `sess_${Date.now()}`;
    if (!currentSessionId) setCurrentSessionId(sessionToUse);

    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const AI_BASE = 'http://localhost:5001/api/ai';
      const response = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userId: user?.id || 'anonymous',
          sessionId: sessionToUse
        })
      });
      const data = await response.json();

      setMessages(prev => [...prev, { role: "bot", text: data.response }]);

      if (user) {
        fetchHistory(user.id);
      }
    } catch (err) {
      toast.error("Internal Signal Interrupted");
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Connection to the PharmaLogic AI core was lost. Please verify backend status.", },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    toast("New Health Session Initialized", { icon: "✨" });
    setIsSidebarOpen(false);
  };

  const loadSession = (sessionId: string, sessionMsgs: any[]) => {
    setCurrentSessionId(sessionId);
    setMessages(sessionMsgs);
    toast.success("Health Node Restored");
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <ModernNavbar
        userLoggedIn={!!user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        cartCount={cartCount}
      />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* Main Container - Adjusted for fixed navbar heights */}
      {/* Mobile Nav: h-16 (64px) | Desktop Nav: h-20 + h-14 (136px) */}
      <main className="flex-1 flex overflow-hidden pt-16 lg:pt-[136px] bg-slate-50 relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-[15] lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Sidebar - History */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-10 w-[320px] bg-white border-r border-slate-200 flex flex-col  lg:shadow-none transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar Header (Mobile Only) */}
          <div className="flex items-center justify-between lg:hidden p-6 border-b border-slate-50 bg-red-300">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-pharma-green">PharmaLogic AI</span>
              <span className="text-sm font-bold text-slate-900 tracking-tighter">Diagnostic Archive</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-pharma-blue rounded-2xl transition-all active:scale-90">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="p-4  flex flex-col h-full overflow-hidden">
            <button
              onClick={startNewChat}
              className="w-full p-3 bg-slate-950 text-white hover:bg-pharma-green rounded-2xl flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all  shadow-slate-900/10 active:scale-95 group"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-700" />
              Initialise New Session
            </button>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2 -mr-2">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 flex items-center justify-between px-3 mb-2">
                <div className="flex items-center gap-3 ">
                  <History size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Temporal Nodes</span>
                </div>
                {historySessions.length > 0 && (
                  <button onClick={clearHistory} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {historySessions.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-20">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-slate-300 italic text-[11px] font-bold uppercase tracking-widest leading-loose">
                    Archive vault is currently empty
                  </p>
                </div>
              ) : (
                historySessions.map((session, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSession(session.sessionId, session.msgs)}
                    className={`w-full py-1 px-5 rounded-[1.5rem] flex items-center gap-4 transition-all text-left border-2 ${session.sessionId === currentSessionId
                        ? 'bg-pharma-green/5 border-pharma-green/20 text-pharma-green shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-500 hover:border-slate-100'
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${session.sessionId === currentSessionId ? 'bg-pharma-green/20 text-pharma-green' : 'bg-slate-50 text-slate-300'
                      }`}>
                      <MessageSquare size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-[13px] font-bold truncate leading-tight transition-colors ${session.sessionId === currentSessionId ? 'text-pharma-green' : 'text-slate-700'
                        }`}>
                        {session.title}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Session Logic Resolved</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex-none">
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cpu size={48} />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 bg-pharma-green rounded-full animate-ping" />
                  <span className="text-[9px] font-bold uppercase text-pharma-green tracking-widest">Neural Link Success</span>
                </div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1 leading-none">
                  V4.0 QUANTUM RETRIEVAL
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Medical Context Synced</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-white lg:bg-slate-50/30 relative">
          {/* Mobile Header (Fixed glassmorphism) */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-slate-50 text-slate-900 rounded-2xl transition-all shadow-sm active:scale-95">
              <Menu size={20} strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold tracking-[0.4em] text-pharma-green uppercase leading-none mb-1">HEALKART</span>
              <span className="text-[11px] font-bold text-slate-950 tracking-tighter">INTELLIGENCE</span>
            </div>
            <button onClick={startNewChat} className="p-3 bg-slate-50 text-slate-900 rounded-2xl transition-all shadow-sm active:scale-95">
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 lg:px-12 flex flex-col">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-pharma-green/10 blur-[80px] animate-pulse rounded-full" />
                    <div className="w-32 h-32 bg-slate-950 rounded-xl flex items-center justify-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative z-10 border-[6px] border-white ring-1 ring-slate-100">
                      <Cpu size={64} className="text-pharma-green" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pharma-green rounded-3xl flex items-center justify-center text-white border-4 border-white  z-20">
                      <Sparkles size={20} />
                    </div>
                  </motion.div>

                  <div className="space-y-6 max-w-2xl">
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-950 tracking-tighter uppercase italic leading-[0.9]">
                      PHARMA<span className="text-pharma-green">GENESIS</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto text-sm">
                      Advanced RAG protocol established. Secure access to our verified global pharmaceutical archives.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
                    {[
                      'Treatment for acute migraine',
                      'Essential prenatal nutrients',
                      'Fever protocols for infants',
                      'Supply chain demand for Insulin',
                    ].map((q, idx) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setInput(q)}
                        className="p-8 bg-white border border-slate-100 rounded-[2.8rem] hover:border-pharma-green/40 hover:shadow-[0_24px_48px_-12px_rgba(53,152,104,0.1)] text-left transition-all active:scale-[0.98] group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-pharma-green translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="flex items-center gap-3 mb-4">
                          <Bot size={14} className="text-slate-300 group-hover:text-pharma-green transition-colors" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900">Logic Probe</span>
                        </div>
                        <p className="text-[15px] font-bold text-slate-900 tracking-tight leading-snug">"{q}"</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-10">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-5 max-w-[90%] lg:max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)] mt-1 ${m.role === "user" ? "bg-slate-950 text-white" : "bg-white border border-slate-100 text-pharma-green"
                        }`}>
                        {m.role === "user" ? <User size={22} /> : <Bot size={22} />}
                      </div>
                      <div className={`px-8 py-6 rounded-xl text-[16px] font-bold leading-relaxed shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative ${m.role === "user"
                          ? "bg-slate-950 text-white rounded-tr-none shadow-slate-950/20"
                          : "bg-white text-slate-900 border border-slate-50 rounded-tl-none shadow-slate-200/40"
                        }`}
                      >
                        <p className="tracking-tight whitespace-pre-wrap">{renderMessageText(m.text)}</p>

                        {m.role === "bot" && (
                          <div className="mt-8 flex items-center gap-5 border-t border-slate-50 pt-5 opacity-40">
                            <div className="flex items-center gap-2">
                              <Globe size={12} className="text-pharma-green animate-pulse" />
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Verified Fragment</span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">RAG ALPHA v4</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {loading && (
                <div className="flex justify-start py-10">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white border border-slate-100 text-pharma-green flex items-center justify-center shadow-lg">
                      <Bot size={22} className="animate-spin-slow" />
                    </div>
                    <div className="px-10 py-6 rounded-xl rounded-tl-none bg-white border border-slate-50 flex items-center gap-2.5  shadow-slate-200/40">
                      <div className="w-2 h-2 bg-pharma-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-pharma-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-pharma-green rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Interface */}
          <div className="flex-none p-3  bg-transparent relative z-20">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSend} className="relative group">
                <div className="absolute inset-0 bg-pharma-green/5 blur-[50px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative bg-white border border-slate-200 rounded-[3rem] flex items-end shadow-[0_45px_90px_-25px_rgba(0,0,0,0.15)] p-2.5 pr-3 transition-all duration-500 focus-within:border-pharma-green/40 focus-within:shadow-[0_45px_90px_-25px_rgba(53,152,104,0.18)]">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Transmit medical query or symptom log..."
                    className="flex-1 bg-transparent border-none px-4 text-[16px] font-bold text-slate-900 resize-none outline-none placeholder:text-slate-300 max-h-[50px] min-h-[34px] custom-scrollbar overflow-y-auto pt-1"
                    rows={input.split('\n').length > 5 ? 5 : Math.max(1, input.split('\n').length)}
                  />
                  <div className="">
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="h-[30px] w-[30px] flex items-center justify-center bg-slate-950 text-white rounded-[2rem]  text-green-400 hover:bg-green-500 transition-all duration-500  shadow-slate-900/10 active:scale-90 disabled:opacity-10 disabled:scale-95 disabled:grayscale"
                    >
                      <Send size={24} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </form>
              <p className="text-center mt-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] hidden lg:block opacity-70">
                PHARMALOGIC AI ACTIVE <span className="mx-4 opacity-20">|</span> ALWAYS CONSULT DOCTORS FOR OFFICIAL DIAGNOSIS
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
