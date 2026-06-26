const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
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

// @GET /api/comments?taskId=xxx
router.get('/', protect, async (req, res) => {
  try {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ message: 'taskId is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: 'Access denied' });

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/comments
router.post(
  '/',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment text is required'),
   body('task').notEmpty().withMessage('Task ID is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { text, task: taskId } = req.body;

      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const project = await Project.findById(task.project);
      if (!isMember(project, req.user._id))
        return res.status(403).json({ message: 'Access denied' });

      const comment = await Comment.create({ text, task: taskId, author: req.user._id });
      await comment.populate('author', 'name email avatar');

      const io = req.app.get('io');
      io.to(`project:${task.project}`).emit('comment:created', {
        comment,
        taskId,
        projectId: task.project,
      });
      io.to(`project:${task.project}`).emit('task:updated', {
        ...task.toObject(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @PUT /api/comments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to edit this comment' });

    comment.text = req.body.text || comment.text;
    await comment.save();
    await comment.populate('author', 'name email avatar');

    const task = await Task.findById(comment.task);
    const io = req.app.get('io');
    io.to(`project:${task.project}`).emit('comment:updated', comment);
    io.to(`project:${task.project}`).emit('task:updated', {
      ...task.toObject(),
      updatedAt: new Date().toISOString(),
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete this comment' });

    const task = await Task.findById(comment.task);
    await comment.deleteOne();

    const io = req.app.get('io');
    io.to(`project:${task.project}`).emit('comment:deleted', {
      commentId: req.params.id,
      taskId: comment.task,
    });
    io.to(`project:${task.project}`).emit('task:updated', {
      ...task.toObject(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
