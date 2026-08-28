import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Medicine from "@/models/Medicine";
import Prescription from "@/models/Prescription";
import Consultation from "@/models/Consultation";
import AuditLog from "@/models/AuditLog";
import StockMovement from "@/models/StockMovement";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    const search = searchParams.get("search") || "";

    if (!facilityId) {
      return NextResponse.json({ success: false, error: "Missing facilityId parameter" }, { status: 400 });
    }

    const query: any = { facilityId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const medicines = await Medicine.find(query);

    // Map status: Available (green), Low (yellow), Out of Stock (red)
    const stockDetails = medicines.map((med) => {
      let status: "Available" | "Low" | "Out of Stock" = "Available";
      if (med.quantity === 0) {
        status = "Out of Stock";
      } else if (med.quantity < med.minimumRequired) {
        status = "Low";
      }
      return {
        id: med._id,
        name: med.name,
        genericName: med.genericName,
        strength: med.strength,
        form: med.form,
        category: med.category,
        quantity: med.quantity,
        minimumRequired: med.minimumRequired,
        expiryDate: med.expiryDate,
        status,
        lastUpdated: med.lastUpdated,
      };
    });

    return NextResponse.json({ success: true, medicines: stockDetails });
  } catch (error: any) {
    console.error("Failed to query medicines stock:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { consultationId, patientId, medicines, additionalInstructions } = body;

    if (!consultationId || !patientId || !medicines || !Array.isArray(medicines)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Create prescription record
    const prescription = await Prescription.create({
      consultationId,
      patientId,
      doctorId: user.userId as any,
      medicines,
      additionalInstructions,
    });

    // Deduct stock for medicines if a facility is linked to the consultation
    const consultation = await Consultation.findById(consultationId);
    if (consultation && consultation.facilityId) {
      for (const item of medicines) {
        // Try to match by generic name or drug name
        const match = await Medicine.findOne({
          facilityId: consultation.facilityId,
          $or: [
            { name: { $regex: new RegExp("^" + item.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") } },
            { genericName: { $regex: new RegExp("^" + (item.genericName || item.name).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") } }
          ]
        });

        if (match) {
          // Deduct quantity, ensuring it doesn't go below 0
          const deductQty = 1; // standard dosage or default deduction
          match.quantity = Math.max(0, match.quantity - deductQty);
          match.lastUpdated = new Date();
          await match.save();
        }
      }
    }

    // Log action for security audit
    await AuditLog.create({
      userId: user.userId as any,
      action: "PrescriptionCreation",
      patientId,
      details: `Created prescription for ${medicines.length} medicines. Consultation ID: ${consultationId}`,
    });

    return NextResponse.json({
      success: true,
      message: "Prescription created successfully and stock updated",
      prescription,
    });
  } catch (error: any) {
    console.error("Failed to create prescription:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateRequest(["MedicineManager", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { medicineId, type, quantity, notes } = body; // type is stock movement type, quantity is number (e.g. -5, +50)

    if (!medicineId || !type || quantity === undefined || quantity === null) {
      return NextResponse.json({ success: false, error: "Missing required fields (medicineId, type, quantity)" }, { status: 400 });
    }

    const med = await Medicine.findById(medicineId);
    if (!med) {
      return NextResponse.json({ success: false, error: "Medicine record not found" }, { status: 404 });
    }

    // Create the StockMovement record
    const movement = await StockMovement.create({
      facilityId: med.facilityId,
      medicineId: med._id,
      type,
      quantity,
      performedBy: user.userId as any,
      notes: notes || `Stock updated via dashboard movement type: ${type}`,
    });

    // Update medicine quantity
    med.quantity = Math.max(0, med.quantity + quantity);
    med.lastUpdated = new Date();
    await med.save();

    // Log action to security audit
    await AuditLog.create({
      userId: user.userId as any,
      action: "RecordModification",
      details: `Inventory movement recorded: ${type} (qty change: ${quantity}) for drug ${med.name}. New stock: ${med.quantity}`,
    });

    return NextResponse.json({
      success: true,
      message: "Stock movement recorded successfully",
      medicine: med,
      movement,
    });
  } catch (error: any) {
    console.error("Failed to record stock movement:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
