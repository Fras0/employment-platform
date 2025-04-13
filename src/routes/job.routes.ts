const express = require("express");
const router = express.Router();

import { addJob, getAllJobs, getJob } from "../controllers/job.controller";
import Role from "../enums/role";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";

router.use(protect);

router.route("/").get(getAllJobs).post(restrictTo(Role.EMPLOYER), addJob);
router.route("/:id").get(getJob);

export default router;
