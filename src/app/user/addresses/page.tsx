'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import {
    Plus,
    Trash2,
    Home,
    Briefcase,
    Globe,
    Edit3,
    Star,
    X,
    Loader2,
    MapPinOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from '@/utils/axiosSetup'
import { toast } from 'react-hot-toast'

interface Address {
    id: number
    label: string
    address_type: 'HOME' | 'OFFICE' | 'OTHER'
    address_line: string
    city: string
    is_default: boolean
    created_at: string
    updated_at: string
}

const TYPE_CONFIG = {
    HOME: { icon: Home, color: 'pharma-blue', label: 'Home' },
    OFFICE: { icon: Briefcase, color: 'pharma-green', label: 'Office' },
    OTHER: { icon: Globe, color: 'pharma-orange', label: 'Other' },
}

const emptyForm = {
    label: '',
    address_type: 'HOME' as 'HOME' | 'OFFICE' | 'OTHER',
    address_line: '',
    city: '',
    is_default: false,
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // Delete dialog states
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null)

    const [form, setForm] = useState(emptyForm)

    const fetchAddresses = useCallback(async () => {
        try {
            const res = await axios.get('/addresses/')
            setAddresses(res.data)
        } catch {
            toast.error('Failed to load addresses')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAddresses()
    }, [fetchAddresses])

    const openAdd = () => {
        setEditingId(null)
        setForm(emptyForm)
        setShowForm(true)
    }

    const openEdit = (addr: Address) => {
        setEditingId(addr.id)

        setForm({
            label: addr.label,
            address_type: addr.address_type,
            address_line: addr.address_line,
            city: addr.city,
            is_default: addr.is_default,
        })

        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
    }

    // Open delete dialog
    const openDeleteDialog = (id: number) => {
        setSelectedDeleteId(id)
        setShowDeleteDialog(true)
    }

    // Close delete dialog
    const closeDeleteDialog = () => {
        setSelectedDeleteId(null)
        setShowDeleteDialog(false)
    }

    const handleSave = async () => {
        if (!form.label.trim() || !form.address_line.trim()) {
            toast.error('Label and address are required')
            return
        }

        setSaving(true)

        try {
            if (editingId) {
                await axios.patch(`/addresses/${editingId}/`, form)
                toast.success('Address updated!')
            } else {
                await axios.post('/addresses/', form)
                toast.success('Address added!')
            }

            closeForm()
            await fetchAddresses()
        } catch {
            toast.error('Failed to save address')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedDeleteId) return

        setDeletingId(selectedDeleteId)

        try {
            await axios.delete(`/addresses/${selectedDeleteId}/`)

            toast.success('Address removed')

            await fetchAddresses()

            closeDeleteDialog()
        } catch {
            toast.error('Failed to delete address')
        } finally {
            setDeletingId(null)
        }
    }

    const handleSetDefault = async (id: number) => {
        try {
            await axios.patch(`/addresses/${id}/set_default/`)

            toast.success('Default address updated')

            await fetchAddresses()
        } catch {
            toast.error('Failed to set default')
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={32} className="animate-spin text-pharma-blue" />

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Loading Addresses
                </p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                        My Addresses
                    </h1>

                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Manage Your Delivery Locations
                    </p>
                </div>

                <Button
                    onClick={openAdd}
                    className="h-12 px-6 bg-pharma-blue hover:bg-pharma-blue/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-pharma-blue/20 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Address
                </Button>
            </header>

            {/* Empty State */}
            {addresses.length === 0 && !showForm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 gap-6"
                >
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 text-slate-300">
                        <MapPinOff size={40} />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            No Saved Addresses
                        </h2>

                        <p className="text-sm text-slate-400 font-medium max-w-sm">
                            Add your first delivery address to speed up checkout
                            and order tracking.
                        </p>
                    </div>

                    <Button
                        onClick={openAdd}
                        className="h-12 px-8 bg-pharma-blue hover:bg-pharma-blue/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-pharma-blue/20"
                    >
                        <Plus size={16} className="mr-2" />
                        Add Your First Address
                    </Button>
                </motion.div>
            )}

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {addresses.map(addr => {
                        const config =
                            TYPE_CONFIG[addr.address_type] ||
                            TYPE_CONFIG.OTHER

                        const Icon = config.icon

                        return (
                            <motion.div
                                key={addr.id}
                                layout
                                initial={{
                                    opacity: 0,
                                    scale: 0.95,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            >
                                <Card
                                    className={`group relative rounded-xl border-2 p-8 transition-all duration-500 overflow-hidden ${
                                        addr.is_default
                                            ? 'border-pharma-blue bg-white shadow-2xl shadow-pharma-blue/10'
                                            : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'
                                    }`}
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between mb-8">
                                        <div
                                            className={`p-4 rounded-2xl ${
                                                addr.is_default
                                                    ? 'bg-pharma-blue text-white'
                                                    : 'bg-slate-50 text-slate-400'
                                            }`}
                                        >
                                            <Icon size={24} />
                                        </div>

                                        {addr.is_default && (
                                            <span className="text-[9px] font-black uppercase text-pharma-blue bg-pharma-blue/10 px-3 py-1 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                            {addr.label}
                                        </h3>

                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                            {addr.address_line}
                                        </p>

                                        {addr.city && (
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                {addr.city}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-50">
                                        <button
                                            onClick={() => openEdit(addr)}
                                            className="text-[10px] font-black uppercase text-pharma-blue hover:underline flex items-center gap-1"
                                        >
                                            <Edit3 size={12} />
                                            Edit
                                        </button>

                                        {!addr.is_default && (
                                            <button
                                                onClick={() =>
                                                    handleSetDefault(addr.id)
                                                }
                                                className="text-[10px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1"
                                            >
                                                <Star size={12} />
                                                Set Default
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                openDeleteDialog(addr.id)
                                            }
                                            disabled={deletingId === addr.id}
                                            className="text-[10px] font-black uppercase text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 ml-auto disabled:opacity-30"
                                        >
                                            {deletingId === addr.id ? (
                                                <Loader2
                                                    size={12}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2 size={12} />
                                            )}

                                            Remove
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeForm()
                        }}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                y: 30,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                            }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-8 pb-0">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {editingId
                                            ? 'Edit Address'
                                            : 'New Address'}
                                    </h2>

                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                                        {editingId
                                            ? 'Update delivery location details'
                                            : 'Add a new delivery destination'}
                                    </p>
                                </div>

                                <button
                                    onClick={closeForm}
                                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                {/* Address Type */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        Type
                                    </Label>

                                    <div className="flex gap-3">
                                        {(
                                            [
                                                'HOME',
                                                'OFFICE',
                                                'OTHER',
                                            ] as const
                                        ).map(type => {
                                            const cfg = TYPE_CONFIG[type]
                                            const Icon = cfg.icon

                                            const isActive =
                                                form.address_type === type

                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        setForm(f => ({
                                                            ...f,
                                                            address_type: type,
                                                        }))
                                                    }
                                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                        isActive
                                                            ? 'border-pharma-blue bg-pharma-blue/5 shadow-inner'
                                                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <Icon
                                                        size={20}
                                                        className={
                                                            isActive
                                                                ? 'text-pharma-blue'
                                                                : 'text-slate-400'
                                                        }
                                                    />

                                                    <span
                                                        className={`text-[10px] font-black uppercase tracking-widest ${
                                                            isActive
                                                                ? 'text-pharma-blue'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        Label
                                    </Label>

                                    <Input
                                        value={form.label}
                                        onChange={e =>
                                            setForm(f => ({
                                                ...f,
                                                label: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. My Home"
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        Full Address
                                    </Label>

                                    <textarea
                                        value={form.address_line}
                                        onChange={e =>
                                            setForm(f => ({
                                                ...f,
                                                address_line: e.target.value,
                                            }))
                                        }
                                        placeholder="Street, Building, Landmark..."
                                        rows={3}
                                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 font-bold p-4 text-sm resize-none focus:border-pharma-blue focus:ring-2 focus:ring-pharma-blue/10 focus:outline-none transition"
                                    />
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        City
                                    </Label>

                                    <Input
                                        value={form.city}
                                        onChange={e =>
                                            setForm(f => ({
                                                ...f,
                                                city: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. Kathmandu"
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    />
                                </div>

                                {/* Default Toggle */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm(f => ({
                                            ...f,
                                            is_default: !f.is_default,
                                        }))
                                    }
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                                        form.is_default
                                            ? 'border-amber-400 bg-amber-50'
                                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Star
                                            size={18}
                                            className={
                                                form.is_default
                                                    ? 'text-amber-500 fill-amber-500'
                                                    : 'text-slate-400'
                                            }
                                        />

                                        <span
                                            className={`text-[10px] font-black uppercase tracking-widest ${
                                                form.is_default
                                                    ? 'text-amber-600'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            Set as Default Address
                                        </span>
                                    </div>

                                    <div
                                        className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center ${
                                            form.is_default
                                                ? 'bg-amber-400 justify-end'
                                                : 'bg-slate-200 justify-start'
                                        }`}
                                    >
                                        <div className="w-5 h-5 bg-white rounded-full shadow-md mx-0.5" />
                                    </div>
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="p-8 pt-0 flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={closeForm}
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-pharma-blue text-white font-black uppercase tracking-widest text-[10px]"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </span>
                                    ) : editingId ? (
                                        'Update Address'
                                    ) : (
                                        'Save Address'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AnimatePresence>
                {showDeleteDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
                        onClick={(e) => {
                            if (e.target === e.currentTarget)
                                closeDeleteDialog()
                        }}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                y: 20,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                            }}
                            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">
                                        Delete Address
                                    </h2>

                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                                        This action cannot be undone
                                    </p>
                                </div>

                                <button
                                    onClick={closeDeleteDialog}
                                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5">
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                    Are you sure you want to remove this
                                    address from your account?
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={closeDeleteDialog}
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleDelete}
                                    disabled={deletingId !== null}
                                    className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px]"
                                >
                                    {deletingId !== null ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Removing...
                                        </span>
                                    ) : (
                                        'Delete Address'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}