'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  category?: string
  image_url?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  removeFromCart: (id: number) => void
  updateQty: (id: number, qty: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pharma_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart")
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('pharma_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    let message = `${item.name} added to basket`;
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        message = `Incremented ${item.name} in basket`;
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
    toast.success(message)
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id))
    toast.error("Item removed from basket")
  }

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('pharma_cart')
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
