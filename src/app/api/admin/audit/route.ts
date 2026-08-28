import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(["DistrictAdmin", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    const query: any = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate("userId", "name role username")
      .populate("patientId", "name patientRefId")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Failed to query audit logs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
