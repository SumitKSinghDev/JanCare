import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Patient from "@/models/Patient";
import HealthRecord from "@/models/HealthRecord";
import Consultation from "@/models/Consultation";
import Prescription from "@/models/Prescription";
import Referral from "@/models/Referral";
import FollowUp from "@/models/FollowUp";
import Facility from "@/models/Facility";
import Medicine from "@/models/Medicine";
import User from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateRequest } from "@/lib/authMiddleware";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ----------------------------------------------------------------------
// DATABASE QUERY TOOLS
// ----------------------------------------------------------------------

async function getPatientProfile(patientRefId: string) {
  await connectToDatabase();
  const patient = await Patient.findOne({
    patientRefId: { $regex: new RegExp("^" + patientRefId.trim() + "$", "i") },
  });
  return patient ? patient.toJSON() : null;
}

async function getCareTimeline(patientRefId: string) {
  await connectToDatabase();
  const patient = await Patient.findOne({
    patientRefId: { $regex: new RegExp("^" + patientRefId.trim() + "$", "i") },
  });
  if (!patient) return null;

  const records = await HealthRecord.find({ patientId: patient._id }).sort({ createdAt: -1 });
  const consults = await Consultation.find({ patientId: patient._id })
    .populate("doctorId", "name role")
    .populate("facilityId", "name type")
    .sort({ createdAt: -1 });
  const referrals = await Referral.find({ patientId: patient._id })
    .populate("referringFacilityId", "name")
    .populate("destinationFacilityId", "name")
    .sort({ createdAt: -1 });
  const followups = await FollowUp.find({ patientId: patient._id }).sort({ dueDate: 1 });

  return {
    patient,
    records,
    consultations: consults,
    referrals,
    followups,
  };
}

async function getMedicineAvailability(facilitySearch: string, medicineSearch: string) {
  await connectToDatabase();
  const facility = await Facility.findOne({ name: { $regex: facilitySearch, $options: "i" } });
  if (!facility) return { error: `Facility matching "${facilitySearch}" not found.` };

  const query: any = { facilityId: facility._id };
  if (medicineSearch) {
    query.$or = [
      { name: { $regex: medicineSearch, $options: "i" } },
      { genericName: { $regex: medicineSearch, $options: "i" } },
    ];
  }

  const stock = await Medicine.find(query);
  return {
    facility: facility.name,
    inventory: stock.map((s) => ({
      name: s.name,
      generic: s.genericName,
      qty: s.quantity,
      min: s.minimumRequired,
      status: s.quantity === 0 ? "Out of Stock" : s.quantity < s.minimumRequired ? "Low Stock" : "Available",
    })),
  };
}

async function findFacilities(district: string, taluka: string) {
  await connectToDatabase();
  const query: any = {};
  if (district) query.district = { $regex: district, $options: "i" };
  if (taluka) query.taluka = { $regex: taluka, $options: "i" };

  const clinics = await Facility.find(query);
  return clinics.map((c) => ({
    name: c.name,
    type: c.type,
    village: c.village,
    services: c.services,
  }));
}

// Helper to wrap promise with a timeout to fail fast if database is unreachable
async function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T | null> {
  let timeoutId: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promise, timeoutPromise]).then((res) => {
    clearTimeout(timeoutId);
    return res;
  });
}

// ----------------------------------------------------------------------
// CORE SYSTEM PROMPT FOR जनCare ASSISTANT
// ----------------------------------------------------------------------

