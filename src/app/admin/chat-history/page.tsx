'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MessageSquare, Bot, Users, Search, ChevronRight, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/lib/admin-context';

export default function AdminChatHistoryPage() {
  const { users, loading } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<any>(null);
  const [userSearch, setUserSearch] = useState("");
  
  // Pagination for Users List
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  
  const filteredUsers = users.filter((u: any) => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const fetchHistory = async (uid: any) => {
    try {
      const res = await fetch(`http://localhost:5001/api/ai/chat-history/${uid}`);
      const data = await res.json();
      processHistory(data);
    } catch (e) {
      console.error("Archive Retrieval Fail");
      setHistorySessions([]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchHistory(selectedUser.id);
      setCurrentChatSession(null);
    }
  }, [selectedUser]);

  const processHistory = (data: any[]) => {
      const sessionsMap: Record<string, any[]> = {};
      let counter = 0;
      data.forEach((m: any) => {
         let sid = m.session_id || 'default_session';
         if (sid === 'default_session') {
            if (m.role === 'user') counter++;
            sid = `session_${counter}`;
         }
         if (!sessionsMap[sid]) sessionsMap[sid] = [];
         sessionsMap[sid].push({ role: m.role, text: m.message });
      });

      const parsed = Object.keys(sessionsMap).map(sid => {
         const first = sessionsMap[sid].find(m => m.role === 'user');
         return { sessionId: sid, title: first ? first.text : 'Medical Query', msgs: sessionsMap[sid] };
      }).reverse();
      setHistorySessions(parsed);
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing AI Archive...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col xl:flex-row gap-8 min-h-[750px]">
        
        {/* User Selection Sidebar */}
        <div className="w-full xl:w-[350px] space-y-4">
           <Card className="rounded-[3rem] border-transparent shadow-xl p-8 bg-white h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <Users className="text-pharma-blue" size={20} />
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Analysts</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Patient Profile</p>
                </div>
              </div>

              <div className="relative mb-6">
                 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <Input 
                   value={userSearch}
                   onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                   placeholder="Search ID/Email..." 
                   className="pl-10 h-11 bg-slate-50 border-transparent rounded-2xl text-[11px] font-bold" 
                 />
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {paginatedUsers.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left border-2 ${selectedUser?.id === u.id ? 'bg-pharma-blue border-pharma-blue text-white' : 'bg-white border-slate-50 hover:border-pharma-blue/20'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedUser?.id === u.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                       <UserIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[12px] font-black truncate">{u.username}</p>
                       <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedUser?.id === u.id ? 'text-white/60' : 'text-slate-400'}`}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>

              {totalUserPages > 1 && (
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <Button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage === 1} size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest">Back</Button>
                   <span className="text-[9px] font-black text-slate-300 uppercase">Page {userPage} / {totalUserPages}</span>
                   <Button onClick={() => setUserPage(p => Math.min(totalUserPages, p+1))} disabled={userPage === totalUserPages} size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest">Next</Button>
                </div>
              )}
           </Card>
        </div>

        {/* Sessions Sidebar */}
        <div className="w-full xl:w-[350px] space-y-4">
           <Card className="rounded-[3rem] border-transparent shadow-xl p-8 bg-white h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 shrink-0">
                <History className="text-pharma-green" size={20} />
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Temporal Nodes</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Session History</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {!selectedUser ? (
                  <div className="py-20 text-center flex flex-col items-center opacity-30 mt-10">
                     <Users size={30} className="mb-4 text-slate-300" />
                     <p className="text-[9px] font-black uppercase tracking-[0.2em]">Select an analyst to retrieve logs</p>
                  </div>
                ) : historySessions.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center opacity-30 mt-10">
                     <History size={30} className="mb-4 text-slate-300" />
                     <p className="text-[9px] font-black uppercase tracking-[0.2em]">{selectedUser.username} has no active archives</p>
                  </div>
                ) : (
                  historySessions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentChatSession(s)}
                      className={`w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all text-left border-2 group ${currentChatSession?.sessionId === s.sessionId ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}
                    >
                      <MessageSquare size={16} className={currentChatSession?.sessionId === s.sessionId ? 'text-pharma-blue' : 'text-slate-300 group-hover:text-pharma-blue transition-colors'} />
                      <div className="flex-1 min-w-0">
                         <span className={`text-[11px] font-black truncate block uppercase tracking-tight ${currentChatSession?.sessionId === s.sessionId ? 'text-white' : 'text-slate-600'}`}>{s.title}</span>
                         <span className="text-[8px] font-bold opacity-40 block mt-0.5 uppercase">{s.msgs.length} LOGS</span>
                      </div>
                      <ChevronRight size={14} className={currentChatSession?.sessionId === s.sessionId ? 'text-pharma-blue' : 'text-slate-200'} />
                    </button>
                  ))
                )}
              </div>
           </Card>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-white rounded-[4rem] shadow-2xl border border-white p-10 flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-pharma-blue/5 blur-[120px] rounded-full"></div>
           {!currentChatSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                 <Bot size={80} className="mb-8 text-slate-300 animate-pulse" />
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Select a node to reconstruct</h4>
                 <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Temporal diagnostic archive is encrypted and ready</p>
              </div>
           ) : (
              <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                 <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-950 tracking-tighter leading-none mb-2 line-clamp-1 italic">{currentChatSession.title}</h3>
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-pharma-blue/10 text-pharma-blue text-[9px] font-black rounded-lg uppercase tracking-widest">Active Focus: {selectedUser.username}</span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">{currentChatSession.sessionId}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setCurrentChatSession(null)} className="rounded-2xl h-12 px-6 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
                       Disconnect Node
                    </Button>
                 </div>

                 <div className="flex-1 overflow-y-auto space-y-8 pr-6 custom-scrollbar">
                    {currentChatSession.msgs.map((m:any, idx:number) => (
                       <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-6 rounded-[2.5rem] shadow-sm ${m.role === 'user' ? 'bg-slate-950 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                             <div className="flex items-center gap-2 mb-3 opacity-40">
                                {m.role === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">{m.role === 'user' ? selectedUser.username.split('_')[0] : 'Neural Logic'}</span>
                             </div>
                             <p className="text-[14px] font-bold tracking-tight leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
