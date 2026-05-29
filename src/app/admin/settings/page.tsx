'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, User } from 'lucide-react';

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

/* ---------------- Schema ---------------- */
const settingsSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  gst_number: z.string().optional(),
});

export default function SettingsPage() {
  const { pharmacySettings, loading, refresh } = useAdmin();

  const [updating, setUpdating] = useState(false);
  const [pwUpdating, setPwUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [pwForm, setPwForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    values: pharmacySettings || {},
  });

  /* ---------------- Profile Update ---------------- */
  const onSubmit = async (data: any) => {
    setUpdating(true);
    try {
      if (pharmacySettings?.id) {
        await axiosInstance.patch(
          `/pharmacy-settings/${pharmacySettings.id}/`,
          data
        );
      } else {
        await axiosInstance.post(`/pharmacy-settings/`, data);
      }

      toast.success('Profile updated');
      await refresh();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- Password Update ---------------- */
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pwForm.current) return toast.error('Current password required');
    if (pwForm.new.length < 6)
      return toast.error('Password must be at least 6 chars');
    if (pwForm.new !== pwForm.confirm)
      return toast.error('Passwords do not match');

    setPwUpdating(true);

    try {
      await axiosInstance.patch('/users/me/', {
        current_password: pwForm.current,
        password: pwForm.new,
      });

      toast.success('Password updated');

      setPwForm({ current: '', new: '', confirm: '' });
    } catch {
      toast.error('Password update failed');
    } finally {
      setPwUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 p-4"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
          <Settings className="text-white w-5 h-5" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage profile & security
          </p>
        </div>
      </div>

      {/* TOGGLE TABS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'profile'
              ? 'bg-white shadow text-slate-900'
              : 'text-slate-500'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'password'
              ? 'bg-white shadow text-slate-900'
              : 'text-slate-500'
          }`}
        >
          <Lock className="w-4 h-4" />
          Password
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <Card className="p-6 rounded-2xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-red-500">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register('email')} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register('phone')} />
              </div>

              <div className="space-y-2">
                <Label>GST</Label>
                <Input {...register('gst_number')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <textarea
                {...register('address')}
                className="w-full border rounded-xl p-3 min-h-[120px]"
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={updating}>
                {updating ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>

          </form>
        </Card>
      )}

      {/* PASSWORD TAB */}
      {activeTab === 'password' && (
        <Card className="p-6 rounded-2xl space-y-4">
          <form onSubmit={handlePasswordUpdate} className="space-y-4">

            <div className="space-y-2">
              <Label>Current Password</Label>
              <PasswordInput
                value={pwForm.current}
                onChange={(e) =>
                  setPwForm({ ...pwForm, current: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput
                value={pwForm.new}
                onChange={(e) =>
                  setPwForm({ ...pwForm, new: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <PasswordInput
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirm: e.target.value })
                }
              />

              {pwForm.confirm &&
                pwForm.new !== pwForm.confirm && (
                  <p className="text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}

              {pwForm.confirm &&
                pwForm.new === pwForm.confirm &&
                pwForm.new && (
                  <p className="text-xs text-green-600">
                    Passwords match ✓
                  </p>
                )}
            </div>

            <div className="flex justify-end">
              <Button disabled={pwUpdating}>
                {pwUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </div>

          </form>
        </Card>
      )}
    </motion.div>
  );
}