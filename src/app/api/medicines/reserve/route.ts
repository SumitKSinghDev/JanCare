import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Medicine from "@/models/Medicine";
import StockMovement from "@/models/StockMovement";
import Patient from "@/models/Patient";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "ASHA", "ANM", "SystemAdmin", "DistrictAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { medicineId } = body;

    if (!medicineId) {
      return NextResponse.json({ success: false, error: "Missing medicineId" }, { status: 400 });
    }

    const med = await Medicine.findById(medicineId);
    if (!med) {
      return NextResponse.json({ success: false, error: "Medicine not found" }, { status: 404 });
    }

    if (med.quantity <= 0) {
      return NextResponse.json({ success: false, error: "Medicine is out of stock" }, { status: 400 });
    }

    // Resolve patient details
    let patientDoc = null;
    const dbUser = await User.findById(user.userId);
    if (dbUser) {
      patientDoc = await Patient.findOne({ mobile: dbUser.username });
    }
    if (!patientDoc) {
      patientDoc = await Patient.findOne({ name: user.name });
    }

    const patientName = patientDoc ? patientDoc.name : user.name || "Unknown Patient";
    const patientRefId = patientDoc ? patientDoc.patientRefId : "N/A";

    // Deduct stock by 1 for reservation
    med.quantity = Math.max(0, med.quantity - 1);
    med.lastUpdated = new Date();
    await med.save();

    // Create STOCK_MOVEMENT with RESERVED type
    const movement = await StockMovement.create({
      facilityId: med.facilityId,
      medicineId: med._id,
      type: "RESERVED",
      quantity: -1, // reservation reduces available stock
      performedBy: user.userId as any,
      notes: `Reserved by patient ${patientName} (Ref ID: ${patientRefId}) via Patient Portal`,
    });

    // Create Audit Log
    await AuditLog.create({
      userId: user.userId as any,
      action: "RecordModification",
      patientId: patientDoc?._id,
      details: `Medicine ${med.name} reserved by patient. Stock decremented. Movement ID: ${movement._id}`,
    });

    const trackingId = `JC-MED-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      message: "Medicine successfully reserved and stock updated",
      trackingId,
      newQuantity: med.quantity,
    });
  } catch (error: any) {
    console.error("Failed to reserve medicine:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
