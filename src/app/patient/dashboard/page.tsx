"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18nContext";
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Video,
  LogOut,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle,
  TrendingUp,
  User,
  ArrowRight,
  ClipboardList,
  Shield,
  Smartphone,
  ChevronRight,
  Briefcase,
  Layers,
  RotateCcw,
  Check,
  Map,
  Eye,
  AlertTriangle,
  Download,
  PlusCircle,
  MessageSquare,
  BadgeInfo
} from "lucide-react";
import AIAgentChatbot from "@/components/AIAgentChatbot";

export default function PatientDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ABHA linking state
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [abhaNumberInput, setAbhaNumberInput] = useState("");
  const [abhaLinked, setAbhaLinked] = useState(false);
  const [abhaNumber, setAbhaNumber] = useState("");
  const [linkingLoading, setLinkingLoading] = useState(false);
  
  // Interactive UI workflows
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>("PHC-01");
  const [orderTrackingId, setOrderTrackingId] = useState<string | null>("JC-MED-0001");
  const [orderStatus, setOrderStatus] = useState<"Requested" | "Preparing" | "Ready" | "Collected">("Preparing");
  
  const [showAvailabilityCheck, setShowAvailabilityCheck] = useState(false);
  const [mapMode, setMapMode] = useState<"Map" | "List">("Map");

  useEffect(() => {
    fetchPatientData();
    // Load persisted order state from local storage if available
    const savedOrderId = localStorage.getItem("jc_active_order_id");
    const savedOrderStatus = localStorage.getItem("jc_active_order_status");
    const savedOrderFacility = localStorage.getItem("jc_active_order_facility");
    if (savedOrderId) setOrderTrackingId(savedOrderId);
    if (savedOrderStatus) setOrderStatus(savedOrderStatus as any);
    if (savedOrderFacility) setSelectedFacility(savedOrderFacility);
  }, []);

  async function fetchPatientData() {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.success) {
        router.push("/login");
        return;
      }
      setUser(meData.user);

      // Fetch consultations
      const consRes = await fetch(`/api/consultations?patientId=${meData.user.patientId || ""}`);
      const consData = await consRes.json();
      if (consData.success) {
        setConsultations(consData.consultations);
      }

      // Fetch prescriptions
      const presRes = await fetch(`/api/prescriptions?patientId=${meData.user.patientId || ""}`);
      const presData = await presRes.json();
      if (presData.success) {
        setPrescriptions(presData.prescriptions);
      }

      // Mock ABHA linkage check
      if (meData.user.patientRefId) {
        setAbhaLinked(true);
        setAbhaNumber("91-4820-5839-2943");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load patient records");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleLinkAbha(e: React.FormEvent) {
    e.preventDefault();
    if (!abhaNumberInput) return;
    setLinkingLoading(true);

    try {
      const cleanNumber = abhaNumberInput.replace(/[\s-]/g, "");
      if (cleanNumber.length !== 14) {
        throw new Error("Invalid ABHA ID. Must be a 14-digit number.");
      }
      setAbhaLinked(true);
      setAbhaNumber(abhaNumberInput);
      setShowAbhaModal(false);
    } catch (err: any) {
      alert(err.message || "Linking failed");
    } finally {
      setLinkingLoading(false);
    }
  }

  // Handle simulated medicine reservation
  function handleReserveMedicine(facilityName: string) {
    const randomId = `JC-MED-${Math.floor(1000 + Math.random() * 9000)}`;
    setSelectedFacility(facilityName);
    setOrderStatus("Requested");
    setOrderTrackingId(randomId);
    
    // Save to local storage
    localStorage.setItem("jc_active_order_id", randomId);
    localStorage.setItem("jc_active_order_status", "Requested");
    localStorage.setItem("jc_active_order_facility", facilityName);
    
    alert(`Medicines successfully reserved at ${facilityName}! Tracking ID: ${randomId} generated.`);
    setShowAvailabilityCheck(false);
  }

  // Trigger simulated progression of order status for the hackathon presentation
  function advanceOrderStatus() {
    let nextStatus: typeof orderStatus = "Requested";
    if (orderStatus === "Requested") nextStatus = "Preparing";
    else if (orderStatus === "Preparing") nextStatus = "Ready";
    else if (orderStatus === "Ready") nextStatus = "Collected";
    else return;

    setOrderStatus(nextStatus);
    localStorage.setItem("jc_active_order_status", nextStatus);
    alert(`Hackathon Simulation: Order status updated to "${nextStatus}"`);
  }

  // Real PDF-friendly print compilers
  function handleDownloadPrescription(pres: any) {
    const doctorName = pres.doctorId?.name || "Dr. Aniruddha Kulkarni";
    const dateStr = new Date(pres.createdAt).toLocaleDateString();
    const patientName = user?.name || "Ramesh Kumar";
    const patientId = user?.patientRefId || "JC-R-0283";
    const age = user?.age || 54;
    const gender = user?.gender || "Male";
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let html = `
      <html>
        <head>
          <title>Prescription_${patientId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1464D2; }
            .details { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .footer { margin-top: 50px; text-align: right; font-size: 13px; }
            .sig { margin-top: 30px; font-style: italic; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">जनCare Health Hub</div>
              <div style="font-size:12px;color:#64748b;">Sinnar Central PHC, Maharashtra</div>
            </div>
            <div style="text-align:right; font-size:12px; color:#64748b;">
              <strong>Prescription Form</strong><br/>
              Date: ${dateStr}
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br/>
              <strong>Patient ID:</strong> ${patientId}<br/>
              <strong>Age / Gender:</strong> ${age}y / ${gender}
            </div>
            <div style="text-align:right;">
              <strong>Practitioner:</strong> ${doctorName}<br/>
              <strong>Status:</strong> Signed & Synced
            </div>
          </div>
          
          <div class="section-title">Rx (Prescribed Generic Medications)</div>
          <table>
            <thead>
              <tr>
                <th>Generic Name</th>
                <th>Strength</th>
                <th>Form</th>
                <th>Dosage / Instructions</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    pres.medicines.forEach((med: any) => {
      html += `
        <tr>
          <td><strong>${med.name}</strong></td>
          <td>${med.strength}</td>
          <td>${med.form}</td>
          <td>${med.dosage} (${med.instructions})</td>
          <td>${med.durationDays} Days</td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
          
          <div class="section-title">Clinical Advice & Safety Instructions</div>
          <ul style="font-size:13px; line-height: 1.6; padding-left: 20px;">
            <li>Take generic codes MC1/MC2 precisely as instructed under meals rules.</li>
            <li>Drink clean/filtered water (at least 3 liters daily).</li>
            <li>Schedule follow-up appointment with ASHA worker for vitals check in 7 days.</li>
          </ul>
          
          <div class="footer">
            <div class="sig">Digitally signed by</div>
            <div>${doctorName}</div>
            <div style="font-size:11px;color:#64748b;">Verified Telehealth Practitioner</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function handleDownloadTimelineReport() {
    const patientName = user?.name || "Ramesh Kumar";
    const patientId = user?.patientRefId || "JC-R-0283";
    const age = user?.age || 54;
    const gender = user?.gender || "Male";
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let html = `
      <html>
        <head>
          <title>HealthReport_${patientId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1464D2; }
            .details { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .timeline-item { border-left: 2px solid #e2e8f0; padding-left: 20px; position: relative; margin-bottom: 20px; font-size: 13px; }
            .timeline-item::before { content: ''; absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: #1464D2; }
            .date { font-size: 11px; color: #64748b; margin-bottom: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">जनCare Health Center</div>
              <div style="font-size:12px;color:#64748b;">Integrated Care Record</div>
            </div>
            <div style="text-align:right; font-size:12px; color:#64748b;">
              <strong>Patient Care Report</strong><br/>
              Printed: ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br/>
              <strong>Patient Ref ID:</strong> ${patientId}<br/>
              <strong>Age / Gender:</strong> ${age}y / ${gender}
            </div>
            <div style="text-align:right;">
              <strong>Baseline Vitals:</strong> Temp: 98.6°F, BP: 120/80 mmHg, SpO2: 98%<br/>
              <strong>Status:</strong> Active care loop
            </div>
          </div>
          
          <div class="section-title">Care Timeline Log Progressions</div>
          <div style="margin-top: 20px;">
            <div class="timeline-item">
              <div class="date">22 Aug 2026, 09:10 AM</div>
              <strong>Symptoms Reported</strong><br/>
              You reported: Fever, Weakness, Dizziness logged by Sharda Patil ASHA.
            </div>
            <div class="timeline-item">
              <div class="date">22 Aug 2026, 09:25 AM</div>
              <strong>AI-Assisted Triage</strong><br/>
              Risk Level: PRIORITY. Recommended: Doctor Consultation.
            </div>
            <div class="timeline-item">
              <div class="date">22 Aug 2026, 11:30 AM</div>
              <strong>Doctor Consultation</strong><br/>
              Consulted with Dr. Aniruddha Kulkarni via video call.
            </div>
            <div class="timeline-item">
              <div class="date">22 Aug 2026, 11:45 AM</div>
              <strong>Prescription Created</strong><br/>
              Medicines (Paracetamol MC1 & Metformin MC2) issued by clinic physician.
            </div>
            <div class="timeline-item">
              <div class="date">22 Aug 2026, 12:10 PM</div>
              <strong>Medicine Reserved</strong><br/>
              Reserved from local subcenter Central Pharmacy. Tracking ID: ${orderTrackingId || "JC-MED-0001"}.
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  const activeConsultation = consultations.find((c) => c.status === "Scheduled" || c.status === "Active");
  const latestConsult = consultations[0];
  const latestRecord = latestConsult?.healthRecordId;
  const latestVitals = latestRecord?.vitals;

  // Active step mapping for Signature Care Journey Line
  let activeStepIdx = 0; // Symptoms
  if (activeConsultation) {
    activeStepIdx = 4; // Video Consultation
  } else if (latestConsult?.status === "Completed") {
    activeStepIdx = 8; // Complete Care
  }

  const journeySteps = [
    t("journey.symptoms"),
    t("journey.triage"),
    t("journey.rightCare"),
    t("journey.doctor"),
    t("journey.video"),
    t("journey.medicine"),
    t("journey.referral"),
    t("journey.followUp"),
    t("journey.completeCare")
  ];

  // Local fallback prescriptions if none seeded yet
  const displayPrescriptions = prescriptions.length > 0 ? prescriptions : [
    {
      _id: "demo-pres",
      createdAt: new Date(),
      medicines: [
        { name: "Paracetamol 500 mg", strength: "500mg", form: "Tablet", dosage: "1 tablet x 2 daily", durationDays: 5, instructions: "After Food" },
        { name: "Metformin 500 mg", strength: "500mg", form: "Tablet", dosage: "1 tablet x 1 daily", durationDays: 30, instructions: "Before Food" }
      ],
      doctorId: { name: "Dr. Aniruddha Kulkarni", role: "Doctor" }
    }
  ];

  const nearbyFacilities = [
    { name: "PHC-01 (Primary Health Centre)", distance: "2.1 km", MC1: "Available", MC2: "Low Stock", updated: "10:42 AM", coordinates: "19.8517,74.0006" },
    { name: "PHC-02 (Sub Centre)", distance: "4.2 km", MC1: "Available", MC2: "Out of Stock", updated: "11:00 AM", coordinates: "19.8654,74.0123" },
    { name: "MED-01 (Medical Store)", distance: "6.8 km", MC1: "Available", MC2: "Available", updated: "09:30 AM", coordinates: "19.8402,73.9904" },
    { name: "PHC-03 (Community Health Hub)", distance: "12.1 km", MC1: "Available", MC2: "Available", updated: "08:15 AM", coordinates: "19.8821,74.0345" }
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans pb-16 md:pb-0 select-none">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-border-brand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="जनCare Logo" className="h-9 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">{t("dashboards.patient")}</span>
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
              ID: {user?.patientRefId || "JC-7F3K92"}
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-transparent border-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Split Grid (8:4 layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Main dashboard widgets */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header */}
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-deep-blue">
              {language === "mr" ? `शुभ सकाळ, ${user?.name || "रमेश कुमार"} 👋` : language === "hi" ? `शुभ प्रभात, ${user?.name || "रमेश कुमार"} 👋` : `Good morning, ${user?.name || "Ramesh Kumar"} 👋`}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {language === "mr" ? "तुमची आजची आरोग्य माहिती खालीलप्रमाणे आहे." : language === "hi" ? "आपकी आज की स्वास्थ्य जानकारी निम्नलिखित है।" : "Here's your health overview."}
            </p>
          </div>

          {/* Top Row Grid: 4 Action Widgets matching reference image */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Widget 1: Next Appointment */}
            <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-primary bg-soft-blue px-2.5 py-0.5 rounded-full w-fit">
                  <Calendar size={10} /> {language === "mr" ? "पुढील अपॉइंटमेंट" : language === "hi" ? "अगली अपॉइंटमेंट" : "Next Appointment"}
                </span>
                <h3 className="text-xs font-extrabold text-text-primary mt-2">
                  {language === "mr" ? "आज, ११:३० AM" : language === "hi" ? "आज, ११:३० AM" : "Today, 11:30 AM"}
                </h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">{language === "mr" ? "डॉ. कुलकर्णी (सामान्य चिकित्सक)" : language === "hi" ? "डॉ. कुलकर्णी (सामान्य चिकित्सक)" : "Dr. Kulkarni (General Physician)"}</span>
              </div>
              {activeConsultation ? (
                <button
                  onClick={() => router.push(`/doctor/consultation/${activeConsultation._id}`)}
                  className="bg-primary hover:bg-deep-blue text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors border-0"
                >
                  {language === "mr" ? "सल्लामसलत जॉइन करा" : language === "hi" ? "परामर्श में शामिल हों" : "Join Consultation"}
                </button>
              ) : (
                <button
                  onClick={() => setActiveAction("Book Doctor")}
                  className="bg-primary hover:bg-deep-blue text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors border-0"
                >
                  {language === "mr" ? "नवीन वेळ बुक करा" : language === "hi" ? "स्लॉट बुक करें" : "Book Slot"}
                </button>
              )}
            </div>

            {/* Widget 2: Medicines */}
            <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-teal-brand bg-soft-teal px-2.5 py-0.5 rounded-full w-fit">
                  <Briefcase size={10} /> {language === "mr" ? "औषधे" : language === "hi" ? "दवाइयाँ" : "Medicines"}
                </span>
                <h3 className="text-xs font-extrabold text-text-primary mt-2">
                  {language === "mr" ? "२ लिहून दिलेली औषधे" : language === "hi" ? "२ निर्धारित दवाइयाँ" : "2 Prescribed"}
                </h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">{language === "mr" ? "३ जवळ उपलब्ध" : language === "hi" ? "३ पास में उपलब्ध" : "3 Nearby Available"}</span>
              </div>
              <button
                onClick={() => setShowAvailabilityCheck(true)}
                className="bg-green-brand hover:bg-green-800 text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors border-0"
              >
                {language === "mr" ? "स्टॉक तपासा" : language === "hi" ? "उपलब्धता जांचें" : "Check Availability"}
              </button>
            </div>

            {/* Widget 3: Active Orders */}
            <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Clock size={10} /> {language === "mr" ? "माझे ऑर्डर" : language === "hi" ? "मेरी ऑर्डर" : "Orders"}
                </span>
                <h3 className="text-xs font-extrabold text-text-primary mt-2">
                  {orderTrackingId || "JC-MED-0001"}
                </h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">{language === "mr" ? "स्थिती:" : language === "hi" ? "स्थिति:" : "Status:"} <strong className="text-purple-700">{orderStatus}</strong></span>
              </div>
              <button
                onClick={advanceOrderStatus}
                className="bg-purple-700 hover:bg-purple-900 text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors border-0"
                title="Hackathon: Click to simulated advance status"
              >
                {language === "mr" ? "ऑर्डर ट्रॅक करा" : language === "hi" ? "ऑर्डर ट्रैक करें" : "Track Order"}
              </button>
            </div>

            {/* Widget 4: Follow-up */}
            <div className="bg-white border border-border-brand p-4.5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit">
                  <RotateCcw size={10} /> {language === "mr" ? "पुढील तपासणी" : language === "hi" ? "फॉलो-अप जाँच" : "Follow-up"}
                </span>
                <h3 className="text-xs font-extrabold text-text-primary mt-2">
                  {language === "mr" ? "पुढील गृहभेट" : language === "hi" ? "अगली फॉलो-अप" : "Next Follow-up"}
                </h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">29 Aug 2026</span>
              </div>
              <button
                onClick={() => setActiveAction("Follow-up")}
                className="bg-orange-500 hover:bg-orange-700 text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors border-0"
              >
                {language === "mr" ? "तपशील पहा" : language === "hi" ? "फॉलो-अप देखें" : "View Follow-up"}
              </button>
            </div>
          </div>

          {/* Stepper Progress bar: Your Care Journey */}
          <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Your Care Journey</h3>
            
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center justify-between min-w-[700px] relative py-2 px-4">
                {[
                  { label: "Symptoms", status: "Completed" },
                  { label: "AI Triage", status: "Completed" },
                  { label: "Doctor", status: "Completed" },
                  { label: "Medicine", status: "In Progress" },
                  { label: "Referral", status: "Upcoming" },
                  { label: "Follow-up", status: "Upcoming" },
                  { label: "Complete Care", status: "Upcoming" }
                ].map((step, idx) => {
                  const isActive = step.status === "In Progress";
                  const isDone = step.status === "Completed";
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center relative z-10">
                        <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold border transition-all ${
                          isDone 
                            ? "bg-green-brand border-green-brand text-white" 
                            : isActive 
                            ? "bg-primary border-primary text-white ring-4 ring-primary/10 animate-pulse" 
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}>
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold mt-2 ${
                          isDone ? "text-green-700" : isActive ? "text-primary" : "text-text-secondary"
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[8px] font-semibold text-text-secondary">{step.status}</span>
                      </div>
                      {idx < 6 && (
                        <span className={`h-0.5 flex-1 mx-2 ${
                          idx < 3 ? "bg-green-brand" : "bg-slate-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lower Grid splits (Prescriptions, Availability, Recent Order, Snapshot) */}
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Prescriptions widget (6 cols) */}
            <div className="md:col-span-6 bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary">Prescriptions</h3>
                <button
                  onClick={() => handleDownloadPrescription(displayPrescriptions[0])}
                  className="text-primary text-[10px] font-bold flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                >
                  <Download size={12} /> Download Report
                </button>
              </div>

              <div className="space-y-3">
                {displayPrescriptions[0].medicines.map((med: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs">
                    <div className="p-2 rounded-lg bg-soft-blue text-primary shrink-0"><FileText size={16} /></div>
                    <div>
                      <strong className="text-text-primary block">{med.name}</strong>
                      <span className="text-[10px] text-text-secondary mt-0.5 block">
                        {med.dosage} — {med.durationDays} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medicine Availability widget (6 cols) */}
            <div className="md:col-span-6 bg-white border border-border-brand p-5 rounded-2xl shadow-xs flex flex-col justify-between h-52">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
                  Medicine Availability
                </h3>
                <p className="text-[10px] text-text-secondary mt-2 font-semibold">2 medicines prescribed</p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-150">
                    <span className="text-xs font-bold block">3</span>
                    <span className="text-[8px] font-semibold block uppercase">Facilities</span>
                  </div>
                  <div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-150">
                    <span className="text-xs font-bold block">1</span>
                    <span className="text-[8px] font-semibold block uppercase">Low Stock</span>
                  </div>
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-150">
                    <span className="text-xs font-bold block">0</span>
                    <span className="text-[8px] font-semibold block uppercase">Not Avail.</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAvailabilityCheck(true)}
                className="w-full bg-green-brand hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer border-0 mt-3"
              >
                Check Availability
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Recent Order widget (6 cols) */}
            <div className="md:col-span-6 bg-white border border-border-brand p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
                  Recent Order
                </h3>
                <div className="mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tracking ID</span>
                    <strong className="text-text-primary">{orderTrackingId || "JC-MED-0001"}</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-text-secondary">Facility</span>
                    <strong className="text-text-primary">{selectedFacility || "PHC-01"}</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-text-secondary">Status</span>
                    <strong className="text-orange-500 font-extrabold">{orderStatus}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveAction("Medicines")}
                className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer border-0"
              >
                Track Order
              </button>
            </div>

            {/* Health Snapshot widget (6 cols) */}
            <div className="md:col-span-6 bg-white border border-border-brand p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
                  Health Snapshot <span className="text-[10px] text-text-secondary lowercase font-medium">(Latest)</span>
                </h3>
                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div>
                    <span className="text-[8px] font-bold text-text-secondary block">Temperature</span>
                    <strong className="text-xs text-text-primary block mt-0.5">{latestVitals?.temperature || 98.6}°F</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-text-secondary block">BP</span>
                    <strong className="text-xs text-text-primary block mt-0.5">{latestVitals?.bloodPressureSystolic || 120}/{latestVitals?.bloodPressureDiastolic || 80}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-text-secondary block">SpO2</span>
                    <strong className="text-xs text-text-primary block mt-0.5">{latestVitals?.spo2 || 98}%</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-text-secondary block">Pulse</span>
                    <strong className="text-xs text-text-primary block mt-0.5">{latestVitals?.heartRate || 78} bpm</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => alert("Simulated comprehensive vitals logs print generated.")}
                className="w-full border border-slate-200 hover:bg-slate-50 text-text-primary font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                View All Vitals
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Health Timeline & Journey Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* My Health Timeline Card */}
          <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-deep-blue">My Health Timeline</h3>
              <button
                onClick={handleDownloadTimelineReport}
                className="border border-slate-200 hover:bg-slate-50 text-text-primary text-[9px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer bg-white"
              >
                <Download size={10} /> Download Report
              </button>
            </div>

            <p className="text-[10px] text-text-secondary leading-normal">
              Track your complete journey towards better health.
            </p>

            {/* Vertical Health Timeline Stepper matching reference */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 mt-4">
              {[
                { label: "Symptoms Reported", desc: "You reported: Fever, Weakness, Dizziness", date: "22 Aug 2026, 09:10 AM", completed: true },
                { label: "AI-Assisted Triage", desc: "Risk Level: PRIORITY. Recommended: Doctor Consultation.", date: "22 Aug 2026, 09:25 AM", completed: true },
                { label: "Doctor Consultation", desc: "Consulted with Dr. Aniruddha Kulkarni via video call.", date: "22 Aug 2026, 11:30 AM", completed: true },
                { label: "Prescription Created", desc: "2 medicines prescribed by clinic physician.", date: "22 Aug 2026, 11:45 AM", completed: true },
                { label: "Medicine Reserved", desc: `Reserved from ${selectedFacility || "PHC-01"}. Tracking ID: ${orderTrackingId || "JC-MED-0001"}`, date: "22 Aug 2026, 12:10 PM", completed: true },
                { label: "Medicine Ready", desc: "Medicines sorted and ready for central counter pickup.", date: "22 Aug 2026, 04:15 PM", completed: orderStatus !== "Requested" },
                { label: "Medicine Collected", desc: `Collected from ${selectedFacility || "PHC-01"}. Package closed.`, date: "22 Aug 2026, 05:00 PM", completed: orderStatus === "Collected" },
                { label: "Follow-up Scheduled", desc: "ASHA Sharda Patil home vitals verification scheduled.", date: "29 Aug 2026, 09:00 AM", completed: false },
                { label: "Complete Care", desc: "Your treatment journey continues...", date: "05 Sep 2026", completed: false }
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  <span className={`absolute -left-[22px] top-1 h-4 w-4 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                    step.completed
                      ? "bg-green-brand border-green-brand text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}>
                    {step.completed ? "✓" : idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-text-secondary font-semibold block">{step.date}</span>
                    <strong className={`font-bold block ${step.completed ? "text-green-800" : "text-text-primary"}`}>
                      {step.label}
                    </strong>
                    <p className="text-[9px] text-text-secondary leading-normal">{step.desc}</p>
                    <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      step.completed ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {step.completed ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey Summary details */}
          <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Journey Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-text-secondary">Total Steps</span>
                <strong className="text-text-primary">9</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-text-secondary">Completed</span>
                <strong className="text-green-700">7</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-text-secondary">In Progress</span>
                <strong className="text-primary">1</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-text-secondary">Upcoming</span>
                <strong className="text-text-secondary">2</strong>
              </div>
            </div>

            {/* Quick Chatbot float trigger */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="text-[10px] text-text-secondary font-bold block mb-2">Need Help?</span>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("jancare_open_chat"));
                }}
                className="bg-slate-50 hover:bg-soft-blue border border-slate-200 text-primary text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 w-full cursor-pointer transition-colors"
              >
                <MessageSquare size={14} /> {language === "mr" ? "सहाय्यकांशी बोला" : language === "hi" ? "सहायक से बात करें" : "Talk to Assistant"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ABHA linking modal */}
      {showAbhaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-border-brand">
            <div>
              <h3 className="font-bold text-base text-text-primary">Link ABHA ID</h3>
              <p className="text-xs text-text-secondary mt-1">Enter your 14-digit national health ID</p>
            </div>
            <form onSubmit={handleLinkAbha} className="space-y-4">
              <input
                type="text"
                required
                value={abhaNumberInput}
                onChange={(e) => setAbhaNumberInput(e.target.value)}
                placeholder="12-3456-7890-1234"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all text-text-primary"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAbhaModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer bg-white text-text-primary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingLoading}
                  className="bg-primary hover:bg-deep-blue text-white font-bold px-4 py-2 rounded-lg cursor-pointer border-0"
                >
                  Link ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS MODALS */}
      {activeAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border border-border-brand animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-deep-blue">{activeAction} Portal</h3>
              <button
                onClick={() => setActiveAction(null)}
                className="text-text-secondary hover:text-text-primary font-bold text-xs cursor-pointer border-0 bg-transparent"
              >
                ✕ Close
              </button>
            </div>

            {activeAction === "Book Doctor" && (
              <div className="space-y-4 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  Request an appointment queue position at your nearest health center:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] text-primary font-bold block">Sinnar CHC Health Hub</span>
                  <div className="flex justify-between items-center text-text-primary">
                    <span>Dr. Aniruddha Kulkarni</span>
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">2 Slots Avail.</span>
                  </div>
                  <div className="flex gap-2 pt-1.5">
                    <button onClick={() => alert("Slot 11:30 AM selected")} className="bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-bold cursor-pointer text-text-primary text-[10px]">11:30 AM</button>
                    <button onClick={() => alert("Slot 02:00 PM selected")} className="bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-bold cursor-pointer text-text-primary text-[10px]">02:00 PM</button>
                  </div>
                </div>
              </div>
            )}

            {activeAction === "My Records" && (
              <div className="space-y-3 text-xs">
                <p className="text-text-secondary">Your ABDM gateway synchronized medical documents:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div>
                      <strong className="text-text-primary block">Vitals Record - Sharda Patil</strong>
                      <span className="text-[10px] text-text-secondary">Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => alert("Downloading document...")} className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent">Download</button>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div>
                      <strong className="text-text-primary block">Diagnostic CBC - Sinnar Labs</strong>
                      <span className="text-[10px] text-text-secondary">Date: 12 Jul 2026</span>
                    </div>
                    <button onClick={() => alert("Downloading document...")} className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent">Download</button>
                  </div>
                </div>
              </div>
            )}

            {activeAction === "Medicines" && (
              <div className="space-y-3 text-xs">
                <p className="text-text-secondary">Active Generic Drug Prescriptions Reserved:</p>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <strong className="text-text-primary">MC1 (Generic)</strong>
                    <span className="text-green-600 font-bold">Reserved</span>
                  </div>
                  <p className="text-[10px] text-text-secondary">Dosage: 1 tablet after meals, twice daily. Duration: 5 days.</p>
                  <p className="text-[10px] text-text-secondary">Location: Sinnar CHC Central Pharmacy Counter.</p>
                </div>
              </div>
            )}

            {activeAction === "Referrals" && (
              <div className="space-y-3 text-xs">
                <p className="text-text-secondary">Outgoing Referrals status tracking:</p>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Awaiting Admission</span>
                    <span className="text-text-secondary text-[10px]">Logged: Today</span>
                  </div>
                  <div className="text-text-primary">
                    From: <strong className="text-deep-blue">Sinnar CHC Hub</strong><br />
                    To: <strong className="text-deep-blue">Nashik Civil Hospital</strong>
                  </div>
                  <div className="border-t border-slate-200 pt-2 text-[10px] text-text-secondary">
                    Reason: Specialist cardiovascular consultation. ABHA health locker link verified.
                  </div>
                </div>
              </div>
            )}

            {activeAction === "Follow-up" && (
              <div className="space-y-3 text-xs">
                <p className="text-text-secondary">ASHA Follow-up Checklist:</p>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between text-text-primary">
                    <span>ASHA Worker</span>
                    <strong>Sharda Patil</strong>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2 text-[10px] space-y-1">
                    <span className="font-bold block text-text-primary">Follow-up Tasks Checklist:</span>
                    <div>• Verify temperature (Normal range)</div>
                    <div>• Confirm blood pressure compliance</div>
                    <div>• Provide dosage guidance on Metformin MC2</div>
                  </div>
                  <button
                    onClick={() => { alert("Checked checklist item as complete!"); setActiveAction(null); }}
                    className="w-full bg-primary hover:bg-deep-blue text-white font-bold py-2 rounded-xl text-[10px] cursor-pointer mt-2 border-0"
                  >
                    Mark Tasks Completed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEDICINE AVAILABILITY MODAL & CHECK */}
      {showAvailabilityCheck && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 border border-border-brand">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-deep-blue">Medicine Availability</h3>
              <button
                onClick={() => setShowAvailabilityCheck(false)}
                className="text-text-secondary hover:text-text-primary font-bold text-xs cursor-pointer border-0 bg-transparent"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Map vs List View Toggle buttons */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden w-fit text-xs font-bold bg-slate-50 mb-3">
              <button
                onClick={() => setMapMode("Map")}
                className={`px-4 py-2 cursor-pointer transition-all border-0 ${mapMode === "Map" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Map View
              </button>
              <button
                onClick={() => setMapMode("List")}
                className={`px-4 py-2 cursor-pointer transition-all border-0 ${mapMode === "List" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500 hover:text-slate-700"}`}
              >
                List View
              </button>
            </div>

            {mapMode === "Map" ? (
              <div className="space-y-4">
                {/* Embed Real OpenStreetMap Iframe centered on Sinnar */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl h-64 overflow-hidden relative">
                  <iframe
                    className="w-full h-full rounded-2xl border-0"
                    src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                      ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Sinnar,Maharashtra`
                      : "https://www.openstreetmap.org/export/embed.html?bbox=73.95%2C19.80%2C74.05%2C19.90&layer=mapnik&marker=19.8517%2C74.0006"
                    }
                    title="OSM Sinnar Maps"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md">
                    Sinnar Central Pharmacy map (Real-time updates)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {nearbyFacilities.slice(0, 2).map((fac, idx) => (
                    <div key={idx} className="border border-slate-200/80 p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                      <div>
                        <strong className="text-text-primary block text-[11px]">{fac.name}</strong>
                        <span className="text-[10px] text-text-secondary block mt-0.5">Distance: {fac.distance}</span>
                      </div>
                      <button
                        onClick={() => handleReserveMedicine(fac.name)}
                        className="bg-primary hover:bg-deep-blue text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer border-0"
                      >
                        Reserve Medicines
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {nearbyFacilities.map((fac, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-slate-100 p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <strong className="text-xs text-text-primary block">{fac.name}</strong>
                      <span className="text-[10px] text-text-secondary mt-0.5 block">
                        Distance: {fac.distance} | Last Updated: {fac.updated}
                      </span>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">MC1: {fac.MC1}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                          fac.MC2 === "Available" ? "bg-green-50 text-green-700" : fac.MC2 === "Low Stock" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          MC2: {fac.MC2}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReserveMedicine(fac.name)}
                      className="bg-primary hover:bg-deep-blue text-white text-[10px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors border-0"
                    >
                      Reserve Medicines
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Interactive AI voice chatbot */}
      <AIAgentChatbot />
    </div>
  );
}
