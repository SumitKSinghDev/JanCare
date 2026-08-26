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
    registeredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
export default Patient;
