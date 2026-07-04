import { Types } from "mongoose";
import { AIFeature } from "../usage/aiUsageTypes";

export interface AIHistoryDocument {
  user: Types.ObjectId;
  feature: AIFeature;
  inputPreview: string;
  fromCache: boolean;
  createdAt: Date;
  updatedAt: Date;
}