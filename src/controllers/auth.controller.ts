import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import asyncHandler from "../utils/async-handler";
import AppError from "../utils/app-error";

import { AppDataSource } from "../config/data-source";
import { User } from "../models/user";

import { createSendAccessRefresh } from "../utils/authentication";
import { Employee } from "../models/employee";
import { Employer } from "../models/employer";
import { Language } from "../models/programming-languages";

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

function isDecodedValid(decoded: any): decoded is { id: string } {
  return decoded && typeof decoded === "object" && "id" in decoded;
}

export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role } = req.body;

    if (!["employee", "employer"].includes(role)) {
      return next(new AppError(`invalid role ${role}`, 400));
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo
      .createQueryBuilder("users")
      .where("email= :email", { email })
      .getOne();

    if (user) {
      return next(new AppError(`User with this email already exists`, 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = userRepo.create({
      email,
      password: hashedPassword,
      role,
    });

    if (role === "employee") {
      const { nationalId, name, city, bio, experienceLevel, languageNames } =
        req.body;

      if (
        !languageNames ||
        !Array.isArray(languageNames) ||
        languageNames.length === 0
      ) {
        return next(
          new AppError(`Please specify your programming languages`, 400)
        );
      }
      const languages = await Language.find({
        where: languageNames.map((name: string) => ({ name })),
      });

      if (languages.length !== languageNames.length) {
        return next(
          new AppError(
            `One or more of languages is not found, please specify real programming languages`,
            400
          )
        );
      }

      await userRepo.save(newUser);
      const employeeRepo = AppDataSource.getRepository(Employee);

      const employee = employeeRepo.create({
        nationalId,
        name,
        city,
        bio,
        experienceLevel,
        user: newUser,
        languages,
      });
      await employeeRepo.save(employee);
    } else if (role === "employer") {
      const { name, companyName } = req.body;

      if (!name || !companyName) {
        return next(new AppError(`Please provide name and company name`, 400));
      }
      await userRepo.save(newUser);
      const employerRepo = AppDataSource.getRepository(Employer);

      const employer = employerRepo.create({
        name,
        companyName,
        user: newUser,
      });
      await employerRepo.save(employer);
    }

    logger.info(`User ${email} has been created.`);

    createSendAccessRefresh(newUser, 200, res);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("users")
      .where("email= :email", { email })
      .getOne();
    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError(`invalid email or password`, 403));
    }

    createSendAccessRefresh(user, 200, res);
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) GET THE REFRESH TOKEN FROM COOKIES
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError("There is no refresh token found", 404));
    }

    // 2) DECODE THE REFRESH TOKEN AND GET THE USER ID FOR IT
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH!);
    } catch (err) {
      return next(new AppError("Invalid refresh token", 400));
    }

    // 3) FIND THE USER BY ID
    const user = await User.findOne({ where: { id: decoded.id } });

    // 4) REMOVE REFRESH TOKEN FROM DATABASE
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // 5) REMOVE THE REFRESH TOKEN FROM COOKIES
    res.clearCookie("refreshToken");

    res.status(204).send();
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) CHECK THE REQUEST COOKIES FOR REFRESH TOKEN
    const refreshToken: string | undefined = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError("Refresh token not found", 401));
    }

    // 2) CHECK IF THE REFRESH TOKEN IS VALID
    let decoded: { id: string } | string;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_REFRESH as string
      );
    } catch (error) {
      return next(new AppError("Invalid refresh token", 403));
    }

    if (!isDecodedValid(decoded)) {
      return next(new AppError("Invalid refresh token", 403));
    }

    // 3) CHECK IF THE REFRESH TOKEN IN THE DATABASE FOR THIS USER
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository
      .createQueryBuilder("users")
      .where("id= :id", { id: decoded.id })
      .getOne();

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError("Invalid refresh token", 403));
    }

    // 4) CREATE NEW ACCESS AND REFRESH TOKEN FOR THE USER
    createSendAccessRefresh(user, 200, res);
  }
);
