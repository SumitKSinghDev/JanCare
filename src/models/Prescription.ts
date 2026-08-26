import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrescribedMedicine {
  name: string;
  genericName?: string;
  strength: string; // e.g. 500mg, 10ml
  form: "Tablet" | "Syrup" | "Injection" | "Capsule" | "Ointment" | "Other";
  dosage: string; // e.g. 1-0-1, 1-1-1
  durationDays: number;
  instructions: "Before Food" | "After Food" | "As Needed" | "With Milk" | "Other";
}

export interface IPrescription extends Document {
  consultationId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: IPrescribedMedicine[];
  additionalInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescribedMedicineSchema = new Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  strength: { type: String, required: true },
  form: {
    type: String,
    enum: ["Tablet", "Syrup", "Injection", "Capsule", "Ointment", "Other"],
    required: true,
  },
  dosage: { type: String, required: true },
  durationDays: { type: Number, required: true },
  instructions: {
    type: String,
    enum: ["Before Food", "After Food", "As Needed", "With Milk", "Other"],
    required: true,
  },
});

const PrescriptionSchema: Schema<IPrescription> = new Schema(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: "Consultation", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicines: { type: [PrescribedMedicineSchema], required: true },
    additionalInstructions: { type: String },
  },
  { timestamps: true }
);

const Prescription: Model<IPrescription> =
  mongoose.models.Prescription || mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
export default Prescription;