const JANCARE_SYSTEM_PROMPT = `You are the जनCare AI Assistant — a multilingual, AI-assisted care navigation assistant for rural healthcare in Maharashtra, India.

CRITICAL RULES:
1. LANGUAGE MATCHING: ALWAYS respond in the SAME language the user speaks.
   - If they write in Hindi or Romanized Hindi (e.g. "Mujhe bukhar hai") → respond in Hindi (Devanagari).
   - If they write in Marathi or Devanagari Marathi (e.g. "मला ताप आला आहे") → respond in Marathi.
   - If they write in English → respond in English.
   - If mixed, prefer the dominant language.

2. ROLE: You are an AI care navigator, NOT a doctor. You:
   - Collect symptoms progressively (ask follow-up questions)
   - Guide patients to appropriate care
   - Help with appointments, medicines, referrals, follow-ups
   - NEVER diagnose or prescribe medication
   - Always recommend consulting a healthcare professional for clinical decisions

3. CONVERSATION STYLE:
   - Be warm, empathetic, and concise
   - Keep responses SHORT (2-4 sentences for symptom collection)
   - Ask ONE follow-up question at a time
   - Use simple language accessible to rural users

4. SYMPTOM COLLECTION FLOW:
   When a user reports symptoms:
   a) Acknowledge the symptom in their language
   b) Ask how long they have had it
   c) Ask about severity/temperature if relevant
   d) Ask about associated symptoms
   e) After collecting enough info, suggest next steps (visit nearby PHC, consult doctor)

5. EMERGENCY DETECTION:
   If user mentions: chest pain, breathing difficulty, unconsciousness, severe bleeding, seizures, or stroke symptoms:
   → Immediately respond with URGENT emergency guidance and emergency number 108
   → Do NOT continue normal symptom collection

6. INTENT HANDLING:
   - GREETING: Respond with a brief, warm greeting. Introduce yourself as जनCare Assistant. Ask how you can help.
   - SYMPTOM_REPORT: Follow the symptom collection flow above.
   - CHECK_APPOINTMENT: Help check appointment details.
   - BOOK_APPOINTMENT: Guide to book a consultation.
   - CHECK_MEDICINE_AVAILABILITY: Help find medicine availability.
   - CHECK_TRACKING_STATUS: Help track medicine orders.
   - CHECK_REFERRAL: Help check referral status.
   - CHECK_FOLLOW_UP: Help check follow-up schedules.
   - FIND_FACILITY: Help locate nearby healthcare facilities.
   - UNKNOWN: Ask clarifying question in the user's language. Briefly mention what you can help with.

7. IMPORTANT: Do NOT list all your capabilities unless the user explicitly asks "what can you do" or similar. For greetings, keep it brief and natural.`;

