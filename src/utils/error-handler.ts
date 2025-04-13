import { Request, Response, NextFunction } from "express";
import { logger } from "./../config/logger";
import AppError from "./app-error";

const errorHandlerMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: 500,
    status: err.name || "error",
    message: err.message || "Something went wrong , try again later ",
  };

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res
    .status(customError.statusCode)
    .json({ status: customError.status, message: customError.message });
};

export default errorHandlerMiddleware;
