import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicine extends Document {
  facilityId: mongoose.Types.ObjectId;
  name: string;
  genericName?: string;
  strength: string; // e.g. 500mg, 10ml
  form: "Tablet" | "Syrup" | "Injection" | "Capsule" | "Ointment" | "Other";
  category: string; // e.g. Antibiotic, Analgesic, Antihypertensive
  quantity: number;
  minimumRequired: number; // For low stock alerts
  expiryDate?: Date;
  lastUpdated: Date;
}

const MedicineSchema: Schema<IMedicine> = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    strength: { type: String, required: true },
    form: {
      type: String,
      enum: ["Tablet", "Syrup", "Injection", "Capsule", "Ointment", "Other"],
      required: true,
    },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    minimumRequired: { type: Number, required: true, default: 100 },
    expiryDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Medicine: Model<IMedicine> =
  mongoose.models.Medicine || mongoose.model<IMedicine>("Medicine", MedicineSchema);
export default Medicine;
