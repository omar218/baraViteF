import mongoose from "mongoose";
import { calculatePlatformFeeXof } from "../services/platform-rules.js";

const paymentTransactionSchema = new mongoose.Schema(
  {
    customerRef: { type: String, required: true, maxlength: 100 },
    professional: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    idempotencyKey: { type: String, required: true, maxlength: 120, unique: true },
    currency: { type: String, enum: ["XOF"], default: "XOF" },
    serviceAmountXof: { type: Number, min: 0, required: true, validate: Number.isSafeInteger },
    travelFeeXof: { type: Number, min: 0, default: 0, validate: Number.isSafeInteger },
    platformFeeXof: { type: Number, min: 0, required: true, validate: Number.isSafeInteger },
    totalAmountXof: { type: Number, min: 1, required: true, validate: Number.isSafeInteger },
    providerNetXof: { type: Number, min: 0, required: true, validate: Number.isSafeInteger },
    status: {
      type: String,
      enum: ["pending", "held", "released", "refunded", "failed"],
      default: "pending",
      index: true
    },
    paymentProviderRef: { type: String, maxlength: 200, default: "" },
    completionOtpHash: { type: String, maxlength: 200, default: "" },
    releasedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

paymentTransactionSchema.pre("validate", function validateSplit() {
  const expectedProviderNet = this.serviceAmountXof + this.travelFeeXof;
  if (this.providerNetXof !== expectedProviderNet) {
    this.invalidate("providerNetXof", "Le net prestataire doit correspondre au service et au déplacement.");
  }
  if (this.platformFeeXof !== calculatePlatformFeeXof(expectedProviderNet)) {
    this.invalidate("platformFeeXof", "La commission plateforme doit représenter 10 % du service et du déplacement.");
  }
  if (this.totalAmountXof !== this.providerNetXof + this.platformFeeXof) {
    this.invalidate("totalAmountXof", "Le total doit correspondre au net prestataire et aux frais plateforme.");
  }
});

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
