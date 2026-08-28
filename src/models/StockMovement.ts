import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockMovement extends Document {
  facilityId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  type: "STOCK_RECEIVED" | "DISPENSED" | "SOLD" | "RESERVED" | "RESERVATION_CANCELLED" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  performedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema: Schema<IStockMovement> = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "STOCK_RECEIVED",
        "DISPENSED",
        "SOLD",
        "RESERVED",
        "RESERVATION_CANCELLED",
        "ADJUSTMENT",
        "TRANSFER"
      ],
      index: true,
    },
    quantity: { type: Number, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement || mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
export default StockMovement;
