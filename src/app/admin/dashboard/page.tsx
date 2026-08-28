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
  Settings,
  Building,
  Video,
  Share2,
  RotateCcw,
  ClipboardList
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

  // District management entities states
  const [facilities, setFacilities] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTaluka, setFilterTaluka] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Admin settings config preferences
  const [alertThreshold, setAlertThreshold] = useState("3");
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  // Alerts acknowledge/resolve states
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    setSelectedFacility(null);
    setSearchQuery("");
    setFilterTaluka("All");
    setFilterType("All");
    setFilterStatus("All");
    setTabError("");

    if (activeTab === "Facilities") fetchFacilities();
    if (activeTab === "Patients") fetchPatients();
    if (activeTab === "Consultations") fetchConsultations();
    if (activeTab === "Medicine Availability" || activeTab === "Medicine Shortages") fetchMedicines();
    if (activeTab === "Referrals") fetchReferrals();
    if (activeTab === "Follow-ups") fetchFollowups();
    if (activeTab === "Audit Logs") fetchAuditLogs();
  }, [activeTab]);

  async function fetchFacilities() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/facilities");
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
      } else {
        setTabError(data.error || "Unable to load facilities.");
      }
    } catch (e) {
      setTabError("Failed to fetch facilities. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/patients");
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      } else {
        setTabError(data.error || "Unable to load patient directory.");
      }
    } catch (e) {
      setTabError("Failed to fetch patient records. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchConsultations() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/consultations");
      const data = await res.json();
      if (data.success) {
        setConsultations(data.consultations);
      } else {
        setTabError(data.error || "Unable to load consultations logs.");
      }
    } catch (e) {
      setTabError("Failed to fetch consultations. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchMedicines() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/medicines");
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      } else {
        setTabError(data.error || "Unable to load medicine inventory.");
      }
    } catch (e) {
      setTabError("Failed to fetch medicine stock. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchReferrals() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/referrals");
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals);
      } else {
        setTabError(data.error || "Unable to load referrals logs.");
      }
    } catch (e) {
      setTabError("Failed to fetch referrals logs. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchFollowups() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/followups");
      const data = await res.json();
      if (data.success) {
        setFollowups(data.followups);
      } else {
        setTabError(data.error || "Unable to load follow-ups queue.");
      }
    } catch (e) {
      setTabError("Failed to fetch follow-ups records. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

  async function fetchAuditLogs() {
    try {
      setTabLoading(true);
      setTabError("");
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      } else {
        setTabError(data.error || "Unable to load audit trails.");
      }
    } catch (e) {
      setTabError("Failed to fetch administrative audits. Please try again.");
    } finally {
      setTabLoading(false);
    }
  }

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">District Intelligence Command</h2>
              <p className="text-xs text-slate-300">Nashik District Network, Maharashtra</p>
            </div>
            
            <div className="flex gap-2 relative z-10 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDownloadDistrictReport}
                className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-md shadow-primary/20 w-full sm:w-auto"
              >
                <Download size={14} /> Download Report
              </button>
            </div>
          </div>

          {/* 8 Stats Metrics block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Total Patients</span>
              <strong className="text-base sm:text-lg font-extrabold text-slate-800 mt-1.5 block">18,420</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 12% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Consults</span>
              <strong className="text-base sm:text-lg font-extrabold text-primary mt-1.5 block">12,832</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 15% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-red-500">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block">High Risk Cases</span>
              <strong className="text-base sm:text-lg font-extrabold text-red-600 mt-1.5 block">1,245</strong>
              <span className="text-[8px] text-red-500 font-bold block mt-0.5">↑ 8% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Referrals</span>
              <strong className="text-base sm:text-lg font-extrabold text-orange-600 mt-1.5 block">2,345</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 10% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-green-500">
              <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider block">Referral Comp.</span>
              <strong className="text-base sm:text-lg font-extrabold text-green-700 mt-1.5 block">91%</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 6% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Follow-up Rate</span>
              <strong className="text-base sm:text-lg font-extrabold text-slate-800 mt-1.5 block">84%</strong>
              <span className="text-[8px] text-green-600 font-bold block mt-0.5">↑ 5% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Avg. Wait</span>
              <strong className="text-base sm:text-lg font-extrabold text-slate-800 mt-1.5 block">26 min</strong>
              <span className="text-[8px] text-red-500 font-bold block mt-0.5">↓ 8% vs LW</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Meds Availability</span>
              <strong className="text-base sm:text-lg font-extrabold text-slate-800 mt-1.5 block">87%</strong>
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

      {/* 2. MAHARASHTRA NETWORK */}
      {activeTab === "Maharashtra Network" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Maharashtra District Network Overview</h2>
              <span className="text-[10px] bg-blue-50 text-primary px-3 py-1 rounded-full font-bold">Active Hub: Nashik District</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Talukas Covered</span>
                <strong className="text-base text-slate-800 block mt-1">4 Active</strong>
                <span className="text-[8px] text-slate-500 block mt-0.5">Sinnar, Igatpuri, Dindori, Niphad</span>
              </div>
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Facilities</span>
                <strong className="text-base text-slate-800 block mt-1">16 Facilities</strong>
                <span className="text-[8px] text-slate-500 block mt-0.5">1 CHC | 12 PHCs | 3 Rural Hospitals</span>
              </div>
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Healthcare Workers</span>
                <strong className="text-base text-slate-800 block mt-1">84 Registered</strong>
                <span className="text-[8px] text-slate-500 block mt-0.5">24 Doctors | 60 ASHA Workers</span>
              </div>
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Referral Traffic</span>
                <strong className="text-base text-slate-800 block mt-1">2,345 Cases</strong>
                <span className="text-[8px] text-green-600 font-bold block mt-0.5">91% Completion Rate</span>
              </div>
            </div>

            <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Taluka Load Distribution</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-white">
                      <th className="py-2.5 px-4">Taluka Name</th>
                      <th className="py-2.5 px-4">Associated PHCs</th>
                      <th className="py-2.5 px-4">Doctors Assigned</th>
                      <th className="py-2.5 px-4">Active Patients</th>
                      <th className="py-2.5 px-4 text-center">Triage Urgent load</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-100/30">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Sinnar</td>
                      <td className="py-2.5 px-4">6 PHCs (Wavi, Chas, Musalgaon...)</td>
                      <td className="py-2.5 px-4">8 Doctors</td>
                      <td className="py-2.5 px-4">5,420 Patients</td>
                      <td className="py-2.5 px-4 text-center"><span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold">14 cases</span></td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-100/30">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Igatpuri</td>
                      <td className="py-2.5 px-4">4 PHCs (Kavnai, Ghoti...)</td>
                      <td className="py-2.5 px-4">6 Doctors</td>
                      <td className="py-2.5 px-4">4,120 Patients</td>
                      <td className="py-2.5 px-4 text-center"><span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-bold">8 cases</span></td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-100/30">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Dindori</td>
                      <td className="py-2.5 px-4">3 PHCs</td>
                      <td className="py-2.5 px-4">5 Doctors</td>
                      <td className="py-2.5 px-4">3,890 Patients</td>
                      <td className="py-2.5 px-4 text-center"><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">3 cases</span></td>
                    </tr>
                    <tr className="hover:bg-slate-100/30">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Niphad</td>
                      <td className="py-2.5 px-4">3 PHCs</td>
                      <td className="py-2.5 px-4">5 Doctors</td>
                      <td className="py-2.5 px-4">4,990 Patients</td>
                      <td className="py-2.5 px-4 text-center"><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">2 cases</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FACILITIES */}
      {activeTab === "Facilities" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!selectedFacility ? (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Facilities Registry</h2>
                  <p className="text-[10px] text-slate-400">Total: {facilities.length} active nodes tracked in Nashik</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                  >
                    <option value="All">All Types</option>
                    <option value="PHC">PHC</option>
                    <option value="CHC">CHC</option>
                    <option value="SubCentre">Sub Centre</option>
                  </select>
                </div>
              </div>

              {tabLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : tabError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">{tabError}</div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                        <th className="py-2.5 px-4">Facility Name</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Taluka</th>
                        <th className="py-2.5 px-4">District</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facilities.filter(f => filterType === "All" || f.type === filterType).map((fac) => (
                        <tr key={fac._id} className="hover:bg-slate-50/40">
                          <td className="py-3 px-4 font-bold text-slate-700">{fac.name}</td>
                          <td className="py-3 px-4 font-semibold text-slate-550">{fac.type}</td>
                          <td className="py-3 px-4 text-slate-500">{fac.taluka || "Sinnar"}</td>
                          <td className="py-3 px-4 text-slate-500">{fac.district || "Nashik"}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedFacility(fac)}
                              className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-1 px-3 rounded-lg border-0 cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Facility Detail Panel */
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in zoom-in-98 duration-200">
              <div className="border-b border-slate-100 pb-4">
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-bold"
                >
                  ← Back to Facilities Directory
                </button>
                <h2 className="text-lg font-extrabold text-slate-800 mt-2">Facility Insights: {selectedFacility.name}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-xs">
                {/* Summary demographics */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <strong className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Demographics</strong>
                  <div className="space-y-2 text-slate-655 font-semibold">
                    <p><span className="text-slate-450 block text-[9px] uppercase">Facility ID</span> {selectedFacility._id}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Node Type</span> {selectedFacility.type}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Taluka</span> {selectedFacility.taluka || "Sinnar"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">District</span> {selectedFacility.district || "Nashik"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Region Coordinates</span> {selectedFacility.coordinates || "19.8517,74.0006"}</p>
                  </div>
                </div>

                {/* Operations Load status */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 md:col-span-2">
                  <strong className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Operational Status & Load</strong>
                  <div className="grid grid-cols-2 gap-4 font-bold">
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Bed Capacity</span>
                      <span className="text-base text-slate-800">12 beds</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Operational Status</span>
                      <span className="text-green-700 text-xs mt-1 block flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Active / Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. PATIENTS */}
      {activeTab === "Patients" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">District Patient Registry</h2>
              <p className="text-[10px] text-slate-400">Total database footprint: {patients.length} patients</p>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <input
                type="text"
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-hidden pl-2 text-xs"
              />
            </div>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : tabError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">{tabError}</div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Ref ID</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Age/Gender</th>
                    <th className="py-2.5 px-4">Village</th>
                    <th className="py-2.5 px-4">Taluka</th>
                    <th className="py-2.5 px-4">Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.patientRefId?.toLowerCase().includes(searchQuery.toLowerCase())).map((pat) => (
                    <tr key={pat._id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">{pat.patientRefId}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{pat.name}</td>
                      <td className="py-3 px-4 text-slate-500">{pat.age}y / {pat.gender}</td>
                      <td className="py-3 px-4 text-slate-500">{pat.village}</td>
                      <td className="py-3 px-4 text-slate-500">{pat.taluka || "Sinnar"}</td>
                      <td className="py-3 px-4 text-slate-500">{pat.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. CONSULTATIONS */}
      {activeTab === "Consultations" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Teleconsultation logs</h2>
            <p className="text-[10px] text-slate-400">Total Scheduled/Active sessions: {consultations.length}</p>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : tabError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">{tabError}</div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Patient ID</th>
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Physician</th>
                    <th className="py-2.5 px-4">Video Room</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consultations.map((cons) => (
                    <tr key={cons._id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">{cons.patientId?.patientRefId}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{cons.patientId?.name || "Ramesh Kumar"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{cons.doctorId?.name || "Dr. Aniruddha Kulkarni"}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{cons.videoRoomName || "jancare-consult-room"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cons.status === "Completed" ? "bg-green-50 text-green-700" : "bg-blue-50 text-primary animate-pulse"}`}>
                          {cons.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. MEDICINE AVAILABILITY */}
      {activeTab === "Medicine Availability" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Medicine Stock Availability</h2>
              <p className="text-[10px] text-slate-400">Total drugs types cataloged: {medicines.length}</p>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <input
                type="text"
                placeholder="Search drug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-hidden pl-2 text-xs"
              />
            </div>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Generic Code</th>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Available Quantity</th>
                    <th className="py-2.5 px-4">Minimum Required</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((med) => {
                    const isLow = med.quantity < med.minimumRequired;
                    const isOut = med.quantity === 0;
                    return (
                      <tr key={med._id} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">{med.sku || "GEN-SKU"}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{med.name}</td>
                        <td className="py-3 px-4 font-semibold">{med.quantity} Units</td>
                        <td className="py-3 px-4 text-slate-400">{med.minimumRequired} Units</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isOut ? "bg-red-50 text-red-750" : isLow ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                          }`}>
                            {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "AVAILABLE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. MEDICINE SHORTAGES */}
      {activeTab === "Medicine Shortages" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Critical Stock Shortages</h2>
            <p className="text-[10px] text-slate-400">Inventory levels falling below safety threshold</p>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Available Quantity</th>
                    <th className="py-2.5 px-4">Threshold</th>
                    <th className="py-2.5 px-4">Severity level</th>
                    <th className="py-2.5 px-4 text-center">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.filter(m => m.quantity < m.minimumRequired).length > 0 ? (
                    medicines.filter(m => m.quantity < m.minimumRequired).map((med) => {
                      const isOut = med.quantity === 0;
                      return (
                        <tr key={med._id} className="hover:bg-slate-50/40">
                          <td className="py-3 px-4 font-bold text-slate-700">{med.name}</td>
                          <td className="py-3 px-4 font-semibold text-red-600">{med.quantity} Units</td>
                          <td className="py-3 px-4 text-slate-400">{med.minimumRequired} Units</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${isOut ? "text-red-700" : "text-orange-600"}`}>
                              {isOut ? "Critical" : "High"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-red-50 text-red-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Initiate Stock Transfer</span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-mono italic">
                        All tracked medicines are currently above the critical threshold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. REFERRALS */}
      {activeTab === "Referrals" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Referrals Coordinator Log</h2>
            <p className="text-[10px] text-slate-400">Total active referrals: {referrals.length}</p>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Referral ID</th>
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Referring Doctor</th>
                    <th className="py-2.5 px-4">Receiving Facility</th>
                    <th className="py-2.5 px-4 text-center">Priority</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrals.map((ref) => (
                    <tr key={ref._id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">{ref._id.toString().slice(-6).toUpperCase()}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{ref.patientId?.name || "Patient Record"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{ref.referredById?.name || "Dr. Kulkarni"}</td>
                      <td className="py-3 px-4 text-slate-500">{ref.targetFacilityId?.name || "CHC Sinnar"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ref.priority === "Urgent" ? "bg-red-50 text-red-700" : "bg-blue-50 text-primary"
                        }`}>
                          {ref.priority || "Routine"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 9. FOLLOW-UPS */}
      {activeTab === "Follow-ups" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">ASHA Outreach Follow-ups</h2>
            <p className="text-[10px] text-slate-400">Total recovery follow-ups: {followups.length}</p>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Assigned Worker</th>
                    <th className="py-2.5 px-4">Follow-up Reason</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {followups.map((follow) => (
                    <tr key={follow._id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 font-bold text-slate-700">{follow.patientId?.name || "Patient Record"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{follow.assignedWorkerId?.name || "Sharda Patil"}</td>
                      <td className="py-3 px-4 text-slate-500">{follow.reason}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{new Date(follow.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          follow.status === "Completed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700 animate-pulse"
                        }`}>
                          {follow.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 10. ANALYTICS */}
      {activeTab === "Analytics" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">Deeps Insights: District Population trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barAgeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="group" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  <Bar dataKey="patients" fill="#1464D2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 11. ALERTS */}
      {activeTab === "Alerts" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">District Alerts Center</h2>
            <p className="text-[10px] text-slate-400">Review critical warnings from outreach operations</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="border border-red-200 rounded-2xl p-4 bg-red-50/50 flex justify-between items-center">
              <div>
                <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider block w-max">Critical</span>
                <strong className="text-slate-800 text-xs block mt-1.5">ORS Stock Outage at Sinnar PHC-01</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reported: Today, 12:45 PM | SKU: ORS-SKU</span>
              </div>
              <button
                onClick={() => alert("Alert Acknowledged. Notified Medicine Manager.")}
                className="bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl border-0 cursor-pointer"
              >
                Acknowledge
              </button>
            </div>

            <div className="border border-orange-200 rounded-2xl p-4 bg-orange-50/50 flex justify-between items-center">
              <div>
                <span className="bg-orange-100 text-orange-850 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider block w-max">Warning</span>
                <strong className="text-slate-800 text-xs block mt-1.5">Unusually High Patient Load at Sinnar CHC</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reported: Yesterday | Wait time average exceeded 30 mins</span>
              </div>
              <button
                onClick={() => alert("Alert Marked Resolved.")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl border-0 cursor-pointer"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. AUDIT LOGS */}
      {activeTab === "Audit Logs" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Administrative Audit Trails</h2>
            <p className="text-[10px] text-slate-400">Security audit records log (Read-only)</p>
          </div>

          {tabLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Operator</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">{log.userId?.name || "System"} ({log.userId?.role || "Admin"})</td>
                        <td className="py-2.5 px-4 text-blue-700 font-bold">{log.action}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-sans">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-mono italic">
                        No audit records generated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 13. SETTINGS */}
      {activeTab === "Settings" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200 text-xs">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Admin Console Settings</h2>
            <p className="text-[10px] text-slate-400">Configure thresholds, notification intervals, and sync scopes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            <div className="space-y-4">
              <strong className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block border-b pb-1">Operation Thresholds</strong>
              <div>
                <label className="block font-bold text-slate-700">Stock Safety Warning Limit (Min Units Required)</label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="3">3 Days Estimated Demand</option>
                  <option value="5">5 Days Estimated Demand</option>
                  <option value="10">10 Days Estimated Demand</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Background Data Refresh Interval</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="30">Every 30 Seconds</option>
                  <option value="60">Every 1 Minute</option>
                  <option value="300">Every 5 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <strong className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block border-b pb-1">Email Alerts Notifications</strong>
              <div className="space-y-3 font-semibold text-slate-655 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                  <span>Dispatch Daily Summary Reports via Email</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criticalAlerts}
                    onChange={(e) => setCriticalAlerts(e.target.checked)}
                  />
                  <span>Critical Inventory Outage SMS Alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
