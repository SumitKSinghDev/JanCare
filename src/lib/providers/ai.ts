import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini if key is provided
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Helper to query Gemini with retry + model fallback for extreme rate limit resiliency
async function runGeminiWithFallback(
  genAI: any,
  options: { systemInstruction?: string },
  promptText: string,
  retries = 2,
  delay = 500
): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"];
  let lastError = null;

  for (const modelName of models) {
    let attemptDelay = delay;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[JanCare Provider AI] Attempting Gemini model ${modelName} (attempt ${attempt}/${retries})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
        });

        return await model.generateContent(promptText);
      } catch (err: any) {
        lastError = err;
        console.warn(`[JanCare Provider AI] Model ${modelName} failed on attempt ${attempt}:`, err.message);
        
        if ((err.message?.includes("429") || err.status === 429) && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, attemptDelay));
          attemptDelay *= 2;
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("All generative models failed");
}

export interface VitalsInput {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  spo2?: number;
  respiratoryRate?: number;
}

export interface SymptomInput {
  name: string;
  durationDays: number;
  severity: "Mild" | "Moderate" | "Severe";
}

export interface TriageResult {
  level: "Routine" | "Priority" | "Urgent";
  reason: string;
  aiExplanation: string;
  isFallback: boolean;
}

/**
 * Perform AI-assisted triage combining clinical guidelines and LLM reasoning.
 * Falls back to a deterministic rule-based algorithm if GEMINI_API_KEY is not configured.
 */
