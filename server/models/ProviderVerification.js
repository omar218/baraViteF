import mongoose from "mongoose";
import { getVerificationRequirements } from "../services/platform-rules.js";

const documentSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: [
        "identity_document",
        "live_selfie",
        "qualification_or_references",
        "rccm",
        "nif_or_dfe",
        "manager_identity",
        "portfolio"
      ],
      required: true
    },
    storageKey: { type: String, required: true, maxlength: 300 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { _id: false }
);

const providerVerificationSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      index: true
    },
    kind: { type: String, enum: ["kyc", "kyb"], required: true },
    documents: { type: [documentSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "in_review", "approved", "rejected"],
      default: "pending",
      index: true
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, maxlength: 500, default: "" }
  },
  { timestamps: true }
);

providerVerificationSchema.pre("validate", function validateApprovedEvidence() {
  if (this.status !== "approved") return;
  const approvedKinds = new Set(
    this.documents.filter((document) => document.status === "approved").map((document) => document.kind)
  );
  const missing = getVerificationRequirements(this.kind).filter((kind) => !approvedKinds.has(kind));
  if (missing.length) {
    this.invalidate("status", `Les justificatifs approuvés requis sont manquants : ${missing.join(", ")}.`);
  }
});

export default mongoose.model("ProviderVerification", providerVerificationSchema);
