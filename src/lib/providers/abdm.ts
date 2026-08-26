export interface ABHALinkResponse {
  success: boolean;
  message: string;
  abhaNumber?: string;
  status: "Linked" | "Not Linked" | "Sandbox Mode";
}

/**
 * ABDM & ABHA Provider Interface and Development Sandbox.
 * Ensures the platform is structurally prepared for official integration
 * without fabricating live API actions.
 */
export class ABDMProvider {
  /**
   * Simulates ABHA registration/linking via an OTP process.
   */
  static async linkABHA(patientMobile: string, abhaNumber: string): Promise<ABHALinkResponse> {
    // Basic verification of format: e.g. ABHA numbers are 14 digits or abhaaddress@sbx
    const cleanNumber = abhaNumber.replace(/[\s-]/g, "");
    
    if (cleanNumber.length !== 14 && !abhaNumber.includes("@")) {
      return {
        success: false,
        message: "Invalid ABHA format. Must be a 14-digit number (e.g. 12-3456-7890-1234) or an ABHA Address (e.g. name@abdm).",
        status: "Not Linked",
      };
    }

    // In local sandbox development, automatically link after verifying formatting
    return {
      success: true,
      message: "ABHA successfully linked through JanCare's ABDM Development Sandbox. Production integration available upon official ABDM onboarding.",
      abhaNumber: abhaNumber,
      status: "Sandbox Mode",
    };
  }

  /**
   * Queries status of digital consent (consent framework).
   */
  static async getABDMConsentStatus(patientRefId: string): Promise<{ granted: boolean; expiry?: Date }> {
    return {
      granted: true,
      expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year consent in sandbox
    };
  }
}
