"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  PlusCircle,
  Edit3,
  Trash2,
  AlertTriangle,
  Save,
  Filter,
  Activity,
  LayoutGrid,
  CreditCard,
  ShieldAlert,
  ShoppingCart,
  History,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdmin } from "@/lib/admin-context";
import { axiosInstance } from "@/utils/axiosSetup";
import { toast } from "react-hot-toast";

export default function InventoryPage() {
  const { inventory, categories, loading, refresh, refreshInventory } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = inventory.filter(
    (m: any) =>
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.brand || "").toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const openAdd = () => {
    setSelectedMed(null);
    setFormData({
      name: "",
      brand: "",
      category: "",
      stock: 0,
      price: 0,
      reorder_level: 10,
      expiry_date: "",
      image_url: "",
      side_effects: "",
      uses: "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (med: any) => {
    setSelectedMed(med);
    setFormData({ ...med, brand: med.manufacturer || med.brand || "" });
    setIsDialogOpen(true);
  };

  const openDelete = (med: any) => {
    setSelectedMed(med);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Normalize: form uses 'brand' internally but backend expects 'manufacturer'
      const payload = { ...formData, manufacturer: formData.brand || formData.manufacturer || "" };
      if (selectedMed) {
        await axiosInstance.patch(`/medicines/${selectedMed.id}/`, payload);
        toast.success("Medicine updated");
      } else {
        await axiosInstance.post(`/medicines/`, payload);
        toast.success("New medicine added");
      }
      setIsDialogOpen(false);
      await refreshInventory();
    } catch (err: any) {
      const msg = err?.response?.data ? Object.values(err.response.data).flat().join(" ") : "Failed to save changes";
      toast.error(msg as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/medicines/${selectedMed.id}/`);
      toast.success("Medicine deleted");
      setIsDeleteOpen(false);
      await refreshInventory();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        Loading Inventory...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <Card className="rounded-xl  border border-slate-100 overflow-hidden bg-white">
        <div className="p-10 bg-slate-50/50 border-b border-white flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Package size={24} className="text-pharma-green" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">
                Inventory
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Manage Stock & Medicine Catalog
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search Medicine..."
                className="pl-9 w-64 h-11 text-xs font-bold rounded-2xl border-white focus:ring-pharma-green/20"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              onClick={openAdd}
              className="bg-slate-950 hover:bg-pharma-green text-white rounded-xl h-11 px-8 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2  shadow-slate-900/10"
            >
              <PlusCircle size={14} /> Add Medicine
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/10 hover:bg-transparent">
              <TableHead className="px-10 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Product Details
              </TableHead>
              <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Category
              </TableHead>
              <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Stock Level
              </TableHead>
              <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Unit Price
              </TableHead>
              <TableHead className="py-6 text-[10px] font-bold uppercase text-slate-400 text-right px-10 tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((med: any) => (
              <TableRow
                key={med.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="pl-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {med.image_url ? (
                        <img
                          src={med.image_url}
                          alt={med.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={18} className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 text-sm tracking-tight">
                        {med.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {med.brand || "Generic"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-slate-100 text-slate-500 px-3 py-1 uppercase tracking-widest rounded-lg"
                  >
                    {med.category_name || "Unlinked"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-bold ${med.stock < 10 ? "text-rose-500" : "text-slate-900"}`}
                    >
                      {med.stock} Units
                    </span>
                    <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${med.stock < 10 ? "bg-rose-500" : "bg-pharma-green"}`}
                        style={{ width: `${Math.min(med.stock, 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    Rs. {med.price}
                  </span>
                </TableCell>
                <TableCell className="px-10 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(med)}
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-pharma-blue hover:bg-slate-50 transition-all"
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => openDelete(med)}
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="h-10 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-100 font-bold"
            >
              Previous
            </Button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              className="h-10 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-100 font-bold"
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-scroll rounded-xl p-0  border-none  bg-white flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full ">
            {/* Fixed Diagnostic Header */}
            <div className="p-8 bg-slate-950 text-white relative shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-pharma-green/10 blur-[80px]"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold italic tracking-tight">
                    {selectedMed
                      ? "Update Medicine Logic"
                      : "Provision New Medicine"}
                  </DialogTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                    <Activity size={12} className="text-pharma-green" />{" "}
                    Inventory Management Protocol
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Save size={20} className="text-pharma-green" />
                </div>
              </div>
            </div>

            {/* Scrollable Data Matrix */}
            <div className="p-10 space-y-10 overflow-y-scroll custom-scrollbar flex-1 bg-slate-50/10">
              {/* 1. Primary Classification */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pharma-green pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Primary Classification
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Package size={12} className="text-slate-400" /> Trade
                      Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Paracetamol 500mg"
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-green/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Activity size={12} className="text-slate-400" />{" "}
                      Manufacturer / Brand
                    </label>
                    <Input
                      value={formData.brand}
                      onChange={e =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="e.g. Cipla Pharma"
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <LayoutGrid size={12} className="text-slate-400" />{" "}
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full h-12 rounded-2xl border border-slate-100 bg-white px-4 text-sm font-bold outline-none shadow-sm"
                      required
                    >
                      <option value="">Choose Classification</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <CreditCard size={12} className="text-slate-400" /> Unit
                      Price (NPR)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-green/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Stock & Expiry Logistics */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pharma-blue pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Stock & Expiry Logistics
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <ShoppingCart size={12} className="text-slate-400" />{" "}
                      Inventory Qty
                    </label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-blue/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <ShieldAlert size={12} className="text-slate-400" />{" "}
                      Reorder Level
                    </label>
                    <Input
                      type="number"
                      value={formData.reorder_level}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          reorder_level: parseInt(e.target.value),
                        })
                      }
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <History size={12} className="text-slate-400" /> Shelf
                      Life (Expiry)
                    </label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          expiry_date: e.target.value,
                        })
                      }
                      className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm focus:ring-pharma-blue/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Therapeutic Audit */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-slate-900 pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Therapeutic Audit
                  </span>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <PlusCircle size={12} className="text-slate-400" /> Asset
                      Synchronization (Image)
                    </label>
                    <div className="flex gap-4">
                      <Input
                        value={formData.image_url}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            image_url: e.target.value,
                          })
                        }
                        placeholder="URL or Upload Visual Asset"
                        className="h-12 rounded-2xl border-slate-100 bg-white font-bold shadow-sm flex-1"
                      />
                      <label className="shrink-0">
                        <input
                          type="file"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const t = toast.loading(
                              "Syncing Binary to Cloud...",
                            );
                            const d = new FormData();
                            d.append("file", file);
                            try {
                              const res = await axiosInstance.post(
                                "/upload/",
                                d,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                },
                              );
                              setFormData({
                                ...formData,
                                image_url: res.data.secure_url,
                              });
                              toast.success("Success", { id: t });
                            } catch (err) {
                              toast.error("Bridge Error", { id: t });
                            }
                          }}
                        />
                        <div className="h-12 px-8 rounded-2xl border-2 border-dashed border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center cursor-pointer hover:border-slate-950 transition-all bg-white hover:bg-slate-50 shadow-sm">
                          Upload Asset
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Activity size={12} className="text-slate-400" /> Clinical
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full h-24 p-6 rounded-3xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 ring-slate-950/10 resize-none shadow-sm custom-scrollbar"
                      placeholder="General clinical overview..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap size={12} className="text-pharma-green" /> Primary
                        Uses
                      </label>
                      <textarea
                        value={formData.uses}
                        onChange={e =>
                          setFormData({ ...formData, uses: e.target.value })
                        }
                        className="w-full h-32 p-6 rounded-3xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 ring-pharma-green/10 resize-none shadow-sm custom-scrollbar"
                        placeholder="Indicated uses..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <AlertTriangle size={12} className="text-rose-500" />{" "}
                        Side Effects
                      </label>
                      <textarea
                        value={formData.side_effects}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            side_effects: e.target.value,
                          })
                        }
                        className="w-full h-32 p-6 rounded-3xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 ring-rose-500/10 resize-none shadow-sm custom-scrollbar"
                        placeholder="Known side effects..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Action Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0 px-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl h-14 px-8 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
              >
                Cancel
              </Button>
              <Button
                disabled={submitting}
                type="submit"
                className="bg-slate-950 hover:bg-slate-900 text-white rounded-2xl h-14 px-12 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3  shadow-indigo-200 transition-all transform active:scale-95"
              >
                <Save size={18} />{" "}
                {submitting
                  ? "Synchronizing..."
                  : selectedMed
                    ? "Update Logic"
                    : "Save Medicine"}
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
            <DialogTitle className="text-2xl font-bold text-slate-950 tracking-tight italic">
              Delete Medicine?
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mt-2">
              Are you sure you want to delete{" "}
              <span className="text-rose-500">{selectedMed?.name}</span>? This
              action is permanent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-10">
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest  shadow-rose-200"
            >
              {submitting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
