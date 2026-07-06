import crypto from "crypto";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../user/authTypes";
import { config } from "../config/config";
import razorpay from "./razorpay";
import { getCurrentSubscription, upgradeUserPlan } from "./subscriptionService";
import subscriptionModel from "./subscriptionModel";

const PRO_PLAN_AMOUNT = 19900; // ₹199.00 in paise
const PRO_PLAN_DURATION_DAYS = 30;

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

const createRazorpayOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const order = await razorpay.orders.create({
      amount: PRO_PLAN_AMOUNT,
      currency: "INR",
      receipt: `pro_${Date.now()}`,
      notes: {
        userId,
        plan: "pro",
        durationDays: String(PRO_PLAN_DURATION_DAYS),
      },
    });

    return res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: config.razorpayKeyId,
      plan: {
        name: "Pro",
        amount: PRO_PLAN_AMOUNT / 100,
        currency: "INR",
        durationDays: PRO_PLAN_DURATION_DAYS,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return next(createHttpError(500, "Failed to create payment order"));
  }
};

const verifyRazorpayPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body as {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(createHttpError(400, "Missing Razorpay payment details"));
    }

    if (!config.razorpayKeySecret) {
      return next(createHttpError(500, "Razorpay secret key is missing"));
    }

    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(createHttpError(400, "Invalid payment signature"));
    }

    // Prevent the same Razorpay payment from activating Pro twice
    const existingPayment = await subscriptionModel.findOne({
      paymentId: razorpay_payment_id,
      paymentProvider: "razorpay",
    });

    if (existingPayment) {
      return next(
        createHttpError(400, "This payment has already been processed"),
      );
    }

    const result = await upgradeUserPlan({
      userId,
      plan: "pro",
      paymentId: razorpay_payment_id,
      paymentProvider: "razorpay",
      durationDays: PRO_PLAN_DURATION_DAYS,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified. Pro subscription activated successfully.",
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
    console.error("Verify Razorpay payment error:", error);
    return next(createHttpError(500, "Failed to verify payment"));
  }
};

export { getMySubscription, createRazorpayOrder, verifyRazorpayPayment };
