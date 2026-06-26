import { useEffect, useState, type FormEvent } from 'react';
import type { Comment, Project, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  task: Task;
  project: Project;
  onClose: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-slate-300 bg-slate-600',
  medium: 'text-blue-300 bg-blue-500/20',
  high: 'text-amber-300 bg-amber-500/20',
  urgent: 'text-red-300 bg-red-500/20',
};

type Tab = 'details' | 'comments' | 'checklist';

export default function TaskDetailModal({ task: initialTask, project, onClose }: Props) {
  const { updateTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();

  const [task, setTask] = useState<Task>(initialTask);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const storeTask = useTaskStore((s) => s.tasks.find((t) => t._id === task._id));
  useEffect(() => { if (storeTask) setTask(storeTask); }, [storeTask]);
  useEffect(() => { fetchComments(); }, [task._id]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments?taskId=${task._id}`);
      setComments(data);
    } catch {}
  };

  const handleSave = async () => {
    try {
      await updateTask(task._id, { title: editTitle, description: editDesc });
      setEditing(false);
      toast.success('Task updated');
    } catch { toast.error('Failed to update task'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(task._id);
      toast.success('Task deleted');
      onClose();
    } catch { toast.error('Failed to delete task'); }
  };

  const handleFieldUpdate = async (field: Partial<Task>) => {
    try { await updateTask(task._id, field); }
    catch { toast.error('Failed to update'); }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await api.post('/comments', { text: commentText, task: task._id });
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch { toast.error('Failed to add comment'); }
    finally { setLoadingComment(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleToggleChecklist = async (index: number) => {
    const updated = task.checklist.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    try { await updateTask(task._id, { checklist: updated }); }
    catch {}
  };

  const handleAddChecklist = async (text: string) => {
    if (!text.trim()) return;
    const updated = [...task.checklist, { text, done: false }];
    try { await updateTask(task._id, { checklist: updated }); }
    catch {}
  };

  const allMembers = [{ user: project.owner, role: 'admin' as const }, ...project.members];
  const doneCount = task.checklist.filter((c) => c.done).length;
  const checklistProgress = task.checklist.length > 0
    ? Math.round((doneCount / task.checklist.length) * 100) : 0;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'details', label: '📋 Details' },
    { key: 'comments', label: '💬 Comments', badge: comments.length },
    { key: 'checklist', label: '✅ Checklist', badge: task.checklist.length > 0 ? doneCount : undefined },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col modal-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-slate-700 shrink-0 gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-700 border border-indigo-500 rounded-lg text-white font-semibold text-lg focus:outline-none"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-semibold text-white leading-snug">{task.title}</h2>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
              <span className="text-xs text-slate-500">in <span className="text-slate-400 font-medium">{task.column}</span></span>
              {task.dueDate && (
                <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-slate-400'}`}>
                  Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">Save</button>
                <button onClick={() => { setEditing(false); setEditTitle(task.title); setEditDesc(task.description || ''); }} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg transition">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Edit title">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete task">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-700 px-5 shrink-0 bg-slate-800/50">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ──────── DETAILS TAB ──────── */}
          {activeTab === 'details' && (
            <div className="space-y-5">

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                {editing ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-sm text-slate-300 whitespace-pre-wrap min-h-[36px]">
                    {task.description || <span className="text-slate-500 italic">No description — click edit to add one</span>}
                  </p>
                )}
              </div>

              {/* Assign to + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    👤 Assigned To
                  </label>
                  <select
                    value={task.assignee?._id || ''}
                    onChange={(e) => handleFieldUpdate({ assignee: e.target.value || null } as any)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— Unassigned —</option>
                    {allMembers.map((m) => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                  {task.assignee && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 inline-flex items-center justify-center text-white text-xs font-bold">
                        {task.assignee.name.charAt(0)}
                      </span>
                      Assigned to <span className="text-slate-300">{task.assignee.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    📌 Status / Column
                  </label>
                  <select
                    value={task.column}
                    onChange={(e) => handleFieldUpdate({ column: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {project.columns.map((c) => (
                      <option key={c.title} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority + Due date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">🚦 Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleFieldUpdate({ priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                      <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">📅 Due Date</label>
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleFieldUpdate({ dueDate: e.target.value || null } as any)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Labels */}
              {task.labels.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">🏷️ Labels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((l) => (
                      <span key={l} className="px-2.5 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs border border-slate-600">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick nav to other tabs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
                <button
                  onClick={() => setActiveTab('comments')}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">💬</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Comments</p>
                    <p className="text-xs text-slate-400">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Checklist</p>
                    <p className="text-xs text-slate-400">{doneCount}/{task.checklist.length} done</p>
                  </div>
                </button>
              </div>

              {/* Meta */}
              <p className="text-xs text-slate-600 pt-1">
                Created by <span className="text-slate-500">{task.createdBy.name}</span> · {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          )}

          {/* ──────── COMMENTS TAB ──────── */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
                <span>💬</span>
                <span>Comments are visible to all project members in real-time.</span>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-400 font-medium">No comments yet</p>
                  <p className="text-slate-500 text-sm mt-1">Be the first to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-slate-700/50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-white">{comment.author.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                            {comment.author._id === user?._id && (
                              <button onClick={() => handleDeleteComment(comment._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-3 pt-2 border-t border-slate-700">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(e as any); }
                    }}
                    placeholder="Write a comment… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition resize-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingComment || !commentText.trim()}
                    className="self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
                  >
                    {loadingComment ? 'Posting…' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ──────── CHECKLIST TAB ──────── */}
          {activeTab === 'checklist' && (
            <ChecklistTab
              checklist={task.checklist}
              progress={checklistProgress}
              doneCount={doneCount}
              total={task.checklist.length}
              onToggle={handleToggleChecklist}
              onAdd={handleAddChecklist}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistTab({
  checklist, progress, doneCount, total, onToggle, onAdd,
}: {
  checklist: Task['checklist'];
  progress: number;
  doneCount: number;
  total: number;
  onToggle: (i: number) => void;
  onAdd: (text: string) => void;
}) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) { onAdd(newItem.trim()); setNewItem(''); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/30 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
        <span>✅</span>
        <span>Break this task into smaller steps. Check them off as you go.</span>
      </div>

      {total > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">{doneCount} of {total} completed</span>
            <span className="font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-400 font-medium">No checklist items yet</p>
          <p className="text-slate-500 text-sm mt-1">Add items below to track sub-tasks</p>
        </div>
      )}

      <div className="space-y-1">
        {checklist.map((item, i) => (
          <label
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => onToggle(i)}
              className="mt-0.5 w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
            <span className={`text-sm flex-1 ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {item.text}
            </span>
            {item.done && <span className="text-green-400 text-xs shrink-0">✓ Done</span>}
          </label>
        ))}
      </div>

      {/* Add item */}
      <div className="flex gap-2 pt-2 border-t border-slate-700">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Add checklist item… (press Enter)"
          className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}
