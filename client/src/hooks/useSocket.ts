import { useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Task, Project, Comment } from '../types';

export const useSocketEvents = (projectId?: string) => {
  const { socketAddTask, socketUpdateTask, socketDeleteTask } = useTaskStore();
  const { socketUpdateProject, socketDeleteProject } = useProjectStore();
  const { addNotification } = useNotificationStore();

  // Track the current user's own socket ID so we skip self-events that
  // were already applied optimistically via the API response
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const onTaskCreated = (task: Task) => {
      // socketAddTask already deduplicates by _id
      socketAddTask(task);
      addNotification({
        message: `New task created: "${task.title}"`,
        type: 'task',
        projectId: task.project,
        taskId: task._id,
      });
    };

    const onTaskUpdated = (task: Task) => socketUpdateTask(task);

    const onTaskDeleted = ({ taskId }: { taskId: string }) => socketDeleteTask(taskId);

    const onProjectUpdated = (project: Project) => socketUpdateProject(project);

    const onProjectDeleted = ({ projectId }: { projectId: string }) => socketDeleteProject(projectId);

    const onCommentCreated = ({ comment, taskId }: { comment: Comment; taskId: string }) => {
      addNotification({
        message: `${comment.author.name} commented on a task`,
        type: 'comment',
        projectId,
        taskId,
      });
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('project:updated', onProjectUpdated);
    socket.on('project:deleted', onProjectDeleted);
    socket.on('comment:created', onCommentCreated);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('project:updated', onProjectUpdated);
      socket.off('project:deleted', onProjectDeleted);
      socket.off('comment:created', onCommentCreated);
    };
  }, [projectId]);
};