// Helper to query Gemini with retry + model fallback for extreme rate limit resiliency
async function runGeminiWithFallback(
  genAI: any,
  options: { systemInstruction?: string },
  promptText: string,
  chatHistory?: any,
  retries = 2,
  delay = 500
): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"];
  let lastError = null;

  for (const modelName of models) {
    let attemptDelay = delay;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[JanCare AI] Attempting Gemini model ${modelName} (attempt ${attempt}/${retries})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
        });

        if (chatHistory) {
          const chat = model.startChat({ history: chatHistory });
          return await chat.sendMessage(promptText);
        } else {
          return await model.generateContent(promptText);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[JanCare AI] Model ${modelName} failed on attempt ${attempt}:`, err.message);
        
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

// ----------------------------------------------------------------------
// CONVERSATIONAL INTENT RESOLVER
// ----------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest().catch(() => null);
    const body = await request.json();
    const { message, history } = body;

    console.log(`[JanCare AI] USER INPUT: "${message}"`);

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message payload" }, { status: 400 });
    }

    const msgLower = message.toLowerCase();
    let toolResult: any = null;
    let toolNameCalled = "";

    // 0. Resolve AI Booking Intent
    const isBookingRequest = (msgLower.includes("book") || msgLower.includes("appointment") || msgLower.includes("schedule") || msgLower.includes("अपॉइंटमेंट") || msgLower.includes("नोंदणी")) &&
      (msgLower.includes("doctor") || msgLower.includes("consult") || msgLower.includes("appointment") || msgLower.includes("भेट") || msgLower.includes("तपासणी"));

    if (isBookingRequest) {
      toolNameCalled = "bookAppointment";
      await connectToDatabase();
      
      let patientDoc = null;
      if (user) {
        const User = (await import("@/models/User")).default;
        const dbUser = await User.findById(user.userId);
        if (dbUser) {
          patientDoc = await Patient.findOne({ mobile: dbUser.username });
        }
        if (!patientDoc) {
          patientDoc = await Patient.findOne({ name: user.name });
        }
      }
      if (!patientDoc) {
        patientDoc = await Patient.findOne({ name: "Ramesh Kumar" });
      }

      if (patientDoc) {
        const Facility = (await import("@/models/Facility")).default;
        const User = (await import("@/models/User")).default;
        const Appointment = (await import("@/models/Appointment")).default;
        const Consultation = (await import("@/models/Consultation")).default;
        const HealthRecord = (await import("@/models/HealthRecord")).default;

        try {
          // Facility lookup matching patient's location
          let firstChc = null;
          if (patientDoc && patientDoc.district) {
            firstChc = await Facility.findOne({ 
              district: patientDoc.district, 
              type: { $in: ["CHC", "PHC"] } 
            });
          }
          if (!firstChc) {
            firstChc = await Facility.findOne({ type: "CHC" });
          }
          
          // Doctor selection
          let doctorDoc = null;
          if (msgLower.includes("smita") || msgLower.includes("rao") || msgLower.includes("cardiologist")) {
            doctorDoc = await User.findOne({ name: /Smita/i });
          } else {
            doctorDoc = await User.findOne({ name: /Aniruddha/i });
            if (!doctorDoc) {
              doctorDoc = await User.findOne({ role: "Doctor" });
            }
          }

          if (!doctorDoc) {
            toolResult = {
              success: false,
              error: "No doctor matching that description is currently active in the district.",
            };
          } else if (!firstChc) {
            toolResult = {
              success: false,
              error: "No clinic facility found in the district to schedule the consultation.",
            };
          } else {
            // Slot selection
            let slotTime = "11:30 AM";
            if (msgLower.includes("2:00") || msgLower.includes("02:00") || msgLower.includes("2 pm") || msgLower.includes("02 pm") || msgLower.includes("दोन")) {
              slotTime = "02:00 PM";
            }

            const dateQuery = new Date();
            const startOfDay = new Date(dateQuery.setHours(0, 0, 0, 0));
            const endOfDay = new Date(dateQuery.setHours(23, 59, 59, 999));

            // Validate Slot availability (Duplicate check)
            const slotTaken = await Appointment.findOne({
              doctorId: doctorDoc._id,
              status: "BOOKED",
              appointmentDate: { $gte: startOfDay, $lte: endOfDay },
              appointmentTime: slotTime,
            });

            if (slotTaken) {
              toolResult = {
                success: false,
                error: `That slot is no longer available. Here are the next available times: ${slotTime === "11:30 AM" ? "02:00 PM" : "11:30 AM"}.`,
              };
            } else {
              const count = await Appointment.countDocuments({
                doctorId: doctorDoc._id,
                status: "BOOKED",
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
              });

              // Create the appointment in database
              const appointment = await Appointment.create({
                patientId: patientDoc._id,
                doctorId: doctorDoc._id,
                facilityId: firstChc._id,
                appointmentDate: new Date(),
                appointmentTime: slotTime,
                status: "BOOKED",
                queueNumber: count + 1,
                estimatedWaitMinutes: (count + 1) * 15,
                bookingSource: "AI_ASSISTANT",
              });

              // Create Consultation
              let healthRecord = await HealthRecord.findOne({ patientId: patientDoc._id });
              if (!healthRecord) {
                healthRecord = await HealthRecord.create({
                  patientId: patientDoc._id,
                  recordedBy: doctorDoc._id,
                  vitals: { temperature: 98.6, spo2: 98, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 72, respiratoryRate: 16 },
                  symptoms: [{ name: "AI Booked Consultation", durationDays: 1, severity: "Mild" }],
                  triage: { level: "Routine", reason: "AI Assistant Booking", aiExplanation: "Booked via AI Assistant.", triageDate: new Date() },
                  offlineCreated: false,
                });
              }

              await Consultation.create({
                patientId: patientDoc._id,
                doctorId: doctorDoc._id,
                facilityId: firstChc._id,
                healthRecordId: healthRecord._id,
                status: "Scheduled",
                videoRoomName: `jancare-consult-${patientDoc.patientRefId.toLowerCase()}-${Date.now().toString().slice(-4)}`
              });

              toolResult = {
                success: true,
                appointment: {
                  id: appointment._id.toString(),
                  patientId: patientDoc._id.toString(),
                  doctorId: doctorDoc._id.toString(),
                  facilityId: firstChc._id.toString(),
                  date: new Date().toLocaleDateString(),
                  time: slotTime,
                  status: "BOOKED",
                  bookingSource: "AI_ASSISTANT"
                }
              };
            }
          }
        } catch (err: any) {
          console.error("[JanCare AI] Database write failed for AI Booking:", err);
          toolResult = {
            success: false,
            error: `I couldn't complete the appointment booking right now. Please try again. Technical details: ${err.message}`,
          };
        }
      }
    }

    // 1. Resolve database tool calls via keyword matching
    if (toolNameCalled === "bookAppointment") {
      // Already resolved above
    } else if (msgLower.includes("ramesh") || msgLower.includes("kumar") || msgLower.includes("jc-7f3k92")) {
      toolNameCalled = "getCareTimeline";
      toolResult = await withTimeout(getCareTimeline("JC-7F3K92"));
    } else if (msgLower.includes("stock") || msgLower.includes("mc1") || msgLower.includes("mc2") || msgLower.includes("mc3") ||
               (msgLower.includes("medicine") && (msgLower.includes("available") || msgLower.includes("milegi") || msgLower.includes("मिळतील") || msgLower.includes("उपलब्ध")))) {
      toolNameCalled = "getMedicineAvailability";
      const medQuery = msgLower.includes("mc1") ? "MC1" : msgLower.includes("mc2") ? "MC2" : msgLower.includes("mc3") ? "MC3" : "";
      toolResult = await withTimeout(getMedicineAvailability("Sinnar", medQuery));
    } else if (msgLower.includes("clinic") || msgLower.includes("facility") || msgLower.includes("hospital") ||
               msgLower.includes("phc") || msgLower.includes("sinnar") ||
               msgLower.includes("दवाखाना") || msgLower.includes("अस्पताल") || msgLower.includes("हॉस्पिटल")) {
      toolNameCalled = "findFacilities";
      toolResult = await withTimeout(findFacilities("Nashik", "Sinnar"));
    }

    // 2. Build conversation history for Gemini
    const conversationMessages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Add prior conversation history if provided
    if (history && Array.isArray(history)) {
      // Filter out trailing user message as it is sent as the active user prompt
      let priorHistory = [...history];
      if (priorHistory.length > 0 && priorHistory[priorHistory.length - 1].sender === "user") {
        priorHistory = priorHistory.slice(0, -1);
      }
      for (const msg of priorHistory) {
        conversationMessages.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }

      // Safety Check: Gemini chat history MUST start with 'user' role
      while (conversationMessages.length > 0 && conversationMessages[0].role !== "user") {
        conversationMessages.shift();
      }
    }

    // 3. Synthesize response using Gemini with full conversation context
    let finalResponse = "";

    if (genAI) {
      try {
        // Build the current user message with any tool context
        let userPrompt = message;
        if (toolNameCalled && toolResult) {
          userPrompt = `${message}\n\n[SYSTEM CONTEXT — Database query "${toolNameCalled}" returned this data, use it to answer the user's question]:\n${JSON.stringify(toolResult, null, 2)}`;
        } else if (toolNameCalled && !toolResult) {
          userPrompt = `${message}\n\n[SYSTEM CONTEXT — Database query "${toolNameCalled}" timed out. Inform the user that you could not fetch live data right now.]`;
        }

        const result = await runGeminiWithFallback(
          genAI,
          { systemInstruction: JANCARE_SYSTEM_PROMPT },
          userPrompt,
          conversationMessages
        );
        
        const rawText = result.response.text();
        console.log(`[JanCare AI] RAW GEMINI RESPONSE:\n${rawText}`);
        finalResponse = rawText.trim();
        console.log(`[JanCare AI] PARSED RESPONSE: Successfully parsed`);
      } catch (err: any) {
        console.error("[JanCare AI] Gemini response generation failed:", err.message);
      }
    }

    // 4. Fallback if Gemini is offline
    if (!finalResponse) {
      console.log(`[JanCare AI] FALLBACK TRIGGERED`);

      // Detect language for localized fallback
      const hasDevanagari = /[\u0900-\u097F]/.test(message);
      const isMarathi = message.includes("ताप") || message.includes("माझी") || message.includes("मला") || message.includes("तुमच");
      const isHindi = hasDevanagari && !isMarathi;
      const isRomanHindi = /mujhe|bukhar|meri|kab|kaha|paas|wala|baat/i.test(message);

      if (toolNameCalled && !toolResult) {
        finalResponse = isMarathi
          ? "⚠️ डेटाबेस कनेक्शन टाइमआउट झाले. कृपया काही वेळाने पुन्हा प्रयत्न करा."
          : (isHindi || isRomanHindi)
          ? "⚠️ डेटाबेस कनेक्शन टाइमआउट हो गया। कृपया कुछ देर बाद फिर से प्रयास करें।"
          : "⚠️ Database connection timed out. Please try again shortly.";
      } else if (toolNameCalled === "getCareTimeline" && toolResult) {
        const p = toolResult.patient;
        const hr = toolResult.records[0];
        finalResponse = `Here is the care timeline for patient **${p.name}** (Ref: **${p.patientRefId}**, ${p.age}M):\n\n` +
          `• **Status**: Registered in ${p.village}, ${p.taluka}.\n` +
          `• **Vitals logged**: Temp: ${hr?.vitals?.temperature}°F, SpO2: ${hr?.vitals?.spo2}%, Heart Rate: ${hr?.vitals?.heartRate} bpm.\n` +
          `• **Triage**: ${hr?.triage?.level || "Priority"} (${hr?.triage?.reason || "High fever"}).`;
      } else if (toolNameCalled === "getMedicineAvailability" && toolResult) {
        const items = toolResult.inventory.map((i: any) => `• **${i.name}**: ${i.qty} units (${i.status})`).join("\n");
        finalResponse = `Medicine stock at **${toolResult.facility}**:\n\n${items}`;
      } else if (toolNameCalled === "findFacilities" && toolResult) {
        const clinics = toolResult.map((c: any) => `• **${c.name}** (${c.type}) in ${c.village}`).join("\n");
        finalResponse = `Healthcare facilities found:\n\n${clinics}`;
      } else {
        // Localized fallback for when Gemini is completely offline
        finalResponse = isMarathi
          ? "नमस्कार! 👋 मी जनCare Assistant आहे. मी तुम्हाला लक्षणे, अपॉइंटमेंट, औषधांची उपलब्धता, रेफरल किंवा फॉलो-अपबद्दल मदत करू शकतो. कृपया तुमचा प्रश्न विचारा."
          : (isHindi || isRomanHindi)
          ? "नमस्ते! 👋 मैं जनCare Assistant हूँ। मैं आपकी लक्षण रिपोर्टिंग, अपॉइंटमेंट, दवा उपलब्धता, रेफरल या फॉलो-अप में मदद कर सकता हूँ। कृपया अपना सवाल पूछें।"
          : "Hello! 👋 I'm the जनCare Assistant. I can help with symptoms, appointments, medicine availability, referrals, and follow-ups. How can I help you today?";
      }
    }

    console.log(`[JanCare AI] FINAL RESPONSE:\n${finalResponse}`);
    console.log(`[JanCare AI] API RESPONSE STATUS: 200`);

    return NextResponse.json({
      success: true,
      response: finalResponse,
      toolCalled: toolNameCalled,
      toolResult: toolResult,
    });
  } catch (error: any) {
    console.error("[JanCare AI] AI Agent query failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
