import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";

import { Job } from "../models/job";
import { logger } from "../config/logger";
import { Language } from "../models/programming-languages";
import { Employee } from "../models/employee";

export const getProgrammingLanguages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const languages = await AppDataSource.getRepository(Language)
      .createQueryBuilder("languages")
      .getMany();

    res.status(200).json({
      status: "success",
      no: languages.length,
      data: languages,
    });
  }
);
