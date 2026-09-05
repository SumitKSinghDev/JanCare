import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const patientRefId = searchParams.get("patientRefId");

    let patient = null;
    if (patientRefId) {
      patient = await Patient.findOne({ patientRefId });
    } else {
      const dbUser = await User.findById(user.userId);
      if (dbUser) {
        patient = await Patient.findOne({ mobile: dbUser.username }) || await Patient.findOne({ name: dbUser.name });
      }
    }

    if (!patient) {
      patient = await Patient.findOne({ patientRefId: "JC-7F3K92" }) || await Patient.findOne({});
    }

    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    if (!patient.pmjayWallet || !patient.pmjayWallet.totalAnnualCoverage) {
      patient.pmjayWallet = {
        isEligible: true,
        schemeName: "Ayushman Bharat PM-JAY / MJPJAY",
        totalAnnualCoverage: 500000,
        usedAmount: 175000,
        availableBalance: 325000,
        claimsHistory: [
          {
            claimId: "PMJAY-CLM-8841",
            hospitalName: "Sahyadri Super-Specialty Hospital (Private Empanelled)",
            hospitalType: "Private (Empanelled)",
            procedureName: "Cervical Spine Decompression and Nerve Release",
            packageCode: "NEURO-SP-04",
            amountDeducted: 175000,
            approvalStatus: "Approved & Settled Cashless",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
          }
        ]
      };
      await patient.save();
    }

    return NextResponse.json({
      success: true,
      patientRefId: patient.patientRefId,
      name: patient.name,
      abhaNumber: patient.abhaNumber || "91-4582-9012-7734",
      abhaLinked: patient.abhaLinked,
      wallet: patient.pmjayWallet,
    });
  } catch (error: any) {
    console.error("PM-JAY API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { patientRefId, hospitalName, hospitalType, procedureName, packageCode, amount } = body;

    const dbUser = await User.findById(user.userId);
    let patient = null;
    if (patientRefId) {
      patient = await Patient.findOne({ patientRefId });
    }
    if (!patient && dbUser) {
      patient = await Patient.findOne({ mobile: dbUser.username }) || await Patient.findOne({ name: dbUser.name });
    }
    if (!patient) {
      patient = await Patient.findOne({ patientRefId: "JC-7F3K92" }) || await Patient.findOne({});
    }

    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient record not found" }, { status: 404 });
    }

    const deductAmount = Number(amount) || 45000;
    const currentAvailable = patient.pmjayWallet?.availableBalance ?? 500000;

    if (deductAmount > currentAvailable) {
      return NextResponse.json({
        success: false,
        error: `Insufficient PM-JAY balance. Required: Rs. ${deductAmount}, Available: Rs. ${currentAvailable}`,
      }, { status: 400 });
    }

    const newClaim = {
      claimId: "PMJAY-CLM-" + Math.floor(1000 + Math.random() * 9000),
      hospitalName: hospitalName || "Nashik Super-Specialty Care (Private Empanelled)",
      hospitalType: hospitalType || "Private (Empanelled)",
      procedureName: procedureName || "Advanced Minimally Invasive Surgery Package",
      packageCode: packageCode || "SURG-GEN-08",
      amountDeducted: deductAmount,
      approvalStatus: "Approved & Settled Cashless" as const,
      date: new Date(),
    };

    const newUsed = (patient.pmjayWallet?.usedAmount || 0) + deductAmount;
    const newAvailable = (patient.pmjayWallet?.totalAnnualCoverage || 500000) - newUsed;

    patient.pmjayWallet = {
      isEligible: true,
      schemeName: "Ayushman Bharat PM-JAY / MJPJAY",
      totalAnnualCoverage: 500000,
      usedAmount: newUsed,
      availableBalance: Math.max(0, newAvailable),
      claimsHistory: [newClaim, ...(patient.pmjayWallet?.claimsHistory || [])],
    };

    await patient.save();

    return NextResponse.json({
      success: true,
      message: `Cashless surgery pre-authorization approved! Rs. ${deductAmount} deducted from PM-JAY card.`,
      claim: newClaim,
      wallet: patient.pmjayWallet,
    });
  } catch (error: any) {
    console.error("PM-JAY PreAuth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
