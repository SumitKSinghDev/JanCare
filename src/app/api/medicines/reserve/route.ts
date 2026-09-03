import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Medicine from "@/models/Medicine";
import StockMovement from "@/models/StockMovement";
import Patient from "@/models/Patient";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest([
      "Pharmacist",
      "MedicineManager",
      "FacilityAdmin",
      "DistrictAdmin",
      "SystemAdmin",
      "Doctor",
      "Patient",
      "ASHA",
      "ANM",
    ]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    const query: any = { type: { $in: ["RESERVED", "DISPENSED"] } };
    if (facilityId && facilityId !== "All") {
      query.facilityId = facilityId;
    }

    const movements = await StockMovement.find(query)
      .populate("medicineId")
      .populate("facilityId")
      .populate("performedBy", "name username role")
      .sort({ createdAt: -1 });

    const reservations = movements.map((m: any) => {
      const notes = m.notes || "";
      const trackingMatch = notes.match(/JC-MED-\d+/i);
      const refMatch = notes.match(/Ref ID:\s*([A-Z0-9-]+)/i);
      const trackingId = trackingMatch ? trackingMatch[0] : `JC-RES-${m._id.toString().slice(-4).toUpperCase()}`;
      const patientRef = refMatch ? refMatch[1] : "JC-7F3K92";

      return {
        id: m._id.toString(),
        trackingId,
        patientRef,
        medicineName: m.medicineId?.name || "Generic Medicine (PMBJP)",
        genericName: m.medicineId?.genericName || "PMBJP Generic",
        strength: m.medicineId?.strength || "500mg",
        form: m.medicineId?.form || "Tablet",
        facilityName: m.facilityId?.name || "Sinnar Rural CHC",
        facilityId: m.facilityId?._id?.toString(),
        quantity: Math.abs(m.quantity) || 1,
        type: m.type,
        status: m.type === "DISPENSED" ? "Dispensed" : "Active Reservation",
        notes: m.notes,
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json({ success: true, reservations });
  } catch (error: any) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Patient", "ASHA", "ANM", "SystemAdmin", "DistrictAdmin", "FacilityAdmin", "MedicineManager"]);
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
      patientDoc = await Patient.findOne({
        $or: [
          { mobile: dbUser.username },
          { patientRefId: dbUser.username?.toUpperCase() },
          { name: dbUser.name }
        ]
      });
    }
    if (!patientDoc) {
      patientDoc = await Patient.findOne({ name: user.name });
    }

    const patientName = patientDoc ? patientDoc.name : user.name || "Ramesh Kumar";
    const patientRefId = patientDoc ? patientDoc.patientRefId : "JC-7F3K92";
    const trackingId = `JC-MED-${Math.floor(1000 + Math.random() * 9000)}`;

    // Deduct stock by 1 for reservation
    med.quantity = Math.max(0, med.quantity - 1);
    med.lastUpdated = new Date();
    await med.save();

    // Create STOCK_MOVEMENT with RESERVED type & tracking ID
    const movement = await StockMovement.create({
      facilityId: med.facilityId,
      medicineId: med._id,
      type: "RESERVED",
      quantity: -1, // reservation reduces available stock
      performedBy: user.userId as any,
      notes: `Reserved by patient ${patientName} (Ref ID: ${patientRefId}) [Token: ${trackingId}] via Patient Portal`,
    });

    // Create Audit Log
    await AuditLog.create({
      userId: user.userId as any,
      action: "RecordModification",
      patientId: patientDoc?._id,
      details: `Medicine ${med.name} reserved by patient (${patientName}). Stock decremented. Tracking ID: ${trackingId}`,
    });

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

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(["Pharmacist", "MedicineManager", "FacilityAdmin", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { movementId, action } = body;

    if (!movementId) {
      return NextResponse.json({ success: false, error: "Missing movementId" }, { status: 400 });
    }

    const movement = await StockMovement.findById(movementId);
    if (!movement) {
      return NextResponse.json({ success: false, error: "Reservation record not found" }, { status: 404 });
    }

    if (action === "DISPENSE") {
      movement.type = "DISPENSED";
      movement.notes = `${movement.notes || ""} | Dispensed on ${new Date().toLocaleString()}`;
      await movement.save();

      return NextResponse.json({
        success: true,
        message: "Medicine marked as dispensed to patient.",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to update reservation status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
