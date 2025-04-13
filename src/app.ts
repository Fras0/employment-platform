import { NextFunction, Request, Response } from "express";
const express = require("express");
const morgan = require("morgan");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: "https://kzmncywmmz7fco1u8tw6.lite.vusercontent.net", // origin for my vercel app
  credentials: true,
};

app.use(cors(corsOptions));

import userRoutes from "./routes/user.routes";
import jobRoutes from "./routes/job.routes";

import AppError from "./utils/app-error";
import errorHandlerMiddleware from "./utils/error-handler";

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const origin = req.headers.origin;
//   console.log("Request Origin:", origin);
//   next();
// });

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

app.all("*splat", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandlerMiddleware);

module.exports = app;
