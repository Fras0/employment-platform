const jwt = require("jsonwebtoken");
import { Response } from "express";
import { User } from "../models/user";
import Role from "../enums/role";

interface CookieOptions {
  expires: Date;
  secure: boolean;
  httpOnly: boolean;
}

const generateAccessToken = (id: string, role: Role): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET_ACCESS as string, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (id: string, role: Role): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET_REFRESH as string, {
    expiresIn: "3d",
  });
};

export const createSendAccessRefresh = async (
  user: User,
  statusCode: number,
  res: Response
): Promise<void> => {
  // 1) CREATE ACCESS AND REFRESH TOKENS
  const accessToken = generateAccessToken(user.id.toString(), user.role);
  const refreshToken = generateRefreshToken(user.id.toString(), user.role);

  // 2) SET OPTIONS FOR COOKIES
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 DAYS
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  // 3) ADD THE REFRESH TOKEN IN THE COOKIES
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // 4) ADD THE REFRESH TOKEN FOR THE USER IN THE DATABASE
  user.refreshToken = refreshToken;

  await user.save();

  // 5) ALLOW ACCESS FOR THE USER BY GIVING ACCESS TOKEN TO HIM
  user.password = ""; // Ensure password is not included
  user.refreshToken = null; // Ensure refresh token is not included

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: {
      user,
    },
  });
};
