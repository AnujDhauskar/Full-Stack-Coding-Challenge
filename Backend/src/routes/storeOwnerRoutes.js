import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { getOwnerDashboard } from "../controllers/storeOwnerController.js";

const router = express.Router();

router.use(protect);
router.use(requireRole("store_owner"));

router.get("/dashboard", getOwnerDashboard);

export default router;
