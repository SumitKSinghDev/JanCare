import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";
import { isValidIndianMobile, sanitizeIndianMobile } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, type, code, action } = body;

    if (!mobile) {
      return NextResponse.json({ success: false, error: "Mobile number is required" }, { status: 400 });
    }

    const cleanMobile = sanitizeIndianMobile(mobile);
    if (!isValidIndianMobile(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9" },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Standardize mobile number format with India country code
    let toFormatted = `+91${cleanMobile}`;

    // 1. If verifying the code
    if (action === "verify") {
      const { firebaseToken } = body;
      
      // If verifying via Firebase Auth ID Token
      if (firebaseToken) {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ success: false, error: "Firebase public API key is not configured on the server" }, { status: 500 });
        }
        
        try {
          const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
          const verifyResponse = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: firebaseToken }),
          });
          
          const verifyData = await verifyResponse.json();
          if (verifyResponse.ok && verifyData.users && verifyData.users.length > 0) {
            const fbUser = verifyData.users[0];
            let phone = fbUser.phoneNumber || "";
            if (phone.startsWith("+91")) {
              phone = phone.replace("+91", "");
            }
            
            let cleanRequested = mobile.trim();
            if (cleanRequested.startsWith("+91")) {
              cleanRequested = cleanRequested.replace("+91", "");
            }
            
            // Allow some flexibility or direct match on the last 10 digits
            const cleanPhoneDigits = phone.replace(/\D/g, "").slice(-10);
            const cleanReqDigits = cleanRequested.replace(/\D/g, "").slice(-10);
            
            if (cleanPhoneDigits === cleanReqDigits) {
              return NextResponse.json({ success: true, verified: true });
            } else {
              return NextResponse.json({ success: false, error: "Verified phone number does not match registered username" });
            }
          } else {
            return NextResponse.json({ success: false, error: verifyData.error?.message || "Invalid Firebase token" });
          }
        } catch (err: any) {
          console.error("Firebase ID Token verification failed:", err);
          return NextResponse.json({ success: false, error: "Token verification request failed" }, { status: 500 });
        }
      }

      if (verifyServiceSid && accountSid && authToken) {
        const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
        const bodyParams = new URLSearchParams();
        bodyParams.append("To", toFormatted);
        bodyParams.append("Code", code);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        const data = await response.json();
        if (response.ok && data.status === "approved") {
          return NextResponse.json({ success: true, verified: true });
        } else {
          return NextResponse.json({ success: false, error: data.message || "Invalid verification code" });
        }
      }
      
      // Sandbox verify fallback (for manual / local simulation check)
      return NextResponse.json({ success: true, verified: true });
    }

    // 2. If sending the OTP code
    if (verifyServiceSid && accountSid && authToken) {
      const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
      const bodyParams = new URLSearchParams();
      bodyParams.append("To", toFormatted);
      bodyParams.append("Channel", "sms");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        return NextResponse.json({
          success: true,
          useVerifyApi: true,
          sentRealSMS: true,
          message: "Real SMS sent via Twilio Verify API",
        });
      } else {
        console.warn("Twilio Verify send API failed, falling back:", data.message);
      }
    }

    // Fallback: Generate local OTP and send via standard SMS helper
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const smsMessage = `Your verification code is: ${otpCode}`;
    const sentRealSMS = await sendSMS(mobile, smsMessage);

    return NextResponse.json({
      success: true,
      otpCode,
      useVerifyApi: false,
      sentRealSMS,
      message: sentRealSMS ? "Real SMS sent successfully" : "SMS simulated locally",
    });
  } catch (error: any) {
    console.error("OTP handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
