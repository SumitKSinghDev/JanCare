import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string; // Mobile number or email address
  passwordHash: string;
  role: "Patient" | "ASHA" | "ANM" | "Doctor" | "Specialist" | "FacilityAdmin" | "DistrictAdmin" | "SystemAdmin";
  associatedFacility?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["Patient", "ASHA", "ANM", "Doctor", "Specialist", "FacilityAdmin", "DistrictAdmin", "SystemAdmin"],
    },
    associatedFacility: { type: Schema.Types.ObjectId, ref: "Facility" },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
