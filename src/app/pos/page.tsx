'use client'

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Plus, Trash2, Printer, UserCircle, QrCode, Banknote, CheckCircle, ChevronLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy medicines (would come from API)
const DUMMY_MEDICINES = [
    { id: 1, name: 'Paracetamol 500mg', price: 10.0, stock: 50 },
    { id: 2, name: 'Amoxicillin 250mg', price: 45.5, stock: 20 },
    { id: 3, name: 'Cough Syrup', price: 120.0, stock: 15 },
    { id: 4, name: 'Vitamin C 1000mg', price: 80.0, stock: 100 },
];

export default function POSPage() {
    const [cart, setCart] = useState<{ med: any, qty: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState<'CASH' | 'QR'>('CASH');
    const [showReceipt, setShowReceipt] = useState(false);
    
    // Custom Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState<'CASH' | 'QR'>('CASH');
    const [showReceipt, setShowReceipt] = useState(false);
    
    // Derived values
    const totalAmount = cart.reduce((acc, item) => acc + (item.med.price * item.qty), 0);

    const addToCart = (medicine: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.med.id === medicine.id);
            if (existing) {
                return prev.map(item => item.med.id === medicine.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { med: medicine, qty: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.med.id !== id));
    };

    const updateQty = (id: number, qty: number) => {
        if (qty <= 0) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => item.med.id === id ? { ...item, qty } : item));
    };

    const filteredMedicines = DUMMY_MEDICINES.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCheckout = () => {
        if (cart.length === 0) return showToast('Cart is empty!', 'error');
        if (!customerName) return showToast('Enter customer name for accounting!', 'error');
        setShowReceipt(true);
        showToast('Checkout successful! Receipts generated.', 'success');
    };

    // QR Code data: usually contains merchant ID, amount, transaction ID
    const qrData = `pay://gateway?merchant=PHARMACY_123&amount=${totalAmount}&tx=${Date.now()}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <Link href="/" className="hover:bg-indigo-700 p-2 rounded-full transition"><ChevronLeft size={20}/></Link>
                    <h1 className="text-xl font-bold flex items-center gap-2"><QrCode size={24}/> Pharmacy POS</h1>
                </div>
                <div className="flex items-center gap-2">
                    <UserCircle size={20}/>
                    <span className="font-medium">Pharmacist Admin</span>
                </div>
            </header>

            <main className="flex-grow flex p-6 gap-6 h-[calc(100vh-72px)]">
                
                {/* Left Panel: Inventory & Search */}
                <section className="w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                            <input 
                                type="text"
                                placeholder="Search medicines by name or scan barcode..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="p-4 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedicines.map(med => (
                            <div key={med.id} onClick={() => addToCart(med)} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md cursor-pointer hover:border-indigo-200 transition group flex flex-col justify-between h-32">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{med.name}</h3>
                                    <p className="text-sm text-slate-500">Stock: {med.stock}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-bold text-indigo-600">Rs. {med.price.toFixed(2)}</span>
                                    <button className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition">
                                        <Plus size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Right Panel: Cart & Checkout */}
                <section className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full relative">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                        <h2 className="font-semibold text-slate-800 text-lg">Current Order</h2>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        <AnimatePresence>
                            {cart.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 py-10 flex flex-col items-center">
                                    <QrCode size={40} className="mb-2 opacity-50"/>
                                    <p>Cart is empty</p>
                                </motion.div>
                            )}
                            {cart.map(item => (
                                <motion.div key={item.med.id} layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-800 text-sm">{item.med.name}</h4>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                            Rs. {item.med.price.toFixed(2)} x 
                                            <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.med.id, parseInt(e.target.value))} className="w-12 text-center border rounded py-0.5 outline-none focus:border-indigo-400 focus:bg-white bg-slate-100"/>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-2">
                                        <span className="font-semibold text-slate-800">Rs. {(item.med.price * item.qty).toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.med.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={18}/></button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                        <div className="mb-4 space-y-3">
                            <input type="text" placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"/>
                            <input type="text" placeholder="Customer Phone (Optional)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"/>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-lg">
                            <span className="text-slate-600 font-medium">Total</span>
                            <span className="text-2xl font-bold text-indigo-600">Rs. {totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={()=>setPaymentMode('CASH')} className={`py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${paymentMode === 'CASH' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                <Banknote size={18}/> Cash
                            </button>
                            <button onClick={()=>setPaymentMode('QR')} className={`py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${paymentMode === 'QR' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                <QrCode size={18}/> Scan & Pay
                            </button>
                        </div>

                        {paymentMode === 'QR' && totalAmount > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col items-center mb-4 text-center">
                                <p className="text-sm text-indigo-800 mb-2 font-medium">Scan to Pay Rs. {totalAmount}</p>
                                <div className="bg-white p-2 rounded-xl shadow-sm inline-block">
                                   <QRCodeSVG value={qrData} size={120} />
                                </div>
                                <p className="text-xs text-indigo-500 mt-2">Fonepay / eSewa / Khalti Supported</p>
                            </div>
                        )}

                        <button onClick={handleCheckout} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md flex justify-center items-center gap-2">
                            <CheckCircle size={20}/> Complete Sale
                        </button>
                    </div>

                    {/* Receipt Modal Overlay */}
                    <AnimatePresence>
                        {showReceipt && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4">
                                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-full">
                                    <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible text-slate-800">
                                        <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-4">
                                            <h2 className="text-xl font-bold">Smart Pharmacy</h2>
                                            <p className="text-sm text-slate-500">Bhatbhateni Style POS</p>
                                            <p className="text-xs text-slate-400 mt-1">Receipt #{Date.now().toString().slice(-6)}</p>
                                        </div>
                                        <div className="mb-4 text-sm">
                                            <p><span className="text-slate-500">Customer:</span> {customerName}</p>
                                            {customerPhone && <p><span className="text-slate-500">Phone:</span> {customerPhone}</p>}
                                            <p><span className="text-slate-500">Date:</span> {new Date().toLocaleString()}</p>
                                        </div>
                                        <table className="w-full text-sm mb-4">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-left text-slate-500">
                                                    <th className="py-2 font-medium">Item</th>
                                                    <th className="py-2 text-center font-medium">Qty</th>
                                                    <th className="py-2 text-right font-medium">Amt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                                                        <td className="py-2 text-slate-700 max-w-[120px] truncate" title={item.med.name}>{item.med.name}</td>
                                                        <td className="py-2 text-center">{item.qty}</td>
                                                        <td className="py-2 text-right">{(item.med.price * item.qty).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="border-t border-dashed border-slate-300 pt-4 flex justify-between font-bold text-lg mb-2">
                                            <span>Total</span>
                                            <span>Rs. {totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-right text-sm text-slate-500 mb-6">
                                            Paid via: {paymentMode}
                                        </div>
                                        <div className="text-center text-sm text-slate-500">
                                            <p>Thank you for shopping with us!</p>
                                            <p className="text-xs mt-1">Software developed for final year project</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t flex gap-3 print:hidden">
                                        <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-800 text-white rounded-lg flex justify-center items-center gap-2 hover:bg-slate-700 transition">
                                            <Printer size={18}/> Print
                                        </button>
                                        <button onClick={() => {
                                            setCart([]); setCustomerName(''); setCustomerPhone(''); setPaymentMode('CASH'); setShowReceipt(false);
                                        }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg flex justify-center items-center gap-2 hover:bg-indigo-700 transition">
                                            New Sale
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {toastMessage && (
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg font-medium flex items-center gap-3 z-50 ${toastType === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                {toastType === 'error' ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                                {toastMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </section>
            </main>
        </div>
    );
}
