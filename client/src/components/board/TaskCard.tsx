import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-600/60 text-slate-300',
  medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-amber-500/20 text-amber-300',
  urgent: 'bg-red-500/20 text-red-300',
};

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  high: 'bg-amber-400',
  urgent: 'bg-red-400 animate-pulse',
};

export default function TaskCard({ task, onClick, isDragging = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
    background: isSortableDragging
      ? 'rgba(30,41,59,0.4)'
      : 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
    border: isDragging
      ? '1px solid #818cf8'
      : '1px solid rgba(99,102,241,0.15)',
    backdropFilter: 'blur(8px)',
    boxShadow: isDragging ? '0 20px 60px -10px rgba(99,102,241,0.4)' : undefined,
  };

  const doneCount = task.checklist.filter((c) => c.done).length;
  const totalCount = task.checklist.length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={`group rounded-xl p-3.5 cursor-pointer select-none
  ${isSortableDragging ? "opacity-30 scale-95" : ""}
  ${
    isDragging
      ? "rotate-2 shadow-2xl border-indigo-400 opacity-90"
      : "border-slate-700 hover:border-indigo-500 hover:shadow-lg"
  }`}
    >
      {/* Drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      {/* Clickable content */}
      <div onClick={onClick} className="relative">
        {/* Priority badge */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            {task.priority}
          </span>
          {task.labels.slice(0, 2).map((label) => (
            <span key={label} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full border border-slate-600">
              {label}
            </span>
          ))}
        </div>

        {/* Title */}
        <p className="text-sm text-slate-100 font-medium leading-snug mb-3 pr-4 line-clamp-2">
          {task.title}
        </p>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-1">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Checklist progress */}
            {totalCount > 0 && (
              <span className={`flex items-center gap-1 text-xs ${doneCount === totalCount ? 'text-green-400' : 'text-slate-400'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {doneCount}/{totalCount}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOverdue ? 'Overdue · ' : ''}{format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>

          {/* Assignee avatar or "unassigned" hint */}
          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-slate-800"
              title={`Assigned to ${task.assignee.name}`}
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center shrink-0"
              title="Unassigned — click to assign"
            >
              <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* "Click to open" hover hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-0 right-0 mb-1 mr-1">
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-medium">
              Open ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
