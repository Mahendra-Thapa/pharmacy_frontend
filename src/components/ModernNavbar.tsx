'use client'

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  User as UserIcon,
  Search,
  MapPin,
  ChevronDown,
  FileUp,
  Percent,
  LogIn,
  Plus,
  ChevronRight,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SearchComponent from './SearchComponent';

export function ModernNavbar({
  userLoggedIn,
  onLogout,
  onLogin,
  cartCount
}: {
  userLoggedIn: boolean,
  onLogout: () => void,
  onLogin: () => void,
  cartCount: number
}) {
  const [categories, setCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => {
        // Build a tree of categories
        const parents = data.filter((c: any) => !c.parent);
        const tree = parents.map((p: any) => ({
          ...p,
          subs: data.filter((c: any) => c.parent === p.id)
        }));
        setCategories(tree);
      })
      .catch(err => {
        console.error("Nav Categories Fetch failed, using defaults", err);
        // Fallback defaults if API fails
        setCategories([
          { name: 'Vitamins & Nutrition', subs: [{ name: 'Multivitamins' }, { name: 'Minerals' }] },
          { name: 'Healthcare Device', subs: [{ name: 'Monitors' }, { name: 'First Aid' }] },
          { name: 'Ayurveda', subs: [{ name: 'Herbal' }, { name: 'Natural' }] }
        ]);
      });
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const slugify = (name: string) => name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-white border-b border-slate-100 shadow-sm">
      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 h-16 lg:h-20 flex items-center justify-between gap-4 lg:gap-8">

        <div className=" flex gap-2 items-center">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>

          {/* Brand/Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-32  overflow-hidden  flex items-center justify-center  ">
              <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-cover w-32" />
            </div>
            {/* <div className="flex flex-col">
             <span className="text-lg lg:text-xl font-black text-slate-900 leading-none tracking-tighter">Pharma<span className="text-pharma-blue">Logic</span></span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Premier Apothecary</span>
          </div> */}
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-xl">
          <SearchComponent />
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          {/* 
            <Link href="/offers" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-pharma-orange transition-all group">
               <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-pharma-orange/10 group-active:scale-90 transition-all">
                  <Percent size={20} className="group-hover:text-pharma-orange transition-colors" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest">Offers</span>
            </Link> */}

          <Link href="/cart" className="relative group flex flex-col items-center gap-1.5 text-slate-400 hover:text-pharma-blue transition-all">
            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-pharma-blue/10 group-active:scale-90 transition-all">
              <ShoppingCart size={20} className="group-hover:text-pharma-blue transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 bg-pharma-orange text-white text-[8px] font-black h-4 w-4 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>

          </Link>

          <div className="w-px h-10 bg-slate-100 mx-2"></div>

          {userLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pharma-blue/30 transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden">
                  <UserIcon size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Authenticated</span>
                  <span className="text-xs font-black text-slate-950 flex items-center gap-1">Account <ChevronDown size={12} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} /></span>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserMenu(false)} className="fixed inset-0 z-40" />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 overflow-hidden divide-y divide-slate-50"
                    >
                      <div className="p-4 bg-slate-50/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard Protocol</span>
                      </div>
                      <div className="p-2 space-y-1">
                        {[
                          { name: 'My Profile', href: '/user/profile', icon: UserIcon },
                        ].map(item => (
                          <Link key={item.name} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-pharma-blue text-slate-600 transition-all group">
                            <div className="p-1.5 bg-white rounded-lg border border-slate-100 group-hover:border-pharma-blue/20 transition-all">
                              {/* <item.icon size={14} /> */}
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 group-hover:border-pharma-blue transition-colors"></div>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="p-2">
                        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-500 transition-all font-black text-xs uppercase tracking-widest">
                          <LogIn size={14} className="rotate-180" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="h-12 px-8 bg-slate-900 hover:bg-pharma-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center gap-3"
            >
              <LogIn size={16} />  Login
            </button>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden flex items-center gap-2">
          <Link href="/cart" className="relative p-3 bg-slate-50 rounded-xl text-slate-600">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="absolute top-2 right-2 bg-pharma-orange w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-black border-2 border-white">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Categories Bar - Desktop Only */}
      <div className="hidden lg:block w-full bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-center gap-10">
          {categories.map((cat) => (
            <div key={cat.name} className="group relative py-4">
              <Link
                href={`/category/${slugify(cat.name)}`}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-pharma-blue transition-colors"
              >
                {cat.name}
                {cat.subs?.length > 0 && <ChevronDown size={14} className="text-slate-300 group-hover:text-pharma-blue transition-colors group-hover:rotate-180 duration-300" />}
              </Link>

              {cat.subs?.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-100 shadow-2xl rounded-3xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
                  <div className="px-6 py-2 text-[10px] font-black text-slate-400 border-b border-slate-50 mb-3 uppercase tracking-widest">Medical Segments</div>
                  <div className="px-2 space-y-1">
                    {cat.subs.map((sub: any) => (
                      <Link
                        key={sub.name}
                        href={`/category/${slugify(sub.name)}`}
                        className="flex items-center justify-between px-5 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-pharma-blue rounded-2xl transition-all uppercase tracking-tighter"
                      >
                        {sub.name}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Drawer (Simplified) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[280px] bg-white z-[120] p-8 overflow-y-auto">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Menu Control</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation Protocol</span>
                </div>

                <div className="mt-2">
                  <SearchComponent />
                </div>

                {userLoggedIn && (
                  <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <UserIcon size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Authenticated</span>
                        <span className="text-sm font-black text-slate-950">My Account</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'My Profile', href: '/user/profile' },
                        { name: 'Order History', href: '/user/orders' },
                        { name: 'Security', href: '/user/security' },
                      ].map(item => (
                        <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-pharma-blue border border-transparent hover:border-pharma-blue/20 transition-all">
                          {item.name}
                          <ChevronRight size={14} />
                        </Link>
                      ))}
                      <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-3 bg-rose-50 rounded-xl text-rose-500 font-black text-[11px] uppercase tracking-widest">
                        Secure Logout
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Medical Segments</span>
                  {categories.map(cat => (
                    <Link key={cat.name} href={`/category/${slugify(cat.name)}`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl text-[13px] font-black text-slate-600 uppercase tracking-tighter border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                      {cat.name}
                      <ChevronRight size={16} className="text-slate-300" />
                    </Link>
                  ))}
                </div>

                {!userLoggedIn && (
                  <button
                    onClick={onLogin}
                    className="w-full h-14 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  >
                    <LogIn size={18} /> Login
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
