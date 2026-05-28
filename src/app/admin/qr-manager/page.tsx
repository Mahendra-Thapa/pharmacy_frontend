'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  RefreshCcw,
  Download,
  ShieldCheck,
  Database,
  ScanLine,
  Sparkles,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/lib/admin-context';

import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function QRManagerPage() {
  const { pharmacySettings, loading, refresh } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    setRefreshing(true);

    try {
      await refresh();
      toast.success('QR synchronized successfully');
    } catch (err) {
      toast.error('Failed to synchronize QR');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async () => {
    if (!pharmacySettings?.qr_code_url) {
      toast.error('QR code not available');
      return;
    }

    try {
      const response = await fetch(pharmacySettings.qr_code_url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'pharmacy-qr.png';

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('QR downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const qrCode = pharmacySettings?.qr_code_url;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 shadow-xl">
            <RefreshCcw className="h-7 w-7 animate-spin text-white" />
          </div>

          <div className="space-y-1 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Loading QR Manager
            </h3>
            <p className="text-sm text-slate-500">
              Synchronizing pharmacy configuration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 px-4 pb-10 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-lg">
            <QrCode className="h-7 w-7 text-white" />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Secure Access
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                Active
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              QR Management
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Manage secure pharmacy QR authentication and mobile verification
              protocols from a single dashboard.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={refreshing}
          className="h-12 rounded-2xl bg-slate-950 px-6 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-600 active:scale-95"
        >
          {refreshing ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Synchronizing...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh QR
            </>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* QR Card */}
        <Card className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {/* Background Effects */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-slate-100 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                    Authentication System
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Secure QR Access
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  This QR is used for mobile authentication, pharmacy
                  verification, and secure customer fulfillment.
                </p>
              </div>

              <div className="hidden h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 shadow-xl sm:flex">
                <ScanLine className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* QR Display */}
            <div className="mx-auto flex w-full max-w-md flex-col items-center">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-inner">
                {refreshing ? (
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="h-12 w-12 animate-spin text-slate-400" />
                    <p className="text-sm font-semibold text-slate-500">
                      Synchronizing QR...
                    </p>
                  </div>
                ) : qrCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={qrCode}
                      alt="QR Code"
                      fill
                      priority
                      className="object-contain"
                    />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
                      <Database className="h-10 w-10 text-slate-400" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-700">
                        QR Not Available
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        No QR configuration found for this pharmacy.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleSync}
                  disabled={refreshing}
                  className="h-12 flex-1 rounded-2xl bg-slate-950 text-sm font-bold shadow-lg hover:bg-blue-600"
                >
                  {refreshing ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Update QR
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="h-12 rounded-2xl border-slate-200 px-5 font-semibold hover:bg-slate-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Side Cards */}
        <div className="space-y-6">
          {/* Security */}
          <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
              </div>

              <h3 className="text-2xl font-black tracking-tight">
                Security Layer
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Your pharmacy authentication system is protected with encrypted
                QR verification protocols for secure dispensing and access
                control.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Encryption
                  </p>
                  <h4 className="mt-2 font-bold">AES-256</h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <h4 className="mt-2 font-bold text-emerald-400">Protected</h4>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuration */}
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Database className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Node Configuration
                </h3>

                <p className="text-sm text-slate-500">
                  Active pharmacy system details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Active Store
                </p>

                <h4 className="mt-2 text-sm font-bold text-slate-900">
                  {pharmacySettings?.name || 'Main PharmaOS'}
                </h4>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  QR Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    Operational
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Protocol
                </p>

                <h4 className="mt-2 font-mono text-sm text-slate-700">
                  AES-256-GCM_v4
                </h4>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}