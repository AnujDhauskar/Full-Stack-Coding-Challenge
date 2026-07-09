import express from "express";
import {
  register,
  login,
  logout,
  changePassword,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePasswordValidator, changePassword);
router.get("/me", protect, getMe);

export default router;
