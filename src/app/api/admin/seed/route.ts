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
import StockMovement from "@/models/StockMovement";
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
    await StockMovement.deleteMany({});

    // 2. Hash common password "password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // 3. Seed Facilities (District: Nashik & Pune)
    const facilitySinnar = await Facility.create({
      name: "Sinnar CHC-01",
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

    // Seed additional demo facilities (PHC-01, PHC-02, PHC-03, MED-01, MED-02)
    const facilityNashikPHC1 = await Facility.create({
      name: "Nashik PHC-01",
      type: "PHC",
      services: ["General Medicine", "Vaccinations", "Pharmacy"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Demo Village",
      coordinates: { lat: 19.9975, lng: 73.7898 },
      contactNumber: "0253-2441100",
    });

    const facilityNashikPHC2 = await Facility.create({
      name: "Nashik PHC-02",
      type: "PHC",
      services: ["General Medicine", "Maternity Care", "Pharmacy"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Vikaswadi",
      coordinates: { lat: 20.0050, lng: 73.7950 },
      contactNumber: "0253-2441101",
    });

    const facilityNashikMED1 = await Facility.create({
      name: "Nashik MED-01",
      type: "MedicalStore",
      services: ["Generic Drug Dispensation", "Medicine Orders"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Demo Village",
      coordinates: { lat: 19.9920, lng: 73.7850 },
      contactNumber: "0253-2441102",
    });

    const facilityPunePHC1 = await Facility.create({
      name: "Pune PHC-01",
      type: "PHC",
      services: ["General Medicine", "Vaccinations", "Pharmacy"],
      division: "Pune",
      district: "Pune",
      taluka: "Haveli",
      village: "Manjari",
      coordinates: { lat: 18.5204, lng: 73.8567 },
      contactNumber: "020-25501100",
    });

    const facilityPuneMED1 = await Facility.create({
      name: "Pune MED-01",
      type: "MedicalStore",
      services: ["Generic Drug Dispensation", "Medicine Orders"],
      division: "Pune",
      district: "Pune",
      taluka: "Haveli",
      village: "Manjari",
      coordinates: { lat: 18.5230, lng: 73.8580 },
      contactNumber: "020-25501101",
    });

    // 4. Seed Users (ASHA, Doctor, Admin, Patient, MedicineManager)
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

    const medManagerUser = await User.create({
      name: "Pradeep Joshi (Pharmacist)",
      username: "medmanager",
      passwordHash,
      role: "MedicineManager",
      associatedFacility: facilityNashikPHC1._id as any,
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

    // 7. Seed Medicines Stock across facilities
    const seededMedicines = await Medicine.create([
      // Sinnar CHC-01
      {
        facilityId: facilitySinnar._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 1500,
        minimumRequired: 200,
      },
      {
        facilityId: facilitySinnar._id,
        name: "Amoxicillin 250mg",
        genericName: "Amoxicillin",
        strength: "250mg",
        form: "Capsule",
        category: "Antibiotic",
        quantity: 800,
        minimumRequired: 150,
      },
      {
        facilityId: facilitySinnar._id,
        name: "Metformin 500mg",
        genericName: "Metformin",
        strength: "500mg",
        form: "Tablet",
        category: "Oral Antidiabetic",
        quantity: 45,
        minimumRequired: 100,
      },
      {
        facilityId: facilitySinnar._id,
        name: "Cetirizine 10mg",
        genericName: "Cetirizine Hydrochloride",
        strength: "10mg",
        form: "Tablet",
        category: "Antihistamine",
        quantity: 0,
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

      // Nashik PHC-01
      {
        facilityId: facilityNashikPHC1._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 500,
        minimumRequired: 100,
      },
      {
        facilityId: facilityNashikPHC1._id,
        name: "Metformin 500mg",
        genericName: "Metformin",
        strength: "500mg",
        form: "Tablet",
        category: "Oral Antidiabetic",
        quantity: 120,
        minimumRequired: 50,
      },
      {
        facilityId: facilityNashikPHC1._id,
        name: "ORS Sachet",
        genericName: "Oral Rehydration Salts",
        strength: "21.8g",
        form: "Other",
        category: "Rehydration",
        quantity: 250,
        minimumRequired: 50,
      },

      // Nashik PHC-02
      {
        facilityId: facilityNashikPHC2._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 80,
        minimumRequired: 100,
      },
      {
        facilityId: facilityNashikPHC2._id,
        name: "Metformin 500mg",
        genericName: "Metformin",
        strength: "500mg",
        form: "Tablet",
        category: "Oral Antidiabetic",
        quantity: 12,
        minimumRequired: 50,
      },
      {
        facilityId: facilityNashikPHC2._id,
        name: "ORS Sachet",
        genericName: "Oral Rehydration Salts",
        strength: "21.8g",
        form: "Other",
        category: "Rehydration",
        quantity: 0,
        minimumRequired: 50,
      },

      // Nashik MED-01 (Medical Store)
      {
        facilityId: facilityNashikMED1._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 1000,
        minimumRequired: 100,
      },
      {
        facilityId: facilityNashikMED1._id,
        name: "Metformin 500mg",
        genericName: "Metformin",
        strength: "500mg",
        form: "Tablet",
        category: "Oral Antidiabetic",
        quantity: 400,
        minimumRequired: 50,
      },

      // Pune PHC-01
      {
        facilityId: facilityPunePHC1._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 400,
        minimumRequired: 100,
      },

      // Pune MED-01
      {
        facilityId: facilityPuneMED1._id,
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        form: "Tablet",
        category: "Analgesic & Antipyretic",
        quantity: 600,
        minimumRequired: 100,
      }
    ]);

    // Create initial stock movements for auditing
    for (const med of seededMedicines) {
      await StockMovement.create({
        facilityId: med.facilityId,
        medicineId: med._id,
        type: "STOCK_RECEIVED",
        quantity: med.quantity,
        performedBy: medManagerUser._id,
        notes: "Initial deployment stock seeding.",
      });
    }

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
        facilitiesCreated: 7,
        usersCreated: 7,
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
