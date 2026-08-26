import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsultation extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  healthRecordId: mongoose.Types.ObjectId; // The symptoms/vitals intake record
  clinicalNotes?: string;
  diagnosis?: string;
  videoRoomName?: string; // Daily.co room name
  videoSessionId?: string; // Session ID reference
  status: "Scheduled" | "Active" | "Completed" | "Cancelled";
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema: Schema<IConsultation> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    healthRecordId: { type: Schema.Types.ObjectId, ref: "HealthRecord", required: true },
    clinicalNotes: { type: String },
    diagnosis: { type: String },
    videoRoomName: { type: String },
    videoSessionId: { type: String },
    status: {
      type: String,
      enum: ["Scheduled", "Active", "Completed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

const Consultation: Model<IConsultation> =
  mongoose.models.Consultation || mongoose.model<IConsultation>("Consultation", ConsultationSchema);
export default Consultation;
