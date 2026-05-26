'use client'

import { Activity, Heart, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa6';

export function ModernFooter() {
  return (
    <footer className="relative mt-24 pt-20 pb-12 bg-slate-900 overflow-hidden group">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-pharma-green/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-pharma-blue/10 blur-[150px] rounded-full translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-slate-800">
          
          {/* Logo & Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <img src="/logo.png" alt="Pharmalogic" className="h-16 w-auto object-contain drop-shadow-sm brightness-200 contrast-100" style={{filter: 'brightness(0) invert(1)'}} />
            </div>
            <p className="text-white text-sm leading-relaxed max-w-xs font-medium">
              Revolutionizing health security through precision pharmaceuticals and machine learning diagnostics. 
              Certified by global standards for your health assurance.
            </p>
            <div className="flex gap-4">
              {[FaInstagram, FaTwitter, FaFacebookF].map((Icon, i) => (
                <div key={i} className="p-3 bg-slate-800 text-white/80 hover:bg-pharma-blue hover:text-white rounded-2xl transition cursor-pointer shadow-lg active:scale-90">
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
               Services <div className="h-1 w-8 bg-pharma-orange rounded-full"></div>
            </h4>
            <ul className="space-y-4">
               {['Emergency 24/7', 'Health Checkups', 'Home Delivery', 'Consultation'].map((link) => (
                 <li key={link}>
                    <a href="#" className="text-white/80 hover:text-pharma-orange text-sm font-bold transition group/link flex items-center gap-2">
                       <div className="w-0 group-hover/link:w-2 h-0.5 bg-pharma-orange transition-all rounded-full opacity-0 group-hover/link:opacity-100"></div>
                       {link}
                    </a>
                 </li>
               ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
               Patient Care <div className="h-1 w-8 bg-pharma-orange rounded-full"></div>
            </h4>
            <ul className="space-y-4">
               {['Help Center', 'Track Order', 'Return Policy', 'Safety Portal'].map((link) => (
                 <li key={link}>
                    <a href="#" className="text-white/80 hover:text-pharma-orange text-sm font-bold transition group/link flex items-center gap-2">
                       <div className="w-0 group-hover/link:w-2 h-0.5 bg-pharma-orange transition-all rounded-full opacity-0 group-hover/link:opacity-100"></div>
                       {link}
                    </a>
                 </li>
               ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
             <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
               Get In Touch <div className="h-1 w-8 bg-pharma-orange rounded-full"></div>
            </h4>
            <div className="space-y-4 p-5 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm">
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-pharma-green/20 text-pharma-green rounded-xl">
                      <Phone size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-pharma-green font-bold uppercase tracking-wider">Call Hub</span>
                      <span className="text-white font-black text-sm tracking-tight">+977-9800000000</span>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                      <Mail size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-blue-500/60 font-bold uppercase tracking-wider">Email Us</span>
                      <span className="text-white font-black text-sm tracking-tight">care@smartpharma.com</span>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                      <MapPin size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-rose-500/60 font-bold uppercase tracking-wider">Location</span>
                      <span className="text-white font-black text-sm tracking-tight">Kathmandu, Nepal</span>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
               © {new Date().getFullYear()} Pharmalogic Systems INC. All Rights Reserved.
            </p>
            
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                   <ShieldCheck size={16} className="text-pharma-green" />
                   <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Secured Payment Gateway</span>
                </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                   <Heart size={16} className="text-rose-500 fill-rose-500/20" />
                   <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Patient Focus First</span>
                </div>
            </div>
            
            <div className="flex gap-6">
               <a href="#" className="text-white/80 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition">Privacy</a>
               <a href="#" className="text-white/80 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition">Terms</a>
            </div>
        </div>
      </div>
    </footer>
  );
}
