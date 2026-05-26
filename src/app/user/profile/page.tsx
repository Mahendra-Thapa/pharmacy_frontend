'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axios from '@/utils/axiosSetup'
import { toast } from 'react-hot-toast'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileInput } from "@/lib/schemas";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [user, reset])

    const onUpdate = async (data: ProfileInput) => {
        setLoading(true)
        try {
            await axios.patch('/users/me/', data)
            toast.success("Profile Core Synchronized!")
            await refreshUser()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update Rejected by System")
        } finally {
            setLoading(false)
        }
    }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">My Profile</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Personal Identification & Details</p>
        </header>

        <Card className="rounded-[2.5rem] border-transparent shadow-xl bg-white overflow-hidden p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username (Immutable)</Label>
                        <Input disabled value={user?.username || ''} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Stream</Label>
                        <Input
                            {...register("email")}
                            disabled
                            className={`h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold ${errors.email ? 'border-rose-500' : ''}`} 
                        />
                        {errors.email && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.email.message}</p>}
                    </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Nomenclature</Label>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <Input 
                                    {...register("first_name")}
                                    placeholder="First" 
                                    className={`h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold ${errors.first_name ? 'border-rose-500' : ''}`} 
                                />
                                {errors.first_name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.first_name.message}</p>}
                            </div>
                            <div className="flex-1 space-y-1">
                                <Input 
                                    {...register("last_name")}
                                    placeholder="Last" 
                                    className={`h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold ${errors.last_name ? 'border-rose-500' : ''}`} 
                                />
                                {errors.last_name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.last_name.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Contact (Verified)</Label>
                        <Input 
                            {...register("phone")}
                            placeholder="+XX XXXXXXXX"
                            className={`h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold ${errors.phone ? 'border-rose-500' : ''}`} 
                        />
                        {errors.phone && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.phone.message}</p>}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center">
                <div className="h-14 rounded-2xl bg-pharma-blue/5 border border-pharma-blue/10 flex items-center px-6 font-black text-pharma-blue text-xs uppercase tracking-widest">
                    {user?.role} Access Authorized
                </div>
                <Button 
                    onClick={handleSubmit(onUpdate)}
                    disabled={loading}
                    className="h-14 px-10 bg-slate-900 hover:bg-pharma-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                    {loading ? "Processing..." : "Update Profile Core"}
                </Button>
            </div>
        </Card>
    </motion.div>
  )
}
