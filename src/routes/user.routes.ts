const express = require("express");
const router = express.Router();

import {
  signUp,
  logout,
  refreshToken,
  login,
} from "../controllers/auth.controller";
import {
  getAllCandidates,
  getMe,
  getUser,
} from "../controllers/user.controller";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refreshToken").post(refreshToken);

router.use(protect);

router.route("/candidates").get(getAllCandidates);

router.route("/me").get(getMe, getUser);
router.route("/:id").get(getUser);

export default router;
