'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Search, Trash2, Edit, Save, PlusCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/admin-context';
import { axiosInstance } from '@/utils/axiosSetup';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const { categories, inventory, loading, refresh } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = categories.filter((c: any) => 
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const rootCats = filtered.filter((c: any) => !c.parent);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(rootCats.length / itemsPerPage);

  const openAdd = () => {
    setSelectedCat(null);
    setFormData({ name: '', description: '', parent: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setSelectedCat(cat);
    setFormData({ 
      ...cat, 
      parent: cat.parent || '',
      description: cat.description ?? '',
      name: cat.name ?? '',
    });
    setIsDialogOpen(true);
  };

  const openDelete = (cat: any) => {
    setSelectedCat(cat);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.parent) delete payload.parent;

      if (selectedCat) {
        await axiosInstance.patch(`/categories/${selectedCat.id}/`, payload);
        toast.success("Category updated");
      } else {
        await axiosInstance.post(`/categories/`, payload);
        toast.success("Category added");
      }
      setIsDialogOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/categories/${selectedCat.id}/`);
      toast.success("Category deleted");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Categories...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
       <Card className="rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden bg-white">
          <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <LayoutGrid size={24} className="text-indigo-500" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Categories</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Medicine Classifications</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search Categories..." 
                    className="pl-9 w-64 h-11 text-xs font-bold rounded-2xl border-white focus:ring-indigo-500/20" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
               </div>
               <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <PlusCircle size={14} /> Add Category
               </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/10 hover:bg-transparent">
                <TableHead className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Name</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Type</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Product Count</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400 text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const paginatedRoots = rootCats.slice((page - 1) * itemsPerPage, page * itemsPerPage);
                const allChildren = categories.filter((c: any) => c.parent);
                
                return paginatedRoots.map((root: any) => (
                  <React.Fragment key={root.id}>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-indigo-500" />
                           <span className="font-black text-slate-950 text-sm tracking-tight">{root.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 uppercase tracking-widest">
                          Main Category
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-500">
                          {inventory.filter((i:any) => i.category === root.id).length} Items
                        </span>
                      </TableCell>
                      <TableCell className="px-10 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" onClick={() => openEdit(root)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"><Edit size={14} /></Button>
                           <Button variant="ghost" onClick={() => openDelete(root)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {allChildren.filter((child: any) => child.parent === root.id).map((child: any) => (
                      <TableRow key={child.id} className="group hover:bg-slate-50/50 transition-colors border-l-4 border-l-slate-100">
                        <TableCell className="pl-16 py-4">
                          <span className="font-bold text-slate-700 text-sm tracking-tight flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                             {child.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-black bg-slate-100 border-transparent px-3 py-1 uppercase tracking-widest text-slate-500">
                            Sub Category
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-400 italic">
                            {inventory.filter((i:any) => i.category === child.id).length} Items
                          </span>
                        </TableCell>
                        <TableCell className="px-10 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button variant="ghost" onClick={() => openEdit(child)} size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"><Edit size={12} /></Button>
                             <Button variant="ghost" onClick={() => openDelete(child)} size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={12} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ));
              })()}
            </TableBody>
          </ Table>

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
          <DialogContent className="max-w-xl max-h-[90vh] rounded-[3rem] p-0 overflow-y-scroll border-none shadow-3xl bg-white flex flex-col">
             <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-8 bg-slate-950 text-white relative text-center shrink-0">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl"></div>
                   <DialogTitle className="text-xl font-black tracking-tight">{selectedCat ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </div>
                
                <div className="p-10 space-y-6 overflow-y-scroll custom-scrollbar flex-1">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Antibiotics" className="h-12 rounded-2xl border-slate-100 font-bold" required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Category (Optional)</label>
                      <select value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} className="w-full h-12 rounded-2xl border border-slate-100 bg-white px-4 text-sm font-bold outline-none">
                         <option value="">No Parent (Root Category)</option>
                         {categories.filter((c:any) => c.id !== selectedCat?.id && !c.parent).map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-32 p-6 rounded-3xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 ring-indigo-500/10 resize-none transition-all" placeholder="Describe this category..." />
                   </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                   <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                   <Button disabled={submitting} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-200">
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
                <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight italic">Delete Category?</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2">
                   Are you sure you want to delete <span className="text-rose-500">{selectedCat?.name}</span>? This will affect all medicines in this branch.
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
