"use client";

import React from "react";
import { ModernNavbar } from "@/components/ModernNavbar";
import { ModernFooter } from "@/components/ModernFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white text-gray-900">
      <ModernNavbar
        userLoggedIn={false}
        cartCount={0}
        onLogin={() => {}}
        onLogout={() => {}}
      />

      <main className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 pt-28 lg:pt-36">

        {/* HERO */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base md:text-lg">
            We’re here to help anytime. Send a message or visit our pharmacy.
          </p>
        </div>

        {/* CONTACT INFO + HOURS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-14">

          {/* CONTACT */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Contact Information
            </h2>

            <div className="space-y-5 text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-500 mt-1" size={18} />
                <span>Kathmandu, Nepal</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-emerald-500" size={18} />
                <span>+977 9800000000</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-emerald-500" size={18} />
                <span>contact@pharmacy.com</span>
              </div>
            </div>
          </div>

          {/* HOURS */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Opening Hours
            </h2>

            <div className="space-y-4 text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Mon - Fri</span>
                <span>9:00 AM - 7:00 PM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Saturday</span>
                <span>10:00 AM - 5:00 PM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Sunday</span>
                <span className="text-red-500 font-semibold">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* FORM */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Send Message
            </h2>

            <form className="space-y-5">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <Input placeholder="Your name" className="mt-1 h-11" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email Address</label>
                <Input type="email" placeholder="you@example.com" className="mt-1 h-11" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Message</label>
                <textarea
                  rows={5}
                  placeholder="Write your message..."
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <Button className="w-full h-11 text-base">
                Send Message
              </Button>
            </form>
          </div>

          {/* MAP */}
          <div className="space-y-6">

            {/* MAP HEADER */}
            <div className="bg-white/70 backdrop-blur-xl border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-500" size={18} />
                <h2 className="text-xl font-bold">Our Location</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Visit us anytime in Kathmandu
              </p>
            </div>

            {/* MAP CARD */}
            <div className="bg-white/70 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <iframe
                src="https://www.google.com/maps?q=Kathmandu,Nepal&output=embed"
                className="w-full h-[320px]"
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}