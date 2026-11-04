import mongoose from "mongoose";

const dispatchAttemptSchema = new mongoose.Schema(
  {
    professional: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    radiusMeters: { type: Number, enum: [5000, 10000, 20000], required: true },
    notifiedAt: { type: Date, required: true },
    respondedAt: { type: Date, default: null },
    response: { type: String, enum: ["accepted", "declined", "timeout"], default: null }
  },
  { _id: false }
);

const emergencyDispatchSchema = new mongoose.Schema(
  {
    customerRef: { type: String, required: true, maxlength: 100 },
    trade: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates) => coordinates.length === 2 &&
            coordinates[0] >= -180 && coordinates[0] <= 180 &&
            coordinates[1] >= -90 && coordinates[1] <= 90,
          message: "La position doit contenir une longitude et une latitude valides."
        }
      }
    },
    radiusMeters: { type: Number, enum: [5000, 10000, 20000], default: 5000 },
    status: {
      type: String,
      enum: ["searching", "assigned", "completed", "cancelled", "unmatched"],
      default: "searching",
      index: true
    },
    attempts: { type: [dispatchAttemptSchema], default: [] },
    assignedProfessional: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", default: null },
    responseDeadline: { type: Date, default: null }
  },
  { timestamps: true }
);

emergencyDispatchSchema.index({ location: "2dsphere" });

export default mongoose.model("EmergencyDispatch", emergencyDispatchSchema);
