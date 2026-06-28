import { Request } from "express";
import { User } from "./userTypes";

export interface AuthRequest extends Request {
  user?: User;
}
