import mongoose from "mongoose";
import { AIUsageDocument } from "./aiUsageTypes";

const aiUsageSchema = new mongoose.Schema<AIUsageDocument>(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },

    month: {
      type: String,
      required: true,
    },

    answerCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    improveQuestionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    explainCodeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRequests: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

aiUsageSchema.index(
  {
    user: 1,
    month: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<AIUsageDocument>("AIUsage", aiUsageSchema);
