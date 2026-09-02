"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18nContext";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, hasFirebase } from "@/lib/firebase";
import type { ConfirmationResult } from "@/lib/firebase";
import {
  Activity,
  Shield,
  Smartphone,
  Lock,
  User,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Server
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seedingText, setSeedingText] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [typedOtp, setTypedOtp] = useState("");
  const [useVerifyApi, setUseVerifyApi] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const demoAccounts = [
    { label: "Patient", username: "patient", path: "/patient/dashboard" },
    { label: "Doctor", username: "doctor", path: "/doctor/dashboard" },
    { label: "ASHA", username: "asha", path: "/asha/dashboard" },
    { label: "Admin", username: "districtadmin", path: "/admin/dashboard" },
    { label: "Medicine Manager", username: "medmanager", path: "/medicine-manager/dashboard" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError(language === "mr" ? "कृपया युझरनेम आणि पासवर्ड दोन्ही टाका" : "Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Route based on role
      const role = data.user.role;
      if (role === "ASHA" || role === "ANM") {
        router.push("/asha/dashboard");
      } else if (role === "Doctor" || role === "Specialist") {
        router.push("/doctor/dashboard");
      } else if (role === "Patient") {
        router.push("/patient/dashboard");
      } else if (role === "MedicineManager") {
        router.push("/medicine-manager/dashboard");
      } else if (role === "FacilityAdmin") {
        router.push("/facility/dashboard");
      } else if (role === "DistrictAdmin" || role === "SystemAdmin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function triggerLoginOtp() {
    if (!username) {
      setError(language === "mr" ? "कृपया आधी मोबाईल नंबर किंवा युझरनेम टाका" : "Please enter your Username / Mobile Number first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (hasFirebase && auth) {
        if (!(window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
              size: "invisible",
              callback: (response: any) => {
                // reCAPTCHA solved
              }
            });
          } catch (recaptchaErr: any) {
            console.error("Firebase RecaptchaVerifier creation failed:", recaptchaErr);
          }
        }

        let formattedPhone = username.trim();
        if (!formattedPhone.startsWith("+")) {
          if (formattedPhone.length === 10) {
            formattedPhone = `+91${formattedPhone}`;
          } else {
            formattedPhone = `+${formattedPhone}`;
          }
        }

        console.log("Starting Firebase Phone Auth for:", formattedPhone);
        const result = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
        setConfirmationResult(result);
        setUseVerifyApi(true);
        setShowOtpModal(true);
        alert(`[Firebase Auth]\nA verification SMS code has been sent via Google to your mobile number ${formattedPhone}!`);
      } else {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: username, type: "login" }),
        });
        const data = await res.json();
        if (data.success) {
          setUseVerifyApi(data.useVerifyApi || false);
          setGeneratedOtp(data.otpCode || "");
          setShowOtpModal(true);
          if (data.sentRealSMS) {
            alert(`[JanCare SMS Gateway]\nA real verification code has been dispatched to your mobile number +91 ${username}!`);
          } else {
            alert(`[JanCare DND / Sandbox Fallback]\nReal SMS could not be sent (Mobile is on DND mode or credentials missing).\n\nFor testing, your sandbox verification OTP is: ${data.otpCode}`);
          }
        } else {
          throw new Error(data.error);
        }
      }
    } catch (e: any) {
      console.error("Failed to dispatch OTP:", e);
      setError("Failed to dispatch OTP: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (confirmationResult) {
        console.log("Verifying code with Firebase...");
        const fbResult = await confirmationResult.confirm(typedOtp);
        const idToken = await fbResult.user.getIdToken();
        
        console.log("Verifying ID Token with backend...");
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: username, firebaseToken: idToken, action: "verify" }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Token verification failed on the server.");
        }
      } else if (useVerifyApi) {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: username, code: typedOtp, action: "verify" }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Invalid OTP entered. Please try again.");
        }
      } else {
        if (typedOtp !== generatedOtp) {
          throw new Error(language === "mr" ? "चुकीचा OTP टाकला आहे. कृपया पुन्हा प्रयत्न करा." : "Invalid OTP entered. Please try again.");
        }
      }
      setShowOtpModal(false);
      setConfirmationResult(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, isOtpLogin: true }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Route based on role
      const role = data.user.role;
      if (role === "ASHA" || role === "ANM") {
        router.push("/asha/dashboard");
      } else if (role === "Doctor" || role === "Specialist") {
        router.push("/doctor/dashboard");
      } else if (role === "Patient") {
        router.push("/patient/dashboard");
      } else if (role === "MedicineManager") {
        router.push("/medicine-manager/dashboard");
      } else if (role === "FacilityAdmin") {
        router.push("/facility/dashboard");
      } else if (role === "DistrictAdmin" || role === "SystemAdmin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in via OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(account: typeof demoAccounts[0]) {
    setLoading(true);
    setError("");
    setSeedingText(language === "mr" ? "डेटाबेस कनेक्ट करत आहे..." : "Connecting Database & Seeding Scenario...");

    try {
      let loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: account.username, password: "password123" }),
      });

      let loginData = await loginRes.json();

      if (!loginData.success) {
        // Run seed script if connection is fresh/empty
        const seedRes = await fetch("/api/admin/seed", { method: "POST" });
        const seedData = await seedRes.json();

        if (!seedData.success) {
          throw new Error("Atlas connection error: " + seedData.error);
        }

        loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: account.username, password: "password123" }),
        });
        loginData = await loginRes.json();
        if (!loginData.success) {
          throw new Error("Demo login verification failed.");
        }
      }

      router.push(account.path);
    } catch (err: any) {
      setError(err.message || "Failed to log in as demo account");
    } finally {
      setLoading(false);
      setSeedingText("");
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Dynamic Landscape Backdrop System */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/background_maharashtra.jpg')" }}>
        {/* Soft light-to-transparent overlay matching the landing page */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6F9FC]/95 via-[#F6F9FC]/80 to-transparent" />
      </div>

      {/* Top-Right Language Switcher */}
      <div className="absolute top-6 right-6 sm:right-12 z-50 flex items-center gap-2 text-[10px] font-bold text-text-secondary bg-white/70 backdrop-blur-xs px-3.5 py-2 rounded-full border border-border-brand shadow-xs">
        <Globe size={12} className="text-slate-400" />
        <button
          onClick={() => setLanguage("mr")}
          className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
            language === "mr" ? "text-primary font-extrabold" : ""
          }`}
        >
          मराठी
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setLanguage("hi")}
          className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
            language === "hi" ? "text-primary font-extrabold" : ""
          }`}
        >
          हिन्दी
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setLanguage("en")}
          className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${
            language === "en" ? "text-primary font-extrabold" : ""
          }`}
        >
          English
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center relative z-10 py-12">
        <div className="bg-white border border-border-brand shadow-2xl rounded-3xl w-full max-w-3xl p-8 sm:p-10 space-y-6 relative">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="जनCare Logo" className="h-14 w-auto mx-auto" />
            </Link>
            <h2 className="text-2xl font-extrabold text-deep-blue tracking-tight">
              {language === "mr" ? "स्वागत आहे! 👋" : language === "hi" ? "आपका स्वागत है! 👋" : "Welcome Back! 👋"}
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              {language === "mr" ? "जनCare मध्ये पुढे जाण्यासाठी लॉग इन करा" : "Sign in to continue to JanCare"}
            </p>
          </div>

          {/* Seeding & Error Alerts */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
              <div className="text-[11px] text-red-700 font-semibold leading-normal">{error}</div>
            </div>
          )}

          {seedingText && (
            <div className="p-4 bg-soft-blue border-l-4 border-primary rounded-xl flex items-center gap-3 animate-pulse">
              <Loader2 className="text-primary animate-spin" size={14} />
              <div className="text-[11px] text-primary font-bold">{seedingText}</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-text-primary">
                {language === "mr" ? "मोबाईल नंबर / युझरनेम" : "Username (Mobile / Email)"}
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:bg-white focus:border-primary focus:outline-hidden pl-9 transition-all text-text-primary"
                  placeholder="e.g. asha or doctor"
                />
                <User className="absolute left-3 top-3 text-slate-400" size={14} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-bold text-text-primary">
                  {language === "mr" ? "पासवर्ड" : "Password"}
                </label>
                <Link href="#" onClick={() => alert("Credentials reset can be completed at Sinnar CHC Hub.")} className="text-[10px] font-bold text-primary hover:underline">
                  {language === "mr" ? "पासवर्ड विसरलात?" : "Forgot Password?"}
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:bg-white focus:border-primary focus:outline-hidden pl-9 pr-9 transition-all text-text-primary"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3 text-slate-400" size={14} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-deep-blue text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {loading && !seedingText ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Lock size={12} /> {language === "mr" ? "साइन इन करा" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Or Continue With */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-200" />
            <span className="relative bg-white px-3.5 text-[10px] font-bold text-text-secondary uppercase">
              {language === "mr" ? "किंवा" : "or continue with"}
            </span>
          </div>

          {/* Outline Login alternatives */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={triggerLoginOtp}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
            >
              <Smartphone size={14} className="text-slate-500" /> OTP Login
            </button>
            <button
              onClick={() => alert("Simulated ABHA gateway authorization redirected.")}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
            >
              <User size={14} className="text-slate-500" /> ABHA ID
            </button>
          </div>
          <div id="recaptcha-container" className="invisible"></div>

          {/* Create Account footer Link */}
          <p className="text-xs text-center text-text-secondary mt-4 font-semibold">
            {language === "mr" ? "खाते नाही? " : "Don't have an account? "}
            <Link href="/register" className="font-extrabold text-primary hover:underline">
              {language === "mr" ? "आताच नोंदणी करा" : "Register Now"}
            </Link>
          </p>

          {/* Quick Demo Access Badges */}
          <div className="border-t border-slate-150 pt-5 mt-3">
            <div className="text-center mb-3">
              <span className="text-[10px] text-primary font-extrabold uppercase tracking-wider block">
                Quick Demo Access
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                For evaluation and demonstration purposes only
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(acc)}
                  className="bg-[#F8FAFC] hover:bg-blue-55 border border-slate-200 text-slate-700 hover:text-[#1464D2] text-[10px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer shadow-xs hover:border-[#1464D2]"
                  title={`Login as ${acc.label}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM VALUE BANNER BAR */}
      <section className="bg-white border-y border-border-brand py-4 z-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Shield className="text-primary" size={16} />
            <span>{language === "mr" ? "सुरक्षित आणि खाजगी" : "Secure & Private"}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Activity className="text-teal-brand" size={16} />
            <span>{language === "mr" ? "AI सहाय्य" : "AI-Assisted Care"}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Server className="text-green-brand" size={16} />
            <span>{language === "mr" ? "ऑफलाईन सक्षम" : "Offline-First"}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <CheckCircle className="text-primary" size={16} />
            <span>{language === "mr" ? "विश्वासनीय नेटवर्क" : "Trusted Network"}</span>
          </div>
        </div>
      </section>

      {/* Page Footer */}
      <footer className="bg-white border-t border-border-brand py-4 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-text-secondary">
          <p>
            {language === "mr" ? "तुमचा आरोग्य डेटा आमच्याकडे सुरक्षित आहे. आम्ही कडक सुरक्षा मानकांचे पालन करतो." : "Your health data is safe with us. We follow strict security and privacy standards."}
          </p>
          <div className="flex items-center gap-1.5 font-bold">
            <span>जनCare</span>
            <span className="text-slate-300">|</span>
            <span className="text-teal-brand">आरोग्यसेवा तुमच्यापर्यंत.</span>
          </div>
        </div>
      </footer>

      {/* Sandbox / Firebase OTP verification modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-border-brand rounded-3xl p-6 sm:p-8 max-w-sm w-full text-left space-y-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-extrabold text-deep-blue">Verify Mobile OTP</h3>
              <p className="text-[10px] text-text-secondary mt-1">
                {confirmationResult 
                  ? `Enter the 6-digit code sent via Google to your mobile number.`
                  : `Enter the 4-digit code sent via SMS sandbox to +91 ${username}.`
                }
              </p>
            </div>
            
            {!confirmationResult && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl text-[10px] text-amber-800 font-bold leading-relaxed">
                [JanCare SMS Gateway Simulator]<br/>
                Simulated verification code: <strong className="text-amber-900 text-xs font-extrabold">{generatedOtp}</strong>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary">OTP Verification Code</label>
                <input
                  type="text"
                  maxLength={confirmationResult ? 6 : 4}
                  required
                  value={typedOtp}
                  onChange={(e) => setTypedOtp(e.target.value)}
                  className="mt-1 w-full text-center tracking-widest bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:border-primary focus:outline-hidden text-text-primary"
                  placeholder={confirmationResult ? "000000" : "0000"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setConfirmationResult(null);
                  }}
                  className="py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-deep-blue text-white py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer shadow-md shadow-primary/10"
                >
                  Verify & Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
