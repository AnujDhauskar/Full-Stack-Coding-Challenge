import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  getDashboardStats,
  addUser,
  getUsers,
  getUserDetails,
  addStore,
  getStores,
} from "../controllers/adminController.js";
import {
  adminAddUserValidator,
  adminAddStoreValidator,
} from "../validators/adminValidator.js";

const router = express.Router();

// Apply auth protection & role check to all routes
router.use(protect);
router.use(requireRole("admin"));

router.get("/dashboard", getDashboardStats);
router.post("/users", adminAddUserValidator, addUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.post("/stores", adminAddStoreValidator, addStore);
router.get("/stores", getStores);

export default router;
