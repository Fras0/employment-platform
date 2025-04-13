import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";

import { Job } from "../models/job";
import { logger } from "../config/logger";
import { Language } from "../models/programming-languages";

export const addJob = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, city, experienceLevel, languageNames } =
      req.body;
    const repository = AppDataSource.getRepository(Job);

    const employer = req.employer ?? undefined;
    if (!employer) {
      logger.info(`not found employer${employer}`);
      return next(new AppError(`This employer doesn't exist`, 400));
    }

    if (
      !languageNames ||
      !Array.isArray(languageNames) ||
      languageNames.length === 0
    ) {
      return next(new AppError(`Please specify job required languages`, 400));
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

    const newJob = repository.create({
      title,
      description,
      city,
      experienceLevel,
      employer,
      languages,
    });
    await AppDataSource.manager.save(newJob);

    logger.info(`Job ${title} has been created.`);

    res.status(200).json({
      status: "success",
      data: newJob,
    });
  }
);

export const getAllJobs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { experienceLevel, city, languageNames } = req.query;

    const query = AppDataSource.getRepository(Job)
      .createQueryBuilder("jobs")
      .leftJoin("jobs.languages", "language");

    if (experienceLevel) {
      query.andWhere("jobs.experienceLevel = :experienceLevel", {
        experienceLevel,
      });
    }

    if (city) {
      query.andWhere("jobs.city = :city", {
        city,
      });
    }

    if (languageNames) {
      const names = Array.isArray(languageNames)
        ? languageNames
        : (languageNames as string).split(",");

      query.andWhere("language.name IN (:...names)", { names });
    }

    const jobs = await query.getMany();

    if (!jobs) {
      return next(new AppError("No jobs found", 404));
    }

    res.status(200).json({
      status: "success",
      no: jobs.length,
      data: jobs,
    });
  }
);

export const getJob = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobId = req.params.id;

    const jobRepo = AppDataSource.getRepository(Job);
    const job = await jobRepo
      .createQueryBuilder("jobs")
      .leftJoinAndSelect("jobs.languages", "language")
      .where("jobs.id= :jobId", { jobId })
      .getOne();

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: job,
    });
  }
);
