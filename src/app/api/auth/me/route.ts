import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { findDemoUser } from "@/lib/demoUsers";

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

    // Try finding in database if connected
    let dbConnected = false;
    let user: any = null;

    try {
      await connectToDatabase();
      dbConnected = true;
      user = await User.findById(decoded.userId).populate("associatedFacility");
    } catch (e: any) {
      console.warn("DB lookup during /api/auth/me failed:", e.message);
    }

    if (user) {
      // Retrieve patient profile if the user's role is Patient
      let patientId = null;
      let patientRefId = null;
      if (user.role === "Patient") {
        try {
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
        } catch (e) {}
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
    }

    // Fallback: If DB is unreachable or user not found in DB, retrieve from demo users or decoded token
    const demo = findDemoUser(decoded.role) || findDemoUser(decoded.name) || findDemoUser(decoded.userId);
    if (demo) {
      return NextResponse.json({
        success: true,
        user: {
          ...demo,
          name: decoded.name || demo.name,
          role: decoded.role || demo.role,
        },
      });
    }

    // Safe fallback using decoded token payload
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        name: decoded.name || "JanCare User",
        role: decoded.role,
        patientId: decoded.role === "Patient" ? "demo-patient-01" : null,
        patientRefId: decoded.role === "Patient" ? "JC-7F3K92" : null,
        isOfflineDemo: true,
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
