import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("jancare_token");

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(tokenCookie.value);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).populate("associatedFacility");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Retrieve patient profile if the user's role is Patient
    let patientId = null;
    let patientRefId = null;
    if (user.role === "Patient") {
      const patient = await Patient.findOne({
        $or: [
          { mobile: user.username },
          { name: user.name }
        ]
      });
      if (patient) {
        patientId = patient._id;
        patientRefId = patient.patientRefId;
        return NextResponse.json({
          success: true,
          user: {
            id: user._id,
            name: patient.name || user.name,
            username: user.username,
            role: user.role,
            associatedFacility: user.associatedFacility,
            patientId,
            patientRefId,
            age: patient.age,
            gender: patient.gender,
            mobile: patient.mobile,
            division: patient.division,
            district: patient.district,
            taluka: patient.taluka,
            village: patient.village,
            abhaLinked: patient.abhaLinked,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        associatedFacility: user.associatedFacility,
        patientId,
        patientRefId,
      },
    });
  } catch (error: any) {
    console.error("Auth status query error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
