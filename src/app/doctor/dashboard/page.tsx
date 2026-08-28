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
  Monitor,
  Calendar,
  AlertTriangle
} from "lucide-react";
import AppShell from "@/components/AppShell";

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

  // App Shell navigation active tab state
  const [activeTab, setActiveTab] = useState("Dashboard");

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
          // Pre-select first scheduled consultation as default active
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Clinical Workspace...</p>
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
  const routineCount = sortedConsultations.length - urgentCount - priorityCount;

  return (
    <AppShell
      role="Doctor"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={currentUser}
    >
      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="text-left bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Clinical Workspace: Dr. {currentUser?.name?.split(" ")[1] || "Kulkarni"}</h2>
              <p className="text-xs text-slate-300">Manage live teleconsultations, write prescriptions, and coordinate patient referrals.</p>
            </div>
          </div>

          {/* Today's Metrics widgets */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Queue Size</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1">{consultations.length} Consults</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between border-l-4 border-l-red-500 h-24">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">Urgent Cases</span>
              <span className="text-lg font-extrabold text-red-600 mt-1">{urgentCount} Cases</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between border-l-4 border-l-orange-500 h-24">
              <span className="text-[8px] text-orange-500 font-bold uppercase tracking-wider">Priority Cases</span>
              <span className="text-lg font-extrabold text-orange-600 mt-1">{priorityCount} Cases</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Follow-ups</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1">2 Scheduled</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Facility Hub</span>
              <span className="text-xs font-bold text-slate-700 mt-1 truncate">{currentUser?.associatedFacility?.name || "Sinnar CHC"}</span>
            </div>
          </div>

          {/* Consultation queue */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Queue Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                Today's Consultation Queue
              </h3>

              {sortedConsultations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No consultations currently in your queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                        <th className="py-3 px-4">Triage Priority</th>
                        <th className="py-3 px-4">Patient ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Complaint</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedConsultations.map((consult) => {
                        const level = consult.healthRecordId?.triage?.level || "Routine";
                        const symptoms = consult.healthRecordId?.symptoms || [];

                        return (
                          <tr
                            key={consult._id}
                            className={`hover:bg-slate-50/50 cursor-pointer ${activeConsult?._id === consult._id ? "bg-blue-50/30 font-semibold" : ""}`}
                            onClick={() => setActiveConsult(consult)}
                          >
                            <td className="py-3.5 px-4 font-bold">
                              {level === "Urgent" && <span className="bg-red-50 text-red-600 border border-red-200/50 px-2.5 py-1 rounded-full text-[10px]">🔴 Urgent</span>}
                              {level === "Priority" && <span className="bg-orange-50 text-orange-600 border border-orange-200/50 px-2.5 py-1 rounded-full text-[10px]">🟠 Priority</span>}
                              {level === "Routine" && <span className="bg-green-50 text-green-600 border border-green-200/50 px-2.5 py-1 rounded-full text-[10px]">🟢 Routine</span>}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{consult.patientId?.patientRefId}</td>
                            <td className="py-3.5 px-4 text-slate-700">{consult.patientId?.name}</td>
                            <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                              {symptoms.map((s: any) => s.name).join(", ") || "Routine checkup"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/doctor/consultation/${consult._id}`);
                                }}
                                className="bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer text-[10px] border-0"
                              >
                                <Video size={12} /> Start Session
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

            {/* Split consult side panel */}
            <div className="lg:col-span-4">
              {activeConsult ? (
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Current Consultation</h3>
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-primary text-xs uppercase shrink-0">
                      {activeConsult.patientId?.name?.slice(0, 2)}
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-800 block">{activeConsult.patientId?.name}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {activeConsult.patientId?.age} Years / {activeConsult.patientId?.gender} | ID: {activeConsult.patientId?.patientRefId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Symptoms Complaint</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {activeConsult.healthRecordId?.symptoms?.map((s: any) => `${s.name} (${s.severity})`).join(", ") || "No symptoms logged"}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2 text-[10px]">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">AI-Assisted Clinical Copilot</span>
                      <p className="text-slate-600 leading-relaxed font-semibold">
                        {activeConsult.healthRecordId?.triage?.aiExplanation || "Patient requires diagnosis and paracetamol Rx check."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    <button
                      onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                      className="bg-primary hover:bg-blue-600 text-white py-2.5 rounded-xl cursor-pointer border-0"
                    >
                      Start Call
                    </button>
                    <button
                      onClick={() => {
                        setActiveConsult(null);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2.5 rounded-xl cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xs text-center text-xs text-slate-400">
                  Select a consultation from the queue to review patient documents.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE VIEW */}
      {activeTab === "Profile" && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Practitioner Profile</h2>
            <p className="text-xs text-slate-500">Manage your clinical registration details, contact info, and facility associations.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Profile Avatar Card */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 bg-blue-100 border-2 border-blue-200 text-[#1464D2] font-extrabold rounded-full flex items-center justify-center text-xl shadow-xs">
                {currentUser?.name?.split(" ").map((n: string) => n[0]).join("") || "DOC"}
              </div>
              <div>
                <strong className="text-sm font-extrabold text-slate-800 block">{currentUser?.name || "Dr. Practitioner"}</strong>
                <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block border border-green-200/50">
                  Verified MCI Practitioner
                </span>
              </div>
              <div className="w-full pt-4 border-t border-slate-200/80 text-left space-y-2 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-bold">Username:</span>
                  <span className="font-mono">{currentUser?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Role:</span>
                  <span className="font-mono">{currentUser?.role}</span>
                </div>
              </div>
            </div>

            {/* Profile Details List */}
            <div className="md:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">Facility Association</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Associated Facility</span>
                    <span className="text-slate-705 mt-1 block">{currentUser?.associatedFacility?.name || "Sinnar CHC-01"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Facility Type</span>
                    <span className="text-slate-705 mt-1 block uppercase">{currentUser?.associatedFacility?.type || "Community Health Centre (CHC)"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">District Node</span>
                    <span className="text-slate-705 mt-1 block">{currentUser?.associatedFacility?.district || "Nashik"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">State Grid</span>
                    <span className="text-slate-705 mt-1 block">{currentUser?.associatedFacility?.state || "Maharashtra"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">MCI Registration & Status</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">MCI License Number</span>
                    <span className="text-slate-705 mt-1 block font-mono">MCI-78294 (State Health Registry)</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Accepting consultations</span>
                    <span className="text-green-700 mt-1 block flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Active / Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. OTHER TABVIEWS */}
      {activeTab !== "Dashboard" && activeTab !== "Profile" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[400px]">
          <h2 className="text-lg font-extrabold text-slate-800">{activeTab} Workspace</h2>
          <p className="text-xs text-slate-500">Workspace panel for {activeTab} information logs.</p>
          
          <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-2">
            <ClipboardList size={32} className="text-slate-300 animate-pulse" />
            <span>Currently showing {activeTab} details.</span>
            <button
              onClick={() => setActiveTab("Dashboard")}
              className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent mt-2 text-xs"
            >
              Back to Queue Dashboard
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
