import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { joinProject, leaveProject } from '../lib/socket';
import { useSocketEvents } from '../hooks/useSocket';
import KanbanBoard from '../components/board/KanbanBoard';
import ProjectHeader from '../components/board/ProjectHeader';
import BoardFilters, { type Filters } from '../components/board/BoardFilters';
import { BoardSkeleton } from '../components/ui/Skeleton';

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { fetchProject, currentProject, setCurrentProject } = useProjectStore();
  const { fetchTasks, clearTasks } = useTaskStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', assignee: '', priority: '' });

  useSocketEvents(projectId);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setCurrentProject(null);
    setFilters({ search: '', assignee: '', priority: '' });

    fetchProject(projectId)
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        const status = err?.response?.status;
        if (status === 403) setError('You do not have access to this project.');
        else if (status === 404) setError('Project not found.');
        else setError('Failed to load project. Please try again.');
      });

    fetchTasks(projectId);
    joinProject(projectId);

    return () => { leaveProject(projectId); clearTasks(); };
  }, [projectId]);

  // Auto-redirect on error after 2.5s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => navigate('/'), 2500);
      return () => clearTimeout(t);
    }
  }, [error]);

  if (loading) {
    return <BoardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-slate-300 font-medium">{error}</p>
        <p className="text-slate-500 text-sm">Redirecting to dashboard…</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!currentProject) return null;

  return (
    <div className="flex flex-col h-full -m-6">
      <ProjectHeader project={currentProject} />
      <BoardFilters project={currentProject} filters={filters} onChange={setFilters} />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard project={currentProject} filters={filters} />
      </div>
    </div>
  );
}
