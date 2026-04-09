import express from "express";
import { register, login, getMe, logout } from "../controllers/auth.controller.js";
import { validate, userValidation } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validate(userValidation.register), register);
router.post("/login", validate(userValidation.login), login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;