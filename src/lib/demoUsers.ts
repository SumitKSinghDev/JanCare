export interface DemoUser {
  id: string;
  name: string;
  username: string;
  role: string;
  specialization?: string;
  facilityName?: string;
  associatedFacility?: any;
  patientId?: string;
  patientRefId?: string;
  age?: number;
  gender?: string;
  mobile?: string;
  division?: string;
  district?: string;
  taluka?: string;
  village?: string;
  abhaLinked?: boolean;
  abhaNumber?: string;
  bloodGroup?: string;
  isOfflineDemo?: boolean;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  patient: {
    id: "demo-patient-01",
    name: "Ramesh Kumar",
    username: "patient",
    role: "Patient",
    patientId: "demo-patient-01",
    patientRefId: "JC-7F3K92",
    age: 54,
    gender: "Male",
    mobile: "9822114400",
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Demo Village",
    bloodGroup: "O+",
    abhaLinked: true,
    abhaNumber: "91-4582-9012-7734",
    associatedFacility: {
      _id: "demo-facility-sinnar",
      name: "Sinnar CHC-01",
      type: "CHC",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  doctor: {
    id: "demo-doctor-01",
    name: "Dr. Aniruddha Kulkarni",
    username: "doctor",
    role: "Doctor",
    specialization: "General Medicine",
    facilityName: "Sinnar Rural CHC",
    associatedFacility: {
      _id: "demo-facility-sinnar",
      name: "Sinnar CHC-01",
      type: "CHC",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  asha: {
    id: "demo-asha-01",
    name: "Sharda Patil",
    username: "asha",
    role: "ASHA",
    village: "Demo Village",
    facilityName: "Demo Village Health SubCenter",
    associatedFacility: {
      _id: "demo-facility-subcenter",
      name: "Demo Village Health SubCenter",
      type: "SubCenter",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  specialist: {
    id: "demo-specialist-01",
    name: "Dr. Smita Rao (Cardiologist)",
    username: "specialist",
    role: "Specialist",
    specialization: "Cardiology",
    facilityName: "Nashik District Civil Hospital",
    associatedFacility: {
      _id: "demo-facility-civil",
      name: "Nashik District Civil Hospital",
      type: "DH",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  medmanager: {
    id: "demo-medmanager-01",
    name: "Pradeep Joshi (Chief Pharmacist)",
    username: "medmanager",
    role: "MedicineManager",
    facilityName: "Nashik MED-01 (Jan Aushadhi Kendra)",
    associatedFacility: {
      _id: "demo-facility-med1",
      name: "Nashik MED-01 (Jan Aushadhi Kendra)",
      type: "MedicalStore",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  facilityadmin: {
    id: "demo-facilityadmin-01",
    name: "Meera Deshmukh",
    username: "facilityadmin",
    role: "FacilityAdmin",
    facilityName: "Sinnar CHC-01",
    associatedFacility: {
      _id: "demo-facility-sinnar",
      name: "Sinnar CHC-01",
      type: "CHC",
      district: "Nashik",
    },
    isOfflineDemo: true,
  },
  districtadmin: {
    id: "demo-districtadmin-01",
    name: "Collector Nashik (District Admin)",
    username: "districtadmin",
    role: "DistrictAdmin",
    district: "Nashik",
    isOfflineDemo: true,
  },
  admin: {
    id: "demo-admin-01",
    name: "JanCare System Administrator",
    username: "admin",
    role: "SystemAdmin",
    isOfflineDemo: true,
  },
};

export const DEMO_FACILITIES = [
  {
    _id: "demo-facility-sinnar",
    name: "Sinnar CHC-01",
    type: "CHC",
    services: ["General Medicine", "Pediatrics", "Maternity", "Diagnostics", "Telemedicine", "ICU Stabilization"],
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Sinnar Town",
    coordinates: { lat: 19.8517, lng: 74.0006 },
    contactNumber: "02551-220033",
  },
  {
    _id: "demo-facility-subcenter",
    name: "Demo Village Health SubCenter",
    type: "SubCenter",
    services: ["Primary Care", "Maternal Health", "Immunization", "First Aid"],
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Demo Village",
    coordinates: { lat: 19.8654, lng: 74.0123 },
    contactNumber: "02551-220044",
  },
  {
    _id: "demo-facility-phc1",
    name: "Nashik PHC-01",
    type: "PHC",
    services: ["General Medicine", "Vaccinations", "Pharmacy", "Teleconsultation"],
    division: "Nashik",
    district: "Nashik",
    taluka: "Nashik",
    village: "Demo Village",
    coordinates: { lat: 19.9975, lng: 73.7898 },
    contactNumber: "0253-2441100",
  },
  {
    _id: "demo-facility-civil",
    name: "Nashik District Civil Hospital",
    type: "DH",
    services: ["Tertiary Trauma ICU", "Cardiology", "Neurology", "Specialized Surgery", "Central Blood Bank"],
    division: "Nashik",
    district: "Nashik",
    taluka: "Nashik",
    village: "Nashik City",
    coordinates: { lat: 20.0110, lng: 73.7900 },
    contactNumber: "0253-2576106",
  },
  {
    _id: "demo-facility-med1",
    name: "Nashik MED-01 (Jan Aushadhi Kendra)",
    type: "MedicalStore",
    services: ["Generic Drug Dispensation", "PMBJP Generic Substitution", "Medicine Orders"],
    division: "Nashik",
    district: "Nashik",
    taluka: "Nashik",
    village: "Demo Village",
    coordinates: { lat: 19.9920, lng: 73.7850 },
    contactNumber: "0253-2441102",
  },
];

export const DEMO_PATIENTS = [
  {
    _id: "demo-patient-01",
    patientRefId: "JC-7F3K92",
    name: "Ramesh Kumar",
    age: 54,
    gender: "Male",
    mobile: "9822114400",
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Demo Village",
    bloodGroup: "O+",
    abhaLinked: true,
    abhaNumber: "91-4582-9012-7734",
  },
  {
    _id: "demo-patient-02",
    patientRefId: "JC-9M2X41",
    name: "Sunita Patil",
    age: 42,
    gender: "Female",
    mobile: "9822114402",
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Demo Village",
    bloodGroup: "B+",
    abhaLinked: true,
    abhaNumber: "91-7712-4091-8821",
  },
  {
    _id: "demo-patient-03",
    patientRefId: "JC-4K8P19",
    name: "Ganesh Shinde",
    age: 38,
    gender: "Male",
    mobile: "9822114404",
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Vikaswadi",
    bloodGroup: "A+",
    abhaLinked: true,
    abhaNumber: "91-3829-1940-5512",
  },
  {
    _id: "demo-patient-04",
    patientRefId: "JC-3B7L88",
    name: "Kavita Jadhav",
    age: 49,
    gender: "Female",
    mobile: "9822114406",
    division: "Nashik",
    district: "Nashik",
    taluka: "Nashik",
    village: "Demo Village",
    bloodGroup: "AB+",
    abhaLinked: true,
    abhaNumber: "91-8821-4920-1193",
  },
  {
    _id: "demo-patient-05",
    patientRefId: "JC-6N1D52",
    name: "Arjun More",
    age: 7,
    gender: "Male",
    mobile: "9822114408",
    division: "Nashik",
    district: "Nashik",
    taluka: "Sinnar",
    village: "Demo Village",
    bloodGroup: "O+",
    abhaLinked: false,
  },
];

export const DEMO_CONSULTATIONS = [
  {
    _id: "demo-consult-01",
    patientId: DEMO_PATIENTS[0],
    doctorId: { _id: "demo-doctor-01", name: "Dr. Aniruddha Kulkarni", role: "Doctor" },
    facilityId: DEMO_FACILITIES[0],
    healthRecordId: {
      _id: "demo-record-01",
      vitals: { temperature: 101.4, bloodPressureSystolic: 135, bloodPressureDiastolic: 85, heartRate: 98, spo2: 96, respiratoryRate: 20 },
      symptoms: [
        { name: "Continuous High Fever", durationDays: 3, severity: "Moderate" },
        { name: "Fatigue & Body Aches", durationDays: 2, severity: "Moderate" },
      ],
      triage: {
        level: "Priority",
        reason: "Persistent febrile illness with moderate tachycardia.",
        aiExplanation: "Possible viral fever or malaria. Recommended for physician tele-consultation.",
      },
    },
    status: "Scheduled",
    videoRoomName: "jancare-consult-ramesh-7f3k",
    clinicalNotes: "Scheduled for primary clinical evaluation of febrile illness.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-consult-02",
    patientId: DEMO_PATIENTS[1],
    doctorId: { _id: "demo-specialist-01", name: "Dr. Smita Rao (Cardiologist)", role: "Specialist" },
    facilityId: DEMO_FACILITIES[3],
    healthRecordId: {
      _id: "demo-record-02",
      vitals: { temperature: 98.8, bloodPressureSystolic: 175, bloodPressureDiastolic: 105, heartRate: 112, spo2: 94, respiratoryRate: 22 },
      symptoms: [
        { name: "Acute Chest Tightness", durationDays: 1, severity: "Severe" },
        { name: "Shortness of Breath", durationDays: 1, severity: "Severe" },
      ],
      triage: {
        level: "Urgent",
        reason: "Acute chest pain with severe Stage 2 Hypertension (175/105 mmHg) and tachycardia.",
        aiExplanation: "Red-flag cardiovascular symptoms detected. Urgent tele-escalation to on-duty cardiologist initiated.",
      },
    },
    status: "Scheduled",
    videoRoomName: "jancare-consult-sunita-9m2x",
    clinicalNotes: "Urgent telecardiology consult. Patient presenting with severe hypertension and chest tightness.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "demo-consult-03",
    patientId: DEMO_PATIENTS[3],
    doctorId: { _id: "demo-doctor-01", name: "Dr. Aniruddha Kulkarni", role: "Doctor" },
    facilityId: DEMO_FACILITIES[2],
    healthRecordId: {
      _id: "demo-record-03",
      vitals: { temperature: 98.6, bloodPressureSystolic: 138, bloodPressureDiastolic: 86, heartRate: 80, spo2: 97, respiratoryRate: 17 },
      symptoms: [
        { name: "Uncontrolled Hyperglycemia", durationDays: 7, severity: "Moderate" },
        { name: "Peripheral Foot Tingling", durationDays: 14, severity: "Moderate" },
      ],
      triage: {
        level: "Priority",
        reason: "Chronic Type 2 Diabetes with high fasting glucose (210 mg/dL).",
        aiExplanation: "Priority consultation required for Metformin dosage adjustment.",
      },
    },
    status: "Scheduled",
    videoRoomName: "jancare-consult-kavita-3b7l",
    clinicalNotes: "Diabetic management checkup and PMBJP generic drug substitution review.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "demo-consult-04",
    patientId: DEMO_PATIENTS[2],
    doctorId: { _id: "demo-doctor-01", name: "Dr. Aniruddha Kulkarni", role: "Doctor" },
    facilityId: DEMO_FACILITIES[0],
    healthRecordId: {
      _id: "demo-record-04",
      vitals: { temperature: 98.4, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, heartRate: 74, spo2: 99, respiratoryRate: 16 },
      symptoms: [
        { name: "Dry Cough & Rhinorrhea", durationDays: 4, severity: "Mild" },
      ],
      triage: {
        level: "Routine",
        reason: "Mild upper respiratory allergic symptoms.",
        aiExplanation: "Routine outpatient checkup suitable for PHC pharmacy dispensing.",
      },
    },
    status: "Completed",
    videoRoomName: "jancare-consult-ganesh-4k8p",
    clinicalNotes: "Upper respiratory allergy confirmed. Prescribed Cetirizine and warm saline steam.",
    diagnosis: "Acute Allergic Rhinitis (J30.9)",
    durationSeconds: 420,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const DEMO_APPOINTMENTS = [
  {
    _id: "demo-apt-01",
    patientId: DEMO_PATIENTS[0],
    doctorId: { _id: "demo-doctor-01", name: "Dr. Aniruddha Kulkarni", role: "Doctor" },
    facilityId: DEMO_FACILITIES[0],
    appointmentDate: new Date().toISOString(),
    appointmentTime: "11:30 AM",
    status: "Scheduled",
    queueNumber: 1,
    estimatedWaitMinutes: 10,
    bookingSource: "AI_ASSISTANT",
  },
  {
    _id: "demo-apt-02",
    patientId: DEMO_PATIENTS[1],
    doctorId: { _id: "demo-specialist-01", name: "Dr. Smita Rao (Cardiologist)", role: "Specialist" },
    facilityId: DEMO_FACILITIES[3],
    appointmentDate: new Date().toISOString(),
    appointmentTime: "11:45 AM",
    status: "Scheduled",
    queueNumber: 2,
    estimatedWaitMinutes: 15,
    bookingSource: "MANUAL",
  },
  {
    _id: "demo-apt-03",
    patientId: DEMO_PATIENTS[4],
    doctorId: { _id: "demo-doctor-01", name: "Dr. Aniruddha Kulkarni", role: "Doctor" },
    facilityId: DEMO_FACILITIES[0],
    appointmentDate: new Date().toISOString(),
    appointmentTime: "12:00 PM",
    status: "Scheduled",
    queueNumber: 3,
    estimatedWaitMinutes: 25,
    bookingSource: "MANUAL",
  },
];

export function findDemoUser(identifier: string): DemoUser | null {
  if (!identifier) return null;
  const clean = identifier.toLowerCase().trim().replace(/[\s._-]+/g, "");

  // Direct key match
  if (DEMO_USERS[clean]) return DEMO_USERS[clean];

  // Specific aliases
  if (clean === "anm") return DEMO_USERS.asha;
  if (clean === "pharmacy" || clean === "pharmacist") return DEMO_USERS.medmanager;
  if (clean.includes("smita") || clean.includes("cardio")) return DEMO_USERS.specialist;
  if (clean.includes("aniruddha") || clean.includes("kulkarni")) return DEMO_USERS.doctor;
  if (clean === "9822114400" || clean === "jc7f3k92" || clean.includes("ramesh")) return DEMO_USERS.patient;

  // Search across users by username, role, mobile, or name
  for (const key of Object.keys(DEMO_USERS)) {
    const u = DEMO_USERS[key];
    if (
      u.username.toLowerCase() === clean ||
      u.role.toLowerCase() === clean ||
      (u.mobile && u.mobile === clean) ||
      (u.patientRefId && u.patientRefId.toLowerCase() === clean) ||
      u.name.toLowerCase().replace(/[\s._-]+/g, "").includes(clean)
    ) {
      return u;
    }
  }

  return null;
}

export function getDemoConsultations(query?: any) {
  let list = [...DEMO_CONSULTATIONS];
  if (query?.status) {
    list = list.filter((c) => c.status === query.status);
  }
  if (query?.patientId) {
    list = list.filter((c) => c.patientId?._id === query.patientId || c.patientId?.patientRefId === query.patientId);
  }
  return list;
}

export function getDemoAppointments(query?: any) {
  let list = [...DEMO_APPOINTMENTS];
  if (query?.status) {
    list = list.filter((a) => a.status === query.status);
  }
  if (query?.patientId) {
    list = list.filter((a) => a.patientId?._id === query.patientId || a.patientId?.patientRefId === query.patientId);
  }
  return list;
}

export function getDemoFacilities(query?: any) {
  let list = [...DEMO_FACILITIES];
  if (query?.district) {
    list = list.filter((f) => f.district.toLowerCase() === query.district.toLowerCase());
  }
  if (query?.type) {
    list = list.filter((f) => f.type.toLowerCase() === query.type.toLowerCase());
  }
  return list;
}
