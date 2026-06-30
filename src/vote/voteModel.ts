import mongoose from "mongoose";
import { Vote } from "./voteTypes";

const voteSchema = new mongoose.Schema<Vote>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },

    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },

    voteType: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Question Vote Index
voteSchema.index(
  {
    user: 1,
    question: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      question: { $exists: true },
    },
  },
);

// Answer Vote Index
voteSchema.index(
  {
    user: 1,
    answer: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      answer: { $exists: true },
    },
  },
);

export default mongoose.model<Vote>("Vote", voteSchema);
