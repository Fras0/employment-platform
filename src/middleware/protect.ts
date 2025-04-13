const jwt = require("jsonwebtoken");
import AppError from "../utils/app-error";
import { User } from "../models/user";
import { Request, Response, NextFunction } from "express";
import { promisify } from "util";
import asyncHandler from "../utils/async-handler";
import { AppDataSource } from "../config/data-source";
import { Employee } from "../models/employee";
import { Employer } from "../models/employer";

interface DecodedToken {
  id: string;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If token doesn't exist, return an error response
    if (!token) {
      return next(new AppError("There is no access token, please log in", 401)); // Immediately return, do not call next() further
    }

    // Verify the token
    const decoded = (await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_ACCESS as string
    )) as DecodedToken;

    const userRepo = AppDataSource.getRepository(User);
    const currentUser = await userRepo
      .createQueryBuilder("users")
      .where("id= :id", { id: decoded.id })
      .getOne();

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    let currentEmployee;
    let currentEmployer;
    if (currentUser.role === "employee") {
      console.log(currentUser);
      const employeeRepo = AppDataSource.getRepository(Employee);
      currentEmployee = await employeeRepo
        .createQueryBuilder("employee")
        .where("employee.userId= :id", { id: currentUser.id })
        .getOne();
    } else if (currentUser.role === "employer") {
      const employerRepo = AppDataSource.getRepository(Employer);
      currentEmployer = await employerRepo
        .createQueryBuilder("employer")
        .where("employer.userId= :id", { id: currentUser.id })
        .getOne();
    }

    // Attach user to the request object for further middleware/controllers
    req.user = currentUser;
    req.employer = currentEmployer;
    req.employee = currentEmployee;
    next(); // Proceed to the next middleware/controller
  }
);
