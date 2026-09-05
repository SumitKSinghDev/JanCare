"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  BadgeInfo,
  ChevronLeft,
  X,
  Search,
  Package,
  FileSpreadsheet,
  AlertOctagon,
  PhoneCall,
  Share2,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import AIAgentChatbot from "@/components/AIAgentChatbot";
import AppShell from "@/components/AppShell";

export default function PatientDashboard() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Clinical document upload states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("LabReport");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ABHA linking state
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [abhaNumberInput, setAbhaNumberInput] = useState("");
  const [abhaLinked, setAbhaLinked] = useState(false);
  const [abhaNumber, setAbhaNumber] = useState("");
  const [linkingLoading, setLinkingLoading] = useState(false);
  
  // App Shell active state navigation tab
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Interactive UI workflows
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>("PHC-01");
  const [orderTrackingId, setOrderTrackingId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<"Requested" | "Preparing" | "Ready" | "Collected" | null>(null);
  
  // Manual Appointment Booking Form State
  const [bookingSymptoms, setBookingSymptoms] = useState("");
  const [bookingSeverity, setBookingSeverity] = useState<"Mild" | "Moderate" | "Severe">("Moderate");
  const [bookingDuration, setBookingDuration] = useState(1);
  const [bookingFacility, setBookingFacility] = useState("Sinnar Rural CHC");
  const [bookingDoctor, setBookingDoctor] = useState("Dr. Aniruddha Kulkarni");
  const [bookingSlotTime, setBookingSlotTime] = useState("11:30 AM");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [dashboardAmbulanceTriggered, setDashboardAmbulanceTriggered] = useState(false);
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  const [activeInstantRoom, setActiveInstantRoom] = useState<string | null>(null);
  const [instantCalling, setInstantCalling] = useState(false);

  // PM-JAY / ABHA Cashless Surgery Wallet States
  const [pmjayWallet, setPmjayWallet] = useState<any>({
    isEligible: true,
    schemeName: "Ayushman Bharat PM-JAY / MJPJAY",
    totalAnnualCoverage: 500000,
    usedAmount: 175000,
    availableBalance: 325000,
    claimsHistory: [
      {
        claimId: "PMJAY-CLM-8841",
        hospitalName: "Sahyadri Super-Specialty Hospital (Private Empanelled)",
        hospitalType: "Private (Empanelled)",
        procedureName: "Cervical Spine Decompression & Nerve Release",
        packageCode: "NEURO-SP-04",
        amountDeducted: 175000,
        approvalStatus: "Approved & Settled Cashless",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      }
    ]
  });
  const [preAuthLoading, setPreAuthLoading] = useState(false);
  const [preAuthSuccessMsg, setPreAuthSuccessMsg] = useState("");
  const [preAuthErrorMsg, setPreAuthErrorMsg] = useState("");
  const [selectedSurgeryDemo, setSelectedSurgeryDemo] = useState("Cervical Spine Decompression & Nerve Release");
  const [selectedHospitalDemo, setSelectedHospitalDemo] = useState("Sahyadri Super-Specialty Hospital (Private Empanelled)");
  const [selectedHospitalType, setSelectedHospitalType] = useState<"Public (Government)" | "Private (Empanelled)">("Private (Empanelled)");
  const [customSurgeryCost, setCustomSurgeryCost] = useState(175000);

  async function handleSimulatePreAuth(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      setPreAuthLoading(true);
      setPreAuthErrorMsg("");
      setPreAuthSuccessMsg("");

      const res = await fetch("/api/pmjay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientRefId: user?.patientRefId || "JC-7F3K92",
          hospitalName: selectedHospitalDemo,
          hospitalType: selectedHospitalType,
          procedureName: selectedSurgeryDemo,
          packageCode: selectedSurgeryDemo.includes("Spine") ? "NEURO-SP-04" : selectedSurgeryDemo.includes("Bypass") ? "CARD-CABG-01" : selectedSurgeryDemo.includes("Knee") ? "ORTHO-TKR-02" : "SURG-GEN-08",
          amount: customSurgeryCost
        })
      });

      const data = await res.json();
      if (data.success && data.wallet) {
        setPmjayWallet(data.wallet);
        setPreAuthSuccessMsg(`✅ Pre-Authorization Approved! ₹${customSurgeryCost.toLocaleString('en-IN')} deducted cashless from your PM-JAY Card for ${selectedHospitalDemo}. Remaining Card Balance: ₹${data.wallet.availableBalance.toLocaleString('en-IN')}`);
      } else {
        setPreAuthErrorMsg(data.error || "Failed to pre-authorize cashless surgery package.");
      }
    } catch (err: any) {
      setPreAuthErrorMsg(err.message || "Network error during pre-authorization.");
    } finally {
      setPreAuthLoading(false);
    }
  }

  async function handleStartInstantEmergencyCall() {
    try {
      setInstantCalling(true);
      const roomName = `jancare-emergency-${(user?.patientRefId || "JC-PATIENT").toLowerCase()}-${Date.now().toString().slice(-4)}`;
      setActiveInstantRoom(roomName);

      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEmergencyInstant: true,
          videoRoomName: roomName,
          symptoms: "🚨 Emergency Instant Teleconsultation Call requested by patient",
        }),
      });
      const data = await res.json();
      if (data.success && data.consultation) {
        setConsultations((prev) => [data.consultation, ...prev]);
      }
      setActiveTab("Video Consultation");
    } catch (e) {
      console.error("Emergency call dispatch error:", e);
      setActiveInstantRoom(`jancare-emergency-${(user?.patientRefId || "JC-PATIENT").toLowerCase()}-live`);
      setActiveTab("Video Consultation");
    } finally {
      setInstantCalling(false);
    }
  }

  // Detect if patient has an active urgent emergency from clinical records or live trigger
  const hasUrgentCondition = !emergencyDismissed && (
    dashboardAmbulanceTriggered ||
    appointments.some((a: any) => a.triagePriority === "Urgent") ||
    referrals.some((r: any) => r.priority === "Urgent")
  );

  const [showAvailabilityCheck, setShowAvailabilityCheck] = useState(false);
  const [mapMode, setMapMode] = useState<"Map" | "List">("Map");

  // Filters
  const [prescriptionFilter, setPrescriptionFilter] = useState<"All" | "Active" | "Completed">("All");
  const [orderFilter, setOrderFilter] = useState<"All" | "Requested" | "Preparing" | "Ready" | "Collected">("All");

  const [selectedMedicineCheck, setSelectedMedicineCheck] = useState<string>("");
  const [realStockAvailability, setRealStockAvailability] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  async function checkMedicineAvailability(medName: string) {
    setSelectedMedicineCheck(medName);
    setStockLoading(true);
    try {
      const facRes = await fetch("/api/facilities");
      const facData = await facRes.json();
      if (facData.success) {
        const activeFacilities = facData.facilities;
        const availabilityList = [];
        for (const fac of activeFacilities) {
          const medRes = await fetch(`/api/medicines?facilityId=${fac._id}&search=${encodeURIComponent(medName)}`);
          const medData = await medRes.json();
          if (medData.success && medData.medicines.length > 0) {
            const matchedMed = medData.medicines[0];
            availabilityList.push({
              name: fac.name,
              medicineId: matchedMed._id,
              distance: fac.type === "CHC" ? "2.1 km" : fac.type === "PHC" ? "4.5 km" : "6.8 km",
              qty: matchedMed.quantity,
              MC1: matchedMed.quantity > 0 ? "Available" : "Out of Stock",
              MC2: matchedMed.status || (matchedMed.quantity === 0 ? "Out of Stock" : matchedMed.quantity < matchedMed.minimumRequired ? "Low Stock" : "Available"),
              updated: new Date(matchedMed.lastUpdated || fac.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              coordinates: fac.coordinates || "19.8517,74.0006",
            });
          }
        }
        setRealStockAvailability(availabilityList);
      }
    } catch (e) {
      console.error("Failed to check stock:", e);
    } finally {
      setStockLoading(false);
    }
  }

  useEffect(() => {
    fetchPatientData();

    // Check for tab query param in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }

    const handleRefresh = () => {
      fetchPatientData();
    };

    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    const handleUrgentEmergency = () => {
      setEmergencyDismissed(false);
      fetchPatientData();
    };

    window.addEventListener("jancare_appointment_booked", handleRefresh);
    window.addEventListener("jancare_switch_tab", handleSwitchTab);
    window.addEventListener("jancare_urgent_emergency", handleUrgentEmergency);
    return () => {
      window.removeEventListener("jancare_appointment_booked", handleRefresh);
      window.removeEventListener("jancare_switch_tab", handleSwitchTab);
      window.removeEventListener("jancare_urgent_emergency", handleUrgentEmergency);
    };
  }, []);

  async function fetchPatientData() {
    try {
      setLoading(true);
      let meData: any = null;
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) meData = await meRes.json();
      } catch (e) {}

      if (!meData || !meData.success) {
        if (typeof window !== "undefined" && !navigator.onLine) {
          setUser({
            name: "Ramesh Kumar",
            role: "Patient",
            patientRefId: "JC-7F3K92",
            village: "Sinnar",
            phone: "9822114400",
            bloodGroup: "O+",
            age: 54,
            gender: "Male",
            isOfflineDemo: true
          });
          setAbhaLinked(true);
          setAbhaNumber("91-4820-5839-2943");
          return;
        } else {
          router.push("/login");
          return;
        }
      }
      setUser(meData.user);

      // Load patient-specific persisted order states
      if (meData.user.patientId) {
        const pId = meData.user.patientId;
        const savedOrderId = localStorage.getItem(`jc_active_order_id_${pId}`);
        const savedOrderStatus = localStorage.getItem(`jc_active_order_status_${pId}`);
        const savedOrderFacility = localStorage.getItem(`jc_active_order_facility_${pId}`);
        
        if (savedOrderId) setOrderTrackingId(savedOrderId);
        else setOrderTrackingId(null);
        
        if (savedOrderStatus) setOrderStatus(savedOrderStatus as any);
        else setOrderStatus(null);
        
        if (savedOrderFacility) setSelectedFacility(savedOrderFacility);
        else setSelectedFacility("PHC-01");
      }

      // Fetch consultations
      const consRes = await fetch(`/api/consultations?patientId=${meData.user.patientId || ""}`);
      const consData = await consRes.json();
      if (consData.success) {
        setConsultations(consData.consultations);
      }

      // Fetch appointments
      const apptsRes = await fetch(`/api/appointments?patientId=${meData.user.patientId || ""}&status=Scheduled`);
      const apptsData = await apptsRes.json();
      if (apptsData.success) {
        setAppointments(apptsData.appointments);
      }

      // Fetch prescriptions
      const presRes = await fetch(`/api/prescriptions?patientId=${meData.user.patientId || ""}`);
      const presData = await presRes.json();
      if (presData.success) {
        setPrescriptions(presData.prescriptions);
      }

      // Fetch followups
      const followRes = await fetch(`/api/followups?patientId=${meData.user.patientId || ""}`);
      const followData = await followRes.json();
      if (followData.success) {
        setFollowups(followData.followups);
      }

      // Fetch referrals
      const refRes = await fetch(`/api/referrals?patientId=${meData.user.patientId || ""}`);
      const refData = await refRes.json();
      if (refData.success) {
        setReferrals(refData.referrals);
      }

      // Fetch consents
      const consentRes = await fetch("/api/consent");
      const consentData = await consentRes.json();
      if (consentData.success) {
        setConsents(consentData.consents);
      }

      // Fetch clinical documents
      const docRes = await fetch("/api/documents");
      const docData = await docRes.json();
      if (docData.success) {
        setDocuments(docData.documents);
      }

      // Fetch PM-JAY Cashless Surgery Wallet
      try {
        const pmjayRes = await fetch(`/api/pmjay?patientRefId=${meData.user.patientRefId || ""}`);
        const pmjayData = await pmjayRes.json();
        if (pmjayData.success && pmjayData.wallet) {
          setPmjayWallet(pmjayData.wallet);
        }
      } catch (e) {
        console.warn("PM-JAY fetch failed:", e);
      }

      // Mock ABHA linkage check
      if (meData.user.patientRefId) {
        setAbhaLinked(true);
        setAbhaNumber("91-4820-5839-2943");
      }
    } catch (err: any) {
      console.warn("Network offline or fetch error in patient dashboard:", err);
      // If offline, populate default offline mock patient profile so dashboard stays 100% interactive
      setUser((prev: any) => prev || {
        name: "Ramesh Kumar",
        role: "Patient",
        patientRefId: "JC-7F3K92",
        village: "Sinnar",
        phone: "9822114400",
        bloodGroup: "O+",
        age: 54,
        gender: "Male",
        isOfflineDemo: true
      });
      setAbhaLinked(true);
      setAbhaNumber("91-4820-5839-2943");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    window.location.href = "/login";
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

  // Handle real slot booking and appointment scheduling with clinical symptom triage
  async function handleBookAppointment(options?: {
    slotTime?: string;
    symptoms?: string;
    severity?: "Mild" | "Moderate" | "Severe";
    durationDays?: number;
  }) {
    if (!user || !user.patientId) {
      alert("Error: No patient profile linked to this user session. Please ensure your ABHA ID or mobile registration details are complete.");
      return;
    }

    const slotTime = options?.slotTime || bookingSlotTime || "11:30 AM";
    const symptoms = options?.symptoms || bookingSymptoms || "General health consultation";
    const severity = options?.severity || bookingSeverity || "Mild";
    const duration = options?.durationDays || bookingDuration || 1;

    try {
      setBookingSubmitting(true);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.patientId,
          appointmentDate: new Date(), // Today
          appointmentTime: slotTime,
          symptoms: symptoms,
          symptomSeverity: severity,
          symptomDuration: duration,
          bookingSource: "PATIENT_PORTAL",
        }),
      });

      const data = await response.json();
      if (data.success) {
        const priorityLabel = data.triageLevel === "Urgent" ? "🔴 Urgent" : data.triageLevel === "Priority" ? "🟠 Priority" : "🟢 Routine";
        alert(`✅ Consultation Slot ${slotTime} Successfully Booked!\n• Triage Urgency: ${priorityLabel}\n• Symptoms Logged: ${symptoms}\n• Status: Added to Doctor Queue`);
        setActiveAction(null);
        setBookingSymptoms("");
        fetchPatientData(); // Refresh patient dashboard data
      } else {
        alert("Failed to book slot: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to book slot: " + err.message);
    } finally {
      setBookingSubmitting(false);
    }
  }

  // Handle real medicine reservation in database
  async function handleReserveMedicine(facilityName: string, medicineId?: string) {
    const pId = user?.patientId || "guest";
    setSelectedFacility(facilityName);
    setOrderStatus("Requested");

    try {
      const res = await fetch("/api/medicines/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId,
          facilityName,
          medicineName: selectedMedicineCheck || "Prescribed Generic Medicines",
          quantity: 1
        })
      });
      const data = await res.json();
      const trackingId = data.trackingId || `JC-MED-${Math.floor(1000 + Math.random() * 9000)}`;

      setOrderTrackingId(trackingId);
      localStorage.setItem(`jc_active_order_id_${pId}`, trackingId);
      localStorage.setItem(`jc_active_order_status_${pId}`, "Requested");
      localStorage.setItem(`jc_active_order_facility_${pId}`, facilityName);
      alert(`Medicines successfully reserved at ${facilityName}! Tracking ID: ${trackingId} generated.`);
      
      if (selectedMedicineCheck) {
        checkMedicineAvailability(selectedMedicineCheck);
      }
      setActiveTab("Medicine Orders");
    } catch (err: any) {
      console.warn("Reservation network fallback:", err);
      const randomId = `JC-MED-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderTrackingId(randomId);
      localStorage.setItem(`jc_active_order_id_${pId}`, randomId);
      localStorage.setItem(`jc_active_order_status_${pId}`, "Requested");
      localStorage.setItem(`jc_active_order_facility_${pId}`, facilityName);
      alert(`Medicines successfully reserved at ${facilityName}! Tracking ID: ${randomId} generated.`);
      setActiveTab("Medicine Orders");
    }
  }

  // Trigger simulated progression of order status for the hackathon presentation
  function advanceOrderStatus() {
    let nextStatus: typeof orderStatus = "Requested";
    if (orderStatus === "Requested") nextStatus = "Preparing";
    else if (orderStatus === "Preparing") nextStatus = "Ready";
    else if (orderStatus === "Ready") nextStatus = "Collected";
    else return;

    const pId = user?.patientId || "guest";
    setOrderStatus(nextStatus);
    localStorage.setItem(`jc_active_order_status_${pId}`, nextStatus);
    alert(`Simulation: Order status updated to "${nextStatus}"`);
  }

  // Real PDF-friendly print compilers
  function handleDownloadPrescription(pres: any) {
    const doctorName = pres.doctorId?.name || "Dr. Aniruddha Kulkarni";
    const dateStr = new Date(pres.createdAt).toLocaleDateString();
    const patientName = user?.name || "Patient";
    const patientId = user?.patientRefId || "JC-Patient";
    const age = user?.age || 30;
    const gender = user?.gender || "Patient";
    
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
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; pt: 20px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">जनCare Health Center</div>
              <div style="font-size:12px;color:#64748b;">Integrated Care Record</div>
            </div>
            <div style="text-align:right; font-size:12px; color:#64748b;">
              <strong>Generic e-Rx Prescription</strong><br/>
              Date: ${dateStr}
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br/>
              <strong>Patient Ref ID:</strong> ${patientId}<br/>
              <strong>Age / Gender:</strong> ${age}y / ${gender}
            </div>
            <div style="text-align:right;">
              <strong>Prescribed By:</strong> ${doctorName}<br/>
              <strong>Health Center:</strong> Sinnar Rural Hospital (CHC)<br/>
              <strong>Consultation ID:</strong> ${pres.consultationId || "JC-9A82"}
            </div>
          </div>
          
          <div class="section-title">Generic Medications Prescribed</div>
          <table>
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Strength</th>
                <th>Form</th>
                <th>Dosage Rule</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${pres.medicines.map((med: any) => `
                <tr>
                  <td><strong>${med.name}</strong></td>
                  <td>${med.strength}</td>
                  <td>${med.form}</td>
                  <td>${med.dosage}</td>
                  <td>${med.durationDays} Days</td>
                  <td>${med.instructions || "After meals"}</td>
                </tr>
              `).join("")}
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

  function handleDownloadClinicalDocument(doc: any) {
    const patientName = user?.name || "Patient";
    const patientId = user?.patientRefId || "JC-Patient";
    const dateStr = new Date(doc.createdAt || new Date()).toLocaleDateString();

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1464D2; }
            .details { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .content { font-size: 13px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-family: monospace; white-space: pre-wrap; margin-top: 15px; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">जनCare Health Initiative</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Government of Maharashtra | ABDM Sandbox</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; font-size: 14px;">Clinical Artifact</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 5px;">Type: ${doc.type}</div>
            </div>
          </div>

          <div class="details">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br/>
              <strong>Patient Ref ID:</strong> ${patientId}
            </div>
            <div style="text-align: right;">
              <strong>Record Date:</strong> ${dateStr}<br/>
              <strong>Source:</strong> ${doc.recordedBy?.name || "System Upload"} (${doc.recordedBy?.role || "Frontline Worker"})
            </div>
          </div>

          <div class="section-title">${doc.title}</div>
          <div class="content">${doc.fileContent || "No document file content present."}</div>
          ${doc.fileUrl ? `
            <div class="section-title">Attached Scanned Record / Document</div>
            <div style="margin-top: 15px; text-align: center;">
              ${doc.fileUrl.startsWith("data:image/") ? `
                <img src="${doc.fileUrl}" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 12px;" />
              ` : `
                <iframe src="${doc.fileUrl}" style="width: 100%; height: 650px; border: 1px solid #e2e8f0; border-radius: 12px;"></iframe>
              `}
            </div>
          ` : ""}

          <div class="footer">
            This is a digitally generated clinical record authorized under ABHA consent guidelines. Secure transactional key verified.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleDownloadConsultationReport(c: any) {
    const doctorName = c.doctorId?.name || "Dr. Aniruddha Kulkarni";
    const dateStr = new Date(c.createdAt || c.consultationDate).toLocaleDateString();
    const patientName = user?.name || "Patient";
    const patientId = user?.patientRefId || "JC-Patient";
    const age = user?.age || 30;
    const gender = user?.gender || "Patient";
    const healthRecord = c.healthRecordId;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Clinical_Report_${patientId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1464D2; }
            .details { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .content-box { font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 10px; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">जनCare Health Initiative</div>
              <div style="font-size:12px;color:#64748b;">Clinical Summary & Outpatient Consultation Record</div>
            </div>
            <div style="text-align:right; font-size:12px; color:#64748b;">
              <strong>Consultation Summary</strong><br/>
              Date: ${dateStr}
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br/>
              <strong>Patient Ref ID:</strong> ${patientId}<br/>
              <strong>Age / Gender:</strong> ${age}y / ${gender}
            </div>
            <div style="text-align:right;">
              <strong>Consulting Physician:</strong> ${doctorName}<br/>
              <strong>Session ID:</strong> ${c._id}<br/>
              <strong>Facility:</strong> Sinnar Rural Hospital (CHC)
            </div>
          </div>
          
          <div class="section-title">Intake Baseline Vitals</div>
          <div class="content-box">
            Temperature: ${healthRecord?.vitals?.temperature || "98.6"} °F | 
            BP: ${healthRecord?.vitals?.bloodPressureSystolic || "120"}/${healthRecord?.vitals?.bloodPressureDiastolic || "80"} mmHg | 
            SpO2: ${healthRecord?.vitals?.spo2 || "98"}% | 
            Pulse: ${healthRecord?.vitals?.heartRate || "72"} bpm
          </div>

          <div class="section-title">Clinical Assessment & Diagnosis</div>
          <div class="content-box">
            <strong>Diagnosis:</strong> ${c.diagnosis || "Acute viral syndrome / General checkup"}<br/><br/>
            <strong>Progress Notes:</strong> ${c.clinicalNotes || "Patient presented symptoms. Vitals monitored. Prescribed generic medications and scheduled outreach checks."}
          </div>

          <div class="footer">
            Digitally generated by JanCare platform for Smart India Hackathon. Government of Maharashtra sandbox.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleDownloadTimelineReport() {
    const patientName = user?.name || "Patient";
    const patientId = user?.patientRefId || "JC-Patient";
    const age = user?.age || 30;
    const gender = user?.gender || "Patient";
    
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
            .timeline-item::before { content: ''; position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: #1464D2; }
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
            ${timelineSteps.map(step => `
              <div class="timeline-item">
                <div class="date">${step.date}</div>
                <strong>${step.label}</strong><br/>
                ${step.desc}
              </div>
            `).join('')}
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
  const activeAppointment = appointments.find((a) => a.status === "Scheduled" || a.status === "BOOKED");
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

  // Dynamic calculations for Care Journey Stepper
  const getJourneySteps = () => {
    const isCompleted = latestConsult?.status === "Completed";
    const isScheduled = latestConsult?.status === "Scheduled" || latestConsult?.status === "Active";
    const hasPrescription = prescriptions.length > 0;
    const hasOrder = !!orderTrackingId;
    const upcomingText = language === "mr" ? "पुढील" : language === "hi" ? "आगामी" : "Upcoming";
    const completedText = t("common.completed") || "Completed";
    const inProgressText = t("common.inProgress") || "In Progress";

    return [
      { label: t("journey.symptoms") || "Symptoms", status: latestConsult ? completedText : upcomingText },
      { label: t("journey.triage") || "AI Triage", status: latestConsult ? completedText : upcomingText },
      { label: t("journey.doctor") || "Doctor", status: isCompleted ? completedText : isScheduled ? inProgressText : upcomingText },
      { label: t("journey.medicine") || "Medicine", status: hasOrder ? completedText : hasPrescription ? inProgressText : upcomingText },
      { label: t("journey.referral") || "Referral", status: orderStatus === "Collected" ? completedText : upcomingText },
      { label: t("journey.followUp") || "Follow-up", status: upcomingText },
      { label: t("journey.completeCare") || "Complete Care", status: isCompleted && hasPrescription ? inProgressText : upcomingText }
    ];
  };
  const journeyStepsArray = getJourneySteps();

  // Dynamic timeline builder
  const getTimelineSteps = () => {
    const steps = [];
    const regDateStr = user?.createdAt 
      ? new Date(user.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + ", " + new Date(user.createdAt).toLocaleDateString() 
      : new Date().toLocaleDateString();
    
    steps.push({
      label: language === "mr" ? "रुग्ण नोंदणी पूर्ण" : language === "hi" ? "मरीज पंजीकरण पूर्ण" : "Patient Registered",
      desc: `${language === "mr" ? "आयडीसह प्रोफाईल तयार केले" : language === "hi" ? "आईडी के साथ प्रोफाइल बनाई गई" : "Profile created with Ref ID"}: ${user?.patientRefId || "JC-NEW"}`,
      date: regDateStr,
      completed: true
    });

    if (consultations.length === 0) {
      steps.push({
        label: language === "mr" ? "अपॉइंटमेंट बुकिंगची प्रतीक्षा" : language === "hi" ? "अपॉइंटमेंट बुकिंग की प्रतीक्षा" : "Await Appointment Booking",
        desc: language === "mr" ? "कृपया तपासणीसाठी उपलब्ध स्लॉट निवडा." : language === "hi" ? "कृपया परामर्श के लिए उपलब्ध स्लॉट चुनें।" : "Please select an available slot under Next Appointment to schedule a clinical consultation.",
        date: language === "mr" ? "प्रलंबित" : language === "hi" ? "लंबित" : "Pending Action",
        completed: false
      });
      steps.push({
        label: language === "mr" ? "डॉक्टरांचा सल्ला" : language === "hi" ? "डॉक्टर परामर्श" : "Doctor Consultation",
        desc: language === "mr" ? "थेट WebRTC व्हिडिओ सल्लामसलत." : language === "hi" ? "लाइव WebRTC वीडियो परामर्श।" : "Real-time WebRTC teleconsultation call.",
        date: language === "mr" ? "पुढील" : language === "hi" ? "आगामी" : "Upcoming",
        completed: false
      });
      steps.push({
        label: language === "mr" ? "प्रिस्क्रिप्शन व औषध वितरण" : language === "hi" ? "पर्चा व दवा वितरण" : "Prescription & Pharmacy Dispatch",
        desc: language === "mr" ? "जवळच्या आरोग्य केंद्रातून औषधे मिळवा." : language === "hi" ? "निकटतम स्वास्थ्य केंद्र से दवाएं प्राप्त करें।" : "Receive medicines from the closest rural pharmacy.",
        date: language === "mr" ? "पुढील" : language === "hi" ? "आगामी" : "Upcoming",
        completed: false
      });
    } else {
      const activeCons = consultations.find(c => c.status === "Scheduled" || c.status === "Active");
      const completedCons = consultations.find(c => c.status === "Completed");

      steps.push({
        label: language === "mr" ? "लक्षणे व AI तपासणी" : language === "hi" ? "लक्षण व AI जांच" : "Symptoms & AI Triage Intake",
        desc: activeCons?.healthRecordId?.triage?.reason || (language === "mr" ? "प्राथमिक तपासणी पूर्ण." : language === "hi" ? "प्राथमिक जांच पूर्ण।" : "Intake assessment complete. Priority index logged."),
        date: new Date(consultations[consultations.length - 1].createdAt).toLocaleDateString(),
        completed: true
      });

      steps.push({
        label: language === "mr" ? "डॉक्टर सल्लामसलत कक्ष" : language === "hi" ? "डॉक्टर परामर्श कक्ष" : "Doctor Consultation Room",
        desc: completedCons 
          ? (language === "mr" ? "डॉक्टरांशी सल्लामसलत पूर्ण झाली." : language === "hi" ? "डॉक्टर से परामर्श सफलतापूर्वक पूरा हुआ।" : "Teleconsultation call successfully finished with Dr. Aniruddha Kulkarni.")
          : (language === "mr" ? "व्हिडिओ कक्ष सक्रिय आहे. प्रवेश करण्यासाठी क्लिक करा." : language === "hi" ? "वीडियो कक्ष सक्रिय है। प्रवेश करने के लिए क्लिक करें।" : "WebRTC consultation room is active. Click Join Consultation to enter."),
        date: completedCons 
          ? new Date(completedCons.updatedAt).toLocaleDateString() 
          : (language === "mr" ? "आता सक्रिय" : language === "hi" ? "अब सक्रिय" : "Active Now"),
        completed: !!completedCons
      });

      steps.push({
        label: language === "mr" ? "प्रिस्क्रिप्शन तयार झाले" : language === "hi" ? "पर्चा जारी किया गया" : "Prescription Created",
        desc: prescriptions.length > 0 
          ? `${prescriptions[0].medicines.length} ${language === "mr" ? "औषधे डॉक्टरांनी लिहून दिली." : language === "hi" ? "दवाएं डॉक्टर द्वारा निर्धारित की गईं।" : "generic medicines issued by physician."}` 
          : (language === "mr" ? "डॉक्टरांच्या निदानाची प्रतीक्षा." : language === "hi" ? "डॉक्टर के निदान की प्रतीक्षा।" : "Pending doctor diagnosis and prescriptions."),
        date: prescriptions.length > 0 
          ? new Date(prescriptions[0].createdAt).toLocaleDateString() 
          : (language === "mr" ? "प्रतीक्षेत" : language === "hi" ? "प्रतीक्षा में" : "Awaiting consultation end"),
        completed: prescriptions.length > 0
      });

      if (prescriptions.length > 0) {
        steps.push({
          label: language === "mr" ? "औषध आरक्षण" : language === "hi" ? "दवा आरक्षण" : "Medicine Reservation",
          desc: orderTrackingId 
            ? `${language === "mr" ? "आरक्षित केले केंद्र" : language === "hi" ? "आरक्षित केंद्र" : "Reserved at"} ${selectedFacility || "PHC-01"}. ${language === "mr" ? "ट्रॅकिंग आयडी" : language === "hi" ? "ट्रैकिंग आईडी" : "Tracking ID"}: ${orderTrackingId}` 
            : (language === "mr" ? "औषधे आरक्षित करण्यासाठी उपलब्धता तपासा." : language === "hi" ? "दवाएं आरक्षित करने के लिए उपलब्धता जांचें।" : "Click 'Check Availability' to reserve generic drugs at nearest clinic."),
          date: orderTrackingId ? (language === "mr" ? "आरक्षित" : language === "hi" ? "आरक्षित" : "Reserved") : (language === "mr" ? "आवश्यक" : language === "hi" ? "आवश्यक" : "Action Required"),
          completed: !!orderTrackingId
        });
      }
    }
    
    return steps;
  };
  const timelineSteps = getTimelineSteps();

  // Local fallback prescriptions if none seeded yet
  const displayPrescriptions = prescriptions;

  const nearbyFacilities = [
    { name: "PHC-01 (Primary Health Centre)", distance: "2.1 km", MC1: "Available", MC2: "Low Stock", updated: "10:42 AM", coordinates: "19.8517,74.0006" },
    { name: "PHC-02 (Sub Centre)", distance: "4.2 km", MC1: "Available", MC2: "Out of Stock", updated: "11:00 AM", coordinates: "19.8654,74.0123" },
    { name: "MED-01 (Medical Store)", distance: "6.8 km", MC1: "Available", MC2: "Available", updated: "09:30 AM", coordinates: "19.8402,73.9904" },
    { name: "PHC-03 (Community Health Hub)", distance: "12.1 km", MC1: "Available", MC2: "Available", updated: "08:15 AM", coordinates: "19.8821,74.0345" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500">{t("common.loading") || "Loading Patient Records..."}</p>
        </div>
      </div>
    );
  }

  function getTimeGreeting(lang: string, name?: string) {
    const hour = new Date().getHours();
    const displayName = name || (lang === "mr" ? "रुग्ण" : lang === "hi" ? "मरीज" : "Patient");

    if (hour >= 4 && hour < 12) {
      if (lang === "mr") return `शुभ प्रभात, ${displayName} 👋`;
      if (lang === "hi") return `शुभ प्रभात, ${displayName} 👋`;
      return `Good morning, ${displayName} 👋`;
    } else if (hour >= 12 && hour < 17) {
      if (lang === "mr") return `शुभ दुपार, ${displayName} 👋`;
      if (lang === "hi") return `शुभ दोपहर, ${displayName} 👋`;
      return `Good afternoon, ${displayName} 👋`;
    } else {
      if (lang === "mr") return `शुभ संध्याकाळ, ${displayName} 👋`;
      if (lang === "hi") return `शुभ संध्या, ${displayName} 👋`;
      return `Good evening, ${displayName} 👋`;
    }
  }

  return (
    <AppShell
      role="Patient"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
    >
      {/* 1. DASHBOARD VIEW */}
      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {getTimeGreeting(language, user?.name)}
              </h2>
              <p className="text-xs text-slate-300">
                {language === "mr" ? "आपले स्वागत आहे. हा आपला वैयक्तिक आरोग्य डॅशबोर्ड आहे." : language === "hi" ? "वापसी पर स्वागत है। यह आपका व्यक्तिगत स्वास्थ्य डैशबोर्ड है।" : "Welcome back. Here is your personalized health dashboard overview."}
              </p>
            </div>

            {activeConsultation?.status === "In Progress" && (
              <button
                onClick={() => router.push(`/doctor/consultation/${activeConsultation._id}`)}
                className="bg-primary hover:bg-deep-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all border-0 w-full sm:w-auto justify-center"
              >
                <Video size={16} /> {language === "mr" ? "सल्लामसलत कॉलमध्ये सामील व्हा" : language === "hi" ? "परामर्श कॉल में शामिल हों" : "Join Consultation Call"}
              </button>
            )}
          </div>

          {/* 🚨 Emergency Fast-Track SOS Dock (Rendered Conditionally for Urgent Triage & Emergencies) */}
          {hasUrgentCondition && (
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-red-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertOctagon size={12} className="animate-pulse text-amber-300" />
                    {language === "mr" ? "तातडीची वैद्यकीय आणीबाणी सक्रिय" : language === "hi" ? "आपातकालीन चिकित्सा सक्रिय" : "Urgent Clinical Escalation Active"}
                  </span>
                  <span className="text-[10px] text-red-100 hidden sm:inline">• Sinnar CHC ICU</span>
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  {language === "mr" ? "आपल्या उपचारासाठी तातडीची सेवा सक्रिय आहे" : language === "hi" ? "आपकी देखभाल के लिए आपातकालीन सेवा सक्रिय है" : "Emergency Response Active for Your Care"}
                </h3>
                <p className="text-[11px] text-red-100">
                  {language === "mr" ? "AI तपासणीनुसार तातडीच्या उपचारांची आवश्यकता ओळखली गेली आहे." : language === "hi" ? "AI जांच के अनुसार आपातकालीन देखभाल की आवश्यकता है।" : "AI triage or clinician flagged high-risk symptoms requiring prioritized emergency response."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {dashboardAmbulanceTriggered ? (
                  <div className="bg-red-950/80 px-3.5 py-2 rounded-xl border border-red-400/40 text-[10px] flex items-center gap-2">
                    <span className="font-bold text-amber-300">🚑 MH-15-EM-108 Dispatched!</span>
                    <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-mono animate-pulse">ETA ~10m</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setDashboardAmbulanceTriggered(true);
                      alert("🚨 108 EMERGENCY AMBULANCE DISPATCH ACTIVATED!\n\n🚑 Ambulance MH-15-EM-108 dispatched from Sinnar Depot.\n⏱️ ETA: 10-12 Mins.\n🏥 Destination: Sinnar CHC / Nashik Trauma ICU.\n📋 Digital Trauma Sheet pre-transmitted to casualty team.");
                    }}
                    className="bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-0 transition-all w-full sm:w-auto"
                  >
                    <PhoneCall size={14} className="text-red-600" /> {t("common.ambulance108") || "Call 108 Ambulance"}
                  </button>
                )}

                <button
                  onClick={handleStartInstantEmergencyCall}
                  disabled={instantCalling}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-0 transition-all w-full sm:w-auto"
                >
                  {instantCalling ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                  {t("common.emergencyCall") || "Instant Doctor Call"}
                </button>

                <button
                  onClick={() => setEmergencyDismissed(true)}
                  className="bg-red-800/80 hover:bg-red-800 text-white text-[11px] font-bold px-3 py-2.5 rounded-xl cursor-pointer border-0 transition-all"
                >
                  {language === "mr" ? "बंद करा" : language === "hi" ? "खारिज करें" : "Dismiss"}
                </button>
              </div>
            </div>
          )}

          {/* Stepper Progress bar: Your Care Journey */}
          <div className="bg-white border border-slate-200/80 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                {t("journey.title") || "Your Care Journey Progression"}
              </h3>
              <span className="sm:hidden text-[9px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full">← Swipe →</span>
            </div>
            
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center justify-between min-w-[620px] relative py-2 px-2 sm:px-4">
                {journeyStepsArray.map((step, idx) => {
                  const isActive = step.status === (t("common.inProgress") || "In Progress");
                  const isDone = step.status === (t("common.completed") || "Completed");
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center relative z-10">
                        <span className={`h-7.5 w-7.5 rounded-full flex items-center justify-center text-[10px] font-extrabold border transition-all ${
                          isDone 
                            ? "bg-green-brand border-green-brand text-white" 
                            : isActive 
                            ? "bg-primary border-primary text-white ring-4 ring-primary/10 animate-pulse" 
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}>
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold mt-2 ${
                          isDone ? "text-green-700" : isActive ? "text-primary" : "text-slate-500"
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[8px] font-semibold text-slate-400 mt-0.5">{step.status}</span>
                      </div>
                      {idx < 6 && (
                        <span className={`h-0.5 flex-1 mx-2 ${
                          isDone ? "bg-green-brand" : "bg-slate-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Widgets grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Widget 1 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36 animate-in fade-in duration-150">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Calendar size={10} /> {language === "mr" ? "पुढील अपॉइंटमेंट" : language === "hi" ? "अगली अपॉइंटमेंट" : "Next Appointment"}
                </span>
                {activeAppointment ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">
                      {new Date(activeAppointment.appointmentDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short"
                      })} • {activeAppointment.appointmentTime || "11:30 AM"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{activeAppointment.doctorId?.name || "Dr. Kulkarni"}</span>
                  </>
                ) : activeConsultation ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">
                      {language === "mr" ? "आज" : language === "hi" ? "आज" : "Today"} • {activeConsultation.videoRoomName ? (language === "mr" ? "ऑनलाइन कॉल" : language === "hi" ? "ऑनलाइन कॉल" : "Online Call") : "11:30 AM"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{activeConsultation.doctorId?.name || "Dr. Kulkarni"}</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">
                      {language === "mr" ? "कोणतीही अपॉइंटमेंट नाही" : language === "hi" ? "कोई अपॉइंटमेंट नहीं" : "No Appointment"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "खाली स्लॉट बुक करा" : language === "hi" ? "नीचे स्लॉट बुक करें" : "Book a slot below"}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => (activeConsultation || activeAppointment) ? setActiveTab("Video Consultation") : setActiveTab("Appointments")}
                className="w-full bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-xl border-0 cursor-pointer text-center"
              >
                {activeConsultation 
                  ? (language === "mr" ? "सल्लामसलत कॉल" : language === "hi" ? "परामर्श में शामिल हों" : "Join Consult") 
                  : activeAppointment 
                  ? (language === "mr" ? "कॉलमध्ये सामील व्हा" : language === "hi" ? "कॉल में शामिल हों" : "Join Call") 
                  : (language === "mr" ? "स्लॉट बुक करा" : language === "hi" ? "स्लॉट बुक करें" : "Book Slot")}
              </button>
            </div>

            {/* Widget 2 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Briefcase size={10} /> {language === "mr" ? "सक्रिय औषधोपचार पत्रक" : language === "hi" ? "सक्रिय प्रिस्क्रिप्शन" : "Active Prescription"}
                </span>
                {prescriptions.length > 0 ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">
                      {prescriptions[0].medicines.length} {language === "mr" ? "औषधे दिली" : language === "hi" ? "दवाएं दी गईं" : "Prescribed"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "फार्मसी वितरणासाठी तयार" : language === "hi" ? "फार्मेसी वितरण के लिए तैयार" : "Ready for pharmacy dispatch"}
                    </span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">
                      0 {language === "mr" ? "औषधे" : language === "hi" ? "दवाएं" : "Prescribed"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "कोणतेही पत्रक दिलेले नाही" : language === "hi" ? "कोई प्रिस्क्रिप्शन नहीं" : "No prescription issued"}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Prescriptions")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                {language === "mr" ? "औषध पत्रके पहा" : language === "hi" ? "प्रिस्क्रिप्शन देखें" : "View Prescriptions"}
              </button>
            </div>

            {/* Widget 3 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Package size={10} /> {language === "mr" ? "औषध आरक्षण" : language === "hi" ? "दवा ऑर्डर / आरक्षण" : "Medicine Order"}
                </span>
                {orderTrackingId ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">{orderTrackingId}</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "स्थिती:" : language === "hi" ? "स्थिति:" : "Status:"} <strong className="text-purple-700">{orderStatus}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">
                      {language === "mr" ? "कोणतीही सक्रिय ऑर्डर नाही" : language === "hi" ? "कोई सक्रिय ऑर्डर नहीं" : "No Active Order"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "साठा तपासा" : language === "hi" ? "स्टॉक जांचें" : "Check inventory"}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Medicine Orders")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                {language === "mr" ? "ऑर्डर ट्रॅक करा" : language === "hi" ? "ऑर्डर ट्रैक करें" : "Track Order"}
              </button>
            </div>

            {/* Widget 4 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit">
                  <RotateCcw size={10} /> {language === "mr" ? "फॉलो-अप देय" : language === "hi" ? "फॉलो-अप देय" : "Follow-up Due"}
                </span>
                {latestConsult ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">
                      {language === "mr" ? "गृह तपासणी" : language === "hi" ? "घर पर जांच" : "Home Vitals"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "आशा भेट नियोजित" : language === "hi" ? "आशा दौरा निर्धारित" : "ASHA Visit Scheduled"}
                    </span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">
                      {language === "mr" ? "फॉलो-अप नाही" : language === "hi" ? "कोई फॉलो-अप नहीं" : "No Follow-up"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === "mr" ? "नोंदीची प्रतीक्षा आहे" : language === "hi" ? "रिकॉर्ड की प्रतीक्षा है" : "Awaiting first logs"}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Follow-ups")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                {language === "mr" ? "तपशील पहा" : language === "hi" ? "विवरण देखें" : "View Details"}
              </button>
            </div>
          </div>

          {/* 💳 ABHA PM-JAY Cashless Health Benefit Wallet Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-emerald-500/30 relative overflow-hidden space-y-4 animate-in fade-in duration-200">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Shield size={12} className="text-slate-950" />
                    {language === "mr" ? "आयुष्मान भारत PM-JAY कॅशलेस वॉलेट" : language === "hi" ? "आयुष्मान भारत PM-JAY कैशलेस वॉलेट" : "Ayushman Bharat PM-JAY Cashless Wallet"}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-400/30">
                    {language === "mr" ? "✓ शासकीय व खाजगी मान्यताप्राप्त" : language === "hi" ? "✓ सरकारी व निजी संबद्ध" : "✓ Public & Private Empanelled"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
                  {language === "mr" ? "शस्त्रक्रिया व उपचारांसाठी ₹५,००,००० कॅशलेस संरक्षण" : language === "hi" ? "सर्जरी व उपचार हेतु ₹5,00,000 कैशलेस सुरक्षा" : "₹5,00,000 Cashless Secondary & Tertiary Surgery Coverage"}
                </h3>
                <p className="text-xs text-emerald-100/80 max-w-2xl">
                  {language === "mr" 
                    ? "मोठ्या शस्त्रक्रिया व उपचारांसाठी खाजगी किंवा शासकीय रुग्णालयांमध्ये त्वरित कॅशलेस वजावट. कोणताही आर्थिक अडथळा नाही." 
                    : language === "hi" 
                    ? "बड़ी सर्जरी और उपचार के लिए निजी या सरकारी अस्पतालों में तुरंत कैशलेस कटौती। कोई आर्थिक रुकावट नहीं।" 
                    : "Instant cashless pre-authorization across 28,000+ Empanelled Private & Govt Super-Specialty Hospitals linked to your ABHA ID."}
                </p>
              </div>

              <button
                onClick={() => setActiveTab("ABHA Health Wallet")}
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all shrink-0 border-0"
              >
                <CreditCard size={16} />
                <span>{language === "mr" ? "वॉलेट व शस्त्रक्रिया दावे पहा" : language === "hi" ? "वॉलेट व सर्जरी दावे देखें" : "View Wallet & Surgery Claims"}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Live Wallet Balance Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 relative z-10">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">Total Annual Pool</span>
                <strong className="text-sm font-black text-white block mt-0.5">₹5,00,000</strong>
                <span className="text-[8px] text-emerald-300 font-semibold">Per Family / Year</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">Used for Surgeries</span>
                <strong className="text-sm font-black text-amber-300 block mt-0.5">₹{(pmjayWallet?.usedAmount || 175000).toLocaleString('en-IN')}</strong>
                <span className="text-[8px] text-amber-200 font-semibold">Pre-Authorized Deductions</span>
              </div>

              <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-400/40">
                <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider block">Available Balance</span>
                <strong className="text-sm font-black text-emerald-300 block mt-0.5">₹{(pmjayWallet?.availableBalance || 325000).toLocaleString('en-IN')}</strong>
                <span className="text-[8px] text-emerald-300 font-semibold">100% Cashless Ready</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">Linked ABHA ID</span>
                <strong className="text-xs font-mono font-bold text-white block mt-1">{user?.abhaNumber || abhaNumber || "91-4582-9012-7734"}</strong>
                <span className="text-[8px] text-blue-300 font-semibold">✓ ABDM Verified</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left section inside dashboard: Recent Vitals */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>{language === "mr" ? "अलीकडील आरोग्य तपासणी नोंदी" : language === "hi" ? "हालिया स्वास्थ्य जांच रिकॉर्ड" : "Recent Health Vitals Logs"}</span>
                <span className="text-[9px] text-slate-400 lowercase font-medium">
                  {language === "mr" ? "ABDM / आशा कडून सिंक केले" : language === "hi" ? "ABDM / आशा से सिंक" : "Synchronized from ABDM / ASHA"}
                </span>
              </h3>
              
              {latestVitals ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === "mr" ? "तापमान" : language === "hi" ? "तापमान" : "Temperature"}
                    </span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.temperature}°F</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">
                      {language === "mr" ? "सामान्य" : language === "hi" ? "सामान्य" : "Normal"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === "mr" ? "रक्तदाब" : language === "hi" ? "रक्तचाप (BP)" : "Blood Pressure"}
                    </span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}</strong>
                    <span className="text-[8px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">
                      {language === "mr" ? "किंचित जास्त" : language === "hi" ? "हल्का उच्च" : "Slightly High"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === "mr" ? "SpO2 (ऑक्सिजन)" : language === "hi" ? "SpO2 (ऑक्सीजन)" : "SpO2 (Oxygen)"}
                    </span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.spo2}%</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">
                      {language === "mr" ? "उत्कृष्ट" : language === "hi" ? "उत्कृष्ट" : "Excellent"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === "mr" ? "हृदयाचे ठोके" : language === "hi" ? "हृदय गति" : "Heart Rate"}
                    </span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.heartRate} bpm</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">
                      {language === "mr" ? "सामान्य" : language === "hi" ? "सामान्य" : "Normal"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                  <Activity size={32} className="text-slate-300 animate-pulse" />
                  <span className="text-[11px] font-bold">
                    {language === "mr" ? "कोणत्याही तपासणी नोंदी आढळल्या नाहीत" : language === "hi" ? "कोई स्वास्थ्य जांच रिकॉर्ड नहीं मिला" : "No vitals logs found"}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {language === "mr" ? "आशा कार्यकर्त्यांनी तपासणी केल्यावर नोंदी येथे दिसतील." : language === "hi" ? "आशा कार्यकर्ता द्वारा जांच दर्ज किए जाने पर रिकॉर्ड यहां दिखाई देंगे।" : "Vitals logs will sync here once recorded by an ASHA worker."}
                  </span>
                </div>
              )}
            </div>

            {/* Right section: Important Alerts */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                {language === "mr" ? "महत्त्वाच्या सूचना" : language === "hi" ? "महत्वपूर्ण सूचनाएं" : "Important Alerts"}
              </h3>
              
              <div className="space-y-3">
                {!abhaLinked && (
                  <div className="bg-amber-50/50 border border-amber-200/80 p-3 rounded-2xl text-[10px] text-amber-800 leading-relaxed flex gap-2.5">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === "mr" ? "ABHA आयडी जोडलेला नाही!" : language === "hi" ? "ABHA आईडी लिंक नहीं है!" : "ABHA ID Not Linked!"}</strong><br />
                      {language === "mr"
                        ? "डिजिटल वैद्यकीय औषधोपचार पत्रक पुनर्प्राप्तीसाठी आपले ABDM कार्ड जोडा."
                        : language === "hi"
                        ? "डिजिटल मेडिकल प्रिस्क्रिप्शन प्राप्त करने के लिए अपना ABDM कार्ड लिंक करें।"
                        : "Link your ABDM card to authorize digital medical prescriptions retrieval."}
                      <button onClick={() => setShowAbhaModal(true)} className="text-primary font-bold block mt-1 hover:underline cursor-pointer border-0 bg-transparent text-[10px]">
                        {language === "mr" ? "आता जोडा →" : language === "hi" ? "अभी लिंक करें →" : "Link Now →"}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50/50 border border-blue-200/80 p-3 rounded-2xl text-[10px] text-blue-800 leading-relaxed flex gap-2.5">
                  <BadgeInfo size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{language === "mr" ? "सिन्नर मोफत आरोग्य शिबीर" : language === "hi" ? "सिन्नर स्वास्थ्य शिविर" : "Sinnar Health Camp"}</strong><br />
                    {language === "mr"
                      ? "रक्तदाब तपासणीसाठी या शुक्रवारी उपकेंद्र ०२ येथे सामुदायिक आरोग्य शिबीर."
                      : language === "hi"
                      ? "उच्च रक्तचाप जांच के लिए इस शुक्रवार उपकेंद्र 02 में सामुदायिक स्वास्थ्य शिविर।"
                      : "Community health camp for hypertension checkups this Friday at Sub-centre 02."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE & ABHA ID VIEW */}
      {activeTab === "Profile" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "ABHA राष्ट्रीय आरोग्य ओळखपत्र" : language === "hi" ? "ABHA राष्ट्रीय स्वास्थ्य पहचान (ID)" : "ABHA National Health ID"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "ABDM अंतर्गत आपले ओळखपत्र तपशील व्यवस्थापित व प्रमाणित करा."
                : language === "hi"
                ? "ABDM के अंतर्गत अपने पहचान विवरण प्रबंधित और सत्यापित करें।"
                : "Manage and verify your identity credentials under ABDM."}
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 space-y-4">
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === "mr" ? "ओळखपत्र पडताळणी" : language === "hi" ? "पहचान पत्र सत्यापन" : "IDENTITY CARD VERIFICATION"}
                </span>
                
                {abhaLinked ? (
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl"><Shield size={24} /></div>
                    <div>
                      <strong className="text-xs text-slate-800 block">
                        {language === "mr" ? "ABHA आयडी यशस्वीरित्या जोडला गेला" : language === "hi" ? "ABHA आईडी सफलतापूर्वक लिंक हुआ" : "ABHA ID Linked Successfully"}
                      </strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {language === "mr" ? "कार्ड क्रमांक" : language === "hi" ? "कार्ड नंबर" : "Card Number"}: {abhaNumber}
                      </span>
                      <span className="text-[9px] text-green-700 bg-green-50 font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block">
                        {language === "mr" ? "✓ ABDM प्रमाणित" : language === "hi" ? "✓ ABDM सत्यापित" : "ABDM Verified"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl"><AlertTriangle size={24} /></div>
                    <div>
                      <strong className="text-xs text-slate-800 block">
                        {language === "mr" ? "कोणतेही राष्ट्रीय आरोग्य ओळखपत्र जोडलेले नाही" : language === "hi" ? "कोई राष्ट्रीय स्वास्थ्य आईडी संबद्ध नहीं है" : "No National Health ID Associated"}
                      </strong>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        {language === "mr"
                          ? "प्राथमिक आरोग्य केंद्रांमध्ये स्वयंचलित वैद्यकीय इतिहास संकलनासाठी आपले कार्ड जोडा."
                          : language === "hi"
                          ? "प्राथमिक स्वास्थ्य क्लीनिकों में स्वचालित चिकित्सा इतिहास के लिए अपना कार्ड लिंक करें।"
                          : "Link your card to enable automatic medical history collection across primary health clinics."}
                      </p>
                      <button
                        onClick={() => setShowAbhaModal(true)}
                        className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-4 py-2 rounded-xl mt-3 cursor-pointer border-0"
                      >
                        {language === "mr" ? "ABHA कार्ड जोडा" : language === "hi" ? "ABHA कार्ड लिंक करें" : "Link ABHA Card"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 p-5 rounded-2xl bg-white space-y-3 text-xs">
                <strong className="text-slate-800 block">
                  {language === "mr" ? "लोकसंख्याशास्त्रीय नोंद (तपशील)" : language === "hi" ? "व्यक्तिगत जनसांख्यिकी रिकॉर्ड" : "Demographics Record"}
                </strong>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === "mr" ? "नाव" : language === "hi" ? "नाम" : "Name"}
                    </span>
                    <span className="font-bold text-slate-700">{user?.name || (language === "mr" ? "रुग्ण" : language === "hi" ? "मरीज" : "Patient")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === "mr" ? "नोंदणीकृत मोबाईल" : language === "hi" ? "पंजीकृत मोबाइल" : "Mobile Registered"}
                    </span>
                    <span className="font-bold text-slate-700">{user?.mobile || user?.username || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === "mr" ? "वय / लिंग" : language === "hi" ? "उम्र / लिंग" : "Age / Gender"}
                    </span>
                    <span className="font-bold text-slate-700">{user?.age || "—"}y / {user?.gender || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === "mr" ? "रुग्ण संदर्भ आयडी" : language === "hi" ? "मरीज संदर्भ आईडी" : "Unique Patient Ref"}
                    </span>
                    <span className="font-bold text-slate-700">{user?.patientRefId || "JC-98D2"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-tr from-slate-950 to-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute -top-16 -right-16 h-36 w-36 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {language === "mr" ? "राष्ट्रीय आरोग्य कार्ड" : language === "hi" ? "राष्ट्रीय स्वास्थ्य कार्ड" : "NATIONAL HEALTH CARD"}
                  </span>
                  <h3 className="text-sm font-extrabold mt-1">
                    {language === "mr" ? "ABDM आरोग्य लॉकर" : language === "hi" ? "ABDM स्वास्थ्य लॉकर" : "ABDM Health Locker"}
                  </h3>
                </div>
                <span className="text-[8px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {language === "mr" ? "सक्रिय" : language === "hi" ? "सक्रिय" : "ACTIVE"}
                </span>
              </div>

              <div className="py-8 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  {language === "mr" ? "ABHA आयडी पत्ता" : language === "hi" ? "ABHA आईडी पता" : "ABHA ID ADDRESS"}
                </span>
                <span className="text-base font-extrabold tracking-widest">{user?.name?.toLowerCase().replace(/\s/g, "") || "ramesh"}@ndhm</span>
              </div>

              <div className="flex justify-between items-end text-xs text-slate-400">
                <div>
                  <span className="text-[9px] block">
                    {language === "mr" ? "जारीकर्ता" : language === "hi" ? "जारीकर्ता" : "ISSUED BY"}
                  </span>
                  <strong className="text-white">
                    {language === "mr" ? "भारत सरकार" : language === "hi" ? "भारत सरकार" : "Govt. of India"}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] block">
                    {language === "mr" ? "संदर्भ आयडी" : language === "hi" ? "रेफरेंस आईडी" : "REF ID"}
                  </span>
                  <strong className="text-white">{user?.patientRefId || "JC-9118"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 ABHA PM-JAY CASHLESS SURGERY WALLET VIEW */}
      {activeTab === "ABHA Health Wallet" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/30 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Shield size={12} className="text-slate-950" />
                    {language === "mr" ? "आयुष्मान भारत PM-JAY / MJPJAY" : language === "hi" ? "आयुष्मान भारत PM-JAY / MJPJAY" : "Ayushman Bharat PM-JAY / MJPJAY"}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-400/40">
                    {language === "mr" ? "२८,०००+ खाजगी व शासकीय रुग्णालये" : language === "hi" ? "28,000+ निजी व सरकारी अस्पताल" : "28,000+ Empanelled Hospitals"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                  {language === "mr" ? "ABHA कॅशलेस आरोग्य व शस्त्रक्रिया वॉलेट" : language === "hi" ? "ABHA कैशलेस स्वास्थ्य व सर्जरी वॉलेट" : "ABHA Cashless Surgery & Health Wallet"}
                </h2>
                <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                  {language === "mr"
                    ? "मोठ्या शस्त्रक्रिया व उपचारांसाठी दरवर्षी ₹५,००,००० पर्यंतचे कॅशलेस संरक्षण. खाजगी व शासकीय रुग्णालयांमध्ये अखंडित डिजिटल प्रक्रिया."
                    : language === "hi"
                    ? "बड़ी सर्जरी और उपचार के लिए प्रति वर्ष ₹5,00,000 तक कैशलेस सुरक्षा। निजी और सरकारी अस्पतालों में निर्बाध डिजिटल प्रक्रिया।"
                    : "Universal ₹5,00,000 yearly cashless health cover for secondary and tertiary surgeries. Seamless interoperability across Public PHC/CHC and Empanelled Private Super-Specialty Hospitals."}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[180px] shrink-0">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Available Balance</span>
                <strong className="text-2xl font-black text-white block mt-1">₹{(pmjayWallet?.availableBalance || 325000).toLocaleString('en-IN')}</strong>
                <span className="text-[9px] text-emerald-200/80 font-medium mt-0.5 block">of ₹5,00,000 Total Limit</span>
              </div>
            </div>
          </div>

          {preAuthSuccessMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200">
              <span>{preAuthSuccessMsg}</span>
              <button onClick={() => setPreAuthSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900 bg-transparent border-0 font-bold cursor-pointer">✕</button>
            </div>
          )}

          {preAuthErrorMsg && (
            <div className="bg-red-50 text-red-900 border border-red-300 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200">
              <span>{preAuthErrorMsg}</span>
              <button onClick={() => setPreAuthErrorMsg("")} className="text-red-700 hover:text-red-900 bg-transparent border-0 font-bold cursor-pointer">✕</button>
            </div>
          )}

          {/* Gold Digital Health Card & Live Meter Grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Digital ABHA Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between border border-amber-400/40 min-h-[260px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start border-b border-amber-300/30 pb-3 relative z-10">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-200 block">GOVERNMENT OF INDIA & MAHARASHTRA</span>
                  <h3 className="text-sm font-black text-white mt-0.5">National Health Identity & PM-JAY Card</h3>
                </div>
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center font-black text-xs border border-white/30">
                  🇮🇳
                </div>
              </div>

              <div className="my-4 space-y-1 relative z-10">
                <span className="text-[9px] font-bold text-amber-200 uppercase tracking-wider block">ABHA HEALTH NUMBER</span>
                <span className="text-lg sm:text-xl font-mono font-black tracking-widest text-white block drop-shadow-sm">
                  {user?.abhaNumber || abhaNumber || "91-4582-9012-7734"}
                </span>
                <div className="flex items-center gap-4 text-xs font-bold text-amber-100 pt-1">
                  <span>Name: <strong className="text-white font-extrabold">{user?.name || "Ramesh Kumar"}</strong></span>
                  <span>Ref: <strong className="text-white font-mono">{user?.patientRefId || "JC-7F3K92"}</strong></span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-amber-300/30 pt-3 text-[10px] relative z-10">
                <div>
                  <span className="text-amber-200 block text-[9px]">ANNUAL CASHLESS COVERAGE</span>
                  <strong className="text-white text-xs font-black">₹5,00,000 / Year</strong>
                </div>
                <div className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg text-[9px] flex items-center gap-1 shadow-xs">
                  <Check size={11} className="text-green-600 font-black" /> ABDM VERIFIED & EMPANELLED
                </div>
              </div>
            </div>

            {/* Wallet Meter & Utilization Card */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-600" />
                    {language === "mr" ? "वार्षिक निधी वापर मीटर" : language === "hi" ? "वार्षिक फंड उपयोग मीटर" : "Annual Cashless Pool Utilization"}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {Math.round(((pmjayWallet?.availableBalance || 325000) / 500000) * 100)}% Funds Available
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Used: ₹{(pmjayWallet?.usedAmount || 175000).toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600">Available: ₹{(pmjayWallet?.availableBalance || 325000).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex border border-slate-200/60 p-0.5">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((pmjayWallet?.usedAmount || 175000) / 500000) * 100)}%` }}
                      title="Used for Surgery Pre-Auth"
                    />
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500 ml-0.5"
                      style={{ width: `${Math.min(100, ((pmjayWallet?.availableBalance || 325000) / 500000) * 100)}%` }}
                      title="Available Cashless Pool"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>₹0 (Min)</span>
                    <span className="font-bold text-slate-600">₹5,00,000 (Max Annual Limit)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                <strong className="text-slate-800 font-bold block">💡 How Cashless Deduction Works:</strong>
                <p className="leading-relaxed text-[10px]">
                  When a surgery is scheduled at any empanelled hospital (Govt Civil Hospital or Private Super-Specialty), the hospital pre-authorizes the surgery package through your ABHA number. The approved amount is directly deducted from this ₹5 Lakh pool, ensuring <strong>zero out-of-pocket payment</strong> for your family.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Surgery Pre-Authorization Tool (Viva / Presentation Demonstration) */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  {language === "mr" ? "शस्त्रक्रिया पॅकेज पूर्व-मंजुरी व कॅशलेस वजावट सिम्युलेटर" : language === "hi" ? "सर्जरी पैकेज पूर्व-अनुमोदन व कैशलेस कटौती सिम्युलेटर" : "Surgery Package Pre-Authorization & Cashless Deduction Simulator"}
                </h3>
                <span className="text-[10px] text-slate-500">
                  Demonstrate how large surgical expenses are instantly deducted from the PM-JAY wallet across Public and Private hospitals.
                </span>
              </div>
              <span className="text-[9px] font-black text-primary bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                ⚡ Live ABDM Pre-Auth
              </span>
            </div>

            <form onSubmit={handleSimulatePreAuth} className="grid md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Surgery / Procedure Package
                </label>
                <select
                  value={selectedSurgeryDemo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSurgeryDemo(val);
                    if (val.includes("Spine")) setCustomSurgeryCost(175000);
                    else if (val.includes("Bypass")) setCustomSurgeryCost(185000);
                    else if (val.includes("Knee")) setCustomSurgeryCost(120000);
                    else if (val.includes("Gallbladder")) setCustomSurgeryCost(45000);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-primary"
                >
                  <option value="Cervical Spine Decompression & Nerve Release">🧠 Cervical Spine Decompression (₹1,75,000)</option>
                  <option value="Coronary Artery Bypass Graft (CABG) Heart Surgery">❤️ Coronary Artery Bypass (CABG) (₹1,85,000)</option>
                  <option value="Total Knee / Hip Joint Replacement">🦴 Total Knee Joint Replacement (₹1,20,000)</option>
                  <option value="Laparoscopic Cholecystectomy (Gallbladder)">🔬 Laparoscopic Cholecystectomy (₹45,000)</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Healthcare Facility (Public / Private)
                </label>
                <select
                  value={selectedHospitalDemo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedHospitalDemo(val);
                    setSelectedHospitalType(val.includes("Sahyadri") || val.includes("Wockhardt") ? "Private (Empanelled)" : "Public (Government)");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-primary"
                >
                  <option value="Sahyadri Super-Specialty Hospital (Private Empanelled)">🏥 Sahyadri Super-Specialty Hospital (Private Empanelled)</option>
                  <option value="Nashik District Civil Hospital & Trauma ICU">🏛️ Nashik District Civil Hospital & Trauma ICU (Govt)</option>
                  <option value="Wockhardt Super-Specialty Care (Private Empanelled)">🏥 Wockhardt Super-Specialty Care (Private Empanelled)</option>
                  <option value="Sinnar Rural CHC Facility">🏛️ Sinnar Rural CHC Facility (Govt)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Package Cost (₹)
                </label>
                <input
                  type="number"
                  value={customSurgeryCost}
                  onChange={(e) => setCustomSurgeryCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={preAuthLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer border-0 transition-all disabled:opacity-50"
                >
                  {preAuthLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                  <span>Authorize Pre-Auth</span>
                </button>
              </div>
            </form>
          </div>

          {/* Past Cashless Surgery Deductions & Claims History */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>{language === "mr" ? "मागील कॅशलेस शस्त्रक्रिया व दावे इतिहास" : language === "hi" ? "पिछले कैशलेस सर्जरी व दावे इतिहास" : "Past Cashless Surgery Pre-Authorizations & Claims History"}</span>
              <span className="text-[10px] text-slate-400 font-medium">Total Claims: {pmjayWallet?.claimsHistory?.length || 1}</span>
            </h3>

            <div className="space-y-3">
              {(pmjayWallet?.claimsHistory || [
                {
                  claimId: "PMJAY-CLM-8841",
                  hospitalName: "Sahyadri Super-Specialty Hospital (Private Empanelled)",
                  hospitalType: "Private (Empanelled)",
                  procedureName: "Cervical Spine Decompression & Nerve Release",
                  packageCode: "NEURO-SP-04",
                  amountDeducted: 175000,
                  approvalStatus: "Approved & Settled Cashless",
                  date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
                }
              ]).map((claim: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold text-primary bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                        {claim.claimId}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        claim.hospitalType?.includes("Private") ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {claim.hospitalType || "Private (Empanelled)"}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800">{claim.procedureName}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>🏥 {claim.hospitalName}</span>
                      <span>•</span>
                      <span>📅 {new Date(claim.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      ₹{Number(claim.amountDeducted).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-emerald-200">
                      ✓ {claim.approvalStatus || "Approved & Settled Cashless"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS VIEW */}
      {activeTab === "Appointments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {language === "mr" ? "अपॉइंटमेंट्स हब" : language === "hi" ? "अपॉइंटमेंट्स हब" : "Appointments Hub"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "mr"
                  ? "आपले वेळापत्रक तपासा किंवा जवळच्या आरोग्य केंद्रांमध्ये नवीन स्लॉट बुक करा."
                  : language === "hi"
                  ? "अपना शेड्यूल देखें या नजदीकी स्वास्थ्य क्लीनिक में नया स्लॉट बुक करें।"
                  : "Review your schedule or book new slots at nearest health clinics."}
              </p>
            </div>
            
            <button
              onClick={() => setActiveAction("Book Doctor")}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border-0"
            >
              <PlusCircle size={14} /> {language === "mr" ? "सल्लामसलत स्लॉट बुक करा" : language === "hi" ? "परामर्श स्लॉट बुक करें" : "Book Consultation Slot"}
            </button>
          </div>

          {activeAction === "Book Doctor" && (
            <div className="bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-3xl animate-in fade-in duration-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <strong className="text-xs sm:text-sm text-slate-800 uppercase tracking-wider block">
                    {language === "mr" ? "डॉक्टर टेलि-कन्सल्टेशन स्लॉट बुक करा" : language === "hi" ? "डॉक्टर टेली-परामर्श स्लॉट बुक करें" : "Book Doctor Tele-Consultation Slot"}
                  </strong>
                  <span className="text-[10px] text-slate-500">
                    {language === "mr" ? "स्वयंचलित प्राधान्य तपासणीसाठी तुमची लक्षणे नोंदवा." : language === "hi" ? "स्वचालित प्राथमिकता ट्राइएज के लिए अपने लक्षण प्रदान करें।" : "Provide your symptoms to enable automatic clinical triage priority assignment."}
                  </span>
                </div>
                <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-transparent border-0 cursor-pointer">
                  {language === "mr" ? "रद्द करा" : language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBookAppointment({
                    slotTime: bookingSlotTime,
                    symptoms: bookingSymptoms || "General consultation",
                    severity: bookingSeverity,
                    durationDays: bookingDuration,
                  });
                }}
                className="space-y-4"
              >
                {/* 1. Symptoms Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === "mr" ? "आपली लक्षणे / आरोग्य तक्रार" : language === "hi" ? "आपके लक्षण / स्वास्थ्य समस्या" : "Your Symptoms / Health Concern"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={bookingSymptoms}
                    onChange={(e) => setBookingSymptoms(e.target.value)}
                    placeholder={language === "mr" ? "उदा. तीव्र ताप, थंडी, खोकला आणि अशक्तपणा..." : language === "hi" ? "उदा. तेज बुखार, ठंड लगना, खांसी और कमजोरी..." : "e.g., High fever (102°F) with shivering, severe cough, and chest discomfort since yesterday..."}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-primary transition-all text-slate-800"
                  />
                  
                  {/* Quick Symptom Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">
                      {language === "mr" ? "लक्षण निवडा:" : language === "hi" ? "जल्दी चुनें:" : "Quick Select:"}
                    </span>
                    {[
                      { label: language === "mr" ? "तीव्र ताप (High Fever)" : language === "hi" ? "तेज बुखार" : "High Fever", val: "Acute High Fever (>101°F) with body chills" },
                      { label: language === "mr" ? "छातीत दुखणे (Chest Pain)" : language === "hi" ? "सीने में दर्द" : "Chest Discomfort", val: "Chest pain and breathing discomfort" },
                      { label: language === "mr" ? "तीव्र खोकला (Severe Cough)" : language === "hi" ? "गंभीर खांसी" : "Severe Cough", val: "Productive chest cough and sore throat" },
                      { label: language === "mr" ? "पोटदुखी (Stomach Pain)" : language === "hi" ? "पेट दर्द" : "Stomach Pain", val: "Severe abdominal cramps and vomiting" },
                      { label: language === "mr" ? "चक्कर / अशक्तपणा (BP)" : language === "hi" ? "चक्कर / कमजोरी" : "Dizziness / BP", val: "Dizziness, low blood pressure, and weakness" },
                      { label: language === "mr" ? "नियमित तपासणी (Checkup)" : language === "hi" ? "नियमित जांच" : "Routine Checkup", val: "Routine preventive health consultation" },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setBookingSymptoms((prev) => prev ? `${prev}, ${chip.val}` : chip.val)}
                        className="bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-primary text-[10px] font-semibold py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                      >
                        + {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Severity & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === "mr" ? "लक्षणांची तीव्रता" : language === "hi" ? "लक्षणों की गंभीरता" : "Symptom Severity Level"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: language === "mr" ? "सौम्य 🟢" : language === "hi" ? "हल्का 🟢" : "Mild 🟢", val: "Mild" as const, color: "hover:border-green-400" },
                        { label: language === "mr" ? "मध्यम 🟠" : language === "hi" ? "मध्यम 🟠" : "Moderate 🟠", val: "Moderate" as const, color: "hover:border-amber-400" },
                        { label: language === "mr" ? "गंभीर 🔴" : language === "hi" ? "गंभीर 🔴" : "Severe 🔴", val: "Severe" as const, color: "hover:border-red-400" },
                      ].map((sev) => (
                        <button
                          key={sev.val}
                          type="button"
                          onClick={() => setBookingSeverity(sev.val)}
                          className={`py-2 px-2 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            bookingSeverity === sev.val
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : `bg-white text-slate-700 border-slate-200 ${sev.color}`
                          }`}
                        >
                          {sev.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === "mr" ? "कालावधी (दिवस)" : language === "hi" ? "अवधि (दिन)" : "Duration of Illness (Days)"}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setBookingDuration(d)}
                          className={`py-2 px-2 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            bookingDuration === d
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:border-primary/50"
                          }`}
                        >
                          {d} {language === "mr" ? "दिवस" : language === "hi" ? "दिन" : (d === 1 ? "Day" : "Days")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Facility & Doctor Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === "mr" ? "आरोग्य केंद्र निवडा" : language === "hi" ? "स्वास्थ्य केंद्र चुनें" : "Select Primary Health Center"}
                    </label>
                    <select
                      value={bookingFacility}
                      onChange={(e) => setBookingFacility(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    >
                      <option value="Sinnar Rural CHC">Sinnar Rural CHC (Primary Hub)</option>
                      <option value="Igatpuri PHC">Igatpuri PHC (Tribal Subcenter)</option>
                      <option value="Nashik Civil Hospital">Nashik Civil Hospital (Tertiary Trauma)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === "mr" ? "सल्लागार डॉक्टर" : language === "hi" ? "सलाहकार डॉक्टर" : "Consulting Physician"}
                    </label>
                    <select
                      value={bookingDoctor}
                      onChange={(e) => setBookingDoctor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    >
                      <option value="Dr. Aniruddha Kulkarni">Dr. Aniruddha Kulkarni (General Medicine / Telehealth)</option>
                      <option value="Dr. Smita Rao">Dr. Smita Rao (Cardiology & Internal Medicine)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Preferred Time Slot & Submit */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <strong className="text-xs text-slate-800 block">
                      {language === "mr" ? "वेळ स्लॉट निवडा (आज)" : language === "hi" ? "समय स्लॉट चुनें (आज)" : "Select Consultation Time Slot (Today)"}
                    </strong>
                    <div className="flex gap-2">
                      {["11:30 AM", "02:00 PM", "04:30 PM"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingSlotTime(slot)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            bookingSlotTime === slot
                              ? "bg-primary text-white border-primary"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md shadow-primary/20 transition-all w-full sm:w-auto"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> {language === "mr" ? "नियोजन होत आहे..." : language === "hi" ? "शेड्यूल हो रहा है..." : "Scheduling..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> {language === "mr" ? "पुष्टी करा आणि स्लॉट बुक करा" : language === "hi" ? "पुष्टि करें और स्लॉट बुक करें" : "Confirm & Book Consultation"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                {language === "mr" ? "आपल्या नियोजित अपॉइंटमेंट्स" : language === "hi" ? "आपकी निर्धारित अपॉइंटमेंट्स" : "Your Booked Appointments"} ({appointments.length || consultations.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === "mr" ? "थेट क्लिनिक रांगेसह सिंक" : language === "hi" ? "लाइव क्लिनिक कतार से सिंक" : "Real-time sync with Clinic Queue"}
              </span>
            </div>
            
            {(appointments.length > 0 || consultations.length > 0) ? (
              <div className="space-y-3.5">
                {/* 1. Show all appointments */}
                {appointments.map((appt, idx) => {
                  const matchedCons = consultations.find(
                    (c) => (c.doctorId?._id === appt.doctorId?._id) || (c.patientId?._id === appt.patientId?._id)
                  );
                  const apptDate = appt.appointmentDate
                    ? new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : (language === "mr" ? "आज" : language === "hi" ? "आज" : "Today");
                  const apptTime = appt.appointmentTime || "11:30 AM";
                  const docName = appt.doctorId?.name || "Dr. Aniruddha Kulkarni";
                  const facilityName = appt.facilityId?.name || "Sinnar Rural CHC";
                  const priority = appt.triagePriority || "Routine";

                  return (
                    <div key={`appt-${appt._id || idx}`} className="border border-slate-200/70 p-4.5 rounded-2xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-150 hover:border-primary/40 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-3 bg-blue-50 text-primary rounded-2xl shrink-0">
                          <Calendar size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-slate-800 text-sm">{facilityName}</strong>
                            <span className="bg-primary/10 text-primary text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {appt.bookingSource === "AI_ASSISTANT" ? "🤖 AI Booked" : "Portal"}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                              priority === "Urgent" ? "bg-red-100 text-red-700" : priority === "Priority" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {priority === "Urgent" ? (language === "mr" ? "🔴 तातडीचे" : language === "hi" ? "🔴 आपातकालीन" : "Urgent") : priority === "Priority" ? (language === "mr" ? "🟠 प्राधान्य" : language === "hi" ? "🟠 प्राथमिकता" : "Priority") : (language === "mr" ? "🟢 नियमित" : language === "hi" ? "🟢 सामान्य" : "Routine")}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 block mt-1">
                            {language === "mr" ? "डॉक्टर:" : language === "hi" ? "डॉक्टर:" : "Doctor:"} <strong>{docName}</strong>
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            📅 {apptDate} • ⏰ {apptTime} | Token: <strong className="text-slate-700">#{appt.queueNumber || 1}</strong> ({language === "mr" ? "प्रतीक्षा" : language === "hi" ? "प्रतीक्षा" : "Est. wait"}: {appt.estimatedWaitMinutes || 15} mins)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${
                          appt.status === "Completed" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-blue-100 text-primary"
                        }`}>
                          {appt.status === "Completed" ? (language === "mr" ? "पूर्ण झाले" : language === "hi" ? "पूर्ण हुआ" : "Completed") : (language === "mr" ? "नियोजित" : language === "hi" ? "शेड्यूल" : "Scheduled")}
                        </span>
                        
                        {matchedCons?.videoRoomName && (
                          <button
                            onClick={() => {
                              setActiveTab("Video Consultation");
                            }}
                            className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl border-0 cursor-pointer shadow-xs shadow-primary/20 transition-all flex items-center gap-1.5"
                          >
                            <Activity size={13} /> {language === "mr" ? "कॉलमध्ये सामील व्हा" : language === "hi" ? "कॉल में शामिल हों" : "Join Call"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Show scheduled consultations not already in appointments */}
                {consultations.filter(c => !appointments.some(a => a.doctorId?._id === c.doctorId?._id)).map((cons, idx) => {
                  const apptDate = new Date(cons.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <div key={`cons-${cons._id || idx}`} className="border border-slate-200/70 p-4.5 rounded-2xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-150">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0"><Calendar size={22} /></div>
                        <div>
                          <strong className="text-slate-800 text-sm block">
                            {language === "mr" ? "टेलि-सल्लामसलत" : language === "hi" ? "टेली-परामर्श" : "Tele-Consultation"} ({cons.facilityId?.name || "Rural Clinic"})
                          </strong>
                          <span className="text-xs text-slate-600 block mt-1">
                            {language === "mr" ? "डॉक्टर:" : language === "hi" ? "डॉक्टर:" : "Doctor:"} <strong>{cons.doctorId?.name || "Dr. Aniruddha Kulkarni"}</strong>
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">📅 {apptDate} • Room: {cons.videoRoomName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${
                          cons.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-primary"
                        }`}>
                          {cons.status === "Completed" ? (language === "mr" ? "पूर्ण झाले" : language === "hi" ? "पूर्ण हुआ" : "Completed") : (language === "mr" ? "नियोजित" : language === "hi" ? "शेड्यूल" : "Scheduled")}
                        </span>
                        
                        {cons.status === "Scheduled" && (
                          <button
                            onClick={() => {
                              setActiveTab("Video Consultation");
                            }}
                            className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl border-0 cursor-pointer shadow-xs shadow-primary/20 transition-all flex items-center gap-1.5"
                          >
                            <Activity size={13} /> {language === "mr" ? "कॉलमध्ये सामील व्हा" : language === "hi" ? "कॉल में शामिल हों" : "Join Call"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-1">
                <Calendar size={32} className="text-slate-300" />
                <span className="text-[11px] font-bold">
                  {language === "mr" ? "कोणतीही अपॉइंटमेंट नियोजित नाही" : language === "hi" ? "कोई अपॉइंटमेंट निर्धारित नहीं है" : "No appointments scheduled"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === "mr" ? "आपले नियोजित सल्लामसलत स्लॉट येथे दिसतील." : language === "hi" ? "आपके निर्धारित परामर्श स्लॉट यहां दिखाई देंगे।" : "Your scheduled consultation slots will appear here automatically."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. VIDEO CONSULTATION VIEW */}
      {activeTab === "Video Consultation" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "टेलि-कन्सल्टेशन व्हिडिओ कक्ष" : language === "hi" ? "टेली-परामर्श वीडियो रूम" : "Tele-Consultation Video Room"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "क्लिनिक डॉक्टरांशी थेट सल्लामसलत करण्यासाठी सुरक्षित व्हिडिओ रूममध्ये सामील व्हा."
                : language === "hi"
                ? "क्लीनिक डॉक्टर से परामर्श के लिए लाइव सुरक्षित रूम में शामिल हों।"
                : "Join the live secure room to consult with your clinic doctor."}
            </p>
          </div>

          {(() => {
            const effectiveRoomName = activeConsultation?.videoRoomName || activeInstantRoom || `jancare-emergency-${(user?.patientRefId || "JC-PATIENT").toLowerCase()}-room`;
            const docName = activeConsultation?.doctorId?.name || "Dr. Aniruddha Kulkarni";
            const facilityName = activeConsultation?.facilityId?.name || "Sinnar CHC Telehealth Hub";

            return (
              <div className="grid lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-200">
                {/* Left Column: Iframe Video Feed */}
                <div className="lg:col-span-8 bg-black border border-slate-900 rounded-3xl overflow-hidden min-h-[440px] relative shadow-lg">
                  <iframe
                    src={`https://meet.jit.si/${effectiveRoomName}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>

                {/* Right Column: Doctor Metadata */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-3xl flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full uppercase">
                          {language === "mr" ? "थेट व्हिडिओ चॅनेल" : language === "hi" ? "लाइव वीडियो चैनल" : "Live Tele-Consultation Channel"}
                        </span>
                      </div>
                      <strong className="text-slate-800 text-sm mt-2 block">{docName}</strong>
                      <span className="text-[10px] text-slate-500 block">{facilityName}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <strong className="text-slate-700 block">
                        {language === "mr" ? "सत्र माहिती" : language === "hi" ? "सत्र विवरण" : "Session Telemetry"}
                      </strong>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === "mr" ? "सुरक्षित रूम" : language === "hi" ? "सुरक्षित रूम" : "Secure Room"}</span>
                          <span className="font-semibold font-mono text-[10px] text-primary">{effectiveRoomName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === "mr" ? "चॅनेल स्थिती" : language === "hi" ? "चैनल स्थिति" : "Channel Status"}</span>
                          <span className="font-semibold text-green-600">
                            {language === "mr" ? "सक्रिय / सुरक्षित" : language === "hi" ? "सक्रिय / सुरक्षित" : "Active / Encrypted"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === "mr" ? "रुग्ण UHID" : language === "hi" ? "मरीज UHID" : "Patient UHID"}</span>
                          <span className="font-semibold text-slate-700">{user?.patientRefId || "JC-7F3K92"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      onClick={handleStartInstantEmergencyCall}
                      disabled={instantCalling}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer border-0 shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      {instantCalling ? <Loader2 size={13} className="animate-spin" /> : <Video size={13} />}
                      {language === "mr" ? "तातडीच्या डॉक्टरांना सूचना द्या" : language === "hi" ? "ड्यूटी पर डॉक्टर को अलर्ट करें" : "Alert On-Duty Doctor"}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("Dashboard");
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer border-0 shadow-xs shadow-red-100 transition-all"
                    >
                      {language === "mr" ? "व्हिडिओ रूममधून बाहेर पडा" : language === "hi" ? "वीडियो रूम से बाहर निकलें" : "Leave Video Room"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. PRESCRIPTIONS VIEW */}
      {activeTab === "Prescriptions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {language === "mr" ? "आपली औषधोपचार पत्रके" : language === "hi" ? "आपके प्रिस्क्रिप्शन" : "Your Prescriptions"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "mr"
                  ? "आपली डिजिटल जेनेरिक औषधोपचार पत्रके पहा आणि डाउनलोड करा."
                  : language === "hi"
                  ? "अपने डिजिटल जेनेरिक प्रिस्क्रिप्शन देखें और डाउनलोड करें।"
                  : "View and download your digital generic prescriptions."}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 border-b border-slate-200 pb-3 text-xs font-bold text-slate-500">
            <button
              onClick={() => setPrescriptionFilter("All")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "All" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              {language === "mr" ? "सर्व पत्रके" : language === "hi" ? "सभी प्रिस्क्रिप्शन" : "All Prescriptions"} ({displayPrescriptions.length})
            </button>
            <button
              onClick={() => setPrescriptionFilter("Active")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "Active" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              {language === "mr" ? "सक्रिय" : language === "hi" ? "सक्रिय" : "Active"}
            </button>
            <button
              onClick={() => setPrescriptionFilter("Completed")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "Completed" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              {language === "mr" ? "पूर्ण झाले" : language === "hi" ? "पूर्ण" : "Completed"}
            </button>
          </div>

          {displayPrescriptions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {displayPrescriptions.map((pres) => (
                <div key={pres._id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
                      <div>
                        <strong className="text-slate-800 text-sm block">{pres.doctorId?.name || "Dr. Aniruddha Kulkarni"}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {language === "mr" ? "तारीख:" : language === "hi" ? "दिनांक:" : "Date:"} {new Date(pres.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
                        {language === "mr" ? "✓ प्रमाणित Rx" : language === "hi" ? "✓ सत्यापित Rx" : "Verified Rx"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pres.medicines.map((med: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <div>
                            <strong className="block text-slate-800">{med.name} ({med.strength})</strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {med.dosage} — {med.durationDays} {language === "mr" ? "दिवस" : language === "hi" ? "दिन" : "Days"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 italic">
                            {med.instructions || (language === "mr" ? "जेवणानंतर" : language === "hi" ? "भोजन के बाद" : "After Food")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      onClick={() => handleDownloadPrescription(pres)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} /> {language === "mr" ? "PDF प्रिंट करा" : language === "hi" ? "प्रिंट PDF" : "Print PDF"}
                    </button>
                    <button
                      onClick={() => {
                        const firstMed = pres.medicines[0]?.name || "Metformin";
                        checkMedicineAvailability(firstMed);
                        setActiveTab("Medicines");
                      }}
                      className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-xl cursor-pointer border-0"
                    >
                      {language === "mr" ? "औषध साठा तपासा" : language === "hi" ? "दवा स्टॉक जांचें" : "Check Pharmacy Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full"><FileText size={32} /></div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                {language === "mr" ? "कोणतेही औषधोपचार पत्रक आढळले नाही" : language === "hi" ? "कोई प्रिस्क्रिप्शन नहीं मिला" : "No Prescriptions Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                {language === "mr"
                  ? "या ABHA रेकॉर्डशी जोडलेले कोणतेही पत्रक नाही. डॉक्टरांनी दिल्यानंतर ते येथे दिसेल."
                  : language === "hi"
                  ? "इस ABHA रिकॉर्ड से कोई प्रिस्क्रिप्शन नहीं जुड़ा है। जारी होने पर यहां दिखाई देगा।"
                  : "There are no digital prescriptions assigned to this ABHA ID record. They will appear here once issued by a practitioner."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. MEDICINE ORDERS VIEW */}
      {activeTab === "Medicine Orders" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "फार्मसी औषध आरक्षण व ऑर्डर्स" : language === "hi" ? "फार्मेसी दवा ऑर्डर / आरक्षण" : "Pharmacy Medicine Orders"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "आपल्या आरक्षित जेनेरिक औषधांचा मागोवा घ्या आणि व्यवस्थापित करा."
                : language === "hi"
                ? "अपने आरक्षित जेनेरिक दवाओं के पैकेज को ट्रैक और प्रबंधित करें।"
                : "Track and manage your reserved generic medicines package."}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: list of orders */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                  {language === "mr" ? "औषध आरक्षण यादी" : language === "hi" ? "दवा आरक्षण सूची" : "Medicine Reserves List"}
                </h3>
                
                {orderTrackingId ? (
                  <div className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm text-slate-800 block">{orderTrackingId}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {language === "mr" ? "आरोग्य केंद्र:" : language === "hi" ? "स्वास्थ्य केंद्र:" : "Facility:"} {selectedFacility || "Sinnar CHC"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{orderStatus}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500">
                        {language === "mr" ? "एकूण औषधे:" : language === "hi" ? "कुल दवाएं:" : "Total Medicines:"} <strong>2 Codes</strong>
                      </span>
                      <button
                        onClick={advanceOrderStatus}
                        className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        {language === "mr" ? "स्थिती पुढे ढकला (सिम्युलेशन)" : language === "hi" ? "स्थिति आगे बढ़ाएं (सिम्युलेशन)" : "Advance Simulation Status"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                    <Package size={28} className="text-slate-300" />
                    <span className="text-[11px] font-bold">
                      {language === "mr" ? "कोणतीही सक्रिय ऑर्डर नाही" : language === "hi" ? "कोई सक्रिय ऑर्डर नहीं" : "No active orders"}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {language === "mr" ? "साठा तपासून आरक्षित केल्यावर तपशील येथे दिसतील." : language === "hi" ? "स्टॉक आरक्षित करने पर ऑर्डर विवरण यहां दिखाई देंगे।" : "Order details will appear once you check availability and reserve stock."}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: order tracking timeline */}
            <div className="lg:col-span-6 border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                {language === "mr" ? "आरक्षण ट्रॅकिंग टाइमलाइन" : language === "hi" ? "आरक्षण ट्रैकिंग टाइमलाइन" : "Reserves Tracking Timeline"}
              </h3>

              {orderTrackingId ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 mt-4">
                  {[
                    { 
                      label: language === "mr" ? "विनंती सबमिट केली" : language === "hi" ? "अनुरोध सबमिट किया" : "Request Submitted", 
                      desc: language === "mr" ? "डिजिटल फार्मसी आरक्षण विनंती प्राप्त झाली." : language === "hi" ? "डिजिटल फार्मेसी आरक्षण अनुरोध प्राप्त हुआ।" : "Digital pharmacy reserve request received.", 
                      done: true 
                    },
                    { 
                      label: language === "mr" ? "केंद्राने पुष्टी केली" : language === "hi" ? "केंद्र द्वारा पुष्टि" : "Facility Confirmed", 
                      desc: language === "mr" ? `${selectedFacility || "PHC-01"} येथे साठा पडताळला.` : language === "hi" ? `${selectedFacility || "PHC-01"} पर स्टॉक सत्यापित हुआ।` : `Stock verified at ${selectedFacility || "PHC-01"}.`, 
                      done: true 
                    },
                    { 
                      label: language === "mr" ? "औषध तयार होत आहे" : language === "hi" ? "दवा तैयार की जा रही है" : "Preparing Medicine", 
                      desc: language === "mr" ? "जेनेरिक पॅकेज सॉर्ट करून बॅग केले." : language === "hi" ? "जेनेरिक पैकेज पैक किए गए।" : "Generic packages sorted and bagged.", 
                      done: orderStatus !== "Requested" 
                    },
                    { 
                      label: language === "mr" ? "काउंटरवर संकलनासाठी तयार" : language === "hi" ? "लेने के लिए तैयार" : "Ready for Collection", 
                      desc: language === "mr" ? "फार्मसी काउंटरवर रुग्णाची प्रतीक्षा." : language === "hi" ? "काउंटर पर मरीज के लेने की प्रतीक्षा।" : "Awaiting patient pickup at counter.", 
                      done: orderStatus === "Ready" || orderStatus === "Collected" 
                    },
                    { 
                      label: language === "mr" ? "औषध वितरित केले" : language === "hi" ? "दवा प्राप्त हुई" : "Collected", 
                      desc: language === "mr" ? "हस्तांतरित केले. व्यवहार सिंक झाला." : language === "hi" ? "दवा सौंप दी गई। सिंक पूर्ण।" : "Handed over. Transaction synchronized.", 
                      done: orderStatus === "Collected" 
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex gap-3 items-start text-xs">
                      <span className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                        step.done 
                          ? "bg-green-brand border-green-brand text-white" 
                          : "bg-white border-slate-300 text-slate-400"
                      }`}>
                        {step.done ? "✓" : idx + 1}
                      </span>
                      <div>
                        <strong className={`font-bold block ${step.done ? "text-green-800" : "text-slate-500"}`}>{step.label}</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                  <Clock size={28} className="text-slate-300" />
                  <span className="text-[11px] font-bold">
                    {language === "mr" ? "कोणतीही सक्रिय टाइमलाइन नाही" : language === "hi" ? "कोई सक्रिय टाइमलाइन नहीं" : "No active timeline"}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {language === "mr" ? "औषध आरक्षणानंतर ट्रॅकिंग सुरू होईल." : language === "hi" ? "दवा आरक्षण के बाद ट्रैकिंग शुरू होगी।" : "Order tracking timeline will activate after medicine dispatch."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. MEDICINE STOCKS & AVAILABILITY FINDER VIEW */}
      {activeTab === "Medicines" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {language === "mr" ? "फार्मसी औषध साठा उपलब्धता तपासणी" : language === "hi" ? "फार्मेसी दवा उपलब्धता चेकर" : "Pharmacy Availability Checker"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "mr"
                  ? "औषध साठा पातळी शोधा आणि जेनेरिक औषध पॅकेज आरक्षित करा."
                  : language === "hi"
                  ? "दवा स्टॉक स्तर खोजें और जेनेरिक दवा पैकेज आरक्षित करें।"
                  : "Locate stock levels and reserve generic medicine packages."}
              </p>
            </div>
            
            <div className="flex border border-slate-200 rounded-xl overflow-hidden text-xs font-bold bg-slate-50">
              <button
                onClick={() => setMapMode("Map")}
                className={`px-3 py-1.5 cursor-pointer transition-all border-0 ${mapMode === "Map" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500"}`}
              >
                {language === "mr" ? "नकाशा दृश्य" : language === "hi" ? "नक्शा दृश्य" : "Map View"}
              </button>
              <button
                onClick={() => setMapMode("List")}
                className={`px-3 py-1.5 cursor-pointer transition-all border-0 ${mapMode === "List" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500"}`}
              >
                {language === "mr" ? "यादी दृश्य" : language === "hi" ? "सूची दृश्य" : "List View"}
              </button>
            </div>
          </div>

          {selectedMedicineCheck && (
            <div className="bg-blue-50 border border-blue-150 p-4 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-700">
                  {language === "mr" ? "या औषधासाठी थेट साठा तपासत आहे: " : language === "hi" ? "इस दवा के लिए लाइव स्टॉक जांच: " : "Checking Live Availability for: "}
                </span>
                <strong className="text-primary font-extrabold">{selectedMedicineCheck}</strong>
              </div>
              <button
                onClick={() => {
                  setSelectedMedicineCheck("");
                  setRealStockAvailability([]);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg font-bold border-0 cursor-pointer text-[10px]"
              >
                {language === "mr" ? "रीसेट / सर्व दाखवा" : language === "hi" ? "रीसेट / सभी दिखाएं" : "Reset / Show All"}
              </button>
            </div>
          )}

          <div className="border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs space-y-4">
            {mapMode === "Map" ? (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl h-80 overflow-hidden relative">
                  <iframe
                    className="w-full h-full rounded-2xl border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(realStockAvailability.length > 0 ? realStockAvailability[0].coordinates.split(",")[1] : "74.0006") - 0.05).toFixed(4)}%2C${(Number(realStockAvailability.length > 0 ? realStockAvailability[0].coordinates.split(",")[0] : "19.8517") - 0.05).toFixed(4)}%2C${(Number(realStockAvailability.length > 0 ? realStockAvailability[0].coordinates.split(",")[1] : "74.0006") + 0.05).toFixed(4)}%2C${(Number(realStockAvailability.length > 0 ? realStockAvailability[0].coordinates.split(",")[0] : "19.8517") + 0.05).toFixed(4)}&layer=mapnik&marker=${realStockAvailability.length > 0 ? realStockAvailability[0].coordinates : "19.8517%2C74.0006"}`}
                    title="OSM Sinnar Map Grid"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md">
                    {selectedMedicineCheck ? "Matched Stock Coordinates" : "Sinnar District Pharmacy Network"}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {stockLoading ? (
                    <div className="col-span-full py-8 text-center text-slate-450 font-bold flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      {language === "mr" ? "जिल्हा औषधालय नेटवर्क तपासत आहे..." : language === "hi" ? "जिला फ़ार्मेसी नेटवर्क से संपर्क किया जा रहा है..." : "Querying district pharmacy networks..."}
                    </div>
                  ) : (realStockAvailability.length > 0 ? realStockAvailability : nearbyFacilities).map((fac, idx) => (
                    <div key={idx} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex flex-col justify-between gap-3">
                      <div>
                        <strong className="text-slate-800 text-[11px] block">{fac.name}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {language === "mr" ? "अंतर: " : language === "hi" ? "दूरी: " : "Distance: "}{fac.distance}
                        </span>
                        {selectedMedicineCheck && (
                          <div className="mt-2 space-y-0.5 font-bold">
                            <span className="text-[9px] text-slate-550 block">
                              {language === "mr" ? `उपलब्ध: ${fac.qty} युनिट्स` : language === "hi" ? `उपलब्ध: ${fac.qty} यूनिट्स` : `Available: ${fac.qty} units`}
                            </span>
                            <span className={`text-[9px] block ${
                              fac.MC2 === "Available" ? "text-green-700" : fac.MC2 === "Low" || fac.MC2 === "Low Stock" ? "text-amber-700" : "text-red-705"
                            }`}>
                              {language === "mr" ? "स्थिती: " : language === "hi" ? "स्थिति: " : "Status: "}{fac.MC2}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleReserveMedicine(fac.name, fac.medicineId)}
                        className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg cursor-pointer border-0"
                      >
                        {language === "mr" ? "औषध पॅकेज आरक्षित करा" : language === "hi" ? "दवा पैकेज आरक्षित करें" : "Reserve Package"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stockLoading ? (
                  <div className="py-8 text-center text-slate-450 font-bold flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    {language === "mr" ? "जिल्हा औषधालय नेटवर्क तपासत आहे..." : language === "hi" ? "जिला फ़ार्मेसी नेटवर्क से संपर्क किया जा रहा है..." : "Querying district pharmacy networks..."}
                  </div>
                ) : (realStockAvailability.length > 0 ? realStockAvailability : nearbyFacilities).map((fac, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-slate-100 p-4 rounded-2xl hover:bg-slate-50 transition-colors text-xs">
                    <div>
                      <strong className="text-slate-800 text-sm block">{fac.name}</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {language === "mr" ? "अंतर: " : language === "hi" ? "दूरी: " : "Distance: "}{fac.distance} | {language === "mr" ? "साठा अद्ययावत: " : language === "hi" ? "स्टॉक अपडेट: " : "Stock Updated: "}{fac.updated}
                      </span>
                      <div className="flex gap-2 mt-1.5">
                        {selectedMedicineCheck ? (
                          <span className="text-[9px] bg-blue-50 text-primary px-2 py-0.5 rounded-md font-bold">
                            {language === "mr" ? `प्रमाण: ${fac.qty} युनिट्स` : language === "hi" ? `मात्रा: ${fac.qty} यूनिट्स` : `Qty: ${fac.qty} units`}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">MC1 Code: {fac.MC1}</span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                          fac.MC2 === "Available" ? "bg-green-50 text-green-700" : fac.MC2 === "Low" || fac.MC2 === "Low Stock" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          {selectedMedicineCheck ? (language === "mr" ? "स्थिती: " : language === "hi" ? "स्थिति: " : "Status: ") : "MC2 Code: "}{fac.MC2}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleReserveMedicine(fac.name, fac.medicineId)}
                      className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer border-0"
                    >
                      {language === "mr" ? "औषधालयात आरक्षित करा" : language === "hi" ? "फ़ार्मेसी में आरक्षित करें" : "Reserve at Pharmacy"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. HEALTH RECORDS VIEW */}
      {activeTab === "Health Records" && (
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "तुमच्या ABDM आरोग्य नोंदी" : language === "hi" ? "आपके ABDM स्वास्थ्य रिकॉर्ड" : "Your ABDM Health Records"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "निदान अहवाल फाइल्स, मागील प्रिस्क्रिप्शन व्यवस्थापित करा आणि लॅब अहवाल अपलोड करा."
                : language === "hi"
                ? "डायग्नोस्टिक रिपोर्ट फाइलें, पिछले नुस्खे प्रबंधित करें और कस्टम लैब रिपोर्ट अपलोड करें।"
                : "Manage diagnostic report files, historical prescriptions, and upload custom lab reports."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Left Col: Upload Form */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4 text-left">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                {language === "mr" ? "लॅब अहवाल अपलोड करा" : language === "hi" ? "लैब रिपोर्ट अपलोड करें" : "Upload Lab Report"}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!uploadTitle || !uploadContent) {
                    alert(language === "mr" ? "कृपया सर्व माहिती भरा." : language === "hi" ? "कृपया सभी फ़ील्ड भरें।" : "Please fill in all fields.");
                    return;
                  }
                  setUploadLoading(true);
                  try {
                    const res = await fetch("/api/documents", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: uploadTitle,
                        type: uploadType,
                        fileContent: uploadContent,
                        fileUrl: uploadFile || undefined
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(language === "mr" ? "दस्तऐवज यशस्वीरित्या अपलोड केला गेला!" : language === "hi" ? "दस्तावेज़ सफलतापूर्वक अपलोड हो गया!" : "Document uploaded successfully!");
                      setUploadTitle("");
                      setUploadContent("");
                      setUploadFile(null);
                      setUploadFileName("");
                      // Re-fetch documents
                      const docRes = await fetch("/api/documents");
                      const docData = await docRes.json();
                      if (docData.success) {
                        setDocuments(docData.documents);
                      }
                    } else {
                      alert("Failed to upload: " + data.error);
                    }
                  } catch (err: any) {
                    alert("Error: " + err.message);
                  } finally {
                    setUploadLoading(false);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {language === "mr" ? "दस्तऐवज शीर्षक" : language === "hi" ? "दस्तावेज़ शीर्षक" : "Document Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={language === "mr" ? "उदा. रक्त शर्करा चाचणी, छातीचा एक्स-रे" : language === "hi" ? "उदा. ब्लड शुगर रिपोर्ट, चेस्ट एक्स-रे" : "e.g. Blood Sugar Report, Chest X-Ray Notes"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {language === "mr" ? "दस्तऐवज प्रकार" : language === "hi" ? "दस्तावेज़ प्रकार" : "Document Type"}
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="LabReport">
                      {language === "mr" ? "प्रयोगशाळा निदान (लॅब अहवाल)" : language === "hi" ? "प्रयोगशाला निदान (लैब रिपोर्ट)" : "Laboratory Diagnostics (Lab Report)"}
                    </option>
                    <option value="DischargeSummary">
                      {language === "mr" ? "डिस्चार्ज सारांश" : language === "hi" ? "डिस्चार्ज सारांश" : "Discharge Summary"}
                    </option>
                    <option value="Other">
                      {language === "mr" ? "इतर वैद्यकीय दस्तऐवज" : language === "hi" ? "अन्य नैदानिक दस्तावेज़" : "Other Clinical Document"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {language === "mr" ? "अहवाल तपशील / वैद्यकीय नोंदी" : language === "hi" ? "रिपोर्ट डेटा / क्लिनिकल नोट्स" : "Report Data / Clinical Notes"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                    placeholder={language === "mr" ? "येथे चाचणी मूल्ये, साखर वाचन किंवा डॉक्टरांच्या सारांश सूचना प्रविष्ट करा..." : language === "hi" ? "यहाँ परीक्षण मान, शुगर रीडिंग या डॉक्टर के निर्देश दर्ज करें..." : "Enter diagnostic values, sugar readings, or doctor's summary instructions here..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {language === "mr" ? "स्कॅन केलेले दस्तऐवज जोडा (पर्यायी PDF/फोटो)" : language === "hi" ? "स्कैन किया गया दस्तावेज़ संलग्न करें (वैकल्पिक PDF/इमेज)" : "Attach Scanned Document (Optional PDF/Image)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFileName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadFile(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer"
                  />
                  {uploadFileName && (
                    <span className="text-[10px] text-green-600 font-bold mt-1 block">📎 Attached: {uploadFileName}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl cursor-pointer border-0 mt-2 flex items-center justify-center gap-1.5"
                >
                  {uploadLoading
                    ? (language === "mr" ? "अपलोड करत आहे..." : language === "hi" ? "अपलोड हो रहा है..." : "Uploading...")
                    : (language === "mr" ? "आरोग्य लॉकरमध्ये जतन करा" : language === "hi" ? "हेल्थ लॉकर में सुरक्षित करें" : "Save to Health Locker")}
                </button>
              </form>
            </div>

            {/* Right Col: Documents Locker & Prescription History */}
            <div className="md:col-span-2 space-y-6 text-left">
              {/* Document Locker */}
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                  {language === "mr" ? "क्लिनिकल दस्तऐवज लॉकर" : language === "hi" ? "क्लिनिकल दस्तावेज़ लॉकर" : "Clinical Documents Locker"}
                </h3>
                
                <div className="space-y-3 text-xs">
                  {/* Default Static Documents using our real print function */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="flex gap-3 items-start">
                      <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><FileSpreadsheet size={16} /></div>
                      <div>
                        <strong className="text-slate-800 block text-[13px]">
                          {language === "mr" ? "आशा सेविका प्राथमिक आरोग्य तपासणी" : language === "hi" ? "आशा कार्यकर्ता प्राथमिक स्वास्थ्य जांच" : "ASHA Vitals Baseline Intake"}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {language === "mr" ? "स्रोत: शारदा पाटील (आशा) | स्थिती: सत्यापित" : language === "hi" ? "स्रोत: शारदा पाटिल (आशा) | स्थिति: सत्यापित" : "Source: Sharda Patil (ASHA) | Status: Verified"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadClinicalDocument({
                        title: "ASHA Vitals Baseline Intake",
                        type: "LabReport",
                        fileContent: `Baseline Checkup Intake Details:\n\nTemperature: 98.4 F\nBlood Pressure: 120/80 mmHg\nHeart Rate: 72 bpm\nSpO2: 99%\nRespiratory Rate: 16/min\n\nPatient reports general fitness. Triage status: ROUTINE.`
                      })}
                      className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      {language === "mr" ? "PDF डाउनलोड करा" : language === "hi" ? "PDF डाउनलोड करें" : "Download PDF"}
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="flex gap-3 items-start">
                      <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><FileSpreadsheet size={16} /></div>
                      <div>
                        <strong className="text-slate-800 block text-[13px]">
                          {language === "mr" ? "समुदाय लॅब निदान (CBC रक्त तपासणी)" : language === "hi" ? "सामुदायिक लैब निदान (CBC रक्त परीक्षण)" : "Community Lab Diagnostics (CBC)"}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {language === "mr" ? "स्रोत: डॉ. कुलकर्णी | स्थिती: सत्यापित" : language === "hi" ? "स्रोत: डॉ. कुलकर्णी | स्थिति: सत्यापित" : "Source: Dr. Kulkarni | Status: Verified"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadClinicalDocument({
                        title: "Community Lab Diagnostics (CBC)",
                        type: "LabReport",
                        fileContent: `Complete Blood Count (CBC) Results:\n\nHemoglobin: 14.2 g/dL (Normal)\nWhite Blood Cells: 6,500 /mcL (Normal)\nPlatelets: 250,000 /mcL (Normal)\nRed Blood Cells: 4.8 million/mcL (Normal)\n\nOverall diagnostic status: Normal. No indications of acute anemia or infection.`
                      })}
                      className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      {language === "mr" ? "PDF डाउनलोड करा" : language === "hi" ? "PDF डाउनलोड करें" : "Download PDF"}
                    </button>
                  </div>

                  {/* Dynamically uploaded documents */}
                  {documents.map((doc) => (
                    <div key={doc._id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><FileSpreadsheet size={16} /></div>
                        <div>
                          <strong className="text-slate-800 block text-[13px]">{doc.title}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {language === "mr" ? "तारीख: " : language === "hi" ? "तारीख: " : "Date: "}{new Date(doc.createdAt).toLocaleDateString()} | {language === "mr" ? "प्रकार: " : language === "hi" ? "प्रकार: " : "Type: "}{doc.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadClinicalDocument(doc)}
                        className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        {language === "mr" ? "PDF डाउनलोड करा" : language === "hi" ? "PDF डाउनलोड करें" : "Download PDF"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription Medicine History */}
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                  {language === "mr" ? "प्रिस्क्रिप्शन आणि औषधोपचार इतिहास" : language === "hi" ? "प्रिस्क्रिप्शन और दवा का इतिहास" : "Prescription & Medication History"}
                </h3>
                
                {prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.map((pres) => (
                      <div key={pres._id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 block">
                              {language === "mr" ? "डॉक्टरांचे प्रिस्क्रिप्शन: " : language === "hi" ? "द्वारा निर्धारित: " : "Prescribed by "}{pres.doctorId?.name || "Medical Officer"}
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {language === "mr" ? "तारीख: " : language === "hi" ? "तारीख: " : "Date: "}{new Date(pres.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownloadPrescription(pres)}
                            className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                          >
                            {language === "mr" ? "Rx PDF प्रिंट करा" : language === "hi" ? "Rx PDF प्रिंट करें" : "Print Rx PDF"}
                          </button>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                            {language === "mr" ? "दिलेली औषधे:" : language === "hi" ? "दी गई दवाएं:" : "Medicines Taken:"}
                          </span>
                          {pres.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="text-slate-700 bg-white border border-slate-100 px-3 py-1.5 rounded-lg flex justify-between items-center">
                              <strong>{med.name} ({med.strength})</strong>
                              <span className="text-slate-500 font-semibold">
                                {med.dosage} • {med.durationDays} {language === "mr" ? "दिवस" : language === "hi" ? "दिन" : "Days"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">
                    {language === "mr" ? "कोणताही औषधोपचार इतिहास नोंदवलेला नाही." : language === "hi" ? "कोई दवा इतिहास दर्ज नहीं है।" : "No medication history recorded."}
                  </div>
                )}
              </div>

              {/* Past Consultation Summary Reports */}
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                  {language === "mr" ? "मागील सल्लामसलत अहवाल (PDFs)" : language === "hi" ? "पिछली परामर्श रिपोर्ट (PDFs)" : "Past Consultation Reports (Old PDFs)"}
                </h3>
                
                {consultations.length > 0 ? (
                  <div className="space-y-3">
                    {consultations.map((c) => (
                      <div key={c._id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <div>
                            <strong className="text-slate-800 block">
                              {language === "mr" ? "बाह्यरुग्ण केस शीट (OPD)" : language === "hi" ? "ओपीडी केस शीट (OPD)" : "Outpatient Case Sheet (OPD)"}
                            </strong>
                            <span className="text-[10px] text-slate-450 block mt-0.5">
                              {language === "mr" ? "सल्लागार: " : language === "hi" ? "परामर्शदाता: " : "Consultant: "}{c.doctorId?.name || "Medical Specialist"} | {language === "mr" ? "तारीख: " : language === "hi" ? "तारीख: " : "Date: "}{new Date(c.createdAt || c.consultationDate).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownloadConsultationReport(c)}
                            className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                          >
                            {language === "mr" ? "सारांश PDF डाउनलोड करा" : language === "hi" ? "सारांश PDF डाउनलोड करें" : "Download Summary PDF"}
                          </button>
                        </div>
                        <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                            {language === "mr" ? "नोंदवलेले निदान:" : language === "hi" ? "दर्ज किया गया निदान:" : "Recorded Diagnosis:"}
                          </span>
                          <span className="text-slate-800 font-semibold text-[11px] block mt-0.5">{c.diagnosis || "General Health Review"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">
                    {language === "mr" ? "कोणतीही जुनी केस फाईल नोंदवलेली नाही." : language === "hi" ? "कोई पुराना केस रिकॉर्ड दर्ज नहीं है।" : "No old consultation case files recorded."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. CARE TIMELINE VIEW */}
      {activeTab === "Care Timeline" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {language === "mr" ? "तुमची संपूर्ण आरोग्य सेवा टाइमलाइन" : language === "hi" ? "आपकी संपूर्ण स्वास्थ्य सेवा टाइमलाइन" : "Your Complete Care Timeline"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "mr"
                  ? "लक्षण नोंदणी, ट्रायज वर्गीकरण, प्रिस्क्रिप्शन आणि फॉलो-अपची संपूर्ण नोंद."
                  : language === "hi"
                  ? "लक्षण पंजीकरण, ट्राइएज वर्गीकरण, नुस्खे और फॉलो-अप का पूरा विवरण।"
                  : "A visual step-by-step log of symptoms intake, triage routing, prescriptions, and followups."}
              </p>
            </div>
            
            <button
              onClick={handleDownloadTimelineReport}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Download size={14} /> {language === "mr" ? "टाइमलाइन PDF डाउनलोड करा" : language === "hi" ? "टाइमलाइन PDF डाउनलोड करें" : "Download Timeline PDF"}
            </button>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex gap-4 items-start text-xs">
                  <span className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                    step.completed
                      ? "bg-green-brand border-green-brand text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}>
                    {step.completed ? "✓" : idx + 1}
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">{step.date}</span>
                    <strong className={`font-bold block mt-0.5 ${step.completed ? "text-green-800" : "text-slate-500"}`}>{step.label}</strong>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1 max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. REFERRALS VIEW */}
      {activeTab === "Referrals" && (
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "डॉक्टरांच्या प्रत्यक्ष भेटी (ऑफलाइन तपासणी)" : language === "hi" ? "डॉक्टर से व्यक्तिगत मुलाकात (ऑफलाइन परामर्श)" : "Doctor In-Person Visits (Offline Consultations)"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "ऑनलाइन ट्रायजनंतर डॉक्टरांनी दिलेल्या थेट हॉस्पिटल भेटींचे तपशील पहा."
                : language === "hi"
                ? "ऑनलाइन ट्राइएज के बाद डॉक्टरों द्वारा निर्धारित अस्पताल दौरों का विवरण देखें।"
                : "View details of scheduled offline consultations ordered by physicians after online triage."}
            </p>
          </div>
          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              {language === "mr" ? "नियोजित डॉक्टर भेटींचे आदेश" : language === "hi" ? "निर्धारित डॉक्टर विज़िट आदेश" : "Scheduled Doctor Visit Orders"}
            </h3>

            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref._id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3 text-xs leading-relaxed max-w-2xl">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        ref.status === "Completed" ? "bg-green-50 text-green-700 border border-green-150" : "bg-blue-50 text-primary border border-blue-150 animate-pulse"
                      }`}>
                        {ref.status === "Created"
                          ? (language === "mr" ? "OPD तपासणी नोंदवली" : language === "hi" ? "ओपीडी परामर्श बुक किया गया" : "OPD Consultation Booked")
                          : ref.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {language === "mr" ? "नोंदणी तारीख: " : language === "hi" ? "दर्ज तिथि: " : "Logged: "}{new Date(ref.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-slate-700 bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {language === "mr" ? "भेट द्यायचे आरोग्य केंद्र" : language === "hi" ? "दौरे के लिए स्वास्थ्य केंद्र" : "Health Facility to Visit"}
                        </span>
                        <strong className="text-slate-800 text-sm">{ref.destinationFacilityId?.name || (language === "mr" ? "नाशिक जिल्हा सामान्य रुग्णालय" : language === "hi" ? "नासिक जिला नागरिक अस्पताल" : "Nashik District Civil Hospital")}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {language === "mr" ? "प्रकार: " : language === "hi" ? "प्रकार: " : "Type: "}{ref.destinationFacilityId?.type || (language === "mr" ? "जिल्हा रुग्णालय" : language === "hi" ? "जिला अस्पताल" : "District Hospital")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {language === "mr" ? "सल्ला देणारे ऑनलाइन डॉक्टर" : language === "hi" ? "परामर्शदाता ऑनलाइन डॉक्टर" : "Referring Online Doctor"}
                        </span>
                        <strong className="text-slate-800 text-sm">{ref.referringDoctorId?.name || "Dr. Aniruddha Kulkarni"}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {language === "mr" ? "पद: वैद्यकीय अधिकारी" : language === "hi" ? "पद: चिकित्सा अधिकारी" : "Role: General Medical Officer"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#F8FAFC] p-4.5 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {language === "mr" ? "📅 नियोजित भेटीची तारीख आणि वेळ" : language === "hi" ? "📅 निर्धारित मुलाकात की तारीख और समय" : "📅 Scheduled Appointment Date & Time"}
                        </span>
                        <strong className="text-primary text-xs font-mono">
                          {ref.appointmentDate
                            ? new Date(ref.appointmentDate).toLocaleString()
                            : ref.followUpDate
                            ? new Date(ref.followUpDate).toLocaleString()
                            : (language === "mr"
                              ? "कृपया OPD वेळेत भेट द्या (सकाळी ९ ते दुपारी २)"
                              : language === "hi"
                              ? "कृपया ओपीडी समय के दौरान पधारें (सुबह 9 से दोपहर 2 बजे)"
                              : "Please visit OPD during consultation hours (9 AM - 2 PM)")}
                        </strong>
                      </div>
                      <div className="border-t border-slate-200/60 pt-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {language === "mr" ? "प्रत्यक्ष तपासणीचे वैद्यकीय कारण" : language === "hi" ? "व्यक्तिगत जांच का नैदानिक कारण" : "Clinical Reason for In-Person Check"}
                        </span>
                        <p className="text-slate-700 text-xs font-semibold mt-0.5">{ref.reason}</p>
                      </div>
                      {ref.instructions && (
                        <div className="border-t border-slate-200/60 pt-2">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            {language === "mr" ? "रुग्णासाठी सूचना" : language === "hi" ? "मरीज के लिए निर्देश" : "Patient Instructions"}
                          </span>
                          <p className="text-slate-550 italic text-[11px] mt-0.5">{ref.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                <Share2 size={28} className="text-slate-350" />
                <span className="text-[11px] font-bold">
                  {language === "mr" ? "कोणतेही रेफरल जारी केलेले नाही" : language === "hi" ? "कोई रेफरल जारी नहीं किया गया" : "No referrals issued"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === "mr"
                    ? "डॉक्टरांच्या सल्ल्यादरम्यान दिलेले रेफरल येथे दिसतील."
                    : language === "hi"
                    ? "डॉक्टर के परामर्श के दौरान जारी किए गए रेफरल यहाँ दिखाई देंगे।"
                    : "Referrals issued during your doctor consult will appear here."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. FOLLOW-UPS VIEW */}
      {activeTab === "Follow-ups" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "आशा सेविका गृहभेट फॉलो-अप" : language === "hi" ? "आशा कार्यकर्ता गृह भेंट फॉलो-अप" : "ASHA Home Visit Follow-ups"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "नियोजित गृहभेटी आणि आरोग्य तपासणीचे तपशील पहा."
                : language === "hi"
                ? "निर्धारित गृह विज़िट और स्वास्थ्य निगरानी का विवरण देखें।"
                : "Locate scheduled compliance checks and vitals monitoring details."}
            </p>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              {language === "mr" ? "गृहभेट तपासणी यादी" : language === "hi" ? "गृह भेंट चेकलिस्ट" : "Home Visit Checklist"}
            </h3>
            
            {followups.length > 0 ? (
              <div className="space-y-4">
                {followups.map((follow) => (
                  <div key={follow._id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3 text-xs max-w-md">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>{language === "mr" ? "नियुक्त आरोग्य सेविका" : language === "hi" ? "नियुक्त स्वास्थ्य कार्यकर्ता" : "Assigned Community Worker"}</span>
                      <strong className="text-slate-800">{follow.assignedWorkerId?.name || "Sharda Patil"} ({follow.assignedWorkerId?.role || "ASHA"})</strong>
                    </div>
                    <div className="border-t border-slate-200/60 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider">
                          {language === "mr" ? "फॉलो-अप कार्य" : language === "hi" ? "फॉलो-अप कार्य" : "Follow-up Task"}
                        </span>
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase">{follow.status}</span>
                      </div>
                      <p className="text-slate-600 mt-1 font-semibold">
                        {language === "mr" ? "कारण: " : language === "hi" ? "कारण: " : "Reason: "}{follow.reason}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === "mr" ? "अंतिम तारीख: " : language === "hi" ? "नियत तारीख: " : "Due Date: "}{new Date(follow.dueDate).toLocaleDateString()}
                      </p>
                      {follow.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">
                          {language === "mr" ? "नोंदी: " : language === "hi" ? "टिप्पणियां: " : "Notes: "}{follow.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                <RotateCcw size={28} className="text-slate-350" />
                <span className="text-[11px] font-bold">
                  {language === "mr" ? "कोणतेही फॉलो-अप नियोजित नाही" : language === "hi" ? "कोई फॉलो-अप निर्धारित नहीं है" : "No follow-ups scheduled"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === "mr"
                    ? "डॉक्टरांच्या तपासणीनंतर आशा सेविका गृहभेटी येथे दिसतील."
                    : language === "hi"
                    ? "डॉक्टर परामर्श के बाद आशा कार्यकर्ता गृह विज़िट यहाँ दिखाई देंगी।"
                    : "ASHA checks will map dynamically after clinical consultation completes."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11.5 CONSENT MANAGER VIEW */}
      {activeTab === "Consent Manager" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-left">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {language === "mr" ? "ABDM डिजिटल संमती व्यवस्थापक" : language === "hi" ? "ABDM डिजिटल सहमति प्रबंधक" : "ABDM Digital Consent Manager"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "mr"
                  ? "तुमच्या इलेक्ट्रॉनिक आरोग्य नोंदींचा प्रवेश अधिकृत करा किंवा मागे घ्या."
                  : language === "hi"
                  ? "अपने इलेक्ट्रॉनिक स्वास्थ्य रिकॉर्ड तक पहुंच को अधिकृत या निरस्त करें।"
                  : "Authorize or revoke access permission to your electronic health records."}
              </p>
            </div>
            
            <button
              onClick={async () => {
                const promptMsg = language === "mr" ? "डेटा शेअरिंगचा उद्देश प्रविष्ट करा:" : language === "hi" ? "डेटा शेयरिंग का उद्देश्य दर्ज करें:" : "Enter purpose for data sharing:";
                const defaultMsg = language === "mr" ? "नियमित वैद्यकीय तपासणी" : language === "hi" ? "नियमित क्लिनिकल समीक्षा" : "Routine clinical review";
                const purpose = prompt(promptMsg, defaultMsg);
                if (!purpose) return;
                try {
                  const res = await fetch("/api/consent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      purpose,
                      expiryDays: 14
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(language === "mr" ? "संमती यशस्वीरित्या मंजूर केली!" : language === "hi" ? "सहमति सफलतापूर्वक दी गई!" : "Consent successfully granted!");
                    // Re-fetch consents
                    const consentRes = await fetch("/api/consent");
                    const consentData = await consentRes.json();
                    if (consentData.success) {
                      setConsents(consentData.consents);
                    }
                  } else {
                    alert("Failed to grant consent: " + data.error);
                  }
                } catch (e: any) {
                  alert("Error: " + e.message);
                }
              }}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer border-0 shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {language === "mr" ? "+ प्रवेश संमती द्या" : language === "hi" ? "+ डेटा एक्सेस सहमति दें" : "+ Grant Access Consent"}
            </button>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              {language === "mr" ? "सक्रिय डेटा-सामायिकरण परवानग्या" : language === "hi" ? "सक्रिय डेटा-शेयरिंग अनुमतियाँ" : "Active Data-Sharing Permits"}
            </h3>
            
            {consents.length > 0 ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">{language === "mr" ? "अधिकृत प्राप्तकर्ता" : language === "hi" ? "अधिकृत प्राप्तकर्ता" : "Authorized Recipient"}</th>
                      <th className="py-2.5 px-4">{language === "mr" ? "उद्देश" : language === "hi" ? "उद्देश्य" : "Purpose"}</th>
                      <th className="py-2.5 px-4">{language === "mr" ? "कालबाह्यता तारीख" : language === "hi" ? "समाप्ति तिथि" : "Expiry Date"}</th>
                      <th className="py-2.5 px-4 text-center">{language === "mr" ? "स्थिती" : language === "hi" ? "स्थिति" : "Status"}</th>
                      <th className="py-2.5 px-4 text-center">{language === "mr" ? "कृती" : language === "hi" ? "कार्रवाई" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consents.map((consent) => (
                      <tr key={consent._id} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {consent.grantedToDoctorId?.name || consent.grantedToFacilityId?.name || (language === "mr" ? "सामान्य चिकित्सक (नाशिक नेटवर्क)" : language === "hi" ? "सामान्य चिकित्सक (नासिक नेटवर्क)" : "General Practitioner (Nashik Network)")}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{consent.purpose}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{new Date(consent.expiryDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            consent.status === "Active" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700"
                          }`}>
                            {consent.status === "Active" ? (language === "mr" ? "सक्रिय" : language === "hi" ? "सक्रिय" : "Active") : consent.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {consent.status === "Active" && (
                            <button
                              onClick={async () => {
                                if (!confirm(language === "mr" ? "तुम्हाला खात्री आहे की तुम्ही ही संमती मागे घेऊ इच्छिता?" : language === "hi" ? "क्या आप वाकई इस सहमति को वापस लेना चाहते हैं?" : "Are you sure you want to withdraw this access consent?")) return;
                                try {
                                  const res = await fetch("/api/consent", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ consentId: consent._id, status: "Withdrawn" })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert(language === "mr" ? "संमती यशस्वीरित्या मागे घेतली गेली." : language === "hi" ? "सहमति सफलतापूर्वक वापस ले ली गई।" : "Consent successfully withdrawn.");
                                    // Re-fetch consents
                                    const consentRes = await fetch("/api/consent");
                                    const consentData = await consentRes.json();
                                    if (consentData.success) {
                                      setConsents(consentData.consents);
                                    }
                                  }
                                } catch (e: any) {
                                  alert("Error: " + e.message);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 font-bold border-0 bg-transparent cursor-pointer text-xs"
                            >
                              {language === "mr" ? "मागे घ्या" : language === "hi" ? "वापस लें" : "Withdraw"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                <Shield size={28} className="text-slate-350" />
                <span className="text-[11px] font-bold">
                  {language === "mr" ? "कोणतीही डेटा परवानगी सक्रिय नाही" : language === "hi" ? "कोई डेटा अनुमति सक्रिय नहीं है" : "No data permits active"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === "mr"
                    ? "सर्व डेटा देवाणघेवाण ब्लॉक आहे. डॉक्टरांना वैद्यकीय इतिहास पाहण्याची परवानगी देण्यासाठी संमती द्या."
                    : language === "hi"
                    ? "सभी डेटा स्थानांतरण अवरुद्ध हैं। चिकित्सकों को अपना क्लिनिकल इतिहास देखने की अनुमति देने के लिए सहमति दें।"
                    : "All data transfers are blocked. Grant consent to allow practitioners to access your clinical history."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12. JANCARE GEMINI ASSISTANT CHATBOT */}
      {activeTab === "JanCare Assistant" && (
        <div className="h-[600px] bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs flex flex-col">
          <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <strong className="text-sm font-extrabold">
                {language === "mr" ? "जेमिनी क्लिनिकल निर्णय समर्थन सहाय्यक" : language === "hi" ? "जेमिनी क्लिनिकल निर्णय समर्थन सहायक" : "Gemini Clinical Decision Support Agent"}
              </strong>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {language === "mr" ? "थेट एआय सहाय्यक" : language === "hi" ? "लाइव एआई सहायक" : "REAL-TIME CO-PILOT"}
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AIAgentChatbot inline userName={user?.name} />
          </div>
        </div>
      )}

      {/* 13. SETTINGS VIEW */}
      {activeTab === "Settings" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === "mr" ? "पोर्टल सेटिंग्ज" : language === "hi" ? "पोर्टल सेटिंग्स" : "Portal Settings"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "mr"
                ? "भाषा आणि सूचना सेटिंग्ज कॉन्फिगर करा."
                : language === "hi"
                ? "भाषा और अधिसूचना सेटिंग्स कॉन्फ़िगर करें।"
                : "Configure accessibility, notifications, and language defaults."}
            </p>
          </div>

          <div className="max-w-md space-y-5 text-xs text-slate-700">
            <div className="space-y-2">
              <strong className="block text-slate-800 text-[13px]">
                {language === "mr" ? "प्राधान्य दिलेली ॲप्लिकेशन भाषा" : language === "hi" ? "पसंदीदा एप्लिकेशन भाषा" : "Preferred Application Language"}
              </strong>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`py-2 px-3 rounded-xl font-bold cursor-pointer border ${language === "en" ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`py-2 px-3 rounded-xl font-bold cursor-pointer border ${language === "hi" ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage("mr")}
                  className={`py-2 px-3 rounded-xl font-bold cursor-pointer border ${language === "mr" ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <strong className="block text-slate-800 text-[13px]">
                {language === "mr" ? "सूचना (Notifications) सेटअप" : language === "hi" ? "सूचनाएं (Notifications) सेटअप" : "Notifications Setup"}
              </strong>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-sm border-slate-300 text-primary h-4 w-4" />
                  <span>
                    {language === "mr"
                      ? "आशा सेविकेच्या गृहभेटीसाठी SMS स्मरणपत्रे मिळवा"
                      : language === "hi"
                      ? "आशा कार्यकर्ता की गृह भेंट के लिए SMS रिमाइंडर प्राप्त करें"
                      : "Receive SMS reminders for scheduled ASHA home visits"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-sm border-slate-300 text-primary h-4 w-4" />
                  <span>
                    {language === "mr"
                      ? "जेनेरिक औषध ऑर्डरची स्थिती बदलल्यावर सूचना द्या"
                      : language === "hi"
                      ? "जेनेरिक दवा ऑर्डर की स्थिति बदलने पर अलर्ट प्राप्त करें"
                      : "Alert me when generic pharmacy orders change status"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABHA ID LINK MODAL */}
      {showAbhaModal && (
        <div className="fixed inset-0 bg-black/50 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                {language === "mr" ? "ABHA खाते आयडी जोडा" : language === "hi" ? "ABHA खाता आईडी लिंक करें" : "Link ABHA Account ID"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === "mr" ? "तुमचा 14 अंकी राष्ट्रीय आरोग्य आयडी प्रविष्ट करा" : language === "hi" ? "अपना 14 अंकों का राष्ट्रीय स्वास्थ्य आईडी दर्ज करें" : "Enter your 14-digit national health ID"}
              </p>
            </div>
            <form onSubmit={handleLinkAbha} className="space-y-4">
              <input
                type="text"
                required
                value={abhaNumberInput}
                onChange={(e) => setAbhaNumberInput(e.target.value)}
                placeholder="12-3456-7890-1234"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all text-slate-800 font-semibold"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAbhaModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer bg-white text-slate-700 font-bold"
                >
                  {language === "mr" ? "रद्द करा" : language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={linkingLoading}
                  className="bg-primary hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg cursor-pointer border-0"
                >
                  {linkingLoading
                    ? (language === "mr" ? "जोडत आहे..." : language === "hi" ? "लिंक हो रहा है..." : "Linking...")
                    : (language === "mr" ? "ABHA जोडा" : language === "hi" ? "ABHA लिंक करें" : "Link ABHA")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
