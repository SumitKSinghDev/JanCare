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
    const facilitySinnar: any = await Facility.create({
      name: "Sinnar CHC-01",
      type: "CHC",
      services: ["General Medicine", "Pediatrics", "Maternity", "Diagnostics", "Telemedicine", "ICU Stabilization"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Sinnar Town",
      coordinates: { lat: 19.8517, lng: 74.0006 },
      contactNumber: "02551-220033",
    });

    const facilitySubCenter: any = await Facility.create({
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

    const facilityNashikPHC1: any = await Facility.create({
      name: "Nashik PHC-01",
      type: "PHC",
      services: ["General Medicine", "Vaccinations", "Pharmacy", "Teleconsultation"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Demo Village",
      coordinates: { lat: 19.9975, lng: 73.7898 },
      contactNumber: "0253-2441100",
    });

    const facilityNashikPHC2: any = await Facility.create({
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

    const facilityIgatpuriPHC: any = await Facility.create({
      name: "Igatpuri Tribal PHC-03",
      type: "PHC",
      services: ["Emergency Trauma", "Anti-Snake Venom", "Maternal Care", "Teleconsultation"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Igatpuri",
      village: "Igatpuri Rural",
      coordinates: { lat: 19.6967, lng: 73.5621 },
      contactNumber: "02553-244220",
    });

    const facilityNashikCivil: any = await Facility.create({
      name: "Nashik District Civil Hospital",
      type: "DH",
      services: ["Tertiary Trauma ICU", "Cardiology", "Neurology", "Specialized Surgery", "Central Blood Bank"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Nashik City",
      coordinates: { lat: 20.0110, lng: 73.7900 },
      contactNumber: "0253-2576106",
    });

    const facilityNashikMED1: any = await Facility.create({
      name: "Nashik MED-01 (Jan Aushadhi Kendra)",
      type: "MedicalStore",
      services: ["Generic Drug Dispensation", "PMBJP Generic Substitution", "Medicine Orders"],
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Demo Village",
      coordinates: { lat: 19.9920, lng: 73.7850 },
      contactNumber: "0253-2441102",
    });

    const facilityPunePHC1: any = await Facility.create({
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

    const facilityPuneMED1: any = await Facility.create({
      name: "Pune MED-01 (Jan Aushadhi Kendra)",
      type: "MedicalStore",
      services: ["Generic Drug Dispensation", "Medicine Orders"],
      division: "Pune",
      district: "Pune",
      taluka: "Haveli",
      village: "Manjari",
      coordinates: { lat: 18.5230, lng: 73.8580 },
      contactNumber: "020-25501101",
    });

    // 4. Seed Standard Platform Users
    const ashaUser: any = await User.create({
      name: "Sharda Patil",
      username: "asha",
      passwordHash,
      role: "ASHA",
      associatedFacility: facilitySubCenter._id,
    });

    const doctorUser: any = await User.create({
      name: "Dr. Aniruddha Kulkarni",
      username: "doctor",
      passwordHash,
      role: "Doctor",
      associatedFacility: facilitySinnar._id,
    });

    const specialistUser: any = await User.create({
      name: "Dr. Smita Rao (Cardiologist)",
      username: "specialist",
      passwordHash,
      role: "Specialist",
      associatedFacility: facilityNashikCivil._id,
    });

    const facilityAdmin: any = await User.create({
      name: "Meera Deshmukh",
      username: "facilityadmin",
      passwordHash,
      role: "FacilityAdmin",
      associatedFacility: facilitySinnar._id,
    });

    const districtAdmin: any = await User.create({
      name: "Collector Nashik (District Admin)",
      username: "districtadmin",
      passwordHash,
      role: "DistrictAdmin",
    });

    const systemAdmin: any = await User.create({
      name: "JanCare System Administrator",
      username: "admin",
      passwordHash,
      role: "SystemAdmin",
    });

    const patientUser: any = await User.create({
      name: "Ramesh Kumar",
      username: "patient",
      passwordHash,
      role: "Patient",
    });

    // Also seed user accounts for other patients to allow direct phone/username logins
    await User.create([
      { name: "Ramesh Kumar", username: "9822114400", passwordHash, role: "Patient" },
      { name: "Sunita Patil", username: "9822114402", passwordHash, role: "Patient" },
      { name: "Ganesh Shinde", username: "9822114404", passwordHash, role: "Patient" },
      { name: "Kavita Jadhav", username: "9822114406", passwordHash, role: "Patient" },
      { name: "Arjun More", username: "9822114408", passwordHash, role: "Patient" },
      { name: "Meena Wagh", username: "9822114410", passwordHash, role: "Patient" },
    ]);

    const medManagerUser: any = await User.create({
      name: "Pradeep Joshi (Chief Pharmacist)",
      username: "medmanager",
      passwordHash,
      role: "MedicineManager",
      associatedFacility: facilityNashikMED1._id,
    });

    // 5. Seed Multiple Demo Patients
    const patientRamesh: any = await Patient.create({
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
      emergencyContact: { name: "Sunita Kumar", relation: "Spouse", mobile: "9822114401" },
      abhaLinked: true,
      registeredBy: ashaUser._id,
    });

    const patientSunita: any = await Patient.create({
      patientRefId: "JC-9M2X41",
      name: "Sunita Patil",
      age: 42,
      dateOfBirth: new Date("1984-08-20"),
      gender: "Female",
      mobile: "9822114402",
      email: "sunita.patil@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Igatpuri",
      village: "Igatpuri Rural",
      preferredLanguage: "Marathi",
      emergencyContact: { name: "Kishore Patil", relation: "Husband", mobile: "9822114403" },
      abhaLinked: true,
      registeredBy: ashaUser._id,
    });

    const patientGanesh: any = await Patient.create({
      patientRefId: "JC-4K8P19",
      name: "Ganesh Shinde",
      age: 29,
      dateOfBirth: new Date("1997-02-10"),
      gender: "Male",
      mobile: "9822114404",
      email: "ganesh.shinde@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Sinnar Town",
      preferredLanguage: "Hindi",
      emergencyContact: { name: "Pooja Shinde", relation: "Sister", mobile: "9822114405" },
      abhaLinked: false,
      registeredBy: ashaUser._id,
    });

    const patientKavita: any = await Patient.create({
      patientRefId: "JC-3B7L88",
      name: "Kavita Jadhav",
      age: 67,
      dateOfBirth: new Date("1959-11-05"),
      gender: "Female",
      mobile: "9822114406",
      email: "kavita.jadhav@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Vikaswadi",
      preferredLanguage: "Marathi",
      emergencyContact: { name: "Rahul Jadhav", relation: "Son", mobile: "9822114407" },
      abhaLinked: true,
      registeredBy: ashaUser._id,
    });

    const patientArjun: any = await Patient.create({
      patientRefId: "JC-6N1D52",
      name: "Arjun More",
      age: 7,
      dateOfBirth: new Date("2019-06-12"),
      gender: "Male",
      mobile: "9822114408",
      email: "arjun.more@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Sinnar",
      village: "Demo Village",
      preferredLanguage: "Marathi",
      emergencyContact: { name: "Suresh More", relation: "Father", mobile: "9822114409" },
      abhaLinked: false,
      registeredBy: ashaUser._id,
    });

    const patientMeena: any = await Patient.create({
      patientRefId: "JC-8T4H33",
      name: "Meena Wagh",
      age: 32,
      dateOfBirth: new Date("1994-03-25"),
      gender: "Female",
      mobile: "9822114410",
      email: "meena.wagh@fictional.com",
      state: "Maharashtra",
      division: "Nashik",
      district: "Nashik",
      taluka: "Nashik",
      village: "Vikaswadi",
      preferredLanguage: "Marathi",
      emergencyContact: { name: "Nitin Wagh", relation: "Husband", mobile: "9822114411" },
      abhaLinked: true,
      registeredBy: ashaUser._id,
    });

    // 6. Seed Clinical Health Records (Vitals & Symptom Triages)
    const healthRecordRamesh: any = await HealthRecord.create({
      patientId: patientRamesh._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 102.2, bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 88, spo2: 96, respiratoryRate: 18 },
      symptoms: [
        { name: "Acute Febrile Illness / Fever", durationDays: 3, severity: "Severe" },
        { name: "Weakness & Fatigue", durationDays: 3, severity: "Moderate" },
        { name: "Dizziness", durationDays: 2, severity: "Moderate" },
      ],
      triage: {
        level: "Priority",
        reason: "Elevated body temperature (102.2°F) with moderate systemic dizziness in 54M patient.",
        aiExplanation: "Patient demonstrates priority symptoms with elevated body temperature (102.2°F). Scheduled for physician teleconsultation.",
        recommendedFacilityId: facilitySinnar._id,
      },
      offlineCreated: false,
    });

    const healthRecordSunita: any = await HealthRecord.create({
      patientId: patientSunita._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 99.1, bloodPressureSystolic: 175, bloodPressureDiastolic: 105, heartRate: 104, spo2: 94, respiratoryRate: 22 },
      symptoms: [
        { name: "Chest Pain & Pressure", durationDays: 1, severity: "Severe" },
        { name: "Shortness of Breath", durationDays: 1, severity: "Severe" },
        { name: "Hypertensive Crisis", durationDays: 1, severity: "Severe" },
      ],
      triage: {
        level: "Urgent",
        reason: "Acute chest pain with severe Stage 2 Hypertension (175/105 mmHg) and tachycardia.",
        aiExplanation: "Red-flag cardiovascular symptoms detected. Urgent tele-escalation to on-duty cardiologist initiated.",
        recommendedFacilityId: facilityNashikCivil._id,
      },
      offlineCreated: false,
    });

    const healthRecordGanesh: any = await HealthRecord.create({
      patientId: patientGanesh._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 98.4, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, heartRate: 74, spo2: 99, respiratoryRate: 16 },
      symptoms: [
        { name: "Dry Cough & Rhinorrhea", durationDays: 4, severity: "Mild" },
        { name: "Nasal Congestion", durationDays: 4, severity: "Mild" },
      ],
      triage: {
        level: "Routine",
        reason: "Mild upper respiratory allergic symptoms without fever or respiratory distress.",
        aiExplanation: "Routine outpatient checkup suitable for PHC pharmacy dispensing.",
        recommendedFacilityId: facilitySinnar._id,
      },
      offlineCreated: false,
    });

    const healthRecordKavita: any = await HealthRecord.create({
      patientId: patientKavita._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 98.6, bloodPressureSystolic: 138, bloodPressureDiastolic: 86, heartRate: 80, spo2: 97, respiratoryRate: 17 },
      symptoms: [
        { name: "Uncontrolled Hyperglycemia", durationDays: 7, severity: "Moderate" },
        { name: "Peripheral Foot Tingling", durationDays: 14, severity: "Moderate" },
      ],
      triage: {
        level: "Priority",
        reason: "Chronic Type 2 Diabetes with high fasting glucose (210 mg/dL) and early diabetic neuropathy.",
        aiExplanation: "Priority consultation required for Metformin dosage adjustment and generic PMBJP substitution.",
        recommendedFacilityId: facilityNashikPHC1._id,
      },
      offlineCreated: false,
    });

    const healthRecordArjun: any = await HealthRecord.create({
      patientId: patientArjun._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 103.8, bloodPressureSystolic: 95, bloodPressureDiastolic: 60, heartRate: 128, spo2: 95, respiratoryRate: 28 },
      symptoms: [
        { name: "Pediatric High Fever (>103°F)", durationDays: 2, severity: "Severe" },
        { name: "Acute Vomiting & Diarrhea", durationDays: 2, severity: "Severe" },
      ],
      triage: {
        level: "Urgent",
        reason: "Pediatric hyperpyrexia (103.8°F) with moderate-to-severe dehydration.",
        aiExplanation: "Pediatric emergency protocol triggered. Rapid ORS hydration and CHC inpatient referral advised.",
        recommendedFacilityId: facilitySinnar._id,
      },
      offlineCreated: false,
    });

    const healthRecordMeena: any = await HealthRecord.create({
      patientId: patientMeena._id,
      recordedBy: ashaUser._id,
      vitals: { temperature: 98.6, bloodPressureSystolic: 112, bloodPressureDiastolic: 72, heartRate: 78, spo2: 99, respiratoryRate: 16 },
      symptoms: [
        { name: "Routine Antenatal Care (2nd Trimester)", durationDays: 1, severity: "Mild" },
      ],
      triage: {
        level: "Routine",
        reason: "Routine 24-week ANC follow-up checkup. Vitals within healthy parameters.",
        aiExplanation: "Routine maternal care visit. Iron-folic acid and calcium refill authorized.",
        recommendedFacilityId: facilityNashikPHC2._id,
      },
      offlineCreated: false,
    });

    // 7. Seed Medicines & Critical Inventories across facilities
    const seededMedicines: any[] = await Medicine.insertMany([
      // Sinnar CHC-01
      { facilityId: facilitySinnar._id, name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 1500, minimumRequired: 200 },
      { facilityId: facilitySinnar._id, name: "Amoxicillin 250mg", genericName: "Amoxicillin", strength: "250mg", form: "Capsule", category: "Antibiotic", quantity: 800, minimumRequired: 150 },
      { facilityId: facilitySinnar._id, name: "Metformin 500mg", genericName: "Metformin", strength: "500mg", form: "Tablet", category: "Oral Antidiabetic", quantity: 45, minimumRequired: 100 },
      { facilityId: facilitySinnar._id, name: "Cetirizine 10mg", genericName: "Cetirizine Hydrochloride", strength: "10mg", form: "Tablet", category: "Antihistamine", quantity: 0, minimumRequired: 100 },
      { facilityId: facilitySinnar._id, name: "ORS Sachet", genericName: "Oral Rehydration Salts", strength: "21.8g", form: "Other", category: "Rehydration", quantity: 600, minimumRequired: 100 },
      { facilityId: facilitySinnar._id, name: "Polyvalent Anti-Snake Venom (ASV)", genericName: "Anti-Snake Venom", strength: "10ml Vial", form: "Injection", category: "Antidote", quantity: 12, minimumRequired: 10 },
      { facilityId: facilitySinnar._id, name: "Amlodipine 5mg", genericName: "Amlodipine Besylate", strength: "5mg", form: "Tablet", category: "Antihypertensive", quantity: 450, minimumRequired: 80 },

      // Igatpuri Tribal PHC-03 (Critical Shortage Showcase)
      { facilityId: facilityIgatpuriPHC._id, name: "Polyvalent Anti-Snake Venom (ASV)", genericName: "Anti-Snake Venom", strength: "10ml Vial", form: "Injection", category: "Antidote", quantity: 2, minimumRequired: 15 },
      { facilityId: facilityIgatpuriPHC._id, name: "ORS Sachet", genericName: "Oral Rehydration Salts", strength: "21.8g", form: "Other", category: "Rehydration", quantity: 25, minimumRequired: 150 },
      { facilityId: facilityIgatpuriPHC._id, name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 300, minimumRequired: 100 },

      // Nashik PHC-01
      { facilityId: facilityNashikPHC1._id, name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 500, minimumRequired: 100 },
      { facilityId: facilityNashikPHC1._id, name: "Metformin 500mg", genericName: "Metformin", strength: "500mg", form: "Tablet", category: "Oral Antidiabetic", quantity: 120, minimumRequired: 50 },
      { facilityId: facilityNashikPHC1._id, name: "ORS Sachet", genericName: "Oral Rehydration Salts", strength: "21.8g", form: "Other", category: "Rehydration", quantity: 250, minimumRequired: 50 },
      { facilityId: facilityNashikPHC1._id, name: "Iron & Folic Acid (IFA)", genericName: "Ferrous Ascorbate + Folic Acid", strength: "100mg + 1.5mg", form: "Tablet", category: "Nutritional Supplement", quantity: 800, minimumRequired: 200 },

      // Nashik PHC-02
      { facilityId: facilityNashikPHC2._id, name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 80, minimumRequired: 100 },
      { facilityId: facilityNashikPHC2._id, name: "Metformin 500mg", genericName: "Metformin", strength: "500mg", form: "Tablet", category: "Oral Antidiabetic", quantity: 12, minimumRequired: 50 },
      { facilityId: facilityNashikPHC2._id, name: "ORS Sachet", genericName: "Oral Rehydration Salts", strength: "21.8g", form: "Other", category: "Rehydration", quantity: 0, minimumRequired: 50 },

      // Nashik MED-01 (Jan Aushadhi Kendra - PMBJP Store)
      { facilityId: facilityNashikMED1._id, name: "Paracetamol 500mg (PMBJP Generic)", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 2400, minimumRequired: 200 },
      { facilityId: facilityNashikMED1._id, name: "Metformin 500mg (PMBJP Generic)", genericName: "Metformin", strength: "500mg", form: "Tablet", category: "Oral Antidiabetic", quantity: 1100, minimumRequired: 100 },
      { facilityId: facilityNashikMED1._id, name: "Amlodipine 5mg (PMBJP Generic)", genericName: "Amlodipine Besylate", strength: "5mg", form: "Tablet", category: "Antihypertensive", quantity: 900, minimumRequired: 100 },
      { facilityId: facilityNashikMED1._id, name: "Azithromycin 500mg (PMBJP Generic)", genericName: "Azithromycin", strength: "500mg", form: "Tablet", category: "Antibiotic", quantity: 650, minimumRequired: 80 },

      // Pune PHC-01 & MED-01
      { facilityId: facilityPunePHC1._id, name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 400, minimumRequired: 100 },
      { facilityId: facilityPuneMED1._id, name: "Paracetamol 500mg (PMBJP Generic)", genericName: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic & Antipyretic", quantity: 1200, minimumRequired: 100 }
    ]);

    // Initial Stock Movements
    for (const med of seededMedicines) {
      await StockMovement.create({
        facilityId: med.facilityId,
        medicineId: med._id,
        type: "STOCK_RECEIVED",
        quantity: med.quantity,
        performedBy: medManagerUser._id,
        notes: "District Central Medical Depot allocation & verified intake.",
      });
    }

    // Seed Active & Dispensed Reservations
    if (seededMedicines.length >= 4) {
      await StockMovement.create([
        {
          facilityId: facilityNashikMED1._id,
          medicineId: seededMedicines[6]._id, // Paracetamol PMBJP
          type: "RESERVED",
          quantity: -2,
          performedBy: patientUser._id,
          notes: `Reserved by patient Ramesh Kumar (Ref ID: JC-7F3K92) [Token: JC-MED-7821] via Patient Portal`,
        },
        {
          facilityId: facilitySinnar._id,
          medicineId: seededMedicines[2]._id, // Amlodipine
          type: "RESERVED",
          quantity: -1,
          performedBy: ashaUser._id,
          notes: `Reserved by patient Sunita Patil (Ref ID: JC-9M2X41) [Token: JC-MED-5514] via Patient Portal`,
        },
        {
          facilityId: facilityNashikPHC1._id,
          medicineId: seededMedicines[4]._id, // Paracetamol 500mg
          type: "RESERVED",
          quantity: -1,
          performedBy: doctorUser._id,
          notes: `Reserved by patient Ganesh Shinde (Ref ID: JC-4K8P19) [Token: JC-MED-3209] via Doctor Consultation Prescription`,
        },
        {
          facilityId: facilityNashikMED1._id,
          medicineId: seededMedicines[7]._id, // Metformin PMBJP
          type: "DISPENSED",
          quantity: -2,
          performedBy: medManagerUser._id,
          notes: `Reserved by patient Kavita Jadhav (Ref ID: JC-3B7L88) [Token: JC-MED-9042] | Dispensed by Pharmacist Pradeep Joshi`,
        }
      ]);
    }

    // 8. Seed Consultations across Doctor Queue
    const consultationRamesh: any = await Consultation.create({
      patientId: patientRamesh._id,
      doctorId: doctorUser._id,
      facilityId: facilitySinnar._id,
      healthRecordId: healthRecordRamesh._id,
      status: "Scheduled",
      videoRoomName: "jancare-consult-ramesh-7f3k",
      clinicalNotes: "Scheduled for primary clinical evaluation of febrile illness.",
    });

    const consultationSunita: any = await Consultation.create({
      patientId: patientSunita._id,
      doctorId: specialistUser._id,
      facilityId: facilityNashikCivil._id,
      healthRecordId: healthRecordSunita._id,
      status: "Active",
      videoRoomName: "jancare-consult-sunita-9m2x",
      clinicalNotes: "Urgent telecardiology consult. Patient presenting with severe hypertension (175/105) and chest tightness.",
    });

    const consultationKavita: any = await Consultation.create({
      patientId: patientKavita._id,
      doctorId: doctorUser._id,
      facilityId: facilityNashikPHC1._id,
      healthRecordId: healthRecordKavita._id,
      status: "Scheduled",
      videoRoomName: "jancare-consult-kavita-3b7l",
      clinicalNotes: "Diabetic management checkup and PMBJP generic drug substitution review.",
    });

    const consultationArjun: any = await Consultation.create({
      patientId: patientArjun._id,
      doctorId: doctorUser._id,
      facilityId: facilitySinnar._id,
      healthRecordId: healthRecordArjun._id,
      status: "Scheduled",
      videoRoomName: "jancare-consult-arjun-6n1d",
      clinicalNotes: "Urgent pediatric teleconsultation for high fever (103.8°F) and dehydration.",
    });

    const consultationGanesh: any = await Consultation.create({
      patientId: patientGanesh._id,
      doctorId: doctorUser._id,
      facilityId: facilitySinnar._id,
      healthRecordId: healthRecordGanesh._id,
      status: "Completed",
      videoRoomName: "jancare-consult-ganesh-4k8p",
      clinicalNotes: "Upper respiratory allergy confirmed. Prescribed Cetirizine and warm saline steam.",
      diagnosis: "Acute Allergic Rhinitis (J30.9)",
      durationSeconds: 420,
    });

    // 9. Seed Appointments across facilities
    await Appointment.insertMany([
      { patientId: patientRamesh._id, doctorId: doctorUser._id, facilityId: facilitySinnar._id, appointmentDate: new Date(), appointmentTime: "11:30 AM", status: "Scheduled", queueNumber: 1, estimatedWaitMinutes: 10, bookingSource: "AI_ASSISTANT" },
      { patientId: patientSunita._id, doctorId: specialistUser._id, facilityId: facilityNashikCivil._id, appointmentDate: new Date(), appointmentTime: "11:45 AM", status: "Scheduled", queueNumber: 2, estimatedWaitMinutes: 15, bookingSource: "MANUAL" },
      { patientId: patientArjun._id, doctorId: doctorUser._id, facilityId: facilitySinnar._id, appointmentDate: new Date(), appointmentTime: "12:00 PM", status: "Scheduled", queueNumber: 3, estimatedWaitMinutes: 25, bookingSource: "MANUAL" },
      { patientId: patientKavita._id, doctorId: doctorUser._id, facilityId: facilityNashikPHC1._id, appointmentDate: new Date(), appointmentTime: "02:00 PM", status: "Scheduled", queueNumber: 4, estimatedWaitMinutes: 35, bookingSource: "PATIENT_PORTAL" },
      { patientId: patientMeena._id, doctorId: doctorUser._id, facilityId: facilityNashikPHC2._id, appointmentDate: new Date(), appointmentTime: "04:00 PM", status: "Scheduled", queueNumber: 5, estimatedWaitMinutes: 50, bookingSource: "MANUAL" },
    ]);

    // 10. Seed Referrals (PHC -> CHC -> District Hospital)
    await Referral.insertMany([
      {
        patientId: patientSunita._id,
        referringDoctorId: doctorUser._id,
        referringFacilityId: facilityIgatpuriPHC._id,
        destinationFacilityId: facilityNashikCivil._id,
        assignedAshaId: ashaUser._id,
        reason: "Severe Acute Chest Pain & Hypertensive Crisis (BP 175/105) requiring 24/7 Cardiology ICU.",
        priority: "Urgent",
        instructions: "Immediate 108 ambulance transport with cardiac telemetry pre-notification.",
        status: "Created",
      },
      {
        patientId: patientArjun._id,
        referringDoctorId: doctorUser._id,
        referringFacilityId: facilitySubCenter._id,
        destinationFacilityId: facilitySinnar._id,
        assignedAshaId: ashaUser._id,
        reason: "Pediatric hyperpyrexia (103.8°F) with acute gastroenteritis requiring IV rehydration.",
        priority: "Urgent",
        instructions: "Stabilize with oral rehydration salts during transit.",
        status: "AppointmentBooked",
      },
      {
        patientId: patientKavita._id,
        referringDoctorId: doctorUser._id,
        referringFacilityId: facilityNashikPHC2._id,
        destinationFacilityId: facilityNashikPHC1._id,
        assignedAshaId: ashaUser._id,
        reason: "Diabetic Foot & Retinopathy Screening in specialized NCD clinic.",
        priority: "Routine",
        instructions: "Fasting blood sugar test to be conducted on arrival.",
        status: "PatientArrived",
      },
      {
        patientId: patientRamesh._id,
        referringDoctorId: doctorUser._id,
        referringFacilityId: facilitySubCenter._id,
        destinationFacilityId: facilitySinnar._id,
        assignedAshaId: ashaUser._id,
        reason: "Persistent febrile illness (102.2°F) and dizziness requiring CBC and Widal diagnostics.",
        priority: "Routine",
        instructions: "Blood smear and rapid malaria/dengue diagnostic kit evaluation.",
        status: "Completed",
      },
    ]);

    // 11. Seed Follow-ups (ASHA Doorstep Care Coordination)
    await FollowUp.insertMany([
      {
        patientId: patientRamesh._id,
        assignedWorkerId: ashaUser._id,
        type: "Medication",
        dueDate: new Date(Date.now() + 86400000 * 2),
        status: "Upcoming",
        notes: "Verify Paracetamol and antibiotic compliance. Log morning temperature and check dizziness resolution.",
      },
      {
        patientId: patientSunita._id,
        assignedWorkerId: ashaUser._id,
        type: "PostReferral",
        dueDate: new Date(Date.now() + 86400000 * 1),
        status: "Due",
        notes: "Post-cardiac teleconsultation follow-up. Check home BP measurement (target < 130/80 mmHg).",
      },
      {
        patientId: patientKavita._id,
        assignedWorkerId: ashaUser._id,
        type: "ChronicDisease",
        dueDate: new Date(Date.now() + 86400000 * 5),
        status: "Upcoming",
        notes: "Monthly NCD diabetes audit. Check fasting sugar log and verify PMBJP generic Metformin compliance.",
      },
      {
        patientId: patientArjun._id,
        assignedWorkerId: ashaUser._id,
        type: "Child",
        dueDate: new Date(Date.now() + 86400000 * 1),
        status: "Due",
        notes: "Pediatric recovery check. Verify ORS intake and urine output frequency.",
      },
      {
        patientId: patientMeena._id,
        assignedWorkerId: ashaUser._id,
        type: "Maternal",
        dueDate: new Date(Date.now() - 86400000 * 3),
        completedDate: new Date(Date.now() - 86400000 * 2),
        status: "Completed",
        notes: "24-week ANC home visit. Hemoglobin checked (11.4 g/dL), IFA tablets distributed.",
      },
    ]);

    // 12. Seed Prescriptions (with PMBJP Generic Match)
    await Prescription.insertMany([
      {
        consultationId: consultationRamesh._id,
        patientId: patientRamesh._id,
        doctorId: doctorUser._id,
        medicines: [
          { name: "Paracetamol 500mg", genericName: "Paracetamol", strength: "500mg", form: "Tablet", dosage: "1-1-1 (TID)", durationDays: 3, instructions: "After Food" },
          { name: "Amoxicillin 250mg", genericName: "Amoxicillin", strength: "250mg", form: "Capsule", dosage: "1-0-1 (BID)", durationDays: 5, instructions: "After Food" },
          { name: "ORS Sachet", genericName: "Oral Rehydration Salts", strength: "21.8g", form: "Other", dosage: "1 packet in 1L water", durationDays: 3, instructions: "As Needed" }
        ],
        additionalInstructions: "Acute Viral Febrile Illness with Mild Dehydration. Maintain adequate hydration and rest.",
      },
      {
        consultationId: consultationKavita._id,
        patientId: patientKavita._id,
        doctorId: doctorUser._id,
        medicines: [
          { name: "Metformin 500mg (PMBJP Generic)", genericName: "Metformin Hydrochloride", strength: "500mg", form: "Tablet", dosage: "1-0-1 (BID)", durationDays: 30, instructions: "After Food" },
          { name: "Amlodipine 5mg (PMBJP Generic)", genericName: "Amlodipine Besylate", strength: "5mg", form: "Tablet", dosage: "1-0-0 (OD)", durationDays: 30, instructions: "Before Food" }
        ],
        additionalInstructions: "Type 2 Diabetes Mellitus with Essential Hypertension. PMBJP generic drug substitution authorized.",
      },
      {
        consultationId: consultationGanesh._id,
        patientId: patientGanesh._id,
        doctorId: doctorUser._id,
        medicines: [
          { name: "Cetirizine 10mg", genericName: "Cetirizine Hydrochloride", strength: "10mg", form: "Tablet", dosage: "0-0-1 (Night)", durationDays: 5, instructions: "After Food" }
        ],
        additionalInstructions: "Acute Allergic Rhinitis. Steam inhalation twice daily.",
      }
    ]);

    // 13. Seed Comprehensive Audit Logs (ABDM, CDSS, Telemedicine, Triage, Pharmacy)
    await AuditLog.insertMany([
      { userId: ashaUser._id, action: "RecordModification", patientId: patientRamesh._id, details: "ASHA Sharda Patil registered patient Ramesh Kumar (JC-7F3K92) and logged primary vitals.", ipAddress: "192.168.1.101" },
      { userId: doctorUser._id, action: "RecordAccess", patientId: patientRamesh._id, details: "Dr. Aniruddha Kulkarni reviewed clinical triage record via ABDM NDHB Consent Token.", ipAddress: "192.168.1.102" },
      { userId: specialistUser._id, action: "RecordAccess", patientId: patientSunita._id, details: "Urgent red-flag triage alert: Sunita Patil escalated to Emergency Cardiology Room (Nashik Civil).", ipAddress: "192.168.1.103" },
      { userId: medManagerUser._id, action: "RecordModification", details: "Pradeep Joshi dispensed 30-day PMBJP generic Metformin & Amlodipine to patient Kavita Jadhav.", ipAddress: "192.168.1.104" },
      { userId: systemAdmin._id, action: "AdminAccess", details: "AI Epidemiological Radar detected Sinnar Dengue Cluster (+24% surge). Rapid Response Team notified.", ipAddress: "10.0.0.1" },
      { userId: districtAdmin._id, action: "AdminAccess", details: "District Collector Nashik authorized emergency chlorine tablet dispatch to Igatpuri Subcenters.", ipAddress: "10.0.0.2" },
    ]);

    // 14. Initial Notifications
    await Notification.insertMany([
      { userId: doctorUser._id, title: "New Priority Case Assigned", message: "Ramesh Kumar (54M, Priority) registered at Demo Village SubCenter has been assigned for consultation.", type: "Appointment" },
      { userId: specialistUser._id, title: "🚨 Urgent Cardiac Escalation", message: "Sunita Patil (42F, Urgent BP 175/105) pre-notified to Trauma Casualty unit.", type: "Appointment" },
      { userId: ashaUser._id, title: "Follow-up Visit Due", message: "Day-2 pediatric hydration check due for Arjun More in Demo Village.", type: "FollowUp" },
      { userId: medManagerUser._id, title: "⚠️ Critical Drug Shortage Alert", message: "Anti-Snake Venom (ASV) and ORS inventory below safety threshold at Igatpuri PHC-03.", type: "MedicineStock" },
    ]);

    return NextResponse.json({
      success: true,
      message: "JanCare Database successfully seeded with 6 Patients, 9 Facilities, Consultations, Referrals, Follow-ups, Audit Logs, and Medicines.",
      details: {
        facilitiesCreated: 9,
        usersCreated: 8,
        patientsCreated: 6,
        consultationsCreated: 5,
        appointmentsCreated: 5,
        referralsCreated: 4,
        followUpsCreated: 5,
        prescriptionsCreated: 3,
        auditLogsCreated: 6,
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
