'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '@/utils/axiosSetup';
import { useAuth } from '@/lib/auth-context';

const AdminContext = createContext<any>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [pharmacySettings, setPharmacySettings] = useState<any>(null);
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAiReport = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/ai/report");
      const data = await res.json();
      if (data.status === "success") {
        setAiAlerts(data.alerts || []);
      }
    } catch (err) {
      console.log("AI Intelligence Hub Offline");
    }
  };

  const fetchAllData = async () => {
    try {
      const [inv, ord, urs, trns, cats, dels, settings] = await Promise.allSettled([
        axiosInstance.get('/medicines/'),
        axiosInstance.get('/sales/'),
        axiosInstance.get('/users/'),
        axiosInstance.get('/payment-transactions/'),
        axiosInstance.get('/categories/'),
        axiosInstance.get('/delivery-options/'),
        axiosInstance.get('/pharmacy-settings/')
      ]);
      // Apply each result independently so one failure doesn't block the rest
      if (inv.status === 'fulfilled') setInventory(inv.value.data || []);
      if (ord.status === 'fulfilled') setOrders(ord.value.data || []);
      if (urs.status === 'fulfilled') setUsers(urs.value.data || []);
      if (trns.status === 'fulfilled') setTransactions(trns.value.data || []);
      if (cats.status === 'fulfilled') setCategories(cats.value.data || []);
      if (dels.status === 'fulfilled') setDeliveryOptions(dels.value.data || []);
      if (settings.status === 'fulfilled') setPharmacySettings(settings.value.data?.[0] || null);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshInventory = async () => {
    try {
      const res = await axiosInstance.get('/medicines/');
      setInventory(res.data || []);
    } catch (err) {
      console.error("Failed to refresh inventory", err);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllData();
      fetchAiReport();
    }
  }, [user]);

  return (
    <AdminContext.Provider value={{
      inventory, setInventory,
      orders, setOrders,
      users, setUsers,
      transactions, setTransactions,
      categories, setCategories,
      deliveryOptions, setDeliveryOptions,
      pharmacySettings, setPharmacySettings,
      aiAlerts, setAiAlerts,
      loading,
      refresh: fetchAllData,
      refreshInventory,
      fetchAiReport
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
