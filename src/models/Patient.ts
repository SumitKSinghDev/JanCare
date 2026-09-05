import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  patientRefId: string; // Internal JanCare ID, e.g. JC-7F3K92
  name: string;
  age: number;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  mobile: string;
  email?: string;
  state: string;
  division: string;
  district: string;
  taluka: string;
  village: string;
  preferredLanguage: string;
  emergencyContact: {
    name: string;
    relation: string;
    mobile: string;
  };
  abhaLinked: boolean;
  abhaNumber?: string; // Optional reference
  pmjayWallet?: {
    isEligible: boolean;
    schemeName: string;
    totalAnnualCoverage: number; // e.g. 500000 (₹5 Lakhs)
    usedAmount: number;
    availableBalance: number;
    claimsHistory?: Array<{
      claimId: string;
      hospitalName: string;
      hospitalType: "Public (Government)" | "Private (Empanelled)";
      procedureName: string;
      packageCode: string;
      amountDeducted: number;
      approvalStatus: "Approved & Settled Cashless" | "Pre-Authorized" | "In Review";
      date: Date;
    }>;
  };
  registeredBy?: mongoose.Types.ObjectId; // ASHA or Frontline worker
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema<IPatient> = new Schema(
  {
    patientRefId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    mobile: { type: String, required: true, index: true },
    email: { type: String, trim: true },
    state: { type: String, required: true, default: "Maharashtra" },
    division: { type: String, required: true },
    district: { type: String, required: true, index: true },
    taluka: { type: String, required: true, index: true },
    village: { type: String, required: true },
    preferredLanguage: { type: String, required: true, default: "Marathi" },
    emergencyContact: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      mobile: { type: String, required: true },
    },
    abhaLinked: { type: Boolean, required: true, default: false },
    abhaNumber: { type: String },
    pmjayWallet: {
      isEligible: { type: Boolean, default: true },
      schemeName: { type: String, default: "Ayushman Bharat PM-JAY / MJPJAY" },
      totalAnnualCoverage: { type: Number, default: 500000 },
      usedAmount: { type: Number, default: 0 },
      availableBalance: { type: Number, default: 500000 },
      claimsHistory: [
        {
          claimId: { type: String, required: true },
          hospitalName: { type: String, required: true },
          hospitalType: { type: String, enum: ["Public (Government)", "Private (Empanelled)"], default: "Private (Empanelled)" },
          procedureName: { type: String, required: true },
          packageCode: { type: String, required: true },
          amountDeducted: { type: Number, required: true },
          approvalStatus: { type: String, enum: ["Approved & Settled Cashless", "Pre-Authorized", "In Review"], default: "Approved & Settled Cashless" },
          date: { type: Date, default: Date.now },
        },
      ],
    },
    registeredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
export default Patient;
