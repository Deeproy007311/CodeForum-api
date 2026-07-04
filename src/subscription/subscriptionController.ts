import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../user/authTypes";
import { getCurrentSubscription, upgradeUserPlan } from "./subscriptionService";
import { SubscriptionPlan } from "./subscriptionTypes";

const getMySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const subscription = await getCurrentSubscription(userId);

    return res.status(200).json({
      success: true,
      plan: req.user?.plan ?? "free",
      subscription,
    });
  } catch (error) {
    return next(error);
  }
};

/*
  Temporary endpoint only for testing.
  Later Razorpay webhook/payment verification will call upgradeUserPlan().
*/
const testUpgradePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const { plan } = req.body as { plan?: SubscriptionPlan };

    if (plan !== "free" && plan !== "pro") {
      return next(createHttpError(400, "Plan must be either 'free' or 'pro'"));
    }

    const result = await upgradeUserPlan({
      userId,
      plan,
      paymentProvider: "manual",
      paymentId: `test_${Date.now()}`,
      durationDays: plan === "pro" ? 30 : 0,
    });

    return res.status(200).json({
      success: true,
      message: `Plan changed to ${plan}`,
      user: {
        _id: result.user._id,
        name: result.user.name,
        username: result.user.username,
        email: result.user.email,
        plan: result.user.plan,
      },
      subscription: result.subscription,
    });
  } catch (error) {
    return next(error);
  }
};

export { getMySubscription, testUpgradePlan };
