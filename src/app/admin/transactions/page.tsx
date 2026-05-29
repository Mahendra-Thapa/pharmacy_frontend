"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Search,
  Trash2,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Clock3,
  XCircle,
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

export default function TransactionsPage() {
  const { transactions, loading, refresh } = useAdmin();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  // FILTERED DATA
  const filtered = useMemo(() => {
    return transactions.filter((tx: any) => {
      const query = search.toLowerCase();

      const matchesSearch =
        (tx.transaction_id || "").toLowerCase().includes(query) ||
        (tx.method || "").toLowerCase().includes(query) ||
        (tx.status || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // DELETE
  const openDelete = (tx: any) => {
    setSelectedTx(tx);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTx) return;

    setSubmitting(true);

    try {
      await axiosInstance.delete(`/payment-transactions/${selectedTx.id}/`);

      toast.success("Transaction deleted successfully");

      setIsDeleteOpen(false);

      refresh();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // STATS
  const completedCount = transactions.filter(
    (tx: any) => tx.status === "COMPLETED"
  ).length;

  const pendingCount = transactions.filter(
    (tx: any) => tx.status === "PENDING"
  ).length;

  const totalAmount = transactions.reduce(
    (acc: number, tx: any) => acc + Number(tx.amount || 0),
    0
  );

  // LOADING
  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCcw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            Loading transactions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transactions
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage payment records and transaction history.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions..."
              className="pl-10 h-11 w-full sm:w-72 rounded-xl border-slate-200"
            />
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              onClick={() => {
                setStatusFilter("ALL");
                setPage(1);
              }}
              className="rounded-xl"
            >
              All
            </Button>

            <Button
              variant={
                statusFilter === "COMPLETED"
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                setStatusFilter("COMPLETED");
                setPage(1);
              }}
              className={`rounded-xl ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }`}
            >
              Completed
            </Button>

            <Button
              variant={
                statusFilter === "PENDING"
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                setStatusFilter("PENDING");
                setPage(1);
              }}
              className={`rounded-xl ${
                statusFilter === "PENDING"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
            >
              Pending
            </Button>
          </div>

          {/* REFRESH */}
          <Button
            onClick={refresh}
            variant="outline"
            className="h-11 rounded-xl"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Transactions
              </p>

              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {transactions.length}
              </h3>
            </div>

            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>

              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {completedCount}
              </h3>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending</p>

              <h3 className="text-2xl font-bold text-orange-500 mt-1">
                {pendingCount}
              </h3>
            </div>

            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="min-w-[250px]">
                  Transaction
                </TableHead>

                <TableHead>Method</TableHead>

                <TableHead>Amount</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((tx: any) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">
                          {tx.transaction_id || "LOCAL-TXN"}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="w-3.5 h-3.5" />

                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-lg px-3 py-1 text-xs"
                      >
                        {tx.method}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        Rs. {tx.amount}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.status === "COMPLETED" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                            <span className="text-sm font-medium text-emerald-600">
                              Completed
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-orange-500" />

                            <span className="text-sm font-medium text-orange-500">
                              Pending
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(tx)}
                        className="rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 text-slate-500"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={page === 1}
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* DELETE DIALOG */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete Transaction
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500 leading-6">
              Are you sure you want to delete this
              transaction?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-2xl p-4 text-sm">
            <p className="text-slate-500 mb-1">
              Transaction ID
            </p>

            <p className="font-semibold text-slate-900 break-all">
              {selectedTx?.transaction_id ||
                selectedTx?.id}
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}