import { 
  getTasksByProject, 
  createTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from "../services/task.service.js";

export const getByProject = async (req, res, next) => {
  try {
    const tasks = await getTasksByProject(req.params.projectId, req.userId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const task = await createTask(req.body, req.params.projectId, req.userId);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const task = await updateTask(req.params.id, req.body, req.userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const task = await updateTaskStatus(req.params.id, req.body.status, req.userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    await deleteTask(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};