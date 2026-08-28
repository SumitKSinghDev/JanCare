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
  Share2,
  ShoppingBag
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

    const handleRefresh = () => {
      fetchPatientData();
    };
    window.addEventListener("jancare_appointment_booked", handleRefresh);
    return () => window.removeEventListener("jancare_appointment_booked", handleRefresh);
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

  // Handle real slot booking and appointment scheduling
  async function handleBookAppointment(slotTime: string) {
    if (!user || !user.patientId) {
      alert("Error: No patient profile linked to this user session. Please ensure your ABHA ID or mobile registration details are complete.");
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.patientId,
          appointmentDate: new Date(), // Today
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Slot ${slotTime} successfully booked! Your appointment is scheduled and consultation room created.`);
        fetchPatientData(); // Refresh patient dashboard data
      } else {
        alert("Failed to book slot: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to book slot: " + err.message);
    }
  }

  // Handle real medicine reservation in database
  async function handleReserveMedicine(facilityName: string, medicineId?: string) {
    const pId = user?.patientId || "guest";
    setSelectedFacility(facilityName);
    setOrderStatus("Requested");

    if (medicineId) {
      try {
        const res = await fetch("/api/medicines/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineId })
        });
        const data = await res.json();
        if (data.success) {
          const trackingId = data.trackingId;
          setOrderTrackingId(trackingId);
          localStorage.setItem(`jc_active_order_id_${pId}`, trackingId);
          localStorage.setItem(`jc_active_order_status_${pId}`, "Requested");
          localStorage.setItem(`jc_active_order_facility_${pId}`, facilityName);
          alert(`Medicines successfully reserved at ${facilityName}! Tracking ID: ${trackingId} generated.`);
          
          if (selectedMedicineCheck) {
            checkMedicineAvailability(selectedMedicineCheck);
          }
          setActiveTab("Medicine Orders");
        } else {
          alert("Failed to reserve medicine: " + data.error);
        }
      } catch (err: any) {
        alert("Error reserving medicine: " + err.message);
      }
    } else {
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
    const patientName = user?.name || "Ramesh Kumar";
    const patientId = user?.patientRefId || "JC-R-0283";
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
    if (!latestConsult) {
      return [
        { label: "Symptoms", status: "Upcoming" },
        { label: "AI Triage", status: "Upcoming" },
        { label: "Doctor", status: "Upcoming" },
        { label: "Medicine", status: "Upcoming" },
        { label: "Referral", status: "Upcoming" },
        { label: "Follow-up", status: "Upcoming" },
        { label: "Complete Care", status: "Upcoming" }
      ];
    }
    
    const isScheduled = latestConsult.status === "Scheduled" || latestConsult.status === "Active";
    const isCompleted = latestConsult.status === "Completed";
    const hasPrescription = prescriptions.length > 0;
    const hasOrder = !!orderTrackingId;

    return [
      { label: "Symptoms", status: "Completed" },
      { label: "AI Triage", status: "Completed" },
      { label: "Doctor", status: isCompleted ? "Completed" : isScheduled ? "In Progress" : "Upcoming" },
      { label: "Medicine", status: hasOrder ? "Completed" : hasPrescription ? "In Progress" : "Upcoming" },
      { label: "Referral", status: orderStatus === "Collected" ? "Completed" : "Upcoming" },
      { label: "Follow-up", status: "Upcoming" },
      { label: "Complete Care", status: isCompleted && hasPrescription ? "In Progress" : "Upcoming" }
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
      label: "Patient Registered",
      desc: `Profile created successfully with Ref ID: ${user?.patientRefId || "JC-NEW"}`,
      date: regDateStr,
      completed: true
    });

    if (consultations.length === 0) {
      steps.push({
        label: "Await Appointment Booking",
        desc: "Please select an available slot under Next Appointment to schedule a clinical consultation.",
        date: "Pending Action",
        completed: false
      });
      steps.push({
        label: "Doctor Consultation",
        desc: "Real-time WebRTC teleconsultation call.",
        date: "Upcoming",
        completed: false
      });
      steps.push({
        label: "Prescription & Pharmacy Dispatch",
        desc: "Receive medicines from the closest rural pharmacy.",
        date: "Upcoming",
        completed: false
      });
    } else {
      const activeCons = consultations.find(c => c.status === "Scheduled" || c.status === "Active");
      const completedCons = consultations.find(c => c.status === "Completed");

      steps.push({
        label: "Symptoms & AI Triage Intake",
        desc: activeCons?.healthRecordId?.triage?.reason || "Intake assessment complete. Priority index logged.",
        date: new Date(consultations[consultations.length - 1].createdAt).toLocaleDateString(),
        completed: true
      });

      steps.push({
        label: "Doctor Consultation Room",
        desc: completedCons 
          ? "Teleconsultation call successfully finished with Dr. Aniruddha Kulkarni." 
          : "WebRTC consultation room is active. Click Join Consultation to enter.",
        date: completedCons 
          ? new Date(completedCons.updatedAt).toLocaleDateString() 
          : "Active Now",
        completed: !!completedCons
      });

      steps.push({
        label: "Prescription Created",
        desc: prescriptions.length > 0 
          ? `${prescriptions[0].medicines.length} generic medicines issued by physician.` 
          : "Pending doctor diagnosis and prescriptions.",
        date: prescriptions.length > 0 
          ? new Date(prescriptions[0].createdAt).toLocaleDateString() 
          : "Awaiting consultation end",
        completed: prescriptions.length > 0
      });

      if (prescriptions.length > 0) {
        steps.push({
          label: "Medicine Reservation",
          desc: orderTrackingId 
            ? `Reserved at ${selectedFacility || "PHC-01"}. Tracking ID: ${orderTrackingId}` 
            : "Click 'Check Availability' to reserve generic drugs at nearest clinic.",
          date: orderTrackingId ? "Reserved" : "Action Required",
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
          <p className="text-xs font-bold text-slate-500">Loading Patient Records...</p>
        </div>
      </div>
    );
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
          {/* Greeting & Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {language === "mr" ? `शुभ सकाळ, ${user?.name || "रमेश कुमार"} 👋` : language === "hi" ? `शुभ प्रभात, ${user?.name || "रमेश कुमार"} 👋` : `Good morning, ${user?.name || "Ramesh Kumar"} 👋`}
              </h1>
              <p className="text-xs text-slate-300">
                {language === "mr" ? "तुमची आजची आरोग्य माहिती खालीलप्रमाणे आहे." : language === "hi" ? "आपकी आज की स्वास्थ्य जानकारी निम्नलिखित है।" : "Welcome back. Here is your personalized health dashboard overview."}
              </p>
            </div>
            
            {activeConsultation && (
              <button
                onClick={() => setActiveTab("Video Consultation")}
                className="bg-primary hover:bg-blue-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-primary/20 w-fit shrink-0 relative z-10 border-0"
              >
                <Video size={16} /> Join Consultation Call
              </button>
            )}
          </div>

          {/* Stepper Progress bar: Your Care Journey */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Your Care Journey Progression</h3>
            
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center justify-between min-w-[700px] relative py-2 px-4">
                {journeyStepsArray.map((step, idx) => {
                  const isActive = step.status === "In Progress";
                  const isDone = step.status === "Completed";
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
                          idx < journeyStepsArray.findIndex(s => s.status === "Upcoming" || s.status === "In Progress") ? "bg-green-brand" : "bg-slate-200"
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
                  <Calendar size={10} /> Next Appointment
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
                      Today • {activeConsultation.videoRoomName ? "Online Call" : "11:30 AM"}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{activeConsultation.doctorId?.name || "Dr. Kulkarni"}</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">No Appointment</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Book a slot below</span>
                  </>
                )}
              </div>
              <button
                onClick={() => (activeConsultation || activeAppointment) ? setActiveTab("Video Consultation") : setActiveTab("Appointments")}
                className="w-full bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-xl border-0 cursor-pointer text-center"
              >
                {activeConsultation ? "Join Consult" : activeAppointment ? "Join Call" : "Book Slot"}
              </button>
            </div>

            {/* Widget 2 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Briefcase size={10} /> Active Prescription
                </span>
                {prescriptions.length > 0 ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">{prescriptions[0].medicines.length} Prescribed</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Ready for pharmacy dispatch</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">0 Prescribed</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">No prescription issued</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Prescriptions")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                View Prescriptions
              </button>
            </div>

            {/* Widget 3 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full w-fit">
                  <Package size={10} /> Medicine Order
                </span>
                {orderTrackingId ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">{orderTrackingId}</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Status: <strong className="text-purple-700">{orderStatus}</strong></span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">No Active Order</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Check inventory</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Medicine Orders")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                Track Order
              </button>
            </div>

            {/* Widget 4 */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
              <div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full w-fit">
                  <RotateCcw size={10} /> Follow-up Due
                </span>
                {latestConsult ? (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">Home Vitals</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">ASHA Visit Scheduled</span>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-400 mt-2">No Follow-up</h3>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting first logs</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab("Follow-ups")}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-2 rounded-xl border border-slate-200 cursor-pointer text-center"
              >
                View Details
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left section inside dashboard: Recent Vitals */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Recent Health Vitals Logs</span>
                <span className="text-[9px] text-slate-400 lowercase font-medium">Synchronized from ABDM / ASHA</span>
              </h3>
              
              {latestVitals ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Temperature</span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.temperature}°F</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">Normal</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Blood Pressure</span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}</strong>
                    <span className="text-[8px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">Slightly High</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">SpO2 (Oxygen)</span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.spo2}%</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">Excellent</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Heart Rate</span>
                    <strong className="text-base text-slate-800 mt-1 block">{latestVitals.heartRate} bpm</strong>
                    <span className="text-[8px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">Normal</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                  <Activity size={32} className="text-slate-300 animate-pulse" />
                  <span className="text-[11px] font-bold">No vitals logs found</span>
                  <span className="text-[9px] text-slate-400">Vitals logs will sync here once recorded by an ASHA worker.</span>
                </div>
              )}
            </div>

            {/* Right section: Important Alerts */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Important Alerts</h3>
              
              <div className="space-y-3">
                {!abhaLinked && (
                  <div className="bg-amber-50/50 border border-amber-200/80 p-3 rounded-2xl text-[10px] text-amber-800 leading-relaxed flex gap-2.5">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>ABHA ID Not Linked!</strong><br />
                      Link your ABDM card to authorize digital medical prescriptions retrieval.
                      <button onClick={() => setShowAbhaModal(true)} className="text-primary font-bold block mt-1 hover:underline cursor-pointer border-0 bg-transparent text-[10px]">Link Now →</button>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50/50 border border-blue-200/80 p-3 rounded-2xl text-[10px] text-blue-800 leading-relaxed flex gap-2.5">
                  <BadgeInfo size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sinnar Health Camp</strong><br />
                    Community health camp for hypertension checkups this Friday at Sub-centre 02.
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
            <h2 className="text-lg font-extrabold text-slate-800">ABHA National Health ID</h2>
            <p className="text-xs text-slate-500">Manage and verify your identity credentials under ABDM.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 space-y-4">
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Identity Card Verification</span>
                
                {abhaLinked ? (
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl"><Shield size={24} /></div>
                    <div>
                      <strong className="text-xs text-slate-800 block">ABHA ID Linked Successfully</strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Card Number: {abhaNumber}</span>
                      <span className="text-[9px] text-green-700 bg-green-50 font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block">ABDM Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl"><AlertTriangle size={24} /></div>
                    <div>
                      <strong className="text-xs text-slate-800 block">No National Health ID Associated</strong>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        Link your card to enable automatic medical history collection across primary health clinics.
                      </p>
                      <button
                        onClick={() => setShowAbhaModal(true)}
                        className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-4 py-2 rounded-xl mt-3 cursor-pointer border-0"
                      >
                        Link ABHA Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 p-5 rounded-2xl bg-white space-y-3 text-xs">
                <strong className="text-slate-800 block">Demographics Record</strong>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Name</span>
                    <span className="font-bold text-slate-700">{user?.name || "Ramesh Kumar"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mobile Registered</span>
                    <span className="font-bold text-slate-700">{user?.mobile || "9822114400"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Age / Gender</span>
                    <span className="font-bold text-slate-700">{user?.age || 54}y / {user?.gender || "Male"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unique Patient Ref</span>
                    <span className="font-bold text-slate-700">{user?.patientRefId || "JC-98D2"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-tr from-slate-950 to-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute -top-16 -right-16 h-36 w-36 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NATIONAL HEALTH CARD</span>
                  <h3 className="text-sm font-extrabold mt-1">ABDM Health Locker</h3>
                </div>
                <span className="text-[8px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>

              <div className="py-8 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">ABHA ID Address</span>
                <span className="text-base font-extrabold tracking-widest">{user?.name?.toLowerCase().replace(/\s/g, "") || "ramesh"}@ndhm</span>
              </div>

              <div className="flex justify-between items-end text-xs text-slate-400">
                <div>
                  <span className="text-[9px] block">ISSUED BY</span>
                  <strong className="text-white">Govt. of India</strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] block">REF ID</span>
                  <strong className="text-white">{user?.patientRefId || "JC-9118"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS VIEW */}
      {activeTab === "Appointments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Appointments Hub</h2>
              <p className="text-xs text-slate-500">Review your schedule or book new slots at nearest health clinics.</p>
            </div>
            
            <button
              onClick={() => setActiveAction("Book Doctor")}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border-0"
            >
              <PlusCircle size={14} /> Book Consultation Slot
            </button>
          </div>

          {activeAction === "Book Doctor" && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <strong className="text-xs text-slate-800 uppercase tracking-wider block">Available Doctor Booking Slots</strong>
                <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-transparent border-0 cursor-pointer">Cancel</button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl text-xs">
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md w-fit block">Sinnar CHC Health Hub</span>
                    <strong className="text-slate-800 text-sm block mt-1.5">Dr. Aniruddha Kulkarni</strong>
                    <span className="text-slate-500 block">General Physician | Teleconsultation Provider</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { handleBookAppointment("11:30 AM"); setActiveAction(null); }} className="bg-primary hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl font-bold cursor-pointer border-0 text-[10px]">11:30 AM</button>
                    <button onClick={() => { handleBookAppointment("02:00 PM"); setActiveAction(null); }} className="bg-primary hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl font-bold cursor-pointer border-0 text-[10px]">02:00 PM</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border border-slate-200/80 bg-white rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Your Booked Appointments</h3>
            
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((cons, idx) => {
                  const matchedAppt = appointments.find(
                    (a) => a.doctorId?._id === cons.doctorId?._id
                  );
                  const apptTime = matchedAppt?.appointmentTime || "11:30 AM";
                  const apptDate = matchedAppt?.appointmentDate
                    ? new Date(matchedAppt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : new Date(cons.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                  return (
                    <div key={idx} className="border border-slate-200/60 p-4.5 rounded-2xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-150">
                      <div className="flex gap-3 items-start">
                        <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0"><Calendar size={20} /></div>
                        <div>
                          <strong className="text-slate-800 text-sm block">Tele-Consultation (Online)</strong>
                          <span className="text-xs text-slate-500 block mt-0.5">Doctor: {cons.doctorId?.name || "Dr. Aniruddha Kulkarni"}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Slot: {apptDate} • {apptTime} | Room: {cons.videoRoomName}</span>
                        </div>
                      </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                        cons.status === "Completed" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-blue-50 text-primary animate-pulse"
                      }`}>
                        {cons.status === "Completed" ? "Completed" : "Active / Scheduled"}
                      </span>
                      
                      {cons.status === "Scheduled" && (
                        <button
                          onClick={() => setActiveTab("Video Consultation")}
                          className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl border-0 cursor-pointer"
                        >
                          Join Call
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
                <span className="text-[11px] font-bold">No appointments scheduled</span>
                <span className="text-[9px] text-slate-400">Your scheduled consultation slots will appear here.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. VIDEO CONSULTATION VIEW */}
      {activeTab === "Video Consultation" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Tele-Consultation Video Room</h2>
            <p className="text-xs text-slate-500">Join the live secure room to consult with your clinic doctor.</p>
          </div>

          {activeConsultation ? (
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Iframe Video Feed */}
              <div className="lg:col-span-8 bg-black border border-slate-900 rounded-3xl overflow-hidden min-h-[420px] relative shadow-lg">
                <iframe
                  src={`https://meet.jit.si/${activeConsultation.videoRoomName}`}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>

              {/* Right Column: Doctor Metadata */}
              <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-3xl flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full w-fit block uppercase">Tele-Consultation Live</span>
                    <strong className="text-slate-800 text-sm mt-2 block">{activeConsultation.doctorId?.name || "Dr. Aniruddha Kulkarni"}</strong>
                    <span className="text-[10px] text-slate-500 block">Sinnar CHC Medical Officer</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <strong className="text-slate-700 block">Consultation Info</strong>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Room Name</span>
                        <span className="font-semibold text-slate-700">{activeConsultation.videoRoomName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vitals Level</span>
                        <span className="font-semibold text-slate-700">{latestVitals?.temperature ? "Logged" : "Not Logged"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert("Leaving video room.");
                    setActiveTab("Dashboard");
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl text-xs cursor-pointer border-0 mt-6 shadow-md shadow-red-100"
                >
                  Leave Session
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-12 rounded-3xl shadow-xs text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-red-50 text-red-600 rounded-full"><Video size={36} /></div>
              <h3 className="font-extrabold text-slate-800 text-sm">No Active Consultation Session</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-normal">
                You do not have any active appointments running. Please schedule a slot with the medical hub to join the room.
              </p>
              <button
                onClick={() => setActiveTab("Appointments")}
                className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer border-0 shadow-xs"
              >
                Schedule Appointment
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. PRESCRIPTIONS VIEW */}
      {activeTab === "Prescriptions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Your Prescriptions</h2>
              <p className="text-xs text-slate-500">View and download your digital generic prescriptions.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 border-b border-slate-200 pb-3 text-xs font-bold text-slate-500">
            <button
              onClick={() => setPrescriptionFilter("All")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "All" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              All Prescriptions ({displayPrescriptions.length})
            </button>
            <button
              onClick={() => setPrescriptionFilter("Active")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "Active" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              Active
            </button>
            <button
              onClick={() => setPrescriptionFilter("Completed")}
              className={`px-4 py-2 border-0 bg-transparent cursor-pointer ${prescriptionFilter === "Completed" ? "text-primary border-b-2 border-primary font-extrabold" : ""}`}
            >
              Completed
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
                        <span className="text-[10px] text-slate-400 block mt-0.5">Date: {new Date(pres.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">Verified Rx</span>
                    </div>

                    <div className="space-y-2">
                      {pres.medicines.map((med: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <div>
                            <strong className="block text-slate-800">{med.name} ({med.strength})</strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{med.dosage} — {med.durationDays} Days</span>
                          </div>
                          <span className="text-[10px] text-slate-400 italic">{med.instructions || "After Food"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      onClick={() => handleDownloadPrescription(pres)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} /> Print PDF
                    </button>
                    <button
                      onClick={() => {
                        const firstMed = pres.medicines[0]?.name || "Metformin";
                        checkMedicineAvailability(firstMed);
                        setActiveTab("Medicines");
                      }}
                      className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-xl cursor-pointer border-0"
                    >
                      Check Pharmacy Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full"><FileText size={32} /></div>
              <h3 className="font-extrabold text-slate-800 text-sm">No Prescriptions Found</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                There are no digital prescriptions assigned to this ABHA ID record. They will appear here once issued by a practitioner.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. MEDICINE ORDERS VIEW */}
      {activeTab === "Medicine Orders" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Pharmacy Medicine Orders</h2>
            <p className="text-xs text-slate-500">Track and manage your reserved generic medicines package.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: list of orders */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Medicine Reserves List</h3>
                
                {orderTrackingId ? (
                  <div className="border border-slate-200 p-4.5 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm text-slate-800 block">{orderTrackingId}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Facility: {selectedFacility || "Sinnar CHC"}</span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{orderStatus}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500">Total Medicines: <strong>2 Codes</strong></span>
                      <button
                        onClick={advanceOrderStatus}
                        className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Advance Simulation Status
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                    <Package size={28} className="text-slate-300" />
                    <span className="text-[11px] font-bold">No active orders</span>
                    <span className="text-[9px] text-slate-400">Order details will appear once you check availability and reserve stock.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: order tracking timeline */}
            <div className="lg:col-span-6 border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Reserves Tracking Timeline</h3>

              {orderTrackingId ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 mt-4">
                  {[
                    { label: "Request Submitted", desc: "Digital pharmacy reserve request received.", done: true },
                    { label: "Facility Confirmed", desc: `Stock verified at ${selectedFacility || "PHC-01"}.`, done: true },
                    { label: "Preparing Medicine", desc: "Generic packages sorted and bagged.", done: orderStatus !== "Requested" },
                    { label: "Ready for Collection", desc: "Awaiting patient pickup at counter.", done: orderStatus === "Ready" || orderStatus === "Collected" },
                    { label: "Collected", desc: "Handed over. Transaction synchronized.", done: orderStatus === "Collected" }
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
                  <span className="text-[11px] font-bold">No active timeline</span>
                  <span className="text-[9px] text-slate-400">Order tracking timeline will activate after medicine dispatch.</span>
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
              <h2 className="text-lg font-extrabold text-slate-800">Pharmacy Availability Checker</h2>
              <p className="text-xs text-slate-500">Locate stock levels and reserve generic medicine packages.</p>
            </div>
            
            <div className="flex border border-slate-200 rounded-xl overflow-hidden text-xs font-bold bg-slate-50">
              <button
                onClick={() => setMapMode("Map")}
                className={`px-3 py-1.5 cursor-pointer transition-all border-0 ${mapMode === "Map" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500"}`}
              >
                Map View
              </button>
              <button
                onClick={() => setMapMode("List")}
                className={`px-3 py-1.5 cursor-pointer transition-all border-0 ${mapMode === "List" ? "bg-white text-primary shadow-xs" : "bg-transparent text-slate-500"}`}
              >
                List View
              </button>
            </div>
          </div>

          {selectedMedicineCheck && (
            <div className="bg-blue-50 border border-blue-150 p-4 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-700">Checking Live Availability for: </span>
                <strong className="text-primary font-extrabold">{selectedMedicineCheck}</strong>
              </div>
              <button
                onClick={() => {
                  setSelectedMedicineCheck("");
                  setRealStockAvailability([]);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg font-bold border-0 cursor-pointer text-[10px]"
              >
                Reset / Show All
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
                      Querying district pharmacy networks...
                    </div>
                  ) : (realStockAvailability.length > 0 ? realStockAvailability : nearbyFacilities).map((fac, idx) => (
                    <div key={idx} className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex flex-col justify-between gap-3">
                      <div>
                        <strong className="text-slate-800 text-[11px] block">{fac.name}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Distance: {fac.distance}</span>
                        {selectedMedicineCheck && (
                          <div className="mt-2 space-y-0.5 font-bold">
                            <span className="text-[9px] text-slate-550 block">Available: {fac.qty} units</span>
                            <span className={`text-[9px] block ${
                              fac.MC2 === "Available" ? "text-green-700" : fac.MC2 === "Low" || fac.MC2 === "Low Stock" ? "text-amber-700" : "text-red-705"
                            }`}>Status: {fac.MC2}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleReserveMedicine(fac.name, fac.medicineId)}
                        className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg cursor-pointer border-0"
                      >
                        Reserve Package
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
                    Querying district pharmacy networks...
                  </div>
                ) : (realStockAvailability.length > 0 ? realStockAvailability : nearbyFacilities).map((fac, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-slate-100 p-4 rounded-2xl hover:bg-slate-50 transition-colors text-xs">
                    <div>
                      <strong className="text-slate-800 text-sm block">{fac.name}</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Distance: {fac.distance} | Stock Updated: {fac.updated}
                      </span>
                      <div className="flex gap-2 mt-1.5">
                        {selectedMedicineCheck ? (
                          <span className="text-[9px] bg-blue-50 text-primary px-2 py-0.5 rounded-md font-bold">Qty: {fac.qty} units</span>
                        ) : (
                          <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold">MC1 Code: {fac.MC1}</span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                          fac.MC2 === "Available" ? "bg-green-50 text-green-700" : fac.MC2 === "Low" || fac.MC2 === "Low Stock" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          {selectedMedicineCheck ? "Status: " : "MC2 Code: "}{fac.MC2}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleReserveMedicine(fac.name, fac.medicineId)}
                      className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer border-0"
                    >
                      Reserve at Pharmacy
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
            <h2 className="text-lg font-extrabold text-slate-800">Your ABDM Health Records</h2>
            <p className="text-xs text-slate-500">Manage diagnostic report files, historical prescriptions, and upload custom lab reports.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Left Col: Upload Form */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4 text-left">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Upload Lab Report</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!uploadTitle || !uploadContent) {
                    alert("Please fill in all fields.");
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
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert("Document uploaded successfully!");
                      setUploadTitle("");
                      setUploadContent("");
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
                  <label className="block font-bold text-slate-600 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Blood Sugar Report, Chest X-Ray Notes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="LabReport">Laboratory Diagnostics (Lab Report)</option>
                    <option value="DischargeSummary">Discharge Summary</option>
                    <option value="Other">Other Clinical Document</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Report Data / Clinical Notes</label>
                  <textarea
                    required
                    rows={4}
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                    placeholder="Enter diagnostic values, sugar readings, or doctor's summary instructions here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl cursor-pointer border-0 mt-2 flex items-center justify-center gap-1.5"
                >
                  {uploadLoading ? "Uploading..." : "Save to Health Locker"}
                </button>
              </form>
            </div>

            {/* Right Col: Documents Locker & Prescription History */}
            <div className="md:col-span-2 space-y-6 text-left">
              {/* Document Locker */}
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Clinical Documents Locker</h3>
                
                <div className="space-y-3 text-xs">
                  {/* Default Static Documents using our real print function */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="flex gap-3 items-start">
                      <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><FileSpreadsheet size={16} /></div>
                      <div>
                        <strong className="text-slate-800 block text-[13px]">ASHA Vitals Baseline Intake</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Source: Sharda Patil (ASHA) | Status: Verified</span>
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
                      Download PDF
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="flex gap-3 items-start">
                      <div className="p-2.5 bg-blue-50 text-primary rounded-xl shrink-0"><FileSpreadsheet size={16} /></div>
                      <div>
                        <strong className="text-slate-800 block text-[13px]">Community Lab Diagnostics (CBC)</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Source: Dr. Kulkarni | Status: Verified</span>
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
                      Download PDF
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
                            Date: {new Date(doc.createdAt).toLocaleDateString()} | Type: {doc.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadClinicalDocument(doc)}
                        className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription Medicine History */}
              <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Prescription & Medication History</h3>
                
                {prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.map((pres) => (
                      <div key={pres._id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 block">Prescribed by {pres.doctorId?.name || "Medical Officer"}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Date: {new Date(pres.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadPrescription(pres)}
                            className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent"
                          >
                            Print Rx PDF
                          </button>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Medicines Taken:</span>
                          {pres.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="text-slate-700 bg-white border border-slate-100 px-3 py-1.5 rounded-lg flex justify-between items-center">
                              <strong>{med.name} ({med.strength})</strong>
                              <span className="text-slate-500 font-semibold">{med.dosage} • {med.durationDays} Days</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">
                    No medication history recorded.
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
              <h2 className="text-lg font-extrabold text-slate-800">Your Complete Care Timeline</h2>
              <p className="text-xs text-slate-500">A visual step-by-step log of symptoms intake, triage routing, prescriptions, and followups.</p>
            </div>
            
            <button
              onClick={handleDownloadTimelineReport}
              className="bg-primary hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Download size={14} /> Download Timeline PDF
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
            <h2 className="text-lg font-extrabold text-slate-800">Doctor In-Person Visits (Offline Consultations)</h2>
            <p className="text-xs text-slate-500">View details of scheduled offline consultations ordered by physicians after online triage.</p>
          </div>
          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Scheduled Doctor Visit Orders</h3>

            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref._id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3 text-xs leading-relaxed max-w-2xl">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        ref.status === "Completed" ? "bg-green-50 text-green-700 border border-green-150" : "bg-blue-50 text-primary border border-blue-150 animate-pulse"
                      }`}>
                        {ref.status === "Created" ? "OPD Consultation Booked" : ref.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Logged: {new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-slate-700 bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Health Facility to Visit</span>
                        <strong className="text-slate-800 text-sm">{ref.destinationFacilityId?.name || "Nashik District Civil Hospital"}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Type: {ref.destinationFacilityId?.type || "District Hospital"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Referring Online Doctor</span>
                        <strong className="text-slate-800 text-sm">{ref.referringDoctorId?.name || "Dr. Aniruddha Kulkarni"}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Role: General Medical Officer</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#F8FAFC] p-4.5 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">📅 Scheduled Appointment Date & Time</span>
                        <strong className="text-primary text-xs font-mono">
                          {ref.appointmentDate ? new Date(ref.appointmentDate).toLocaleString() : ref.followUpDate ? new Date(ref.followUpDate).toLocaleString() : "Please visit OPD during consultation hours (9 AM - 2 PM)"}
                        </strong>
                      </div>
                      <div className="border-t border-slate-200/60 pt-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Clinical Reason for In-Person Check</span>
                        <p className="text-slate-700 text-xs font-semibold mt-0.5">{ref.reason}</p>
                      </div>
                      {ref.instructions && (
                        <div className="border-t border-slate-200/60 pt-2">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Patient Instructions</span>
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
                <span className="text-[11px] font-bold">No referrals issued</span>
                <span className="text-[9px] text-slate-400">Referrals issued during your doctor consult will appear here.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. FOLLOW-UPS VIEW */}
      {activeTab === "Follow-ups" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">ASHA Home Visit Follow-ups</h2>
            <p className="text-xs text-slate-500">Locate scheduled compliance checks and vitals monitoring details.</p>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Home Visit Checklist</h3>
            
            {followups.length > 0 ? (
              <div className="space-y-4">
                {followups.map((follow) => (
                  <div key={follow._id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-3 text-xs max-w-md">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Assigned Community Worker</span>
                      <strong className="text-slate-800">{follow.assignedWorkerId?.name || "Sharda Patil"} ({follow.assignedWorkerId?.role || "ASHA"})</strong>
                    </div>
                    <div className="border-t border-slate-200/60 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider">Follow-up Task</span>
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase">{follow.status}</span>
                      </div>
                      <p className="text-slate-600 mt-1 font-semibold">Reason: {follow.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Due Date: {new Date(follow.dueDate).toLocaleDateString()}</p>
                      {follow.notes && <p className="text-[10px] text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">Notes: {follow.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-1">
                <RotateCcw size={28} className="text-slate-350" />
                <span className="text-[11px] font-bold">No follow-ups scheduled</span>
                <span className="text-[9px] text-slate-400">ASHA checks will map dynamically after clinical consultation completes.</span>
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
              <h2 className="text-lg font-extrabold text-slate-800">ABDM Digital Consent Manager</h2>
              <p className="text-xs text-slate-500">Authorize or revoke access permission to your electronic health records.</p>
            </div>
            
            <button
              onClick={async () => {
                const purpose = prompt("Enter purpose for data sharing:", "Routine clinical review");
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
                    alert("Consent successfully granted!");
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
              + Grant Access Consent
            </button>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-3xl p-5 shadow-xs text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Active Data-Sharing Permits</h3>
            
            {consents.length > 0 ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">Authorized Recipient</th>
                      <th className="py-2.5 px-4">Purpose</th>
                      <th className="py-2.5 px-4">Expiry Date</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consents.map((consent) => (
                      <tr key={consent._id} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {consent.grantedToDoctorId?.name || consent.grantedToFacilityId?.name || "General Practitioner (Nashik Network)"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{consent.purpose}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{new Date(consent.expiryDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            consent.status === "Active" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700"
                          }`}>
                            {consent.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {consent.status === "Active" && (
                            <button
                              onClick={async () => {
                                if (!confirm("Are you sure you want to withdraw this access consent?")) return;
                                try {
                                  const res = await fetch("/api/consent", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ consentId: consent._id, status: "Withdrawn" })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert("Consent successfully withdrawn.");
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
                              Withdraw
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
                <span className="text-[11px] font-bold">No data permits active</span>
                <span className="text-[9px] text-slate-400">All data transfers are blocked. Grant consent to allow practitioners to access your clinical history.</span>
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
              <strong className="text-sm font-extrabold">Gemini Clinical Decision Support Agent</strong>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REAL-TIME CO-PILOT</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AIAgentChatbot inline />
          </div>
        </div>
      )}

      {/* 13. SETTINGS VIEW */}
      {activeTab === "Settings" && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Portal Settings</h2>
            <p className="text-xs text-slate-500">Configure accessibility, notifications, and language defaults.</p>
          </div>

          <div className="max-w-md space-y-5 text-xs text-slate-700">
            <div className="space-y-2">
              <strong className="block text-slate-800 text-[13px]">Preferred Application Language</strong>
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
              <strong className="block text-slate-800 text-[13px]">Notifications Setup</strong>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-sm border-slate-300 text-primary h-4 w-4" />
                  <span>Receive SMS reminders for scheduled ASHA home visits</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-sm border-slate-300 text-primary h-4 w-4" />
                  <span>Alert me when generic pharmacy orders change status</span>
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
              <h3 className="font-extrabold text-sm text-slate-800">Link ABHA Account ID</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your 14-digit national health ID</p>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingLoading}
                  className="bg-primary hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg cursor-pointer border-0"
                >
                  Link ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
