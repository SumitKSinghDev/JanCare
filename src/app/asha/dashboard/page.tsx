"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import VoiceAssistant from "@/components/VoiceAssistant";
import {
  divisions,
  getDistrictsForDivision,
  getTalukasForDistrict,
  getVillagesForTaluka,
} from "@/lib/maharashtra";
import {
  saveOfflinePatient,
  getOfflinePatients,
  deleteOfflinePatient,
  saveOfflineTriage,
  getOfflineTriage,
  deleteOfflineTriage,
} from "@/lib/offlineDb";
import {
  Activity,
  Heart,
  PlusCircle,
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  Check,
  Search,
  User,
  AlertTriangle,
  FolderSync,
  LogOut,
  MapPin,
  Calendar,
  Loader2,
  Home,
  Video,
  Menu,
  FileText
} from "lucide-react";
import AppShell from "@/components/AppShell";

export default function AshaDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  
  const [filterType, setFilterType] = useState<"all" | "registered" | "referred" | "followup" | "priority">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Active sub-filters
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [referralFilter, setReferralFilter] = useState<"All" | "New" | "Accepted" | "In Progress" | "Completed">("All");
  const [followupFilter, setFollowupFilter] = useState<"All" | "Due Today" | "Overdue" | "Completed">("All");

  // Connectivity state (Simulated & Browser linked)
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"Online" | "Offline" | "Syncing" | "Synced">("Online");
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    if (activeTab === "Dashboard") {
      fetchProfileAndPatients();
    } else if (activeTab === "Appointments") {
      fetchAppointments();
    } else if (activeTab === "Referrals") {
      fetchReferrals();
    } else if (activeTab === "Follow-ups") {
      fetchFollowups();
    } else if (activeTab === "Priority Cases") {
      fetchPriorityCases();
    } else if (activeTab === "My Patients") {
      fetchProfileAndPatients();
    }
  }, [activeTab]);

  // Registration form inputs
  const [regName, setRegName] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regGender, setRegGender] = useState("Male");
  const [regMobile, setRegMobile] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDivision, setRegDivision] = useState("Nashik");
  const [regDistrict, setRegDistrict] = useState("Nashik");
  const [regTaluka, setRegTaluka] = useState("Sinnar");
  const [regVillage, setRegVillage] = useState("Demo Village");
  const [emName, setEmName] = useState("");
  const [emRelation, setEmRelation] = useState("");
  const [emMobile, setEmMobile] = useState("");

  // Triage form inputs
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [temp, setTemp] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respRate, setRespRate] = useState("");

  const [symptoms, setSymptoms] = useState<Array<{ name: string; durationDays: number; severity: "Mild" | "Moderate" | "Severe" }>>([]);
  const [newSymptomName, setNewSymptomName] = useState("");
  const [newSymptomDuration, setNewSymptomDuration] = useState("2");
  const [newSymptomSeverity, setNewSymptomSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");

  // Geo options
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<string[]>([]);
  const [villageOptions, setVillageOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchProfileAndPatients();
    checkOfflineQueueCount();
  }, []);

  useEffect(() => {
    setDistrictOptions(getDistrictsForDivision(regDivision));
  }, [regDivision]);

  useEffect(() => {
    setTalukaOptions(getTalukasForDistrict(regDistrict));
  }, [regDistrict]);

  useEffect(() => {
    setVillageOptions(getVillagesForTaluka(regTaluka));
  }, [regTaluka]);

  async function fetchProfileAndPatients() {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.success) {
        router.push("/login");
        return;
      }
      setCurrentUser(userData.user);

      if (isOnline) {
        const patRes = await fetch("/api/patients");
        const patData = await patRes.json();
        if (patData.success) {
          setPatients(patData.patients);
        }

        const refRes = await fetch("/api/referrals");
        const refData = await refRes.json();
        if (refData.success) {
          setReferrals(refData.referrals);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error(e);
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
      console.error(e);
    } finally {
      setLoading(false);
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPriorityCases() {
    try {
      setLoading(true);
      const res = await fetch("/api/patients");
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptReferral(referralId: string) {
    try {
      const res = await fetch("/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, status: "Accepted" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Referral accepted successfully!");
        fetchReferrals();
      } else {
        alert("Failed to accept referral: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleCompleteFollowUp(followupId: string) {
    try {
      const res = await fetch("/api/followups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followupId, status: "Completed" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Follow-up marked completed!");
        fetchFollowups();
      } else {
        alert("Failed to update follow-up: " + data.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function checkOfflineQueueCount() {
    try {
      const offlinePats = await getOfflinePatients();
      const offlineTris = await getOfflineTriage();
      setOfflineCount(offlinePats.length + offlineTris.length);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  // Toggle online / offline manually for SIH demonstration
  async function toggleConnectivity() {
    if (isOnline) {
      // Go Offline
      setIsOnline(false);
      setSyncStatus("Offline");
      setSyncLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Toggled offline mode. Storing records to IndexedDB.`]);
    } else {
      // Go Online and trigger sync
      setIsOnline(true);
      setSyncStatus("Syncing");
      setSyncLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Connected. Starting background synchronization...`]);
      await handleSynchronization();
    }
  }

  // Process data synchronization
  async function handleSynchronization() {
    try {
      const offlinePats = await getOfflinePatients();
      const offlineTris = await getOfflineTriage();

      // Track mapping of temporary local ID to database ObjectId
      const idMap: { [localId: string]: string } = {};

      // 1. Sync Patients
      for (const pat of offlinePats) {
        setSyncLogs((prev) => [...prev, `Syncing patient: ${pat.name}...`]);
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pat),
        });
        const data = await res.json();
        if (data.success) {
          if (pat.id) {
            idMap[pat.id] = data.patient._id;
            await deleteOfflinePatient(pat.id);
          }
          setSyncLogs((prev) => [...prev, `✓ Synced ${pat.name} (${data.patient.patientRefId})`]);
        } else {
          setSyncLogs((prev) => [...prev, `❌ Error syncing patient ${pat.name}: ${data.error}`]);
        }
      }

      // 2. Sync Vitals & Triage records
      for (const tri of offlineTris) {
        // Map local temporary patient ID to newly generated DB ObjectId
        const dbPatientId = idMap[tri.patientId] || tri.patientId;

        setSyncLogs((prev) => [...prev, `Syncing vitals for patient ID ${dbPatientId}...`]);
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: dbPatientId,
            vitals: tri.vitals,
            symptoms: tri.symptoms,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (tri.id) {
            await deleteOfflineTriage(tri.id);
          }
          setSyncLogs((prev) => [...prev, `✓ Vitals synced. Triage result: ${data.triage.level}`]);
        } else {
          setSyncLogs((prev) => [...prev, `❌ Error syncing vitals: ${data.error}`]);
        }
      }

      setSyncStatus("Synced");
      setTimeout(() => setSyncStatus("Online"), 3000);
      await checkOfflineQueueCount();
      await fetchProfileAndPatients();
    } catch (error: any) {
      setSyncStatus("Offline");
      setSyncLogs((prev) => [...prev, `❌ Synchronization failed: ${error.message}`]);
    }
  }

  // Handle patient submission
  async function handleSubmitPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!regName || !regAge || !regDob || !regMobile || !emName || !emRelation || !emMobile) {
      alert("Please fill all required demographic fields.");
      return;
    }

    const patientData = {
      name: regName,
      age: Number(regAge),
      dateOfBirth: regDob,
      gender: regGender,
      mobile: regMobile,
      email: regEmail,
      division: regDivision,
      district: regDistrict,
      taluka: regTaluka,
      village: regVillage,
      emergencyContactName: emName,
      emergencyContactRelation: emRelation,
      emergencyContactMobile: emMobile,
    };

    if (isOnline) {
      try {
        const response = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData),
        });
        const data = await response.json();
        if (data.success) {
          alert(`Patient registered successfully! ID: ${data.patient.patientRefId}`);
          clearPatientForm();
          fetchProfileAndPatients();
          setActiveTab("My Patients");
        } else {
          alert("Error: " + data.error);
        }
      } catch (error: any) {
        alert("API connection failed. Record saved locally instead.");
        savePatientOffline(patientData);
      }
    } else {
      savePatientOffline(patientData);
    }
  }

  async function savePatientOffline(data: any) {
    const tempId = `TEMP-${Date.now()}`;
    await saveOfflinePatient({ ...data, id: tempId, offlineCreated: true });
    alert("Working Offline: Patient saved locally to IndexedDB queue. It will sync automatically when back online.");
    clearPatientForm();
    checkOfflineQueueCount();
    setActiveTab("Dashboard");
  }

  function clearPatientForm() {
    setRegName("");
    setRegAge("");
    setRegDob("");
    setRegMobile("");
    setRegEmail("");
    setEmName("");
    setEmRelation("");
    setEmMobile("");
  }

  // Handle Symptom Addition
  function addSymptom() {
    if (!newSymptomName) return;
    setSymptoms((prev) => [
      ...prev,
      {
        name: newSymptomName,
        durationDays: Number(newSymptomDuration),
        severity: newSymptomSeverity,
      },
    ]);
    setNewSymptomName("");
  }

  function removeSymptom(index: number) {
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
  }

  // Handle vitals & symptoms submission (Triage flow)
  async function handleSubmitTriage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId || !temp || !systolic || !diastolic || !pulse || !spo2 || !respRate) {
      alert("Please enter all required vital metrics.");
      return;
    }

    const triageData = {
      patientId: selectedPatientId,
      vitals: {
        temperature: Number(temp),
        bloodPressureSystolic: Number(systolic),
        bloodPressureDiastolic: Number(diastolic),
        heartRate: Number(pulse),
        spo2: Number(spo2),
        respiratoryRate: Number(respRate),
      },
      symptoms: symptoms,
    };

    if (isOnline) {
      try {
        const response = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(triageData),
        });
        const data = await response.json();
        if (data.success) {
          alert(`Triage successfully logged. AI Severity Index: ${data.triage.level}. Reason: ${data.triage.reason}`);
          clearTriageForm();
          setActiveTab("Dashboard");
        } else {
          alert("Error: " + data.error);
        }
      } catch (err: any) {
        alert("API connection failed. Triage saved locally instead.");
        saveTriageOffline(triageData);
      }
    } else {
      saveTriageOffline(triageData);
    }
  }

  async function saveTriageOffline(data: any) {
    const tempId = `TRI-${Date.now()}`;
    await saveOfflineTriage({ ...data, id: tempId, offlineCreated: true });
    alert("Working Offline: Triage log saved locally to IndexedDB queue. It will sync automatically when back online.");
    clearTriageForm();
    checkOfflineQueueCount();
    setActiveTab("Dashboard");
  }

  function clearTriageForm() {
    setSelectedPatientId("");
    setTemp("");
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setSpo2("");
    setRespRate("");
    setSymptoms([]);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Outreach Workspace...</p>
        </div>
      </div>
    );
  }

  // Process patients with their source mapping
  const patientsWithSource = patients.map((pat) => {
    const referral = referrals.find((r: any) => 
      (r.patientId?._id === pat._id || r.patientId === pat._id) && 
      (r.assignedAshaId === currentUser?.id || r.assignedAshaId?._id === currentUser?.id)
    );
    
    let source = "ASHA_REGISTERED";
    let referredBy = "";
    let reason = "";
    let followUpDate = "";
    let instructions = "";
    let referralStatus = "";
    let isUrgent = false;

    if (referral) {
      source = "DOCTOR_REFERRED";
      referredBy = referral.referringDoctorId?.name || "Dr. Aniruddha Kulkarni";
      reason = referral.reason;
      followUpDate = referral.followUpDate;
      instructions = referral.instructions;
      referralStatus = referral.status;
      isUrgent = referral.priority === "Urgent";
    }

    return {
      ...pat,
      source,
      referredBy,
      reason,
      followUpDate,
      instructions,
      referralStatus,
      isUrgent
    };
  });

  const searchedPatients = patientsWithSource.filter(
    (pat) =>
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.patientRefId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.mobile.includes(searchQuery)
  );

  const filteredPatients = searchedPatients.filter((pat) => {
    if (filterType === "registered") {
      return pat.source === "ASHA_REGISTERED";
    }
    if (filterType === "referred") {
      return pat.source === "DOCTOR_REFERRED";
    }
    if (filterType === "followup") {
      return pat.followUpDate || pat.referralStatus === "Created";
    }
    if (filterType === "priority") {
      return pat.isUrgent || pat.gender === "Other"; // Keep demo/priority conditions matched
    }
    return true; // "all"
  });

  return (
    <AppShell
      role="ASHA"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={currentUser}
    >
      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Village Health Outreach: {currentUser?.name}</h2>
              <p className="text-xs text-slate-300">Register new patients, record baseline triage vitals, and synchronize records.</p>
            </div>
            
            <button
              onClick={toggleConnectivity}
              className={`font-extrabold text-xs px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border-0 w-full sm:w-auto shrink-0 relative z-10 ${
                isOnline 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-150" 
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-150"
              }`}
            >
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              {isOnline ? "Go Offline" : "Go Online & Sync"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Sync Queue Count</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">{offlineCount} Pending</span>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Patients Registered</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">{patients.length} Registered</span>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Outreach Region</span>
              <span className="text-xs font-bold text-slate-700 mt-1 truncate">Nashik / Sinnar</span>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-22 sm:h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Connection Status</span>
              <span className="text-xs font-bold text-slate-850 mt-1 flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-amber-500"}`} />
                {syncStatus}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Outreach Operations Queue</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("Register Patient")}
                  className="p-5 border border-slate-200/80 hover:bg-slate-50 text-left rounded-2xl transition-all cursor-pointer bg-white"
                >
                  <PlusCircle className="text-primary" size={24} />
                  <strong className="text-sm text-slate-800 block mt-3">Register Village Patient</strong>
                  <span className="text-[10px] text-slate-400 block mt-1">Create unique Patient reference cards offline.</span>
                </button>
                <button
                  onClick={() => setActiveTab("Vitals & Symptoms")}
                  className="p-5 border border-slate-200/80 hover:bg-slate-50 text-left rounded-2xl transition-all cursor-pointer bg-white"
                >
                  <Activity className="text-primary" size={24} />
                  <strong className="text-sm text-slate-800 block mt-3">Log Symptoms & Vitals</strong>
                  <span className="text-[10px] text-slate-400 block mt-1">Triage patient health logs directly from households.</span>
                </button>
              </div>
            </div>

            {/* Sync logs display */}
            <div className="lg:col-span-4 bg-slate-900 text-slate-300 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <FolderSync size={14} /> Synchronization Log Console
              </h4>
              <div className="text-[10px] font-mono space-y-1.5 max-h-40 overflow-y-auto">
                {syncLogs.length > 0 ? (
                  syncLogs.map((log, index) => (
                    <p key={index} className="leading-normal">
                      {log}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500">No logs generated. Standby connection state.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "My Patients" && (
        <div className="space-y-6">
          {!selectedPatient ? (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Outreach Patient Registry</h2>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-hidden pl-2 text-xs text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Segmented Filters */}
              <div className="flex flex-wrap gap-2 pb-2">
                {[
                  { type: "all", label: "All Patients" },
                  { type: "registered", label: "Registered by Me" },
                  { type: "referred", label: "Doctor Referrals" },
                  { type: "followup", label: "Follow-ups Due" },
                  { type: "priority", label: "Priority Cases" },
                ].map((btn) => (
                  <button
                    key={btn.type}
                    onClick={() => setFilterType(btn.type as any)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border-0 ${
                      filterType === btn.type
                        ? "bg-[#1464D2] text-white shadow-xs"
                        : "bg-slate-100 text-slate-655 hover:bg-slate-200"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">Patient Ref ID</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Acquisition / Source</th>
                      <th className="py-2.5 px-4">Age/Sex</th>
                      <th className="py-2.5 px-4">Mobile</th>
                      <th className="py-2.5 px-4">Village</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((pat) => (
                        <tr key={pat._id || pat.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-500">{pat.patientRefId || "OFFLINE"}</td>
                          <td className="py-3 px-4 font-bold text-slate-700">
                            <div className="flex flex-col">
                              <span>{pat.name}</span>
                              {pat.isUrgent && (
                                <span className="inline-flex items-center text-[8px] font-extrabold text-red-650 bg-red-50 px-1 py-0.5 rounded mt-0.5 w-max">Urgent Attention</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5 font-sans">
                              {pat.source === "DOCTOR_REFERRED" ? (
                                <>
                                  <span className="inline-flex items-center text-[9px] font-bold text-blue-650 bg-blue-50 px-1.5 py-0.5 rounded-full w-max">Doctor Referral</span>
                                  <span className="text-[9px] text-slate-455">Referred by {pat.referredBy || "Dr. XYZ"}</span>
                                </>
                              ) : (
                                <span className="inline-flex items-center text-[9px] font-bold text-green-650 bg-green-50 px-1.5 py-0.5 rounded-full w-max">Registered by Me</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{pat.age}y / {pat.gender}</td>
                          <td className="py-3 px-4 text-slate-500">{pat.mobile}</td>
                          <td className="py-3 px-4 text-slate-500">{pat.village}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedPatient(pat)}
                                className="bg-[#F8FAFC] hover:bg-slate-100 text-slate-750 font-bold py-1 px-2.5 rounded-lg border border-slate-200 cursor-pointer text-[10px]"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatientId(pat._id || pat.id);
                                  setActiveTab("Vitals & Symptoms");
                                }}
                                className="bg-primary hover:bg-blue-600 text-white font-bold py-1 px-2.5 rounded-lg cursor-pointer border-0 text-[10px]"
                              >
                                Record Vitals
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-mono italic">
                          No patients match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Patient Details Panel (Step 6) */
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in zoom-in-98 duration-200">
              <div className="border-b border-slate-100 pb-4">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-primary hover:underline cursor-pointer border-0 bg-transparent text-xs font-bold flex items-center gap-1"
                >
                  ← Back to Patient Registry
                </button>
                <h2 className="text-lg font-extrabold text-slate-800 mt-2">Patient Case Details: {selectedPatient.name}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Demographics Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                  <strong className="text-slate-800 font-extrabold block text-sm uppercase tracking-wider">Demographics</strong>
                  <div className="space-y-2 text-slate-655 font-semibold">
                    <p><span className="text-slate-450 block text-[9px] uppercase">Patient Reference ID</span> {selectedPatient.patientRefId || "OFFLINE"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Gender / Age</span> {selectedPatient.gender} / {selectedPatient.age} Years</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Mobile Number</span> {selectedPatient.mobile || "Not configured"}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Village Node</span> {selectedPatient.village}, {selectedPatient.taluka}, {selectedPatient.district}</p>
                    <p><span className="text-slate-450 block text-[9px] uppercase">Associated ASHA</span> {currentUser?.name || "Sharda Patil"}</p>
                  </div>
                </div>

                {/* Vitals Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs md:col-span-2">
                  <strong className="text-slate-800 font-extrabold block text-sm uppercase tracking-wider">Baseline Vitals Timeline</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-bold text-slate-705">
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Temperature</span>
                      <span className="text-base text-slate-850">98.6 °F</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">SpO2 Level</span>
                      <span className="text-base text-slate-850">98%</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Pulse Rate</span>
                      <span className="text-base text-slate-850">72 bpm</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Blood Pressure</span>
                      <span className="text-base text-slate-850">120/80 mmHg</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase">Triage level</span>
                      <span className="text-green-700 mt-1 block flex items-center gap-1 font-extrabold text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Routine
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic outreach timeline history */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Care History Logs</h3>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-1.5 mb-2.5">
                      <span>ASHA Triage Visit</span>
                      <span className="text-slate-450 font-mono">26 Aug 2026</span>
                    </div>
                    <p className="text-slate-655"><span className="text-slate-450 block text-[9px] uppercase">Recorded Symptoms</span> Fever, Mild headache</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. REGISTER PATIENT VIEW */}
      {activeTab === "Register Patient" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Register Village Patient</h2>
            <p className="text-xs text-slate-500">Record demographics and assign unique identifiers.</p>
          </div>

          <form onSubmit={handleSubmitPatient} className="space-y-6 text-xs max-w-3xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700">Patient Full Name (Required)</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Savitri Pawar"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700">Mobile Number (Required)</label>
                <input
                  type="text"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="e.g. 9822000000"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700">Age</label>
                <input
                  type="number"
                  required
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value)}
                  placeholder="e.g. 42"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={regDob}
                  onChange={(e) => setRegDob(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700">Gender</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700">Email Address (Optional)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. name@jancare.in"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <strong className="block text-slate-800 text-[13px]">Geographical Mapping Location</strong>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-500">Division</label>
                  <select value={regDivision} onChange={(e) => setRegDivision(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-hidden">
                    {divisions.map((div) => <option key={div.name} value={div.name}>{div.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500">District</label>
                  <select value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
                    {districtOptions.map((dist) => <option key={dist} value={dist}>{dist}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500">Taluka</label>
                  <select value={regTaluka} onChange={(e) => setRegTaluka(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
                    {talukaOptions.map((tal) => <option key={tal} value={tal}>{tal}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500">Village</label>
                  <select value={regVillage} onChange={(e) => setRegVillage(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
                    {villageOptions.map((vil) => <option key={vil} value={vil}>{vil}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <strong className="block text-slate-800 text-[13px]">Emergency Contact</strong>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={emName}
                    onChange={(e) => setEmName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Relation</label>
                  <input
                    type="text"
                    required
                    value={emRelation}
                    onChange={(e) => setEmRelation(e.target.value)}
                    placeholder="e.g. Spouse"
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={emMobile}
                    onChange={(e) => setEmMobile(e.target.value)}
                    placeholder="e.g. 9822000000"
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { clearPatientForm(); setActiveTab("Dashboard"); }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer border-0 shadow-xs"
              >
                Register & Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. VITALS & TRIAGE LOGGING VIEW */}
      {activeTab === "Vitals & Symptoms" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Record Symptoms & Vitals</h2>
            <p className="text-xs text-slate-500">Record patient triage parameters and auto-calculate severity indices.</p>
          </div>

          <form onSubmit={handleSubmitTriage} className="space-y-6 text-xs max-w-3xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700">Select Patient Profile</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id || pat.id} value={pat._id || pat.id}>
                      {pat.name} ({pat.patientRefId || "Offline record"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Body Temperature (°F)</label>
                <input
                  type="text"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="e.g. 98.6"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Blood Pressure - Systolic (mmHg)</label>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="e.g. 120"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Blood Pressure - Diastolic (mmHg)</label>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="e.g. 80"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Pulse / Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="e.g. 72"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">SpO2 Oxygen Level (%)</label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="e.g. 98"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  required
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  placeholder="e.g. 16"
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <strong className="block text-slate-800 text-[13px]">Active Symptoms Check</strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block font-bold text-slate-500">Symptom Name</label>
                  <input
                    type="text"
                    value={newSymptomName}
                    onChange={(e) => setNewSymptomName(e.target.value)}
                    placeholder="e.g. Fever"
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500">Duration (Days)</label>
                  <input
                    type="number"
                    value={newSymptomDuration}
                    onChange={(e) => setNewSymptomDuration(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500">Severity</label>
                  <div className="flex gap-2">
                    <select
                      value={newSymptomSeverity}
                      onChange={(e) => setNewSymptomSeverity(e.target.value as any)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                    <button
                      type="button"
                      onClick={addSymptom}
                      className="bg-primary text-white px-3 py-1 rounded-lg mt-1 cursor-pointer hover:bg-blue-600 border-0 font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {symptoms.length > 0 && (
                <div className="space-y-1.5">
                  {symptoms.map((sym, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span><strong>{sym.name}</strong> — {sym.durationDays} Days ({sym.severity})</span>
                      <button onClick={() => removeSymptom(idx)} type="button" className="text-red-500 hover:text-red-700 font-bold bg-transparent border-0 cursor-pointer">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { clearTriageForm(); setActiveTab("Dashboard"); }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer border-0 shadow-xs"
              >
                Log Triage Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. ASHA PROFILE WORKSPACE */}
      {activeTab === "Profile" && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">ASHA Profile</h2>
            <p className="text-xs text-slate-500">Your health worker registration profile and jurisdiction details.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Avatar card */}
            <div className="md:col-span-4 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 bg-blue-50 border-2 border-blue-200 text-primary font-extrabold rounded-full flex items-center justify-center text-xl shadow-xs">
                {currentUser?.name?.split(" ").map((n: string) => n[0]).join("") || "ASHA"}
              </div>
              <div>
                <strong className="text-sm font-extrabold text-slate-850 block">{currentUser?.name || "Sharda Patil"}</strong>
                <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full mt-1.5 inline-block border border-green-200/55">
                  ASHA ID: {currentUser?.username || "ASHA-NSK-001"}
                </span>
              </div>
              <div className="w-full pt-4 border-t border-slate-200 text-left space-y-2 text-[11px] text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Role Grid:</span>
                  <span className="font-mono text-slate-450 uppercase">{currentUser?.role || "ASHA"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Profile fields details grid */}
            <div className="md:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <strong className="text-slate-800 font-extrabold block text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">Outreach Geography</strong>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">District Node</span>
                    <span>Nashik</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">Taluka Node</span>
                    <span>Sinnar</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">Assigned Village</span>
                    <span>Demo Village</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">Associated PHC</span>
                    <span>PHC 1 Demo</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <strong className="text-slate-800 font-extrabold block text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">Preferred Languages</strong>
                <p className="text-slate-650 font-semibold">Marathi, Hindi, English</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRIORITY CASES DIRECTORY */}
      {activeTab === "Priority Cases" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Priority Cases Directory</h2>
            <p className="text-xs text-slate-500">Patients categorized by clinical vitals severity levels.</p>
          </div>

          <div className="grid gap-3 text-xs font-semibold">
            {patients.filter(p => p.triageStatus === "Urgent" || p.triageStatus === "Priority").length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
                No priority cases registered in your village node.
              </div>
            ) : (
              patients
                .filter(p => p.triageStatus === "Urgent" || p.triageStatus === "Priority")
                .map(p => {
                  const isUrgent = p.triageStatus === "Urgent";
                  return (
                    <div key={p._id} className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 text-sm">{p.name}</strong>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            isUrgent ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>{p.triageStatus}</span>
                        </div>
                        <p className="text-slate-400 mt-1">ID: {p.patientRefId} | {p.age} Yrs / {p.gender}</p>
                        <p className="text-slate-650 mt-1">District: {p.district} | village: {p.village}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setActiveTab("My Patients");
                        }}
                        className="bg-primary hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer border-0 shrink-0"
                      >
                        Open Profile
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 7. APPOINTMENTS SCHEDULE */}
      {activeTab === "Appointments" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Coordinated Appointments</h2>
            <p className="text-xs text-slate-500">View scheduled clinic or tele-consultation sessions for your village patients.</p>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
              No appointments scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                    <th className="py-2.5 px-4">Date / Time</th>
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Doctor</th>
                    <th className="py-2.5 px-4">Source</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {new Date(app.appointmentDate).toLocaleDateString()} at {app.appointmentTime || "11:30 AM"}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-bold">{app.patientId?.name || "Ramesh Kumar"}</td>
                      <td className="py-3 px-4 text-slate-550 font-semibold">{app.doctorId?.name || "Dr. XYZ"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${
                          app.bookingSource === "AI_ASSISTANT" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>{app.bookingSource || "MANUAL"}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. REFERRALS TASK LIST */}
      {activeTab === "Referrals" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Incoming Referrals</h2>
            <p className="text-xs text-slate-500">Track referred cases assigned to you by doctors for home visits.</p>
          </div>

          <div className="flex gap-2 pb-2">
            {["All", "New", "Accepted", "Completed"].map((filter) => (
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
            <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
              No referrals assigned to you.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {referrals
                .filter(ref => referralFilter === "All" || (referralFilter === "New" && ref.status === "Created") || (referralFilter === "Accepted" && ref.status === "Accepted") || (referralFilter === "Completed" && ref.status === "Completed"))
                .map((ref) => (
                  <div key={ref._id} className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <strong className="text-slate-800 block text-sm">{ref.patientId?.name}</strong>
                      <span className="text-[10px] text-slate-450 font-mono font-semibold">{new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-1 text-slate-650 font-semibold">
                      <p><span className="text-slate-450 block text-[9px] uppercase">Reason</span> {ref.reason}</p>
                      <p><span className="text-slate-450 block text-[9px] uppercase">Referring Doctor</span> {ref.referringDoctorId?.name || "Dr. XYZ"}</p>
                      <p><span className="text-slate-450 block text-[9px] uppercase">Instructions</span> {ref.instructions || "None"}</p>
                      <p><span className="text-slate-450 block text-[9px] uppercase">Priority</span> {ref.priority}</p>
                      <p><span className="text-slate-450 block text-[9px] uppercase">Status</span> {ref.status}</p>
                    </div>
                    {ref.status === "Created" && (
                      <button
                        onClick={() => handleAcceptReferral(ref._id)}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold py-2.5 rounded-xl border-0 cursor-pointer text-xs mt-2"
                      >
                        Accept Referral Task
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 9. FOLLOW-UP CARE CHECKS */}
      {activeTab === "Follow-ups" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Follow-up Tasks</h2>
            <p className="text-xs text-slate-500">Coordinate recovery timelines, check compliance, and record follow-up vitals.</p>
          </div>

          {followups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
              No follow-up checks scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Task Description</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {followups.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-805 font-bold">{f.patientId?.name || "Ramesh Kumar"}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{f.notes || f.type}</td>
                      <td className="py-3 px-4 font-semibold">
                        <span className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${
                          f.status === "Upcoming" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-green-50 text-green-700 border border-green-100"
                        }`}>{f.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {f.status === "Upcoming" ? (
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPatientId(f.patientId?._id);
                                setActiveTab("Vitals & Symptoms");
                              }}
                              className="bg-[#F8FAFC] hover:bg-slate-100 text-slate-750 font-bold py-1 px-2.5 rounded-lg border border-slate-200 cursor-pointer text-[10px]"
                            >
                              Record Vitals
                            </button>
                            <button
                              onClick={() => handleCompleteFollowUp(f._id)}
                              className="bg-primary hover:bg-blue-600 text-white font-bold py-1 px-2.5 rounded-lg border-0 cursor-pointer text-[10px]"
                            >
                              Complete
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold text-[9px]">Completed</span>
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

      {/* 10. OFFLINE QUEUE & SYNC */}
      {activeTab === "Offline & Sync" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Offline & Synchronization</h2>
              <p className="text-xs text-slate-500">Manage local data queue and synchronization states.</p>
            </div>
            <button
              onClick={toggleConnectivity}
              className={`font-bold text-xs px-4 py-2.5 rounded-xl border-0 cursor-pointer text-white ${
                isOnline ? "bg-[#1464D2]" : "bg-amber-600"
              }`}
            >
              {isOnline ? "Simulate Offline Mode" : "Connect & Sync Now"}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="bg-[#F8FAFC] border border-slate-200 p-4.5 rounded-2xl space-y-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Network Connection</span>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="text-green-600" size={16} />
                    <span className="text-green-700 font-bold text-sm">Online Status</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="text-amber-600" size={16} />
                    <span className="text-amber-700 font-bold text-sm">Offline Storing Mode</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 p-4.5 rounded-2xl space-y-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Pending Sync Logs</span>
              <strong className="text-slate-800 text-lg block">{offlineCount} Records Queue</strong>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 p-4.5 rounded-2xl space-y-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Status Sync</span>
              <strong className="text-slate-850 text-sm block">{syncStatus}</strong>
            </div>
          </div>

          {/* Sync activity logs */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-xs">
            <strong className="text-slate-850 block">Synchronization Audit Logs</strong>
            <div className="bg-white border border-slate-150 p-3 rounded-xl max-h-40 overflow-y-auto space-y-1.5 text-[10px] text-slate-500 font-mono">
              {syncLogs.length === 0 ? (
                <div className="italic text-slate-400 text-center py-4">No recent activity. Try offline actions.</div>
              ) : (
                syncLogs.map((log, idx) => <div key={idx}>{log}</div>)
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. VILLAGE MAP */}
      {activeTab === "Village / Map" && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">ASHA Outreach Geography</h2>
            <p className="text-xs text-slate-500">Your assigned villages and nearby health facilities.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-450 block uppercase font-bold">State</span>
              <span>Maharashtra</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-450 block uppercase font-bold">District</span>
              <span>Nashik</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-450 block uppercase font-bold">Taluka</span>
              <span>Sinnar</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-450 block uppercase font-bold">Outreach Village</span>
              <span>Demo Village</span>
            </div>
          </div>

          {/* Map layout */}
          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs h-64 bg-slate-105 flex flex-col justify-center items-center text-center p-6 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1464D2_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            <MapPin className="text-[#1464D2] animate-bounce shrink-0" size={36} />
            <strong className="text-slate-850 block mt-2 text-sm">Demo Village Map Node</strong>
            <p className="text-slate-500 text-xs mt-1 max-w-sm font-semibold">Outreach coordinates centered at Sinnar Sub-District. Protected geography is online.</p>
          </div>
        </div>
      )}

      {/* Voice Assistant AI overlay */}
      <VoiceAssistant
        language={language === "mr" ? "Marathi" : language === "hi" ? "Hindi" : "English"}
        onExtractionComplete={(extraction) => {
          if (extraction.vitals) {
            if (extraction.vitals.temperature) setTemp(extraction.vitals.temperature.toString());
            if (extraction.vitals.bloodPressureSystolic) setSystolic(extraction.vitals.bloodPressureSystolic.toString());
            if (extraction.vitals.bloodPressureDiastolic) setDiastolic(extraction.vitals.bloodPressureDiastolic.toString());
            if (extraction.vitals.heartRate) setPulse(extraction.vitals.heartRate.toString());
            if (extraction.vitals.spo2) setSpo2(extraction.vitals.spo2.toString());
            if (extraction.vitals.respiratoryRate) setRespRate(extraction.vitals.respiratoryRate.toString());
          }
          if (extraction.symptoms && extraction.symptoms.length > 0) {
            setSymptoms(extraction.symptoms);
          }
          setActiveTab("Vitals & Symptoms");
        }}
      />
    </AppShell>
  );
}
