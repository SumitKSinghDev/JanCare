import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISymptom {
  name: string;
  durationDays: number;
  severity: "Mild" | "Moderate" | "Severe";
}

export interface IVitals {
  temperature?: number; // Fahrenheit
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  spo2?: number; // percentage
  respiratoryRate?: number;
}

export interface ITriage {
  level: "Routine" | "Priority" | "Urgent";
  reason: string;
  aiExplanation?: string;
  recommendedFacilityId?: mongoose.Types.ObjectId;
  triageDate: Date;
}

export interface IHealthRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  vitals: IVitals;
  symptoms: ISymptom[];
  triage: ITriage;
  offlineCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomSchema = new Schema({
  name: { type: String, required: true },
  durationDays: { type: Number, required: true },
  severity: { type: String, enum: ["Mild", "Moderate", "Severe"], default: "Mild" },
});

const VitalsSchema = new Schema({
  temperature: { type: Number },
  bloodPressureSystolic: { type: Number },
  bloodPressureDiastolic: { type: Number },
  heartRate: { type: Number },
  spo2: { type: Number },
  respiratoryRate: { type: Number },
});

const TriageSchema = new Schema({
  level: { type: String, enum: ["Routine", "Priority", "Urgent"], required: true },
  reason: { type: String, required: true },
  aiExplanation: { type: String },
  recommendedFacilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
  triageDate: { type: Date, default: Date.now },
});

const HealthRecordSchema: Schema<IHealthRecord> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vitals: { type: VitalsSchema, required: true },
    symptoms: { type: [SymptomSchema], default: [] },
    triage: { type: TriageSchema, required: true },
    offlineCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const HealthRecord: Model<IHealthRecord> =
  mongoose.models.HealthRecord || mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);
export default HealthRecord;
