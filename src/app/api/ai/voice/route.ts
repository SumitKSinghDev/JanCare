import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import Referral from "@/models/Referral";
import FollowUp from "@/models/FollowUp";
import Medicine from "@/models/Medicine";
import Facility from "@/models/Facility";
import HealthRecord from "@/models/HealthRecord";
import Prescription from "@/models/Prescription";
import User from "@/models/User";
import { runTriageAssessment } from "@/lib/providers/ai";
import { authenticateRequest } from "@/lib/authMiddleware";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
        console.log(`[JanCare Voice AI] Attempting Gemini model ${modelName} (attempt ${attempt}/${retries})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
        });

        return await model.generateContent(promptText);
      } catch (err: any) {
        lastError = err;
        console.warn(`[JanCare Voice AI] Model ${modelName} failed on attempt ${attempt}:`, err.message);
        
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

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { text, language } = body;

    if (!text) {
      return NextResponse.json({ success: false, error: "Missing required text field" }, { status: 400 });
    }

    const lang = language || "English";

    // 1. Fetch corresponding patient details if logged-in user is a Patient
    let patient = null;
    if (user.role === "Patient") {
      patient = await Patient.findOne({ mobile: userDoc.username });
    } else {
      // If ASHA worker is logged in, default to latest patient for demo triage context
      patient = await Patient.findOne({}).sort({ createdAt: -1 });
    }

    // 2. zentral intent detection and slot extraction
    let intent = "GREETING";
    let extractedSymptoms: any[] = [];
    let extractedVitals: any = {};
    let medicineName = "";
    let locationName = "";

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const classifierPrompt = `
You are the central Central Central intent classifier and information extractor for जनCare, a rural healthcare platform.
Given the patient's statement, classify their intent into one of these categories:
- GREETING: Conversation starter, simple hello/hi/Namaste.
- REPORT_SYMPTOM: Reporting physical symptoms, fever, cold, chest pain, or logging vitals.
- FETCH_APPOINTMENT: Asking about when their next appointment is.
- BOOK_CONSULTATION: Asking to book a doctor consultation or talk to a physician.
- CHECK_MEDICINE_INVENTORY: Asking where a medicine (e.g. Metformin, Paracetamol) is available.
- TRACK_MEDICINE_ORDER: Asking about status of their medicine delivery or tracking.
- FETCH_REFERRAL: Asking about hospital referral status.
- FETCH_FOLLOWUP: Asking about follow-up dates or visits.
- FIND_FACILITIES: Asking for health centers in Sinnar or nearby areas.

Also extract any parameters:
- symptoms: List of symptom objects, each containing: "name", "durationDays" (default 1 if not stated), "severity" ("Mild" | "Moderate" | "Severe").
- vitals: Object containing: "temperature" (number), "bloodPressureSystolic" (number), "bloodPressureDiastolic" (number), "heartRate" (number), "spo2" (number).
- medicineName: Name of any medicine mentioned (e.g. "Metformin", "Paracetamol").
- locationName: Name of any taluka or city mentioned (e.g. "Sinnar", "Sonapur").

Patient Statement: "${text}"
Language context: ${lang}

Output a strictly structured JSON response containing:
{
  "intent": "GREETING" | "REPORT_SYMPTOM" | "FETCH_APPOINTMENT" | "BOOK_CONSULTATION" | "CHECK_MEDICINE_INVENTORY" | "TRACK_MEDICINE_ORDER" | "FETCH_REFERRAL" | "FETCH_FOLLOWUP" | "FIND_FACILITIES",
  "symptoms": [...],
  "vitals": {...},
  "medicineName": "extracted medicine",
  "locationName": "extracted location"
}
Return ONLY valid JSON. No markdown wrappers.
`;
        const response = await runGeminiWithFallback(genAI, {}, classifierPrompt);
        const resText = response.response.text().trim();
        const cleanText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        const result = JSON.parse(cleanText);

        intent = result.intent || "GREETING";
        extractedSymptoms = result.symptoms || [];
        extractedVitals = result.vitals || {};
        medicineName = result.medicineName || "";
        locationName = result.locationName || "";
      } catch (err) {
        console.error("Gemini classification failed, falling back to keyword logic:", err);
        fallbackClassification(text);
      }
    } else {
      fallbackClassification(text);
    }

    function fallbackClassification(utterance: string) {
      const textLower = utterance.toLowerCase();
      if (textLower.includes("bukhar") || textLower.includes("fever") || textLower.includes("ताप") || textLower.includes("cough") || textLower.includes("cold") || textLower.includes("pain") || textLower.includes("weakness")) {
        intent = "REPORT_SYMPTOM";
        if (textLower.includes("bukhar") || textLower.includes("fever") || textLower.includes("ताप")) {
          extractedSymptoms.push({ name: "Fever", durationDays: 3, severity: "Moderate" });
        }
        if (textLower.includes("cough") || textLower.includes("cold")) {
          extractedSymptoms.push({ name: "Cough", durationDays: 2, severity: "Mild" });
        }
        const tempMatch = textLower.match(/(\d{2,3}(\.\d)?)/);
        if (tempMatch) {
          extractedVitals.temperature = parseFloat(tempMatch[1]);
        }
      } else if (textLower.includes("appointment") || textLower.includes("अपॉइंटमेंट")) {
        intent = "FETCH_APPOINTMENT";
      } else if (textLower.includes("doctor") || textLower.includes("बात") || textLower.includes("consult")) {
        intent = "BOOK_CONSULTATION";
      } else if (textLower.includes("medicine") || textLower.includes("dawa") || textLower.includes("दवा") || textLower.includes("metformin") || textLower.includes("paracetamol")) {
        intent = "CHECK_MEDICINE_INVENTORY";
        if (textLower.includes("metformin")) medicineName = "Metformin";
        if (textLower.includes("paracetamol")) medicineName = "Paracetamol";
      } else if (textLower.includes("order") || textLower.includes("order status") || textLower.includes("ऑर्डर")) {
        intent = "TRACK_MEDICINE_ORDER";
      } else if (textLower.includes("referral") || textLower.includes("रिफरल")) {
        intent = "FETCH_REFERRAL";
      } else if (textLower.includes("followup") || textLower.includes("follow-up") || textLower.includes("फॉलो-अप")) {
        intent = "FETCH_FOLLOWUP";
      } else if (textLower.includes("facility") || textLower.includes("sinnar") || textLower.includes("सिंन्नर") || textLower.includes("centre") || textLower.includes("hospital")) {
        intent = "FIND_FACILITIES";
        if (textLower.includes("sinnar")) locationName = "Sinnar";
      }
    }

    // 3. Central Router logic to query database models and construct localized natural speech replies
    let replyText = "";

    switch (intent) {
      case "GREETING":
        if (lang === "Marathi") {
          replyText = "नमस्कार! 👋 मी जनCare AI सहाय्यक आहे. मी आपली काय मदत करू शकते? आपण आपली लक्षणे सांगू शकता, अपॉइंटमेंट तपासू शकता किंवा औषध उपलब्धता पाहू शकता.";
        } else if (lang === "Hindi") {
          replyText = "नमस्ते! 👋 मैं जनCare AI असिस्टेंट हूँ। मैं आपकी क्या मदद कर सकती हूँ? आप लक्षण बता सकते हैं, अपॉइंटमेंट चेक कर सकते हैं या दवा की उपलब्धता देख सकते हैं।";
        } else {
          replyText = "Namaste! 👋 I'm जनCare Assistant. How can I help you today? You can tell me your symptoms, check appointments, find facilities, or check medicine availability.";
        }
        break;

      case "REPORT_SYMPTOM":
        if (extractedSymptoms.length > 0) {
          // Perform triage
          const triage = await runTriageAssessment(
            extractedVitals,
            extractedSymptoms,
            patient?.age || 54,
            patient?.gender || "Male"
          );

          // Save HealthRecord directly in the database
          if (patient) {
            const hr = new HealthRecord({
              patientId: patient._id,
              recordedBy: userDoc._id,
              vitals: {
                temperature: extractedVitals.temperature,
                spo2: extractedVitals.spo2 || 98,
                bloodPressureSystolic: extractedVitals.bloodPressureSystolic || 120,
                bloodPressureDiastolic: extractedVitals.bloodPressureDiastolic || 80,
                heartRate: extractedVitals.heartRate || 78,
              },
              symptoms: extractedSymptoms,
              triage: {
                level: triage.level,
                reason: triage.reason,
                aiExplanation: triage.aiExplanation,
                triageDate: new Date(),
              },
              offlineCreated: false,
            });
            await hr.save();
          }

          const temp = extractedVitals.temperature;
          const dur = extractedSymptoms[0].durationDays || 3;

          if (lang === "Marathi") {
            replyText = `समजले. आपल्याला ताप आहे. ${temp ? `आपले तापमान सुमारे ${temp}°F आहे` : ""} आणि लक्षणे ${dur} दिवसांपासून आहेत. मी हे आपल्या रेकॉर्ड मध्ये नोंदवले आहे. आपल्याला अशक्तपणा किंवा श्वास घेण्यास त्रास होत आहे का?`;
          } else if (lang === "Hindi") {
            replyText = `समझ गया। आपको बुखार है। ${temp ? `आपका तापमान लगभग ${temp}°F है` : ""} और बुखार ${dur} दिनों से है। मैं इसे आपके लक्षणों में दर्ज कर रहा हूँ। क्या आपको कमजोरी या सांस लेने में परेशानी हो रही है?`;
          } else {
            replyText = `I understand. You reported fever. ${temp ? `Your temperature is about ${temp}°F` : ""} and symptoms are present for ${dur} days. I have logged this to your health record. Do you also feel weakness or shortness of breath?`;
          }
        } else {
          if (lang === "Marathi") {
            replyText = "समजले. आपल्याला ताप आहे. आपल्याला ताप कधीपासून आहे? आपले तापमान मोजले गेले आहे का?";
          } else if (lang === "Hindi") {
            replyText = "समझ गया। आपको बुखार है। आपको बुखार कब से है? क्या आपका तापमान मापा गया है?";
          } else {
            replyText = "I understand you have a fever. How long have you had it? Has your temperature been measured?";
          }
        }
        break;

      case "FETCH_APPOINTMENT":
        if (patient) {
          const appt = await Appointment.findOne({ patientId: patient._id })
            .populate("doctorId")
            .sort({ appointmentDate: 1 });
          if (appt) {
            const dateStr = new Date(appt.appointmentDate).toLocaleDateString();
            const docName = appt.doctorId ? (appt.doctorId as any).name : "Aniruddha Kulkarni";
            if (lang === "Marathi") {
              replyText = `आपली पुढील अपॉइंटमेंट ${dateStr} रोजी डॉक्टर ${docName} यांच्यासोबत शेड्यूल आहे.`;
            } else if (lang === "Hindi") {
              replyText = `आपका अगला अपॉइंटमेंट ${dateStr} को डॉक्टर ${docName} के साथ शेड्यूल है।`;
            } else {
              replyText = `Your next appointment is scheduled on ${dateStr} with Dr. ${docName}.`;
            }
            break;
          }
        }
        if (lang === "Marathi") {
          replyText = "सध्या आपल्यासाठी कोणतीही सक्रिय अपॉइंटमेंट सापडली नाही. नवीन कन्सल्टेशन बुक करू इच्छिता का?";
        } else if (lang === "Hindi") {
          replyText = "अभी आपके लिए कोई सक्रिय अपॉइंटमेंट नहीं मिला है। क्या आप नया कन्सल्टेशन बुक करना चाहते हैं?";
        } else {
          replyText = "No active appointments were found. Would you like to schedule a new doctor consultation?";
        }
        break;

      case "BOOK_CONSULTATION":
        if (lang === "Marathi") {
          replyText = "मी डॉक्टरांशी बोलण्यासाठी आपले लाईव्ह टेलिकन्सल्टेशन शेड्यूल करू शकते. कृपया अपॉइंटमेंट फॉर्म उघडा.";
        } else if (lang === "Hindi") {
          replyText = "मैं डॉक्टर से बात करने के लिए आपका लाइव टेलीकंसल्टेशन शेडूल कर सकती हूँ। कृपया अपॉइंटमेंट फॉर्म खोलें।";
        } else {
          replyText = "I can help schedule a live video consultation with a doctor. Please open the appointment form.";
        }
        break;

      case "CHECK_MEDICINE_INVENTORY":
        const medNameClean = medicineName || "Metformin";
        const med = await Medicine.findOne({ name: new RegExp(medNameClean, "i") });
        if (med && med.quantity > 0) {
          if (lang === "Marathi") {
            replyText = `${medNameClean} सिन्नर सेंट्रल फार्मसी आणि सोनपूर पी.एच.सी. मध्ये उपलब्ध आहे.`;
          } else if (lang === "Hindi") {
            replyText = `${medNameClean} सिन्नर सेंट्रल फार्मेसी और सोनपूर पीएचसी में उपलब्ध है।`;
          } else {
            replyText = `${medNameClean} is currently available in stock at Sinnar Central Subcenter and Sonapur PHC.`;
          }
        } else {
          if (lang === "Marathi") {
            replyText = `माफ करा, ${medNameClean} सध्या आपल्या जवळच्या प्राथमिक केंद्रांवर कमी प्रमाणात उपलब्ध आहे.`;
          } else if (lang === "Hindi") {
            replyText = `माफ़ कीजिये, ${medNameClean} अभी आपके पास के प्राथमिक स्वास्थ्य केंद्र पर कम है।`;
          } else {
            replyText = `Sorry, ${medNameClean} is currently running low in stock at nearby health subcenters.`;
          }
        }
        break;

      case "TRACK_MEDICINE_ORDER":
        if (lang === "Marathi") {
          replyText = "तुमची अलीकडील औषधांची ऑर्डर (JC-MED-8492) तयार आहे आणि सिन्नर सेंट्रल फार्मसी काउंटरवर उपलब्ध आहे.";
        } else if (lang === "Hindi") {
          replyText = "आपका हालिया मेडिसिन ऑर्डर (JC-MED-8492) तैयार है और सिन्नर सेंट्रल फार्मेसी काउंटर पर कलेक्ट करने के लिए उपलब्ध है।";
        } else {
          replyText = "Your recent generic medicine order (JC-MED-8492) is ready and available for collection at Sinnar counter.";
        }
        break;

      case "FETCH_REFERRAL":
        if (patient) {
          const ref = await Referral.findOne({ patientId: patient._id }).sort({ createdAt: -1 });
          if (ref) {
            if (lang === "Marathi") {
              replyText = `तुमचे नाशिक सिव्हिल हॉस्पिटलचे रेफरल मंजूर झाले आहे. सध्या त्याचे स्टेटस ${ref.status} आहे.`;
            } else if (lang === "Hindi") {
              replyText = `आपका नाशिक सिविल हॉस्पिटल का रेफरल स्वीकार कर लिया गया है। वर्तमान स्टेटस ${ref.status} है।`;
            } else {
              replyText = `Your secondary referral transfer to Nashik Civil Hospital has been approved. Status is ${ref.status}.`;
            }
            break;
          }
        }
        if (lang === "Marathi") {
          replyText = "तुमचा कोणताही सक्रिय रेफरल रेकॉर्ड सापडला नाही.";
        } else if (lang === "Hindi") {
          replyText = "आपका कोई सक्रिय रेफरल रिकॉर्ड नहीं मिला।";
        } else {
          replyText = "No active secondary referral records were found for your profile.";
        }
        break;

      case "FETCH_FOLLOWUP":
        if (patient) {
          const fup = await FollowUp.findOne({ patientId: patient._id }).sort({ dueDate: 1 });
          if (fup) {
            const dateStr = new Date(fup.dueDate).toLocaleDateString();
            if (lang === "Marathi") {
              replyText = `आपला घरचा फॉलो-अप दौरा ${dateStr} रोजी आशा वर्कर शारदा पाटील यांच्यासोबत नियोजित आहे.`;
            } else if (lang === "Hindi") {
              replyText = `आपका अगला फॉलो-अप ${dateStr} को आशा वर्कर शारदा पाटील के साथ शेड्यूल है।`;
            } else {
              replyText = `Your next home follow-up visit is scheduled on ${dateStr} with ASHA Sharda Patil.`;
            }
            break;
          }
        }
        if (lang === "Marathi") {
          replyText = "सध्या कोणताही प्रलंबित फॉलो-अप दौरा शेड्यूल नाही.";
        } else if (lang === "Hindi") {
          replyText = "अभी कोई प्रलंबित फॉलो-अप शेड्यूल नहीं है।";
        } else {
          replyText = "You have no pending home follow-up visits scheduled for this week.";
        }
        break;

      case "FIND_FACILITIES":
        if (lang === "Marathi") {
          replyText = "सिन्नर तालुक्यात ३ प्राथमिक आरोग्य केंद्रे उपलब्ध आहेत - सोनपूर पी.एच.सी., सिन्नर सेंट्रल हब आणि पांगरी सबसेंटर.";
        } else if (lang === "Hindi") {
          replyText = "सिन्नर तालुक्यात ३ प्राथमिक स्वास्थ्य केंद्र उपलब्ध हैं - सोनपूर पीएचसी, सिन्नर सेंट्रल हब और पांगरी सबसेंटर।";
        } else {
          replyText = "Sinnar Taluka currently has 3 primary health facilities: Sonapur PHC, Sinnar Central Hub, and Pangari Subcenter.";
        }
        break;

      default:
        replyText = lang === "Marathi" ? "मी तुमची कशी मदत करू? लक्षणे सांगा." : lang === "Hindi" ? "मैं आपकी क्या मदद करूँ? अपने लक्षण बताएं।" : "How can I assist you? Please tell me your symptoms.";
    }

    return NextResponse.json({
      success: true,
      replyText,
      intent,
      extraction: {
        symptoms: extractedSymptoms,
        vitals: extractedVitals,
      },
    });
  } catch (error: any) {
    console.error("AI Voice central coordinator failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
