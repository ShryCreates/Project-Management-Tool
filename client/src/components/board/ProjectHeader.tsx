import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import ManageMembersModal from './ManageMembersModal';
import CreateTaskModal from './CreateTaskModal';

interface Props {
  project: Project;
}

export default function ProjectHeader({ project }: Props) {
  const { deleteProject } = useProjectStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const isOwner = project.owner._id === user?._id;

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(project._id);
      toast.success('Project deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <>
      <div
        className="px-6 py-3 border-b border-slate-700 flex items-center justify-between shrink-0 gap-4"
        style={{ backgroundColor: `${project.color}18` }}
      >
        {/* Left: project identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-base"
            style={{ backgroundColor: project.color }}
          >
            {project.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white leading-tight truncate">{project.title}</h1>
            {project.description && (
              <p className="text-xs text-slate-400 leading-tight truncate">{project.description}</p>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Add Task button */}
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>

          {/* Team / Members button */}
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
            title="Manage team members"
          >
            {/* Member avatars */}
            <div className="flex -space-x-1.5">
              <div
                className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: project.color }}
                title={project.owner.name}
              >
                {project.owner.name.charAt(0).toUpperCase()}
              </div>
              {project.members.slice(0, 3).map((m) => (
                <div
                  key={m.user._id}
                  className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-700 flex items-center justify-center text-white text-xs font-bold"
                  title={m.user.name}
                >
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-700 flex items-center justify-center text-white text-xs">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-sm text-slate-300 font-medium">
              {isOwner ? 'Invite / Manage' : 'Team'}
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Delete (owner only) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Feature hint bar */}
      <div className="px-6 py-1.5 bg-slate-800/60 border-b border-slate-700/50 flex items-center gap-4 text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 3-5 2zm0 0l5 5" />
          </svg>
          Drag cards between columns
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Click any task card to assign, comment, or add checklist
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          Click <strong className="text-slate-400">Invite / Manage</strong> to add teammates
        </span>
      </div>

      {showMembers && (
        <ManageMembersModal project={project} onClose={() => setShowMembers(false)} />
      )}

      {showCreateTask && (
        <CreateTaskModal
          project={project}
          defaultColumn={project.columns[0]?.title || 'To Do'}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </>
  );
}
