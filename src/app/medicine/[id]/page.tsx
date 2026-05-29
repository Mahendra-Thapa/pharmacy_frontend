"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Database,
} from "lucide-react";

import { motion } from "framer-motion";

import { ModernNavbar } from "@/components/ModernNavbar";
import { ModernFooter } from "@/components/ModernFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { axiosInstance } from "@/utils/axiosSetup";

import { LoginDialog } from "@/components/LoginDialog";
import { LogoutDialog } from "@/components/LogoutDialog";

const InfoItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <div className="text-emerald-600">{icon}</div>
    <p className="text-sm text-gray-700">{label}</p>
  </div>
);

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { user, logout } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMedicine = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(`/medicines/${id}/`);
        setMedicine(res.data);
      } catch (error) {
        console.error("Failed to fetch medicine:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The medicine you are looking for does not exist.
        </p>

        <Button
          className="mt-6 rounded-xl"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ModernNavbar
        userLoggedIn={!!user}
        cartCount={cartCount}
        onLogin={() => setShowLoginDialog(true)}
        onLogout={() => setShowLogoutDialog(true)}
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={() => {
          logout();
          setShowLogoutDialog(false);
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-24 lg:px-8 mt-20">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-2 gap-2 px-0 text-gray-500 hover:bg-transparent hover:text-black"
        >
          <ChevronLeft size={18} />
          Back
        </Button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-none">
              <CardContent className="relative aspect-[4/4] bg-gray-50 p-6">
                {medicine.image_url ? (
                  <Image
                    src={medicine.image_url}
                    alt={medicine.name}
                    fill
                    className="object-contain p-6"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Database size={56} className="text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col"
          >
            {/* Category */}
            <Badge className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50">
              {medicine.category_name || "Medicine"}
            </Badge>

            {/* Name */}
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
              {medicine.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {medicine.manufacturer || "Generic Pharma"}
            </p>

            {/* Price */}
            <div className="mt-8">
              <p className="text-2xl font-bold text-gray-900">
                Rs. {parseFloat(medicine.price).toFixed(2)}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Inclusive of all taxes
              </p>
            </div>

            {/* Stock */}
            <div className="mt-6 flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  medicine.stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <p className="text-sm font-medium text-gray-700">
                {medicine.stock > 0
                  ? `${medicine.stock} items available`
                  : "Out of stock"}
              </p>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              disabled={medicine.stock <= 0}
              onClick={() => addToCart(medicine)}
              className="mt-8 h-12 rounded-2xl bg-emerald-600 text-base font-medium hover:bg-emerald-700"
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>

            {/* Info */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<ShieldCheck size={18} />}
                label={`Expiry: ${medicine.expiry_date || "N/A"}`}
              />

              <InfoItem
                icon={<Truck size={18} />}
                label="Fast delivery available"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-10">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
                <TabsTrigger
                  value="description"
                  className="rounded-xl data-[state=active]:bg-white"
                >
                  Description
                </TabsTrigger>

                <TabsTrigger
                  value="uses"
                  className="rounded-xl data-[state=active]:bg-white"
                >
                  Uses
                </TabsTrigger>

                <TabsTrigger
                  value="side_effects"
                  className="rounded-xl data-[state=active]:bg-white"
                >
                  Side Effects
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="mt-6 text-sm leading-7 text-gray-600"
              >
                {medicine.description ||
                  "No detailed description available."}
              </TabsContent>

              <TabsContent
                value="uses"
                className="mt-6 text-sm leading-7 text-gray-600"
              >
                {medicine.uses || "No usage information available."}
              </TabsContent>

              <TabsContent
                value="side_effects"
                className="mt-6 text-sm leading-7 text-gray-600"
              >
                {medicine.side_effects ||
                  "Consult your healthcare professional for side effects."}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}