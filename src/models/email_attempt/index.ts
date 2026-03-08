import mongoose, { Schema, Model } from "mongoose";
import { EmailAttempt } from "../../types";

const emailAttempSchema: Schema<EmailAttempt> = new mongoose.Schema(
  {
    batch_id: { type: Schema.Types.ObjectId, ref: "EmailBatch", index: true },
    order_id: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    email: String,
    status: { type: String, enum: ["success", "failed"] },
    provider_messageId: String,
    error: String,
    attempts: Number,
    sentAt: Date,
  },
  { timestamps: true }
);

const EmailAttempt: Model<EmailAttempt> = mongoose.model<EmailAttempt>(
  "EmailAttempt",
  emailAttempSchema
);

export { EmailAttempt };
