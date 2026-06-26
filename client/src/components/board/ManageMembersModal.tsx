import { useState } from 'react';
import type { Project, User } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ManageMembersModal({ project, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const { addMember, removeMember } = useProjectStore();
  const { user } = useAuthStore();
  const isOwner = project.owner._id === user?._id;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      // Filter out users already in the project
      const existingIds = new Set([
        project.owner._id,
        ...project.members.map((m) => m.user._id),
      ]);
      setResults(data.filter((u: User) => !existingIds.has(u._id)));
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId: string) => {
    try {
      await addMember(project._id, userId);
      setResults((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Member added');
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await removeMember(project._id, userId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">Invite teammates to collaborate on this project</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current Members */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Current Members
            </h3>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {project.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{project.owner.name}</p>
                    <p className="text-xs text-slate-400">{project.owner.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-medium">
                  Owner
                </span>
              </div>

              {project.members.map((m) => (
                <div key={m.user._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-bold">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.user.name}</p>
                      <p className="text-xs text-slate-400">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-600 text-slate-300 rounded-full font-medium capitalize">
                      {m.role}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(m.user._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Member (owner only) */}
          {isOwner && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Add Member
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or email"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>

              {results.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {results.map((u) => (
                    <div key={u._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdd(u._id)}
                        className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {results.length === 0 && query && !searching && (
                <p className="text-xs text-slate-500 mt-2 px-1">No users found. Try a different search.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
