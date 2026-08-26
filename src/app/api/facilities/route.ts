import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Facility from "@/models/Facility";
import { authenticateRequest } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  try {
    // Open access read for logged in users
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const taluka = searchParams.get("taluka");
    const type = searchParams.get("type");

    const query: any = {};
    if (division) query.division = division;
    if (district) query.district = district;
    if (taluka) query.taluka = taluka;
    if (type) query.type = type;

    const facilities = await Facility.find(query).sort({ name: 1 });

    return NextResponse.json({ success: true, facilities });
  } catch (error: any) {
    console.error("Failed to query facilities:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(["SystemAdmin", "DistrictAdmin"]);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, type, services, division, district, taluka, village, coordinates, contactNumber } = body;

    if (!name || !type || !division || !district || !taluka || !village || !coordinates) {
      return NextResponse.json({ success: false, error: "Missing required facility details" }, { status: 400 });
    }

    const facility = await Facility.create({
      name,
      type,
      services: services || [],
      division,
      district,
      taluka,
      village,
      coordinates,
      contactNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Facility successfully created",
      facility,
    });
  } catch (error: any) {
    console.error("Failed to create facility:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
