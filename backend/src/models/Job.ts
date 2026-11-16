
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJob extends Document {
  company: string;
  role: string;
  location: string;
  status: "Applied" | "Interview" | "Selected" | "Rejected";
  appliedDate: Date;
  jobType: string;
  jobUrl?: string;
  notes?: string;
  user: Types.ObjectId;
}

const jobSchema = new Schema<IJob>(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Applied", "Interview", "Selected", "Rejected"],
      default: "Applied",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    jobType: {
      type: String,
      default: "Full-time",
    },

    jobUrl: {
      type: String,
    },

    notes: {
      type: String,
    },

    // Connect each job application to its owner
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;
