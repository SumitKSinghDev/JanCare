"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "@/locales/en";
import { hi } from "@/locales/hi";
import { mr } from "@/locales/mr";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const translations: Record<Language, any> = { en, hi, mr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("jancare_lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("jancare_lang", lang);
    }
  };

  // Helper to resolve dot notation e.g., t("nav.howItWorks")
  const t = (keyPath: string): string => {
    try {
      const parts = keyPath.split(".");
      let currentTranslation = translations[language] || translations["en"];
      let fallbackTranslation = translations["en"];

      for (const part of parts) {
        currentTranslation = currentTranslation?.[part];
        fallbackTranslation = fallbackTranslation?.[part];
      }

      return currentTranslation || fallbackTranslation || keyPath;
    } catch {
      return keyPath;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
