import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Consultation from "@/models/Consultation";
import { createConsultationRoom } from "@/lib/providers/video";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["Doctor", "Specialist", "ASHA", "ANM", "Patient", "SystemAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { consultationId } = body;

    if (!consultationId) {
      return NextResponse.json({ success: false, error: "Missing consultationId" }, { status: 400 });
    }

    const consultation = await Consultation.findById(consultationId).populate("patientId");
    if (!consultation) {
      return NextResponse.json({ success: false, error: "Consultation not found" }, { status: 404 });
    }

    // Generate room name based on consultation details
    let roomName = consultation.videoRoomName;
    if (!roomName) {
      const patientRef = (consultation.patientId as any).patientRefId || "anon";
      roomName = `jancare-consult-${patientRef.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      consultation.videoRoomName = roomName;
      await consultation.save();
    }

    // Create Daily room
    const roomConfig = await createConsultationRoom(roomName);

    return NextResponse.json({
      success: true,
      url: roomConfig.url,
      roomName: roomConfig.name,
      isSandbox: roomConfig.isSandbox,
    });
  } catch (error: any) {
    console.error("Video room creation failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
