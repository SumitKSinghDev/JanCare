import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFacility extends Document {
  name: string;
  type: "SubCenter" | "PHC" | "CHC" | "SDH" | "DH" | "PrivateHospital" | "MedicalStore";
  services: string[]; // e.g. ["General Medicine", "Pediatrics", "Maternity", "Diagnostics", "Telemedicine"]
  division: string;
  district: string;
  taluka: string;
  village: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema: Schema<IFacility> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["SubCenter", "PHC", "CHC", "SDH", "DH", "PrivateHospital", "MedicalStore"],
      required: true,
      index: true,
    },
    services: { type: [String], default: [] },
    division: { type: String, required: true },
    district: { type: String, required: true, index: true },
    taluka: { type: String, required: true, index: true },
    village: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    contactNumber: { type: String },
  },
  { timestamps: true }
);

const Facility: Model<IFacility> =
  mongoose.models.Facility || mongoose.model<IFacility>("Facility", FacilitySchema);
export default Facility;
