const express = require("express");
const router = express.Router();

import {
  acceptApplication,
  addApplication,
  downloadPDF,
  getEmployeeApplications,
  getEmployerApplications,
  getJobApplications,
  haveIAppliedToThisJob,
  rejectApplication,
} from "../controllers/application.controller";

import Role from "../enums/role";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";
import { upload } from "../utils/multer";

router.use(protect);

router.route("/apply/:jobId").post(restrictTo(Role.EMPLOYEE), upload.single("resume"), addApplication);
router
  .route("/check/:jobId")
  .get(restrictTo(Role.EMPLOYEE), haveIAppliedToThisJob);
router
  .route("/employee")
  .get(restrictTo(Role.EMPLOYEE), getEmployeeApplications);

router
  .route("/employer")
  .get(restrictTo(Role.EMPLOYER), getEmployerApplications);

router.route("/job/:jobId").get(getJobApplications);

router
  .route("/:applicationId/accept")
  .post(restrictTo(Role.EMPLOYER), acceptApplication);
router
  .route("/:applicationId/reject")
  .post(restrictTo(Role.EMPLOYER), rejectApplication);
router
  .route("/:applicationId/downloadResume")
  .get(restrictTo(Role.EMPLOYER), downloadPDF);

export default router;
