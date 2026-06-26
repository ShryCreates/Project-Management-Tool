const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_COLUMNS = [
  { title: 'To Do', order: 0 },
  { title: 'In Progress', order: 1 },
  { title: 'In Review', order: 2 },
  { title: 'Done', order: 3 },
];

// Helper: check if user is a project member or owner
const isMember = (project, userId) => {
  // After populate, owner is a User object — use ._id
  const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
  if (ownerId === userId.toString()) return true;
  return project.members.some((m) => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
};

// @GET /api/projects — list all projects for current user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/projects — create new project
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Project title is required'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, color } = req.body;

      const project = await Project.create({
        title,
        description,
        color: color || '#6366f1',
        owner: req.user._id,
        members: [],
        columns: DEFAULT_COLUMNS,
      });

      await project.populate('owner', 'name email avatar');

      const io = req.app.get('io');
      io.emit('project:created', project);

      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @GET /api/projects/:id — get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/projects/:id — update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can edit this project' });

    const { title, description, color, columns } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (columns) project.columns = columns;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('project:updated', project);

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/projects/:id — delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can delete this project' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    const io = req.app.get('io');
    io.emit('project:deleted', { projectId: req.params.id });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/projects/:id/members — add member
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can add members' });

    const { userId, role } = req.body;
    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });
    if (project.owner.toString() === userId)
      return res.status(400).json({ message: 'Owner is already part of the project' });

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('project:updated', project);

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/projects/:id/members/:userId — remove member
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the owner can remove members' });

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('project:updated', project);

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
