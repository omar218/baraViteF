import mongoose from "mongoose";
import { calculatePlatformFeeXof } from "../services/platform-rules.js";

const projectMilestoneSchema = new mongoose.Schema(
  {
    projectRef: { type: String, required: true, maxlength: 120, index: true },
    sequence: { type: Number, min: 1, required: true, validate: Number.isSafeInteger },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    amountXof: { type: Number, min: 1, required: true, validate: Number.isSafeInteger },
    platformFeeXof: { type: Number, min: 0, required: true, validate: Number.isSafeInteger },
    status: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
      index: true
    },
    idempotencyKey: { type: String, required: true, maxlength: 120, unique: true },
    releasedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

projectMilestoneSchema.index({ projectRef: 1, sequence: 1 }, { unique: true });

projectMilestoneSchema.pre("validate", function validateCommission() {
  if (this.platformFeeXof !== calculatePlatformFeeXof(this.amountXof)) {
    this.invalidate("platformFeeXof", "La commission du jalon doit représenter 10 % de son montant.");
  }
});

export default mongoose.model("ProjectMilestone", projectMilestoneSchema);
