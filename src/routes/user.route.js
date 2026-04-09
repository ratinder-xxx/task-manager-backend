import express from "express";
import { getAllUsers, getProjectMembers, removeMember } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/users", getAllUsers);
router.get("/projects/:projectId/members", getProjectMembers);
router.delete("/projects/:projectId/members/:memberId", removeMember);

export default router;