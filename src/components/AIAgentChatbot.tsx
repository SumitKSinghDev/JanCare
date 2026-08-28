"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18nContext";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

interface AIAgentChatbotProps {
  inline?: boolean;
}

export default function AIAgentChatbot({ inline = false }: AIAgentChatbotProps) {
  const { language, t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Close chatbot when navigation route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Support custom open event dispatching
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("jancare_open_chat", handleOpenChat);
    return () => window.removeEventListener("jancare_open_chat", handleOpenChat);
  }, []);
  
  // Voice states
  const [voiceOn, setVoiceOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasDebugQuery = window.location.search.includes("debug=true");
      const hasDebugStorage = localStorage.getItem("jancare_debug") === "true";
      setIsDebugEnabled(hasDebugQuery || hasDebugStorage);
    }
  }, []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isListeningRef = useRef(false);

  // Initialize messages based on current language
  useEffect(() => {
    setMessages([
      { sender: "agent", text: t("assistant.greeting") }
    ]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function toggleListening() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      // Use active language selection
      rec.lang = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        sendMessage(text);
      };

      rec.onerror = (e: any) => {
        setIsListening(false);
        isListeningRef.current = false;
        console.warn("Speech recognition error:", e);
        
        let errorMsg = `⚠️ Microphone issue detected (${e.error}). Please verify permissions.`;
        if (e.error === "not-allowed") {
          errorMsg = "⚠️ Microphone access blocked. Please grant microphone permissions in your browser URL bar.";
        } else if (e.error === "network") {
          errorMsg = "⚠️ Speech Recognition requires an internet connection (Google Cloud Speech APIs). Please type manually.";
        }
        setMessages((prev) => [...prev, { sender: "agent", text: errorMsg }]);
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      rec.start();
    } catch (err) {
      console.warn("Speech start failed:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }

  async function sendMessage(text: string) {
    const updatedMessages = [...messages, { sender: "user" as const, text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-10), // send last 10 messages for conversation memory
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: "agent", text: data.response }]);
        
        // Dispatch booking event to reload parent dashboard data
        if (data.toolCalled === "bookAppointment" && data.toolResult?.action === "BOOKED") {
          window.dispatchEvent(new CustomEvent("jancare_appointment_booked"));
        }

        // Detect language for debug panel and TTS
        const hasDevanagari = /[\u0900-\u097F]/.test(text);
        const isMarathi = /ताप|माझी|मला|तुमच|आहे|करा|औषध|अपॉइंटमेंट|फॉलो|रेफरल/.test(text);
        const isRomanHindi = /mujhe|bukhar|meri|kab|kaha|paas|dawai|baat|appointment|dard/i.test(text);
        const detectedLang = isMarathi ? "mr" : (hasDevanagari || isRomanHindi) ? "hi" : "en";
        
        const lowerText = text.toLowerCase();
        const matchedIntent = data.toolCalled
          ? (data.toolCalled === "getCareTimeline" ? "CHECK_HEALTH_TIMELINE" : data.toolCalled === "getMedicineAvailability" ? "CHECK_MEDICINE_AVAILABILITY" : "FIND_FACILITY")
          : lowerText.match(/bukhar|fever|ताप|दर्द|pain|cough|खांसी|cold|सर्दी|दस्त/) ? "SYMPTOM_REPORT"
          : lowerText.match(/appointment|अपॉइंटमेंट|भेट/) ? "CHECK_APPOINTMENT"
          : lowerText.match(/medicine|दवा|औषध|milegi|मिळतील/) ? "CHECK_MEDICINE_AVAILABILITY"
          : lowerText.match(/referral|रेफरल/) ? "CHECK_REFERRAL"
          : lowerText.match(/follow.?up|फॉलो/) ? "CHECK_FOLLOW_UP"
          : lowerText.match(/order|ट्रैक|tracking/) ? "CHECK_TRACKING_STATUS"
          : lowerText.match(/emergency|आपत्काल|सांस|chest/) ? "EMERGENCY"
          : lowerText.match(/hello|hi|namaste|नमस्ते|नमस्कार/) ? "GREETING"
          : "GENERAL";

        const ttsLang = detectedLang === "mr" ? "mr-IN" : detectedLang === "hi" ? "hi-IN" : "en-IN";

        const isBookingTool = data.toolCalled === "bookAppointment";
        setDebugInfo({
          transcript: text,
          detectedLanguage: detectedLang,
          intent: isBookingTool ? "BOOK_APPOINTMENT" : matchedIntent,
          entities: matchedIntent === "SYMPTOM_REPORT" ? (lowerText.match(/bukhar|fever|ताप/) ? "fever" : "symptom") : "None",
          action: isBookingTool ? "EXECUTE_BOOK_APPOINTMENT" : matchedIntent === "SYMPTOM_REPORT" ? "COLLECT_SYMPTOM_DETAILS" : matchedIntent === "GREETING" ? "CONVERSATIONAL_GREET" : `EXECUTE_${matchedIntent}`,
          status: data.success && (!isBookingTool || data.toolResult?.success !== false) ? "SUCCESS" : "FAILED",
          ttsLanguage: ttsLang,
          patientId: isBookingTool && data.toolResult?.appointment?.patientId ? data.toolResult.appointment.patientId : undefined,
          doctorId: isBookingTool && data.toolResult?.appointment?.doctorId ? data.toolResult.appointment.doctorId : undefined,
          facilityId: isBookingTool && data.toolResult?.appointment?.facilityId ? data.toolResult.appointment.facilityId : undefined,
          requestedSlot: isBookingTool && data.toolResult?.appointment?.date ? `${data.toolResult.appointment.date} ${data.toolResult.appointment.time}` : undefined,
          api: isBookingTool ? "POST /api/appointments" : undefined,
          dbWrite: isBookingTool ? (data.toolResult?.appointment?.id ? "SUCCESS" : "FAILED") : undefined,
          appointmentId: isBookingTool && data.toolResult?.appointment?.id ? data.toolResult.appointment.id : undefined,
          patientQuery: isBookingTool && data.toolResult?.appointment?.patientId ? "FOUND" : "NOT FOUND",
          doctorQuery: isBookingTool && data.toolResult?.appointment?.doctorId ? "FOUND" : "NOT FOUND",
        });

        if (voiceOn) {
          speak(data.response, ttsLang);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { sender: "agent", text: "Sorry, I ran into an error connecting to the AI service. Please try again." }]);
      setDebugInfo({ transcript: text, status: "ERROR", error: error?.message });
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string, locale?: string) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`•📍💊📅⚠️👋🎙️🧠🔊💬]/g, "").replace(/\n+/g, ". ");
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
      
      // Use the detected content language, falling back to UI language setting
      const ttsLang = locale || (language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN");
      utterance.lang = ttsLang;

      // Try to find the best matching voice for the locale
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang === ttsLang) || voices.find((v) => v.lang.startsWith(ttsLang.split("-")[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  const quickPrompts = [
    { label: t("assistant.promptNextStep"), text: "What is my next step in the care plan?" },
    { label: t("assistant.promptBook"), text: "How can I book a doctor consultation?" },
    { label: t("assistant.promptFacilities"), text: "Find healthcare clinics and facilities near Sinnar Nashik" },
    { label: t("assistant.promptRecords"), text: "Explain patient Ramesh Kumar's historical triage records" },
  ];

  if (inline) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary fill-primary" size={18} />
            <div>
              <h4 className="font-bold text-sm">
                {language === "mr" ? "जनCare सहाय्यक" : language === "hi" ? "जनCare सहायक" : t("assistant.title")}
              </h4>
              <p className="text-[10px] text-slate-300">
                {language === "mr" ? "AI सहाय्यित मार्गदर्शन" : language === "hi" ? "AI सहाय्यित मार्गदर्शन" : "AI-assisted care navigation"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              type="button"
              className="text-slate-300 hover:text-white p-1 rounded-md transition-colors bg-transparent border-0 cursor-pointer"
              title={voiceOn ? "Mute Voice Response" : "Unmute Voice Response"}
            >
              {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Legal AI Disclaimer Banner */}
        <div className="bg-amber-50 text-amber-800 text-[10px] py-1.5 px-4 text-center border-b border-amber-200/60 font-semibold tracking-wide shrink-0">
          💡 {t("assistant.disclaimer")}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-tr-none font-semibold shadow-xs"
                    : "bg-white text-text-primary border border-slate-200/80 rounded-tl-none shadow-xs whitespace-pre-line"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-500 border border-slate-200/80 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={14} /> 
                {language === "mr" ? "माहिती मिळवत आहे..." : language === "hi" ? "जानकारी प्राप्त की जा रही है..." : "Resolving database metrics..."}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(p.text)}
              disabled={loading}
              className="bg-white hover:bg-blue-50 border border-slate-200 text-primary font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer inline-block"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4 flex gap-2 items-center bg-white shrink-0">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title="Speak with AI Voice"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === "mr" ? "आरोग्यविषयक प्रश्न विचारा..." : language === "hi" ? "स्वास्थ्य प्रश्न पूछें..." : "Ask about Ramesh or stock..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all text-slate-700"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-blue-600 text-white p-2.5 rounded-xl transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer border-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-deep-blue text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer border-0"
        >
          <Sparkles className="animate-pulse" size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-sm whitespace-nowrap">
            {language === "mr" ? "बोलून सांगा" : language === "hi" ? "बोलकर बताएं" : "Ask JanCare Assistant"}
          </span>
        </button>
      )}

      {/* Expanded Calming Premium Chat Widget */}
      {isOpen && (
        <div className="bg-white border border-border-brand rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-deep-blue text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary fill-primary" size={18} />
              <div>
                <h4 className="font-bold text-sm">
                  {language === "mr" ? "जनCare सहाय्यक" : language === "hi" ? "जनCare सहायक" : t("assistant.title")}
                </h4>
                <p className="text-[10px] text-slate-300">
                  {language === "mr" ? "AI सहाय्यित मार्गदर्शन" : language === "hi" ? "AI सहाय्यित मार्गदर्शन" : "AI-assisted care navigation"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                className="text-slate-300 hover:text-white p-1 rounded-md transition-colors bg-transparent border-0 cursor-pointer"
                title={voiceOn ? "Mute Voice Response" : "Unmute Voice Response"}
              >
                {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md transition-colors bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Legal AI Disclaimer Banner */}
          <div className="bg-amber-50 text-amber-800 text-[10px] py-1.5 px-4 text-center border-b border-amber-200/60 font-semibold tracking-wide">
            💡 {t("assistant.disclaimer")}
          </div>


          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-brand">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none font-semibold shadow-xs"
                      : "bg-white text-text-primary border border-border-brand rounded-tl-none shadow-xs whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-text-secondary border border-border-brand p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={14} /> 
                  {language === "mr" ? "माहिती मिळवत आहे..." : language === "hi" ? "जानकारी प्राप्त की जा रही है..." : "Resolving database metrics..."}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-50 border-t border-border-brand flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p.text)}
                disabled={loading}
                className="bg-white hover:bg-soft-blue border border-slate-200 text-primary font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer inline-block"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Inputs Form */}
          <form onSubmit={handleSubmit} className="border-t border-border-brand p-4 flex gap-2 items-center bg-white">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white border-red-600 animate-pulse"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
              title="Speak with AI Voice"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === "mr" ? "आरोग्यविषयक प्रश्न विचारा..." : language === "hi" ? "स्वास्थ्य प्रश्न पूछें..." : "Ask about Ramesh or stock..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-primary transition-all text-text-primary"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-deep-blue text-white p-2.5 rounded-xl transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>

          {debugInfo && debugInfo.intent === "BOOK_APPOINTMENT" && isDebugEnabled && (
            <div className="bg-slate-900 text-slate-350 p-4.5 font-mono text-[9px] border-t border-slate-800 space-y-1 select-text">
              <div className="font-bold text-slate-400 pb-1 border-b border-slate-800">🛠️ Developer Debug Panel (Step 17)</div>
              <div>AI Intent: <span className="text-green-400 font-bold">{debugInfo.intent}</span></div>
              <div>Patient ID: <span className="text-blue-400 font-bold">{debugInfo.patientId || "None"}</span></div>
              <div>Doctor ID: <span className="text-blue-400 font-bold">{debugInfo.doctorId || "None"}</span></div>
              <div>Facility ID: <span className="text-blue-400 font-bold">{debugInfo.facilityId || "None"}</span></div>
              <div>Requested Slot: <span className="text-amber-400 font-bold">{debugInfo.requestedSlot || "None"}</span></div>
              <div>API: <span className="text-yellow-400 font-bold">{debugInfo.api || "None"}</span></div>
              <div>Database Write: <span className={debugInfo.dbWrite === "SUCCESS" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{debugInfo.dbWrite || "None"}</span></div>
              <div>Appointment ID: <span className="text-green-400 font-bold">{debugInfo.appointmentId || "None"}</span></div>
              <div>Patient Query: <span className="text-purple-400 font-bold">{debugInfo.patientQuery || "None"}</span></div>
              <div>Doctor Query: <span className="text-purple-400 font-bold">{debugInfo.doctorQuery || "None"}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
