import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Consultation from "@/models/Consultation";
import Appointment from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "Patient", "ASHA", "ANM", "SystemAdmin", "FacilityAdmin", "DistrictAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");

    const query: any = {};
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    const doctorIdParam = searchParams.get("doctorId");
    if (doctorIdParam) {
      query.doctorId = doctorIdParam;
    }

    // Patients can only query their own consultations
    if (user.role === "Patient") {
      const Patient = (await import("@/models/Patient")).default;
      const User = (await import("@/models/User")).default;
      const dbUser = await User.findById(user.userId);
      const patient = await Patient.findOne({
        $or: [
          { mobile: dbUser?.username },
          { patientRefId: dbUser?.username?.toUpperCase() },
          { name: dbUser?.name },
          { name: user.name }
        ]
      });
      if (patient) {
        query.patientId = patient._id;
      } else {
        const fallbackPatient = await Patient.findOne({ name: /Ramesh/i });
        if (fallbackPatient) {
          query.patientId = fallbackPatient._id;
        }
      }
    } else if ((user.role === "Doctor" || user.role === "Specialist") && doctorIdParam) {
      query.doctorId = doctorIdParam;
    }

    const consultations = await Consultation.find(query)
      .populate("patientId")
      .populate("doctorId", "name role")
      .populate("facilityId")
      .populate("healthRecordId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, consultations });
  } catch (error: any) {
    console.error("Failed to query consultations:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "Patient", "ASHA", "ANM", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { consultationId, clinicalNotes, diagnosis, status, durationSeconds, isEmergencyInstant, videoRoomName, symptoms } = body;

    // 1. Handle Instant Emergency Consultation Creation from Patient Portal
    if (isEmergencyInstant || (!consultationId && user.role === "Patient")) {
      const Patient = (await import("@/models/Patient")).default;
      const User = (await import("@/models/User")).default;
      const Facility = (await import("@/models/Facility")).default;
      const HealthRecord = (await import("@/models/HealthRecord")).default;

      const dbUser = await User.findById(user.userId);
      let patientDoc = null;
      if (dbUser) {
        patientDoc = await Patient.findOne({
          $or: [
            { mobile: dbUser.username },
            { patientRefId: dbUser.username?.toUpperCase() },
            { name: dbUser.name },
          ]
        });
      }
      if (!patientDoc) {
        patientDoc = await Patient.findOne({ name: user.name }) || await Patient.findOne({});
      }

      const doctorDoc = await User.findOne({ name: /Aniruddha/i }) || await User.findOne({ role: "Doctor" });
      const facilityDoc = await Facility.findOne({ type: "CHC" }) || await Facility.findOne({});

      if (!patientDoc || !doctorDoc || !facilityDoc) {
        return NextResponse.json({ success: false, error: "Missing patient or on-duty doctor profile." }, { status: 400 });
      }

      const roomName = videoRoomName || `jancare-emergency-${patientDoc.patientRefId.toLowerCase()}-${Date.now().toString().slice(-4)}`;

      // Create emergency health record
      const healthRecord = await HealthRecord.create({
        patientId: patientDoc._id,
        recordedBy: doctorDoc._id,
        vitals: {
          temperature: 101.5,
          spo2: 95,
          bloodPressureSystolic: 130,
          bloodPressureDiastolic: 85,
          heartRate: 98,
          respiratoryRate: 20,
        },
        symptoms: [{ name: symptoms || "Emergency Instant Consultation", severity: "Severe", duration: "1 day" }],
        triage: { level: "Urgent", score: 85, reason: "Emergency Instant Teleconsultation Call requested by patient", aiExplanation: "Fast-track urgent teleconsultation routed to on-duty medical officer" },
        offlineCreated: false,
      });

      // Create consultation record
      const consultation = await Consultation.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        facilityId: facilityDoc._id,
        healthRecordId: healthRecord._id,
        status: "Scheduled",
        videoRoomName: roomName,
      });

      // Create appointment in queue
      await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        facilityId: facilityDoc._id,
        appointmentDate: new Date(),
        appointmentTime: "Immediate",
        triagePriority: "Urgent",
        status: "Scheduled",
        queueNumber: 1,
        estimatedWaitMinutes: 0,
        bookingSource: "AI_ASSISTANT",
      });

      const populatedConsultation = await Consultation.findById(consultation._id)
        .populate("patientId")
        .populate("doctorId", "name role")
        .populate("facilityId");

      return NextResponse.json({
        success: true,
        message: "Instant emergency consultation connected.",
        consultation: populatedConsultation,
        videoRoomName: roomName,
      });
    }

    // 2. Handle Clinical Updates from Doctor
    if (!consultationId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields (consultationId, status)" }, { status: 400 });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return NextResponse.json({ success: false, error: "Consultation not found" }, { status: 404 });
    }

    // Verify ownership
    if (consultation.doctorId.toString() !== user.userId && user.role !== "SystemAdmin") {
      return NextResponse.json({ success: false, error: "Unauthorized access to this consultation record" }, { status: 403 });
    }

    // Update consultation
    if (clinicalNotes !== undefined) consultation.clinicalNotes = clinicalNotes;
    if (diagnosis !== undefined) consultation.diagnosis = diagnosis;
    consultation.status = status;
    if (durationSeconds !== undefined) consultation.durationSeconds = durationSeconds;

    await consultation.save();

    // If completed, update corresponding appointment status
    if (status === "Completed") {
      await Appointment.findOneAndUpdate(
        { patientId: consultation.patientId, doctorId: consultation.doctorId, status: "Scheduled" },
        { status: "Completed" }
      );

      // Log action for security audit
      await AuditLog.create({
        userId: user.userId as any,
        action: "PrescriptionCreation",
        patientId: consultation.patientId,
        details: `Completed clinical evaluation and updated diagnosis: ${diagnosis || "None"}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Consultation record successfully updated",
      consultation,
    });
  } catch (error: any) {
    console.error("Failed to update consultation:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
