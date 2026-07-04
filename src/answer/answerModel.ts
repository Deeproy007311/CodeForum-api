import mongoose from "mongoose";
import { Answer } from "./answerTypes";

const answerSchema = new mongoose.Schema<Answer>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Answer must be at least 5 characters"],
      maxlength: [10000, "Answer cannot exceed 10000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    isAccepted: {
      type: Boolean,
      default: false,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<Answer>("Answer", answerSchema);
