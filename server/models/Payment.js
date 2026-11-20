import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, maxlength: 100 },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    proId: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    amount: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    currency: { type: String, enum: ["XOF"], default: "XOF", required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      required: true,
      index: true
    },
    providerRef: { type: String, default: "", maxlength: 200 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
  },
  { timestamps: true }
);

paymentSchema.index({ clientId: 1, createdAt: -1 });
paymentSchema.index(
  { clientId: 1, proId: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export default mongoose.model("Payment", paymentSchema);
