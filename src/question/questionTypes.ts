import mongoose from "mongoose";

export interface Question {
  _id: string;

  title: string;
  description: string;
  tags: string[];

  author: mongoose.Types.ObjectId;

  isSolved: boolean;

  createdAt: Date;
  updatedAt: Date;
}
