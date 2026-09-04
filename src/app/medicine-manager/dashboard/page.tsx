"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18nContext";
import {
  Package,
  AlertTriangle,
  FileText,
  Activity,
  Search,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  Loader2,
  Plus,
  ArrowRightLeft,
  Info,
  Calendar,
  Layers,
  Map
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { divisions } from "@/lib/maharashtra";
import { DEMO_MEDICINES, DEMO_RESERVATIONS } from "@/lib/demoMedicines";

export default function MedicineManagerDashboard() {
  const router = useRouter();
  const { language, t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Network State
  const [selectedDistrict, setSelectedDistrict] = useState("Nashik");
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [dispensingId, setDispensingId] = useState<string | null>(null);
  
  // Modal State
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [movementType, setMovementType] = useState<string>("STOCK_RECEIVED");
  const [movementQty, setMovementQty] = useState<string>("");
  const [movementNotes, setMovementNotes] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Add New Medicine Modal State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedGeneric, setNewMedGeneric] = useState("");
  const [newMedStrength, setNewMedStrength] = useState("500mg");
  const [newMedForm, setNewMedForm] = useState("Tablet");
  const [newMedCategory, setNewMedCategory] = useState("Analgesic & Antipyretic");
  const [newMedQty, setNewMedQty] = useState("100");
  const [newMedMinReq, setNewMedMinReq] = useState("50");
  const [addMedLoading, setAddMedLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Load Initial Session & Network Data
  useEffect(() => {
    fetchProfileAndData();
    fetchReservationsForFacility();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchFacilitiesForDistrict(selectedDistrict);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedFacility) {
      fetchMedicinesForFacility(selectedFacility._id);
      fetchMovementsForFacility(selectedFacility._id);
      fetchReservationsForFacility(selectedFacility._id);
    }
  }, [selectedFacility]);

  async function fetchProfileAndData() {
    try {
      setLoading(true);
      let userData: any = null;
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) userData = await userRes.json();
      } catch (e) {}

      if (!userData || !userData.success) {
        if (typeof window !== "undefined" && !navigator.onLine) {
          setCurrentUser({
            name: "Prakash Jadhav",
            role: "MedicineManager",
            facilityName: "Nashik Central Medical Depot",
            isOfflineDemo: true
          });
        } else {
          router.push("/login");
          return;
        }
      } else {
        setCurrentUser(userData.user);
      }
    } catch (e: any) {
      console.warn("Medicine manager offline session fallback:", e);
      setCurrentUser((prev: any) => prev || {
        name: "Prakash Jadhav",
        role: "MedicineManager",
        facilityName: "Nashik Central Medical Depot"
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchFacilitiesForDistrict(district: string) {
    try {
      const res = await fetch(`/api/facilities?district=${district}`);
      const data = await res.json();
      if (data.success && data.facilities && data.facilities.length > 0) {
        setFacilities(data.facilities);
        setSelectedFacility(data.facilities[0]);
      } else {
        const defaultFac = {
          _id: "fac-nashik-med1",
          name: "Nashik MED-01 (Jan Aushadhi Kendra)",
          type: "MedicalStore",
          district: "Nashik",
          taluka: "Nashik",
          village: "Demo Village",
        };
        setFacilities([defaultFac]);
        setSelectedFacility(defaultFac);
        setMedicines(DEMO_MEDICINES);
      }
    } catch (e) {
      console.warn("Facilities fallback:", e);
      const defaultFac = {
        _id: "fac-nashik-med1",
        name: "Nashik MED-01 (Jan Aushadhi Kendra)",
        type: "MedicalStore",
        district: "Nashik",
        taluka: "Nashik",
        village: "Demo Village",
      };
      setFacilities([defaultFac]);
      setSelectedFacility(defaultFac);
      setMedicines(DEMO_MEDICINES);
    }
  }

  async function fetchMedicinesForFacility(facilityId: string) {
    try {
      const res = await fetch(`/api/medicines?facilityId=${facilityId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.medicines) && data.medicines.length > 0) {
        setMedicines(data.medicines);
      } else {
        setMedicines(DEMO_MEDICINES);
      }
    } catch (e) {
      console.warn("Medicines fallback:", e);
      setMedicines(DEMO_MEDICINES);
    }
  }

  async function fetchMovementsForFacility(facilityId: string) {
    try {
      const res = await fetch(`/api/medicines/movement?facilityId=${facilityId}`);
      const data = await res.json();
      if (data.success) {
        setMovements(data.movements);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchReservationsForFacility(facilityId?: string) {
    try {
      const res = await fetch(`/api/medicines/reserve?facilityId=${facilityId || ""}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations) && data.reservations.length > 0) {
        setReservations(data.reservations);
      } else {
        setReservations(DEMO_RESERVATIONS);
      }
    } catch (e) {
      console.warn("Reservations fallback:", e);
      setReservations(DEMO_RESERVATIONS);
    }
  }

  async function handleDispenseReservation(movementId: string) {
    try {
      setDispensingId(movementId);
      // Optimistic instant UI update
      setReservations(prev => prev.map(r => (r.id === movementId || r._id === movementId) ? { ...r, status: "Dispensed", type: "DISPENSED" } : r));

      const res = await fetch("/api/medicines/reserve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movementId, action: "DISPENSE" }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedFacility) {
          fetchReservationsForFacility(selectedFacility._id);
          fetchMedicinesForFacility(selectedFacility._id);
          fetchMovementsForFacility(selectedFacility._id);
        } else {
          fetchReservationsForFacility();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispensingId(null);
    }
  }

  // Submit Stock Movement adjustment transaction
  async function handleSubmitMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMedicine || !movementType || !movementQty) return;

    setModalLoading(true);
    try {
      // For deductions (DISPENSED, SOLD, RESERVED, TRANSFER etc), convert to negative value
      let qtyChange = Number(movementQty);
      if (["DISPENSED", "SOLD", "RESERVED", "TRANSFER"].includes(movementType)) {
        qtyChange = -Math.abs(qtyChange);
      }

      const res = await fetch("/api/medicines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: selectedMedicine.id || selectedMedicine._id,
          type: movementType,
          quantity: qtyChange,
          notes: movementNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Stock movement logged successfully!");
        setShowMovementModal(false);
        // Reset inputs
        setMovementQty("");
        setMovementNotes("");
        // Reload data
        fetchMedicinesForFacility(selectedFacility._id);
        fetchMovementsForFacility(selectedFacility._id);
      } else {
        alert("Failed to update stock: " + data.error);
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setModalLoading(false);
    }
  }

  // Handle adding brand new medicine item to facility inventory
  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFacility || !newMedName || !newMedGeneric) {
      alert("Please fill in Medicine Name and Generic Name.");
      return;
    }

    setAddMedLoading(true);
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_NEW_MEDICINE",
          facilityId: selectedFacility._id,
          name: newMedName,
          genericName: newMedGeneric,
          strength: newMedStrength,
          form: newMedForm,
          category: newMedCategory,
          quantity: Number(newMedQty) || 0,
          minimumRequired: Number(newMedMinReq) || 50,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Drug "${newMedName}" successfully added to ${selectedFacility.name} inventory!`);
        setShowAddMedModal(false);
        setNewMedName("");
        setNewMedGeneric("");
        fetchMedicinesForFacility(selectedFacility._id);
        fetchMovementsForFacility(selectedFacility._id);
      } else {
        alert("Failed to add medicine: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to add medicine: " + err.message);
    } finally {
      setAddMedLoading(false);
    }
  }

  // Calculate Metrics
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter((m) => m.status === "Low").length;
  const outOfStockCount = medicines.filter((m) => m.status === "Out of Stock").length;
  const pendingReservations = movements.filter((mv) => mv.type === "RESERVED").length;

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(q) ||
      (med.genericName && med.genericName.toLowerCase().includes(q)) ||
      med.category.toLowerCase().includes(q)
    );
  });

  // Flat list of Maharashtra districts
  const districtList = divisions.flatMap((d) => d.districts).sort();

  // 1. Render Maharashtra Network Selector panel
  const renderNetworkSelector = () => (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-left">
      <div>
        <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Maharashtra District Selector</strong>
        <p className="text-[10px] text-slate-400">Choose district to view active healthcare nodes.</p>
      </div>
      
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-500">Active District Selector</label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:bg-white focus:outline-hidden"
        >
          {districtList.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>

      {/* Nodes/Facilities in District */}
      <div className="space-y-2 pt-2">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Healthcare Facilities ({facilities.length})</span>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {facilities.length > 0 ? (
            facilities.map((fac) => (
              <button
                key={fac._id}
                onClick={() => setSelectedFacility(fac)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedFacility?._id === fac._id
                    ? "bg-blue-50/50 border-blue-200 text-[#1464D2]"
                    : "bg-[#F8FAFC] border-slate-150 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>
                  <strong className="text-[11px] block">{fac.name}</strong>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{fac.type} - {fac.village}</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No facility nodes in this district.</p>
          )}
        </div>
      </div>
    </div>
  );

  // 2. Render Stock catalog inventory table
  const renderStockCatalog = () => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            {selectedFacility ? `${selectedFacility.name} Inventory` : "Facility Inventory"}
          </h3>
          <span className="text-[10px] text-slate-400 block mt-0.5">District Network Node Stock Catalog & Generic Substitution</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs max-w-xs w-full sm:w-auto">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-hidden pl-2 text-xs w-full font-bold text-slate-700"
            />
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="bg-primary hover:bg-blue-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border-0 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={14} /> Add Medicine
          </button>
        </div>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
              <th className="py-2.5 px-4">Medicine / Generic</th>
              <th className="py-2.5 px-4">Strength/Form</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4 text-center">Available Stock</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med) => (
                <tr key={med.id || med._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-700">
                    <div className="flex flex-col">
                      <span>{med.name}</span>
                      {med.genericName && (
                        <span className="text-[10px] text-slate-450 font-mono font-semibold mt-0.5">({med.genericName})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{med.strength} / {med.form}</td>
                  <td className="py-3 px-4 text-slate-500">{med.category}</td>
                  <td className="py-3 px-4 text-center font-bold font-mono text-slate-700">{med.quantity}</td>
                  <td className="py-3 px-4 text-center">
                    {med.status === "Out of Stock" ? (
                      <span className="inline-flex items-center text-[9px] font-bold text-red-655 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : med.status === "Low" ? (
                      <span className="inline-flex items-center text-[9px] font-bold text-amber-655 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock</span>
                    ) : (
                      <span className="inline-flex items-center text-[9px] font-bold text-green-655 bg-green-50 px-2 py-0.5 rounded-full">Available</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedMedicine(med);
                        setShowMovementModal(true);
                      }}
                      className="bg-[#1464D2] hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-xl cursor-pointer border-0 text-[10px] flex items-center gap-1.5"
                    >
                      <ArrowRightLeft size={10} /> Record Movement
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No stock items registered for this facility node.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 3. Render Stock Movements Log Table
  const renderMovementsLog = () => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Recent Inventory Transactions</h3>
        <span className="text-[10px] text-slate-400 block mt-0.5">Audit log of adjustments and shipments</span>
      </div>

      <div className="overflow-x-auto text-[11px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Medicine</th>
              <th className="py-2.5 px-4 text-center">Type</th>
              <th className="py-2.5 px-4 text-center">Volume</th>
              <th className="py-2.5 px-4">Operator</th>
              <th className="py-2.5 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.length > 0 ? (
              movements.map((mv) => {
                const dateStr = new Date(mv.createdAt).toLocaleString();
                const isAdd = ["STOCK_RECEIVED", "ADJUSTMENT"].includes(mv.type) || (mv.type === "ADJUSTMENT" && mv.quantity > 0);
                return (
                  <tr key={mv._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-400">{dateStr}</td>
                    <td className="py-2.5 px-4 text-slate-800 font-sans font-bold">{mv.medicineId?.name || "Generic"}</td>
                    <td className="py-2.5 px-4 text-center font-bold font-sans">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase ${
                        isAdd ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>{mv.type}</span>
                    </td>
                    <td className={`py-2.5 px-4 text-center font-bold ${
                      isAdd ? "text-green-600" : "text-red-655"
                    }`}>
                      {isAdd ? "+" : ""}{mv.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans">{mv.performedBy?.name || "Staff"}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans max-w-xs truncate" title={mv.notes}>{mv.notes}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No recent transactions recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );  const renderReservationsPanel = () => (
    <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-800">
            Digital Medicine Reservations & Pickups ({reservations.length})
          </h2>
          <p className="text-[11px] text-slate-500">
            Real-time stock units locked for patient online reservations and emergency doctor prescriptions.
          </p>
        </div>
        <button
          onClick={() => fetchReservationsForFacility(selectedFacility?._id)}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer transition-all flex items-center gap-1.5"
        >
          <Activity size={13} className="text-primary" /> Refresh Queue
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
          <Package size={32} className="mx-auto text-slate-300" />
          <p>No active medicine reservations at this facility.</p>
          <span className="text-[10px] text-slate-400">Reservations created via Patient Portal will appear here instantly.</span>
        </div>
      ) : (
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold bg-[#F8FAFC]/50">
                <th className="py-2.5 px-4">Tracking ID</th>
                <th className="py-2.5 px-4">Patient / UHID</th>
                <th className="py-2.5 px-4">Medicine Reserved</th>
                <th className="py-2.5 px-4">Qty</th>
                <th className="py-2.5 px-4">Facility Depot</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reservations.map((res: any) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {res.trackingId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">Patient</span>
                    <span className="text-[10px] text-slate-400 font-mono">{res.patientRef || "JC-7F3K92"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <strong className="text-slate-800 block">{res.medicineName}</strong>
                    <span className="text-[10px] text-slate-500">{res.genericName} • {res.strength} ({res.form})</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {res.quantity} unit(s)
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {res.facilityName}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      res.status === "Dispensed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700 animate-pulse"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {res.status !== "Dispensed" ? (
                      <button
                        onClick={() => handleDispenseReservation(res.id)}
                        disabled={dispensingId === res.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] border-0 cursor-pointer shadow-xs shadow-emerald-200 transition-all flex items-center gap-1 mx-auto"
                      >
                        {dispensingId === res.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Dispense / Collect"
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Collected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#1464D2]" size={36} />
          <p className="text-xs font-bold text-slate-500">Loading Inventory Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      role="MedicineManager"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={currentUser}
    >
      <div className="space-y-6">
        {/* 1. DASHBOARD VIEW */}
        {activeTab === "Dashboard" && (
          <>
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent)] pointer-events-none" />
              <div className="space-y-1 relative z-10">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {language === "mr" ? "औषध साठा व्यवस्थापन पोर्टल" : language === "hi" ? "दवा प्रबंधन पोर्टल" : "Medicine Management Portal"}
                </h2>
                <p className="text-xs text-slate-300">
                  {language === "mr" 
                    ? "प्राथमिक आरोग्य केंद्र (PHC) आणि फार्मसीमधील औषध उपलब्धता निरीक्षण व व्यवस्थापन करा."
                    : language === "hi"
                    ? "प्राथमिक स्वास्थ्य केंद्र (PHC) और फार्मेसी में दवा उपलब्धता की निगरानी और अद्यतन करें।"
                    : "Monitor and update drug availability across Primary Health Centers (PHC) and pharmacies."}
                </p>
              </div>
            </div>

            {/* KPIs Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Package size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">
                    {language === "mr" ? "एकूण औषधे" : language === "hi" ? "कुल दवाएं" : "Stock Items"}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-800">
                    {totalItems} {language === "mr" ? "प्रकार" : language === "hi" ? "प्रकार" : "Unique"}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">
                    {language === "mr" ? "कमी साठा" : language === "hi" ? "कम स्टॉक" : "Low Stock"}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-600">
                    {lowStockCount} {language === "mr" ? "औषधे" : language === "hi" ? "दवाएं" : "Items"}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-red-50 text-red-600 rounded-xl">
                  <TrendingDown size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">
                    {language === "mr" ? "साठा संपला" : language === "hi" ? "स्टॉक समाप्त" : "Out of Stock"}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-red-600">
                    {outOfStockCount} {language === "mr" ? "औषधे" : language === "hi" ? "दवाएं" : "Items"}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-green-50 text-green-600 rounded-xl">
                  <Layers size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">
                    {language === "mr" ? "औषध आरक्षणे" : language === "hi" ? "दवा आरक्षण" : "Reservations"}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-green-600">
                    {reservations.length || pendingReservations} {language === "mr" ? "नोंदणी" : language === "hi" ? "दर्ज" : "Logged"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Operational Split */}
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                {renderNetworkSelector()}
              </div>
              <div className="lg:col-span-8 space-y-6">
                {renderReservationsPanel()}
                {renderStockCatalog()}
                {renderMovementsLog()}
              </div>
            </div>
          </>
        )}

        {/* 2. MEDICINE INVENTORY VIEW */}
        {activeTab === "Medicine Inventory" && (
          <div className="space-y-6 animate-in fade-in duration-250">
            {renderStockCatalog()}
          </div>
        )}

        {/* 3. STOCK MOVEMENTS VIEW */}
        {activeTab === "Stock Movements" && (
          <div className="space-y-6 animate-in fade-in duration-250">
            {renderMovementsLog()}
          </div>
        )}

        {/* 4. MEDICINE RESERVATIONS VIEW */}
        {activeTab === "Medicine Reservations" && (
          <div className="space-y-6 animate-in fade-in duration-250">
            {renderReservationsPanel()}
          </div>
        )}

        {/* 5. MAHARASHTRA NETWORK VIEW */}
        {activeTab === "Maharashtra Network" && (
          <div className="space-y-6 animate-in fade-in duration-250">
            {renderNetworkSelector()}
          </div>
        )}

        {/* 6. OTHER WORKSPACES */}
        {activeTab !== "Dashboard" && activeTab !== "Medicine Inventory" && activeTab !== "Stock Movements" && activeTab !== "Medicine Reservations" && activeTab !== "Maharashtra Network" && (
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 min-h-[400px]">
            <h2 className="text-lg font-extrabold text-slate-800">{activeTab} Workspace</h2>
            <p className="text-xs text-slate-500">Workspace panel for {activeTab} information logs.</p>
            
            <div className="border border-slate-100 p-8 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center flex flex-col items-center justify-center space-y-2">
              <Layers size={32} className="text-slate-300 animate-pulse" />
              <span>Currently showing {activeTab} details.</span>
              <button
                onClick={() => setActiveTab("Dashboard")}
                className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent mt-2 text-xs"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Stock Movement Modal popup */}
      {showMovementModal && selectedMedicine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <strong className="text-sm text-slate-800 block uppercase tracking-wider">Record Stock Movement</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Drug: {selectedMedicine.name}</span>
              </div>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold bg-transparent border-0 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Movement Transaction Type</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:bg-white focus:outline-hidden"
                >
                  <option value="STOCK_RECEIVED">STOCK_RECEIVED (+) Stock Addition</option>
                  <option value="DISPENSED">DISPENSED (-) General Dispensation</option>
                  <option value="SOLD">SOLD (-) Sold to Pharmacy patient</option>
                  <option value="RESERVED">RESERVED (-) Block for reservation</option>
                  <option value="RESERVATION_CANCELLED">RESERVATION_CANCELLED (+) Return reservations</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (+/-) Count adjustment</option>
                  <option value="TRANSFER">TRANSFER (-) Transfer out to other node</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Quantity (Pack/Unit)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Current Facility Stock</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-550 text-center">
                    {selectedMedicine.quantity} Units
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Transaction Notes</label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="e.g. Received shipment from Nashik Main Depot"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 transition-all shadow-md shadow-blue-200/40"
                >
                  {modalLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Apply stock movement"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <strong className="text-sm text-slate-800 block uppercase tracking-wider">Add New Medicine to Stock</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Facility: {selectedFacility?.name || "Selected Node"}</span>
              </div>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold bg-transparent border-0 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Medicine Trade Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg (PMBJP)"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Generic Drug Name (Salt) *</label>
                  <input
                    type="text"
                    required
                    value={newMedGeneric}
                    onChange={(e) => setNewMedGeneric(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Strength</label>
                  <input
                    type="text"
                    value={newMedStrength}
                    onChange={(e) => setNewMedStrength(e.target.value)}
                    placeholder="e.g. 500mg, 10ml"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Form</label>
                  <select
                    value={newMedForm}
                    onChange={(e) => setNewMedForm(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Other">Other / Powder</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Category</label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden"
                  >
                    <option value="Analgesic & Antipyretic">Analgesic & Antipyretic</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Oral Antidiabetic">Oral Antidiabetic</option>
                    <option value="Antihypertensive">Antihypertensive</option>
                    <option value="Antihistamine">Antihistamine</option>
                    <option value="Rehydration">Rehydration</option>
                    <option value="Antidote">Antidote (ASV)</option>
                    <option value="Nutritional Supplement">Nutritional Supplement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Initial Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={newMedQty}
                    onChange={(e) => setNewMedQty(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Minimum Required (Alert Threshold)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMedMinReq}
                    onChange={(e) => setNewMedMinReq(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addMedLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-0 transition-all shadow-md shadow-blue-200/40"
                >
                  {addMedLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Save & Add to Facility Stock"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
}
