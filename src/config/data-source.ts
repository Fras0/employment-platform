import { DataSource } from "typeorm";

import { User } from "../models/user";
import { Employer } from "../models/employer";
import { Employee } from "../models/employee";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST, //localhost
  username: process.env.DB_USERNAME, // postgres
  password: process.env.DB_PASSWORD, // 123@123
  port: parseInt(process.env.DB_PORT || "5432"), //5432
  database: process.env.DB_NAME, // blood-bank
  ssl: false,
  entities: [User, Employer, Employee],
  synchronize: true,
  logging: true,
});
