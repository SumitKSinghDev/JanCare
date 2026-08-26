import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferral extends Document {
  patientId: mongoose.Types.ObjectId;
  referringDoctorId: mongoose.Types.ObjectId;
  referringFacilityId: mongoose.Types.ObjectId;
  destinationFacilityId: mongoose.Types.ObjectId;
  reason: string;
  priority: "Routine" | "Urgent";
  status: "Created" | "AppointmentBooked" | "PatientArrived" | "Completed" | "Missed" | "Escalated";
  appointmentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema<IReferral> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    referringDoctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referringFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    destinationFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ["Routine", "Urgent"], default: "Routine", index: true },
    status: {
      type: String,
      enum: ["Created", "AppointmentBooked", "PatientArrived", "Completed", "Missed", "Escalated"],
      default: "Created",
      index: true,
    },
    appointmentDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);
export default Referral;
