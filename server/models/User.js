import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const professionalProfileSchema = new mongoose.Schema(
  {
    category: { type: String, trim: true, maxlength: 60 },
    city: { type: String, trim: true, maxlength: 80 },
    neighborhood: { type: String, trim: true, maxlength: 80, default: "" },
    indicativePriceXof: { type: Number, min: 0, validate: Number.isSafeInteger },
    available: { type: Boolean, default: true },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    experience: { type: Number, min: 0, max: 80, validate: Number.isSafeInteger },
    description: { type: String, trim: true, maxlength: 1000 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    passwordHash: { type: String, required: true, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    tokenVersion: { type: Number, min: 0, default: 0 },
    role: { type: String, enum: ["client", "pro"], required: true, index: true },
    professionalProfile: {
      type: professionalProfileSchema,
      required: function requireProfessionalProfile() {
        return this.role === "pro";
      }
    },
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", default: null },
    acceptedTermsAt: { type: Date, required: true },
    acceptedPrivacyAt: { type: Date, required: true }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set("toJSON", {
  transform(_document, result) {
    delete result.passwordHash;
    delete result.__v;
    return result;
  }
});

export default mongoose.model("User", userSchema);
