import { Types } from "mongoose";

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired";

export interface Subscription {
  _id: string;

  user: Types.ObjectId;

  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  startDate: Date;
  endDate: Date | null;

  paymentId: string;
  paymentProvider: "manual" | "razorpay";

  createdAt: Date;
  updatedAt: Date;
}
