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
  Filter
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Last 7 Days");

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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F9FC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm font-semibold text-text-secondary">Loading operations intelligence...</p>
        </div>
      </div>
    );
  }

  // Real charts dataset aligned with reference images:
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
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans pb-16 md:pb-0 select-none">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-border-brand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="जनCare Logo" className="h-9 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t("dashboards.district")}</span>
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

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Nashik District Admin
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors bg-transparent border-0 cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 text-left">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-deep-blue">District Admin Dashboard</h2>
            <p className="text-xs text-text-secondary mt-0.5">Nashik District, Maharashtra</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-secondary">Last updated: Today, 11:30 AM</span>
            <button
              onClick={handleDownloadDistrictReport}
              className="bg-primary hover:bg-deep-blue text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border-0 transition-colors"
            >
              <Download size={14} /> Download Report
            </button>
            <button className="border border-slate-200 bg-white hover:bg-slate-50 text-text-primary text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>

        {/* 8 Stats Metrics block matching reference exactly */}
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Total Patients</span>
            <strong className="text-lg font-extrabold text-deep-blue mt-1.5 block">18,420</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 12% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Consultations</span>
            <strong className="text-lg font-extrabold text-primary mt-1.5 block">12,832</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 15% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs border-l-4 border-l-red-500">
            <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block">High Risk Cases</span>
            <strong className="text-lg font-extrabold text-red-600 mt-1.5 block">1,245</strong>
            <span className="text-[8px] text-red-500 font-bold block mt-0.5">↑ 8% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Referrals</span>
            <strong className="text-lg font-extrabold text-orange-600 mt-1.5 block">2,345</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 10% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs border-l-4 border-l-green-500">
            <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider block">Referral Comp. Rate</span>
            <strong className="text-lg font-extrabold text-green-700 mt-1.5 block">91%</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 6% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Follow-up Rate</span>
            <strong className="text-lg font-extrabold text-text-primary mt-1.5 block">84%</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 5% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Avg. Waiting Time</span>
            <strong className="text-lg font-extrabold text-text-primary mt-1.5 block">26 min</strong>
            <span className="text-[8px] text-red-500 font-bold block mt-0.5">↓ 8% vs last week</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-border-brand shadow-xs">
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider block">Medicine Avail.</span>
            <strong className="text-lg font-extrabold text-text-primary mt-1.5 block">87%</strong>
            <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 4% vs last week</span>
          </div>
        </div>

        {/* Charts Section: 4 charts aligned with references */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Chart 1: Consultations Trend (Line) */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Consultations Trend <span className="text-[8px] text-text-secondary lowercase font-medium">(Last 7 Days)</span>
            </h3>
            <div className="h-44 w-full text-[9px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1464D2" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Risk Distribution (Donut) */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Risk Distribution
            </h3>
            <div className="h-32 w-full flex justify-center text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 text-[9px] font-bold text-text-secondary mt-1">
              {donutRiskData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Facility Workload (Bar) */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Facility Workload
            </h3>
            <div className="h-44 w-full text-[9px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barWorkloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Patients by Age Group (Bar) */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Patients by Age Group
            </h3>
            <div className="h-44 w-full text-[9px] font-bold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barAgeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="group" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Lower Section: Maharashtra District Map & Medicine Table */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Column (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Maharashtra District Map
            </h3>

            {/* Render interactive OpenStreetMap of Maharashtra state */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl h-60 overflow-hidden relative">
              <iframe
                className="w-full h-full border-0 rounded-xl"
                src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Maharashtra,India`
                  : "https://www.openstreetmap.org/export/embed.html?bbox=72.0%2C15.0%2C81.0%2C22.5&layer=mapnik"
                }
                title="Maharashtra State Map"
              />
            </div>
          </div>

          {/* Medicine shortages Table (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Medicine Shortages
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-border-brand font-bold text-slate-400">
                    <th className="py-2">Medicine</th>
                    <th className="py-2 text-center">Facilities Affected</th>
                    <th className="py-2 text-center">Severity</th>
                    <th className="py-2 text-right">Last Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-text-primary">
                  {medicineShortages.map((med, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">{med.name}</td>
                      <td className="py-2.5 text-center">{med.count}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${
                          med.severity === "High" ? "bg-red-50 text-red-700" : med.severity === "Medium" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                        }`}>
                          {med.severity}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-text-secondary">{med.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Referral completion Donut (3 cols) */}
          <div className="lg:col-span-3 bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Referral Completion Overview
            </h3>

            <div className="h-32 w-full flex justify-center text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutReferralData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutReferralData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[9px] space-y-1 font-bold text-text-secondary">
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Completed</span>
                <span className="text-text-primary">2,134 (91%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> In Progress</span>
                <span className="text-text-primary">162 (7%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Overdue</span>
                <span className="text-text-primary">49 (2%)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom row: Alerts Table & Top performing facilities */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Recent Alerts & Notifications */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs text-xs space-y-3">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Recent Alerts & Notifications
            </h3>
            
            <div className="space-y-3 font-semibold">
              <div className="flex items-start gap-2.5 p-2 bg-red-50/50 border border-red-200/50 rounded-xl">
                <AlertTriangle className="text-red-500 shrink-0" size={14} />
                <div>
                  <strong className="text-text-primary block font-bold text-red-700">High Risk Alert</strong>
                  <p className="text-[10px] text-text-secondary mt-0.5">15 new high risk cases reported in last 24 hours across 5 PHCs.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                <div>
                  <strong className="text-text-primary block font-bold text-amber-700">Medicine Shortage</strong>
                  <p className="text-[10px] text-text-secondary mt-0.5">ORS is out of stock in PHC-03 and PHC-07. Procurement initiated.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-200/60 rounded-xl">
                <Calendar className="text-primary shrink-0" size={14} />
                <div>
                  <strong className="text-text-primary block font-bold">Follow-up Overdue</strong>
                  <p className="text-[10px] text-text-secondary mt-0.5">32 follow-ups are overdue across the district. ASHA alerts sent.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Facilities */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs text-xs space-y-3">
            <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
              Top Performing Facilities
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-border-brand text-slate-400 font-bold">
                    <th className="py-2">Facility</th>
                    <th className="py-2 text-center">Consultations</th>
                    <th className="py-2 text-center">Follow-up Completion</th>
                    <th className="py-2 text-right">Patient Satisfaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-text-primary">
                  <tr>
                    <td className="py-2">PHC-01</td>
                    <td className="py-2 text-center">1,245</td>
                    <td className="py-2 text-center text-green-700">95%</td>
                    <td className="py-2 text-right">⭐ 4.8 / 5.0</td>
                  </tr>
                  <tr>
                    <td className="py-2">PHC-05</td>
                    <td className="py-2 text-center">1,102</td>
                    <td className="py-2 text-center text-green-700">93%</td>
                    <td className="py-2 text-right">⭐ 4.7 / 5.0</td>
                  </tr>
                  <tr>
                    <td className="py-2">CHC-02</td>
                    <td className="py-2 text-center">980</td>
                    <td className="py-2 text-center text-green-700">92%</td>
                    <td className="py-2 text-right">⭐ 4.6 / 5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
