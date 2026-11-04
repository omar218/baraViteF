import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    message: { type: String, trim: true, maxlength: 1000, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("ContactRequest", contactRequestSchema);
