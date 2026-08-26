import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import FollowUp from "@/models/FollowUp";
import AuditLog from "@/models/AuditLog";
import Patient from "@/models/Patient";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["ASHA", "ANM", "Doctor", "Specialist", "Patient", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    if (user.role === "ASHA" || user.role === "ANM") {
      query.assignedWorkerId = user.userId;
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
        return NextResponse.json({ success: true, followups: [] });
      }
    }

    const followups = await FollowUp.find(query)
      .populate("patientId")
      .populate("assignedWorkerId", "name role")
      .sort({ dueDate: 1 });

    return NextResponse.json({ success: true, followups });
  } catch (error: any) {
    console.error("Failed to query follow-ups:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "ASHA", "ANM", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { patientId, assignedWorkerId, type, dueDate, notes } = body;

    if (!patientId || !assignedWorkerId || !type || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const followup = await FollowUp.create({
      patientId,
      assignedWorkerId,
      type,
      dueDate: new Date(dueDate),
      status: "Upcoming",
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Follow-up coordination task scheduled",
      followup,
    });
  } catch (error: any) {
    console.error("Failed to create follow-up:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateRequest(["ASHA", "ANM", "Doctor", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { followupId, status, notes } = body;

    if (!followupId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const followup = await FollowUp.findById(followupId);
    if (!followup) {
      return NextResponse.json({ success: false, error: "Follow-up record not found" }, { status: 404 });
    }

    followup.status = status;
    if (status === "Completed") {
      followup.completedDate = new Date();
    }
    if (notes) followup.notes = notes;
    await followup.save();

    // Log action
    await AuditLog.create({
      userId: user.userId as any,
      action: "RecordModification",
      patientId: followup.patientId,
      details: `Completed follow-up action. Follow-up ID: ${followupId}, Status updated to: ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: "Follow-up coordination task updated successfully",
      followup,
    });
  } catch (error: any) {
    console.error("Failed to update follow-up:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
