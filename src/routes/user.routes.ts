const express = require("express");
const router = express.Router();

import {
  getAllCandidates,
  getMe,
  getProfileViews,
  getUser,
} from "../controllers/user.controller";
import Role from "../enums/role";
import { protect } from "../middleware/protect";

router.use(protect);

router.route("/candidates").get(getAllCandidates);

router.route("/me").get(getMe, getUser);
router.route("/views").get(getProfileViews);
router.route("/:id").get(getUser);

export default router;
