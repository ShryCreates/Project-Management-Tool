import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import { DashboardSkeleton } from '../components/ui/Skeleton';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProjectProgress {
  _id: string; title: string; color: string; description?: string;
  owner: any; members: any[]; total: number; done: number;
  progress: number; updatedAt: string; createdAt: string;
}
interface WeekDay { day: string; count: number; }
interface DeadlineTask { _id: string; title: string; dueDate: string; project: any; priority: string; }
interface ActivityItem { _id: string; title: string; column: string; project: any; updatedAt: string; createdBy: any; }
interface DashStats {
  totalProjects: number; projectsThisWeek: number;
  completedTasks: number; completedToday: number;
  totalTasks: number; upcomingDeadlines: number; teamMembers: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function deadlineLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return { label: 'Today', color: 'text-red-400', dot: 'bg-red-500' };
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-amber-400', dot: 'bg-amber-500' };
  return { label: format(d, 'MMM d'), color: 'text-slate-300', dot: 'bg-green-500' };
}

function activityIcon(column: string) {
  if (column === 'Done') return '✅';
  if (column === 'In Progress') return '🔄';
  if (column === 'In Review') return '👀';
  return '📝';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, subColor = 'text-green-400' }: {
  icon: string; label: string; value: number | string; sub?: string; subColor?: string;
}) {
  return (
    <div className="card-hover ripple btn-press cursor-default rounded-xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(8px)',
      }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${subColor}`}
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function WeeklyChart({ data }: { data: WeekDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-xl p-5 fade-in-up"
      style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        border: '1px solid rgba(99,102,241,0.12)',
      }}>
      <h3 className="text-sm font-semibold text-white mb-4">📊 Weekly Productivity</h3>
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const height = Math.max((d.count / max) * 100, 4);
          const isLast = i === data.length - 1;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                {d.count > 0 ? d.count : ''}
              </span>
              <div className="w-full rounded-t-sm transition-all duration-500 hover:opacity-90 cursor-default"
                style={{
                  height: `${height}%`, minHeight: '4px',
                  background: isLast
                    ? 'linear-gradient(180deg, #818cf8, #6366f1)'
                    : 'linear-gradient(180deg, #334155, #1e293b)',
                  boxShadow: isLast ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                  animationDelay: `${i * 60}ms`,
                }}
                title={`${d.count} tasks`}
              />
              <span className={`text-xs transition-colors ${isLast ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-600 mt-3">Tasks completed per day (last 7 days)</p>
    </div>
  );
}

