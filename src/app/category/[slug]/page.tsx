'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { motion } from 'framer-motion'
import { ChevronRight, Home, Package, AlertCircle } from 'lucide-react'

import axios from '@/utils/axiosSetup'

import { ModernNavbar } from '@/components/ModernNavbar'
import { ModernFooter } from '@/components/ModernFooter'
import { ProductCard } from '@/components/ProductCard'

import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'

import { LoginDialog } from '@/components/LoginDialog'
import { LogoutDialog } from '@/components/LogoutDialog'

export default function CategoryPage() {
  const { slug } = useParams()

  const { user, logout } = useAuth()
  const { addToCart, cartCount } = useCart()

  const slugStr =
    typeof slug === 'string'
      ? slug
      : Array.isArray(slug)
      ? slug[0]
      : ''

  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const formatSlug = (text: string) => {
    return text
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const categoryName = formatSlug(slugStr)

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await axios.get('/medicines/')
        const data = res.data

        const simplify = (str: string) =>
          str.toLowerCase().replace(/[^a-z0-9]/g, '')

        const target = simplify(slugStr)

        const filtered = data.filter((m: any) => {
          const category = simplify(
            m.category_name || m.category?.name || ''
          )

          return (
            category.includes(target) ||
            target.includes(category)
          )
        })

        setMedicines(filtered)
      } catch (err) {
        console.error(err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [slugStr])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ModernNavbar
        userLoggedIn={!!user}
        onLogout={() => setShowLogoutDialog(true)}
        onLogin={() => setShowLoginDialog(true)}
        cartCount={cartCount}
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={() => {
          logout()
          setShowLogoutDialog(false)
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-black transition"
          >
            <Home size={14} />
            Home
          </Link>

          <ChevronRight size={14} />

          <span className="text-gray-900 font-medium">
            {categoryName}
          </span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Package size={18} className="text-emerald-600" />
            </div>

            <p className="text-sm text-gray-500">
              Category
            </p>
          </div>

          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900">
            {categoryName}
          </h1>

          <p className="mt-3 text-gray-500 max-w-2xl">
            Browse medicines and healthcare products available
            in this category.
          </p>

          {!loading && !error && (
            <p className="mt-4 text-sm text-gray-600">
              {medicines.length} products found
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[340px] rounded-3xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center border rounded-3xl py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="text-red-500" size={28} />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : medicines.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {medicines.map((medicine) => (
              <ProductCard
                key={medicine.id}
                medicine={{
                  ...medicine,
                  description:
                    medicine.description ||
                    'No description available.',
                }}
                onAdd={(m) => addToCart(m)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-3xl py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Package size={28} className="text-gray-400" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500 max-w-md">
              There are currently no medicines available in
              this category.
            </p>

            <Link
              href="/"
              className="mt-6 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        )}
      </main>

      <ModernFooter />
    </div>
  )
}