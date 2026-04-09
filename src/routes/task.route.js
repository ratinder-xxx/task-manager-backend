import express from "express";
import { 
  getByProject, 
  create, 
  update, 
  updateStatus, 
  deleteOne 
} from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate, taskValidation } from "../middleware/validation.js";

const router = express.Router();

router.use(authenticate);

router.get("/projects/:projectId/tasks", getByProject);
router.post("/projects/:projectId/tasks", validate(taskValidation.create), create);
router.put("/tasks/:id", validate(taskValidation.update), update);
router.patch("/tasks/:id/status", updateStatus);
router.delete("/tasks/:id", deleteOne);

export default router;