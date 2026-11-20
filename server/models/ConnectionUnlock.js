import mongoose from "mongoose";

const connectionUnlockSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    proId: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    unlockedAt: { type: Date, default: Date.now, required: true }
  },
  { timestamps: true }
);

connectionUnlockSchema.index({ clientId: 1, proId: 1 }, { unique: true });
connectionUnlockSchema.index({ paymentId: 1 }, { unique: true });

export default mongoose.model("ConnectionUnlock", connectionUnlockSchema);
