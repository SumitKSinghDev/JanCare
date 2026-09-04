import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
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

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      name,
      username,
      password,
      role,
      associatedFacility,
      // Patient specific fields
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

    const allowedRoles = ["Patient", "ASHA", "ANM", "Doctor", "Specialist", "FacilityAdmin", "DistrictAdmin", "SystemAdmin", "MedicineManager"];
    const resolvedRole = allowedRoles.includes(role) ? role : "Patient";

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, username, password)" },
        { status: 400 }
      );
    }

    let finalUsername = username.trim();
    let cleanMobile = sanitizeIndianMobile(mobile || username);

    if (resolvedRole === "Patient") {
      if (!isValidIndianMobile(cleanMobile)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9822114400)" },
          { status: 400 }
        );
      }
      finalUsername = cleanMobile;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: finalUsername });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username (email or mobile) already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User record
    const user = await User.create({
      name,
      username: finalUsername,
      passwordHash,
      role: resolvedRole,
      associatedFacility: associatedFacility || undefined,
    });

    let patientId = null;
    let patientRefId = null;

    // If role is Patient, create corresponding Patient profile
    if (resolvedRole === "Patient") {
      // Generate a unique patientRefId
      let uniqueId = false;
      let refId = "";
      while (!uniqueId) {
        refId = generatePatientRefId();
        const existing = await Patient.findOne({ patientRefId: refId });
        if (!existing) uniqueId = true;
      }

      const patient = await Patient.create({
        patientRefId: refId,
        name: name.trim(),
        age: Number(age) || 30,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("1996-01-01"),
        gender: gender || "Male",
        mobile: cleanMobile,
        email: email || "",
        state: "Maharashtra",
        division: division || "Nashik",
        district: district || "Nashik",
        taluka: taluka || "Sinnar",
        village: village || "Demo Village",
        preferredLanguage: preferredLanguage || "Marathi",
        emergencyContact: emergencyContact || {
          name: "Family Member",
          relation: "Relative",
          mobile: mobile || username,
        },
        abhaLinked: false,
      });

      patientId = patient._id;
      patientRefId = patient.patientRefId;
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
      message: "User successfully registered",
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
