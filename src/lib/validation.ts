/**
 * JanCare Validation Utilities
 * Specialized for India / Maharashtra Public Health Standards
 */

/**
 * Cleans input string to 10-digit Indian mobile number format.
 * Strips out +91, leading 0, spaces, dashes, and parentheses.
 */
export function sanitizeIndianMobile(input: string): string {
  if (!input) return "";
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.replace(/\D/g, "");
}

/**
 * Validates if the string is a legitimate 10-digit Indian mobile number.
 * Valid Indian mobile numbers start with 6, 7, 8, or 9 and are exactly 10 digits long.
 */
export function isValidIndianMobile(input: string): boolean {
  const cleaned = sanitizeIndianMobile(input);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats a 10-digit Indian mobile number with +91 prefix for display or SMS gateways.
 */
export function formatIndianMobileWithCountryCode(input: string): string {
  const cleaned = sanitizeIndianMobile(input);
  return `+91 ${cleaned}`;
}
