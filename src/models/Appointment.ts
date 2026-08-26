import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "NoShow";
  queueNumber?: number;
  estimatedWaitMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    appointmentDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "NoShow"],
      default: "Scheduled",
      index: true,
    },
    queueNumber: { type: Number },
    estimatedWaitMinutes: { type: Number },
  },
  { timestamps: true }
);

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
export default Appointment;
