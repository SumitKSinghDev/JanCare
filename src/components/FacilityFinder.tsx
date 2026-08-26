"use client";

import React, { useState, useEffect } from "react";
import { divisions, getDistrictsForDivision, getTalukasForDistrict } from "@/lib/maharashtra";
import { MapPin, Search, Hospital, Phone, ShieldCheck, Loader2 } from "lucide-react";

export default function FacilityFinder() {
  const [division, setDivision] = useState("Nashik");
  const [district, setDistrict] = useState("Nashik");
  const [taluka, setTaluka] = useState("Sinnar");
  
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Geo options
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<string[]>([]);

  useEffect(() => {
    setDistrictOptions(getDistrictsForDivision(division));
  }, [division]);

  useEffect(() => {
    setTalukaOptions(getTalukasForDistrict(district));
  }, [district]);

  useEffect(() => {
    fetchFacilities();
  }, [division, district, taluka]);

  async function fetchFacilities() {
    setLoading(true);
    try {
      const res = await fetch(`/api/facilities?division=${division}&district=${district}&taluka=${taluka}`);
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-border-brand p-6 rounded-2xl shadow-xs space-y-6">
      <div className="border-b border-border-brand pb-3">
        <h3 className="font-bold text-base text-deep-blue flex items-center gap-2">
          <Hospital className="text-primary" size={18} />
          <span>Find the Right Care Center</span>
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          JanCare recommends care pathways based on equipment availability, specialty doctors, and location.
        </p>
      </div>

      {/* Select Location Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
        <div>
          <label className="block text-slate-500 mb-1">Division</label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary focus:bg-white"
          >
            {divisions.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary focus:bg-white"
          >
            {districtOptions.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1">Taluka</label>
          <select
            value={taluka}
            onChange={(e) => setTaluka(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary focus:bg-white"
          >
            {talukaOptions.map((tal) => (
              <option key={tal} value={tal}>
                {tal}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Result List & Map */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lists column */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : facilities.length === 0 ? (
            <p className="text-xs text-text-secondary py-8 text-center bg-slate-50 rounded-xl">
              No facilities found matching these division/district/taluka parameters.
            </p>
          ) : (
            <div className="space-y-3">
              {facilities.map((fac) => (
                <div
                  key={fac._id}
                  className="p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{fac.name}</h4>
                      <span className="bg-soft-blue text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                        {fac.type} Facility
                      </span>
                    </div>
                    <span className="text-[10px] text-green-brand font-semibold flex items-center gap-1">
                      <ShieldCheck size={12} /> Live Support
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} /> {fac.village}, {fac.taluka}
                    </p>
                    {fac.contactNumber && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={12} /> {fac.contactNumber}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1 text-[9px] font-bold text-slate-500">
                    {fac.services.map((serv: string) => (
                      <span key={serv} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {serv}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-primary font-semibold pt-1 border-t border-slate-100">
                    Recommended: Home facility for telemedicine.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OSM Map Preview Embed column */}
        <div className="rounded-xl overflow-hidden border border-border-brand h-64 relative bg-slate-100 flex items-center justify-center">
          {facilities.length > 0 ? (
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${facilities[0].coordinates.lng - 0.05}%2C${facilities[0].coordinates.lat - 0.05}%2C${facilities[0].coordinates.lng + 0.05}%2C${facilities[0].coordinates.lat + 0.05}&layer=mapnik&marker=${facilities[0].coordinates.lat}%2C${facilities[0].coordinates.lng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          ) : (
            <div className="text-center p-6 text-xs text-slate-400">
              <MapPin size={28} className="mx-auto text-slate-300 mb-1" />
              <span>Select location to render interactive map</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
