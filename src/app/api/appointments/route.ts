import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "Patient", "ASHA", "ANM", "FacilityAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status") || "Scheduled";

    const query: any = {};
    if (status) query.status = status;

    if (user.role === "Doctor" || user.role === "Specialist") {
      query.doctorId = user.userId;
    } else if (doctorId) {
      query.doctorId = doctorId;
    }

    // Sort by scheduled queue order
    const appointments = await Appointment.find(query)
      .populate("patientId")
      .populate("doctorId", "name role")
      .populate("facilityId")
      .sort({ queueNumber: 1 });

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error("Failed to query appointments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await authenticateRequest(["ASHA", "ANM", "Doctor", "Patient", "SystemAdmin"]);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { patientId, doctorId, facilityId, appointmentDate } = body;

    let resolvedFacilityId = facilityId;
    let resolvedDoctorId = doctorId;

    if (!resolvedFacilityId || !resolvedDoctorId) {
      const Facility = (await import("@/models/Facility")).default;
      const User = (await import("@/models/User")).default;

      const firstChc = await Facility.findOne({ type: "CHC" });
      if (firstChc) {
        resolvedFacilityId = resolvedFacilityId || firstChc._id;
        const firstDoc = await User.findOne({ role: "Doctor", associatedFacility: firstChc._id });
        if (firstDoc) {
          resolvedDoctorId = resolvedDoctorId || firstDoc._id;
        }
      }
    }

    if (!patientId || !resolvedDoctorId || !resolvedFacilityId || !appointmentDate) {
      return NextResponse.json({ success: false, error: "Missing required fields or cannot resolve doctor/facility" }, { status: 400 });
    }

    // Determine queue position
    const dateQuery = new Date(appointmentDate);
    const startOfDay = new Date(dateQuery.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateQuery.setHours(23, 59, 59, 999));

    const count = await Appointment.countDocuments({
      doctorId: resolvedDoctorId,
      status: "Scheduled",
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const appointment = await Appointment.create({
      patientId,
      doctorId: resolvedDoctorId,
      facilityId: resolvedFacilityId,
      appointmentDate: new Date(appointmentDate),
      status: "Scheduled",
      queueNumber: count + 1,
      estimatedWaitMinutes: (count + 1) * 15,
    });

    // Auto-create consultation & dummy health record for teleconsultation video linkage
    const Consultation = (await import("@/models/Consultation")).default;
    const HealthRecord = (await import("@/models/HealthRecord")).default;
    const Patient = (await import("@/models/Patient")).default;

    const patient = await Patient.findById(patientId);
    const refLabel = patient ? patient.patientRefId.toLowerCase() : "direct";

    let healthRecord = await HealthRecord.findOne({ patientId });
    if (!healthRecord) {
      healthRecord = await HealthRecord.create({
        patientId,
        recordedBy: resolvedDoctorId,
        vitals: {
          temperature: 98.6,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          heartRate: 72,
          spo2: 98,
          respiratoryRate: 16
        },
        symptoms: [{ name: "Routine checkup", durationDays: 1, severity: "Mild" }],
        triage: {
          level: "Routine",
          reason: "Direct patient booking",
          aiExplanation: "Routine checkup initiated by patient.",
          triageDate: new Date()
        },
        offlineCreated: false
      });
    }

    await Consultation.create({
      patientId,
      doctorId: resolvedDoctorId,
      facilityId: resolvedFacilityId,
      healthRecordId: healthRecord._id,
      status: "Scheduled",
      videoRoomName: `jancare-consult-${refLabel}-${Date.now().toString().slice(-4)}`
    });

    return NextResponse.json({
      success: true,
      message: "Appointment and Video Consultation successfully scheduled",
      appointment,
    });
  } catch (error: any) {
    console.error("Failed to schedule appointment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
