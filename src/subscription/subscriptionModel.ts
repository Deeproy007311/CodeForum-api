import mongoose from "mongoose";
import { Subscription } from "./subscriptionTypes";

const subscriptionSchema = new mongoose.Schema<Subscription>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    paymentProvider: {
      type: String,
      enum: ["manual", "razorpay"],
      default: "manual",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ user: 1, status: 1 });

export default mongoose.model<Subscription>("Subscription", subscriptionSchema);
