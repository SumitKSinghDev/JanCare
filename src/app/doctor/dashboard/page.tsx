"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import Link from "next/link";
import {
  Activity,
  Heart,
  Video,
  LogOut,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  User,
  Home,
  Menu,
  FileText,
  VideoOff,
  UserPlus,
  PlusCircle,
  Share2,
  Trash2,
  Mic,
  Camera,
  MessageSquare,
  Monitor
} from "lucide-react";

export default function DoctorDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selected consultation for Current Consult split panel
  const [activeConsult, setActiveConsult] = useState<any>(null);
  
  // Call controls state
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  async function fetchDoctorQueue() {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.success) {
        router.push("/login");
        return;
      }
      setCurrentUser(userData.user);

      // Fetch consultations
      const consRes = await fetch("/api/consultations?status=Scheduled");
      const consData = await consRes.json();
      if (consData.success) {
        setConsultations(consData.consultations);
        if (consData.consultations.length > 0) {
          // Pre-select first scheduled consultation as default active (Ramesh Kumar in seeds)
          setActiveConsult(consData.consultations[0]);
        }
      }

      // Fetch appointments
      const appRes = await fetch("/api/appointments?status=Scheduled");
      const appData = await appRes.json();
      if (appData.success) {
        setAppointments(appData.appointments);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load clinic queue");
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F9FC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm font-semibold text-text-secondary">Loading provider queue...</p>
        </div>
      </div>
    );
  }

  // Sort consultations by triage priority (Urgent -> Priority -> Routine)
  const priorityWeight = { Urgent: 3, Priority: 2, Routine: 1 };
  const sortedConsultations = [...consultations].sort((a, b) => {
    const wA = priorityWeight[a.healthRecordId?.triage?.level as keyof typeof priorityWeight] || 0;
    const wB = priorityWeight[b.healthRecordId?.triage?.level as keyof typeof priorityWeight] || 0;
    return wB - wA;
  });

  const urgentCount = consultations.filter((c) => c.healthRecordId?.triage?.level === "Urgent").length;
  const priorityCount = consultations.filter((c) => c.healthRecordId?.triage?.level === "Priority").length;
  const routineCount = consultations.filter((c) => c.healthRecordId?.triage?.level === "Routine").length;

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans pb-16 md:pb-0 select-none">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-border-brand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="जनCare Logo" className="h-9 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t("dashboards.doctor")}</span>
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
              {currentUser?.associatedFacility?.name || "Sinnar Rural Hospital"}
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-transparent border-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Split Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stats overview and Today's Queue */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Welcome Header */}
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-deep-blue">Clinical Workspace: Dr. {currentUser?.name?.split(" ")[1] || "Kulkarni"}</h2>
            <p className="text-xs text-text-secondary mt-0.5">Manage live teleconsultations, write prescriptions, and coordinate referrals.</p>
          </div>

          {/* Today's Metrics widgets */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white p-4.5 rounded-xl border border-border-brand shadow-xs flex flex-col justify-between">
              <span className="text-[8px] text-text-secondary font-bold uppercase">Today's Consults</span>
              <span className="text-lg font-extrabold text-text-primary mt-1">{consultations.length}</span>
            </div>
            <div className="bg-white p-4.5 rounded-xl border border-border-brand shadow-xs flex flex-col justify-between border-l-4 border-l-red-500">
              <span className="text-[8px] text-red-500 font-bold uppercase">Urgent Cases</span>
              <span className="text-lg font-extrabold text-red-600 mt-1">{urgentCount}</span>
            </div>
            <div className="bg-white p-4.5 rounded-xl border border-border-brand shadow-xs flex flex-col justify-between border-l-4 border-l-orange-500">
              <span className="text-[8px] text-orange-500 font-bold uppercase">Priority Cases</span>
              <span className="text-lg font-extrabold text-orange-600 mt-1">{priorityCount}</span>
            </div>
            <div className="bg-white p-4.5 rounded-xl border border-border-brand shadow-xs flex flex-col justify-between">
              <span className="text-[8px] text-text-secondary font-bold uppercase">Follow-ups Due</span>
              <span className="text-lg font-extrabold text-text-primary mt-1">6</span>
            </div>
            <div className="bg-white p-4.5 rounded-xl border border-border-brand shadow-xs flex flex-col justify-between">
              <span className="text-[8px] text-text-secondary font-bold uppercase">Pending Presc.</span>
              <span className="text-lg font-extrabold text-text-primary mt-1">3</span>
            </div>
          </div>

          {/* Today's Consultation Queue */}
          <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-deep-blue text-left">
              Today's Consultation Queue
            </h3>

            {sortedConsultations.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                No consultations currently in your queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-brand text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-3 px-4">Triage Priority</th>
                      <th className="py-3 px-4">Patient ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Age/Sex</th>
                      <th className="py-3 px-4">Complaint</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedConsultations.map((consult) => {
                      const level = consult.healthRecordId?.triage?.level || "Routine";
                      const symptoms = consult.healthRecordId?.symptoms || [];

                      return (
                        <tr key={consult._id} className={`hover:bg-slate-50/40 cursor-pointer ${activeConsult?._id === consult._id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`} onClick={() => setActiveConsult(consult)}>
                          <td className="py-3.5 px-4 font-bold">
                            {level === "Urgent" && (
                              <span className="bg-red-50 text-red-600 border border-red-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                🔴 Urgent
                              </span>
                            )}
                            {level === "Priority" && (
                              <span className="bg-orange-50 text-orange-600 border border-orange-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                🟠 Priority
                              </span>
                            )}
                            {level === "Routine" && (
                              <span className="bg-green-50 text-green-600 border border-green-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                🟢 Routine
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                            {consult.patientId?.patientRefId}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-text-primary">{consult.patientId?.name}</td>
                          <td className="py-3.5 px-4 text-text-secondary">
                            {consult.patientId?.age}y / {consult.patientId?.gender}
                          </td>
                          <td className="py-3.5 px-4 truncate max-w-[140px] text-text-secondary">
                            {symptoms.map((s: any) => s.name).join(", ") || "No symptoms logged"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/doctor/consultation/${consult._id}`);
                              }}
                              className="bg-primary hover:bg-deep-blue text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer text-[10px] border-0"
                            >
                              <Video size={12} /> Start
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Current Consultation details & WebRTC Cam Mockup */}
        <div className="lg:col-span-4 space-y-6">
          
          {activeConsult ? (
            <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-sm text-deep-blue">Current Consultation</h3>
                <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Active session</span>
              </div>

              {/* Patient mini demographics */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-text-primary text-xs uppercase shrink-0">
                  {activeConsult.patientId?.name?.slice(0, 2)}
                </div>
                <div className="text-xs">
                  <strong className="text-text-primary block">{activeConsult.patientId?.name}</strong>
                  <span className="text-[10px] text-text-secondary block mt-0.5">
                    {activeConsult.patientId?.age} Years / {activeConsult.patientId?.gender} | ID: {activeConsult.patientId?.patientRefId}
                  </span>
                </div>
              </div>

              {/* Complaint & Vitals */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[9px] text-text-secondary font-bold uppercase block">Symptoms / Complaint</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {activeConsult.healthRecordId?.symptoms?.map((s: any) => `${s.name} (${s.severity})`).join(", ") || "Fever, Weakness, Dizziness"}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1.5 text-center">
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <span className="text-[8px] text-text-secondary block">Temp</span>
                    <strong className="text-[10px] text-text-primary block mt-0.5">
                      {activeConsult.healthRecordId?.vitals?.temperature || 98.6}°F
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <span className="text-[8px] text-text-secondary block">BP</span>
                    <strong className="text-[10px] text-text-primary block mt-0.5">
                      {activeConsult.healthRecordId?.vitals?.bloodPressureSystolic || 120}/{activeConsult.healthRecordId?.vitals?.bloodPressureDiastolic || 80}
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <span className="text-[8px] text-text-secondary block">SpO2</span>
                    <strong className="text-[10px] text-text-primary block mt-0.5">
                      {activeConsult.healthRecordId?.vitals?.spo2 || 98}%
                    </strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <span className="text-[8px] text-text-secondary block">Pulse</span>
                    <strong className="text-[10px] text-text-primary block mt-0.5">
                      {activeConsult.healthRecordId?.vitals?.heartRate || 78} bpm
                    </strong>
                  </div>
                </div>
              </div>

              {/* AI Assistant Summary suggestions */}
              <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl text-xs space-y-1.5">
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">AI-Assisted Summary</span>
                <p className="text-[10px] text-text-primary leading-relaxed font-medium">
                  {activeConsult.healthRecordId?.triage?.aiExplanation || "Patient has moderate fever and weakness. Recommended: Paracetamol prescription. Monitor vitals."}
                </p>
              </div>

              {/* Real camera video container mock */}
              <div className="bg-slate-900 rounded-2xl h-44 overflow-hidden relative border border-slate-800 flex items-center justify-center">
                <button
                  onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                  className="absolute inset-0 bg-slate-950/90 hover:bg-slate-950 text-white font-bold flex flex-col items-center justify-center gap-2.5 border-0 cursor-pointer transition-all z-30"
                >
                  <div className="p-4 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
                    <Video size={28} className="text-primary" />
                  </div>
                  <span className="text-xs tracking-wide">Start Video Consultation Room</span>
                </button>
              </div>

              {/* Quick Actions buttons */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold pt-2 border-t border-slate-100">
                <button
                  onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                  className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 py-2.5 rounded-xl cursor-pointer"
                >
                  Prescription
                </button>
                <button
                  onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                  className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 py-2.5 rounded-xl cursor-pointer"
                >
                  Referral
                </button>
                <button
                  onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                  className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 py-2.5 rounded-xl cursor-pointer"
                >
                  Follow-up
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border-brand p-8 rounded-2xl shadow-xs text-center text-xs text-text-secondary">
              Select a consultation from the queue to start session.
            </div>
          )}
        </div>
      </main>

      {/* Bottom section charts and queues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid md:grid-cols-3 gap-6">
        
        {/* Recent Prescriptions */}
        <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs text-left">
          <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
            Recent Prescriptions
          </h3>
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <strong className="text-text-primary block">Ramesh Kumar</strong>
                <span className="text-[10px] text-text-secondary">2 Medicines • 26 Aug 2026</span>
              </div>
              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold text-[9px]">Issued</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div>
                <strong className="text-text-primary block">Savitri Patil</strong>
                <span className="text-[10px] text-text-secondary">1 Medicines • 25 Aug 2026</span>
              </div>
              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold text-[9px]">Issued</span>
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs text-left">
          <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
            Upcoming Follow-ups
          </h3>
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <strong className="text-text-primary block">Ramesh Kumar</strong>
                <span className="text-[10px] text-text-secondary">ASHA Visit due in 2 days</span>
              </div>
              <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded font-bold text-[9px]">Pending</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div>
                <strong className="text-text-primary block">Vitthal Pawar</strong>
                <span className="text-[10px] text-text-secondary">ASHA Visit due in 7 days</span>
              </div>
              <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded font-bold text-[9px]">Pending</span>
            </div>
          </div>
        </div>

        {/* Referrals Overview Dial card */}
        <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs text-left flex flex-col justify-between">
          <h3 className="font-extrabold text-xs text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">
            Referrals Overview
          </h3>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="h-16 w-16 rounded-full border-4 border-primary border-r-transparent flex items-center justify-center font-bold text-text-primary shrink-0">
              12
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Completed: <strong>7 (58%)</strong>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> In Progress: <strong>3 (25%)</strong>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Overdue: <strong>2 (17%)</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
