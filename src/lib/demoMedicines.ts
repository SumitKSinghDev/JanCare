export interface DemoMedicine {
  _id: string;
  id: string;
  sku: string;
  name: string;
  genericName: string;
  strength: string;
  form: "Tablet" | "Syrup" | "Injection" | "Capsule" | "Ointment" | "Other";
  category: string;
  quantity: number;
  minimumRequired: number;
  expiryDate: string;
  status: "Available" | "Low" | "Out of Stock";
  facilityName: string;
  facilityType?: string;
  district?: string;
  lastUpdated?: string;
}

export const DEMO_MEDICINES: DemoMedicine[] = [
  {
    _id: "med-demo-001",
    id: "med-demo-001",
    sku: "JC-MED-PCM500",
    name: "Paracetamol 500mg (PMBJP Generic)",
    genericName: "Paracetamol",
    strength: "500mg",
    form: "Tablet",
    category: "Analgesic & Antipyretic",
    quantity: 1450,
    minimumRequired: 200,
    expiryDate: "2027-08-31",
    status: "Available",
    facilityName: "Nashik MED-01 (Jan Aushadhi Kendra)",
    facilityType: "MedicalStore",
    district: "Nashik"
  },
  {
    _id: "med-demo-002",
    id: "med-demo-002",
    sku: "JC-MED-AMX500",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin Trihydrate",
    strength: "500mg",
    form: "Capsule",
    category: "Broad Spectrum Antibiotic",
    quantity: 820,
    minimumRequired: 150,
    expiryDate: "2027-04-30",
    status: "Available",
    facilityName: "Sinnar CHC-01",
    facilityType: "CHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-003",
    id: "med-demo-003",
    sku: "JC-MED-MET500",
    name: "Metformin 500mg (PMBJP Generic)",
    genericName: "Metformin Hydrochloride",
    strength: "500mg",
    form: "Tablet",
    category: "Oral Antidiabetic",
    quantity: 650,
    minimumRequired: 100,
    expiryDate: "2027-11-30",
    status: "Available",
    facilityName: "Nashik MED-01 (Jan Aushadhi Kendra)",
    facilityType: "MedicalStore",
    district: "Nashik"
  },
  {
    _id: "med-demo-004",
    id: "med-demo-004",
    sku: "JC-MED-AML005",
    name: "Amlodipine 5mg (PMBJP Generic)",
    genericName: "Amlodipine Besylate",
    strength: "5mg",
    form: "Tablet",
    category: "Antihypertensive",
    quantity: 720,
    minimumRequired: 100,
    expiryDate: "2027-09-30",
    status: "Available",
    facilityName: "Sinnar CHC-01",
    facilityType: "CHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-005",
    id: "med-demo-005",
    sku: "JC-MED-ASV010",
    name: "Polyvalent Anti-Snake Venom (ASV)",
    genericName: "Lyophilized Polyvalent Enzyme Refined Equine Immunoglobulins",
    strength: "10ml Vial",
    form: "Injection",
    category: "Critical Emergency Antidote",
    quantity: 14,
    minimumRequired: 20,
    expiryDate: "2026-12-31",
    status: "Low",
    facilityName: "Igatpuri Tribal PHC-03",
    facilityType: "PHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-006",
    id: "med-demo-006",
    sku: "JC-MED-ORS021",
    name: "Oral Rehydration Salts (ORS)",
    genericName: "WHO Formula ORS",
    strength: "21.8g Sachet",
    form: "Other",
    category: "Electrolyte & Rehydration",
    quantity: 950,
    minimumRequired: 150,
    expiryDate: "2028-01-31",
    status: "Available",
    facilityName: "Demo Village Health SubCenter",
    facilityType: "SubCenter",
    district: "Nashik"
  },
  {
    _id: "med-demo-007",
    id: "med-demo-007",
    sku: "JC-MED-AZI500",
    name: "Azithromycin 500mg",
    genericName: "Azithromycin Dihydrate",
    strength: "500mg",
    form: "Tablet",
    category: "Macrolide Antibiotic",
    quantity: 480,
    minimumRequired: 80,
    expiryDate: "2027-06-30",
    status: "Available",
    facilityName: "Nashik PHC-01",
    facilityType: "PHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-008",
    id: "med-demo-008",
    sku: "JC-MED-IFA100",
    name: "Iron & Folic Acid (IFA) Tablets",
    genericName: "Ferrous Ascorbate + Folic Acid",
    strength: "100mg + 1.5mg",
    form: "Tablet",
    category: "Nutritional & Maternal Supplement",
    quantity: 1800,
    minimumRequired: 300,
    expiryDate: "2027-10-31",
    status: "Available",
    facilityName: "Demo Village Health SubCenter",
    facilityType: "SubCenter",
    district: "Nashik"
  },
  {
    _id: "med-demo-010",
    id: "med-demo-010",
    sku: "JC-MED-INS100",
    name: "Human Regular Insulin (100 IU/ml)",
    genericName: "Recombinant Human Insulin",
    strength: "10ml Vial (100 IU/ml)",
    form: "Injection",
    category: "Endocrine & Diabetes Care",
    quantity: 65,
    minimumRequired: 50,
    expiryDate: "2027-03-31",
    status: "Available",
    facilityName: "Nashik District Civil Hospital",
    facilityType: "DH",
    district: "Nashik"
  },
  {
    _id: "med-demo-011",
    id: "med-demo-011",
    sku: "JC-MED-PAN040",
    name: "Pantoprazole 40mg",
    genericName: "Pantoprazole Sodium",
    strength: "40mg",
    form: "Tablet",
    category: "Gastrointestinal / Antacid",
    quantity: 850,
    minimumRequired: 120,
    expiryDate: "2027-07-31",
    status: "Available",
    facilityName: "Nashik PHC-01",
    facilityType: "PHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-014",
    id: "med-demo-014",
    sku: "JC-MED-SLB100",
    name: "Salbutamol Inhaler 100mcg",
    genericName: "Salbutamol Sulfate MDI",
    strength: "200 Metered Doses",
    form: "Other",
    category: "Respiratory / Bronchodilator",
    quantity: 12,
    minimumRequired: 40,
    expiryDate: "2027-01-31",
    status: "Low",
    facilityName: "Igatpuri Tribal PHC-03",
    facilityType: "PHC",
    district: "Nashik"
  },
  {
    _id: "med-demo-015",
    id: "med-demo-015",
    sku: "JC-MED-TT005",
    name: "Tetanus Toxoid (TT) Vaccine",
    genericName: "Tetanus Vaccine Adsorbed",
    strength: "0.5ml Ampoule",
    form: "Injection",
    category: "Immunization / Vaccine",
    quantity: 340,
    minimumRequired: 50,
    expiryDate: "2027-09-30",
    status: "Available",
    facilityName: "Demo Village Health SubCenter",
    facilityType: "SubCenter",
    district: "Nashik"
  }
];
