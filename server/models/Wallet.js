import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      unique: true
    },
    currency: { type: String, enum: ["XOF"], default: "XOF" },
    balanceXof: { type: Number, min: 0, default: 0, validate: Number.isSafeInteger }
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
