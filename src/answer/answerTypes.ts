import mongoose from "mongoose";

export interface Answer {
  _id: mongoose.Types.ObjectId;

  content: string;

  author: mongoose.Types.ObjectId | string;

  question: mongoose.Types.ObjectId | string;

  isAccepted: boolean;

  upvotes: number;

  downvotes: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAnswerParams {
  questionId: string;
}

export interface CreateAnswerBody {
  content: string;
}
