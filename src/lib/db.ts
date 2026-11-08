import mongoose from "mongoose";

// Pre-register all schemas to avoid MissingSchemaError when performing populates in Next.js API routes
import "@/models/User";
import "@/models/Facility";
import "@/models/Patient";
import "@/models/Consultation";
import "@/models/Medicine";
import "@/models/Prescription";
import "@/models/Referral";
import "@/models/FollowUp";
import "@/models/Appointment";
import "@/models/AuditLog";
import "@/models/Consent";
import "@/models/HealthRecord";
import "@/models/Notification";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Fail fast in 2.5s if cluster is paused/dead
      connectTimeoutMS: 2500,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
