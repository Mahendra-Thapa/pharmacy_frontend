"use client";

import axios from "axios";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import React, { useState } from "react";

import { PasswordInput } from "@/components/PasswordInput";
import { PosNavbar } from "@/components/PosNavbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Page = () => {
  const [updatingAgentPass, setUpdatingAgentPass] =
    useState(false);

  const [agentPass, setAgentPass] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const showToast = (
    message: string,
    type: "success" | "error",
  ) => {
    console.log(type, message);
  };

  const handleAgentPasswordUpdate = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!agentPass.current.trim()) {
      return showToast(
        "Current password is required!",
        "error",
      );
    }

    if (agentPass.new.length < 6) {
      return showToast(
        "New password must be at least 6 characters!",
        "error",
      );
    }

    if (agentPass.new !== agentPass.confirm) {
      return showToast(
        "Passwords do not match!",
        "error",
      );
    }

    setUpdatingAgentPass(true);

    try {
      await axios.patch("/users/me/", {
        current_password: agentPass.current,
        password: agentPass.new,
      });

      showToast(
        "Password updated successfully",
        "success",
      );

      setAgentPass({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (err: any) {
      showToast(
        err.response?.data?.error ||
          "Password update failed",
        "error",
      );
    } finally {
      setUpdatingAgentPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
<PosNavbar />    
  <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Security
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Keep your account secure by updating your
            password regularly.
          </p>
        </div>

        {/* Main Card */}
        <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="p-8 lg:p-10">
            <form
              onSubmit={handleAgentPasswordUpdate}
              className="space-y-6"
            >
              {/* Current Password */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Current Password
                </Label>

                <PasswordInput
                  value={agentPass.current}
                  onChange={(e) =>
                    setAgentPass({
                      ...agentPass,
                      current: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 font-medium shadow-none focus-visible:ring-emerald-500"
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  New Password
                </Label>

                <PasswordInput
                  value={agentPass.new}
                  onChange={(e) =>
                    setAgentPass({
                      ...agentPass,
                      new: e.target.value,
                    })
                  }
                  placeholder="Minimum 6 characters"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 font-medium shadow-none focus-visible:ring-emerald-500"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${
                    agentPass.confirm &&
                    agentPass.new !==
                      agentPass.confirm
                      ? "text-rose-500"
                      : "text-slate-500"
                  }`}
                >
                  Confirm Password
                </Label>

                <PasswordInput
                  value={agentPass.confirm}
                  onChange={(e) =>
                    setAgentPass({
                      ...agentPass,
                      confirm: e.target.value,
                    })
                  }
                  placeholder="Re-enter password"
                  className={`h-14 rounded-2xl px-4 font-medium shadow-none ${
                    agentPass.confirm &&
                    agentPass.new !==
                      agentPass.confirm
                      ? "border-rose-300 bg-rose-50 focus-visible:ring-rose-400"
                      : "border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
                  }`}
                  required
                />

                {agentPass.confirm && (
                  <p
                    className={`text-xs font-semibold ${
                      agentPass.new ===
                      agentPass.confirm
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {agentPass.new ===
                    agentPass.confirm
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                disabled={updatingAgentPass}
                type="submit"
                className="h-14 w-full rounded-2xl bg-emerald-600 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
              >
                {updatingAgentPass
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </form>
          </div>

          {/* Right */}
          <div className="relative border-t border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white lg:border-t-0 lg:border-l">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                <LockKeyhole className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="mt-6 text-2xl font-black">
                Password Tips
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use a strong password to better protect
                your account and personal data.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Use at least 6 characters",
                  "Avoid common passwords",
                  "Do not share your password",
                  "Update it regularly",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="text-sm text-slate-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm leading-6 text-slate-300">
                  A strong password helps keep your
                  account safe from unauthorized access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;