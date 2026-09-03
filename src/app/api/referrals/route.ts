import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Referral from "@/models/Referral";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "FacilityAdmin", "DistrictAdmin", "SystemAdmin", "ASHA", "ANM", "Patient"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const facilityId = searchParams.get("facilityId");
    const patientId = searchParams.get("patientId");

    const query: any = {};
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    if (user.role === "Doctor" || user.role === "Specialist") {
      // Find referrals referred by doctor or sent to their associated facility
      const doc = await User.findById(user.userId);
      if (doc && doc.associatedFacility) {
        query.$or = [
          { referringDoctorId: user.userId },
          { destinationFacilityId: doc.associatedFacility },
        ];
      } else {
        query.referringDoctorId = user.userId;
      }
    } else if (facilityId) {
      query.$or = [
        { referringFacilityId: facilityId },
        { destinationFacilityId: facilityId },
      ];
    } else if (user.role === "ASHA" || user.role === "ANM") {
      query.$or = [
        { assignedAshaId: user.userId },
        { assignedAshaId: null },
        { assignedAshaId: { $exists: false } },
        { status: { $ne: "Completed" } }
      ];
    } else if (user.role === "Patient") {
      const PatientModel = (await import("@/models/Patient")).default;
      const dbUser = await User.findById(user.userId);
      const patient = await PatientModel.findOne({
        $or: [
          { mobile: dbUser?.username },
          { name: user.name }
        ]
      });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ success: true, referrals: [] });
      }
    }

    const referrals = await Referral.find(query)
      .populate("patientId")
      .populate("referringDoctorId", "name role")
      .populate("referringFacilityId", "name type")
      .populate("destinationFacilityId", "name type")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, referrals });
  } catch (error: any) {
    console.error("Failed to query referrals:", error);
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
    const { patientId, destinationFacilityId, assignedAshaId, reason, priority, notes, appointmentDate, instructions, followUpDate } = body;

    if (!patientId || (!destinationFacilityId && !assignedAshaId) || !reason || !priority) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const doctorRecord = await User.findById(user.userId);
    const referringFacilityId = doctorRecord?.associatedFacility || undefined;

    const referral = await Referral.create({
      patientId,
      referringDoctorId: user.userId as any,
      referringFacilityId,
      destinationFacilityId: destinationFacilityId || undefined,
      assignedAshaId: assignedAshaId || undefined,
      reason,
      priority,
      status: "Created",
      notes,
      instructions,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
    });

    // Create system notification for ASHA and destination facility admins
    const patient = await Patient.findById(patientId);
    if (patient) {
      if (destinationFacilityId) {
        // Find destination facility doctors
        const destDocs = await User.find({ role: "Doctor", associatedFacility: destinationFacilityId });
        for (const destDoc of destDocs) {
          await Notification.create({
            userId: destDoc._id as any,
            title: `Incoming ${priority} Referral`,
            message: `Patient ${patient.name} has been referred to your facility for: ${reason}. Status: Created.`,
            type: "Referral",
          });
        }
      }

      if (assignedAshaId) {
        await Notification.create({
          userId: assignedAshaId as any,
          title: "New patient referral",
          message: `New Referral for ${patient.name} from Dr. ${user.name || "Doctor"}: ${reason}. Priority: ${priority}.`,
          type: "Referral",
        });
      }

      // Notify patient's registering ASHA if they exist
      if (patient.registeredBy && patient.registeredBy.toString() !== assignedAshaId) {
        await Notification.create({
          userId: patient.registeredBy,
          title: `Referral Registered`,
          message: `Referral created for ${patient.name} to Sinnar Rural Hospital. Please coordinate travel.`,
          type: "Referral",
        });
      }
    }

    // Log action for security audit
    await AuditLog.create({
      userId: user.userId as any,
      action: "ReferralCreation",
      patientId,
      details: `Created referral to facility: ${destinationFacilityId}. Reason: ${reason}`,
    });

    return NextResponse.json({
      success: true,
      message: "Referral successfully initiated",
      referral,
    });
  } catch (error: any) {
    console.error("Failed to initiate referral:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "FacilityAdmin", "SystemAdmin", "ASHA", "ANM"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { referralId, status, appointmentDate, notes } = body;

    if (!referralId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return NextResponse.json({ success: false, error: "Referral not found" }, { status: 404 });
    }

    // Update referral
    referral.status = status;
    if (appointmentDate) referral.appointmentDate = new Date(appointmentDate);
    if (notes) referral.notes = notes;
    await referral.save();

    // Log action
    await AuditLog.create({
      userId: user.userId as any,
      action: "RecordModification",
      patientId: referral.patientId,
      details: `Updated referral ID: ${referralId} status to ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: `Referral status successfully updated to ${status}`,
      referral,
    });
  } catch (error: any) {
    console.error("Failed to update referral:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
