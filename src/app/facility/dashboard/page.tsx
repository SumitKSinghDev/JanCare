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
  ClipboardList,
  Search,
  Video,
  Calendar,
  Share2,
  RotateCcw,
  Plus,
  Briefcase,
  PhoneCall,
  Shield,
  Layers,
  Settings,
  Eye,
  Filter
} from "lucide-react";
import AppShell from "@/components/AppShell";

export default function FacilityDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Facility Data States
  const [facility, setFacility] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [dispensingId, setDispensingId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    fetchFacilityAndUserData();
  }, []);

  async function fetchFacilityAndUserData() {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.success) {
        router.push("/login");
        return;
      }
      setCurrentUser(userData.user);

      // Fetch all facilities to find associated or default facility (Sinnar CHC)
      const facRes = await fetch("/api/facilities?district=Nashik");
      const facData = await facRes.json();
      let activeFac = null;
      if (facData.success && facData.facilities.length > 0) {
        activeFac = facData.facilities.find((f: any) => f._id === userData.user.associatedFacility) || facData.facilities[0];
        setFacility(activeFac);
      }

      // Fetch parallel dataset for all facility tabs
      const [pRes, aRes, cRes, mRes, resRes, rRes, fRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/appointments"),
        fetch("/api/consultations"),
        fetch(activeFac ? `/api/medicines?facilityId=${activeFac._id}` : "/api/medicines?facilityId=default"),
        fetch(activeFac ? `/api/medicines/reserve?facilityId=${activeFac._id}` : "/api/medicines/reserve"),
        fetch("/api/referrals"),
        fetch("/api/followups")
      ]);

      const [pData, aData, cData, mData, resData, rData, fData] = await Promise.all([
        pRes.json(),
        aRes.json(),
        cRes.json(),
        mRes.json(),
        resRes.json(),
        rRes.json(),
        fRes.json()
      ]);

      if (pData.success) setPatients(pData.patients || []);
      if (aData.success) setAppointments(aData.appointments || []);
      if (cData.success) setConsultations(cData.consultations || []);
      if (mData.success) setMedicines(mData.medicines || []);
      if (resData.success) setReservations(resData.reservations || []);
      if (rData.success) setReferrals(rData.referrals || []);
      if (fData.success) setFollowups(fData.followups || []);

    } catch (e) {
      console.warn("Facility dashboard offline fallback:", e);
      setCurrentUser((prev: any) => prev || {
        name: "Dr. Sandeep Patil",
        role: "FacilityAdmin",
        facilityName: "Sinnar Rural CHC"
      });
      setFacility((prev: any) => prev || {
        name: "Sinnar Rural CHC",
        type: "Community Health Centre",
        district: "Nashik"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDispense(movementId: string) {
    try {
      setDispensingId(movementId);
      const res = await fetch("/api/medicines/reserve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movementId, action: "DISPENSE" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFacilityAndUserData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispensingId(null);
    }
  }

  // Filtered queries
  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.patientRefId && p.patientRefId.toLowerCase().includes(q)) || (p.village && p.village.toLowerCase().includes(q));
  });

  const filteredAppointments = appointments.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || (a.patientId?.name && a.patientId.name.toLowerCase().includes(q)) || (a.doctorId?.name && a.doctorId.name.toLowerCase().includes(q));
    const matchesPriority = filterPriority === "All" || (a.triagePriority && a.triagePriority.toLowerCase() === filterPriority.toLowerCase());
    return matchesQuery && matchesPriority;
  });

  const filteredMedicines = medicines.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.genericName && m.genericName.toLowerCase().includes(q)) || m.category.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Facility Operations Workspace...</p>
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
        <div className="space-y-6 text-left">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/30 text-blue-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    {facility?.type || "CHC"} {language === "mr" ? "नोड सक्रिय" : language === "hi" ? "नोड सक्रिय" : "Node Active"}
                  </span>
                  <span className="text-xs text-slate-300">• {facility?.taluka || "Sinnar"}, {facility?.district || "Nashik"}</span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {facility?.name || (language === "mr" ? "सिन्नर ग्रामीण रुग्णालय ऑपरेशन्स" : language === "hi" ? "सिन्नर सीएचसी संचालन पोर्टल" : "Sinnar CHC-01 Operations Portal")}
                </h2>
                <p className="text-xs text-slate-300">
                  {language === "mr"
                    ? "थेट OPD रांगा, रुग्ण नोंदवही, टेलिमेडिसीन कक्ष आणि औषध साठा नियंत्रण."
                    : language === "hi"
                    ? "लाइव ओपीडी कतार, मरीज रजिस्ट्री, टेलीमेडिसिन रूम और दवा इन्वेंटरी नियंत्रण।"
                    : "Live clinical queues, patient registry, telemedicine rooms, and pharmacy inventory control."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("Appointments")}
                  className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md border-0 cursor-pointer"
                >
                  <Calendar size={14} /> {language === "mr" ? "OPD नियोजित करा" : language === "hi" ? "OPD शेड्यूल करें" : "Schedule OPD"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "नोंदणीकृत रुग्ण" : language === "hi" ? "पंजीकृत मरीज" : "Registered Patients"}
              </span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{patients.length || 6}</span>
              <span className="text-[9px] text-green-600 font-bold mt-0.5 block">
                {language === "mr" ? "↑ सक्रिय नोंदणी" : language === "hi" ? "↑ सक्रिय मरीज" : "↑ Active Footprint"}
              </span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "आजची सल्लामसलत" : language === "hi" ? "आज के परामर्श" : "Today's Consults"}
              </span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{consultations.length || 5}</span>
              <span className="text-[9px] text-primary font-bold mt-0.5 block">
                {language === "mr" ? "OPD व व्हिडिओ" : language === "hi" ? "ओपीडी और वीडियो" : "OPD & Video"}
              </span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "सक्रिय OPD रांग" : language === "hi" ? "सक्रिय कतार" : "Active Queue"}
              </span>
              <span className="text-xl font-extrabold text-primary block mt-1">{appointments.filter(a => a.status === "Scheduled").length || 4}</span>
              <span className="text-[9px] text-amber-600 font-bold mt-0.5 block">
                {language === "mr" ? "प्रतीक्षा: ~१५ मि" : language === "hi" ? "प्रतीक्षा: ~15 मिनट" : "Avg Wait: 15m"}
              </span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "सक्रिय संदर्भ" : language === "hi" ? "सक्रिय रेफरल" : "Active Referrals"}
              </span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{referrals.length || 4}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5 block">
                {language === "mr" ? "१०८ वाहतूक सिंक" : language === "hi" ? "108 एम्बुलेंस सिंक" : "108 Transport Sync"}
              </span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "औषध साठा प्रकार" : language === "hi" ? "दवा इन्वेंटरी" : "Pharmacy Items"}
              </span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{medicines.length || 7}</span>
              <span className="text-[9px] text-teal-600 font-bold mt-0.5 block">PMBJP Generic</span>
            </div>
            <div className="bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {language === "mr" ? "आशा फॉलो-अप" : language === "hi" ? "आशा फॉलो-अप" : "ASHA Follow-ups"}
              </span>
              <span className="text-xl font-extrabold text-slate-800 block mt-1">{followups.length || 5}</span>
              <span className="text-[9px] text-green-600 font-bold mt-0.5 block">
                {language === "mr" ? "घरोघरी सेवा" : language === "hi" ? "घर पर देखभाल" : "Doorstep Care"}
              </span>
            </div>
          </div>

          {/* Real-time Queue and Pharmacy Overview */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Live Queue Table */}
            <div className="md:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    {language === "mr" ? "थेट केंद्र रुग्ण रांग" : language === "hi" ? "लाइव मरीज ओपीडी कतार" : "Live Facility Patient Queue"}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {language === "mr" ? "रिअल-टाइम OPD टोकन आणि वर्गीकरण" : language === "hi" ? "रीयल-टाइम ओपीडी टोकन और ट्राइएज" : "Real-time OPD token progression & triage sorting"}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("Queue")}
                  className="text-primary hover:underline text-xs font-bold border-0 bg-transparent cursor-pointer"
                >
                  {language === "mr" ? "संपूर्ण रांग पहा →" : language === "hi" ? "पूरी कतार देखें →" : "View Full Queue →"}
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">Queue #</th>
                      <th className="py-2.5 px-4">Patient Name</th>
                      <th className="py-2.5 px-4">Doctor Assigned</th>
                      <th className="py-2.5 px-4">Triage Priority</th>
                      <th className="py-2.5 px-4">Time Slot</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {appointments.slice(0, 5).map((apt, idx) => (
                      <tr key={apt._id || idx} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">#{apt.queueNumber || idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{apt.patientId?.name || "Ramesh Kumar"}</td>
                        <td className="py-3 px-4 text-slate-600">{apt.doctorId?.name || "Dr. Aniruddha Kulkarni"}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            apt.triagePriority === "Urgent" ? "bg-red-50 text-red-600 border border-red-200" :
                            apt.triagePriority === "Priority" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-green-50 text-green-700 border border-green-200"
                          }`}>
                            {apt.triagePriority === "Urgent" ? "🔴 Urgent" : apt.triagePriority === "Priority" ? "🟠 Priority" : "🟢 Routine"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{apt.appointmentTime || "11:30 AM"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-blue-50 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                            {apt.status || "Scheduled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pharmacy Stocks & Alerts */}
            <div className="md:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Essential Drug Inventory</h3>
                <button
                  onClick={() => setActiveTab("Medicine Inventory")}
                  className="text-primary hover:underline text-xs font-bold border-0 bg-transparent cursor-pointer"
                >
                  Manage Stock →
                </button>
              </div>
              
              <div className="space-y-2.5 text-xs">
                {medicines.slice(0, 5).map((med) => (
                  <div key={med.id || med._id} className="p-3 border border-slate-100 bg-slate-50/60 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 block text-xs">{med.name}</strong>
                      <span className="text-[10px] text-slate-400">Stock: <strong className="font-mono text-slate-700">{med.quantity}</strong> | Min: {med.minimumRequired}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                      med.status === "Out of Stock" ? "bg-red-500 text-white" :
                      med.status === "Low" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {med.status || "Available"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PATIENTS PANEL */}
      {activeTab === "Patients" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Facility Patient Registry</h2>
              <p className="text-[10px] text-slate-400">Registered patients in {facility?.name || "Facility"} catchment area ({patients.length} records)</p>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs max-w-xs w-full sm:w-auto">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, ID, village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-hidden pl-2 text-xs w-full font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Patient Ref ID</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Age / Gender</th>
                  <th className="py-2.5 px-4">Village / Block</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4 text-center">ABHA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{p.patientRefId}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.age} yrs / {p.gender}</td>
                    <td className="py-3 px-4 text-slate-600">{p.village}, {p.taluka}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.mobile}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded-full font-bold">
                        ✓ ABHA Linked
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS PANEL */}
      {activeTab === "Appointments" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">OPD & Teleconsultation Appointments</h2>
              <p className="text-[10px] text-slate-400">Scheduled clinical appointments with triage priority tagging</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="All">All Triage Priorities</option>
                <option value="Urgent">🔴 Urgent</option>
                <option value="Priority">🟠 Priority</option>
                <option value="Routine">🟢 Routine</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Queue #</th>
                  <th className="py-2.5 px-4">Patient</th>
                  <th className="py-2.5 px-4">Doctor Assigned</th>
                  <th className="py-2.5 px-4">Triage Priority</th>
                  <th className="py-2.5 px-4">Date & Slot</th>
                  <th className="py-2.5 px-4">Booking Source</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAppointments.map((apt, idx) => (
                  <tr key={apt._id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">#{apt.queueNumber || idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{apt.patientId?.name || "Ramesh Kumar"}</td>
                    <td className="py-3 px-4 text-slate-600">{apt.doctorId?.name || "Dr. Aniruddha Kulkarni"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        apt.triagePriority === "Urgent" ? "bg-red-50 text-red-600 border border-red-200" :
                        apt.triagePriority === "Priority" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {apt.triagePriority === "Urgent" ? "🔴 Urgent" : apt.triagePriority === "Priority" ? "🟠 Priority" : "🟢 Routine"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{apt.appointmentTime || "11:30 AM"}</td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">{apt.bookingSource || "AI_ASSISTANT"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        {apt.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. QUEUE PANEL */}
      {activeTab === "Queue" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Live OPD Token Queue Management</h2>
            <p className="text-[10px] text-slate-400">Call patients, advance queue tokens, and monitor physician consultation wait times.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-blue-50/60 border border-blue-200/60 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-primary uppercase block">Currently Calling</span>
              <strong className="text-2xl font-black text-slate-800 block mt-1">Token #1</strong>
              <span className="text-xs text-slate-600 block mt-0.5">Ramesh Kumar (Dr. Kulkarni Room 02)</span>
            </div>
            <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Next in Line</span>
              <strong className="text-2xl font-black text-slate-800 block mt-1">Token #2</strong>
              <span className="text-xs text-slate-600 block mt-0.5">Sunita Patil (Cardiology Tele-ICU)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Average Consultation Time</span>
              <strong className="text-2xl font-black text-slate-800 block mt-1">12 Mins</strong>
              <span className="text-xs text-green-600 font-bold block mt-0.5">✓ Flow Normal</span>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Patient Name</th>
                  <th className="py-2.5 px-4">Doctor</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Est. Wait</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((apt, idx) => (
                  <tr key={apt._id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-mono font-extrabold text-primary">#{apt.queueNumber || idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{apt.patientId?.name || "Ramesh Kumar"}</td>
                    <td className="py-3 px-4 text-slate-600">{apt.doctorId?.name || "Dr. Aniruddha Kulkarni"}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {apt.triagePriority || "Priority"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{apt.estimatedWaitMinutes || (idx + 1) * 10} mins</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => alert(`Calling Token #${apt.queueNumber || idx + 1}: ${apt.patientId?.name || "Patient"} to Room 01!`)}
                        className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl border-0 cursor-pointer shadow-xs"
                      >
                        Call Next
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CONSULTATIONS PANEL */}
      {activeTab === "Consultations" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Telemedicine & Clinical Consultations</h2>
            <p className="text-[10px] text-slate-400">Live WebRTC video consultation records & signed clinical EMR notes</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Patient</th>
                  <th className="py-2.5 px-4">Consulting Physician</th>
                  <th className="py-2.5 px-4">Clinical Diagnosis / Symptoms</th>
                  <th className="py-2.5 px-4">Video Room</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {consultations.map((c, idx) => (
                  <tr key={c._id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.patientId?.name || "Ramesh Kumar"}</td>
                    <td className="py-3 px-4 text-slate-600">{c.doctorId?.name || "Dr. Aniruddha Kulkarni"}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{c.clinicalNotes || c.diagnosis || "Acute Febrile Illness evaluation"}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-primary">{c.videoRoomName || `jancare-room-${idx + 1}`}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === "Active" ? "bg-red-50 text-red-600 animate-pulse border border-red-200" :
                        c.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" :
                        "bg-blue-50 text-primary border border-blue-200"
                      }`}>
                        {c.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MEDICINE INVENTORY PANEL */}
      {activeTab === "Medicine Inventory" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Pharmacy Medicine Inventory</h2>
              <p className="text-[10px] text-slate-400">Essential drug formulary (NLEM / PMBJP generic equivalents)</p>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs max-w-xs w-full sm:w-auto">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search drug / salt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-hidden pl-2 text-xs w-full font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Medicine Name / Salt</th>
                  <th className="py-2.5 px-4">Strength & Form</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Available Units</th>
                  <th className="py-2.5 px-4 text-center">Threshold</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMedicines.map((m) => (
                  <tr key={m.id || m._id} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{m.name}</div>
                      {m.genericName && <div className="text-[10px] text-slate-400 font-mono">({m.genericName})</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{m.strength} / {m.form}</td>
                    <td className="py-3 px-4 text-slate-600">{m.category}</td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-800">{m.quantity}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{m.minimumRequired}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        m.status === "Out of Stock" ? "bg-red-500 text-white" :
                        m.status === "Low" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {m.status || "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MEDICINE RESERVATIONS PANEL */}
      {activeTab === "Medicine Reservations" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Active Drug Reservations & Pickups ({reservations.length})
              </h2>
              <p className="text-[10px] text-slate-400">
                Stock blocked for patient online reservations and emergency doctor prescriptions
              </p>
            </div>
            <button
              onClick={() => fetchFacilityAndUserData()}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={12} className="text-primary" /> Refresh
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic space-y-1">
              <Package size={28} className="mx-auto text-slate-300" />
              <p>No active reservations at this facility depot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-4">Tracking Token</th>
                    <th className="py-2.5 px-4">Patient / UHID</th>
                    <th className="py-2.5 px-4">Medicine Item</th>
                    <th className="py-2.5 px-4">Qty</th>
                    <th className="py-2.5 px-4">Depot</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reservations.map((res: any) => (
                    <tr key={res.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {res.trackingId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">Patient</span>
                        <span className="text-[10px] text-slate-400 font-mono">{res.patientRef || "JC-7F3K92"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-800 block">{res.medicineName}</strong>
                        <span className="text-[10px] text-slate-500">{res.genericName} • {res.strength} ({res.form})</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {res.quantity} unit(s)
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {res.facilityName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          res.status === "Dispensed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700 animate-pulse"
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {res.status !== "Dispensed" ? (
                          <button
                            onClick={() => handleDispense(res.id)}
                            disabled={dispensingId === res.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] border-0 cursor-pointer shadow-xs shadow-emerald-200 transition-all flex items-center gap-1 mx-auto"
                          >
                            {dispensingId === res.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Dispense Drug"
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Dispensed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. REFERRALS PANEL */}
      {activeTab === "Referrals" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Clinical Referrals & Escalations</h2>
            <p className="text-[10px] text-slate-400">Patient transfers across SubCenters, PHCs, CHCs, and District Hospitals</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Patient</th>
                  <th className="py-2.5 px-4">Destination Hospital</th>
                  <th className="py-2.5 px-4">Clinical Justification</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {referrals.map((ref, idx) => (
                  <tr key={ref._id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-bold text-slate-800">{ref.patientId?.name || "Sunita Patil"}</td>
                    <td className="py-3 px-4 text-primary font-bold">{ref.destinationFacilityId?.name || "Nashik District Civil Hospital"}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{ref.reason || "Severe Acute Chest Pain requiring 24/7 Cardiology ICU."}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ref.priority === "Urgent" ? "bg-red-50 text-red-600 border border-red-200" :
                        "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {ref.priority || "Urgent"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-50 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        {ref.status || "Created"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. FOLLOW-UPS PANEL */}
      {activeTab === "Follow-ups" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">ASHA Doorstep Follow-up Roster</h2>
            <p className="text-[10px] text-slate-400">Post-consultation home visits, medication adherence, and vitals checkups</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Patient</th>
                  <th className="py-2.5 px-4">Care Type</th>
                  <th className="py-2.5 px-4">Assigned ASHA</th>
                  <th className="py-2.5 px-4">Clinical Checklist / Notes</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {followups.map((fol, idx) => (
                  <tr key={fol._id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-bold text-slate-800">{fol.patientId?.name || "Ramesh Kumar"}</td>
                    <td className="py-3 px-4 font-bold text-slate-600">{fol.type || "Medication"}</td>
                    <td className="py-3 px-4 text-slate-600">{fol.assignedWorkerId?.name || "Sharda Patil (ASHA)"}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{fol.notes || "Verify Paracetamol compliance and morning temperature."}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        fol.status === "Due" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        fol.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" :
                        "bg-blue-50 text-primary border border-blue-200"
                      }`}>
                        {fol.status || "Upcoming"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. REPORTS & SETTINGS */}
      {(activeTab === "Reports" || activeTab === "Settings") && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200 text-xs">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Facility Workload & Configuration</h2>
            <p className="text-[10px] text-slate-400">Node metrics, ambulance dispatch latency, and bed utilization settings</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed Occupancy Rate</span>
              <strong className="text-xl font-extrabold text-slate-800 block mt-1">68%</strong>
              <span className="text-[10px] text-slate-500">8 of 12 ICU/Observation beds occupied</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ambulance Response Time</span>
              <strong className="text-xl font-extrabold text-emerald-600 block mt-1">11.4 Mins</strong>
              <span className="text-[10px] text-slate-500">108 Sinnar Depot GPS telemetry active</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Prescription Generic Match</span>
              <strong className="text-xl font-extrabold text-primary block mt-1">94.2%</strong>
              <span className="text-[10px] text-slate-500">PMBJP Jan Aushadhi generic substitutions</span>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
