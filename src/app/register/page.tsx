"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18nContext";
import { divisions, getDistrictsForDivision, getTalukasForDistrict, getVillagesForTaluka } from "@/lib/maharashtra";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, hasFirebase } from "@/lib/firebase";
import type { ConfirmationResult } from "@/lib/firebase";
import {
  Loader2,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  FileText,
  Clock,
  Heart,
  ChevronRight,
  User,
  Activity,
  Award,
  Smartphone,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const [role, setRole] = useState("Patient");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [typedOtp, setTypedOtp] = useState("");
  const [useVerifyApi, setUseVerifyApi] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Patient demographic details
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [preferredLang, setPreferredLang] = useState("Marathi");
  
  // Location
  const [division, setDivision] = useState("Nashik");
  const [district, setDistrict] = useState("Nashik");
  const [taluka, setTaluka] = useState("Sinnar");
  const [village, setVillage] = useState("Demo Village");

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState("Sunita Kumar");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [emergencyMobile, setEmergencyMobile] = useState("9822114401");

  // Dynamic geographic options
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<string[]>([]);
  const [villageOptions, setVillageOptions] = useState<string[]>([]);

  // Update dropdown options based on location changes
  useEffect(() => {
    const districts = getDistrictsForDivision(division);
    setDistrictOptions(districts);
    if (districts.length > 0 && !districts.includes(district)) {
      setDistrict(districts[0]);
    }
  }, [division]);

  useEffect(() => {
    const talukas = getTalukasForDistrict(district);
    setTalukaOptions(talukas);
    if (talukas.length > 0 && !talukas.includes(taluka)) {
      setTaluka(talukas[0]);
    }
  }, [district]);

  useEffect(() => {
    const villages = getVillagesForTaluka(taluka);
    setVillageOptions(villages);
    if (villages.length > 0 && !villages.includes(village)) {
      setVillage(villages[0]);
    }
  }, [taluka]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !username || !password || !role) {
      setError("Please fill all required login credential fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await handleRegisterDirect();
  }

  async function handleRegisterDirect() {
    setLoading(true);
    setError("");
    setSuccess("");

    const payload: any = {
      name,
      username,
      password: password || "OtpAuthPass123!",
      role,
    };

    if (role === "Patient") {
      payload.age = Number(age) || 54;
      payload.dateOfBirth = dob || "1972-04-15";
      payload.gender = gender;
      payload.mobile = mobile || username;
      payload.email = email;
      payload.division = division;
      payload.district = district;
      payload.taluka = taluka;
      payload.village = village;
      payload.emergencyContact = {
        name: emergencyName,
        relation: emergencyRelation,
        mobile: emergencyMobile,
      };
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Account successfully registered! Logging you in...");
      setTimeout(() => {
        if (role === "Patient") {
          router.push("/patient/dashboard");
        } else if (role === "ASHA" || role === "ANM") {
          router.push("/asha/dashboard");
        } else if (role === "Doctor" || role === "Specialist") {
          router.push("/doctor/dashboard");
        } else {
          router.push("/login");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  async function triggerOtpSend() {
    if (!name) {
      setError("Please enter your Full Name first.");
      return;
    }
    if (!username || username.length < 10) {
      setError("Please enter a valid 10-digit mobile number in the Mobile Number field first.");
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

        console.log("Starting Firebase Phone Auth for Register:", formattedPhone);
        const result = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
        setConfirmationResult(result);
        setUseVerifyApi(true);
        setShowOtpModal(true);
        alert(`[Firebase Auth]\nA verification SMS code has been sent via Google to your mobile number ${formattedPhone}!`);
      } else {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: username, type: "registration" }),
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

  async function verifyOtpAndSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (confirmationResult) {
        console.log("Verifying registration code with Firebase...");
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
          throw new Error("Invalid OTP entered. Please try again.");
        }
      }
      setShowOtpModal(false);
      setConfirmationResult(null);
      await handleRegisterDirect();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <button onClick={() => setLanguage("mr")} className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${language === "mr" ? "text-primary font-extrabold" : ""}`}>मराठी</button>
        <span className="text-slate-300">|</span>
        <button onClick={() => setLanguage("hi")} className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${language === "hi" ? "text-primary font-extrabold" : ""}`}>हिन्दी</button>
        <span className="text-slate-300">|</span>
        <button onClick={() => setLanguage("en")} className={`hover:text-primary transition-colors cursor-pointer border-0 bg-transparent ${language === "en" ? "text-primary font-extrabold" : ""}`}>English</button>
      </div>

      {/* Main Split Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 grid md:grid-cols-12 gap-10 items-center relative z-10 py-16">
        
        {/* Left Side: Brand Checklist Panel */}
        <div className="md:col-span-5 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/50 shadow-xl space-y-6 text-left pr-4">
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="जनCare Logo" className="h-16 w-auto" />
            </Link>
            <h1 className="text-3xl font-extrabold text-deep-blue leading-tight">
              Create Your<br />JanCare Account
            </h1>
            <p className="text-sm text-text-secondary">
              Join JanCare and take charge of your health journey.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { title: "Complete Care Journey", desc: "From symptoms to follow-up, everything at one place.", icon: Heart, color: "text-red-500 bg-red-50" },
              { title: "Find Nearby Healthcare", desc: "Search PHC, clinics, and hospitals near you.", icon: MapPin, color: "text-primary bg-soft-blue" },
              { title: "Prescriptions & Records", desc: "Access your prescriptions and health records anytime.", icon: FileText, color: "text-teal-brand bg-soft-teal" },
              { title: "Reminders & Alerts", desc: "Get reminders for medicines, follow-ups, and appointments.", icon: Clock, color: "text-amber-500 bg-amber-50" },
              { title: "Secure & Confidential", desc: "Your data is protected with highest security standards.", icon: ShieldCheck, color: "text-green-brand bg-green-50" },
            ].map((feat, idx) => (
              <div key={idx} className="flex gap-3.5 items-start">
                <div className={`p-2.5 rounded-xl ${feat.color} shrink-0`}>
                  <feat.icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{feat.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Vector Background Illustration at bottom left */}
          <div className="h-10 w-full opacity-20" style={{ backgroundImage: "radial-gradient(circle, #ADC9E6 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        </div>

        {/* Right Side: Registration Form Card */}
        <div className="md:col-span-7">
          <div className="bg-white border border-border-brand shadow-2xl rounded-3xl p-8 sm:p-10 space-y-6 max-w-3xl mx-auto">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-deep-blue flex items-center gap-2">
                <UserPlus className="text-primary" size={20} /> Register for JanCare
              </h2>
              <p className="text-xs text-text-secondary">
                Create your account in a few simple steps.
              </p>
            </div>

            {/* Error / Success Alerts */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-red-700 font-semibold leading-normal">{error}</div>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-center gap-3">
                <ShieldCheck className="text-green-500 shrink-0" size={16} />
                <div className="text-[11px] text-green-700 font-semibold leading-normal">{success}</div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              
              {/* Role selector tab strip */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Account Type</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-550"></span>
                  Patient (सार्वजनिक नोंदणी / Public Account)
                </div>
              </div>

              {/* Group 1: Personal Info */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-slate-100 pb-1">
                  Personal Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Age (Years)</label>
                    <input
                      type="number"
                      required={role === "Patient"}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="Years"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setMobile(e.target.value);
                      }}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="Username / Mobile"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-text-primary">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-primary">Language</label>
                      <select
                        value={preferredLang}
                        onChange={(e) => setPreferredLang(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      >
                        <option value="Marathi">Marathi</option>
                        <option value="Hindi">Hindi</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Address Block */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-slate-100 pb-1">
                  Address Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-text-primary">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                    >
                      {districtOptions.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Taluka</label>
                    <select
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                    >
                      {talukaOptions.map((tal) => (
                        <option key={tal} value={tal}>{tal}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Village / City</label>
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                    >
                      {villageOptions.map((vil) => (
                        <option key={vil} value={vil}>{vil}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="e.g. 422301"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Security & Passwords */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-slate-100 pb-1">
                  Security
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-primary focus:outline-hidden transition-all text-text-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />} Show Passwords
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5">
                <input type="checkbox" required id="terms" className="mt-0.5 shrink-0 accent-primary" />
                <label htmlFor="terms" className="text-[10px] text-text-secondary leading-normal font-semibold">
                  I agree to the <Link href="#" className="text-primary hover:underline font-bold">Terms & Conditions</Link> and <Link href="#" className="text-primary hover:underline font-bold">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-deep-blue text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} /> Create Account
                  </>
                )}
              </button>
            </form>

            {/* Separator & OTP/ABHA creation */}
            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-200" />
              <span className="relative bg-white px-3.5 text-[10px] font-bold text-text-secondary uppercase">
                or register with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={triggerOtpSend}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
              >
                <Smartphone size={14} className="text-slate-500" /> Register with OTP
              </button>
              <button
                onClick={() => alert("Redirected to Ayushman Bharat sandbox gateway.")}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
              >
                <User size={14} className="text-slate-500" /> ABHA ID / Health ID
              </button>
            </div>
            <div id="recaptcha-container" className="invisible"></div>

            {/* Account footer Link */}
            <p className="text-xs text-center text-text-secondary mt-4 font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="font-extrabold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* BOTTOM VALUE BADGES */}
      <section className="bg-white border-y border-border-brand py-4 z-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Activity className="text-primary" size={16} />
            <span>AI-Assisted Guidance</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Clock className="text-teal-brand" size={16} />
            <span>Real-time Updates</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <Award className="text-green-brand" size={16} />
            <span>Nationwide Standards</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-primary">
            <MapPin className="text-primary" size={16} />
            <span>Designed for Bharat</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border-brand py-4 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-text-secondary">
          &copy; {new Date().getFullYear()} जनCare Health Initiative. Built for Smart India Hackathon. Government of Maharashtra sandbox.
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

            <form onSubmit={verifyOtpAndSubmit} className="space-y-4">
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
                  Verify & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
