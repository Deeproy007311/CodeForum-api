import mongoose from "mongoose";
import { Question } from "./questionTypes";

const questionSchema = new mongoose.Schema<Question>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags: string[]) => tags.length > 0 && tags.length <= 5,
        message: "Select between 1 and 5 tags",
      },
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isSolved: {
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

export default mongoose.model<Question>("Question", questionSchema);
