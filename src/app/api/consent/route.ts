import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Consent from "@/models/Consent";
import Patient from "@/models/Patient";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "SystemAdmin", "DistrictAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Resolve patient details
    let patientDoc = null;
    const dbUser = await User.findById(user.userId);
    if (dbUser) {
      patientDoc = await Patient.findOne({ mobile: dbUser.username });
    }
    if (!patientDoc) {
      patientDoc = await Patient.findOne({ name: user.name });
    }

    if (!patientDoc) {
      return NextResponse.json({ success: true, consents: [] });
    }

    const consents = await Consent.find({ patientId: patientDoc._id })
      .populate("grantedToDoctorId", "name role")
      .populate("grantedToFacilityId", "name type")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, consents });
  } catch (error: any) {
    console.error("Failed to query consents:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { doctorId, facilityId, purpose, expiryDays } = body;

    // Resolve patient details
    let patientDoc = null;
    const dbUser = await User.findById(user.userId);
    if (dbUser) {
      patientDoc = await Patient.findOne({ mobile: dbUser.username });
    }
    if (!patientDoc) {
      patientDoc = await Patient.findOne({ name: user.name });
    }

    if (!patientDoc) {
      return NextResponse.json({ success: false, error: "Patient profile not found" }, { status: 404 });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    const consent = await Consent.create({
      patientId: patientDoc._id,
      grantedToDoctorId: doctorId || undefined,
      grantedToFacilityId: facilityId || undefined,
      purpose: purpose || "General Clinical Consultation and Diagnosis evaluation",
      status: "Active",
      expiryDate,
    });

    // Log action to security audit
    await AuditLog.create({
      userId: user.userId as any,
      action: "ConsentChange",
      patientId: patientDoc._id,
      details: `Granted clinical data access consent to doctor/facility. Expiry: ${expiryDate.toLocaleDateString()}`,
    });

    return NextResponse.json({ success: true, consent });
  } catch (error: any) {
    console.error("Failed to create consent:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { consentId, status } = body; // status can be "Withdrawn"

    if (!consentId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const consent = await Consent.findById(consentId);
    if (!consent) {
      return NextResponse.json({ success: false, error: "Consent record not found" }, { status: 404 });
    }

    consent.status = status;
    await consent.save();

    // Log action to security audit
    await AuditLog.create({
      userId: user.userId as any,
      action: "ConsentChange",
      patientId: consent.patientId,
      details: `Consent ID: ${consentId} status updated to ${status}.`,
    });

    return NextResponse.json({ success: true, consent });
  } catch (error: any) {
    console.error("Failed to update consent:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
