import { body } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

export const adminAddUserValidator = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters long."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be between 8 and 16 characters long.")
    .matches(/(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/(?=.*[!@#$%^&*(),.?":{}|<>_+\-\[\]\\\/])/)
    .withMessage("Password must contain at least one special character."),

  body("address")
    .trim()
    .isLength({ max: 400 })
    .withMessage("Address cannot exceed 400 characters.")
    .notEmpty()
    .withMessage("Address is required."),

  body("role")
    .isIn(["admin", "user", "store_owner"])
    .withMessage("Role must be one of: admin, user, store_owner."),

  handleValidationErrors,
];

export const adminAddStoreValidator = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Store Name must be between 20 and 60 characters long."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid store email address.")
    .normalizeEmail(),

  body("address")
    .trim()
    .isLength({ max: 400 })
    .withMessage("Address cannot exceed 400 characters.")
    .notEmpty()
    .withMessage("Address is required."),

  body("owner_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Owner ID must be an integer."),

  handleValidationErrors,
];
