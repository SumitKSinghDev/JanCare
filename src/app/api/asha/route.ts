import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch all users who are ASHA workers
    const ashas = await User.find({ role: "ASHA" }).select("name username role associatedFacility").sort({ name: 1 });

    return NextResponse.json({ success: true, ashas });
  } catch (error: any) {
    console.error("Failed to query ASHA workers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
