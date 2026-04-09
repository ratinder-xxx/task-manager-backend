import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

export const getTasksByProject = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }]
  });
  
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  
  return await Task.find({ projectId }).populate("assignee createdBy", "username email");
};

export const createTask = async (taskData, projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }]
  });
  
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  
  const task = new Task({
    ...taskData,
    projectId,
    createdBy: userId
  });
  await task.save();
  return await task.populate("assignee createdBy", "username email");
};

export const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findById(taskId).populate("projectId");
  if (!task) {
    throw new Error("Task not found");
  }
  
  const project = await Project.findOne({
    _id: task.projectId._id,
    $or: [{ owner: userId }, { members: userId }]
  });
  
  if (!project) {
    throw new Error("Unauthorized");
  }
  
  Object.assign(task, updateData);
  await task.save();
  return await task.populate("assignee createdBy", "username email");
};

export const updateTaskStatus = async (taskId, status, userId) => {
  const task = await Task.findById(taskId).populate("projectId");
  if (!task) {
    throw new Error("Task not found");
  }
  
  const project = await Project.findOne({
    _id: task.projectId._id,
    $or: [{ owner: userId }, { members: userId }]
  });
  
  if (!project) {
    throw new Error("Unauthorized");
  }
  
  task.status = status;
  await task.save();
  return await task.populate("assignee createdBy", "username email");
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate("projectId");
  if (!task) {
    throw new Error("Task not found");
  }
  
  const project = await Project.findOne({
    _id: task.projectId._id,
    $or: [{ owner: userId }, { members: userId }]
  });
  
  if (!project) {
    throw new Error("Unauthorized");
  }
  
  await task.deleteOne();
  return task;
};