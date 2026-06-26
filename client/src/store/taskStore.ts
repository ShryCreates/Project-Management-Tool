import { create } from 'zustand';
import type { Task } from '../types';
import api from '../lib/axios';

interface CreateTaskPayload {
  title: string;
  description?: string;
  project: string;
  column: string;
  assignee?: string;
  priority?: string;
  dueDate?: string;
  labels?: string[];
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newColumn: string, newOrder: number) => Promise<void>;
  socketAddTask: (task: Task) => void;
  socketUpdateTask: (task: Task) => void;
  socketDeleteTask: (taskId: string) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (projectId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      set({ tasks: data });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (payload) => {
    const { data } = await api.post('/tasks', payload);
    // Don't add here — the socket event 'task:created' will handle it
    // But since the user creating it may not receive their own socket event reliably,
    // we add it directly and the socketAddTask deduplicates
    set((s) => {
      const exists = s.tasks.some((t) => t._id === data._id);
      return exists ? s : { tasks: [...s.tasks, data] };
    });
    return data;
  },

  updateTask: async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload);
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === id ? data : t)) }));
    return data;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
  },

  moveTask: async (taskId, newColumn, newOrder) => {
    const task = get().tasks.find((t) => t._id === taskId);
    if (!task) return;
    // Optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t._id === taskId ? { ...t, column: newColumn, order: newOrder } : t
      ),
    }));
    try {
      await api.put(`/tasks/${taskId}`, { column: newColumn, order: newOrder });
    } catch {
      // Revert on error
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t._id === taskId ? { ...t, column: task.column, order: task.order } : t
        ),
      }));
    }
  },

  socketAddTask: (task) => {
    set((s) => {
      const exists = s.tasks.some((t) => t._id === task._id);
      return exists ? s : { tasks: [...s.tasks, task] };
    });
  },

  socketUpdateTask: (task) => {
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === task._id ? task : t)) }));
  },

  socketDeleteTask: (taskId) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== taskId) }));
  },

  clearTasks: () => set({ tasks: [] }),
}));
