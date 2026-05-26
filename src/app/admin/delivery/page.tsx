'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, PlusCircle, Edit3, Trash2, AlertTriangle, Save, Search, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/admin-context';
import { axiosInstance } from '@/utils/axiosSetup';
import { toast } from 'react-hot-toast';

export default function DeliveryManagementPage() {
  const { deliveryOptions, loading, refresh } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = deliveryOptions.filter((d: any) => 
    (d.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openAdd = () => {
    setSelectedZone(null);
    setFormData({ name: '', price: 0, estimated_days: 1 });
    setIsDialogOpen(true);
  };

  const openEdit = (zone: any) => {
    setSelectedZone(zone);
    setFormData({ ...zone });
    setIsDialogOpen(true);
  };

  const openDelete = (zone: any) => {
    setSelectedZone(zone);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedZone) {
        await axiosInstance.patch(`/delivery-options/${selectedZone.id}/`, formData);
        toast.success("Delivery zone updated");
      } else {
        await axiosInstance.post(`/delivery-options/`, formData);
        toast.success("Delivery zone added");
      }
      setIsDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to save zone");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/delivery-options/${selectedZone.id}/`);
      toast.success("Delivery zone deleted");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Delivery Matrix...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
       <Card className="rounded-xl shadow-2xl border border-slate-100 overflow-hidden bg-white">
          <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Truck size={24} className="text-pharma-blue" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Delivery</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Delivery Zones & Pricing</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search Zones..." 
                    className="pl-9 w-64 h-11 text-xs font-bold rounded-2xl border-white focus:ring-pharma-blue/20" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
               </div>
               <Button onClick={openAdd} className="bg-slate-950 hover:bg-pharma-blue text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/10">
                  <PlusCircle size={14} /> Add Zone
               </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/10 hover:bg-transparent">
                <TableHead className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Zone Name</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Delivery Price</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Estimated Days</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((zone: any) => (
                <TableRow key={zone.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-10 py-6">
                    <div className="flex items-center gap-3">
                       <MapPin size={16} className="text-pharma-blue" />
                       <span className="font-black text-slate-950 text-sm tracking-tight">{zone.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-black text-emerald-600">Rs. {zone.price}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black bg-slate-100 border-transparent px-3 py-1 uppercase tracking-widest text-slate-500">
                      {zone.estimated_days} Days
                    </Badge>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" onClick={() => openEdit(zone)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-pharma-blue hover:bg-slate-50 transition-all"><Edit3 size={14} /></Button>
                       <Button variant="ghost" onClick={() => openDelete(zone)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={14} /></Button>
                    </div>
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

       {/* ADD/EDIT DIALOG */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl bg-white">
             <form onSubmit={handleSubmit}>
                <div className="p-8 bg-slate-950 text-white relative text-center">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-blue/20 blur-3xl"></div>
                   <DialogTitle className="text-xl font-black italic tracking-tight">{selectedZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
                </div>
                
                <div className="p-10 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Zone Name</label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Kathmandu Valley" className="h-12 rounded-2xl border-slate-100 font-bold" required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Price (Rs.)</label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="h-12 rounded-2xl border-slate-100 font-bold" required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Days for Delivery</label>
                      <Input type="number" value={formData.estimated_days} onChange={e => setFormData({...formData, estimated_days: parseInt(e.target.value)})} className="h-12 rounded-2xl border-slate-100 font-bold" required />
                   </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                   <Button disabled={submitting} type="submit" className="bg-slate-950 hover:bg-pharma-blue text-white rounded-2xl h-12 px-10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-slate-900/20">
                      <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
                   </Button>
                </div>
             </form>
          </DialogContent>
       </Dialog>

       {/* DELETE CONFIRM DIALOG */}
       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-[400px] rounded-[3rem] p-10 border-none shadow-3xl bg-white text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertTriangle size={40} className="animate-pulse" />
             </div>
             <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight italic">Delete Zone?</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2">
                   Are you sure you want to delete <span className="text-rose-500 font-black">{selectedZone?.name}</span>? This will affect existing delivery estimations.
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
