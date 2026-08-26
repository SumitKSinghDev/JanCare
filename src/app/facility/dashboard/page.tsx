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
  MapPin
} from "lucide-react";

export default function FacilityDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-bg-brand">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-brand flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-border-brand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="जनCare Logo" className="h-9 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t("dashboards.facility")}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary border-r border-slate-200 pr-3 mr-1">
              <button
                onClick={() => setLanguage("en")}
                className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
                  language === "en" ? "text-primary font-extrabold" : ""
                }`}
              >
                English
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setLanguage("hi")}
                className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
                  language === "hi" ? "text-primary font-extrabold" : ""
                }`}
              >
                हिन्दी
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setLanguage("mr")}
                className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
                  language === "mr" ? "text-primary font-extrabold" : ""
                }`}
              >
                मराठी
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Facility: Sinnar CHC Hub
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-deep-blue">Facility Operations Dashboard</h2>
          <p className="text-xs text-text-secondary mt-0.5">Manage clinics, queue flows, clinician schedules, and pharmacy inventories.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs">
            <span className="text-[10px] text-text-secondary font-bold uppercase">Patients Today</span>
            <span className="text-xl font-extrabold text-text-primary block mt-1">24</span>
          </div>
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs">
            <span className="text-[10px] text-text-secondary font-bold uppercase">Consultations</span>
            <span className="text-xl font-extrabold text-text-primary block mt-1">18</span>
          </div>
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs">
            <span className="text-[10px] text-text-secondary font-bold uppercase">Waiting In Q</span>
            <span className="text-xl font-extrabold text-primary block mt-1">4</span>
          </div>
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs border-l-4 border-l-green-500">
            <span className="text-[10px] text-green-600 font-bold uppercase">Doctors Avail.</span>
            <span className="text-xl font-extrabold text-green-700 block mt-1">3 / 4</span>
          </div>
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs border-l-4 border-l-orange-500">
            <span className="text-[10px] text-orange-500 font-bold uppercase">Referral Backlog</span>
            <span className="text-xl font-extrabold text-orange-600 block mt-1">2</span>
          </div>
          <div className="bg-white p-4 border border-border-brand rounded-2xl shadow-xs border-l-4 border-l-red-500">
            <span className="text-[10px] text-red-500 font-bold uppercase">Medicine Alerts</span>
            <span className="text-xl font-extrabold text-red-600 block mt-1">2</span>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Patient Flow Queue */}
          <div className="md:col-span-8 bg-white border border-border-brand p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-deep-blue">Real-Time Patient Flow Queue</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-brand text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Assigned Doctor</th>
                    <th className="py-2.5 px-4">Triage Status</th>
                    <th className="py-2.5 px-4">Wait Time</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-text-secondary">
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary">Ramesh Kumar</td>
                    <td className="py-3 px-4">Dr. Aniruddha Kulkarni</td>
                    <td className="py-3 px-4 text-orange-500 font-bold">🟠 Priority</td>
                    <td className="py-3 px-4">12 mins</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Waiting</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary">Laxmi Bai</td>
                    <td className="py-3 px-4">Dr. Aniruddha Kulkarni</td>
                    <td className="py-3 px-4 text-green-600 font-bold">🟢 Routine</td>
                    <td className="py-3 px-4">25 mins</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Waiting</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary">Sunil Naik</td>
                    <td className="py-3 px-4">Dr. Savita Patil</td>
                    <td className="py-3 px-4 text-red-500 font-bold">🔴 Urgent</td>
                    <td className="py-3 px-4">0 mins</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Consulting</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pharmacy Stocks & Alerts */}
          <div className="md:col-span-4 bg-white border border-border-brand p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-deep-blue">Pharmacy Medicine Stocks</h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <strong className="text-text-primary block">MC1</strong>
                  <span className="text-[10px] text-text-secondary">Quantity: 24 units | Min Required: 100</span>
                </div>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-[9px]">
                  Low Stock
                </span>
              </div>
              <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <strong className="text-text-primary block">MC2</strong>
                  <span className="text-[10px] text-text-secondary">Quantity: 0 units | Min Required: 50</span>
                </div>
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-md font-bold text-[9px]">
                  Out of Stock
                </span>
              </div>
              <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <strong className="text-text-primary block">MC3</strong>
                  <span className="text-[10px] text-text-secondary">Quantity: 180 units | Min Required: 80</span>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold text-[9px]">
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
