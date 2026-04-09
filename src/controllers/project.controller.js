import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject, 
  addMember 
} from "../services/project.service.js";

export const getAll = async (req, res, next) => {
  try {
    const projects = await getAllProjects(req.userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id, req.userId);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const project = await createProject(req.body, req.userId);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const project = await updateProject(req.params.id, req.body, req.userId);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    await deleteProject(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addMemberToProject = async (req, res, next) => {
  try {
    const project = await addMember(req.params.id, req.body.memberId, req.userId);
    res.json(project);
  } catch (error) {
    next(error);
  }
};