function ProjectCard({ p, userId }: { p: ProjectProgress; userId: string }) {
  const isOwner = p.owner._id === userId || p.owner === userId;
  return (
    <Link
      to={`/projects/${p._id}`}
      className="card-hover ripple group rounded-xl p-5 block"
      style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        border: '1px solid rgba(99,102,241,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ backgroundColor: p.color }}>
            {p.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate text-sm">
              {p.title}
            </h3>
            {p.description && (
              <p className="text-xs text-slate-500 truncate">{p.description}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-500 shrink-0 ml-2">
          {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">
            {p.done} / {p.total} tasks completed
          </span>
          <span className={`text-xs font-bold ${
            p.progress === 100 ? 'text-green-400' :
            p.progress >= 50 ? 'text-indigo-400' : 'text-slate-400'
          }`}>{p.progress}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full progress-animate ${
              p.progress === 100 ? 'bg-green-500' :
              p.progress >= 50 ? 'bg-indigo-500' : 'bg-slate-500'
            }`}
            style={{ width: `${p.progress}%`,
              boxShadow: p.progress > 0 ? `0 0 8px ${p.progress === 100 ? '#22c55e' : '#6366f1'}60` : 'none' }}
          />
        </div>
        {p.total === 0 && (
          <p className="text-xs text-slate-600 mt-1">No tasks yet — add some to get started</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          <div className="w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: p.color }} title={p.owner.name}>
            {p.owner.name?.charAt(0).toUpperCase()}
          </div>
          {p.members.slice(0, 3).map((m: any) => (
            <div key={m.user._id || m.user}
              className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">
              {(m.user.name || '?').charAt(0).toUpperCase()}
            </div>
          ))}
          {p.members.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-slate-400 text-xs">
              +{p.members.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && (
            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">shared</span>
          )}
          <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Open board →
          </span>
        </div>
      </div>
    </Link>
  );
}

function UpcomingDeadlines({ tasks }: { tasks: DeadlineTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">📅 Upcoming Deadlines</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-slate-400 text-sm font-medium">No deadlines this week</p>
          <p className="text-slate-600 text-xs mt-1">You're all caught up!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">📅 Upcoming Deadlines</h3>
      <div className="space-y-2">
        {tasks.map((t) => {
          const { label, color, dot } = deadlineLabel(t.dueDate);
          return (
            <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{t.title}</p>
                <p className="text-xs text-slate-500 truncate">{t.project?.title || ''}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ${color}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">⚡ Recent Activity</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">😴</div>
          <p className="text-slate-400 text-sm">No activity yet</p>
          <p className="text-slate-600 text-xs mt-1">Start by creating tasks in your projects</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">⚡ Recent Activity</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item._id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <span className="text-base shrink-0 mt-0.5">{activityIcon(item.column)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">
                <span className="font-medium">{item.title}</span>
                <span className="text-slate-500"> → </span>
                <span className="text-slate-400">{item.column}</span>
              </p>
              <p className="text-xs text-slate-500">
                {item.project?.title || 'Unknown project'} · {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<{
    stats: DashStats;
    projectProgress: ProjectProgress[];
    upcomingDeadlines: DeadlineTask[];
    weeklyData: WeekDay[];
    recentActivity: ActivityItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const myProjects = data?.projectProgress.filter(
    (p) => (p.owner._id || p.owner) === user?._id
  ) ?? [];
  const sharedProjects = data?.projectProgress.filter(
    (p) => (p.owner._id || p.owner) !== user?._id
  ) ?? [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  const s = data?.stats;

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📁" label="Total Projects" value={s?.totalProjects ?? 0}
          sub={s?.projectsThisWeek ? `+${s.projectsThisWeek} this week` : undefined} />
        <StatCard icon="✅" label="Completed Tasks" value={s?.completedTasks ?? 0}
          sub={s?.completedToday ? `+${s.completedToday} today` : undefined} />
        <StatCard icon="⏰" label="Upcoming Deadlines" value={s?.upcomingDeadlines ?? 0}
          sub={s?.upcomingDeadlines ? 'next 7 days' : undefined}
          subColor={s?.upcomingDeadlines ? 'text-amber-400' : 'text-green-400'} />
        <StatCard icon="👥" label="Team Members" value={s?.teamMembers ?? 0} />
      </div>

      {/* ── Charts + Activity row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart data={data?.weeklyData ?? []} />
        </div>
        <UpcomingDeadlines tasks={data?.upcomingDeadlines ?? []} />
      </div>

      {/* ── Projects with Progress ── */}
      {(data?.projectProgress.length ?? 0) === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-6 text-sm">Create your first project to start tracking tasks and collaborating</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects column */}
          <div className="lg:col-span-2 space-y-6">
            {myProjects.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  🗂️ My Projects
                  <span className="text-xs text-slate-500 font-normal">({myProjects.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myProjects.map((p) => (
                    <ProjectCard key={p._id} p={p} userId={user?._id ?? ''} />
                  ))}
                </div>
              </section>
            )}

            {sharedProjects.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  🤝 Shared with Me
                  <span className="text-xs text-slate-500 font-normal">({sharedProjects.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedProjects.map((p) => (
                    <ProjectCard key={p._id} p={p} userId={user?._id ?? ''} />
                  ))}
                </div>
              </section>
            )}

            {sharedProjects.length === 0 && myProjects.length > 0 && (
              <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🤝</div>
                <p className="text-slate-400 text-sm font-medium">No shared projects yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  Invite teammates from inside a project to collaborate
                </p>
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          <RecentActivity items={data?.recentActivity ?? []} />
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => {
          setShowCreate(false);
          // Refresh stats after creating
          api.get('/stats/dashboard').then((res) => setData(res.data)).catch(console.error);
        }} />
      )}
    </div>
  );
}

// ─── Inline CreateProjectModal (avoids circular import) ──────────────────────
import { useState as useStateModal, type FormEvent } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useStateModal('');
  const [description, setDescription] = useStateModal('');
  const [color, setColor] = useStateModal(COLORS[0]);
  const [loading, setLoading] = useStateModal(false);
  const { createProject } = useProjectStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const project = await createProject({ title, description, color });
      toast.success('Project created');
      onClose();
      navigate(`/projects/${project._id}`);
    } catch { toast.error('Failed to create project'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome project" autoFocus required
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?" rows={3}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-800' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
