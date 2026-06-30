import mongoose from "mongoose";

export interface Question {
  _id: string;

  title: string;
  description: string;
  tags: string[];

  author: mongoose.Types.ObjectId;

  isSolved: boolean;

  upvotes: number;
  downvotes: number;

  createdAt: Date;
  updatedAt: Date;
}
