import User from "../models/user.model.js";
import Project from "../models/project.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    const users = await User.find(query)
      .select("-password")
      .limit(20);
    
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "username email role")
      .populate("members", "username email role");
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json({
      owner: project.owner,
      members: project.members
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, owner: req.userId },
      { $pull: { members: req.params.memberId } },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: "Project not found or unauthorized" });
    }
    
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};