import mongoose from "mongoose";
import createHttpError from "http-errors";

import aiHistoryModel from "./aiHistoryModel";
import { AIFeature } from "../usage/aiUsageTypes";

interface CreateAIHistoryInput {
  userId: string;
  feature: AIFeature;
  inputPreview: string;
  fromCache: boolean;
}

export const createAIHistory = async ({
  userId,
  feature,
  inputPreview,
  fromCache,
}: CreateAIHistoryInput): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(401, "Invalid authenticated user");
  }

  await aiHistoryModel.create({
    user: userId,
    feature,
    inputPreview: inputPreview.trim().slice(0, 300),
    fromCache,
  });
};

export const getUserAIHistory = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(401, "Invalid authenticated user");
  }

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [history, total] = await Promise.all([
    aiHistoryModel
      .find({ user: userId })
      .select("feature inputPreview fromCache createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    aiHistoryModel.countDocuments({ user: userId }),
  ]);

  return {
    history,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};