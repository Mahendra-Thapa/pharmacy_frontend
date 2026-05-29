'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, Edit3, Trash2, AlertTriangle, Save, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdmin } from '@/lib/admin-context';
import { axiosInstance } from '@/utils/axiosSetup';
import { toast } from 'react-hot-toast';

export default function UsersManagementPage() {
  const { users, loading, refresh } = useAdmin();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = users.filter((u: any) => {
    const matchesSearch = (u.username || '').toLowerCase().includes(search.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({ role: user.role, is_active: user.is_active });
    setIsDialogOpen(true);
  };

  const openDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.patch(`/users/${selectedUser.id}/update_status/`, formData);
      toast.success("User updated successfully");
      setIsDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/users/${selectedUser.id}/`);
      toast.success("User account deleted");
      setIsDeleteOpen(false);
      refresh();
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Users...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
       <Card className="rounded-xl  border border-slate-100 overflow-hidden bg-white">
          <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Users size={24} className="text-pharma-blue" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Users</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Accounts & Access Permissions</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <select 
                 className="h-11 px-4 text-xs font-bold rounded-2xl border-white focus:ring-pharma-blue/20 bg-slate-50 text-slate-600 outline-none"
                 value={roleFilter}
                 onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
               >
                 <option value="ALL">All Roles</option>
                 <option value="ADMIN">Admin</option>
                 <option value="POS">POS Agent</option>
                 <option value="USER">User</option>
               </select>
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search Users..." 
                    className="pl-9 w-64 h-11 text-xs font-bold rounded-2xl border-white focus:ring-pharma-blue/20" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
               </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/10 hover:bg-transparent">
                <TableHead className="px-10 py-6 text-[10px] font-bold uppercase text-slate-400">User Identification</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400">Role</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400">Status</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400 text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((u: any) => (
                <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-10 py-6">
                     <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-950 text-sm tracking-tight">{u.username}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <Mail size={12} className="text-pharma-blue" /> {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <ShieldAlert size={12} className={u.is_active ? 'text-emerald-500' : 'text-rose-500'} /> {u.is_active ? 'Account Active' : 'Account Suspended'}
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-lg ${u.role === 'ADMIN' ? 'bg-slate-950 text-white border-transparent' : 'bg-slate-100 border-transparent text-slate-500'}`}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{u.is_active ? 'Active' : 'Offline'}</span>
                     </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" onClick={() => openEdit(u)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-pharma-blue hover:bg-slate-50 transition-all"><Edit3 size={14} /></Button>
                       <Button variant="ghost" onClick={() => openDelete(u)} size="sm" className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
               <Button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} variant="outline" size="sm" className="h-10 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Previous</Button>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
               <Button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} variant="outline" size="sm" className="h-10 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Next</Button>
            </div>
          )}
       </Card>

       {/* EDIT USER DIALOG */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none  bg-white">
             <form onSubmit={handleSubmit}>
                <div className="p-8 bg-slate-950 text-white relative text-center">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-blue/20 blur-3xl"></div>
                   <DialogTitle className="text-xl font-bold tracking-tight italic">Edit User Status</DialogTitle>
                </div>
                
                <div className="p-10 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                      <div className="grid grid-cols-3 gap-4">
                         {['USER', 'POS', 'ADMIN'].map((role) => (
                            <button
                               type="button"
                               key={role}
                               onClick={() => setFormData({...formData, role})}
                               className={`h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest ${formData.role === role ? 'border-pharma-blue bg-pharma-blue/5 text-pharma-blue shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                               <BadgeCheck size={18} /> {role}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4 pt-6 border-t border-slate-50">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account State</label>
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                         <div>
                            <p className="text-xs font-bold text-slate-900">Active Status</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allow user to access the system</p>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                           className={`w-14 h-8 rounded-full relative transition-all ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                         >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.is_active ? 'right-1' : 'left-1 shadow-sm'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-12 px-8 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
                   <Button disabled={submitting} type="submit" className="bg-slate-950 hover:bg-pharma-blue text-white rounded-2xl h-12 px-10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2  shadow-slate-900/20">
                      <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
                   </Button>
                </div>
             </form>
          </DialogContent>
       </Dialog>

       {/* DELETE CONFIRM DIALOG */}
       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-[400px] rounded-[3rem] p-10 border-none  bg-white text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <AlertTriangle size={40} className="animate-pulse" />
             </div>
             <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-950 tracking-tight italic">Delete Account?</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2">
                   Are you sure you want to delete <span className="text-rose-500 font-bold">{selectedUser?.username}</span>? This action cannot be reversed.
                </DialogDescription>
             </DialogHeader>
             <div className="flex flex-col gap-3 mt-10">
                <Button onClick={handleDelete} disabled={submitting} className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest  shadow-rose-200">
                   {submitting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400">
                   Cancel
                </Button>
             </div>
          </DialogContent>
       </Dialog>
    </motion.div>
  );
}
