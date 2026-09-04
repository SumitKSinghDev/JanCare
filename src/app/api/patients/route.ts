import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";
import { isValidIndianMobile, sanitizeIndianMobile } from "@/lib/validation";

// Helper to generate a random JC patient reference ID: JC-XXXXXX
function generatePatientRefId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JC-${result}`;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["ASHA", "ANM", "Doctor", "Specialist", "FacilityAdmin", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const district = searchParams.get("district") || "";
    const taluka = searchParams.get("taluka") || "";
    const village = searchParams.get("village") || "";

    // Build query filters
    const query: any = {};
    const conditions: any[] = [];

    if (user.role === "ASHA" || user.role === "ANM") {
      const Referral = (await import("@/models/Referral")).default;
      const referredPatientIds = await Referral.find({ assignedAshaId: user.userId }).distinct("patientId");
      conditions.push({
        $or: [
          { registeredBy: user.userId },
          { _id: { $in: referredPatientIds } }
        ]
      });
    }

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { patientRefId: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ]
      });
    }

    if (district) query.district = district;
    if (taluka) query.taluka = taluka;
    if (village) query.village = village;

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, patients });
  } catch (error: any) {
    console.error("Failed to query patients:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await authenticateRequest(["ASHA", "ANM", "Doctor", "SystemAdmin"]);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const {
      name,
      age,
      dateOfBirth,
      gender,
      mobile,
      email,
      division,
      district,
      taluka,
      village,
      preferredLanguage,
      emergencyContact,
    } = body;

    if (!name || !age || !dateOfBirth || !gender || !mobile || !division || !district || !taluka || !village || !emergencyContact) {
      return NextResponse.json({ success: false, error: "Missing required demographic fields" }, { status: 400 });
    }

    const cleanMobile = sanitizeIndianMobile(mobile);
    if (!isValidIndianMobile(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9822114400)" },
        { status: 400 }
      );
    }

    // Generate unique patientRefId
    let uniqueId = false;
    let refId = "";
    while (!uniqueId) {
      refId = generatePatientRefId();
      const existing = await Patient.findOne({ patientRefId: refId });
      if (!existing) uniqueId = true;
    }

    const patient = await Patient.create({
      patientRefId: refId,
      name,
      age: Number(age),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      mobile: cleanMobile,
      email: email || "",
      state: "Maharashtra",
      division,
      district,
      taluka,
      village,
      preferredLanguage: preferredLanguage || "Marathi",
      emergencyContact: {
        ...emergencyContact,
        mobile: sanitizeIndianMobile(emergencyContact.mobile || emergencyContact.phone || cleanMobile),
      },
      abhaLinked: false,
      registeredBy: currentUser.userId as any,
    });

    return NextResponse.json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error: any) {
    console.error("Failed to register patient:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
