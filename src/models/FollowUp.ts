import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFollowUp extends Document {
  patientId: mongoose.Types.ObjectId;
  assignedWorkerId: mongoose.Types.ObjectId; // ASHA or Frontline worker
  type: "Medication" | "ChronicDisease" | "Maternal" | "Child" | "PostReferral";
  dueDate: Date;
  completedDate?: Date;
  status: "Upcoming" | "Due" | "Completed" | "Missed" | "Escalated";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema: Schema<IFollowUp> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    assignedWorkerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Medication", "ChronicDisease", "Maternal", "Child", "PostReferral"],
      required: true,
      index: true,
    },
    dueDate: { type: Date, required: true, index: true },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ["Upcoming", "Due", "Completed", "Missed", "Escalated"],
      default: "Upcoming",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const FollowUp: Model<IFollowUp> =
  mongoose.models.FollowUp || mongoose.model<IFollowUp>("FollowUp", FollowUpSchema);
export default FollowUp;
