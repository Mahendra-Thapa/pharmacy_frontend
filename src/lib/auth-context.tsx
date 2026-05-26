'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from '@/utils/axiosSetup'
import { clearCachedToken } from '@/utils/axiosSetup'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  username: string
  email: string
  phone: string
  role: 'ADMIN' | 'POS' | 'USER'
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: any) => Promise<void>
  signup: (userData: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const TOKEN_KEY = "auth_token"
  const ROLE_KEY = "user_role"

  const refreshUser = async () => {
    const token = Cookies.get(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      clearCachedToken()
      const res = await axios.get('/users/me/')
      setUser(res.data)
      Cookies.set(ROLE_KEY, res.data.role, { expires: 7 })
    } catch (err) {
      Cookies.remove(TOKEN_KEY)
      Cookies.remove(ROLE_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (credentials: any) => {
    const res = await axios.post('/login/', credentials)
    const { token, user: userData } = res.data
    Cookies.set(TOKEN_KEY, token, { expires: 7 })
    Cookies.set(ROLE_KEY, userData.role, { expires: 7 })
    clearCachedToken() // Force axios to re-read the new token
    setUser(userData)
    
    toast.success(`Welcome back, ${userData.username}!`)

    // Redirect based on role
    if (userData.role === 'ADMIN') router.push('/admin')
    else if (userData.role === 'POS') router.push('/pos')
    else router.push('/user/profile')
  }

  const signup = async (userData: any) => {
    await axios.post('/users/', userData)
    toast.success('Account created successfully!')
    // Auto-login after signup
    await login({ username: userData.username, password: userData.password })
  }

  const logout = () => {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(ROLE_KEY)
    clearCachedToken()
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
