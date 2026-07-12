import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, Project, Task } from '../../types';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

interface Props {
  column: Column;
  project: Project;
  tasks: Task[];
  totalTasksInColumn: number;
  isFiltering: boolean;
}

const COLUMN_COLORS: Record<string, string> = {
  'To Do': 'bg-slate-500',
  'In Progress': 'bg-blue-500',
  'In Review': 'bg-amber-500',
  'Done': 'bg-green-500',
};

// you code is public 

export default function BoardColumn({ column, project, tasks, totalTasksInColumn, isFiltering }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.title });
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  const dotColor = COLUMN_COLORS[column.title] || 'bg-indigo-500';

  return (
    <>
      <div className="flex flex-col w-72 shrink-0 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <h3 className="font-semibold text-slate-200 text-sm">{column.title}</h3>
            <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-400 font-medium min-w-[20px] text-center">
              {tasks.length}{isFiltering && totalTasksInColumn !== tasks.length ? `/${totalTasksInColumn}` : ''}
            </span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={`Add task to ${column.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-xl p-2 overflow-y-auto transition-all flex flex-col ${
            isOver
              ? 'bg-indigo-500/10 ring-2 ring-indigo-500/50'
              : 'bg-slate-800/40 ring-1 ring-slate-700/50'
          }`}
        >
          <SortableContext
            items={sortedTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 flex-1">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Add task button at bottom of column */}
          <button
            onClick={() => setShowCreate(true)}
            className={`mt-2 w-full py-2 rounded-lg border border-dashed text-sm transition-all flex items-center justify-center gap-2
              ${tasks.length === 0
                ? 'border-slate-600 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5'
                : 'border-transparent text-slate-600 hover:border-slate-600 hover:text-slate-400'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {tasks.length === 0 ? `Add first task` : `Add task`}
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateTaskModal
          project={project}
          defaultColumn={column.title}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
