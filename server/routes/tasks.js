const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

const isMember = (project, userId) => {
  const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
  if (ownerId === userId.toString()) return true;
  return project.members.some((m) => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
};

// @GET /api/tasks?projectId=xxx — get all tasks for a project
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/tasks — create task
router.post(
  '/',
  protect,
  [body('title').trim().notEmpty().withMessage('Task title is required'),
   body('project').notEmpty().withMessage('Project ID is required'),
   body('column').notEmpty().withMessage('Column is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, project: projectId, column, assignee, priority, dueDate, labels } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (!isMember(project, req.user._id))
        return res.status(403).json({ message: 'Access denied' });

      // Set order to end of column
      const lastTask = await Task.findOne({ project: projectId, column }).sort({ order: -1 });
      const order = lastTask ? lastTask.order + 1 : 0;

      const task = await Task.create({
        title,
        description,
        project: projectId,
        column,
        assignee: assignee || null,
        createdBy: req.user._id,
        priority: priority || 'medium',
        dueDate: dueDate || null,
        labels: labels || [],
        order,
      });

      await task.populate('assignee', 'name email avatar');
      await task.populate('createdBy', 'name email avatar');

      const io = req.app.get('io');
      io.to(`project:${projectId}`).emit('task:created', task);

      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @GET /api/tasks/:id — get single task
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/tasks/:id — update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    const allowed = ['title', 'description', 'column', 'assignee', 'priority', 'dueDate', 'labels', 'order', 'checklist'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    const io = req.app.get('io');
    io.to(`project:${task.project}`).emit('task:updated', task);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/tasks/:id — delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    const projectId = task.project.toString();
    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();

    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:deleted', { taskId: req.params.id, projectId });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
