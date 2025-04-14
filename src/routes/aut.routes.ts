const express = require("express");
const router = express.Router();

import {
  signUp,
  logout,
  refreshToken,
  login,
} from "../controllers/auth.controller";

import { protect } from "../middleware/protect";

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refreshToken").post(refreshToken);

router.use(protect);

export default router;
