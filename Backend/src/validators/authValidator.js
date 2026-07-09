import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidator = [
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

  handleValidationErrors,
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address."),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required."),

  handleValidationErrors,
];

export const changePasswordValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required."),

  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("New password must be between 8 and 16 characters long.")
    .matches(/(?=.*[A-Z])/)
    .withMessage("New password must contain at least one uppercase letter.")
    .matches(/(?=.*[!@#$%^&*(),.?":{}|<>_+\-\[\]\\\/])/)
    .withMessage("New password must contain at least one special character."),

  handleValidationErrors,
];
