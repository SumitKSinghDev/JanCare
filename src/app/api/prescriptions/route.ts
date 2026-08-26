import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Prescription from "@/models/Prescription";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const query: any = {};
    if (patientId && patientId.trim() !== "" && patientId !== "undefined" && patientId !== "null") {
      query.patientId = patientId;
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
        return NextResponse.json({ success: true, prescriptions: [] });
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "name role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, prescriptions });
  } catch (error: any) {
    console.error("Failed to query prescriptions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
