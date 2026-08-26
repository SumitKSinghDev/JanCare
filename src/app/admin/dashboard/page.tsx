"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  TrendingUp,
  Activity,
  Users,
  AlertTriangle,
  FolderOpen,
  MapPin,
  ClipboardCheck,
  Package,
  LogOut,
  Loader2,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Download,
  Filter,
  FileSpreadsheet,
  Settings
} from "lucide-react";
import AppShell from "@/components/AppShell";

export default function AdminDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  async function fetchAnalyticsData() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      } else {
        router.push("/login");
      }
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

  function handleDownloadDistrictReport() {
    let content = `=========================================\n`;
    content += `     JANCARE DISTRICT INTEL REPORT       \n`;
    content += `=========================================\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `District: Nashik District, Maharashtra\n`;
    content += `----------------------------------------\n`;
    content += `OPERATIONAL METRICS:\n`;
    content += `- Total Patient Registry: 18,420\n`;
    content += `- Total Consultations: 12,832\n`;
    content += `- High Risk Cases: 1,245\n`;
    content += `- Total Referrals: 2,345\n`;
    content += `- Referral Completion Rate: 91%\n`;
    content += `- Follow-up Completion Rate: 84%\n`;
    content += `- Average Wait Time: 26 minutes\n`;
    content += `- Medicine Availability: 87%\n`;
    content += `----------------------------------------\n`;
    content += `MEDICINE STOCK Visibility OUTCOMES:\n`;
    content += `- Paracetamol 500mg: 8 Facilities affected | Severity: HIGH\n`;
    content += `- ORS: 6 Facilities affected | Severity: HIGH\n`;
    content += `- Amoxicillin 500mg: 5 Facilities affected | Severity: MEDIUM\n`;
    content += `- Metformin 500mg: 3 Facilities affected | Severity: LOW\n`;
    content += `- Azithromycin 500mg: 2 Facilities affected | Severity: LOW\n`;
    content += `=========================================\n`;
    content += `End of Nashik District Admin Report.\n`;

    const file = new Blob([content], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "Nashik_District_Admin_Report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Intelligence Analytics...</p>
        </div>
      </div>
    );
  }

  const lineChartData = [
    { name: "20 Aug", value: 900 },
    { name: "21 Aug", value: 1200 },
    { name: "22 Aug", value: 1100 },
    { name: "23 Aug", value: 1400 },
    { name: "24 Aug", value: 1300 },
    { name: "25 Aug", value: 1700 },
    { name: "26 Aug", value: 1500 }
  ];

  const donutRiskData = [
    { name: "High", value: 1245, color: "#DC2626" },
    { name: "Medium", value: 2835, color: "#F59E0B" },
    { name: "Low", value: 1640, color: "#16A34A" }
  ];

  const barWorkloadData = [
    { name: "PHC-01", value: 86 },
    { name: "PHC-02", value: 72 },
    { name: "PHC-03", value: 68 },
    { name: "CHC-01", value: 55 },
    { name: "Rural Hosp-02", value: 48 }
  ];

  const barAgeData = [
    { group: "0-5", patients: 1200 },
    { group: "6-18", patients: 2100 },
    { group: "19-35", patients: 3200 },
    { group: "36-50", patients: 2800 },
    { group: "51-65", patients: 2450 },
    { group: "65+", patients: 1800 }
  ];

  const donutReferralData = [
    { name: "Completed", value: 2134, color: "#16A34A" },
    { name: "In Progress", value: 162, color: "#F59E0B" },
    { name: "Overdue", value: 49, color: "#DC2626" }
  ];

  const medicineShortages = [
    { name: "Paracetamol 500 mg", count: 8, severity: "High", date: "26 Aug 2026" },
    { name: "ORS", count: 6, severity: "High", date: "26 Aug 2026" },
    { name: "Amoxicillin 500 mg", count: 5, severity: "Medium", date: "25 Aug 2026" },
    { name: "Metformin 500 mg", count: 3, severity: "Low", date: "26 Aug 2026" },
    { name: "Azithromycin 500 mg", count: 2, severity: "Low", date: "24 Aug 2026" }
  ];

  return (
    <AppShell
      role="Admin"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={{ name: "District Admin" }}
    >
      {/* 1. OVERVIEW VIEW */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">District Intelligence Command</h2>
              <p className="text-xs text-slate-300">Nashik District Network, Maharashtra</p>
            </div>
            
            <div className="flex gap-2 relative z-10 shrink-0">
              <button
                onClick={handleDownloadDistrictReport}
                className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border-0 shadow-md shadow-primary/20"
              >
                <Download size={14} /> Download Report
              </button>
            </div>
          </div>

          {/* 8 Stats Metrics block */}
          <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Total Patients</span>
              <strong className="text-lg font-extrabold text-slate-800 mt-1.5 block">18,420</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 12% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Consults</span>
              <strong className="text-lg font-extrabold text-primary mt-1.5 block">12,832</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 15% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-red-500">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block">High Risk Cases</span>
              <strong className="text-lg font-extrabold text-red-600 mt-1.5 block">1,245</strong>
              <span className="text-[8px] text-red-500 font-bold block mt-0.5">↑ 8% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Referrals</span>
              <strong className="text-lg font-extrabold text-orange-600 mt-1.5 block">2,345</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 10% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-green-500">
              <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider block">Referral Comp.</span>
              <strong className="text-lg font-extrabold text-green-700 mt-1.5 block">91%</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 6% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Follow-up Rate</span>
              <strong className="text-lg font-extrabold text-slate-800 mt-1.5 block">84%</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 5% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Avg. Wait</span>
              <strong className="text-lg font-extrabold text-slate-800 mt-1.5 block">26 min</strong>
              <span className="text-[8px] text-red-500 font-bold block mt-0.5">↓ 8% vs LW</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Meds Availability</span>
              <strong className="text-lg font-extrabold text-slate-800 mt-1.5 block">87%</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 4% vs LW</span>
            </div>
          </div>

          {/* Charts Section: 4 charts aligned with references */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Chart 1: Consultations Trend (Line) */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
                Consultations Trend <span className="text-[8px] text-slate-400 lowercase font-medium">(Last 7 Days)</span>
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Risk Profile Distribution (Donut) */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
                Triage Severity Profile
              </h3>
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutRiskData} innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                      {donutRiskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col mt-4">
                  <span className="text-xs font-extrabold text-slate-800">5.7k</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Total Cases</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Facility Workload Completion (Bar) */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
                Facility Workload
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barWorkloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Referrals Status Donut */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
                Referral Conversions
              </h3>
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutReferralData} innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                      {donutReferralData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col mt-4">
                  <span className="text-xs font-extrabold text-slate-800">2.3k</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Referrals</span>
                </div>
              </div>
            </div>

          </div>

          {/* Lower Section: Medicine Shortages list */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Medicine Shortages Alerts</h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Medicine Item</th>
                    <th className="py-2.5 px-4">Facilities Affected</th>
                    <th className="py-2.5 px-4">Severity Action</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {medicineShortages.map((med, index) => (
                    <tr key={index} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-bold text-slate-700">{med.name}</td>
                      <td className="py-3 px-4">{med.count} facilities</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${med.severity === "High" ? "text-red-550" : "text-amber-500"}`}>{med.severity} Priority</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-red-50 text-red-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Stock Shortage</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. OTHER TABVIEWS */}
      {activeTab !== "Overview" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[400px]">
          <h2 className="text-lg font-extrabold text-slate-800">{activeTab} Workstation</h2>
          <p className="text-xs text-slate-500">Panel for District Admin {activeTab} analytics logs.</p>
          
          <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-2">
            <FileSpreadsheet size={32} className="text-slate-300 animate-pulse" />
            <span>Currently showing {activeTab} command interface.</span>
            <button
              onClick={() => setActiveTab("Overview")}
              className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent mt-2 text-xs"
            >
              Back to Overview Dashboard
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
