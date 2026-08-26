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

export default function AshaDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Connectivity state (Simulated & Browser linked)
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"Online" | "Offline" | "Syncing" | "Synced">("Online");
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Active form tabs
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "register" | "triage">("overview");

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
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
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
      preferredLanguage: "Marathi",
      emergencyContact: {
        name: emName,
        relation: emRelation,
        mobile: emMobile,
      },
      createdAt: Date.now(),
    };

    if (!isOnline) {
      // Store to IndexedDB
      await saveOfflinePatient(patientData);
      setSyncLogs((prev) => [...prev, `[Offline Saved] Cached patient ${regName} locally.`]);
      await checkOfflineQueueCount();
      clearRegForm();
      setActiveTab("list");
    } else {
      // Submit Live
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData),
        });
        const data = await res.json();
        if (data.success) {
          alert(`Patient registered successfully! Ref ID: ${data.patient.patientRefId}`);
          clearRegForm();
          await fetchProfileAndPatients();
          setActiveTab("list");
        } else {
          alert(data.error || "Failed to register patient");
        }
      } catch (err: any) {
        alert(err.message || "Failed to contact database");
      }
    }
  }

  // Handle triage intake submission
  async function handleSubmitTriage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    const triageData = {
      patientId: selectedPatientId,
      vitals: {
        temperature: temp ? Number(temp) : undefined,
        bloodPressureSystolic: systolic ? Number(systolic) : undefined,
        bloodPressureDiastolic: diastolic ? Number(diastolic) : undefined,
        heartRate: pulse ? Number(pulse) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        respiratoryRate: respRate ? Number(respRate) : undefined,
      },
      symptoms: symptoms,
      createdAt: Date.now(),
    };

    if (!isOnline) {
      await saveOfflineTriage(triageData);
      setSyncLogs((prev) => [...prev, `[Offline Saved] Cached vitals and symptoms for patient.`]);
      await checkOfflineQueueCount();
      clearTriageForm();
      setActiveTab("list");
    } else {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(triageData),
        });
        const data = await res.json();
        if (data.success) {
          alert(`Vitals logged! Triage level: ${data.triage.level}\nReason: ${data.triage.reason}`);
          clearTriageForm();
          setActiveTab("list");
        } else {
          alert(data.error || "Failed to submit triage");
        }
      } catch (err: any) {
        alert(err.message || "Failed to submit triage");
      }
    }
  }

  function clearRegForm() {
    setRegName("");
    setRegAge("");
    setRegDob("");
    setRegMobile("");
    setRegEmail("");
    setEmName("");
    setEmRelation("");
    setEmMobile("");
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

  function handleVoiceExtraction(extraction: any) {
    if (extraction.vitals) {
      const v = extraction.vitals;
      if (v.temperature) setTemp(v.temperature.toString());
      if (v.bloodPressureSystolic) setSystolic(v.bloodPressureSystolic.toString());
      if (v.bloodPressureDiastolic) setDiastolic(v.bloodPressureDiastolic.toString());
      if (v.heartRate) setPulse(v.heartRate.toString());
      if (v.spo2) setSpo2(v.spo2.toString());
      if (v.respiratoryRate) setRespRate(v.respiratoryRate.toString());
    }
    if (extraction.symptoms && Array.isArray(extraction.symptoms)) {
      setSymptoms((prev) => [
        ...prev,
        ...extraction.symptoms.map((s: any) => ({
          name: s.name,
          durationDays: s.durationDays || 2,
          severity: s.severity || "Mild",
        })),
      ]);
    }
  }

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

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientRefId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-bg-brand flex flex-col font-sans">
      {/* Top Banner */}
      <nav className="bg-white border-b border-border-brand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="जनCare Logo" className="h-9 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t("dashboards.asha")}</span>
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

            <span className="text-xs text-text-secondary">ASHA: {currentUser?.name || "Sharda Patil"}</span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Connectivity Controller Panel */}
      <div className="bg-slate-950 text-white py-3 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <span className="bg-green-brand/20 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Wifi size={14} /> Online
            </span>
          ) : (
            <span className="bg-orange-brand/20 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <WifiOff size={14} /> Working Offline
            </span>
          )}

          {offlineCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              {offlineCount} records waiting to synchronize
            </span>
          )}

          {syncStatus === "Syncing" && (
            <span className="text-xs text-primary font-bold flex items-center gap-2">
              <RefreshCw className="animate-spin" size={14} /> Synchronizing queue...
            </span>
          )}
          {syncStatus === "Synced" && (
            <span className="text-xs text-green-400 font-bold flex items-center gap-1">
              <Check size={14} /> Synchronized
            </span>
          )}
        </div>

        <button
          onClick={toggleConnectivity}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          {isOnline ? <WifiOff size={14} /> : <Wifi size={14} />}
          {isOnline ? "Simulate Offline Mode" : "Connect Online & Sync"}
        </button>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation / Actions Left */}
        <div className="lg:col-span-3 space-y-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full p-4 text-left font-bold rounded-2xl border transition-all text-sm flex items-center gap-3 cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-white border-border-brand text-text-secondary hover:bg-slate-50"
            }`}
          >
            <Calendar size={18} />
            Attention Needed Today
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`w-full p-4 text-left font-bold rounded-2xl border transition-all text-sm flex items-center gap-3 cursor-pointer ${
              activeTab === "list"
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-white border-border-brand text-text-secondary hover:bg-slate-50"
            }`}
          >
            <Search size={18} />
            Patient Registry
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`w-full p-4 text-left font-bold rounded-2xl border transition-all text-sm flex items-center gap-3 cursor-pointer ${
              activeTab === "register"
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-white border-border-brand text-text-secondary hover:bg-slate-50"
            }`}
          >
            <PlusCircle size={18} />
            Register Patient
          </button>

          <button
            onClick={() => setActiveTab("triage")}
            className={`w-full p-4 text-left font-bold rounded-2xl border transition-all text-sm flex items-center gap-3 cursor-pointer ${
              activeTab === "triage"
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-white border-border-brand text-text-secondary hover:bg-slate-50"
            }`}
          >
            <Activity size={18} />
            Log Vitals & Symptoms
          </button>

          {/* Sync log display */}
          {syncLogs.length > 0 && (
            <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <FolderSync size={14} /> Local Synchronization Log
              </h4>
              <div className="text-[10px] font-mono space-y-1.5 max-h-40 overflow-y-auto">
                {syncLogs.map((log, index) => (
                  <p key={index} className="leading-normal">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Output Area */}
        <div className="lg:col-span-9">
          {/* Tab 0: Attention Needed Today (Overview) */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              {/* Header Card */}
              <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-deep-blue font-sans">Good morning, Sunita! 👋</h3>
                  <p className="text-xs text-text-secondary font-medium font-sans">Here's your field work overview for today.</p>
                </div>
                <button
                  onClick={() => setActiveTab("register")}
                  className="bg-primary hover:bg-deep-blue text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs border-0"
                >
                  Register New Patient
                </button>
              </div>

              {/* Stats Cards Row matching reference exactly */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1">
                  <span className="text-[8px] text-text-secondary font-bold uppercase block">Patients Under Care</span>
                  <span className="text-lg font-bold text-text-primary block">42</span>
                </div>
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1 border-l-4 border-l-red-500">
                  <span className="text-[8px] text-red-500 font-bold uppercase block">Urgent Patients</span>
                  <span className="text-lg font-bold text-red-600 block">3</span>
                </div>
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1 border-l-4 border-l-orange-500">
                  <span className="text-[8px] text-orange-500 font-bold uppercase block">Priority Patients</span>
                  <span className="text-lg font-bold text-orange-600 block">8</span>
                </div>
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1 border-l-4 border-l-primary">
                  <span className="text-[8px] text-primary font-bold uppercase block">Follow-ups Due</span>
                  <span className="text-lg font-bold text-primary block">7</span>
                </div>
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1">
                  <span className="text-[8px] text-text-secondary font-bold uppercase block">Offline Records</span>
                  <span className="text-lg font-bold text-text-primary block">{offlineCount || 5}</span>
                </div>
                <div className="bg-white border border-border-brand p-4 rounded-xl space-y-1">
                  <span className="text-[8px] text-text-secondary font-bold uppercase block">Today's Visits</span>
                  <span className="text-lg font-bold text-text-primary block">12</span>
                </div>
              </div>

              {/* 3-Column Split Workspace Grid */}
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (5 cols): Priority Queue, Timetable Schedule, Offline Data */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Today's Priority Queue */}
                  <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider">Today's Priority Queue</h4>
                      <button onClick={() => alert("Loading full queue...")} className="text-primary text-[8px] font-bold uppercase bg-transparent border-0 cursor-pointer">View All</button>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-red-50/50 border border-red-200/50 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Ramesh Kumar</strong>
                          <span className="text-[9px] text-red-500 font-extrabold block">Fever, High Temp (Sonapur)</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPatientId("JC-7F3K92");
                            setActiveTab("triage");
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer"
                        >
                          View Case
                        </button>
                      </div>

                      <div className="bg-orange-50/50 border border-orange-200/50 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Savitri Patil</strong>
                          <span className="text-[9px] text-orange-600 font-extrabold block">BP High check (Sonapur)</span>
                        </div>
                        <button onClick={() => alert("Loading Savitri Patil details...")} className="bg-orange-500 hover:bg-orange-700 text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer">View Case</button>
                      </div>

                      <div className="bg-green-50/50 border border-green-200/50 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Mahadev Gaikwad</strong>
                          <span className="text-[9px] text-green-600 font-extrabold block">Diabetes Follow-up</span>
                        </div>
                        <button onClick={() => alert("Loading Mahadev Gaikwad details...")} className="bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer">View Case</button>
                      </div>
                    </div>
                  </div>

                  {/* Today's Schedule */}
                  <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">Today's Schedule</h4>
                    <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[8px] text-text-secondary">09:00 AM</span>
                        <strong className="text-text-primary block">Household Survey</strong>
                        <span className="text-[9px] text-green-600 font-medium">Completed (Village 1)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[8px] text-text-secondary">10:30 AM</span>
                        <strong className="text-text-primary block">Patient Visit — Ramesh Kumar</strong>
                        <span className="text-[9px] text-green-600 font-medium">Completed (Village 1)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] text-text-secondary">12:00 PM</span>
                        <strong className="text-text-primary block">Vitals & Symptoms logging</strong>
                        <span className="text-[9px] text-primary font-medium">In Progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Offline Data Sync */}
                  <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">Offline Data</h4>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-text-primary">
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <strong>3</strong>
                        <span className="block text-[8px] text-text-secondary mt-0.5">Patients</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <strong>2</strong>
                        <span className="block text-[8px] text-text-secondary mt-0.5">Vitals</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <strong>4</strong>
                        <span className="block text-[8px] text-text-secondary mt-0.5">Symptoms</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <strong>1</strong>
                        <span className="block text-[8px] text-text-secondary mt-0.5">Referral</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSynchronization}
                      disabled={syncStatus === "Syncing"}
                      className="w-full bg-green-brand hover:bg-green-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border-0 mt-2"
                    >
                      <RefreshCw size={12} className={syncStatus === "Syncing" ? "animate-spin" : ""} /> Sync Now
                    </button>
                  </div>
                </div>

                {/* Middle Column (4 cols): Follow-ups list & Quick Actions tiles */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Follow-ups Due */}
                  <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider">Follow-ups Due</h4>
                      <button onClick={() => alert("Loading full list...")} className="text-primary text-[8px] font-bold uppercase bg-transparent border-0 cursor-pointer">View All</button>
                    </div>

                    <div className="space-y-3">
                      <div className="border border-slate-100 p-3 rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Laxmi Shinde</strong>
                          <span className="text-[9px] text-red-500 font-extrabold block">Pregnancy Follow-up (Today)</span>
                        </div>
                        <button onClick={() => alert("Marked Laxmi Shinde follow-up as done.")} className="bg-primary hover:bg-deep-blue text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer">Mark Done</button>
                      </div>
                      
                      <div className="border border-slate-100 p-3 rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Raju More</strong>
                          <span className="text-[9px] text-amber-500 font-extrabold block">BP Check (Tomorrow)</span>
                        </div>
                        <button onClick={() => alert("Marked Raju More follow-up as done.")} className="bg-primary hover:bg-deep-blue text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer">Mark Done</button>
                      </div>

                      <div className="border border-slate-100 p-3 rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-text-primary block font-bold">Anita Jadhav</strong>
                          <span className="text-[9px] text-green-700 font-extrabold block">Sugar Check (29 Aug)</span>
                        </div>
                        <button onClick={() => alert("Marked Anita Jadhav follow-up as done.")} className="bg-primary hover:bg-deep-blue text-white text-[9px] font-bold px-2 py-1 rounded border-0 cursor-pointer">Mark Done</button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Grid matching references */}
                  <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">Quick Actions</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab("register")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <PlusCircle size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Register Patient</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("triage")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <Activity size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Record Vitals</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("triage")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <Heart size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Add Symptoms</span>
                      </button>

                      <button
                        onClick={() => alert("Direct Referral Intake Form opened.")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <RefreshCw size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Create Referral</span>
                      </button>

                      <button
                        onClick={() => alert("ASHA Visit scheduler opened.")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <Calendar size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Schedule Follow-up</span>
                      </button>

                      <button
                        onClick={() => alert("Health awareness guide documents list loaded.")}
                        className="bg-slate-50 border border-slate-200/60 hover:bg-soft-blue hover:border-primary/20 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-text-primary transition-all"
                      >
                        <FileText size={16} className="text-primary" />
                        <span className="text-[10px] font-bold">Health Education</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column (3 cols): Map & Alerts */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* My Area Map (Leaflet OpenStreetMap embed iframe) */}
                  <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">My Area Map</h4>
                    
                    <div className="bg-slate-100 border border-slate-200 rounded-xl h-44 overflow-hidden relative">
                      <iframe
                        className="w-full h-full rounded-xl border-0"
                        src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                          ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Sinnar,Maharashtra`
                          : "https://www.openstreetmap.org/export/embed.html?bbox=73.98%2C19.83%2C74.03%2C19.88&layer=mapnik"
                        }
                        title="ASHA Area Map"
                      />
                    </div>
                    
                    {/* Map labels */}
                    <div className="grid grid-cols-2 gap-1 text-[8px] font-bold text-text-secondary">
                      <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Urgent</div>
                      <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Priority</div>
                      <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Routine</div>
                      <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Follow-up</div>
                    </div>
                  </div>

                  {/* Alerts & Notifications */}
                  <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider border-b border-slate-100 pb-2">Alerts & Notifications</h4>
                    <div className="space-y-2 text-[10px] leading-relaxed">
                      <div className="border-b border-slate-100 pb-1.5">
                        <strong className="text-text-primary block font-bold">Referral pending approval</strong>
                        <span className="text-text-secondary">Ramesh Kumar admission check required.</span>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <strong className="text-text-primary block font-bold text-red-600">High BP alert</strong>
                        <span className="text-text-secondary">Savitri Patil reported systolic &gt; 160.</span>
                      </div>
                      <div>
                        <strong className="text-text-primary block font-bold">Follow-up overdue</strong>
                        <span className="text-text-secondary">Vitthal Pawar checkup missed yesterday.</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 1: Patients List */}
          {activeTab === "list" && (
            <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-brand pb-4">
                <h3 className="font-bold text-lg text-deep-blue">Patient Registry</h3>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or Ref ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                </div>
              </div>

              {!isOnline && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg text-xs text-orange-700 font-medium">
                  Showing local database only. Sync is required to query active records.
                </div>
              )}

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : filteredPatients.length === 0 ? (
                <p className="text-sm text-text-secondary py-12 text-center">No patients found matching search criteria.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-brand text-slate-400 font-bold bg-slate-50/50">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Age/Gender</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map((pat) => (
                        <tr key={pat._id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-primary">{pat.patientRefId}</td>
                          <td className="py-3.5 px-4 font-semibold text-text-primary">{pat.name}</td>
                          <td className="py-3.5 px-4">{pat.age}y / {pat.gender}</td>
                          <td className="py-3.5 px-4">{pat.mobile}</td>
                          <td className="py-3.5 px-4">{pat.village}, {pat.taluka}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedPatientId(pat._id);
                                setActiveTab("triage");
                              }}
                              className="bg-soft-blue hover:bg-primary hover:text-white text-primary text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                            >
                              Log Vitals
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

          {/* Tab 2: Patient Registration Form */}
          {activeTab === "register" && (
            <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-deep-blue border-b border-border-brand pb-4">
                Register New Patient
              </h3>

              <form onSubmit={handleSubmitPatient} className="space-y-6">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block text-xs font-semibold text-text-primary">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-xs font-semibold text-text-primary">Age (Years)</label>
                    <input
                      type="number"
                      required
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs font-semibold text-text-primary">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs font-semibold text-text-primary">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs font-semibold text-text-primary">Mobile Phone</label>
                    <input
                      type="text"
                      required
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs font-semibold text-text-primary">Email (Optional)</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Maharashtra Administrative Geographic selections */}
                <div className="grid sm:grid-cols-4 gap-6 pt-4 border-t border-dashed border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Division</label>
                    <select
                      value={regDivision}
                      onChange={(e) => setRegDivision(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    >
                      {divisions.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">District</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Taluka</label>
                    <select
                      value={regTaluka}
                      onChange={(e) => setRegTaluka(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    >
                      {talukaOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Village</label>
                    <select
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                    >
                      {villageOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="pt-4 border-t border-dashed border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-deep-blue">Emergency Contact Details</h4>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-text-primary">Contact Name</label>
                      <input
                        type="text"
                        required
                        value={emName}
                        onChange={(e) => setEmName(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-primary">Relation</label>
                      <input
                        type="text"
                        required
                        value={emRelation}
                        onChange={(e) => setEmRelation(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                        placeholder="e.g. Spouse / Mother"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-primary">Emergency Mobile</label>
                      <input
                        type="text"
                        required
                        value={emMobile}
                        onChange={(e) => setEmMobile(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-deep-blue text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {!isOnline ? "Save Patient Offline" : "Register Patient"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Log Vitals & Symptoms */}
          {activeTab === "triage" && (
            <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-deep-blue border-b border-border-brand pb-4">
                Vitals Intake & Symptoms Logging
              </h3>

              {isOnline && (
                <div className="mb-4">
                  <VoiceAssistant onExtractionComplete={handleVoiceExtraction} language="English" />
                </div>
              )}

              <form onSubmit={handleSubmitTriage} className="space-y-6">
                {/* Select patient */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary">Select Patient</label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((pat) => (
                      <option key={pat._id} value={pat._id}>
                        {pat.name} ({pat.patientRefId}) - {pat.village}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vitals inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 102.2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">BP Systolic</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 130"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">BP Diastolic</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 85"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 97"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary">Resp Rate</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white"
                      placeholder="e.g. 18"
                    />
                  </div>
                </div>

                {/* Symptoms selector */}
                <div className="pt-4 border-t border-dashed border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-deep-blue">Reported Symptoms</h4>

                  {/* Logged symptoms items */}
                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((sym, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs py-1 px-2.5 rounded-lg"
                        >
                          <span className="font-semibold">{sym.name}</span>
                          <span className="text-[10px] text-slate-400">({sym.durationDays}d, {sym.severity})</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(index)}
                            className="text-slate-400 hover:text-red-500 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add symptom inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500">Symptom Name</label>
                      <input
                        type="text"
                        value={newSymptomName}
                        onChange={(e) => setNewSymptomName(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                        placeholder="e.g. Fever, Cough, Dizziness"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Duration (Days)</label>
                      <input
                        type="number"
                        value={newSymptomDuration}
                        onChange={(e) => setNewSymptomDuration(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Severity</label>
                      <div className="flex gap-2 items-center">
                        <select
                          value={newSymptomSeverity}
                          onChange={(e) => setNewSymptomSeverity(e.target.value as any)}
                          className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                        >
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
                        <button
                          type="button"
                          onClick={addSymptom}
                          className="bg-primary hover:bg-deep-blue text-white font-bold text-xs p-2 rounded-lg mt-1 shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-deep-blue text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {!isOnline ? "Save Triage Offline" : "Run AI Triage & Log"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-brand flex md:hidden items-center justify-around z-40 text-text-secondary shadow-lg">
        <button onClick={() => setActiveTab("overview")} className={`flex flex-col items-center ${activeTab === "overview" ? "text-primary" : ""}`}>
          <Home size={18} />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </button>
        <button onClick={() => setActiveTab("list")} className={`flex flex-col items-center ${activeTab === "list" ? "text-primary" : ""}`}>
          <User size={18} />
          <span className="text-[9px] font-bold mt-1">Patients</span>
        </button>
        <button onClick={() => setActiveTab("triage")} className={`flex flex-col items-center ${activeTab === "triage" ? "text-primary" : ""}`}>
          <Activity size={18} />
          <span className="text-[9px] font-bold mt-1">Tasks</span>
        </button>
        <button onClick={() => alert("Consultation queues loaded.")} className="flex flex-col items-center">
          <Video size={18} />
          <span className="text-[9px] font-bold mt-1">Consult</span>
        </button>
        <button onClick={() => alert("Settings modules loaded.")} className="flex flex-col items-center">
          <Menu size={18} />
          <span className="text-[9px] font-bold mt-1">More</span>
        </button>
      </div>
    </div>
  );
}
