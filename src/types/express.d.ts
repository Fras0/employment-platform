import { Request } from "express";
import { User } from "../models/user";
import { Employer } from "../models/employer";
import { Employee } from "../models/employee";

declare global {
  namespace Express {
    interface Request {
      user?: User; // You can use '?' to indicate this is an optional property
      employer?: Employer | null;
      employee?: Employee | null;
    }
  }
}
