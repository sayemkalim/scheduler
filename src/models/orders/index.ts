import mongoose, { Schema, Document, Model } from "mongoose";
import { IOrder } from "../../types";

const orderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    profession: {
      type: String,
    },
    remarks: {
      type: String,
      default: "",
    },
    order_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    additional_products: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export { Order };
