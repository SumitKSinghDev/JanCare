import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Delete the token cookie by setting maxAge to 0
    cookieStore.set({
      name: "jancare_token",
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
