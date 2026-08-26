/**
 * Native SMS Helper using Twilio's HTTP REST API.
 * Requires zero external node packages.
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  let cleanTo = to.trim();
  if (cleanTo.startsWith("+91")) {
    cleanTo = cleanTo.replace("+91", "");
  }

  // 1. Prioritize Fast2SMS for Indian numbers (bypasses TRAI/DLT blocks instantly for free)
  if (fast2smsKey) {
    try {
      const otpMatch = message.match(/(\d{4})/);
      const otpCode = otpMatch ? otpMatch[1] : "1234";

      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=otp&variables_values=${otpCode}&numbers=${cleanTo}`;
      
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      
      if (data.return) {
        console.log(`[JanCare SMS Gateway] Real SMS dispatched via Fast2SMS to ${cleanTo}`);
        return true;
      } else {
        console.warn(`[JanCare SMS Gateway] Fast2SMS DND/Delivery block:`, data.message);
        return false;
      }
    } catch (error) {
      console.error("[JanCare SMS Gateway] Fast2SMS integration failed:", error);
    }
  }

  // 2. Fallback to Twilio REST API
  if (!accountSid || !authToken || !fromPhone) {
    console.warn("[JanCare SMS Gateway] Twilio credentials missing. SMS simulated locally: ", message);
    return false;
  }

  try {
    let toFormatted = to.trim();
    if (!toFormatted.startsWith("+")) {
      if (toFormatted.length === 10) {
        toFormatted = `+91${toFormatted}`;
      } else {
        toFormatted = `+${toFormatted}`;
      }
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    // Twilio expects form urlencoded fields
    const bodyParams = new URLSearchParams();
    bodyParams.append("To", toFormatted);
    bodyParams.append("From", fromPhone);
    bodyParams.append("Body", message);

    const headers = new Headers();
    // Basic Auth header using AccountSid and AuthToken
    headers.set("Authorization", "Basic " + btoa(`${accountSid}:${authToken}`));
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[JanCare SMS Gateway] Twilio API error: ${response.status} - ${errText}`);
      return false;
    }

    console.log(`[JanCare SMS Gateway] Real SMS dispatched successfully to ${toFormatted}`);
    return true;
  } catch (error) {
    console.error("[JanCare SMS Gateway] Failed to send real SMS:", error);
    return false;
  }
}
