'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, Trash2, AlertTriangle, RefreshCcw, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/admin-context';
import { axiosInstance } from '@/utils/axiosSetup';
import { toast } from 'react-hot-toast';

export default function TransactionsPage() {
  const { transactions, loading, refresh } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  // Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = transactions.filter((tx: any) => 
    (tx.transaction_id || '').toLowerCase().includes(search.toLowerCase()) || 
    (tx.method || '').toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openDelete = (tx: any) => {
    setSelectedTx(tx);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/payment-transactions/${selectedTx.id}/`);
      toast.success("Transaction deleted");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Ledger...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
       <Card className="rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden bg-white">
          <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <CreditCard size={24} className="text-emerald-500" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Transactions</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Payment Logs & Financial Records</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search Transaction ID..." 
                    className="pl-9 w-64 h-11 text-xs font-bold rounded-2xl border-white focus:ring-emerald-500/20" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
               </div>
               <Button onClick={refresh} variant="outline" className="h-11 px-4 rounded-2xl border-white text-slate-400 hover:text-emerald-500">
                  <RefreshCcw size={18} />
               </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/10 hover:bg-transparent">
                <TableHead className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Transaction Details</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Payment Method</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Amount</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((tx: any) => (
                <TableRow key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-10 py-6">
                    <div className="flex flex-col gap-1">
                       <span className="font-black text-slate-950 text-sm tracking-tight">{tx.transaction_id || 'LOCAL-TXN'}</span>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Clock size={12} /> {new Date(tx.timestamp).toLocaleString()}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black bg-slate-100 border-transparent px-3 py-1 uppercase tracking-widest text-slate-500">
                      {tx.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-black text-emerald-600">Rs. {tx.amount}</span>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <CheckCircle size={14} className={tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-orange-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{tx.status}</span>
                     </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                     <Button variant="ghost" onClick={() => openDelete(tx)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                        <Trash2 size={16} />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
               <Button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} variant="outline" size="sm" className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest">Previous</Button>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
               <Button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} variant="outline" size="sm" className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest">Next</Button>
            </div>
          )}
       </Card>

       {/* DELETE CONFIRM DIALOG */}
       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-[400px] rounded-[3rem] p-10 border-none shadow-3xl bg-white text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertTriangle size={40} className="animate-pulse" />
             </div>
             <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight italic">Delete Record?</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2">
                   Are you sure you want to delete transaction <span className="text-rose-500 font-black">{selectedTx?.transaction_id || selectedTx?.id}</span>? History cannot be restored.
                </DialogDescription>
             </DialogHeader>
             <div className="flex flex-col gap-3 mt-10">
                <Button onClick={handleDelete} disabled={submitting} className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200">
                   {submitting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                   Cancel
                </Button>
             </div>
          </DialogContent>
       </Dialog>
    </motion.div>
  );
}
