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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Connectivity state (Simulated & Browser linked)
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"Online" | "Offline" | "Syncing" | "Synced">("Online");
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Dashboard");

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

  const filteredPatients = patients.filter(
    (pat) =>
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.patientRefId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.mobile.includes(searchQuery)
  );

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
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Village Health Outreach: {currentUser?.name}</h2>
              <p className="text-xs text-slate-300">Register new patients, record baseline triage vitals, and synchronize records.</p>
            </div>
            
            <button
              onClick={toggleConnectivity}
              className={`font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer transition-all border-0 ${
                isOnline 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-150" 
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-150"
              }`}
            >
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              {isOnline ? "Go Offline" : "Go Online & Sync"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Sync Queue Count</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1">{offlineCount} Pending</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Patients Registered</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1">{patients.length} Registered</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Outreach Region</span>
              <span className="text-xs font-bold text-slate-700 mt-1 truncate">Nashik / Sinnar</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-24">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Connection Status</span>
              <span className="text-xs font-bold text-slate-850 mt-1 flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-amber-500"}`} />
                {syncStatus}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
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

      {/* 2. PATIENTS REGISTRY VIEW */}
      {activeTab === "My Patients" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Outreach Patient Registry</h2>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-hidden pl-2 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Patient Ref ID</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Age/Sex</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4">Village</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => (
                  <tr key={pat._id || pat.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-500">{pat.patientRefId || "OFFLINE"}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{pat.name}</td>
                    <td className="py-3 px-4 text-slate-500">{pat.age}y / {pat.gender}</td>
                    <td className="py-3 px-4 text-slate-500">{pat.mobile}</td>
                    <td className="py-3 px-4 text-slate-500">{pat.village}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedPatientId(pat._id || pat.id);
                          setActiveTab("Vitals & Symptoms");
                        }}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg cursor-pointer border-0 text-[10px]"
                      >
                        Record Vitals
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <select value={regDivision} onChange={(e) => setRegDivision(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
                    {divisions.map((div) => <option key={div as unknown as string} value={div as unknown as string}>{div as unknown as string}</option>)}
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

      {/* 5. OTHER TABVIEWS */}
      {activeTab !== "Dashboard" && activeTab !== "My Patients" && activeTab !== "Register Patient" && activeTab !== "Vitals & Symptoms" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[400px]">
          <h2 className="text-lg font-extrabold text-slate-800">{activeTab} Workspace</h2>
          <p className="text-xs text-slate-500">Panel for ASHA {activeTab} information logs.</p>
          
          <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-2">
            <Activity size={32} className="text-slate-300 animate-pulse" />
            <span>Currently showing {activeTab} details.</span>
            <button
              onClick={() => setActiveTab("Dashboard")}
              className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent mt-2 text-xs"
            >
              Back to Overview Dashboard
            </button>
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
