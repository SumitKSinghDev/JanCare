import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { username, password, isOtpLogin } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username/Mobile is required" },
        { status: 400 }
      );
    }

    if (!isOtpLogin && !password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found or invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password if not OTP verification sandbox
    if (!isOtpLogin) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid username or password" },
          { status: 401 }
        );
      }
    }

    // Fetch corresponding patient details if user is a Patient
    let patientId = null;
    let patientRefId = null;
    if (user.role === "Patient") {
      const patient = await Patient.findOne({ mobile: user.username });
      if (patient) {
        patientId = patient._id;
        patientRefId = patient.patientRefId;
      }
    }

    // Sign JWT token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "jancare_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully logged in",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        patientId,
        patientRefId,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
