"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18nContext";
import {
  Activity,
  Shield,
  Smartphone,
  Video,
  FileText,
  Truck,
  RotateCcw,
  CheckCircle,
  Menu,
  X,
  MapPin,
  ArrowRight,
  TrendingUp,
  Brain,
  WifiOff,
  UserCheck,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  Award,
  Globe,
  Users
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { language, setLanguage, t } = useTranslation();

  const careJourneySteps = [
    {
      title: t("journey.symptoms"),
      icon: Activity,
      desc: language === "mr" ? "आरोग्य सेविका रुग्णाच्या लक्षणांची नोंद ऑफलाईन करतात." : language === "hi" ? "स्वास्थ्य कार्यकर्ता मरीज के लक्षणों को ऑफ़लाइन दर्ज करते हैं।" : "Frontline worker records patient symptoms and vitals offline.",
      detail: language === "mr" ? "मोबाईल नेटवर्क नसलेल्या दुर्गम गावांमध्येही आशा कार्यकर्त्या ताप किंवा चक्कर येण्यासारख्या लक्षणांची सोप्या स्थानिक फॉर्मद्वारे नोंद करतात." : language === "hi" ? "मोबाइल नेटवर्क के बिना भी आशा कार्यकर्ता बुखार या चक्कर आने जैसे लक्षणों को ऑफ़लाइन दर्ज करती हैं।" : "ASHA workers record symptoms like fever or dizziness using an easy-to-use local form, even without cell service in remote villages."
    },
    {
      title: t("journey.triage"),
      icon: Brain,
      desc: language === "mr" ? "क्लिनिकल सेफ्टी इंजिनद्वारे तातडीचे वर्गीकरण (तातडीचे, प्राधान्य, सामान्य)." : language === "hi" ? "क्लीनिकल सेफ्टी इंजन द्वारा वर्गीकरण (आपातकालीन, प्राथमिकता, सामान्य)।" : "Clinical Safety Engine classifies severity (Urgent, Priority, Routine).",
      detail: language === "mr" ? "जनCare चे नियम आणि AI तंत्रज्ञान रुग्णाच्या लक्षणांचे विश्लेषण करून योग्य उपचाराची शिफारस करतात." : language === "hi" ? "क्लीनिकल नियम और AI मिलकर लक्षणों की गंभीरता का विश्लेषण कर सही मार्ग सुझाते हैं।" : "JanCare's clinical rules combine structured metrics with AI to classify cases, recommending immediate care tracks."
    },
    {
      title: t("journey.rightCare"),
      icon: MapPin,
      desc: language === "mr" ? "रुग्णाला जवळच्या योग्य व उपलब्ध आरोग्य केंद्रात जाण्याचा सल्ला दिला जातो." : language === "hi" ? "मरीज को निकटतम उपलब्ध स्वास्थ्य केंद्र में भेजा जाता है।" : "Patient is directed to the nearest appropriate, available clinic.",
      detail: language === "mr" ? "थेट डॉक्टरांच्या उपलब्धतेनुसार प्राथमिक आरोग्य केंद्रांचा मार्ग दाखवून रुग्णाचा वेळ वाचवला जातो." : language === "hi" ? "डॉक्टरों की उपलब्धता के आधार पर नजदीकी प्राथमिक स्वास्थ्य केंद्रों का मार्ग दिखाया जाता है।" : "Coordinates routing to primary health clinics based on live doctor availability, saving hours of unnecessary travel."
    },
    {
      title: t("journey.doctor"),
      icon: UserCheck,
      desc: language === "mr" ? "रुग्णाचा इतिहास आरोग्य केंद्राच्या डिजिटल क्यूमध्ये सुरक्षितपणे नोंदवला जातो." : language === "hi" ? "मरीज का इतिहास डिजिटल कतार में सुरक्षित रूप से दर्ज किया जाता है।" : "The patient record is queued securely in the clinic command center.",
      detail: language === "mr" ? "सल्लामसलत सुरू होण्यापूर्वीच डॉक्टरांना रुग्णाच्या मागील उपचारांची माहिती उपलब्ध करून दिली जाते." : language === "hi" ? "डॉक्टर के पास परामर्श शुरू होने से पहले ही मरीज के स्वास्थ्य इतिहास की जानकारी पहुंच जाती है।" : "Ensures the patient's records are available for review before they even start their consultation."
    },
    {
      title: t("journey.video"),
      icon: Video,
      desc: language === "mr" ? "थेट व्हिडिओद्वारे डॉक्टरांशी सल्लामसलत केली जाते." : language === "hi" ? "वीडियो कॉल द्वारा डॉक्टर से लाइव परामर्श किया जाता है।" : "Secure, WebRTC browser consultation is conducted live.",
      detail: language === "mr" ? "व्हिडिओ सल्लामसलत सुविधेमुळे तज्ज्ञ डॉक्टर थेट जोडले जातात आणि रुग्णाचे रिपोर्ट स्क्रीनवर दिसतात." : language === "hi" ? "वीडियो परामर्श द्वारा विशेषज्ञ डॉक्टर मरीजों से जुड़ते हैं और रिपोर्ट देख सकते हैं।" : "Daily.co WebRTC integrations bring medical specialists directly to subcenters, with the patient's vitals panel visible next to the feed."
    },
    {
      title: t("journey.medicine"),
      icon: Truck,
      desc: language === "mr" ? "औषध साठ्याची पडताळणी करून औषधे राखीव केली जातात." : language === "hi" ? "दवाइयों के स्टॉक की जांच कर उन्हें आरक्षित किया जाता है।" : "Generics prescriptions are checked against local stock levels.",
      detail: language === "mr" ? "औषध साठा कमी असल्यास सिस्टीम त्वरित सूचना देते आणि जेनेरिक औषधे राखीव केली जातात." : language === "hi" ? "स्टॉक कम होने पर सिस्टम doctor को अलर्ट करता है और दवाइयाँ आरक्षित की जाती हैं।" : "Prescription checking automatically verifies and reserves stock in the facility pharmacy, warning if quantities run low."
    },
    {
      title: t("journey.referral"),
      icon: FileText,
      desc: language === "mr" ? "मोठ्या रुग्णालयांमध्ये वर्ग (रेफरल) प्रक्रिया डिजिटल केली जाते." : language === "hi" ? "जिला अस्पतालों के लिए रेफरल प्रक्रिया डिजिटल की जाती है।" : "Secondary transfers are logged, tracked, and coordinated.",
      detail: language === "mr" ? "मोठ्या सिव्हिल हॉस्पिटलमधील ट्रान्सफरचा मागोवा ठेवून रुग्णाची कागदपत्रे सुरक्षितरीत्या शेअर केली जातात." : language === "hi" ? "बड़े जिला अस्पतालों में स्थानांतरण की निगरानी की जाती है और दस्तावेज साझा किए जाते हैं।" : "Tracks patient transitions to larger civil hospitals, ensuring paperwork and historical records are shared securely."
    },
    {
      title: t("journey.followUp"),
      icon: RotateCcw,
      desc: language === "mr" ? "आशा कार्यकर्त्यांना घरगुती तपासणीसाठी स्वयंचलित सूचना पाठवली जाते." : language === "hi" ? "आगे की जाँच के लिए आशा कार्यकर्ताओं को स्वचालित अलर्ट भेजा जाता है।" : "ASHA workers are alerted automatically for post-discharge home checks.",
      detail: language === "mr" ? "रुग्णालयातून सुट्टी मिळाल्यानंतर आशा कार्यकर्त्यांना फॉलो-अप आणि विल्स तपासणीसाठी सूचना मिळतात." : language === "hi" ? "अस्पताल से छुट्टी मिलने के बाद आशा कार्यकर्ताओं को फॉलो-अप जाँच की सूची मिलती है।" : "Follow-ups are automatically scheduled and pushed to the local ASHA worker's task dashboard to close the care loop."
    },
    {
      title: t("journey.completeCare"),
      icon: CheckCircle,
      desc: language === "mr" ? "रुग्णाचा संपूर्ण प्रवास आणि उपचार यशस्वीरित्या नोंदवला जातो." : language === "hi" ? "मरीज की पूरी देखभाल और उपचार यात्रा सफलतापूर्वक पूरी होती है।" : "A secure, continuous medical record is preserved with the patient.",
      detail: language === "mr" ? "प्रत्येक तपासणी, सल्ला, आणि औषधांची नोंद एका सुरक्षित आणि निरंतर डिजिटल टाइमलाइनवर उपलब्ध असते." : language === "hi" ? "हर जांच, परामर्श और दवाई की जानकारी एक सुरक्षित डिजिटल टाइमलाइन पर सेव की जाती है।" : "Every vital sign, prescription, referral, and consultation is logged into a unified, longitudinal timeline."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans selection:bg-primary/20 relative">
      
      {/* Navigation Header */}
      <header className="bg-white border-b border-border-brand sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="जनCare Logo" className="h-10 w-auto" />
            </Link>
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-text-secondary">
              <a href="#journey" className="hover:text-primary transition-colors">{t("nav.howItWorks")}</a>
              <Link href="/login" className="hover:text-primary transition-colors">{t("nav.forPatients")}</Link>
              <Link href="/login" className="hover:text-primary transition-colors">{t("nav.forHealthWorkers")}</Link>
              <Link href="/facilities" className="hover:text-primary transition-colors">{t("nav.network")}</Link>
              <Link href="/why-jancare" className="hover:text-primary transition-colors">{t("nav.whyJancare")}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-[10px] font-bold text-text-secondary border-r border-slate-200 pr-2 sm:pr-4">
              <button
                onClick={() => setLanguage("mr")}
                className={`hover:text-primary transition-colors cursor-pointer ${
                  language === "mr" ? "text-primary border-b border-primary" : ""
                }`}
              >
                <span className="hidden sm:inline">मराठी</span>
                <span className="sm:hidden">MR</span>
              </button>
              <span className="text-slate-350">|</span>
              <button
                onClick={() => setLanguage("hi")}
                className={`hover:text-primary transition-colors cursor-pointer ${
                  language === "hi" ? "text-primary border-b border-primary" : ""
                }`}
              >
                <span className="hidden sm:inline">हिन्दी</span>
                <span className="sm:hidden">HI</span>
              </button>
              <span className="text-slate-350">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`hover:text-primary transition-colors cursor-pointer ${
                  language === "en" ? "text-primary border-b border-primary" : ""
                }`}
              >
                <span className="hidden sm:inline">English</span>
                <span className="sm:hidden">EN</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-xs font-bold text-text-secondary hover:text-primary transition-colors px-4 py-2"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/login"
                className="bg-primary hover:bg-deep-blue text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {t("nav.getStarted")}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary bg-transparent border-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border-brand px-4 py-6 flex flex-col gap-4 shadow-lg animate-in fade-in-50 duration-200">
          <a
            href="#journey"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-text-secondary hover:text-primary"
          >
            {t("nav.howItWorks")}
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-text-secondary hover:text-primary"
          >
            {t("nav.forPatients")}
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-text-secondary hover:text-primary"
          >
            {t("nav.forHealthWorkers")}
          </Link>
          <Link
            href="/facilities"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-text-secondary hover:text-primary"
          >
            {t("nav.network")}
          </Link>
          <Link
            href="/why-jancare"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-text-secondary hover:text-primary"
          >
            {t("nav.whyJancare")}
          </Link>
          <hr className="border-border-brand" />
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-center font-bold text-text-secondary py-2"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-primary text-white text-center font-bold py-2.5 rounded-xl shadow-xs"
          >
            {t("nav.getStarted")}
          </Link>
        </div>
      )}

      {/* HEALTHCARE NEWS TICKER — Horizontal Auto-Scroll */}
      <div className="bg-deep-blue text-white overflow-hidden whitespace-nowrap relative h-9 flex items-center border-b border-primary/20 select-none group">
        <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-32 bg-deep-blue z-10 flex items-center px-3 gap-1.5 border-r border-white/10 shrink-0 shadow-md">
          <TrendingUp size={12} className="text-green-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wide uppercase">Live Updates</span>
        </div>
        <div className="animate-marquee inline-flex gap-10 pl-32 sm:pl-36 items-center">
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🧬</span> <strong>BioTech Breakthrough:</strong> India's First Indigenous CAR-T Therapy (NexCAR19) slashes cancer treatment costs by 90%
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🩺</span> <strong>MedTech AI:</strong> CDSCO certifies portable AI-powered point-of-care ECG & biomarker triage devices for rural PHCs
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🧪</span> <strong>BioTech Sensors:</strong> DBT & BIRAC scale rapid field biosensors for remote drinking water pathogen detection
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🏥</span> <strong>ABDM Milestone:</strong> India links over 50 Crore Health Locker accounts via ABDM Stack — NHA reports 4.5 Cr ABHA records
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🚁</span> <strong>Rural Drone Logistics:</strong> Maharashtra approves drone corridors for last-mile drug delivery to remote Sinnar & Igatpuri PHCs
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>⚙️</span> <strong>MedTech Growth:</strong> National Medical Devices Policy unlocks ₹5,000 Cr in indigenous diagnostic telemetry clusters
          </a>
          <span className="text-white/30">•</span>

          {/* Exact duplicate for seamless infinite marquee loop */}
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🧬</span> <strong>BioTech Breakthrough:</strong> India's First Indigenous CAR-T Therapy (NexCAR19) slashes cancer treatment costs by 90%
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🩺</span> <strong>MedTech AI:</strong> CDSCO certifies portable AI-powered point-of-care ECG & biomarker triage devices for rural PHCs
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🧪</span> <strong>BioTech Sensors:</strong> DBT & BIRAC scale rapid field biosensors for remote drinking water pathogen detection
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🏥</span> <strong>ABDM Milestone:</strong> India links over 50 Crore Health Locker accounts via ABDM Stack — NHA reports 4.5 Cr ABHA records
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>🚁</span> <strong>Rural Drone Logistics:</strong> Maharashtra approves drone corridors for last-mile drug delivery to remote Sinnar & Igatpuri PHCs
          </a>
          <span className="text-white/30">•</span>
          <a href="#health-news" className="text-[11px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 no-underline">
            <span>⚙️</span> <strong>MedTech Growth:</strong> National Medical Devices Policy unlocks ₹5,000 Cr in indigenous diagnostic telemetry clusters
          </a>
          <span className="text-white/30">•</span>
        </div>
        <a href="#health-news" className="absolute right-0 top-0 bottom-0 bg-primary hover:bg-blue-600 text-white z-10 flex items-center px-3.5 sm:px-4 text-[10px] font-bold tracking-wide uppercase cursor-pointer no-underline transition-colors shadow-md">
          Know More →
        </a>
      </div>

      {/* SECTION 1 — HERO & LANDSCAPE VECTOR DRAWING */}
      <section 
        className="relative overflow-hidden pt-12 pb-24 border-b border-border-brand bg-cover bg-center"
        style={{ backgroundImage: "url('/background_maharashtra.jpg')" }}
      >
        {/* Soft light-to-transparent overlay to ensure text contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6F9FC]/95 via-[#F6F9FC]/80 to-transparent z-0" />
        
        {/* Layered Background System */}
        <div className="absolute inset-0 pointer-events-none z-0 select-none">
          {/* Faint Healthcare network nodes representation */}
          <svg className="absolute w-full h-full text-primary/[0.05]" fill="none" viewBox="0 0 1440 600">
            <path d="M-100 300 C 300 100, 500 500, 900 300 C 1200 200, 1300 400, 1600 200" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
            <path d="M-50 400 C 200 200, 600 600, 1000 400 C 1300 300, 1400 500, 1700 300" stroke="currentColor" strokeWidth="1" />
            
            {/* Connected node dots */}
            <circle cx="200" cy="180" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="500" cy="420" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="900" cy="280" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="1200" cy="190" r="3" fill="currentColor" opacity="0.5" />

            {/* Abstract Maharashtra outline (3% opacity) */}
            <path d="M500 100 L700 50 L950 120 L1050 350 L900 520 L650 480 L520 400 Z" stroke="#1464D2" strokeWidth="3" fill="none" opacity="0.04" />
          </svg>

          {/* Floating faint division names */}
          <span className="absolute left-[8%] top-[15%] text-[9px] font-bold tracking-widest text-primary/[0.08] uppercase">Nashik division (नाशिक)</span>
          <span className="absolute right-[12%] top-[25%] text-[9px] font-bold tracking-widest text-primary/[0.08] uppercase">Aurangabad division (औरंगाबाद)</span>
          <span className="absolute left-[20%] bottom-[35%] text-[9px] font-bold tracking-widest text-primary/[0.08] uppercase">Pune division (पुणे)</span>
          <span className="absolute right-[25%] bottom-[30%] text-[9px] font-bold tracking-widest text-primary/[0.08] uppercase">Konkan division (कोंकण)</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Main Hero row */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 flex flex-col items-start text-left space-y-6">
              <img src="/logo.png" alt="जनCare Brand Logo" className="h-16 w-auto" />
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-deep-blue leading-tight">
                जनCare
              </h1>
              <p className="text-sm font-bold text-teal-brand tracking-wide uppercase">
                {language === "mr" ? "आरोग्यसेवा तुमच्यापर्यंत." : t("hero.tagline")}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {language === "mr" ? "पहिल्या लक्षणापासून संपूर्ण उपचारापर्यंत." : t("hero.marathiSupport")}
              </p>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg">
                {t("hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <Link
                  href="/login"
                  className="bg-primary hover:bg-deep-blue text-white text-center font-bold px-8 py-3.5 rounded-xl shadow-md shadow-primary/10 transition-all text-xs cursor-pointer border-0"
                >
                  {t("hero.explore")}
                </Link>
                <a
                  href="#journey"
                  className="bg-white hover:bg-slate-50 border border-border-brand text-text-primary text-center font-bold px-8 py-3.5 rounded-xl transition-all text-xs"
                >
                  {t("hero.howItWorks")}
                </a>
              </div>
            </div>

            {/* Right Content: Premium Care Journey stepper */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="bg-white/95 border border-border-brand p-8 rounded-3xl shadow-xl w-full max-w-2xl relative">
                <span className="text-[10px] text-primary bg-soft-blue border border-primary/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider block w-fit mx-auto mb-6">
                  {language === "mr" ? "आरोग्यसेवा प्रवास रेखा" : "Unified Care Journey"}
                </span>
                
                {/* Horizontal Stepper Diagram */}
                <div className="relative flex justify-between items-start w-full gap-2">
                  {[
                    { label: "Symptoms", mr: "लक्षणे", icon: Activity },
                    { label: "AI Triage", mr: "AI वर्गीकरण", icon: Brain },
                    { label: "Doctor", mr: "डॉक्टर सल्ला", icon: UserCheck },
                    { label: "Video Call", mr: "व्हिडिओ सल्ला", icon: Video },
                    { label: "Medicine", mr: "औषधे", icon: Truck },
                    { label: "Referral", mr: "रुग्ण संदर्भ", icon: Layers },
                    { label: "Follow-up", mr: "पुढील तपासणी", icon: RotateCcw },
                    { label: "Complete", mr: "संपूर्ण उपचार", icon: CheckCircle }
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 text-center relative">
                      <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 text-primary flex items-center justify-center shadow-xs">
                        <step.icon size={14} />
                      </div>
                      <span className="text-[9px] font-bold text-text-primary mt-2 hidden sm:block truncate w-full" title={step.label}>
                        {step.label}
                      </span>
                      <span className="text-[8px] font-semibold text-text-secondary hidden sm:block truncate w-full" title={step.mr}>
                        {step.mr}
                      </span>
                    </div>
                  ))}
                  
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Under Columns: 4 Horizontal Value Banners */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6">
            {[
              { title: "Offline-First", mr: "ऑफलाईन सक्षम", icon: WifiOff, desc: "IndexedDB local sync" },
              { title: "AI Assistant", mr: "AI सहाय्यक", icon: Brain, desc: "Gemini clinical navigation" },
              { title: "Real Video Consult", mr: "खरी व्हिडिओ सल्लामसलत", icon: Video, desc: "Daily.co integration" },
              { title: "Secure & Private", mr: "सुरक्षित आणि खाजगी", icon: Shield, desc: "ABDM gateway authorized" }
            ].map((banner, idx) => (
              <div key={idx} className="bg-white/80 border border-border-brand p-4 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-soft-blue text-primary">
                  <banner.icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{banner.title}</h4>
                  <span className="text-[8px] font-bold text-teal-brand uppercase block">{banner.mr}</span>
                  <p className="text-[9px] text-text-secondary mt-0.5">{banner.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STATUS BAR */}
      <section className="bg-white border-y border-border-brand py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {[
            { metric: "36", label: "Districts", icon: MapPin },
            { metric: "6", label: "Divisions", icon: Layers },
            { metric: "5000+", label: "Healthcare Facilities", icon: HospitalSymbol },
            { metric: "150K+", label: "Health Workers", icon: Users },
            { metric: "10M+", label: "Lives Impacted", icon: Heart }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-1">
              <div className="text-lg font-extrabold text-deep-blue flex items-center gap-1.5 justify-center">
                {stat.icon && <stat.icon size={16} className="text-primary shrink-0" />} {stat.metric}
              </div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2 — PROBLEM */}
      <section className="py-16 bg-white border-b border-border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-[10px] text-danger-brand font-bold uppercase tracking-wider">{t("problems.subtitle")}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">
              {t("problems.title")}
            </h2>
          </div>
          {/* Fragmented Journey Flow */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 max-w-5xl mx-auto pt-6 text-center">
            {[
              { label: t("journey.symptoms"), desc: language === "mr" ? "लक्षणे" : "First onset" },
              { label: language === "mr" ? "प्रवास" : "Travel", desc: language === "mr" ? "तासनतास प्रवास" : "Hours to clinic" },
              { label: language === "mr" ? "प्रतीक्षा" : "Waiting", desc: language === "mr" ? "डॉक्टर उपलब्ध नसणे" : "Absence of doctor" },
              { label: t("journey.doctor"), desc: language === "mr" ? "इतिहास नसणे" : "No past history" },
              { label: t("journey.medicine"), desc: language === "mr" ? "साठा संपणे" : "Out of stock" },
              { label: t("journey.referral"), desc: language === "mr" ? "कागदपत्रे हरवणे" : "Paperwork lost" },
              { label: language === "mr" ? "तपासणी न होणे" : "Missed Follow-up", desc: language === "mr" ? "उत्तरदायित्वाचा अभाव" : "No accountability" }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl relative">
                <span className="bg-red-50 text-danger-brand text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center mb-2">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-text-primary block">{step.label}</span>
                <span className="text-[9px] text-text-secondary mt-1">{step.desc}</span>
                {idx < 6 && (
                  <span className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300 font-bold">
                    ➔
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — JANCARE SOLUTION */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "अखंड काळजी" : "The Coordination Web"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{language === "mr" ? "एक जोडलेला आरोग्य प्रवास" : "One connected care journey."}</h2>
            <p className="text-xs text-text-secondary mt-2">
              {language === "mr" ? "जनCare रुग्णांना, आशा कार्यकर्त्यांना आणि डॉक्टरांना एका प्रवासात जोडून आरोग्य सेवा अधिक सुलभ करते." : "JanCare coordinates records and schedules around the patient, creating a seamless loop between rural communities and clinical facilities."}
            </p>
          </div>
          {/* Loop Mapping */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 max-w-5xl mx-auto text-center">
            {[
              { label: language === "mr" ? "रुग्ण" : "Patient", sub: language === "mr" ? "घरी" : "At home" },
              { label: "ASHA", sub: language === "mr" ? "स्थानिक नोंदी" : "Frontline logs" },
              { label: t("journey.doctor"), sub: language === "mr" ? "तज्ज्ञ उपचार" : "Clinical care" },
              { label: language === "mr" ? "आरोग्य केंद्र" : "Facility", sub: "Sinnar Rural CHC" },
              { label: t("journey.medicine"), sub: language === "mr" ? "राखीव औषध साठा" : "Reserved stocks" },
              { label: t("journey.referral"), sub: language === "mr" ? "सिव्हिल रुग्णालय" : "Civil hospital" },
              { label: t("journey.followUp"), sub: language === "mr" ? "अखंड काळजी चक्र" : "Loop completed" }
            ].map((step, idx) => (
              <div key={idx} className="p-4 bg-white border border-border-brand rounded-2xl shadow-xs">
                <span className="bg-soft-blue text-primary text-[10px] font-extrabold h-6 w-6 rounded-full flex items-center justify-center mx-auto mb-2">
                  ✓
                </span>
                <span className="text-xs font-bold text-text-primary block">{step.label}</span>
                <span className="text-[9px] text-text-secondary mt-0.5">{step.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — SIGNATURE CARE JOURNEY */}
      <section id="journey" className="py-16 bg-white border-y border-border-brand scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "प्रवास रेखा" : "Interactive Walkthrough"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{t("journey.title")}</h2>
            <p className="text-xs text-text-secondary mt-2">{t("journey.subtitle")}</p>
          </div>

          {/* Interactive Horizontal Line */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
              {careJourneySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`care-journey-node p-4 border rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      activeStep === idx
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                        : "bg-slate-50 border-slate-200 text-text-primary hover:bg-white"
                    }`}
                  >
                    <Icon size={20} className={activeStep === idx ? "text-white" : "text-primary"} />
                    <span className="text-[10px] font-bold mt-2 block truncate w-full">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            <div className="mt-8 bg-slate-50 border border-slate-200 p-6 rounded-2xl animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2 text-primary">
                {React.createElement(careJourneySteps[activeStep].icon, { size: 16 })}
                <span className="text-xs font-bold uppercase tracking-wider">{language === "mr" ? "टप्पा" : "Stage"} {activeStep + 1}: {careJourneySteps[activeStep].title}</span>
              </div>
              <h4 className="text-sm font-bold text-deep-blue">{careJourneySteps[activeStep].desc}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">{careJourneySteps[activeStep].detail}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HUMAN STORY */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-border-brand rounded-2xl shadow-xs p-8 max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 text-center">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-2">{language === "mr" ? "रुग्ण यशोगाथा" : "Patient Case Study"}</span>
              <h3 className="text-xl font-bold text-deep-blue">{language === "mr" ? "रमेश कुमार यांचा आरोग्य प्रवास" : "Ramesh Kumar's Care Path"}</h3>
              <p className="text-xs text-text-secondary mt-2">
                {language === "mr" ? "ग्रामीण भागातील रुग्णांच्या डिजिटल काळजी समन्वयाचे एक काल्पनिक उदाहरण." : "A fictional rural patient scenario representing standard clinical coordination flows."}
              </p>
              <div className="mt-6 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                <span className="text-[10px] text-text-secondary font-bold uppercase">{language === "mr" ? "रुग्ण प्रोफाईल" : "Patient Profile"}</span>
                <span className="text-xs font-bold text-text-primary block mt-1">{language === "mr" ? "नाव: रमेश कुमार" : "Name: Ramesh Kumar"}</span>
                <span className="text-xs font-semibold text-text-primary block">{language === "mr" ? "वय: ५४ | ठिकाण: सिन्नर" : "Age: 54 | Location: Sinnar"}</span>
                <span className="text-xs text-orange-500 font-bold block mt-1">{language === "mr" ? "स्थिती: तातडीचे वर्गीकरण (ताप)" : "Status: Priority Triage (Fever)"}</span>
              </div>
            </div>
            <div className="md:col-span-7 space-y-4">
              <h4 className="text-sm font-bold text-text-primary">{language === "mr" ? "आरोग्यसेवा गावातून बाहेर न पडताही तितकीच प्रभावी असावी." : "Healthcare shouldn't end when the consultation ends."}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {language === "mr" ? "सिन्नर जवळील गावात राहणाऱ्या रमेश यांना तीव्र ताप (१०२.२°F) आणि चक्कर येत होती. आशा कार्यकर्त्यांनी ऑफलाईन नोंदी केल्या." : "Ramesh felt high fever (102.2°F) and dizziness in his village near Sinnar. The local ASHA worker logged his vitals offline."}
              </p>
              <div className="space-y-2 text-xs border-l-2 border-primary pl-4">
                <p className="text-text-secondary"><strong className="text-text-primary">{t("journey.triage")}:</strong> {language === "mr" ? "रुग्णाचे वर्गीकरण करून सिन्नर प्राथमिक आरोग्य केंद्रात नाव नोंदवण्यात आले." : "Classified case as Priority and queued him to Sinnar CHC."}</p>
                <p className="text-text-secondary"><strong className="text-text-primary">{language === "mr" ? "डॉक्टर सल्लामसलत" : "Doctor Consult"}:</strong> {language === "mr" ? "डॉ. अनिरुद्ध यांच्याशी थेट व्हिडिओ कॉलद्वारे संवाद." : "Live video session with Dr. Aniruddha. Vitals panel visible next to feed."}</p>
                <p className="text-text-secondary"><strong className="text-text-primary">Closed-Loop Pharmacy:</strong> {language === "mr" ? "डॉक्टरांनी दिलेली औषधे (MC1) स्थानिक फार्मसीमधून राखीव केली गेली." : "Prescribed MC1 reserved directly from local stocks."}</p>
                <p className="text-text-secondary"><strong className="text-text-primary">{t("journey.followUp")}:</strong> {language === "mr" ? "आशा कार्यकर्त्यांना घरगुती देखरेखीसाठी स्वयंचलित सूचना मिळाली." : "The local ASHA worker received an alert to run a home vitals check 2 days later."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHO JANCARE CONNECTS */}
      <section className="py-16 bg-white border-y border-border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "घटक" : "Stakeholders"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{language === "mr" ? "जनCare कोणाला जोडते?" : "Who JanCare Connects"}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
              <span className="text-xs font-bold text-primary block">{language === "mr" ? "रुग्णांसाठी" : "For Patients"}</span>
              <h4 className="text-sm font-extrabold text-deep-blue mt-2">{language === "mr" ? "अखंड आरोग्य सेवा" : "Continuous Care Path"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "जवळचे आरोग्य केंद्र शोधा, तज्ज्ञ डॉक्टरांशी संपर्क साधा आणि औषधांची माहिती मिळवा." : "Locate open clinics, consult specialists via video links at local subcenters, and track all prescriptions securely."}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
              <span className="text-xs font-bold text-teal-brand block">{language === "mr" ? "आशा कार्यकर्त्यांसाठी" : "For ASHA / ANM"}</span>
              <h4 className="text-sm font-extrabold text-deep-blue mt-2">{language === "mr" ? "स्मार्ट कार्यसूची" : "Intelligent Worklists"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "रुग्णाच्या लक्षणांची ऑफलाईन नोंदणी करा आणि पुढील तपासणीच्या स्वयंचलित सूचना मिळवा." : "Log patient vitals offline, trigger automatic risk categorizations, and receive scheduled follow-up home alerts."}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
              <span className="text-xs font-bold text-green-brand block">{language === "mr" ? "डॉक्टरांसाठी" : "For Doctors"}</span>
              <h4 className="text-sm font-extrabold text-deep-blue mt-2">{language === "mr" ? "डिजिटल क्लिनिक क्यू" : "Clinical Command Center"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "रुग्णाचा पूर्वेतिहास तपासा, थेट व्हिडिओ कॉलद्वारे सल्ला द्या आणि सिव्हिल रुग्णालयात रेफर करा." : "Review structured vitals timelines, consult via browser video calls, and coordinates referrals to district hospitals."}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
              <span className="text-xs font-bold text-amber-500 block">{language === "mr" ? "आरोग्य केंद्रांसाठी" : "For Facilities"}</span>
              <h4 className="text-sm font-extrabold text-deep-blue mt-2">{language === "mr" ? "औषध साठा व्यवस्थापन" : "Inventory Coordination"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "जेनेरिक औषध साठ्याची माहिती मिळवा आणि बाह्य संदर्भ रुग्णांच्या प्रक्रियेचे नियोजन करा." : "Monitor generic medicine stocks, track incoming/outgoing referrals, and optimize clinician workloads dynamically."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — THREE CORE TECHNOLOGIES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "तंत्रज्ञान" : "Technical Capabilities"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{language === "mr" ? "आरोग्य सेवेतील तीन महत्त्वाचे खांब" : "Three Core Technologies"}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs text-center">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Brain size={20} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">{language === "mr" ? "AI सहाय्यित वर्गीकरण" : "AI-Assisted Care Navigation"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "रुग्णाच्या लक्षणांचे विश्लेषण करून योग्य उपचारांचे मार्गदर्शन Google Gemini द्वारे केले जाते." : "Google Gemini API processes symptoms to auto-schedule appointments, checks drug inventories, and transcribes clinical commands."}
              </p>
            </div>
            <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs text-center">
              <div className="bg-teal-brand/10 text-teal-brand p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <WifiOff size={20} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">{language === "mr" ? "ऑफलाईन-फर्स्ट रचना" : "Offline-First Healthcare"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "नेटवर्क नसलेल्या गावांमध्येही स्थानिक डेटाबेसद्वारे नोंदी सुरक्षित ठेवल्या जातात." : "Uses HTML5 IndexedDB storage to register patients and log symptoms in network-blind villages, syncing seamlessly on connection."}
              </p>
            </div>
            <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs text-center">
              <div className="bg-green-brand/10 text-green-brand p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Video size={20} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">{language === "mr" ? "थेट व्हिडिओ सल्लामसलत" : "Real Video Consultation"}</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {language === "mr" ? "Daily.co च्या सुरक्षित WebRTC एकत्रीकरणाद्वारे थेट तज्ज्ञ डॉक्टरांशी व्हिडिओ संवाद." : "Secure Daily.co WebRTC integrations bring medical specialists directly to subcenters, with patient context telemetry panels."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7.5 — INDIAN MEDICAL GROWTH & HEALTHCARE NEWS */}
      <section id="health-news" className="scroll-mt-16 py-16 bg-[#F8FAFC] border-y border-border-brand text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={12} className="text-primary animate-pulse" /> What's New in Healthcare
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-1">
                Indian Medical Growth & Innovation Feed
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Real-time tracking of new medicine developments, ABDM updates, and rural healthcare advancements.
              </p>
            </div>
            
            <div className="bg-primary/5 text-primary text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-primary/10 w-fit">
              Live updates curated from MOHFW & ICMR
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                date: "28 Aug 2026",
                tag: "BioTech Breakthrough",
                title: "India's First Indigenous CAR-T Cell Therapy Slashes Cancer Treatment Costs by 90%",
                desc: "NexCAR19, developed indigenously by IIT Bombay and Tata Memorial Centre with BIRAC support, achieves nationwide clinical adoption at a fraction of global costs.",
                source: "ICMR & BIRAC India",
                link: "https://main.icmr.nic.in"
              },
              {
                date: "27 Aug 2026",
                tag: "MedTech / AI Diagnostics",
                title: "CDSCO Approves Indigenous AI-Powered Point-of-Care Triage Devices for Rural PHCs",
                desc: "Portable battery-operated diagnostic hardware certified for instant 10-minute ECG analysis and multi-biomarker screening in primary health centers without specialist delay.",
                source: "CDSCO Medical Devices",
                link: "https://cdsco.gov.in"
              },
              {
                date: "26 Aug 2026",
                tag: "BioTech Sensors",
                title: "DBT & BIRAC Deploy Rapid Paper-Strip Biosensors for Rural Pathogen Detection",
                desc: "Field-deployable paper-strip genomic biosensors deployed across Maharashtra rural clinics to detect waterborne bacteria and prevent seasonal infection outbreaks.",
                source: "BIRAC / DBT India",
                link: "https://birac.nic.in"
              },
              {
                date: "25 Aug 2026",
                tag: "MedTech Hardware",
                title: "National Medical Devices Policy Unlocks ₹5,000 Cr in Indigenous Telemetry R&D",
                desc: "Specialized MedTech manufacturing clusters established to produce low-cost digital stethoscopes, telemetry kits, and solar-powered vaccine cold-chain carriers.",
                source: "Dept of Pharmaceuticals",
                link: "https://pharmaceuticals.gov.in"
              },
              {
                date: "24 Aug 2026",
                tag: "ABDM Stack Milestone",
                title: "India Links Over 50 Crore Health Locker Accounts via Unified ABDM Framework",
                desc: "The National Health Authority reports massive digital compliance growth. Encrypted consent-backed health data exchange now standard across public hospitals.",
                source: "National Health Authority",
                link: "https://abdm.gov.in"
              },
              {
                date: "23 Aug 2026",
                tag: "Rural Drone Logistics",
                title: "Maharashtra Approves Drone Dispatch Corridors for Remote PHC Drug Stores",
                desc: "State Innovation Society establishes autonomous drone delivery networks connecting central Nashik medicine warehouses to tribal subcenters in Sinnar and Igatpuri.",
                source: "Arogya Maharashtra",
                link: "https://arogya.maharashtra.gov.in"
              }
            ].map((news, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400 font-mono">{news.date}</span>
                    <span className="text-primary bg-primary/5 px-2 py-0.5 rounded">{news.tag}</span>
                  </div>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-800 leading-snug block hover:text-primary transition-colors no-underline"
                  >
                    {news.title}
                  </a>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{news.desc}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-medium">Source: {news.source}</span>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-deep-blue hover:underline font-bold inline-flex items-center gap-1 cursor-pointer transition-colors no-underline"
                  >
                    Read Official Release →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — MAHARASHTRA NETWORK */}
      <section className="py-16 bg-white border-y border-border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Designed for Maharashtra</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">
              {language === "mr" ? "महाराष्ट्रासाठी तयार. प्रत्येक गावासाठी डिझाइन केलेले." : "Built for Maharashtra. Designed for every village."}
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              {language === "mr" ? "सिन्नर, पुणे, छत्रपती संभाजीनगर आणि नागपूर भागातील सक्रिय आरोग्य केंद्रांची माहिती मिळवा." : "Locate active health subcenters, primary clinics, and community hospitals in Sinnar, Chhatrapati Sambhajinagar, and Pune divisions."}
            </p>
          </div>
          {/* Minimal Abstract Maharashtra Map Design */}
          <div className="bg-slate-50 border border-slate-200 max-w-lg mx-auto p-8 rounded-2xl relative overflow-hidden mb-6 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase absolute top-4 left-4">Designed for Maharashtra</span>
            <MapPin className="text-primary animate-bounce mb-3" size={24} />
            <div className="text-xs font-bold text-text-primary z-10">Nashik division Control Hub</div>
            <p className="text-[11px] text-text-secondary mt-1 max-w-xs z-10">
              {language === "mr" ? "ग्रामीण प्राथमिक आरोग्य उपकेंद्रांचे थेट डिजिटल जाळे." : "Active health centers coordinating last-mile care."}
            </p>
            
            {/* Soft decorative nodes in the map visual container */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg className="w-64 h-64 text-primary" viewBox="0 0 100 100" fill="none">
                <polygon points="20,40 40,20 80,30 90,70 60,90 30,80" stroke="currentColor" strokeWidth="1" />
                <circle cx="20" cy="40" r="2" fill="currentColor" />
                <circle cx="40" cy="20" r="2" fill="currentColor" />
                <circle cx="80" cy="30" r="2" fill="currentColor" />
                <circle cx="90" cy="70" r="2" fill="currentColor" />
                <circle cx="60" cy="90" r="2" fill="currentColor" />
                <circle cx="30" cy="80" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>
          <Link
            href="/facilities"
            className="inline-flex items-center gap-2 bg-primary hover:bg-deep-blue text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-decoration-none"
          >
            {language === "mr" ? "आरोग्य केंद्र नेटवर्क पहा" : "Explore Healthcare Network"} <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* SECTION 9 — ECOSYSTEM */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "सहअस्तित्व" : "Ecosystem Coexistence"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{language === "mr" ? "महाराष्ट्र आरोग्य व्यवस्थेशी सुसंगत" : "Built to connect the healthcare ecosystem."}</h2>
            <p className="text-xs text-text-secondary mt-3 leading-relaxed">
              {language === "mr" ? "आम्ही सध्याच्या सरकारी सेवा जसे की ई-संजीवनी किंवा एम-सखी यांना पर्याय देत नाही, तर त्यांचा विस्तार शेवटच्या रुग्णापर्यंत सुलभ करतो." : "JanCare coordinates and connects the fragmented last mile. We do not replace existing Maharashtra services like eSanjeevani or M-SAKHI — we extend their effectiveness directly to patients' homes."}
            </p>
          </div>
          <Link
            href="/why-jancare"
            className="inline-flex items-center gap-2 border border-border-brand hover:bg-slate-50 text-text-primary text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-decoration-none"
          >
            {language === "mr" ? "तुलनात्मक माहिती पहा" : "View Competitive Matrix"}
          </Link>
        </div>
      </section>

      {/* SECTION 10 — TRUST & SECURITY */}
      <section className="py-16 bg-white border-t border-border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{language === "mr" ? "सुरक्षा आणि कायदे" : "Clinical Governance"}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-blue mt-2">{language === "mr" ? "गोपनीयता आणि सुरक्षितता" : "Trust & Regulatory Security"}</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Secure Records", desc: "All patient health records are secured utilizing symmetric encryption before storage in MongoDB." },
              { title: "Consent Framework", desc: "ABHA patient data sharing requires explicit OTP validation under the ABDM gateway rules." },
              { title: "Role-Based Access", desc: "Strict compartmentalization: ASHA, Doctors, and Admins can only view records authorized to their roles." },
              { title: "Audit Trails", desc: "Every login, data sync, vital check, and clinical edit is logged to an immutable security audit database." },
              { title: "Privacy Safeguards", desc: "Maintains secure clinical boundaries; generic pharmacy logs never expose patient names or mobile phone details." },
              { title: "Offline Security", desc: "Local HTML5 IndexedDB storage registers are locked within isolated browser sandboxes to prevent leakage." }
            ].map((card, idx) => (
              <div key={idx} className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <span className="text-xs font-bold text-text-primary block">{language === "mr" ? card.title : card.title}</span>
                <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
                  {language === "mr" ? card.desc : card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11 — FINAL CTA */}
      <section className="bg-deep-blue text-white py-20 relative overflow-hidden text-center border-t border-border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {language === "mr" ? "पहिल्या लक्षणापासून संपूर्ण उपचारापर्यंत." : "From First Symptom to Complete Care."}
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            {language === "mr" ? "आजच जनCare प्लॅटफॉर्मचा वापर करून ग्रामीण आरोग्य सेवेचे सक्षमीकरण करा." : "Configure your local connection variables and sign in with demo credentials to test the continuous last-mile clinical loop."}
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="bg-primary hover:bg-white hover:text-primary text-white font-bold px-8 py-3.5 rounded-xl transition-all text-xs cursor-pointer inline-block text-decoration-none border-0"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent -z-10" />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border-brand py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="जनCare Logo" className="h-8 w-auto" />
          </div>
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} जनCare Health Initiative. Built for Smart India Hackathon. Government of Maharashtra sandbox.
          </p>
          <div className="flex gap-4 font-bold">
            <a href="#" className="hover:text-primary text-decoration-none">Privacy Policy</a>
            <a href="#" className="hover:text-primary text-decoration-none">ABDM Sandbox Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Dummy icon placeholder for Hospital Symbol which is represented by MapPin or customized
function HospitalSymbol(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M12 22V14" />
      <path d="M18 22V10a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12" />
      <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
}
