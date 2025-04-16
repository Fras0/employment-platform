import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";

import { AppDataSource } from "../config/data-source";

import { Job } from "../models/job";
import { logger } from "../config/logger";
import { Application } from "../models/application";
import { Employee } from "../models/employee";
import { Employer } from "../models/employer";

import { sendEmail } from "../services/email.service";

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
      .leftJoinAndSelect("applications.job", "job")
      .where("employee.id = :empId", { empId: employee.id })
      .andWhere("job.id = :jobId", { jobId: jobId })
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
      .leftJoinAndSelect("employee.user", "user")
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

export const haveIAppliedToThisJob = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobId = Number(req.params.jobId);
    const empId = req.employee?.id;
    const appRepo = AppDataSource.getRepository(Application);

    if (!empId) {
      return next(new AppError(`No employee provided`, 400));
    }

    const employee = await Employee.findOne({ where: { id: empId } });

    if (!employee) {
      return next(new AppError(`This employee is not available`, 400));
    }

    const applications = await appRepo
      .createQueryBuilder("applications")
      .leftJoin("applications.employee", "employee")
      .leftJoinAndSelect("applications.job", "job")
      .where("applications.employeeId = :empId", { empId })
      .getMany();

    if (!applications) {
      return next(new AppError("No applications found for this user", 404));
    }

    const hasApplied = applications.some((app) => app.job?.id === jobId);

    res.status(200).json({
      status: "success",
      hasApplied,
    });
  }
);
export const getEmployeeApplications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const empId = req.employee?.id;
    const appRepo = AppDataSource.getRepository(Application);

    if (!empId) {
      return next(new AppError(`No employee provided`, 400));
    }

    const employee = await Employee.findOne({ where: { id: empId } });

    if (!employee) {
      return next(new AppError(`This employee is not available`, 400));
    }

    const applications = await appRepo
      .createQueryBuilder("applications")
      .leftJoin("applications.employee", "employee")
      .leftJoinAndSelect("applications.job", "job")
      .leftJoinAndSelect("job.employer", "employer")
      .where("applications.employeeId = :empId", { empId })
      .getMany();

    if (!applications) {
      return next(new AppError("No applications found for this user", 404));
    }

    res.status(200).json({
      status: "success",
      no: applications.length,
      data: applications,
    });
  }
);
export const getEmployerApplications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const empId = req.employer?.id;
    const appRepo = AppDataSource.getRepository(Application);

    if (!empId) {
      return next(new AppError(`No employee provided`, 400));
    }

    const employer = await Employer.findOne({ where: { id: empId } });

    if (!employer) {
      return next(new AppError(`This employee is not available`, 400));
    }

    const applications = await appRepo
      .createQueryBuilder("applications")
      .leftJoinAndSelect("applications.job", "job")
      .leftJoinAndSelect("job.employer", "employer")
      .where("job.employerId = :empId", { empId })
      .getMany();

    if (!applications) {
      return next(new AppError("No applications found for this user", 404));
    }

    res.status(200).json({
      status: "success",
      no: applications.length,
      data: applications,
    });
  }
);

export const acceptApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const applicationId = Number(req.params.applicationId);
    const employerId = req.employer?.id;

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

    if (job.employer.id !== employerId) {
      return next(new AppError(`This job is not yours`, 403));
    }

    application.status = "accepted";

    // await sendEmail(
    //   "whiteonion00@gmail.com", //replace this with user.email
    //   "accepted application",
    //   `<h1>Hello!</h1><p>You are good come work with us</p>`
    // );

    await application.save();

    res.status(200).json({
      status: "success",
      data: application,
    });
  }
);
export const rejectApplication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const applicationId = Number(req.params.applicationId);
    const employerId = req.employer?.id;

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

    if (job.employer.id !== employerId) {
      return next(new AppError(`This job is not yours`, 403));
    }

    application.status = "rejected";

    // await sendEmail(
    //   "whiteonion00@gmail.com", //replace this with user.email
    //   "YOU ARE REJECTED!",
    //   `<h1>Hello!</h1><p>we regret THAT YOUR ARE BAD AND DON'T DESERVE TO WORK WITH US!!!!!!!</p>`
    // );

    await application.save();

    res.status(200).json({
      status: "success",
      data: application,
    });
  }
);
