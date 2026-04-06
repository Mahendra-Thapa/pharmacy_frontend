'use client'

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PackageSearch, Activity, LockIcon, LogOut, Search, PlusCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock inventory data for Admin Management
const INITIAL_INVENTORY = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 50, price: 10.0 },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 20, price: 45.5 },
    { id: 3, name: 'Cough Syrup', category: 'Cold & Flu', stock: 15, price: 120.0 },
    { id: 4, name: 'Vitamin C 1000mg', category: 'Supplement', stock: 100, price: 80.0 },
];

export default function AdminPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [aiReport, setAiReport] = useState<any[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);

    // Simulated login handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        setIsLoggedIn(true);
        fetchAiReport();
    };

    const fetchAiReport = async () => {
        setLoadingAi(true);
        try {
            // Try fetching from real Flask backend
            const res = await fetch('http://localhost:5001/api/ai/predict-demand');
            if(res.ok) {
                const data = await res.json();
                setAiReport(data.data);
            } else {
                throw new Error("Fallback to mock");
            }
        } catch (error) {
            // Fallback mock AI response if Flask is down
            setAiReport([
                { medicine_id: 1, name: "Paracetamol 500mg", current_stock: 50, predicted_demand_next_30_days: 65, restock_alert: True, recommended_order_quantity: 25 },
                { medicine_id: 2, name: "Amoxicillin 250mg", current_stock: 20, predicted_demand_next_30_days: 15, restock_alert: False, recommended_order_quantity: 0 },
                { medicine_id: 3, name: "Cough Syrup", current_stock: 15, predicted_demand_next_30_days: 25, restock_alert: True, recommended_order_quantity: 20 },
            ]);
        }
        setLoadingAi(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                            <LockIcon size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl text-center font-bold text-slate-800 mb-2">Admin Portal</h1>
                    <p className="text-center text-slate-500 mb-6">Sign in to manage stock and view AI insights.</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="text" placeholder="Username" required defaultValue="admin" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        <input type="password" placeholder="Password" required defaultValue="admin123" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                            Secure Login
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col">
                <div className="p-6 border-b border-indigo-800 flex items-center gap-3">
                    <LayoutDashboard />
                    <span className="font-bold text-lg tracking-wide">PharmaAdmin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 bg-indigo-800 px-4 py-3 rounded-lg font-medium shadow-inner"><PackageSearch size={20}/> Stock Manager</a>
                    <a href="/pos" className="flex items-center gap-3 hover:bg-indigo-800/50 px-4 py-3 rounded-lg font-medium transition text-indigo-200"><TrendingUp size={20}/> POS terminal</a>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 w-full hover:bg-indigo-800/50 px-4 py-3 rounded-lg transition text-indigo-200">
                        <LogOut size={20}/> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Dashboard & AI Insights</h2>
                    <div className="text-sm text-slate-500">Welcome back, Admin</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Stock Management Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><PackageSearch size={20} className="text-indigo-600"/> Current Inventory</h3>
                            <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"><PlusCircle size={16}/> Add New</button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[500px]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b">
                                        <th className="pb-3 font-medium">Medicine</th>
                                        <th className="pb-3 font-medium">Stock</th>
                                        <th className="pb-3 font-medium">Price</th>
                                        <th className="pb-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                                            <td className="py-4">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.stock < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {item.stock} units
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-600">Rs. {item.price.toFixed(2)}</td>
                                            <td className="py-4 text-right">
                                                <button className="text-indigo-600 font-medium text-sm hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Demand Predictor Box */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden flex flex-col relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-bl-full opacity-20 pointer-events-none"></div>
                        <div className="p-6 border-b border-indigo-100 flex justify-between items-center z-10 bg-white/50 backdrop-blur-sm">
                            <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                                <Activity size={20} className="text-indigo-600"/> AI Demand Predictor
                            </h3>
                            <button onClick={fetchAiReport} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                                {loadingAi ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[500px] z-10 space-y-4">
                            <p className="text-sm text-slate-600 mb-2">Our AI model analyzes historical sales velocity to predict next month's stock requirements and generates automated restock alerts.</p>
                            
                            {loadingAi ? (
                                <div className="py-12 flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                aiReport.map((report, idx) => (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} key={idx} className={`p-4 rounded-xl border ${report.restock_alert ? 'border-orange-200 bg-orange-50/50' : 'border-indigo-100 bg-white shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800">{report.name}</h4>
                                            {report.restock_alert && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md">
                                                    <AlertTriangle size={14}/> LOW STOCK ALERT
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                            <div>
                                                <p className="text-slate-500 text-xs uppercase tracking-wider">Current Stock</p>
                                                <p className="font-semibold text-slate-700">{report.current_stock} units</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs uppercase tracking-wider">30-Day APD (AI)</p>
                                                <p className="font-semibold text-indigo-700">{report.predicted_demand_next_30_days} units req.</p>
                                            </div>
                                        </div>
                                        {report.restock_alert && (
                                            <div className="mt-4 pt-3 border-t border-orange-200flex items-center justify-between">
                                                <span className="text-sm text-orange-800 font-medium">Recommended Restock: <b>{report.recommended_order_quantity} units</b></span>
                                                <button className="text-xs font-bold bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition ml-auto block">Order Now</button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
