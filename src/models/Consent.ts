import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsent extends Document {
  patientId: mongoose.Types.ObjectId;
  grantedToDoctorId?: mongoose.Types.ObjectId;
  grantedToFacilityId?: mongoose.Types.ObjectId;
  purpose: string;
  status: "Active" | "Expired" | "Withdrawn";
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema: Schema<IConsent> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    grantedToDoctorId: { type: Schema.Types.ObjectId, ref: "User" },
    grantedToFacilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Expired", "Withdrawn"],
      default: "Active",
      index: true,
    },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Consent: Model<IConsent> =
  mongoose.models.Consent || mongoose.model<IConsent>("Consent", ConsentSchema);
export default Consent;
