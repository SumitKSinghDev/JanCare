export interface NotificationPayload {
  to: string; // phone number or email
  title: string;
  message: string;
  type: "SMS" | "Email" | "WhatsApp";
}

/**
 * Replaceable Notification Provider Abstraction.
 * In development, if credentials are missing, logs messages to console
 * and relies on the internal in-app notifications system.
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const { to, title, message, type } = payload;
  
  // Log message detail inside development environment
  console.log(`[Notification Provider Sandbox] Sending ${type} to ${to}:
Subject: ${title}
Body: ${message}
----------------------------------------`);

  // SMS API Integrations would check: process.env.SMS_API_KEY
  // Email API Integrations would check: process.env.EMAIL_API_KEY
  // If keys existed, we would trigger their fetch calls here.

  return true;
}
