const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/stats/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Projects user owns or is member of
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');

    const projectIds = projects.map((p) => p._id);

    // All tasks across those projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 7);
    const in7Days = new Date(startOfToday);
    in7Days.setDate(startOfToday.getDate() + 7);

    // Stats
    const completedTasks = allTasks.filter((t) => t.column === 'Done');
    const completedToday = completedTasks.filter((t) => new Date(t.updatedAt) >= startOfToday);
    const projectsThisWeek = projects.filter((p) => new Date(p.createdAt) >= startOfWeek);

    const upcomingDeadlines = allTasks
      .filter((t) => t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= in7Days && t.column !== 'Done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Unique team members across all projects
    const memberSet = new Set();
    memberSet.add(userId.toString());
    projects.forEach((p) => {
      p.members.forEach((m) => memberSet.add(m.user._id.toString()));
    });

    // Per-project progress
    const projectProgress = projects.map((p) => {
      const pTasks = allTasks.filter((t) => t.project.toString() === p._id.toString());
      const doneTasks = pTasks.filter((t) => t.column === 'Done');
      return {
        _id: p._id,
        title: p.title,
        color: p.color,
        description: p.description,
        owner: p.owner,
        members: p.members,
        total: pTasks.length,
        done: doneTasks.length,
        progress: pTasks.length > 0 ? Math.round((doneTasks.length / pTasks.length) * 100) : 0,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      };
    });

    // Weekly task completion (last 7 days, by day)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(startOfToday);
      day.setDate(startOfToday.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const count = completedTasks.filter((t) => {
        const updated = new Date(t.updatedAt);
        return updated >= day && updated < nextDay;
      }).length;
      weeklyData.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    // Recent activity (last 10 tasks updated)
    const recentActivity = await Task.find({ project: { $in: projectIds } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('createdBy', 'name')
      .populate('project', 'title color');

    res.json({
      stats: {
        totalProjects: projects.length,
        projectsThisWeek: projectsThisWeek.length,
        completedTasks: completedTasks.length,
        completedToday: completedToday.length,
        totalTasks: allTasks.length,
        upcomingDeadlines: upcomingDeadlines.length,
        teamMembers: memberSet.size,
      },
      projectProgress,
      upcomingDeadlines,
      weeklyData,
      recentActivity: recentActivity.map((t) => ({
        _id: t._id,
        title: t.title,
        column: t.column,
        project: t.project,
        updatedAt: t.updatedAt,
        createdBy: t.createdBy,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
