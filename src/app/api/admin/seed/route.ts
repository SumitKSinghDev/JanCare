import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Facility from "@/models/Facility";
import Medicine from "@/models/Medicine";
import HealthRecord from "@/models/HealthRecord";
import Consultation from "@/models/Consultation";
import Appointment from "@/models/Appointment";
import Prescription from "@/models/Prescription";
import Referral from "@/models/Referral";
import FollowUp from "@/models/FollowUp";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";
import Consent from "@/models/Consent";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Clear existing database collections
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Facility.deleteMany({});
    await Medicine.deleteMany({});
    await HealthRecord.deleteMany({});
    await Consultation.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Referral.deleteMany({});
    await FollowUp.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await Consent.deleteMany({});

    // 2. Hash common password "password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // 3. Seed Facilities
    const facilitySinnar = await Facility.create({
      name: "Sinnar Rural Hospital",
      type: "CHC",
      services: ["General Medicine", "Pediatrics", "Maternity", "Diagnostics", "Telemedicine"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Sinnar Town",
      coordinates: { lat: 19.8517, lng: 74.0006 },
      contactNumber: "02551-220033",
    });

    const facilitySubCenter = await Facility.create({
      name: "Demo Village Health SubCenter",
      type: "SubCenter",
      services: ["Primary Care", "Maternal Health", "Immunization", "First Aid"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Demo Village",
      coordinates: { lat: 19.8654, lng: 74.0123 },
      contactNumber: "02551-220044",
    });

    // 4. Seed Users (ASHA, Doctor, Admin, Patient)
    const ashaUser = await User.create({
      name: "Sharda Patil",
      username: "asha",
      passwordHash,
      role: "ASHA",
      associatedFacility: facilitySubCenter._id as any,
    });

    const doctorUser = await User.create({
      name: "Dr. Aniruddha Kulkarni",
      username: "doctor",
      passwordHash,
      role: "Doctor",
      associatedFacility: facilitySinnar._id as any,
    });

    const specialistUser = await User.create({
      name: "Dr. Smita Rao (Cardiologist)",
      username: "specialist",
      passwordHash,
      role: "Specialist",
      associatedFacility: facilitySinnar._id as any,
    });

    const facilityAdmin = await User.create({
      name: "Meera Deshmukh",
      username: "facilityadmin",
      passwordHash,
      role: "FacilityAdmin",
      associatedFacility: facilitySinnar._id as any,
    });

    const districtAdmin = await User.create({
      name: "Collector Nashik",
      username: "districtadmin",
      passwordHash,
      role: "DistrictAdmin",
    });

    const patientUser = await User.create({
      name: "Ramesh Kumar",
      username: "patient",
      passwordHash,
      role: "Patient",
    });

    // 5. Seed Patient: Ramesh Kumar
    const patientRamesh = await Patient.create({
      patientRefId: "JC-7F3K92",
      name: "Ramesh Kumar",
      age: 54,
      dateOfBirth: new Date("1972-04-15"),
      gender: "Male",
      mobile: "9822114400",
      email: "ramesh.kumar@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Demo Village",
      preferredLanguage: "Marathi",
      emergencyContact: {
        name: "Sunita Kumar",
        relation: "Spouse",
        mobile: "9822114401",
      },
      abhaLinked: false,
      registeredBy: ashaUser._id as any,
    });

    // 6. Seed Health Record (Symptom & Vitals intake) for Ramesh
    const healthRecordRamesh = await HealthRecord.create({
      patientId: patientRamesh._id as any,
      recordedBy: ashaUser._id as any,
      vitals: {
        temperature: 102.2,
        bloodPressureSystolic: 130,
        bloodPressureDiastolic: 85,
        heartRate: 88,
        spo2: 96,
        respiratoryRate: 18,
      },
      symptoms: [
        { name: "Fever", durationDays: 3, severity: "Severe" },
        { name: "Weakness", durationDays: 3, severity: "Moderate" },
        { name: "Dizziness", durationDays: 2, severity: "Moderate" },
      ],
      triage: {
        level: "Priority",
        reason: "High body temperature (102.2°F) accompanied by dizziness and weakness in a 54-year-old male warrants professional clinical evaluation.",
        aiExplanation: "Patient demonstrates priority symptoms with elevated body temperature (102.2°F). Elevated temperature and dizziness suggest moderate systemic response. Care coordination to Sinnar Rural Hospital is recommended.",
        recommendedFacilityId: facilitySinnar._id as any,
      },
      offlineCreated: false,
    });

    // 7. Seed Medicines Stock at Sinnar Rural Hospital
    await Medicine.create([
      {
        facilityId: facilitySinnar._id,
        name: "MC1",
        genericName: "MC1",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 1500,
        minimumRequired: 200,
      },
      {
        facilityId: facilitySinnar._id,
        name: "MC3",
        genericName: "MC3",
        strength: "250mg",
        form: "Capsule",
        category: "Antibiotic",
        quantity: 800,
        minimumRequired: 150,
      },
      {
        facilityId: facilitySinnar._id,
        name: "MC2",
        genericName: "MC2",
        strength: "500mg",
        form: "Tablet",
        category: "Oral Antidiabetic",
        quantity: 45, // Under minimum required (low stock alert)
        minimumRequired: 100,
      },
      {
        facilityId: facilitySinnar._id,
        name: "Cetirizine 10mg",
        genericName: "Cetirizine Hydrochloride",
        strength: "10mg",
        form: "Tablet",
        category: "Antihistamine",
        quantity: 0, // Out of stock
        minimumRequired: 100,
      },
      {
        facilityId: facilitySinnar._id,
        name: "ORS Sachet",
        genericName: "Oral Rehydration Salts",
        strength: "21.8g",
        form: "Other",
        category: "Rehydration",
        quantity: 600,
        minimumRequired: 100,
      },
    ]);

    // 8. Create an initial pending Consultation for Ramesh
    const consultationRamesh = await Consultation.create({
      patientId: patientRamesh._id as any,
      doctorId: doctorUser._id as any,
      facilityId: facilitySinnar._id as any,
      healthRecordId: healthRecordRamesh._id as any,
      status: "Scheduled",
      videoRoomName: "jancare-consult-ramesh",
    });

    // 9. Create an initial pending Appointment for Ramesh
    await Appointment.create({
      patientId: patientRamesh._id as any,
      doctorId: doctorUser._id as any,
      facilityId: facilitySinnar._id as any,
      appointmentDate: new Date(),
      status: "Scheduled",
      queueNumber: 4,
      estimatedWaitMinutes: 20,
    });

    // 10. Audit Log seeding
    await AuditLog.create({
      userId: ashaUser._id as any,
      action: "RecordModification",
      patientId: patientRamesh._id as any,
      details: "Registered patient Ramesh Kumar (JC-7F3K92) and logged primary symptoms and vitals.",
      ipAddress: "127.0.0.1",
    });

    // 11. Initial Notifications
    await Notification.create({
      userId: doctorUser._id as any,
      title: "New Priority Case Assigned",
      message: "Ramesh Kumar (54M, Priority) registered at Demo Village SubCenter has been assigned for consultation.",
      type: "Appointment",
    });

    return NextResponse.json({
      success: true,
      message: "JanCare Database successfully seeded with SIH Scenario Ramesh Kumar, clinical inventories, and standard users.",
      details: {
        facilitiesCreated: 2,
        usersCreated: 6,
        patientRameshId: patientRamesh.patientRefId,
        healthRecordId: healthRecordRamesh._id,
        consultationId: consultationRamesh._id,
      },
    });
  } catch (error: any) {
    console.error("Database seeding failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown seeding error" },
      { status: 500 }
    );
  }
}
