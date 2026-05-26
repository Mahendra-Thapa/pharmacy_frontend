'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Globe, Check, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/PasswordInput';
import { useAdmin } from '@/lib/admin-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/utils/axiosSetup';

const settingsSchema = z.object({
  name: z.string().min(2, "Identifier too short"),
  email: z.string().email("Invalid communication vector"),
  phone: z.string().min(10, "Invalid connection sequence"),
  address: z.string().min(5, "Insufficient coordinates"),
  gst_number: z.string().optional(),
});

export default function SettingsPage() {
  const { pharmacySettings, loading, setPharmacySettings, refresh } = useAdmin();
  const [updating, setUpdating] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwUpdating, setPwUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    values: pharmacySettings || {}
  });

  const onSubmit = async (data: any) => {
    setUpdating(true);
    try {
      if (pharmacySettings?.id) {
        // Update existing
        await axiosInstance.patch(`/pharmacy-settings/${pharmacySettings.id}/`, data);
      } else {
        // Create new
        await axiosInstance.post(`/pharmacy-settings/`, data);
      }
      
      toast.success("Global Protocol Synchronized");
      await refresh(); // Sync full state from backend
    } catch (err) {
      toast.error("Protocol Sync Failure");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current.trim()) return toast.error("Current password is required");
    if (pwForm.new.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwForm.new !== pwForm.confirm) return toast.error("Passwords do not match");
    setPwUpdating(true);
    try {
      await axiosInstance.patch('/users/me/', {
        current_password: pwForm.current,
        password: pwForm.new,
      });
      toast.success("Password updated successfully");
      setPwForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Password update failed");
    } finally {
      setPwUpdating(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-10">
       <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
             <Settings size={32} className="text-pharma-blue animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
             <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none">Global Protocol</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Core System Configuration & Authority Parameters</p>
          </div>
       </div>

       {/* Pharmacy Settings */}
       <Card className="rounded-xl shadow-3xl border border-slate-100 overflow-hidden bg-white/80 backdrop-blur-3xl p-12 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pharma-blue/5 blur-[100px] rounded-full"></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Identifier</Label>
                   <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <Input {...register('name')} className="pl-14 h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white text-sm font-bold transition-all" />
                   </div>
                   {errors.name && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">{errors.name.message as string}</p>}
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Vector (Email)</Label>
                   <div className="relative">
                      <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <Input {...register('email')} className="pl-14 h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white text-sm font-bold transition-all" />
                   </div>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connection Sequence (Contact)</Label>
                   <Input {...register('phone')} className="h-14 px-8 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white text-sm font-bold transition-all" />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Identity (GSTIN)</Label>
                   <Input {...register('gst_number')} className="h-14 px-8 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white text-sm font-bold transition-all" placeholder="Optional" />
                </div>
             </div>
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinates (Address)</Label>
                <textarea
                  {...register('address')}
                  rows={4}
                  className="w-full rounded-3xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-pharma-blue/20 p-8 text-sm font-bold outline-none transition-all resize-none"
                />
             </div>
             <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-emerald-500">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Check size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">System Integrity Verified</span>
                </div>
                <Button disabled={updating} type="submit" className="h-14 px-12 bg-slate-950 hover:bg-pharma-blue text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-slate-900/20">
                   {updating ? 'Transmitting...' : 'Synchronize Protocol'}
                </Button>
             </div>
          </form>
       </Card>

       {/* Change Password Card */}
       <Card className="rounded-xl shadow-3xl border border-slate-100 overflow-hidden bg-white p-0">
          <div className="p-8 bg-slate-950 relative overflow-hidden rounded-t-[4rem]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pharma-green/10 blur-[60px] rounded-full" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-pharma-green/20 rounded-2xl flex items-center justify-center border border-pharma-green/30">
                <Lock size={20} className="text-pharma-green" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tighter uppercase">Update Password</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Admin Account · Credential Management</p>
              </div>
            </div>
          </div>
          <form onSubmit={handlePasswordUpdate} className="p-12 space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</Label>
              <PasswordInput
                value={pwForm.current}
                onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                placeholder="Enter your current password"
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                required
              />
            </div>
            <div className="h-px bg-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                <PasswordInput
                  value={pwForm.new}
                  onChange={e => setPwForm({ ...pwForm, new: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className={`text-[10px] font-black uppercase tracking-widest ${
                  pwForm.confirm && pwForm.new !== pwForm.confirm ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  Confirm Password
                </Label>
                <PasswordInput
                  value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  className={`h-14 rounded-2xl font-bold ${
                    pwForm.confirm && pwForm.new !== pwForm.confirm
                      ? 'border-rose-300 bg-rose-50'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                  required
                />
                {pwForm.confirm && pwForm.new !== pwForm.confirm && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Passwords do not match</p>
                )}
                {pwForm.confirm && pwForm.new === pwForm.confirm && pwForm.new && (
                  <p className="text-[10px] font-black text-pharma-green uppercase tracking-widest">✓ Passwords match</p>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-end">
              <Button
                disabled={pwUpdating}
                type="submit"
                className="h-14 px-12 bg-slate-950 hover:bg-pharma-green text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
              >
                {pwUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
       </Card>
    </motion.div>
  );
}
