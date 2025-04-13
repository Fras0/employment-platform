import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";
import { User } from "../models/user";

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = String(req.user?.id);
  next();
};

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("users")
      .where("id= :userId", { userId })
      .getOne();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);
