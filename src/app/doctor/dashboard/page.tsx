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
  AlertTriangle,
  Search
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

  // Dynamic Workspace States
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientFilter, setPatientFilter] = useState<"All" | "Priority" | "Follow-up">("All");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralFilter, setReferralFilter] = useState<"Pending" | "Active" | "Completed">("Pending");
  
  const [followups, setFollowups] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [ashasList, setAshasList] = useState<any[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<any[]>([]);

  // Modals for creation
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // New Referral Inputs
  const [refPatientId, setRefPatientId] = useState("");
  const [refASHAId, setRefASHAId] = useState("");
  const [refFacilityId, setRefFacilityId] = useState("");
  const [refReason, setRefReason] = useState("");
  const [refPriority, setRefPriority] = useState("Routine");
  const [refInstructions, setRefInstructions] = useState("");
  const [refFollowUpDate, setRefFollowUpDate] = useState("");

  // New Prescription Inputs
  const [rxPatientId, setRxPatientId] = useState("");
  const [rxMedName, setRxMedName] = useState("");
  const [rxMedStrength, setRxMedStrength] = useState("500mg");
  const [rxMedForm, setRxMedForm] = useState<any>("Tablet");
  const [rxMedDosage, setRxMedDosage] = useState("1-0-1");
  const [rxMedDuration, setRxMedDuration] = useState("5");
  const [rxMedInstructions, setRxMedInstructions] = useState<any>("After Food");
  const [rxAdditionalNotes, setRxAdditionalNotes] = useState("");
  const [rxMedicinesList, setRxMedicinesList] = useState<any[]>([]);

  // New Follow-up Inputs
  const [fuPatientId, setFuPatientId] = useState("");
  const [fuWorkerId, setFuWorkerId] = useState("");
  const [fuType, setFuType] = useState("Medication");
  const [fuDueDate, setFuDueDate] = useState("");
  const [fuNotes, setFuNotes] = useState("");

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  useEffect(() => {
    if (activeTab === "Patients") {
      fetchPatients();
    } else if (activeTab === "Referrals") {
      fetchReferrals();
      fetchAshasAndFacilities();
    } else if (activeTab === "Follow-ups") {
      fetchFollowups();
      fetchAshasAndFacilities();
    } else if (activeTab === "Prescriptions") {
      fetchPrescriptions();
    } else if (activeTab === "Dashboard") {
      fetchDoctorQueue();
    }
  }, [activeTab]);

  async function fetchPatients() {
    try {
      setLoading(true);
      const res = await fetch("/api/patients");
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (e) {
      console.error("Failed to fetch patients:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReferrals() {
    try {
      setLoading(true);
      const res = await fetch("/api/referrals");
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (e) {
      console.error("Failed to fetch referrals:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAshasAndFacilities() {
    try {
      const ashaRes = await fetch("/api/asha");
      const ashaData = await ashaRes.json();
      if (ashaData.success) setAshasList(ashaData.ashas);

      const facRes = await fetch("/api/facilities");
      const facData = await facRes.json();
      if (facData.success) setFacilitiesList(facData.facilities);
    } catch (e) {
      console.error("Failed to load reference metadata:", e);
    }
  }

  async function fetchFollowups() {
    try {
      setLoading(true);
      const res = await fetch("/api/followups");
      const data = await res.json();
      if (data.success) {
        setFollowups(data.followups);
      }
    } catch (e) {
      console.error("Failed to fetch followups:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrescriptions() {
    try {
      setLoading(true);
      const res = await fetch("/api/prescriptions");
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (e) {
      console.error("Failed to fetch prescriptions:", e);
    } finally {
      setLoading(false);
    }
  }

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
        if (consData.consultations.length > 0 && !activeConsult) {
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
      console.warn("Doctor queue fetch error / offline:", err);
      setCurrentUser((prev: any) => prev || {
        name: "Dr. Aniruddha Kulkarni",
        role: "Doctor",
        specialization: "General Medicine",
        facilityName: "Sinnar Rural CHC"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleCreateReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!refPatientId || (!refFacilityId && !refASHAId) || !refReason) {
      alert("Missing required fields");
      return;
    }
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: refPatientId,
          destinationFacilityId: refFacilityId || undefined,
          assignedAshaId: refASHAId || undefined,
          reason: refReason,
          priority: refPriority,
          instructions: refInstructions,
          followUpDate: refFollowUpDate ? new Date(refFollowUpDate) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Referral created successfully!");
        setShowReferralModal(false);
        setRefPatientId("");
        setRefASHAId("");
        setRefFacilityId("");
        setRefReason("");
        setRefPriority("Routine");
        setRefInstructions("");
        setRefFollowUpDate("");
        fetchReferrals();
      } else {
        alert("Failed to create referral: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handleCreatePrescription(e: React.FormEvent) {
    e.preventDefault();
    if (!rxPatientId || rxMedicinesList.length === 0) {
      alert("Please select a patient and add at least one medicine.");
      return;
    }
    try {
      // Find matching consultation context
      const consRes = await fetch(`/api/consultations?patientId=${rxPatientId}`);
      const consData = await consRes.json();
      let consultationId = null;
      if (consData.success && consData.consultations.length > 0) {
        consultationId = consData.consultations[0]._id;
      }

      if (!consultationId) {
        alert("No active consultation context exists for this patient. Please schedule or start a consultation before writing a prescription.");
        return;
      }

      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          patientId: rxPatientId,
          medicines: rxMedicinesList,
          additionalInstructions: rxAdditionalNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Prescription written successfully!");
        setShowPrescriptionModal(false);
        setRxPatientId("");
        setRxMedicinesList([]);
        setRxAdditionalNotes("");
        fetchPrescriptions();
      } else {
        alert("Failed to write prescription: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handleCreateFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!fuPatientId || !fuWorkerId || !fuDueDate) {
      alert("Missing required fields");
      return;
    }
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: fuPatientId,
          assignedWorkerId: fuWorkerId,
          type: fuType,
          dueDate: fuDueDate,
          notes: fuNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Follow-up task scheduled successfully!");
        setShowFollowUpModal(false);
        setFuPatientId("");
        setFuWorkerId("");
        setFuDueDate("");
        setFuNotes("");
        fetchFollowups();
      } else {
        alert("Failed to schedule follow-up: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
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
          <div className="text-left bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {language === "mr" 
                  ? `वैद्यकीय कार्यक्षेत्र: डॉ. ${currentUser?.name?.split(" ")[1] || "कुलकर्णी"}` 
                  : language === "hi" 
                  ? `चिकित्सा कार्यक्षेत्र: डॉ. ${currentUser?.name?.split(" ")[1] || "कुलकर्णी"}` 
                  : `Clinical Workspace: Dr. ${currentUser?.name?.split(" ")[1] || "Kulkarni"}`}
              </h2>
              <p className="text-xs text-slate-300">
                {language === "mr"
                  ? "थेट टेलिकन्सल्टेशन्स व्यवस्थापित करा, औषधोपचार पत्रके लिहा आणि संदर्भ समन्वय करा."
                  : language === "hi"
                  ? "लाइव टेली-परामर्श प्रबंधित करें, प्रिस्क्रिप्शन लिखें और मरीज रेफरल का समन्वय करें।"
                  : "Manage live teleconsultations, write prescriptions, and coordinate patient referrals."}
              </p>
            </div>
          </div>

          {/* Today's Metrics widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                {language === "mr" ? "एकूण रांग" : language === "hi" ? "कुल कतार" : "Queue Size"}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">
                {consultations.length} {language === "mr" ? "सल्ला" : language === "hi" ? "परामर्श" : "Consults"}
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between border-l-4 border-l-red-500 h-22 sm:h-24">
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">
                {language === "mr" ? "तातडीची प्रकरणे" : language === "hi" ? "आपातकालीन मामले" : "Urgent Cases"}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-red-600 mt-1">
                {urgentCount} {language === "mr" ? "रुग्ण" : language === "hi" ? "मरीज" : "Cases"}
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between border-l-4 border-l-orange-500 h-22 sm:h-24">
              <span className="text-[8px] text-orange-500 font-bold uppercase tracking-wider">
                {language === "mr" ? "प्राधान्य प्रकरणे" : language === "hi" ? "प्राथमिकता मामले" : "Priority Cases"}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-orange-600 mt-1">
                {priorityCount} {language === "mr" ? "रुग्ण" : language === "hi" ? "मरीज" : "Cases"}
              </span>
            </div>
            <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                {language === "mr" ? "फॉलो-अप भेटी" : language === "hi" ? "फॉलो-अप" : "Follow-ups"}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">
                2 {language === "mr" ? "नियोजित" : language === "hi" ? "शेड्यूल" : "Scheduled"}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                {language === "mr" ? "आरोग्य केंद्र हब" : language === "hi" ? "स्वास्थ्य केंद्र" : "Facility Hub"}
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 truncate">{currentUser?.associatedFacility?.name || "Sinnar CHC"}</span>
            </div>
          </div>

          {/* Consultation queue */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Queue Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  {language === "mr" ? "आजची रुग्ण सल्लामसलत रांग" : language === "hi" ? "आज की परामर्श कतार" : "Today's Consultation Queue"}
                </h3>
                <span className="sm:hidden text-[9px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full">← Swipe →</span>
              </div>

              {sortedConsultations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {language === "mr" ? "सध्या आपल्या रांगेत कोणतीही सल्लामसलत नाही." : language === "hi" ? "वर्तमान में आपकी कतार में कोई परामर्श नहीं है।" : "No consultations currently in your queue."}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                        <th className="py-3 px-3 sm:px-4">{language === "mr" ? "वर्गीकरण प्राधान्य" : language === "hi" ? "ट्राइएज प्राथमिकता" : "Triage Priority"}</th>
                        <th className="py-3 px-3 sm:px-4">{language === "mr" ? "रुग्ण आयडी" : language === "hi" ? "मरीज आईडी" : "Patient ID"}</th>
                        <th className="py-3 px-3 sm:px-4">{language === "mr" ? "नाव" : language === "hi" ? "नाम" : "Name"}</th>
                        <th className="py-3 px-3 sm:px-4">{language === "mr" ? "लक्षणे व तक्रार" : language === "hi" ? "लक्षण / शिकायत" : "Complaint"}</th>
                        <th className="py-3 px-3 sm:px-4 text-center">{language === "mr" ? "कृती" : language === "hi" ? "कार्रवाई" : "Action"}</th>
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
                              {level === "Urgent" && (
                                <span className="bg-red-50 text-red-600 border border-red-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                  🔴 {language === "mr" ? "तातडीचे" : language === "hi" ? "आपातकालीन" : "Urgent"}
                                </span>
                              )}
                              {level === "Priority" && (
                                <span className="bg-orange-50 text-orange-600 border border-orange-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                  🟠 {language === "mr" ? "प्राधान्य" : language === "hi" ? "प्राथमिकता" : "Priority"}
                                </span>
                              )}
                              {level === "Routine" && (
                                <span className="bg-green-50 text-green-600 border border-green-200/50 px-2.5 py-1 rounded-full text-[10px]">
                                  🟢 {language === "mr" ? "नियमित" : language === "hi" ? "सामान्य" : "Routine"}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{consult.patientId?.patientRefId}</td>
                            <td className="py-3.5 px-4 text-slate-700">{consult.patientId?.name}</td>
                            <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                              {symptoms.map((s: any) => s.name).join(", ") || (language === "mr" ? "नियमित तपासणी" : language === "hi" ? "नियमित जांच" : "Routine checkup")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/doctor/consultation/${consult._id}`);
                                }}
                                className="bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer text-[10px] border-0"
                              >
                                <Video size={12} /> {language === "mr" ? "सत्र सुरू करा" : language === "hi" ? "सत्र शुरू करें" : "Start Session"}
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
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      {language === "mr" ? "सध्याची सल्लामसलत" : language === "hi" ? "वर्तमान परामर्श" : "Current Consultation"}
                    </h3>
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                      {language === "mr" ? "सक्रिय" : language === "hi" ? "सक्रिय" : "Active"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-primary text-xs uppercase shrink-0">
                      {activeConsult.patientId?.name?.slice(0, 2)}
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-800 block">{activeConsult.patientId?.name}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {activeConsult.patientId?.age} {language === "mr" ? "वर्षे" : language === "hi" ? "वर्ष" : "Years"} / {activeConsult.patientId?.gender} | ID: {activeConsult.patientId?.patientRefId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">
                        {language === "mr" ? "लक्षणांची तक्रार" : language === "hi" ? "लक्षण / शिकायत" : "Symptoms Complaint"}
                      </span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {activeConsult.healthRecordId?.symptoms?.map((s: any) => `${s.name} (${s.severity})`).join(", ") || (language === "mr" ? "नोंदवलेली लक्षणे नाहीत" : language === "hi" ? "कोई लक्षण दर्ज नहीं" : "No symptoms logged")}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2 text-[10px]">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">
                        {language === "mr" ? "AI वैद्यकीय सह-पायलट" : language === "hi" ? "AI चिकित्सा सहायक" : "AI-Assisted Clinical Copilot"}
                      </span>
                      <p className="text-slate-600 leading-relaxed font-semibold">
                        {activeConsult.healthRecordId?.triage?.aiExplanation || (language === "mr" ? "रुग्णाचे निदान आणि औषधोपचार आवश्यक आहे." : language === "hi" ? "मरीज के लिए निदान और दवा जांच आवश्यक है।" : "Patient requires diagnosis and paracetamol Rx check.")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    <button
                      onClick={() => router.push(`/doctor/consultation/${activeConsult._id}`)}
                      className="bg-primary hover:bg-blue-600 text-white py-2.5 rounded-xl cursor-pointer border-0"
                    >
                      {language === "mr" ? "कॉल सुरू करा" : language === "hi" ? "कॉल शुरू करें" : "Start Call"}
                    </button>
                    <button
                      onClick={() => {
                        setActiveConsult(null);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2.5 rounded-xl cursor-pointer"
                    >
                      {language === "mr" ? "बंद करा" : language === "hi" ? "खारिज करें" : "Dismiss"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xs text-center text-xs text-slate-400">
                  {language === "mr" ? "रुग्ण तपासणीसाठी रांगेतून सल्लामसलत निवडा." : language === "hi" ? "मरीज की समीक्षा के लिए कतार से परामर्श चुनें।" : "Select a consultation from the queue to review patient documents."}
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

      {/* 3. PATIENTS WORKSPACE */}
      {activeTab === "Patients" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!selectedPatient ? (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">My Patients</h2>
                  <p className="text-xs text-slate-500">Patients under your clinical care and clinic network.</p>
                </div>
                <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs max-w-xs w-full sm:w-auto">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-hidden pl-2 text-xs w-full text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Patient list table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                      <th className="py-2.5 px-4">Patient</th>
                      <th className="py-2.5 px-4">Patient ID</th>
                      <th className="py-2.5 px-4">Age / Gender</th>
                      <th className="py-2.5 px-4">District</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients
                      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.patientRefId.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-700">{p.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{p.patientRefId}</td>
                          <td className="py-3 px-4 text-slate-500">{p.age} Yrs / {p.gender}</td>
                          <td className="py-3 px-4 text-slate-500">{p.district || "Not configured"}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedPatient(p)}
                              className="bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg border-0 cursor-pointer text-[10px]"
                            >
                              View Clinical Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Patient Clinical Profile View (Step 5) */
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in zoom-in-98 duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-3">
                <div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-bold flex items-center gap-1"
                  >
                    ← Back to Patients
                  </button>
                  <h2 className="text-lg font-extrabold text-slate-800 mt-2">Clinical Profile: {selectedPatient.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRefPatientId(selectedPatient._id);
                      setShowReferralModal(true);
                    }}
                    className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl border-0 cursor-pointer"
                  >
                    + Refer Patient
                  </button>
                  <button
                    onClick={() => {
                      setRxPatientId(selectedPatient._id);
                      setShowPrescriptionModal(true);
                    }}
                    className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl border-0 cursor-pointer"
                  >
                    + Write Rx
                  </button>
                  <button
                    onClick={() => {
                      setFuPatientId(selectedPatient._id);
                      setShowFollowUpModal(true);
                    }}
                    className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl border-0 cursor-pointer"
                  >
                    + Schedule Follow-up
                  </button>
                </div>
              </div>

              {/* Demographics and Vitals Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Details card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                  <strong className="text-slate-800 font-extrabold block text-sm uppercase tracking-wider">Demographics</strong>
                  <div className="space-y-2 text-slate-650 font-semibold">
                    <p><span className="text-slate-450 block text-[9px] uppercase">Patient Reference ID</span> {selectedPatient.patientRefId}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Gender / Age</span> {selectedPatient.gender} / {selectedPatient.age} Years</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Mobile Number</span> {selectedPatient.mobile || "Not configured"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Address Node</span> {selectedPatient.village}, {selectedPatient.taluka}, {selectedPatient.district}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">State Grid</span> {selectedPatient.state}</p>
                  </div>
                </div>

                {/* Vitals Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs md:col-span-2">
                  <strong className="text-slate-800 font-extrabold block text-sm uppercase tracking-wider">Clinical Status Metrics</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-bold text-slate-700">
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Temperature</span>
                      <span className="text-base text-slate-850">98.6 °F</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">SpO2 Level</span>
                      <span className="text-base text-slate-850">98%</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Heart Rate</span>
                      <span className="text-base text-slate-850">72 bpm</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Blood Pressure</span>
                      <span className="text-base text-slate-850">120/80 mmHg</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Respiratory Rate</span>
                      <span className="text-base text-slate-850">16 /min</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Triage level</span>
                      <span className="text-green-700 mt-1 block flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Routine
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation details history log */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Clinical History Timeline</h3>
                
                {/* Timeline logic */}
                <div className="space-y-4 text-xs font-semibold">
                  <div className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50">
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-2 mb-3">
                      <span>Primary Tele-Consultation</span>
                      <span className="text-slate-450 font-mono">26 Aug 2026</span>
                    </div>
                    <p className="text-slate-650 mt-1"><span className="text-slate-450 block text-[9px] uppercase">Clinical Notes</span> General checkup and monitoring.</p>
                    <p className="text-slate-650 mt-2.5"><span className="text-slate-450 block text-[9px] uppercase">Prescription</span> Paracetamol 500mg, Twice Daily</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. VIDEO CONSULTATION CONTEXT */}
      {activeTab === "Video Consultation" && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left min-h-[400px] animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Video Consultation</h2>
            <p className="text-xs text-slate-500">Live consultation sessions and coordination hub.</p>
          </div>

          <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-3">
            <Video size={36} className="text-slate-300 animate-pulse" />
            <strong className="text-slate-800 text-sm block mt-2">No Active Consultation Session</strong>
            <p className="max-w-xs text-slate-500 leading-relaxed">Select a patient from your dashboard consultation queue to launch a live call.</p>
            <button
              onClick={() => setActiveTab("Dashboard")}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border-0 cursor-pointer mt-4"
            >
              Go to Consultation Queue
            </button>
          </div>
        </div>
      )}

      {/* 5. PRESCRIPTIONS REGISTRY */}
      {activeTab === "Prescriptions" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Prescription Registry</h2>
              <p className="text-xs text-slate-500">History of medical drug prescriptions written by you.</p>
            </div>
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border-0 cursor-pointer"
            >
              + Write Prescription
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No prescriptions recorded in your directory.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div key={rx._id} className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 space-y-3 text-xs text-left">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <strong className="text-slate-800 block text-sm">{rx.patientId?.name || "Ramesh Kumar"}</strong>
                    <span className="text-[10px] text-slate-450 font-mono font-semibold">{new Date(rx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1.5 font-bold text-slate-700">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Prescribed Medicines</span>
                    {rx.medicines?.map((m: any, idx: number) => (
                      <div key={idx} className="flex justify-between bg-white border border-slate-100 p-2 rounded-xl text-[11px]">
                        <span>{m.name} ({m.strength})</span>
                        <span className="text-slate-450 text-[10px] font-mono">{m.dosage} - {m.durationDays} Days</span>
                      </div>
                    ))}
                  </div>
                  {rx.additionalInstructions && (
                    <p className="text-slate-550 italic text-[11px] font-semibold pt-1">Notes: {rx.additionalInstructions}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. APPOINTMENTS SCHEDULE */}
      {activeTab === "Appointments" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Appointments Schedule</h2>
            <p className="text-xs text-slate-500">Scheduled slots from manual and AI Assistant queries.</p>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No appointments scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                    <th className="py-2.5 px-4">Date / Time</th>
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Booking Source</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {new Date(app.appointmentDate).toLocaleDateString()} at {app.appointmentTime || "11:30 AM"}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-bold">{app.patientId?.name || "Ramesh Kumar"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                          app.bookingSource === "AI_ASSISTANT" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>{app.bookingSource || "MANUAL"}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-650">{app.status}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setActiveTab("Dashboard");
                          }}
                          className="bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg border-0 cursor-pointer text-[10px]"
                        >
                          View in Queue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. REFERRALS COORDINATION */}
      {activeTab === "Referrals" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Referrals Coordinator</h2>
              <p className="text-xs text-slate-500">Track and assign health referrals to ASHA workers and specialty hospitals.</p>
            </div>
            <button
              onClick={() => setShowReferralModal(true)}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border-0 cursor-pointer"
            >
              + Create Referral
            </button>
          </div>

          {/* Referral tags */}
          <div className="flex gap-2 pb-2">
            {["Pending", "Active", "Completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setReferralFilter(filter as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  referralFilter === filter
                    ? "bg-primary text-white border-primary"
                    : "bg-[#F8FAFC] text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {referrals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No referrals found matching filter.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {referrals.map((ref) => (
                <div key={ref._id} className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 space-y-3 text-xs text-left">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <strong className="text-slate-800 block text-sm">{ref.patientId?.name || "Ramesh Kumar"}</strong>
                    <span className="text-[10px] text-slate-450 font-mono font-semibold">{new Date(ref.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1 text-slate-650 font-semibold">
                    <p><span className="text-slate-450 block text-[9px] uppercase">Reason</span> {ref.reason}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">ASHA Worker Assigned</span> {ref.assignedAshaId?.name || "Unassigned"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Instructions</span> {ref.instructions || "None"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Priority</span> {ref.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. FOLLOW-UP TASKS */}
      {activeTab === "Follow-ups" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Follow-up Tasks</h2>
              <p className="text-xs text-slate-500">Coordinated recovery tracking and monitoring.</p>
            </div>
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border-0 cursor-pointer"
            >
              + Schedule Follow-up
            </button>
          </div>

          {followups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No follow-up tasks scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Assigned ASHA</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {followups.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-850 font-bold">{f.patientId?.name || "Ramesh Kumar"}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{f.type}</td>
                      <td className="py-3 px-4 text-slate-550">{f.assignedWorkerId?.name || "Unassigned"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                          f.status === "Upcoming" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-green-50 text-green-700 border border-green-100"
                        }`}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 9. CLINICAL HISTORY WORKSPACE */}
      {activeTab === "Clinical History" && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Clinical History Grid</h2>
            <p className="text-xs text-slate-500">Timeline logs and diagnosis logs across patients.</p>
          </div>

          <div className="space-y-4 font-semibold text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl">
              <div className="flex justify-between border-b border-slate-200 pb-2 mb-3">
                <strong className="text-slate-800 block text-sm">Ramesh Kumar (JC-7F3K92)</strong>
                <span className="text-slate-400 font-mono">26 Aug 2026</span>
              </div>
              <p className="text-slate-650 mt-1"><span className="text-slate-450 block text-[9px] uppercase font-bold">Diagnosis</span> Acute Viral Fever / Influenza check</p>
              <p className="text-slate-650 mt-2"><span className="text-slate-450 block text-[9px] uppercase font-bold">Vitals</span> Temp: 102.2 °F | Blood Pressure: 130/85 mmHg | SpO2: 96%</p>
              <p className="text-slate-650 mt-2"><span className="text-slate-450 block text-[9px] uppercase font-bold">Prescription</span> Paracetamol 500mg, Twice Daily</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl">
              <div className="flex justify-between border-b border-slate-200 pb-2 mb-3">
                <strong className="text-slate-800 block text-sm">Piyush Kumar (JC-0BSIP6)</strong>
                <span className="text-slate-400 font-mono">26 Aug 2026</span>
              </div>
              <p className="text-slate-650 mt-1"><span className="text-slate-450 block text-[9px] uppercase font-bold">Diagnosis</span> Routine general health checkup</p>
              <p className="text-slate-650 mt-2"><span className="text-slate-450 block text-[9px] uppercase font-bold">Vitals</span> Temp: 98.6 °F | Blood Pressure: 120/80 mmHg | SpO2: 98%</p>
              <p className="text-slate-650 mt-2"><span className="text-slate-450 block text-[9px] uppercase font-bold">Prescription</span> Vitamin B12 Supplements, Once Daily</p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Creation Modal Form */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <strong className="text-sm text-slate-800 block uppercase tracking-wider">Create Referral Coordination</strong>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-650 font-bold bg-transparent border-0 cursor-pointer text-xs">Close</button>
            </div>
            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Patient</label>
                <select value={refPatientId} onChange={(e) => setRefPatientId(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select Patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientRefId})</option>)}
                  {!patients.some(p => p.name === "Ramesh Kumar") && <option value="65e8b1b2f0a1c234567890ab">Ramesh Kumar (JC-7F3K92)</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Assign ASHA worker</label>
                <select value={refASHAId} onChange={(e) => setRefASHAId(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select ASHA Worker</option>
                  {ashasList.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Destination Clinic/Hospital</label>
                <select value={refFacilityId} onChange={(e) => setRefFacilityId(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select Clinic/Hospital</option>
                  {facilitiesList.map((f) => <option key={f._id} value={f._id}>{f.name} ({f.type})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Reason for Referral</label>
                <input type="text" value={refReason} onChange={(e) => setRefReason(e.target.value)} required placeholder="e.g. Advise follow-up vitals monitoring" className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Priority Level</label>
                  <select value={refPriority} onChange={(e) => setRefPriority(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                    <option value="Routine">Routine</option>
                    <option value="Priority">Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Follow-up Date</label>
                  <input type="date" value={refFollowUpDate} onChange={(e) => setRefFollowUpDate(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Clinical Instructions</label>
                <textarea value={refInstructions} onChange={(e) => setRefInstructions(e.target.value)} placeholder="e.g. Check temperature twice daily and log" className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden h-16 resize-none" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl border-0 cursor-pointer">
                Create Referral Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Writing Modal Form */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <strong className="text-sm text-slate-800 block uppercase tracking-wider">Write Prescription</strong>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-650 font-bold bg-transparent border-0 cursor-pointer text-xs">Close</button>
            </div>
            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Patient</label>
                <select value={rxPatientId} onChange={(e) => setRxPatientId(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select Patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientRefId})</option>)}
                  {!patients.some(p => p.name === "Ramesh Kumar") && <option value="65e8b1b2f0a1c234567890ab">Ramesh Kumar (JC-7F3K92)</option>}
                </select>
              </div>

              {/* Add medicine segment */}
              <div className="border border-slate-150 p-3 rounded-2xl bg-slate-50/50 space-y-3">
                <strong className="text-[10px] uppercase text-slate-450 tracking-wider block font-bold">Add Medicine</strong>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={rxMedName} onChange={(e) => setRxMedName(e.target.value)} placeholder="Medicine Name" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden" />
                  <input type="text" value={rxMedStrength} onChange={(e) => setRxMedStrength(e.target.value)} placeholder="Strength (e.g. 500mg)" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={rxMedForm} onChange={(e) => setRxMedForm(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden">
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                  <input type="text" value={rxMedDosage} onChange={(e) => setRxMedDosage(e.target.value)} placeholder="Dosage (e.g. 1-0-1)" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={rxMedDuration} onChange={(e) => setRxMedDuration(e.target.value)} placeholder="Duration Days" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden" />
                  <select value={rxMedInstructions} onChange={(e) => setRxMedInstructions(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden">
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="As Needed">As Needed</option>
                    <option value="With Milk">With Milk</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!rxMedName) return;
                    setRxMedicinesList(prev => [...prev, {
                      name: rxMedName,
                      strength: rxMedStrength,
                      form: rxMedForm,
                      dosage: rxMedDosage,
                      durationDays: Number(rxMedDuration),
                      instructions: rxMedInstructions
                    }]);
                    setRxMedName("");
                  }}
                  className="w-full bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-1.5 rounded-xl text-[10px] cursor-pointer"
                >
                  + Add to Prescription
                </button>
              </div>

              {/* Added medicines list */}
              {rxMedicinesList.length > 0 && (
                <div className="space-y-1.5 font-bold text-slate-700">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">List of Rx Items ({rxMedicinesList.length})</span>
                  {rxMedicinesList.map((m, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-50 border border-slate-150 p-2 rounded-xl text-[10px]">
                      <span>{m.name} ({m.strength}) - {m.form}</span>
                      <span>{m.dosage} ({m.durationDays} Days)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Additional Instructions</label>
                <input type="text" value={rxAdditionalNotes} onChange={(e) => setRxAdditionalNotes(e.target.value)} placeholder="e.g. Drink plenty of water" className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden" />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl border-0 cursor-pointer">
                Write & Deduct Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Creation Modal Form */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <strong className="text-sm text-slate-800 block uppercase tracking-wider">Schedule Follow-up</strong>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-650 font-bold bg-transparent border-0 cursor-pointer text-xs">Close</button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Patient</label>
                <select value={fuPatientId} onChange={(e) => setFuPatientId(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select Patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientRefId})</option>)}
                  {!patients.some(p => p.name === "Ramesh Kumar") && <option value="65e8b1b2f0a1c234567890ab">Ramesh Kumar (JC-7F3K92)</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Assign Worker</label>
                <select value={fuWorkerId} onChange={(e) => setFuWorkerId(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                  <option value="">Select ASHA Worker</option>
                  {ashasList.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold font-bold font-bold">Follow-up Type</label>
                  <select value={fuType} onChange={(e) => setFuType(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden">
                    <option value="Medication">Medication Compliance</option>
                    <option value="Vitals Log">Vitals Intake</option>
                    <option value="Referral check">Referral Check</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold font-bold font-bold">Due Date</label>
                  <input type="date" value={fuDueDate} onChange={(e) => setFuDueDate(e.target.value)} required className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold font-bold">Task Notes</label>
                <textarea value={fuNotes} onChange={(e) => setFuNotes(e.target.value)} placeholder="e.g. Ensure fever remains under 100 F" className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden h-16 resize-none" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl border-0 cursor-pointer">
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
