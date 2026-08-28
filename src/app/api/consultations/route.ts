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

    // Patients can only query their own consultations
    if (user.role === "Patient") {
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
        return NextResponse.json({ success: true, consultations: [] });
      }
    } else if (user.role === "Doctor" || user.role === "Specialist") {
      query.doctorId = user.userId;
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
    const user = await authenticateRequest(["Doctor", "Specialist", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { consultationId, clinicalNotes, diagnosis, status, durationSeconds } = body;

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
        action: "PrescriptionCreation", // Log clinical updates
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
