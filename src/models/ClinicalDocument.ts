import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClinicalDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  title: string;
  type: "LabReport" | "Prescription" | "DischargeSummary" | "Other";
  fileUrl?: string;
  fileContent?: string; // Base64 or text representation
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicalDocumentSchema: Schema<IClinicalDocument> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["LabReport", "Prescription", "DischargeSummary", "Other"],
      required: true,
      index: true
    },
    fileUrl: { type: String },
    fileContent: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ClinicalDocument: Model<IClinicalDocument> =
  mongoose.models.ClinicalDocument || mongoose.model<IClinicalDocument>("ClinicalDocument", ClinicalDocumentSchema);
export default ClinicalDocument;
