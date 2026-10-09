import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    website: {
      type: String,
      default: "",
    },
    location: {
      type: String,
    },
    logo: {
      type: String, // URL to the company logo
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// a recruiter's company list
companySchema.index({ userId: 1, createdAt: -1 });

export const Company = mongoose.model("Company", companySchema);
