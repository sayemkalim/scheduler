import mongoose, { Document } from "mongoose";

interface MailOptions {
  from: string | undefined;
  to: string;
  subject: string;
  text: string;
}

interface EmailAttempt extends Document {
  batch_id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  email: string;
  status: "success" | "failed";
  provider_messageId?: string;
  error?: string;
  attempts?: number;
  sentAt?: Date;
}

interface EmailBatches extends Document {
  started_by: string;
  started_at: Date;
  window_from: Date;
  window_to: Date;
  total_considered: number;
  total_with_email: number;
  sent_count: number;
  fail_count: number;
  status: "running" | "completed" | "failed";
}

interface IOrder extends Document {
  order_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profession: string;
  remarks: string;
  order_date: Date;
  amount: number;
  additional_products: string[];
}

export { MailOptions, EmailAttempt, EmailBatches, IOrder };
