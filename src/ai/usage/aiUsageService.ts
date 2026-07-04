import mongoose from "mongoose";
import createHttpError from "http-errors";

import aiUsageModel from "./aiUsageModel";
import { AIFeature } from "./aiUsageTypes";
import userModel from "../../user/userModel";
import subscriptionModel from "../../subscription/subscriptionModel";

const FREE_MONTHLY_AI_LIMIT = 10;
const PRO_MONTHLY_AI_LIMIT = 100;

const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

const getFeatureField = (
  feature: AIFeature,
): "answerCount" | "improveQuestionCount" | "explainCodeCount" => {
  switch (feature) {
    case "answer":
      return "answerCount";

    case "improve-question":
      return "improveQuestionCount";

    case "explain-code":
      return "explainCodeCount";
  }
};

const getUserAILimit = async (userId: string): Promise<number> => {
  const user = await userModel.findById(userId).select("plan");

  if (!user) {
    throw createHttpError(401, "User not found");
  }

  // Free users always get the Free limit.
  if (user.plan === "free") {
    return FREE_MONTHLY_AI_LIMIT;
  }

  // User has plan: "pro", so confirm that Pro is still active.
  const activeSubscription = await subscriptionModel.findOne({
    user: user._id,
    plan: "pro",
    status: "active",
  });

  const isExpired =
    !activeSubscription ||
    !activeSubscription.endDate ||
    activeSubscription.endDate.getTime() <= Date.now();

  // Automatically expire Pro and return user to Free.
  if (isExpired) {
    if (activeSubscription) {
      activeSubscription.status = "expired";
      await activeSubscription.save();
    }

    user.plan = "free";
    await user.save();

    return FREE_MONTHLY_AI_LIMIT;
  }

  return PRO_MONTHLY_AI_LIMIT;
};

export const getAIUsageSummary = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(401, "Invalid authenticated user");
  }

  const month = getCurrentMonth();

  const [usage, limit] = await Promise.all([
    aiUsageModel.findOne({
      user: userId,
      month,
    }),
    getUserAILimit(userId),
  ]);

  const used = usage?.totalRequests ?? 0;
  const remaining = Math.max(limit - used, 0);

  return {
    month,
    limit,
    used,
    remaining,
    canUseAI: used < limit,
  };
};

export const ensureAIUsageAvailable = async (
  userId: string,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(401, "Invalid authenticated user");
  }

  const summary = await getAIUsageSummary(userId);

  if (!summary.canUseAI) {
    throw createHttpError(
      429,
      `Monthly AI limit reached. You have used all ${summary.limit} AI requests for your current plan.`,
    );
  }
};

export const recordAIUsage = async (
  userId: string,
  feature: AIFeature,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(401, "Invalid authenticated user");
  }

  const month = getCurrentMonth();
  const featureField = getFeatureField(feature);

  await aiUsageModel.findOneAndUpdate(
    {
      user: userId,
      month,
    },
    {
      $inc: {
        totalRequests: 1,
        [featureField]: 1,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );
};