"use client";

import React from "react";
import Link from "next/link";
import FacilityFinder from "@/components/FacilityFinder";
import { ArrowLeft } from "lucide-react";

export default function FacilitiesPage() {
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

      {/* Main content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-left space-y-2">
          <span className="bg-soft-blue text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Maharashtra Directory
          </span>
          <h1 className="text-3xl font-extrabold text-deep-blue tracking-tight">Healthcare Facility Network</h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Locate Primary Health Centers (PHCs), Community Health Centers (CHCs), and SubCenters across Maharashtra districts. View coordinates, services, and live queue loads.
          </p>
        </div>

        <div className="bg-white border border-border-brand rounded-2xl shadow-xs p-6">
          <FacilityFinder />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-brand py-8 text-center text-xs text-text-secondary">
        &copy; {new Date().getFullYear()} जनCare Health Initiative. Government of Maharashtra sandbox.
      </footer>
    </div>
  );
}
