"use client";

import React from "react";
import { ModernNavbar } from "@/components/ModernNavbar";
import { ModernFooter } from "@/components/ModernFooter";
import { Target, Heart, Sparkles } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white text-gray-900">
      <ModernNavbar
        userLoggedIn={false}
        cartCount={0}
        onLogin={() => {}}
        onLogout={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-24 pt-28 lg:pt-36">
        {/* HERO */}
        <div className="text-center mb-24 mt-6">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight">
            About Our <span className="text-emerald-600">Pharmacy</span>
          </h1>

          <p className="mt-5 text-gray-500 text-lg max-w-2xl mx-auto">
            A modern healthcare partner focused on trust, care, and your
            everyday wellbeing.
          </p>
        </div>

        {/* STORY */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-28">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-5">Our Story</h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2010, we started with a simple belief — healthcare
              should be accessible, human, and reliable for everyone.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Today, we combine modern technology with compassionate service to
              deliver a seamless pharmacy experience.
            </p>
          </div>

          {/* IMAGE CARD */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200/30 blur-3xl rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden border shadow-lg">
              <img
                src="/logo.png"
                alt="Pharmacy"
                className="w-full h-80 object-cover hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>

        {/* MISSION + VALUES */}
        <div className="grid md:grid-cols-2 gap-8 mb-28">
          {/* Mission */}
          <div className="group p-8 rounded-2xl border bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Target size={20} />
              </div>
              <h3 className="text-xl font-semibold">Our Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To deliver accessible, high-quality pharmaceutical care that
              improves everyday health and wellbeing.
            </p>
          </div>

          {/* Values */}
          <div className="group p-8 rounded-2xl border bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-500">
                <Heart size={20} />
              </div>
              <h3 className="text-xl font-semibold">Our Values</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Compassion, integrity, and continuous improvement in patient care
              and service quality.
            </p>
          </div>
        </div>

        {/* TEAM */}
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold">Meet Our Team</h2>
          <p className="text-gray-500 mt-2">
            People who care about your health
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Dr. sangam", role: "Head Pharmacist" },
            { name: "samgam2", role: "Pharmacy Technician" },
            { name: "sagame3", role: "Wellness Advisor" },
          ].map((member, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200" />
              <h4 className="font-semibold text-lg">{member.name}</h4>
              <p className="text-sm text-emerald-600 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}