const express = require("express");
const router = express.Router();

import {
  signUp,
  logout,
  refreshToken,
  login,
} from "../controllers/auth.controller";


router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refreshToken").post(refreshToken);

export default router;
