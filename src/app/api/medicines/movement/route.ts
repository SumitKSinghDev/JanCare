import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import StockMovement from "@/models/StockMovement";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["MedicineManager", "DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    
    const query: any = {};
    if (facilityId) {
      query.facilityId = facilityId;
    }

    const movements = await StockMovement.find(query)
      .populate("medicineId")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, movements });
  } catch (error: any) {
    console.error("Failed to query stock movements:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
