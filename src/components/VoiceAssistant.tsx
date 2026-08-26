"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from "lucide-react";

interface VoiceAssistantProps {
  onExtractionComplete: (extraction: {
    symptoms: Array<{ name: string; durationDays: number; severity: "Mild" | "Moderate" | "Severe" }>;
    vitals: {
      temperature?: number;
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      heartRate?: number;
      spo2?: number;
      respiratoryRate?: number;
    };
  }) => void;
  language?: "English" | "Hindi" | "Marathi";
}

export default function VoiceAssistant({ onExtractionComplete, language = "English" }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistantReply, setAssistantReply] = useState("");
  const [error, setError] = useState("");
  const [manualText, setManualText] = useState("");

  const [recognition, setRecognition] = useState<any>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    // Initialize Web Speech API Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        // Map languages
        if (language === "Marathi") rec.lang = "mr-IN";
        else if (language === "Hindi") rec.lang = "hi-IN";
        else rec.lang = "en-IN";

        rec.onstart = () => {
          setIsRecording(true);
          setTranscript("");
          setAssistantReply("");
          setError("");
        };

        rec.onresult = async (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          await processVoiceInput(text);
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition warning:", e);
          setIsRecording(false);
          if (isRecordingRef.current) {
            if (e.error === "network") {
              setError("Speech Recognition requires an internet connection (Google Cloud-based Speech APIs). Please type manually.");
            } else if (e.error === "not-allowed") {
              setError("Microphone access blocked. Chrome requires localhost or HTTPS to record audio.");
            } else {
              setError(`Recording error: ${e.error || "Please verify microphone permissions."}`);
            }
            isRecordingRef.current = false;
          }
        };

        rec.onend = () => {
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        setRecognition(rec);
      }
    }
  }, [language]);

  async function toggleRecording() {
    if (!recognition) {
      alert("Web Speech API recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isRecording) {
      isRecordingRef.current = false;
      recognition.stop();
    } else {
      isRecordingRef.current = true;
      recognition.start();
    }
  }

  async function processVoiceInput(text: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.replyText) {
          setAssistantReply(data.replyText);
          speakOutLoud(data.replyText);
        }
        if (data.extraction) {
          onExtractionComplete(data.extraction);
        }
      }
    } catch (e) {
      console.error("Failed to process AI voice input:", e);
    } finally {
      setLoading(false);
    }
  }

  function speakOutLoud(text: string) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Stop current speaking
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === "Marathi") utterance.lang = "mr-IN";
      else if (language === "Hindi") utterance.lang = "hi-IN";
      else utterance.lang = "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="bg-white border border-border-brand p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-deep-blue flex items-center gap-1.5">
          <Sparkles className="text-primary" size={14} />
          <span>AI Voice Assistant ({language})</span>
        </h4>
        <span className="text-[10px] text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          Sandbox Ready
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-3.5 rounded-full transition-all border cursor-pointer ${
            isRecording
              ? "bg-red-500 text-white border-red-600 animate-pulse"
              : "bg-soft-blue text-primary border-primary/20 hover:bg-primary hover:text-white"
          }`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <p className="text-xs text-red-500 font-semibold animate-pulse">Listening... Speak now.</p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Loader2 className="animate-spin text-primary" size={14} /> Extracting clinical details...
            </div>
          ) : error ? (
            <p className="text-xs text-red-600 font-semibold leading-normal">{error}</p>
          ) : transcript ? (
            <div className="space-y-1">
              <p className="text-xs text-text-secondary italic truncate">"{transcript}"</p>
              {assistantReply && (
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Volume2 size={12} /> {assistantReply}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">Click mic to speak, or use inputs below.</p>
          )}
        </div>
      </div>

      {/* Quick Demo Scenarios (Free & Reliable) */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-left">
        <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Quick Demo Scenarios (Click to test AI Extraction)</span>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const txt = "High fever and severe weakness for Ramesh Kumar, temperature is 103 degrees, SpO2 is 90 percent";
              setTranscript(txt);
              processVoiceInput(txt);
            }}
            className="bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-red-200/50 cursor-pointer"
          >
            🔥 High Fever / SpO2 Low (Urgent)
          </button>
          <button
            type="button"
            onClick={() => {
              const txt = "Patient Ramesh Kumar has a mild cough, temperature is 98.4, blood pressure is 120 over 80, feeling fine";
              setTranscript(txt);
              processVoiceInput(txt);
            }}
            className="bg-green-50 hover:bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded-lg border border-green-200/50 cursor-pointer"
          >
            🌱 Routine Checkup (Normal)
          </button>
        </div>
      </div>

      {/* Manual text typing input backup */}
      <div className="pt-2 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          placeholder="Or type patient symptoms/vitals manually..."
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden text-text-primary"
        />
        <button
          type="button"
          onClick={() => {
            if (!manualText) return;
            setTranscript(manualText);
            processVoiceInput(manualText);
            setManualText("");
          }}
          className="bg-primary hover:bg-deep-blue text-white text-[10px] font-bold px-3 py-2 rounded-xl border-0 cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}
