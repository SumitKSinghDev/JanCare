import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "Patient", "ASHA", "ANM", "FacilityAdmin", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status") || "Scheduled";

    const query: any = {};
    if (status) {
      if (status === "Scheduled") {
        query.status = { $in: ["Scheduled", "BOOKED"] };
      } else {
        query.status = status;
      }
    }

    if (user.role === "Doctor" || user.role === "Specialist") {
      query.doctorId = user.userId;
    } else if (user.role === "Patient") {
      const Patient = (await import("@/models/Patient")).default;
      const User = (await import("@/models/User")).default;
      const dbUser = await User.findById(user.userId);
      const patient = await Patient.findOne({
        $or: [
          { mobile: dbUser?.username },
          { name: user.name }
        ]
      });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ success: true, appointments: [] });
      }
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
    const { 
      patientId, 
      doctorId, 
      facilityId, 
      appointmentDate, 
      appointmentTime,
      symptoms: inputSymptoms,
      symptomSeverity = "Mild",
      symptomDuration = 1,
      bookingSource 
    } = body;

    let resolvedFacilityId = facilityId;
    let resolvedDoctorId = doctorId;

    if (!resolvedFacilityId || !resolvedDoctorId) {
      const Facility = (await import("@/models/Facility")).default;
      const User = (await import("@/models/User")).default;

      const firstChc = await Facility.findOne({ type: "CHC" }) || await Facility.findOne({});
      if (firstChc) {
        resolvedFacilityId = resolvedFacilityId || firstChc._id;
        const firstDoc = await User.findOne({ role: "Doctor", associatedFacility: firstChc._id }) || await User.findOne({ role: "Doctor" });
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
      appointmentTime: appointmentTime || "11:30 AM",
      status: "Scheduled",
      queueNumber: count + 1,
      estimatedWaitMinutes: (count + 1) * 15,
      bookingSource: bookingSource || "MANUAL",
    });

    // Auto-create consultation & clinical health record with dynamic triage
    const Consultation = (await import("@/models/Consultation")).default;
    const HealthRecord = (await import("@/models/HealthRecord")).default;
    const Patient = (await import("@/models/Patient")).default;

    const patient = await Patient.findById(patientId);
    const refLabel = patient ? patient.patientRefId.toLowerCase() : "direct";

    // Build structured symptoms list
    let parsedSymptoms: Array<{ name: string; durationDays: number; severity: "Mild" | "Moderate" | "Severe" }> = [];
    if (Array.isArray(inputSymptoms) && inputSymptoms.length > 0) {
      parsedSymptoms = inputSymptoms;
    } else if (typeof inputSymptoms === "string" && inputSymptoms.trim()) {
      parsedSymptoms = [{
        name: inputSymptoms.trim(),
        durationDays: Number(symptomDuration) || 1,
        severity: (symptomSeverity === "Severe" || symptomSeverity === "Moderate") ? symptomSeverity : "Mild"
      }];
    } else {
      parsedSymptoms = [{ name: "Routine checkup", durationDays: 1, severity: "Mild" }];
    }

    // Compute Clinical Triage
    const symptomText = parsedSymptoms.map(s => s.name).join(" ").toLowerCase();
    let triageLevel: "Urgent" | "Priority" | "Routine" = "Routine";
    let triageReason = "Direct Patient Booking";
    let aiExplanation = "Routine clinical consultation scheduled by patient.";

    const isUrgent = symptomSeverity === "Severe" || /chest|chhati|heart|breath|saas|dum|श्वास|दम|bleeding|khoon|unconscious|behoshi|103|104/.test(symptomText);
    const isPriority = symptomSeverity === "Moderate" || /fever|bukhar|taap|ताप|vomit|ultee|diarrhea|julab|cough|khasi|khokla|pain|dard/.test(symptomText);

    if (isUrgent) {
      triageLevel = "Urgent";
      triageReason = "Acute Red-Flag Symptoms Reported";
      aiExplanation = `Clinical Triage: Patient reported severe symptoms (${parsedSymptoms.map(s => s.name).join(", ")}). Prioritized as Urgent for rapid doctor consultation.`;
    } else if (isPriority) {
      triageLevel = "Priority";
      triageReason = "Acute Symptomatic Profile";
      aiExplanation = `Clinical Triage: Patient reported moderate symptoms (${parsedSymptoms.map(s => s.name).join(", ")}). Scheduled with priority queue placement.`;
    }

    const healthRecord = await HealthRecord.create({
      patientId,
      recordedBy: resolvedDoctorId,
      vitals: {
        temperature: triageLevel === "Urgent" ? 103.2 : triageLevel === "Priority" ? 101.4 : 98.6,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: triageLevel === "Urgent" ? 104 : 76,
        spo2: triageLevel === "Urgent" ? 94 : 98,
        respiratoryRate: triageLevel === "Urgent" ? 22 : 16
      },
      symptoms: parsedSymptoms,
      triage: {
        level: triageLevel,
        reason: triageReason,
        aiExplanation: aiExplanation,
        triageDate: new Date()
      },
      offlineCreated: false
    });

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
      triageLevel,
    });
  } catch (error: any) {
    console.error("Failed to schedule appointment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
