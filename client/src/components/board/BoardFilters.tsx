import { useState } from 'react';
import type { Project, User } from '../../types';

interface Filters {
  search: string;
  assignee: string;
  priority: string;
}

interface Props {
  project: Project;
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function BoardFilters({ project, filters, onChange }: Props) {
  const allMembers: User[] = [
    project.owner,
    ...project.members.map((m) => m.user),
  ];

  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const hasActiveFilters = filters.search || filters.assignee || filters.priority;

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-slate-800/80 border-b border-slate-700/50 shrink-0 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search tasks…"
          className="pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 transition"
        />
      </div>

      {/* Assignee filter */}
      <select
        value={filters.assignee}
        onChange={(e) => update({ assignee: e.target.value })}
        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
      >
        <option value="">👤 All members</option>
        <option value="unassigned">⊘ Unassigned</option>
        {allMembers.map((u) => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) => update({ priority: e.target.value })}
        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
      >
        <option value="">🚦 All priorities</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ search: '', assignee: '', priority: '' })}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      )}

      {/* Active filter count badge */}
      {hasActiveFilters && (
        <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          Filters active
        </span>
      )}
    </div>
  );
}

export type { Filters };
