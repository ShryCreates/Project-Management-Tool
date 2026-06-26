import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import CreateProjectModal from '../board/CreateProjectModal';
import ProfileModal from '../ui/ProfileModal';

export default function Sidebar() {
  const { projects, fetchProjects } = useProjectStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <aside className="w-64 flex flex-col h-full shrink-0 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          backdropFilter: 'blur(12px)',
        }}>

        {/* Subtle inner glow on sidebar */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)',
          }} />

        {/* Logo */}
        <div className="p-5 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ProjectFlow</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 relative">
          <Link to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-3 group ${
              !projectId
                ? 'bg-indigo-600/20 text-indigo-300 sidebar-active'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <div className="flex items-center justify-between mb-2 px-1 pt-2">
            <span className="text-xs font-semibold tracking-widest"
              style={{ color: 'rgba(148,163,184,0.5)' }}>PROJECTS</span>
            <button
              onClick={() => setShowCreate(true)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 ripple btn-press"
              title="New project"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="space-y-0.5 stagger-children">
            {projects.map((project) => {
              const isActive = projectId === project._id;
              return (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'text-white sidebar-active'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(90deg, ${project.color}25 0%, transparent 100%)`,
                    borderLeft: `2px solid ${project.color}`,
                  } : {}}
                >
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)' }} />
                  )}
                  <span className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: project.color,
                      boxShadow: isActive ? `0 0 8px ${project.color}80` : 'none' }} />
                  <span className="truncate relative z-10">{project.title}</span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <p className="text-xs text-slate-600 px-3 py-2 italic">No projects yet</p>
            )}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 transition-all duration-200 hover:scale-110 ripple"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
              title="Account settings">
              {user?.name.charAt(0).toUpperCase()}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.6)' }}>{user?.email}</p>
            </div>
            <button onClick={() => setShowProfile(true)}
              className="text-slate-500 hover:text-indigo-400 transition-colors duration-200 btn-press"
              title="Settings">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors duration-200 btn-press"
              title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
