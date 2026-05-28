"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  LogOut,
  UserCircle,
  Menu,
  ChevronDown,
} from "lucide-react";

import { POSSidebar } from "./POSSidebar";
import { LogoutDialog } from "./LogoutDialog";

export function PosNavbar() {
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Sidebar */}
      <POSSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenLogs={() => setSidebarOpen(false)}
        onOpenSettings={() => setSidebarOpen(false)}
      />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-4 md:px-8 shadow-sm">
        <div className="h-full flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-500 transition-all duration-300 shadow-lg active:scale-90"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={160}
                height={50}
                className="object-contain h-11 w-auto"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-2xl transition-all duration-300"
              >
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.first_name} {user?.last_name || "Agent"}
                  </span>

                  <span className="text-xs text-slate-500">
                    Administrator
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                  <UserCircle size={22} />
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-300 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 origin-top-right transition-all duration-300 ${
                  profileOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 text-sm">
                      {user?.first_name} {user?.last_name}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Logged in user
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                      <LogOut size={18} />
                    </div>

                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">
                        Logout
                      </span>

                      <span className="text-xs text-rose-400">
                        Sign out from account
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Dialog */}
        <LogoutDialog
          open={showLogoutConfirm}
          onOpenChange={setShowLogoutConfirm}
          onConfirm={() => {
            logout?.();
            setShowLogoutConfirm(false);
          }}
        />
      </header>
    </>
  );
}