import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// one application per student per job (also makes the "already applied" check fast)
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
// a student's "Applied Jobs" list, newest first
applicationSchema.index({ applicant: 1, createdAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
