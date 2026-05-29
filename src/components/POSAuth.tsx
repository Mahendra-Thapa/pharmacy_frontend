"use client";

import React from "react";
import { motion } from "framer-motion";
import { QrCode, Activity } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

interface POSAuthProps {
  handleLogin: (e: React.FormEvent) => Promise<void>;
  credentials: { username: string; password: string };
  setCredentials: (creds: { username: string; password: string }) => void;
  loginError: string;
}

export function POSAuth({
  handleLogin,
  credentials,
  setCredentials,
  loginError,
}: POSAuthProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pharma-green/20 via-slate-950 to-slate-950"></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[40px]  w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-pharma-green text-white rounded-2xl  shadow-pharma-green/20 mb-6">
            <QrCode size={40} className="stroke-[2.5px]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
            POS Terminal
          </h1>
          <p className="text-pharma-blue/60 text-xs font-bold uppercase tracking-widest px-8">
            Agent Authentication Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {loginError && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl text-center border border-rose-500/20">
              {loginError}
            </p>
          )}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Agent ID"
              value={credentials.username}
              onChange={e =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              required
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:ring-2 focus:ring-pharma-blue/50 outline-none transition-all placeholder:text-slate-600 font-bold text-sm"
            />
            <div className="relative group">
              <PasswordInput
                placeholder="Passcode"
                value={credentials.password}
                onChange={e =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
                className="w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-14 bg-pharma-green hover:bg-pharma-green/90 text-white font-bold uppercase tracking-widest rounded-2xl transition-all duration-500  shadow-pharma-green/20 active:scale-95 flex items-center justify-center gap-3"
          >
            Unlock Terminal <Activity size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
