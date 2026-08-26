"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import {
  LayoutDashboard,
  User,
  Calendar,
  Video,
  FileText,
  Heart,
  Briefcase,
  Package,
  Share2,
  RotateCcw,
  Clock,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Globe,
  PlusCircle,
  Activity,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Map,
  Database,
  MapPin,
  X
} from "lucide-react";

interface AppShellProps {
  role: "Patient" | "ASHA" | "Doctor" | "Facility" | "Admin";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  children: React.ReactNode;
}

export default function AppShell({
  role,
  activeTab,
  setActiveTab,
  user,
  children
}: AppShellProps) {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Grouped Navigation configuration by Role
  const getNavItemsByRole = () => {
    switch (role) {
      case "Patient":
        return [
          {
            group: "OVERVIEW",
            items: [
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Profile", icon: User }
            ]
          },
          {
            group: "CARE & CONSULTATION",
            items: [
              { name: "Appointments", icon: Calendar },
              { name: "Video Consultation", icon: Video },
              { name: "Prescriptions", icon: FileText },
              { name: "Medicine Orders", icon: Package }
            ]
          },
          {
            group: "HEALTH DATA",
            items: [
              { name: "Health Records", icon: Heart },
              { name: "Care Timeline", icon: Clock },
              { name: "Referrals", icon: Share2 },
              { name: "Follow-ups", icon: RotateCcw }
            ]
          },
          {
            group: "SUPPORT",
            items: [
              { name: "JanCare Assistant", icon: MessageSquare },
              { name: "Settings", icon: Settings }
            ]
          }
        ];
      case "ASHA":
        return [
          {
            group: "OVERVIEW",
            items: [
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Profile", icon: User }
            ]
          },
          {
            group: "CLINICAL OUTREACH",
            items: [
              { name: "My Patients", icon: Users },
              { name: "Register Patient", icon: PlusCircle },
              { name: "Vitals & Symptoms", icon: Activity },
              { name: "Priority Cases", icon: AlertTriangle }
            ]
          },
          {
            group: "COORDINATION",
            items: [
              { name: "Appointments", icon: Calendar },
              { name: "Referrals", icon: Share2 },
              { name: "Follow-ups", icon: RotateCcw }
            ]
          },
          {
            group: "SYSTEM",
            items: [
              { name: "Offline & Sync", icon: Database },
              { name: "Village / Map", icon: Map }
            ]
          }
        ];
      case "Doctor":
        return [
          {
            group: "OVERVIEW",
            items: [
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Profile", icon: User }
            ]
          },
          {
            group: "CLINICAL WORKSPACE",
            items: [
              { name: "Consultation Queue", icon: Users },
              { name: "Patients", icon: Users },
              { name: "Video Consultation", icon: Video },
              { name: "Prescriptions", icon: FileText }
            ]
          },
          {
            group: "COORDINATION",
            items: [
              { name: "Appointments", icon: Calendar },
              { name: "Referrals", icon: Share2 },
              { name: "Follow-ups", icon: RotateCcw },
              { name: "Clinical History", icon: Clock }
            ]
          }
        ];
      case "Facility":
        return [
          {
            group: "OVERVIEW",
            items: [
              { name: "Dashboard", icon: LayoutDashboard }
            ]
          },
          {
            group: "PATIENTS & QUEUE",
            items: [
              { name: "Patients", icon: Users },
              { name: "Appointments", icon: Calendar },
              { name: "Queue", icon: Clock },
              { name: "Consultations", icon: Video }
            ]
          },
          {
            group: "INVENTORY & LOGISTICS",
            items: [
              { name: "Medicine Inventory", icon: Briefcase },
              { name: "Medicine Reservations", icon: Package }
            ]
          },
          {
            group: "OPERATIONS",
            items: [
              { name: "Referrals", icon: Share2 },
              { name: "Follow-ups", icon: RotateCcw },
              { name: "Reports", icon: TrendingUp },
              { name: "Settings", icon: Settings }
            ]
          }
        ];
      case "Admin":
        return [
          {
            group: "OVERVIEW",
            items: [
              { name: "Overview", icon: LayoutDashboard }
            ]
          },
          {
            group: "DISTRICT NETWORK",
            items: [
              { name: "Maharashtra Network", icon: Map },
              { name: "Facilities", icon: Building },
              { name: "Patients", icon: Users },
              { name: "Consultations", icon: Video }
            ]
          },
          {
            group: "PUBLIC HEALTH",
            items: [
              { name: "Medicine Availability", icon: Briefcase },
              { name: "Medicine Shortages", icon: AlertTriangle },
              { name: "Referrals", icon: Share2 },
              { name: "Follow-ups", icon: RotateCcw }
            ]
          },
          {
            group: "INTELLIGENCE & AUDITS",
            items: [
              { name: "Analytics", icon: TrendingUp },
              { name: "Alerts", icon: AlertTriangle },
              { name: "Audit Logs", icon: FileSpreadsheet },
              { name: "Settings", icon: Settings }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const navGroups = getNavItemsByRole();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const notifications = [
    { id: 1, text: "New tele-consultation scheduled with Dr. Kulkarni.", time: "5 mins ago", unread: true },
    { id: 2, text: "ASHA worker logged new vitals record.", time: "1 hour ago", unread: false },
    { id: 3, text: "Prescription reference JC-MED-7821 approved by pharmacy.", time: "2 hours ago", unread: false }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 h-16 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        {/* Left Section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border-0 bg-transparent"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              जC
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-800 tracking-tight leading-tight">जनCare</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{role} PORTAL</span>
            </div>
          </div>
        </div>

        {/* Center Section: Global Search */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search records, doctors, prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-hidden text-xs pl-2 text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Right Section: Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 border border-slate-200/80 bg-slate-50 rounded-xl p-1 text-[10px] font-bold text-slate-600">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === "en" ? "bg-white text-primary shadow-xs" : "hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === "hi" ? "bg-white text-primary shadow-xs" : "hover:text-slate-900"
              }`}
            >
              हिं
            </button>
            <button
              onClick={() => setLanguage("mr")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === "mr" ? "bg-white text-primary shadow-xs" : "hover:text-slate-900"
              }`}
            >
              मरा
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-all relative border-0 bg-transparent"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-800">Notifications</span>
                  <span className="text-[9px] font-bold text-primary cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer flex gap-3 ${n.unread ? "bg-blue-50/30" : ""}`}>
                      <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-primary" : "bg-transparent"}`} />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-slate-700 leading-normal">{n.text}</p>
                        <span className="text-[9px] text-slate-400 font-semibold">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Quick Details */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-xs">
              {user?.name?.slice(0, 2) || "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-700 leading-tight block">{user?.name || "Guest User"}</span>
              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md w-fit leading-none mt-0.5 uppercase tracking-wider">{role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 relative">
        {/* Desktop Left Persistent Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 z-30 select-none ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-3 -right-3 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer hover:shadow-md transition-all"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-5 scrollbar-thin">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <span className="text-[9px] font-extrabold tracking-widest text-slate-400 block px-3 mb-2.5 uppercase">
                    {group.group}
                  </span>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setActiveTab(item.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/10"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all border-0 bg-transparent cursor-pointer ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut size={16} className="text-red-500 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />
            
            {/* Drawer Panel */}
            <aside className="relative flex flex-col w-64 bg-white h-full shadow-2xl p-5 z-10 animate-in slide-in-from-left duration-250">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-xs">
                    ज
                  </div>
                  <span className="font-extrabold text-sm text-slate-800">जनCare</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer bg-transparent border-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Group (Mobile scrollable) */}
              <div className="flex-1 overflow-y-auto py-5 space-y-5">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <span className="text-[9px] font-extrabold tracking-widest text-slate-400 block px-3 mb-2 uppercase">
                      {group.group}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name;
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              setActiveTab(item.name);
                              setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${
                              isActive
                                ? "bg-primary text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile bottom logout */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all border-0 bg-transparent cursor-pointer"
                >
                  <LogOut size={16} className="text-red-500 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Panel Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}
