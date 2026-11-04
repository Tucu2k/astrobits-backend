import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import {
  registerUserSchema,
  loginUserSchema
} from "../schemas/user.schema";

const router = Router();

router.post(
  "/register",
  validate(registerUserSchema),
  registerUser
);

router.post(
  "/login",
  validate(loginUserSchema),
  loginUser
);

export default router;
