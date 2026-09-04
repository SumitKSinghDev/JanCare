"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useTranslation } from "@/lib/i18nContext";

export default function OfflineSyncManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const { language } = useTranslation();

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[JanCare PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[JanCare PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Initial network check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    // 3. Network event listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-60 w-[92%] max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      {isOffline ? (
        <div className="bg-amber-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-amber-600/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-700/60 rounded-lg shrink-0 text-amber-200">
              <WifiOff size={16} className="animate-pulse" />
            </div>
            <div>
              <strong className="block font-bold text-amber-100 text-[11px]">
                {language === "mr"
                  ? "इंटरनेट डिस्कनेक्ट झाले (ऑफलाइन मोड)"
                  : language === "hi"
                  ? "इंटरनेट डिस्कनेक्ट हुआ (ऑफलाइन मोड)"
                  : "Offline Mode Active"}
              </strong>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">
                {language === "mr"
                  ? "डेटा स्थानिक पातळीवर सेव्ह केला जात आहे. कनेक्ट झाल्यावर सिंक होईल."
                  : language === "hi"
                  ? "डेटा स्थानीय रूप से सुरक्षित हो रहा है। कनेक्ट होते ही सिंक होगा।"
                  : "Data is saved locally. Auto-sync will trigger when online."}
              </span>
            </div>
          </div>
          <span className="bg-amber-800 text-amber-200 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold shrink-0">
            {language === "mr" ? "स्थानिक" : language === "hi" ? "स्थानिक" : "LOCAL"}
          </span>
        </div>
      ) : (
        <div className="bg-emerald-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-600/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-700/60 rounded-lg shrink-0 text-emerald-200">
              <Wifi size={16} />
            </div>
            <div>
              <strong className="block font-bold text-emerald-100 text-[11px]">
                {language === "mr"
                  ? "इंटरनेट कनेक्शन पूर्ववत झाले!"
                  : language === "hi"
                  ? "इंटरनेट कनेक्शन फिर से जुड़ गया!"
                  : "Back Online!"}
              </strong>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                {language === "mr"
                  ? "स्थानिक डेटा सर्व्हरशी यशस्वीरित्या सिंक झाला."
                  : language === "hi"
                  ? "स्थानीय डेटा सर्वर के साथ सिंक हो गया है।"
                  : "Local records synced with district cloud."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded uppercase font-mono">
            <RefreshCw size={10} className="animate-spin" /> SYNCED
          </div>
        </div>
      )}
    </div>
  );
}
