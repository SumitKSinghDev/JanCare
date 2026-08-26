"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function WhyJancarePage() {
  return (
    <div className="min-h-screen bg-bg-brand flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border-brand sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="जनCare Logo" className="h-10 w-auto" />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="bg-soft-blue text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Ecosystem Strategy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deep-blue tracking-tight">
            Why जनCare?
          </h1>
          <p className="text-sm text-text-secondary">
            Connecting the gaps between existing digital healthcare systems in India to build a cohesive last-mile coordination web.
          </p>
        </div>

        {/* Comparison Card */}
        <div className="bg-white border border-border-brand rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-deep-blue text-white p-6">
            <h3 className="font-bold text-base">Ecosystem Capability Matrix</h3>
            <p className="text-xs text-slate-300 mt-1">Comparison of last-mile care delivery channels in Maharashtra</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border-brand text-text-primary font-bold">
                  <th className="p-4">Feature / Channel</th>
                  <th className="p-4">eSanjeevani</th>
                  <th className="p-4">M-SAKHI</th>
                  <th className="p-4">Consumer Apps (Practo)</th>
                  <th className="p-4 bg-blue-50/50 text-primary">जनCare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand text-text-secondary">
                <tr>
                  <td className="p-4 font-bold text-text-primary">Offline Intake Cache</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><CheckCircle className="text-green-brand inline mr-1" size={14} /> Yes</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (IndexedDB cache)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-text-primary">AI Vitals & Symptom Triage</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4 bg-slate-50/40">Partial (Simple bot)</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (Gemini-based)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-text-primary">Live Video Consultations</td>
                  <td className="p-4"><CheckCircle className="text-green-brand inline mr-1" size={14} /> Yes</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><CheckCircle className="text-green-brand inline mr-1" size={14} /> Yes</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (Daily.co integration)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-text-primary">Local Inventory Stocks Tracking</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (Automatic alerts)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-text-primary">Closed-Loop Referrals & Follow-ups</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (Auto-assigned follow-ups)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-text-primary">ABDM Integration Ready</td>
                  <td className="p-4"><CheckCircle className="text-green-brand inline mr-1" size={14} /> Yes</td>
                  <td className="p-4"><XCircle className="text-red-500 inline mr-1" size={14} /> No</td>
                  <td className="p-4"><CheckCircle className="text-green-brand inline mr-1" size={14} /> Yes</td>
                  <td className="p-4 bg-blue-50/20 font-semibold text-text-primary">
                    <CheckCircle className="text-primary inline mr-1" size={14} /> Yes (M0 Sandbox Linker)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Supporting details */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs">
            <h4 className="font-bold text-xs text-deep-blue">Rural Accessibility First</h4>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Practo and consumer apps require high digital literacy, smartphone ownership, and active payment capacity. JanCare is designed specifically for public health workers to bridge digital access for rural patients.
            </p>
          </div>
          <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs">
            <h4 className="font-bold text-xs text-deep-blue">Zero-Latency Offline Support</h4>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Rural clinics suffer from unstable cellular data connectivity. Unlike cloud-heavy web tools, JanCare uses localized databases to preserve records during outages, syncing them automatically in the background.
            </p>
          </div>
          <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs">
            <h4 className="font-bold text-xs text-deep-blue">Coordinated Referral Paths</h4>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              When patients are referred from primary health subcenters to taluka hospitals, the transfer is tracked at every milestone, notifying frontline ASHA workers automatically for necessary post-discharge care.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-brand py-8 text-center text-xs text-text-secondary">
        &copy; {new Date().getFullYear()} जनCare Health Initiative. Government of Maharashtra sandbox.
      </footer>
    </div>
  );
}
