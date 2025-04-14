const express = require("express");
const router = express.Router();

import {
  addJob,
  getAllJobs,
  getEmployerJobs,
  getJob,
  recommendJobs,
} from "../controllers/job.controller";
import Role from "../enums/role";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";

router.use(protect);

router.route("/").get(getAllJobs).post(restrictTo(Role.EMPLOYER), addJob);

router.route("/employer").get(restrictTo(Role.EMPLOYER), getEmployerJobs);
router
  .route("/employee/recommendations")
  .get(restrictTo(Role.EMPLOYEE), recommendJobs);

router.route("/:id").get(getJob);

export default router;
