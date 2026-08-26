import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action:
    | "Login"
    | "Logout"
    | "RecordAccess"
    | "RecordModification"
    | "PrescriptionCreation"
    | "ReferralCreation"
    | "ConsentChange"
    | "VideoStart"
    | "VideoEnd"
    | "Export"
    | "AdminAccess";
  patientId?: mongoose.Types.ObjectId;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: [
        "Login",
        "Logout",
        "RecordAccess",
        "RecordModification",
        "PrescriptionCreation",
        "ReferralCreation",
        "ConsentChange",
        "VideoStart",
        "VideoEnd",
        "Export",
        "AdminAccess",
      ],
      required: true,
      index: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    details: { type: String, required: true },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
