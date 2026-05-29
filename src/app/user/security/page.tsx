'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import axios from '@/utils/axiosSetup'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, PasswordInput as PwdInput } from "@/lib/schemas";

export default function SecurityPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PwdInput>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { current: '', new: '', confirm: '' }
    })
    const [loading, setLoading] = useState(false)

    const onUpdate = async (data: PwdInput) => {
        setLoading(true)
        try {
            await axios.patch('/users/me/', {
                current_password: data.current,
                password: data.new
            })
            toast.success("Security keys rotated successfully")
            reset()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Protocol update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-2">Security</h1>
                <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Credentials Management</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="lg:col-span-2 rounded-xl border-transparent  bg-white p-8 lg:p-12">
                    <form onSubmit={handleSubmit(onUpdate)} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Current Password</Label>
                                <PasswordInput
                                    placeholder="Enter current password"
                                    {...register("current")}
                                    className={`h-14 rounded-sm bg-slate-50 ${errors.current ? 'border-rose-500' : ''}`}
                                />
                                {errors.current && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.current.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">New Password</Label>
                                    <PasswordInput
                                        placeholder="New password"
                                        {...register("new")}
                                        className={`h-14 rounded-sm bg-slate-50 ${errors.new ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.new && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.new.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Confirm Password</Label>
                                    <PasswordInput
                                        placeholder="Confirm password"
                                        {...register("confirm")}
                                        className={`h-14 rounded-sm bg-slate-50 ${errors.confirm ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.confirm && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.confirm.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-50 pt-8 mt-8">
                            <Button disabled={loading} type="submit" className="h-14 px-12 bg-slate-900 hover:bg-pharma-blue text-white rounded-sm font-bold uppercase tracking-widest  transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </motion.div>
    )
}
