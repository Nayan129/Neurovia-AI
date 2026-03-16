import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  getMe,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 */
authRouter.post("/login", loginValidator, login);

/**
 * @route GET /api/auth/get-me
  Get current logged in user's details
 * @access Private
 */
authRouter.get("/get-me", authUser, getMe);

/**
 * @route GET /api/auth/verify-email
 */
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
