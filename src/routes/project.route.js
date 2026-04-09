import express from "express";
import { 
  getAll, 
  getById, 
  create, 
  update, 
  deleteOne, 
  addMemberToProject 
} from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate, projectValidation } from "../middleware/validation.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAll);
router.post("/", validate(projectValidation.create), create);
router.get("/:id", getById);
router.put("/:id", validate(projectValidation.update), update);
router.delete("/:id", deleteOne);
router.post("/:id/members", addMemberToProject);

export default router;