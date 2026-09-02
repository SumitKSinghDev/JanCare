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

    // Find user by exact username
    let user = await User.findOne({ username: username.trim() });
    
    // If not found by direct username, check if username is a Patient ID (JC-...) or Mobile Number
    if (!user) {
      const patientMatch = await Patient.findOne({
        $or: [
          { patientRefId: username.toUpperCase().trim() },
          { mobile: username.trim() },
        ]
      });

      if (patientMatch) {
        user = await User.findOne({
          $or: [
            { username: patientMatch.mobile },
            { name: patientMatch.name }
          ]
        });

        // If patient exists in database but User account hasn't been created yet, create it on the fly
        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const defaultHash = await bcrypt.hash("password123", salt);
          user = await User.create({
            name: patientMatch.name,
            username: patientMatch.mobile || patientMatch.patientRefId,
            passwordHash: defaultHash,
            role: "Patient",
          });
        }
      }
    }

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
      const patient = await Patient.findOne({
        $or: [
          { mobile: user.username },
          { name: user.name },
          { patientRefId: username.toUpperCase().trim() }
        ]
      });
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
