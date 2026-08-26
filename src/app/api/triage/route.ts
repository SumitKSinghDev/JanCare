import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Patient from "@/models/Patient";
import HealthRecord from "@/models/HealthRecord";
import Facility from "@/models/Facility";
import Consultation from "@/models/Consultation";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { runTriageAssessment } from "@/lib/providers/ai";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["ASHA", "ANM", "Doctor", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { patientId, vitals, symptoms, recommendedFacilityId } = body;

    if (!patientId || !vitals || !symptoms) {
      return NextResponse.json({ success: false, error: "Missing required fields (patientId, vitals, symptoms)" }, { status: 400 });
    }

    // Fetch patient demographics
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    // Run AI Triage Engine
    const triageResult = await runTriageAssessment(
      vitals,
      symptoms,
      patient.age,
      patient.gender
    );

    // Find recommended facility if not provided
    let facilityId = recommendedFacilityId;
    if (!facilityId) {
      // Find nearest/suitable facility matching taluka and type
      const matchedFacility = await Facility.findOne({
        district: patient.district,
        taluka: patient.taluka,
      });
      facilityId = matchedFacility ? matchedFacility._id : null;
    }

    // Create the health record
    const healthRecord = await HealthRecord.create({
      patientId,
      recordedBy: user.userId as any,
      vitals,
      symptoms,
      triage: {
        level: triageResult.level,
        reason: triageResult.reason,
        aiExplanation: triageResult.aiExplanation,
        recommendedFacilityId: facilityId || undefined,
        triageDate: new Date(),
      },
      offlineCreated: false,
    });

    // Auto-coordination: If triage is Urgent or Priority, automatically schedule a pending Consultation
    // and queue appointment with a doctor at the recommended facility
    if (facilityId && (triageResult.level === "Urgent" || triageResult.level === "Priority")) {
      // Find an available doctor at that facility
      const doctor = await User.findOne({
        role: "Doctor",
        associatedFacility: facilityId,
      });

      if (doctor) {
        // Create consultation
        const consultation = await Consultation.create({
          patientId: patient._id,
          doctorId: doctor._id,
          facilityId,
          healthRecordId: healthRecord._id,
          status: "Scheduled",
          videoRoomName: `jancare-consult-${patient.patientRefId.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        });

        // Determine queue number
        const count = await Appointment.countDocuments({
          doctorId: doctor._id,
          status: "Scheduled",
        });

        await Appointment.create({
          patientId: patient._id,
          doctorId: doctor._id,
          facilityId,
          appointmentDate: new Date(),
          status: "Scheduled",
          queueNumber: count + 1,
          estimatedWaitMinutes: (count + 1) * 15,
        });

        // Add Notification for Doctor
        await Notification.create({
          userId: doctor._id as any,
          title: `New ${triageResult.level} Patient Assigned`,
          message: `${patient.name} (${patient.gender}, ${patient.age}y) has been triaged as ${triageResult.level} and assigned to your queue.`,
          type: "Appointment",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Health record logged and triage completed",
      healthRecord,
      triage: triageResult,
    });
  } catch (error: any) {
    console.error("Triage recording failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
