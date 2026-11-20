import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    trade: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    neighborhood: { type: String, trim: true, maxlength: 80, default: "" },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    indicativePriceXof: { type: Number, min: 0, validate: Number.isSafeInteger, default: null },
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
professionalSchema.index({ userId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Professional", professionalSchema);
