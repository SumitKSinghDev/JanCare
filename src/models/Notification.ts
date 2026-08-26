import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // Recipient
  title: string;
  message: string;
  type: "Appointment" | "VideoCall" | "Referral" | "FollowUp" | "MedicineStock" | "System";
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["Appointment", "VideoCall", "Referral", "FollowUp", "MedicineStock", "System"],
      required: true,
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
