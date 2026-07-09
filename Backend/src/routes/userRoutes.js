import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  getStoresForUser,
  submitRating,
  modifyRating,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.use(requireRole("user"));

router.get("/stores", getStoresForUser);
router.post("/ratings", submitRating);
router.put("/ratings/:storeId", modifyRating);

export default router;
