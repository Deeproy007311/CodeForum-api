import mongoose from "mongoose";

export interface Vote {
  _id: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId | string;

  question?: mongoose.Types.ObjectId | string;

  answer?: mongoose.Types.ObjectId | string;

  voteType: 1 | -1;

  createdAt?: Date;

  updatedAt?: Date;
}
