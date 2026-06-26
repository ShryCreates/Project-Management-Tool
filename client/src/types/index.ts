export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Member {
  user: User;
  role: 'admin' | 'member' | 'viewer';
}

export interface Column {
  _id?: string;
  title: string;
  order: number;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  color: string;
  owner: User;
  members: Member[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  _id?: string;
  text: string;
  done: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  column: string;
  assignee?: User | null;
  createdBy: User;
  priority: Priority;
  dueDate?: string | null;
  labels: string[];
  order: number;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  task: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'task' | 'comment' | 'project' | 'member';
  projectId?: string;
  taskId?: string;
  timestamp: Date;
  read: boolean;
}
