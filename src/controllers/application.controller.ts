import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";

import { Job } from "../models/job";
import { logger } from "../config/logger";
import { Application } from "../models/application";

export const addApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobId = Number(req.params.jobId);

    const employee = req.employee ?? undefined;
    if (!employee) {
      return next(new AppError(`You are not employee`, 400));
    }

    if (!jobId) {
      return next(new AppError(`No job provided`, 400));
    }

    const job = await Job.findOne({ where: { id: jobId } });

    if (!job) {
      return next(new AppError(`This job is not available`, 400));
    }

    const appRepo = AppDataSource.getRepository(Application);
    const applicant = await appRepo
      .createQueryBuilder("applications")
      .leftJoinAndSelect("applications.employee", "employee")
      .where("employee.id = :empId", { empId: employee.id })
      .getOne();

    if (applicant) {
      return next(new AppError(`You already applied for this job`, 400));
    }

    const repository = AppDataSource.getRepository(Application);

    const newApplication = repository.create({
      employee,
      job,
    });
    await AppDataSource.manager.save(newApplication);

    logger.info(`You applied successfully to ${job.title}.`);

    res.status(200).json({
      status: "success",
      data: newApplication,
    });
  }
);

export const getJobApplications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobId = Number(req.params.jobId);
    const appRepo = AppDataSource.getRepository(Application);

    if (!jobId) {
      return next(new AppError(`No job provided`, 400));
    }

    const job = await Job.findOne({ where: { id: jobId } });

    if (!job) {
      return next(new AppError(`This job is not available`, 400));
    }

    const applications = await appRepo
      .createQueryBuilder("applications")
      .leftJoinAndSelect("applications.job", "job")
      .leftJoinAndSelect("applications.employee", "employee")
      .where("applications.jobId = :jobId", { jobId })
      .getMany();

    if (!applications) {
      return next(new AppError("No applications found for this job", 404));
    }

    res.status(200).json({
      status: "success",
      no: applications.length,
      data: applications,
    });
  }
);

export const respondToApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const applicationId = Number(req.params.applicationId);
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
      return next(
        new AppError(`Provide valid status (rejected/accepted)`, 400)
      );
    }

    const application = await Application.findOne({
      where: { id: applicationId },
      relations: ["job"],
    });

    if (!application) {
      return next(new AppError(`No application with that id`, 404));
    }

    const job = await Job.findOne({
      where: { id: application?.job.id },
      relations: ["employer"],
    });

    if (!job) {
      return next(new AppError(`This job is not available`, 400));
    }

    if (job.employer.id !== req.employer?.id) {
      return next(new AppError(`This job is not yours`, 400));
    }

    application.status = status;

    await application.save();

    res.status(200).json({
      status: "success",
      data: application,
    });
  }
);
