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
  
  // Modal State
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [movementType, setMovementType] = useState<string>("STOCK_RECEIVED");
  const [movementQty, setMovementQty] = useState<string>("");
  const [movementNotes, setMovementNotes] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Load Initial Session & Network Data
  useEffect(() => {
    fetchProfileAndData();
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
    }
  }, [selectedFacility]);

  async function fetchProfileAndData() {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.success) {
        router.push("/login");
        return;
      }
      setCurrentUser(userData.user);
    } catch (e: any) {
      setError("Failed to fetch session details.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFacilitiesForDistrict(district: string) {
    try {
      const res = await fetch(`/api/facilities?district=${district}`);
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
        if (data.facilities.length > 0) {
          // Pre-select first facility
          setSelectedFacility(data.facilities[0]);
        } else {
          setSelectedFacility(null);
          setMedicines([]);
          setMovements([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchMedicinesForFacility(facilityId: string) {
    try {
      const res = await fetch(`/api/medicines?facilityId=${facilityId}`);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      }
    } catch (e) {
      console.error(e);
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
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent)] pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <h2 className="text-xl font-extrabold tracking-tight">Medicine Management Portal</h2>
            <p className="text-xs text-slate-300">Monitor and update drug availability across Primary Health Centers (PHC) and pharmacies.</p>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Items</span>
              <span className="text-lg font-extrabold text-slate-800">{totalItems} Unique</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Low Stock</span>
              <span className="text-lg font-extrabold text-amber-600">{lowStockCount} Items</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Out of Stock</span>
              <span className="text-lg font-extrabold text-red-600">{outOfStockCount} Items</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reservations</span>
              <span className="text-lg font-extrabold text-green-600">{pendingReservations} Logged</span>
            </div>
          </div>
        </div>

        {/* Dual Column Layout: District List & Facility Table */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Maharashtra Network Selector */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
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

          {/* Right panel: Active Stock and updates */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stock Availability */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    {selectedFacility ? `${selectedFacility.name} Inventory` : "Facility Inventory"}
                  </h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">District Network Node Stock Catalog</span>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs max-w-xs w-full sm:w-auto">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-hidden pl-2 text-xs w-full"
                  />
                </div>
              </div>

              {/* Medicines Table */}
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
                              <span className="inline-flex items-center text-[9px] font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                            ) : med.status === "Low" ? (
                              <span className="inline-flex items-center text-[9px] font-bold text-amber-650 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock</span>
                            ) : (
                              <span className="inline-flex items-center text-[9px] font-bold text-green-650 bg-green-50 px-2 py-0.5 rounded-full">Available</span>
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

            {/* Recent Facility Stock Movements */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Recent Stock movements Log
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Audit log of recent inventory transactions</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Medicine</th>
                      <th className="py-2.5 px-4 text-center">Tx Type</th>
                      <th className="py-2.5 px-4 text-center">Qty Change</th>
                      <th className="py-2.5 px-4">Operator</th>
                      <th className="py-2.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {movements.length > 0 ? (
                      movements.map((mv) => {
                        const dateStr = new Date(mv.createdAt).toLocaleDateString() + " " + new Date(mv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isAdd = mv.quantity > 0;
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
                              isAdd ? "text-green-600" : "text-red-650"
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

          </div>

        </div>

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

    </AppShell>
  );
}
