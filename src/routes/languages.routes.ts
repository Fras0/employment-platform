const express = require("express");
const router = express.Router();

import { getProgrammingLanguages } from "../controllers/languages.controller";
import Role from "../enums/role";
import { protect } from "../middleware/protect";
import { restrictTo } from "../middleware/restrictTo";

router.use(protect);

router.route("/").get(getProgrammingLanguages);

export default router;
