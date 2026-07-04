import mongoose from "mongoose";
import createHttpError from "http-errors";

import userModel from "../user/userModel";
import subscriptionModel from "./subscriptionModel";
import { SubscriptionPlan } from "./subscriptionTypes";

type UpgradePlanInput = {
  userId: string;
  plan: SubscriptionPlan;
  paymentId?: string;
  paymentProvider?: "manual" | "razorpay";
  durationDays?: number;
};

const upgradeUserPlan = async ({
  userId,
  plan,
  paymentId = "",
  paymentProvider = "manual",
  durationDays = 30,
}: UpgradePlanInput) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(400, "Invalid user id");
  }

  // Free is not a manual upgrade/downgrade option.
  // A user returns to Free automatically only after Pro expires.
  if (plan !== "pro") {
    throw createHttpError(
      400,
      "Users cannot manually downgrade to Free. The Pro plan will expire automatically.",
    );
  }

  const user = await userModel.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const now = new Date();

  // Find the currently active Pro plan, if it has not expired.
  const currentActivePro = await subscriptionModel.findOne({
    user: user._id,
    plan: "pro",
    status: "active",
    endDate: { $gt: now },
  });

  // If user renews early, add 30 days after their existing expiry.
  // If they are Free or expired, Pro starts now.
  const startDate =
    currentActivePro?.endDate && currentActivePro.endDate > now
      ? currentActivePro.endDate
      : now;

  const endDate = new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  // Close the old Pro record before creating the renewed one.
  if (currentActivePro) {
    currentActivePro.status = "cancelled";
    await currentActivePro.save();
  }

  const subscription = await subscriptionModel.create({
    user: user._id,
    plan: "pro",
    status: "active",
    startDate,
    endDate,
    paymentId,
    paymentProvider,
  });

  user.plan = "pro";
  await user.save();

  return {
    user,
    subscription,
  };
};

const getCurrentSubscription = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(400, "Invalid user id");
  }

  return subscriptionModel
    .findOne({
      user: userId,
      status: "active",
    })
    .sort({ createdAt: -1 });
};

export { upgradeUserPlan, getCurrentSubscription };
