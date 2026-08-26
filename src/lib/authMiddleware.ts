import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export interface AuthenticatedUser {
  userId: string;
  role: string;
  name: string;
}

export async function authenticateRequest(
  allowedRoles?: string[]
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("jancare_token");

    if (!tokenCookie || !tokenCookie.value) {
      return null;
    }

    const decoded = verifyToken(tokenCookie.value);
    if (!decoded) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
