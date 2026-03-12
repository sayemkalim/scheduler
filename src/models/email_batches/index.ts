import mongoose, { Schema, Document, Model } from "mongoose";
import { EmailBatches } from "../../types";

const emailBatchSchema: Schema<EmailBatches> = new mongoose.Schema(
  {
    started_by: String,
    started_at: { type: Date, default: Date.now },
    window_from: Date,
    window_to: Date,
    total_considered: Number,
    total_with_email: Number,
    sent_count: Number,
    fail_count: Number,
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
  },
  { timestamps: true }
);

const EmailBatch: Model<EmailBatches> = mongoose.model<EmailBatches>(
  "EmailBatch",
  emailBatchSchema
);

export { EmailBatch };
