"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import Link from "next/link";
import {
  Users,
  Activity,
  UserCheck,
  Package,
  AlertTriangle,
  LogOut,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  ClipboardList
} from "lucide-react";
import AppShell from "@/components/AppShell";

export default function FacilityDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    fetchFacilityData();
  }, []);

  async function fetchFacilityData() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.success) {
        router.push("/login");
        return;
      }
      setCurrentUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Facility Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      role="Facility"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={currentUser}
    >
      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          <div className="text-left bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Facility Operations Dashboard</h2>
              <p className="text-xs text-slate-300">Manage clinics, patient flow queues, clinician schedules, and pharmacy inventories.</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Patients Today</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">24</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Consultations</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">18</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Waiting In Q</span>
              <span className="text-xl font-extrabold text-primary block mt-1">4</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs border-l-4 border-l-green-500">
              <span className="text-[8px] text-green-600 font-bold uppercase tracking-wider">Doctors Avail.</span>
              <span className="text-xl font-extrabold text-green-700 block mt-1">3 / 4</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs border-l-4 border-l-orange-500">
              <span className="text-[8px] text-orange-500 font-bold uppercase tracking-wider">Referrals</span>
              <span className="text-xl font-extrabold text-orange-600 block mt-1">2</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs border-l-4 border-l-red-500">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">Stock Alerts</span>
              <span className="text-xl font-extrabold text-red-600 block mt-1">2 Alerts</span>
            </div>
          </div>

          {/* Dynamic Panels */}
          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Patient Flow Queue */}
            <div className="md:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Real-Time Patient Flow Queue</h3>
              
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">Patient</th>
                      <th className="py-2.5 px-4">Assigned Doctor</th>
                      <th className="py-2.5 px-4">Triage Status</th>
                      <th className="py-2.5 px-4">Wait Time</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-bold text-slate-700">Ramesh Kumar</td>
                      <td className="py-3 px-4">Dr. Aniruddha Kulkarni</td>
                      <td className="py-3 px-4 text-orange-500 font-bold">🟠 Priority</td>
                      <td className="py-3 px-4">12 mins</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-orange-100 text-orange-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Waiting</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-bold text-slate-700">Laxmi Bai</td>
                      <td className="py-3 px-4">Dr. Aniruddha Kulkarni</td>
                      <td className="py-3 px-4 text-green-600 font-bold">🟢 Routine</td>
                      <td className="py-3 px-4">25 mins</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-orange-100 text-orange-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Waiting</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-bold text-slate-700">Sunil Naik</td>
                      <td className="py-3 px-4">Dr. Savita Patil</td>
                      <td className="py-3 px-4 text-red-500 font-bold">🔴 Urgent</td>
                      <td className="py-3 px-4">0 mins</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-green-100 text-green-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Consulting</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pharmacy Stocks & Alerts */}
            <div className="md:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Pharmacy Medicine Stocks</h3>
              
              <div className="space-y-3">
                <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 block">MC1</strong>
                    <span className="text-[10px] text-slate-400">Quantity: 24 units | Min Required: 100</span>
                  </div>
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold text-[9px]">
                    Low Stock
                  </span>
                </div>
                <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 block">MC2</strong>
                    <span className="text-[10px] text-slate-400">Quantity: 0 units | Min Required: 50</span>
                  </div>
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-md font-bold text-[9px]">
                    Out of Stock
                  </span>
                </div>
                <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 block">MC3</strong>
                    <span className="text-[10px] text-slate-400">Quantity: 180 units | Min Required: 80</span>
                  </div>
                  <span className="bg-green-55 text-green-700 px-2 py-0.5 rounded-md font-bold text-[9px]">
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OTHER TABVIEWS */}
      {activeTab !== "Dashboard" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[400px]">
          <h2 className="text-lg font-extrabold text-slate-800">{activeTab} Panel</h2>
          <p className="text-xs text-slate-500">Operations workspace for {activeTab} information logs.</p>
          
          <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-2">
            <ClipboardList size={32} className="text-slate-300 animate-pulse" />
            <span>Currently showing {activeTab} details.</span>
            <button
              onClick={() => setActiveTab("Dashboard")}
              className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent mt-2 text-xs"
            >
              Back to Operations Dashboard
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
