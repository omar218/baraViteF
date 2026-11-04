import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    trade: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    verified: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "in_review", "approved", "rejected"],
      default: "unverified"
    },
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coordinates) => coordinates.length === 2 &&
            coordinates[0] >= -180 && coordinates[0] <= 180 &&
            coordinates[1] >= -90 && coordinates[1] <= 90,
          message: "La position doit contenir une longitude et une latitude valides."
        }
      }
    }
  },
  { timestamps: true }
);

professionalSchema.index({ name: "text", trade: "text", city: "text", description: "text" });
professionalSchema.index({ location: "2dsphere" }, { sparse: true });

export default mongoose.model("Professional", professionalSchema);
