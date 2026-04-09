import Project from "../models/project.model.js";
import Task from "../models/task.model.js";

export const getAllProjects = async (userId) => {
  return await Project.find({
    $or: [{ owner: userId }, { members: userId }]
  }).populate("owner", "username email");
};

export const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }]
  }).populate("owner members", "username email");
  
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};

export const createProject = async (projectData, userId) => {
  const project = new Project({
    ...projectData,
    owner: userId,
    members: [userId]
  });
  await project.save();
  return project;
};

export const updateProject = async (projectId, updateData, userId) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, owner: userId },
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  return project;
};

export const deleteProject = async (projectId, userId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  await Task.deleteMany({ projectId: projectId });
  return project;
};

export const addMember = async (projectId, memberId, userId) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, owner: userId },
    { $addToSet: { members: memberId } },
    { new: true }
  );
  
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  return project;
};