import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";
import { User } from "../models/user";
import { Employee } from "../models/employee";
import { ProfileView } from "../models/profile-views";

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = String(req.user?.id);
  next();
};

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const viewerId = req.user?.id;

    const viewer = await User.findOne({ where: { id: viewerId } });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.employee", "employee")
      .leftJoinAndSelect("users.employer", "employer")
      .where("users.id= :userId", { userId })
      .getOne();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (viewer) {
      const view = ProfileView.create({
        viewer,
        viewed: user,
      });
      await view.save();
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export const getAllCandidates = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { experienceLevel, city, languageNames } = req.query;

    const query = AppDataSource.getRepository(Employee)
      .createQueryBuilder("employees")
      .leftJoinAndSelect("employees.languages", "language");

    if (experienceLevel) {
      query.andWhere("employees.experienceLevel = :experienceLevel", {
        experienceLevel,
      });
    }

    if (city) {
      query.andWhere("employees.city = :city", {
        city,
      });
    }

    if (languageNames) {
      const names = Array.isArray(languageNames)
        ? languageNames
        : (languageNames as string).split(",");
      query.andWhere("language.name IN (:...names)", { names });
    }

    const candidates = await query.getMany();

    if (!candidates) {
      return next(new AppError("No candidates found", 404));
    }

    res.status(200).json({
      status: "success",
      no: candidates.length,
      data: candidates,
    });
  }
);
