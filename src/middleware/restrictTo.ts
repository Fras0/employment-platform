import { NextFunction, Request, Response } from "express";
import Role from "../enums/role";
import AppError from "../utils/app-error";

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure that req.user is typed correctly
    const userRole = (req.user as { role: Role }).role;

    if (!roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
