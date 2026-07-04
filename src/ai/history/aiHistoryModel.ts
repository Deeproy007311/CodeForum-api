import mongoose from "mongoose";
import { AIHistoryDocument } from "./aiHistoryTypes";

const aiHistorySchema = new mongoose.Schema<AIHistoryDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    feature: {
      type: String,
      enum: ["answer", "improve-question", "explain-code"],
      required: true,
      index: true,
    },

    inputPreview: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    fromCache: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

aiHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<AIHistoryDocument>("AIHistory", aiHistorySchema);
