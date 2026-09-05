import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Medicine from "@/models/Medicine";
import Prescription from "@/models/Prescription";
import Consultation from "@/models/Consultation";
import AuditLog from "@/models/AuditLog";
import StockMovement from "@/models/StockMovement";
import { authenticateRequest } from "@/lib/authMiddleware";

import { DEMO_MEDICINES } from "@/lib/demoMedicines";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    const search = searchParams.get("search") || "";

    try {
      await connectToDatabase();

      const query: any = {};
      if (facilityId && facilityId !== "all" && facilityId !== "default" && facilityId !== "undefined") {
        query.facilityId = facilityId;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { genericName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      const medicines = await Medicine.find(query).populate("facilityId", "name type district taluka");

      if (medicines && medicines.length > 0) {
        // Map status: Available (green), Low (yellow), Out of Stock (red)
        const stockDetails = medicines.map((med: any) => {
          let status: "Available" | "Low" | "Out of Stock" = "Available";
          if (med.quantity === 0) {
            status = "Out of Stock";
          } else if (med.quantity < med.minimumRequired) {
            status = "Low";
          }

          const skuCode = "JC-MED-" + (med.genericName || med.name).replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() + String(med.strength || "500").replace(/[^0-9]/g, "");

          return {
            _id: med._id,
            id: med._id,
            sku: skuCode || "JC-MED-GEN500",
            genericCode: skuCode || "JC-MED-GEN500",
            name: med.name,
            genericName: med.genericName || med.name,
            strength: med.strength,
            form: med.form,
            category: med.category,
            quantity: med.quantity,
            minimumRequired: med.minimumRequired,
            expiryDate: med.expiryDate,
            status,
            facilityId: med.facilityId?._id || med.facilityId,
            facilityName: med.facilityId?.name || "Nashik District Medical Depot",
            lastUpdated: med.lastUpdated,
          };
        });

        return NextResponse.json({ success: true, medicines: stockDetails });
      }
    } catch (dbErr) {
      console.warn("DB query failed, serving demo medicines:", dbErr);
    }

    // Fallback to DEMO_MEDICINES if DB returns 0 or offline
    let fallback = DEMO_MEDICINES;
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter(m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }

    return NextResponse.json({ success: true, medicines: fallback });
  } catch (error: any) {
    console.error("Failed to query medicines stock:", error);
    return NextResponse.json({ success: true, medicines: DEMO_MEDICINES });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "MedicineManager", "FacilityAdmin", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Check if adding a brand new medicine item to facility inventory
    if (body.action === "ADD_NEW_MEDICINE") {
      const { facilityId, name, genericName, strength, form, category, quantity, minimumRequired } = body;
      if (!facilityId || !name || !genericName) {
        return NextResponse.json({ success: false, error: "Missing required medicine fields (facilityId, name, genericName)" }, { status: 400 });
      }

      const newMedicine = await Medicine.create({
        facilityId,
        name: name.trim(),
        genericName: genericName.trim(),
        strength: strength || "500mg",
        form: form || "Tablet",
        category: category || "General Medicine",
        quantity: Number(quantity) || 0,
        minimumRequired: Number(minimumRequired) || 50,
      });

      // Record initial intake movement
      await StockMovement.create({
        facilityId,
        medicineId: newMedicine._id,
        type: "STOCK_RECEIVED",
        quantity: Number(quantity) || 0,
        performedBy: user.userId as any,
        notes: `New drug inventory initialized: ${name} (${genericName})`,
      });

      return NextResponse.json({
        success: true,
        message: `Medicine ${name} successfully added to inventory.`,
        medicine: newMedicine,
      });
    }

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
