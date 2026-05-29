'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      if (isSignup) {
        await signup(credentials)
      } else {
        await login({ username: credentials.username, password: credentials.password })
      }
      onOpenChange(false)
    } catch (err: any) {
      let errorMsg = 'Authentication failed. Please try again.';
      const resData = err?.response?.data;
      if (resData) {
        if (resData.non_field_errors?.length) errorMsg = resData.non_field_errors[0];
        else if (resData.detail) errorMsg = resData.detail;
        else if (resData.error) errorMsg = resData.error;
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 bg-white border-transparent ">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 bg-pharma-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pharma-green/20 mb-4">
            <Activity size={24} className="stroke-[2.5px]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSignup ? 'Create Account' : 'Login'}
          </DialogTitle>
          <DialogDescription className="text-xs  uppercase tracking-widest text-slate-400">
            {isSignup ? 'Enter your details to sign up' : 'Enter your credentials to login'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs  border border-rose-100">
              {error}
            </div>
          )}
          <div className="space-y-4 max-h-[300px] overflow-y-auto px-1 scrollbar-hide">
            {isSignup && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">First Name</Label>
                  <Input
                    value={credentials.first_name}
                    onChange={(e) => setCredentials({ ...credentials, first_name: e.target.value })}
                    className="h-12 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:ring-pharma-blue/20  text-sm"
                    required={isSignup}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Last Name</Label>
                  <Input
                    value={credentials.last_name}
                    onChange={(e) => setCredentials({ ...credentials, last_name: e.target.value })}
                    className="h-12 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:ring-pharma-blue/20  text-sm"
                    required={isSignup}
                  />
                </div>
              </div>
            )}

            {isSignup && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</Label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="h-12 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:ring-pharma-blue/20  text-sm"
                  required={isSignup}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Username or Email</Label>
              <Input
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="h-12 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:ring-pharma-blue/20  text-sm"
                required
              />
            </div>

            <div className="space-y-2 relative pb-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="h-12 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:ring-pharma-blue/20  text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-slate-900 hover:bg-pharma-green text-white font-bold uppercase tracking-[0.15em] rounded-2xl  shadow-slate-900/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'Signing...' : (isSignup ? 'Sign up' : 'Login')}
          </Button>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {isSignup ? "Already registered?" : "Don't have any Account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-pharma-blue hover:text-pharma-green transition"
            >
              {isSignup ? 'Login' : 'Register Now'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
