const express = require("express");
const router = express.Router();

import {
  addApplication,
  getJobApplications,
  respondToApplication,
} from "../controllers/application.controller";
import {
  addJob,
  getAllJobs,
  getJob,
  recommendJobs,
} from "../controllers/job.controller";
import Role from "../enums/role";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";

router.use(protect);

router.route("/").get(getAllJobs).post(restrictTo(Role.EMPLOYER), addJob);

router.route("/recommendations").get(restrictTo(Role.EMPLOYEE), recommendJobs);

router
  .route("/applications/:applicationId")
  .patch(restrictTo(Role.EMPLOYER), respondToApplication);

router.route("/:id").get(getJob);
router.route("/:jobId/apply").post(restrictTo(Role.EMPLOYEE), addApplication);
router.route("/:jobId/applications").post(getJobApplications);

export default router;
