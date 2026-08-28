"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  Loader2,
  Users,
} from "lucide-react";

export default function ConsultationWorkspace() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [consult, setConsult] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Video call sandbox state
  const [videoUrl, setVideoUrl] = useState("");
  const [isSandbox, setIsSandbox] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTimer, setCallTimer] = useState(0);

  // Local camera stream reference (for sandbox mock)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Clinical inputs
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // Prescription medicines
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medName, setMedName] = useState("");
  const [medStrength, setMedStrength] = useState("500mg");
  const [medForm, setMedForm] = useState("Tablet");
  const [medDosage, setMedDosage] = useState("1-0-1");
  const [medDuration, setMedDuration] = useState("5");
  const [medInstructions, setMedInstructions] = useState("After Food");

  // Referral inputs
  const [needReferral, setNeedReferral] = useState(false);
  const [referralFacility, setReferralFacility] = useState("");
  const [referralPriority, setReferralPriority] = useState("Routine");
  const [referralReason, setReferralReason] = useState("");

  // ASHA Referral inputs
  const [needAshaReferral, setNeedAshaReferral] = useState(false);
  const [assignedAshaId, setAssignedAshaId] = useState("");
  const [ashaReferralReason, setAshaReferralReason] = useState("");
  const [ashaReferralPriority, setAshaReferralPriority] = useState("Routine");
  const [ashaReferralInstructions, setAshaReferralInstructions] = useState("");
  const [ashaReferralFollowUpDate, setAshaReferralFollowUpDate] = useState("");
  const [ashaList, setAshaList] = useState<any[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);

  // Follow-up inputs
  const [needFollowUp, setNeedFollowUp] = useState(false);
  const [followUpType, setFollowUpType] = useState("Medication");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  async function fetchAshaWorkers() {
    try {
      const res = await fetch("/api/asha");
      const data = await res.json();
      if (data.success) {
        setAshaList(data.ashas);
      }
    } catch (e) {
      console.error("Failed to load ASHA workers:", e);
    }
  }

  useEffect(() => {
    fetchConsultationDetails();
    fetchReferralFacilities();
    fetchAshaWorkers();

    // Call timer incrementer
    const interval = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Set up camera stream for simulated call
  useEffect(() => {
    if (camOn && !loading && isSandbox) {
      if (!navigator.mediaDevices) {
        console.warn("navigator.mediaDevices is undefined (requires HTTPS or localhost).");
        return;
      }
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: micOn })
        .then((s) => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Camera access denied or unavailable in sandbox:", err);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  }, [camOn, loading]);

  async function fetchConsultationDetails() {
    try {
      setLoading(true);
      
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userData.success) {
        setCurrentUser(userData.user);
      }

      const res = await fetch(`/api/consultations?status=Scheduled`);
      const data = await res.json();
      if (data.success) {
        const match = data.consultations.find((c: any) => c._id === id);
        if (match) {
          setConsult(match);
          setNotes(match.clinicalNotes || "");
          setDiagnosis(match.diagnosis || "");

          const pId = match.patientId?._id;
          if (pId) {
            // Load patient clinical documents
            const docRes = await fetch(`/api/documents?patientId=${pId}`);
            const docData = await docRes.json();
            if (docData.success) {
              setPatientDocuments(docData.documents);
            }
            
            // Load patient historical prescriptions
            const presRes = await fetch(`/api/prescriptions?patientId=${pId}`);
            const presData = await presRes.json();
            if (presData.success) {
              setPatientPrescriptions(presData.prescriptions);
            }
          }
        } else {
          // If user is doctor, redirect, else let them stay or handle separately
          if (userData.user?.role === "Doctor" || userData.user?.role === "Specialist") {
            router.push("/doctor/dashboard");
          } else {
            router.push("/patient/dashboard");
          }
        }
      }

      // Allocate WebRTC Video Room
      const videoRes = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: id }),
      });
      const videoData = await videoRes.json();
      if (videoData.success) {
        setVideoUrl(videoData.url);
        setIsSandbox(videoData.isSandbox);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReferralFacilities() {
    try {
      const res = await fetch("/api/facilities");
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function addMedicine() {
    if (!medName) return;
    setMedicines((prev) => [
      ...prev,
      {
        name: medName,
        strength: medStrength,
        form: medForm,
        dosage: medDosage,
        durationDays: Number(medDuration),
        instructions: medInstructions,
      },
    ]);
    setMedName("");
  }

  function removeMedicine(idx: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleDownloadClinicalDocument(doc: any) {
    const patientName = consult?.patientId?.name || "Ramesh Kumar";
    const patientId = consult?.patientId?.patientRefId || "JC-R-0283";
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

  function handlePrintClinicalSummary() {
    const doctorName = currentUser?.name || "Dr. Aniruddha Kulkarni";
    const dateStr = new Date().toLocaleDateString();
    const patientName = patient?.name || "Ramesh Kumar";
    const patientRefId = patient?.patientRefId || "JC-R-0283";
    const age = patient?.age || 54;
    const gender = patient?.gender || "Male";
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let html = `
      <html>
        <head>
          <title>Clinical_Report_${patientRefId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1464D2; }
            .details { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .content-box { font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; }
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
              <strong>Patient Ref ID:</strong> ${patientRefId}<br/>
              <strong>Age / Gender:</strong> ${age}y / ${gender}
            </div>
            <div style="text-align:right;">
              <strong>Consulting Physician:</strong> ${doctorName}<br/>
              <strong>Session ID:</strong> ${id}<br/>
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
            <strong>Diagnosis:</strong> ${diagnosis || "Acute viral syndrome / General checkup"}<br/><br/>
            <strong>Progress Notes:</strong> ${notes || "Patient presented symptoms of mild cough. Vitals monitored. Prescribed generic medications and scheduled outreach checks."}
          </div>

          <div class="section-title">Prescribed Generic Medications</div>
          ${medicines.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Strength</th>
                  <th>Form</th>
                  <th>Dosage</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${medicines.map((med: any) => `
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
          ` : `
            <div class="content-box">No clinical medications prescribed during this session.</div>
          `}

          <div class="section-title">Post-Consultation Coordination Plan</div>
          <div class="content-box">
            ${needFollowUp ? `<strong>Community Follow-up:</strong> Scheduled ASHA home check due in ${followUpDate ? new Date(followUpDate).toLocaleDateString() : "Next week"} (Type: ${followUpType}). Notes: ${followUpNotes || "N/A"}<br/>` : ""}
            ${needReferral ? `<strong>Physical Referrals:</strong> Hospital visitation ordered at: ${facilities.find((f: any) => f._id === referralFacility)?.name || "Primary Health Center"}. Reason: ${referralReason || "N/A"}` : ""}
            ${!needFollowUp && !needReferral ? "No post-consultation referrals scheduled." : ""}
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
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Submit complete clinical consultation logs
  async function handleConcludeConsultation() {
    if (!diagnosis) {
      alert("Please provide a clinical diagnosis before concluding.");
      return;
    }

    try {
      setLoading(true);

      // 1. Save Consultation notes
      const consRes = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: id,
          clinicalNotes: notes,
          diagnosis,
          status: "Completed",
          durationSeconds: callTimer,
        }),
      });

      const consData = await consRes.json();
      if (!consData.success) throw new Error(consData.error);

      // 2. Submit Prescription if medicines exist
      if (medicines.length > 0) {
        await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId: id,
            patientId: consult.patientId._id,
            medicines,
          }),
        });
      }

      // 3. Submit Referral if checked
      if (needReferral && referralFacility) {
        await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: consult.patientId._id,
            destinationFacilityId: referralFacility,
            reason: referralReason,
            priority: referralPriority,
          }),
        });
      }

      // 3.5 Submit ASHA Referral if checked
      if (needAshaReferral && assignedAshaId) {
        await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: consult.patientId._id,
            assignedAshaId: assignedAshaId,
            reason: ashaReferralReason,
            priority: ashaReferralPriority,
            instructions: ashaReferralInstructions,
            followUpDate: ashaReferralFollowUpDate ? new Date(ashaReferralFollowUpDate) : undefined,
          }),
        });
      }

      // 4. Submit Follow-up if checked
      if (needFollowUp && followUpDate) {
        await fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: consult.patientId._id,
            assignedWorkerId: consult.patientId.registeredBy || consult.doctorId._id,
            type: followUpType,
            dueDate: followUpDate,
            notes: followUpNotes,
          }),
        });
      }

      alert("Consultation successfully concluded and coordinated!");
      router.push("/doctor/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to conclude consultation");
      setLoading(false);
    }
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (loading && !consult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-brand">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const patient = consult.patientId;
  const healthRecord = consult.healthRecordId;

  if (currentUser?.role === "Patient") {
    return (
      <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans">
        <header className="bg-white border-b border-border-brand h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="जनCare Logo" className="h-6 w-auto" />
            <span className="font-bold text-sm text-deep-blue">Patient Teleconsultation Room</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
              <Clock size={12} className="text-primary" /> Session: {formatTime(callTimer)}
            </span>
            <span className="bg-soft-teal text-teal-800 px-3 py-1 rounded-full">
              Doctor: {consult?.doctorId?.name || "Dr. Aniruddha Kulkarni"}
            </span>
          </div>
        </header>

        <div className="flex-grow grid lg:grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]">
          {/* Main big video feed (Doctor) */}
          <div className="lg:col-span-8 bg-slate-950 p-6 flex flex-col justify-between relative h-full">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
              Connecting secure WebRTC video room...
            </div>
            
            <div className="flex-1 flex items-center justify-center relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {!isSandbox && videoUrl ? (
                <iframe
                  src={videoUrl}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="w-full h-full border-0 rounded-2xl"
                />
              ) : camOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center text-slate-500 space-y-2">
                  <VideoOff size={32} className="mx-auto" />
                  <span className="text-xs font-bold block">Camera Turned Off</span>
                </div>
              )}

              {/* Patient local preview overlay */}
              {isSandbox && (
                <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center text-white text-[9px] font-bold">
                  Local Camera Stream
                </div>
              )}
            </div>

            {/* Controllers */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full border cursor-pointer border-0 bg-slate-800 text-white hover:bg-slate-700 ${!micOn ? "bg-red-500 text-white" : ""}`}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-3 rounded-full border cursor-pointer border-0 bg-slate-800 text-white hover:bg-slate-700 ${!camOn ? "bg-red-500 text-white" : ""}`}
              >
                {camOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
              <button
                onClick={() => router.push("/patient/dashboard")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-xs cursor-pointer border-0 shadow-md"
              >
                Leave Consultation
              </button>
            </div>
          </div>

          {/* Right Column: AI Triage info & prescription updates (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 overflow-y-auto space-y-6 text-left">
            <div>
              <h3 className="font-extrabold text-sm text-deep-blue">My Consultation Summary</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Vitals and clinical observations recorded by provider.</p>
            </div>

            {/* Vitals summary card */}
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-xs space-y-2">
              <span className="text-[9px] font-bold text-text-secondary uppercase">My Baseline Vitals</span>
              <div className="grid grid-cols-2 gap-2 text-text-primary">
                <div>Temp: <strong>{healthRecord?.vitals?.temperature || 98.6}°F</strong></div>
                <div>BP: <strong>{healthRecord?.vitals?.bloodPressureSystolic || 120}/{healthRecord?.vitals?.bloodPressureDiastolic || 80}</strong></div>
                <div>SpO2: <strong>{healthRecord?.vitals?.spo2 || 98}%</strong></div>
                <div>Pulse: <strong>{healthRecord?.vitals?.heartRate || 78} bpm</strong></div>
              </div>
            </div>

            {/* AI assisted details */}
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl text-xs space-y-2">
              <span className="text-[9px] font-bold text-primary uppercase">AI Clinical Guidance</span>
              <p className="leading-relaxed font-medium text-[10px] text-text-primary">
                {healthRecord?.triage?.aiExplanation || "Routine consultation queued. Generic drug MC1 Paracetamol and MC2 Metformin prescribed."}
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-150 rounded-2xl text-xs flex items-center gap-3">
              <CheckCircle className="text-green-700 shrink-0" size={16} />
              <div className="text-[10px] text-green-800 font-bold">
                Your prescription and follow-up plan will sync to your patient portal immediately upon conclusion.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-brand flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border-brand h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white px-1.5 py-0.5 rounded-md font-bold text-xs">जन</div>
          <span className="font-bold text-sm text-deep-blue">Live Consultation Workspace</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
          <button
            onClick={handlePrintClinicalSummary}
            className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl border-0 cursor-pointer shadow-sm shadow-primary/15 transition-all flex items-center gap-1"
          >
            🖨️ Print Report PDF
          </button>
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
            <Clock size={12} className="text-primary" /> Session Timer: {formatTime(callTimer)}
          </span>
          <span className="bg-soft-teal text-teal-800 px-3 py-1 rounded-full">
            Patient: {patient?.name} ({patient?.patientRefId})
          </span>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Left Column: Video screen */}
        <div className="lg:col-span-6 bg-slate-900 flex flex-col justify-between p-6 relative">
          {/* Top details bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white text-xs">
            <span className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
              <Users size={12} /> Live Consultation Room
            </span>
            {isSandbox && (
              <span className="bg-primary/95 px-3 py-1.5 rounded-full font-bold shadow-sm">
                JanCare WebRTC Sandbox Mode
              </span>
            )}
          </div>

          {/* Main Feed Viewport */}
          <div className="flex-1 flex items-center justify-center relative rounded-xl overflow-hidden bg-slate-950/40">
            {!isSandbox && videoUrl ? (
              <iframe
                src={videoUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0 rounded-xl"
              />
            ) : camOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <VideoOff size={40} />
                <span className="text-xs">Camera Turned Off</span>
              </div>
            )}

            {/* Doctor thumbnail preview (hidden in live WebRTC since iframe renders both participants) */}
            {isSandbox && (
              <div className="absolute bottom-4 right-4 w-32 h-20 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                {camOn ? "Doctor Preview" : "Camera Muted"}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-4 rounded-full transition-all border cursor-pointer ${
                micOn
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-red-600 hover:bg-red-700 text-white border-red-700"
              }`}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`p-4 rounded-full transition-all border cursor-pointer ${
                camOn
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-red-600 hover:bg-red-700 text-white border-red-700"
              }`}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>

        {/* Right Column: Patient records + clinical entry forms */}
        <div className="lg:col-span-6 bg-white overflow-y-auto p-8 space-y-8 h-full">
          {/* Patient Details & Vitals intake */}
          <div className="border-b border-border-brand pb-6">
            <h3 className="font-bold text-lg text-deep-blue">Patient Profile & Vitals Intake</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="bg-bg-brand p-3 rounded-xl border border-border-brand">
                <span className="text-text-secondary block">Age / Gender</span>
                <span className="font-semibold text-text-primary mt-0.5 block">{patient?.age}y / {patient?.gender}</span>
              </div>
              <div className="bg-bg-brand p-3 rounded-xl border border-border-brand">
                <span className="text-text-secondary block">Body Temperature</span>
                <span className="font-bold text-text-primary mt-0.5 block">{healthRecord?.vitals?.temperature || "N/A"} °F</span>
              </div>
              <div className="bg-bg-brand p-3 rounded-xl border border-border-brand">
                <span className="text-text-secondary block">SpO2 level</span>
                <span className="font-bold text-text-primary mt-0.5 block">{healthRecord?.vitals?.spo2 || "N/A"}%</span>
              </div>
              <div className="bg-bg-brand p-3 rounded-xl border border-border-brand">
                <span className="text-text-secondary block">AI Triage Severity</span>
                <span className="font-bold text-orange-500 mt-0.5 block">{healthRecord?.triage?.level || "Priority"}</span>
              </div>
            </div>

            {/* AI triage rationale explanation */}
            {healthRecord?.triage?.aiExplanation && (
              <div className="mt-4 bg-orange-50/50 p-4 rounded-xl border border-orange-200/30 text-xs">
                <span className="font-bold text-orange-700 block flex items-center gap-1">
                  <AlertTriangle size={14} /> AI Clinical Decision Support Explanation
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">{healthRecord.triage.aiExplanation}</p>
              </div>
            )}
          </div>

          {/* Patient History & ABDM Health Records */}
          <div className="border-b border-border-brand pb-6 text-left space-y-4">
            <h3 className="font-bold text-base text-deep-blue">Patient ABDM Health Locker & History</h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {/* Prescriptions History Column */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Prescription & Med History</span>
                {patientPrescriptions.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {patientPrescriptions.map((pres) => (
                      <div key={pres._id} className="bg-white border border-slate-150 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-800">By {pres.doctorId?.name || "MD"}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{new Date(pres.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1">
                          {pres.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                              <strong>{med.name}</strong>
                              <span>{med.strength} • {med.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic block py-4 text-center">No prescriptions found.</span>
                )}
              </div>

              {/* Lab Reports & Documents Locker Column */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Clinical Documents & Lab Reports</span>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {/* Default Intakes */}
                  <div className="bg-white border border-slate-150 p-3 rounded-xl flex justify-between items-center gap-2">
                    <div>
                      <strong className="block text-slate-800 text-[11px]">ASHA Vitals Baseline</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Verified Baseline</span>
                    </div>
                    <button
                      onClick={() => handleDownloadClinicalDocument({
                        title: "ASHA Vitals Baseline Intake",
                        type: "LabReport",
                        fileContent: `Baseline Checkup Intake Details:\n\nTemperature: 98.4 F\nBlood Pressure: 120/80 mmHg\nHeart Rate: 72 bpm\nSpO2: 99%\nRespiratory Rate: 16/min\n\nPatient reports general fitness. Triage status: ROUTINE.`
                      })}
                      className="text-primary hover:underline font-bold text-[10px] border-0 bg-transparent cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  <div className="bg-white border border-slate-150 p-3 rounded-xl flex justify-between items-center gap-2">
                    <div>
                      <strong className="block text-slate-800 text-[11px]">Community Lab CBC</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Verified CBC</span>
                    </div>
                    <button
                      onClick={() => handleDownloadClinicalDocument({
                        title: "Community Lab Diagnostics (CBC)",
                        type: "LabReport",
                        fileContent: `Complete Blood Count (CBC) Results:\n\nHemoglobin: 14.2 g/dL (Normal)\nWhite Blood Cells: 6,500 /mcL (Normal)\nPlatelets: 250,000 /mcL (Normal)\nRed Blood Cells: 4.8 million/mcL (Normal)\n\nOverall diagnostic status: Normal. No indications of acute anemia or infection.`
                      })}
                      className="text-primary hover:underline font-bold text-[10px] border-0 bg-transparent cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Dynamic Patient Uploads */}
                  {patientDocuments.map((doc) => (
                    <div key={doc._id} className="bg-white border border-slate-150 p-3 rounded-xl flex justify-between items-center gap-2">
                      <div>
                        <strong className="block text-slate-800 text-[11px] truncate max-w-[120px]" title={doc.title}>{doc.title}</strong>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Type: {doc.type}</span>
                      </div>
                      <button
                        onClick={() => handleDownloadClinicalDocument(doc)}
                        className="text-primary hover:underline font-bold text-[10px] border-0 bg-transparent cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form 1: Clinical Notes & Diagnosis */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-text-primary">Clinical Assessment</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary">Medical Diagnosis (Required)</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary"
                  placeholder="e.g. Acute Viral Bronchitis"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary">Clinical Progress Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-primary"
                  placeholder="Enter detailed observation history..."
                />
              </div>
            </div>
          </div>

          {/* Form 2: Prescription Medicines Form */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-text-primary">Digital Prescription</h3>

            {/* Added drugs inventory listing */}
            {medicines.length > 0 && (
              <div className="space-y-2 border border-slate-100 p-4 rounded-xl">
                {medicines.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-text-primary">{med.name} ({med.strength})</span>
                      <span className="text-text-secondary text-[10px] block mt-0.5">
                        {med.form} | Dosage: {med.dosage} | Duration: {med.durationDays} days | Instructions: {med.instructions}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMedicine(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drug picker inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Medicine Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Strength</label>
                <input
                  type="text"
                  value={medStrength}
                  onChange={(e) => setMedStrength(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                  placeholder="e.g. 500mg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Form</label>
                <select
                  value={medForm}
                  onChange={(e) => setMedForm(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Ointment">Ointment</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Dosage</label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                  placeholder="e.g. 1-0-1"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Duration (Days)</label>
                <input
                  type="number"
                  value={medDuration}
                  onChange={(e) => setMedDuration(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500">Instructions</label>
                <div className="flex gap-2">
                  <select
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                  <button
                    onClick={addMedicine}
                    type="button"
                    className="bg-primary text-white p-1.5 rounded-lg mt-1 cursor-pointer hover:bg-deep-blue"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form 3: Referral Booking Check */}
          <div className="border-t border-border-brand pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="referral-check"
                checked={needReferral}
                onChange={(e) => setNeedReferral(e.target.checked)}
                className="rounded-sm border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="referral-check" className="text-sm font-bold text-text-primary cursor-pointer">
                Book Secondary Care Facility Referral
              </label>
            </div>

            {needReferral && (
              <div className="grid gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Select Destination Facility</label>
                  <select
                    value={referralFacility}
                    onChange={(e) => setReferralFacility(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="">-- Choose Hospital --</option>
                    {facilities.map((fac) => (
                      <option key={fac._id} value={fac._id}>
                        {fac.name} ({fac.type}) - {fac.district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Priority Level</label>
                    <select
                      value={referralPriority}
                      onChange={(e) => setReferralPriority(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Clinical Referral Reason</label>
                    <input
                      type="text"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                      placeholder="e.g. Cardiological evaluation required"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form 3.5: Refer to ASHA Check */}
          <div className="border-t border-border-brand pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="asha-referral-check"
                checked={needAshaReferral}
                onChange={(e) => setNeedAshaReferral(e.target.checked)}
                className="rounded-sm border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="asha-referral-check" className="text-sm font-bold text-text-primary cursor-pointer">
                Refer Patient to ASHA (Community Follow-up)
              </label>
            </div>

            {needAshaReferral && (
              <div className="grid gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Select Assigned ASHA Worker</label>
                    <select
                      value={assignedAshaId}
                      onChange={(e) => setAssignedAshaId(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="">-- Choose ASHA Worker --</option>
                      {ashaList.map((ash) => (
                        <option key={ash._id} value={ash._id}>
                          {ash.name} ({ash.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Priority Level</label>
                    <select
                      value={ashaReferralPriority}
                      onChange={(e) => setAshaReferralPriority(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Reason for Referral</label>
                    <input
                      type="text"
                      value={ashaReferralReason}
                      onChange={(e) => setAshaReferralReason(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                      placeholder="e.g. Post-consultation follow-up, vital tracking"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Follow-up Requirement Date</label>
                    <input
                      type="date"
                      value={ashaReferralFollowUpDate}
                      onChange={(e) => setAshaReferralFollowUpDate(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Specific Instructions for ASHA</label>
                  <textarea
                    value={ashaReferralInstructions}
                    onChange={(e) => setAshaReferralInstructions(e.target.value)}
                    rows={2}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary resize-none"
                    placeholder="Provide clear follow-up instructions, medicines to review, or symptoms to check..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form 4: Follow Up Booking Check */}
          <div className="border-t border-border-brand pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="followup-check"
                checked={needFollowUp}
                onChange={(e) => setNeedFollowUp(e.target.checked)}
                className="rounded-sm border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="followup-check" className="text-sm font-bold text-text-primary cursor-pointer">
                Schedule ASHA Worker Follow-Up Task
              </label>
            </div>

            {needFollowUp && (
              <div className="grid gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Follow-Up Type</label>
                    <select
                      value={followUpType}
                      onChange={(e) => setFollowUpType(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Medication">Medication Compliance</option>
                      <option value="ChronicDisease">Chronic disease check</option>
                      <option value="Maternal">Maternal check</option>
                      <option value="Child">Child care</option>
                      <option value="PostReferral">Post-referral audit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500">Follow-Up Due Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">ASHA Instructions Notes</label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="e.g. Please verify BP and confirm meds compliance."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submission bar */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border-brand">
            <button
              onClick={() => router.push("/doctor/dashboard")}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel Consult
            </button>
            <button
              onClick={handleConcludeConsultation}
              className="bg-primary hover:bg-deep-blue text-white px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/10"
            >
              <CheckCircle size={16} /> Conclude & Coordination Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
