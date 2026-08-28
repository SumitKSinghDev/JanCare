import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ClinicalDocument from "@/models/ClinicalDocument";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "Doctor", "Specialist", "ASHA", "SystemAdmin", "FacilityAdmin", "DistrictAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    let patientId = searchParams.get("patientId");

    if (user.role === "Patient") {
      const dbUser = await User.findById(user.userId);
      const patient = await Patient.findOne({
        $or: [
          { mobile: dbUser?.username },
          { name: user.name }
        ]
      });
      if (patient) {
        patientId = patient._id.toString();
      } else {
        return NextResponse.json({ success: true, documents: [] });
      }
    }

    if (!patientId) {
      return NextResponse.json({ success: false, error: "Missing patientId" }, { status: 400 });
    }

    const documents = await ClinicalDocument.find({ patientId })
      .populate("recordedBy", "name role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error("Failed to query clinical documents:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "Doctor", "Specialist", "ASHA", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    let { patientId, title, type, fileContent, fileUrl } = body;

    if (user.role === "Patient") {
      const dbUser = await User.findById(user.userId);
      const patient = await Patient.findOne({
        $or: [
          { mobile: dbUser?.username },
          { name: user.name }
        ]
      });
      if (patient) {
        patientId = patient._id.toString();
      } else {
        return NextResponse.json({ success: false, error: "Patient profile not found" }, { status: 404 });
      }
    }

    if (!patientId || !title || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields (patientId, title, type)" }, { status: 400 });
    }

    const doc = await ClinicalDocument.create({
      patientId,
      title,
      type,
      fileUrl: fileUrl || undefined,
      fileContent: fileContent || "Simulated lab results: normal ranges. Blood count and sugar levels verified.",
      recordedBy: user.userId as any,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error("Failed to create clinical document:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
