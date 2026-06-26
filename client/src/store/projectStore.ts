import { create } from 'zustand';
import type { Project } from '../types';
import api from '../lib/axios';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: { title: string; description?: string; color?: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string, role?: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  socketUpdateProject: (project: Project) => void;
  socketDeleteProject: (projectId: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/projects');
      set({ projects: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/projects/${id}`);
      set({ currentProject: data, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err; // re-throw so BoardPage .catch() fires
    }
  },

  createProject: async (payload) => {
    const { data } = await api.post('/projects', payload);
    set((s) => ({ projects: [data, ...s.projects] }));
    return data;
  },

  updateProject: async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? data : p)),
      currentProject: s.currentProject?._id === id ? data : s.currentProject,
    }));
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set((s) => ({
      projects: s.projects.filter((p) => p._id !== id),
      currentProject: s.currentProject?._id === id ? null : s.currentProject,
    }));
  },

  addMember: async (projectId, userId, role = 'member') => {
    const { data } = await api.post(`/projects/${projectId}/members`, { userId, role });
    set((s) => ({
      projects: s.projects.map((p) => (p._id === projectId ? data : p)),
      currentProject: s.currentProject?._id === projectId ? data : s.currentProject,
    }));
  },

  removeMember: async (projectId, userId) => {
    const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === projectId ? data : p)),
      currentProject: s.currentProject?._id === projectId ? data : s.currentProject,
    }));
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  socketUpdateProject: (project) => {
    set((s) => ({
      projects: s.projects.map((p) => (p._id === project._id ? project : p)),
      currentProject: s.currentProject?._id === project._id ? project : s.currentProject,
    }));
  },

  socketDeleteProject: (projectId) => {
    set((s) => ({
      projects: s.projects.filter((p) => p._id !== projectId),
      currentProject: s.currentProject?._id === projectId ? null : s.currentProject,
    }));
  },
}));