export async function runTriageAssessment(
  vitals: VitalsInput,
  symptoms: SymptomInput[],
  age: number,
  gender: string
): Promise<TriageResult> {
  const symptomListStr = symptoms
    .map((s) => `- ${s.name} (Duration: ${s.durationDays} days, Severity: ${s.severity})`)
    .join("\n");
  const vitalsStr = `Temp: ${vitals.temperature || "N/A"}°F, BP: ${vitals.bloodPressureSystolic || "N/A"}/${vitals.bloodPressureDiastolic || "N/A"} mmHg, HR: ${vitals.heartRate || "N/A"} bpm, SpO2: ${vitals.spo2 || "N/A"}%, RR: ${vitals.respiratoryRate || "N/A"} bpm`;

  // Deterministic local clinical rule check (runs always to cross-check or act as fallback)
  let ruleLevel: "Routine" | "Priority" | "Urgent" = "Routine";
  const ruleReasons: string[] = [];

  if (vitals.temperature && vitals.temperature >= 103) {
    ruleLevel = "Urgent";
    ruleReasons.push("Critical body temperature (>= 103°F)");
  } else if (vitals.temperature && vitals.temperature >= 100.5) {
    ruleLevel = "Priority";
    ruleReasons.push("Fever detected (>= 100.5°F)");
  }

  if (vitals.spo2 && vitals.spo2 < 92) {
    ruleLevel = "Urgent";
    ruleReasons.push("Severe hypoxia (SpO2 < 92%)");
  } else if (vitals.spo2 && vitals.spo2 < 95) {
    ruleLevel = ruleLevel === "Urgent" ? "Urgent" : "Priority";
    ruleReasons.push("Mild-to-moderate oxygen desaturation (SpO2 < 95%)");
  }

  if (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 45)) {
    ruleLevel = "Urgent";
    ruleReasons.push(`Abnormal heart rate (${vitals.heartRate} bpm)`);
  }

  if (vitals.bloodPressureSystolic && (vitals.bloodPressureSystolic >= 170 || vitals.bloodPressureSystolic < 85)) {
    ruleLevel = "Urgent";
    ruleReasons.push(`Dangerous Blood Pressure (${vitals.bloodPressureSystolic} mmHg systolic)`);
  }

  // Check severe symptoms
  const hasSevereSymptom = symptoms.some((s) => s.severity === "Severe");
  const urgentKeywords = ["chest pain", "breathlessness", "unconscious", "stroke", "bleeding"];
  const hasUrgentKeyword = symptoms.some((s) =>
    urgentKeywords.some((kw) => s.name.toLowerCase().includes(kw))
  );

  if (hasUrgentKeyword) {
    ruleLevel = "Urgent";
    ruleReasons.push("Symptom signals life-threatening condition (chest pain or breathlessness)");
  } else if (hasSevereSymptom) {
    ruleLevel = ruleLevel === "Urgent" ? "Urgent" : "Priority";
    ruleReasons.push("Severe clinical symptoms reported");
  }

  const ruleReasonStr = ruleReasons.length > 0 ? ruleReasons.join(", ") : "Normal vital ranges and mild symptoms.";

  // If no Gemini key, return deterministic fallback
  if (!genAI) {
    return {
      level: ruleLevel,
      reason: ruleReasonStr,
      aiExplanation: `[Deterministic Sandbox Mode] Auto-evaluated triage based on structured clinical safety rules. Key reasons: ${ruleReasonStr}. Please configure GEMINI_API_KEY to activate generative clinical support.`,
      isFallback: true,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
You are an expert AI clinical triage assistant. You will analyze a patient's vitals, symptoms, and demographics, and determine their triage category: "Routine", "Priority", or "Urgent".

Guidelines:
- "Urgent" is for immediate life-threatening alerts (e.g. chest pain, SpO2 < 92%, extremely high fever, altered mental status).
- "Priority" is for conditions that require medical evaluation today (e.g., high fever 101-102°F, severe weakness, uncontrolled vomiting, persistent symptoms).
- "Routine" is for mild, self-limiting symptoms or chronic checkups.

Patient Info:
Age: ${age}
Gender: ${gender}

Symptoms:
${symptomListStr}

Vitals:
${vitalsStr}

Clinical Rule Engine Assessment:
Triage level flags: ${ruleLevel}
Reasons found: ${ruleReasonStr}

Output a strictly structured JSON response containing:
{
  "level": "Routine" | "Priority" | "Urgent",
  "reason": "Single sentence summarizing why this category was chosen",
  "aiExplanation": "A paragraph explaining the clinical rationale, potential risks, and recommendations for healthcare navigation."
}
Return ONLY valid JSON. No markdown wrappers.
`;

    const response = await runGeminiWithFallback(genAI, {}, prompt);
    const text = response.response.text().trim();
    // Parse JSON safely
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanText);

    // Safety Override: If rule-engine flags "Urgent" but AI outputs something lower, upgrade to "Urgent"
    if (ruleLevel === "Urgent" && result.level !== "Urgent") {
      result.level = "Urgent";
      result.reason = `Safety Override: ${ruleReasonStr}`;
      result.aiExplanation = `[AI Triage Overridden by Clinical Safety Rules] ${result.aiExplanation}`;
    }

    return {
      level: result.level,
      reason: result.reason,
      aiExplanation: result.aiExplanation,
      isFallback: false,
    };
  } catch (error) {
    console.error("Gemini triage assessment failed, fallback to local engine:", error);
    return {
      level: ruleLevel,
      reason: ruleReasonStr,
      aiExplanation: `[AI Error Fallback] Evaluation deferred to safety rules. Reason: ${ruleReasonStr}. Details: ${error instanceof Error ? error.message : "Unknown error"}`,
      isFallback: true,
    };
  }
}

/**
 * Text-to-text symptom extractor for Voice symptom intake.
 */
export async function extractSymptomsFromText(text: string): Promise<{ symptoms: SymptomInput[]; vitals: VitalsInput }> {
  const defaultRes = {
    symptoms: [] as SymptomInput[],
    vitals: {} as VitalsInput,
  };

  if (!genAI) {
    // Basic local keyword parser fallback
    const textLower = text.toLowerCase();
    const symptoms: SymptomInput[] = [];
    const vitals: VitalsInput = {};

    if (textLower.includes("fever") || textLower.includes("temperature")) {
      symptoms.push({ name: "Fever", durationDays: 2, severity: "Moderate" });
    }
    if (textLower.includes("cough") || textLower.includes("cold")) {
      symptoms.push({ name: "Cough", durationDays: 3, severity: "Mild" });
    }
    if (textLower.includes("weakness") || textLower.includes("tired")) {
      symptoms.push({ name: "Weakness", durationDays: 3, severity: "Mild" });
    }
    if (textLower.includes("dizzy") || textLower.includes("dizziness")) {
      symptoms.push({ name: "Dizziness", durationDays: 1, severity: "Moderate" });
    }
    if (textLower.includes("chest pain")) {
      symptoms.push({ name: "Chest Pain", durationDays: 1, severity: "Severe" });
    }

    // Try parsing temperature number
    const tempMatch = textLower.match(/(\d{2,3}(\.\d)?)\s*(degrees|f|c)?/);
    if (tempMatch) {
      vitals.temperature = parseFloat(tempMatch[1]);
    }

    return { symptoms, vitals };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
Extract symptom names, durations (in days), and severities (Mild, Moderate, Severe), and any numerical vitals (temperature, blood pressure systolic/diastolic, heart rate, spo2) from this text:
"${text}"

Return ONLY valid JSON in this format:
{
  "symptoms": [
    { "name": "Symptom Name", "durationDays": number, "severity": "Mild" | "Moderate" | "Severe" }
  ],
  "vitals": {
    "temperature": number,
    "bloodPressureSystolic": number,
    "bloodPressureDiastolic": number,
    "heartRate": number,
    "spo2": number,
    "respiratoryRate": number
  }
}
If a vital or symptom is missing, do not include it or leave it null. Return only valid JSON.
`;

    const response = await runGeminiWithFallback(genAI, {}, prompt);
    const resText = response.response.text().trim();
    const cleanText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini symptom extraction failed:", error);
    return defaultRes;
  }
}

/**
 * Synthesizes voice assistant replies.
 */
export async function generateVoiceReply(
  text: string,
  language: "English" | "Hindi" | "Marathi"
): Promise<string> {
  if (!genAI) {
    if (language === "Marathi") return "मी तुमची कशी मदत करू शकते? कृपया लक्षणे सांगा.";
    if (language === "Hindi") return "मैं आपकी क्या मदद कर सकती हूँ? कृपया अपने लक्षण बताएं.";
    return "How can I assist you today? Please tell me your symptoms.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `
You are the voice assistant for जनCare, a rural healthcare platform. Provide a brief, supportive, one-sentence reply to this patient statement:
"${text}"

Guidelines:
- Language: ${language}
- Keep it under 25 words so it is easy to listen to.
- Do NOT prescribe medicines.
- Ask clarifying questions about symptoms or guide them to consultation.
`;
    const response = await runGeminiWithFallback(genAI, {}, prompt);
    return response.response.text().trim();
  } catch (error) {
    return "I am here to guide you. Please connect with your local ASHA worker.";
  }
}
