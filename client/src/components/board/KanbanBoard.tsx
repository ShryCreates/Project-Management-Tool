import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Project, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import BoardColumn from './BoardColumn';
import TaskCard from './TaskCard';
import type { Filters } from './BoardFilters';

interface Props {
  project: Project;
  filters: Filters;
}

export default function KanbanBoard({ project, filters }: Props) {
  const { tasks, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) &&
          !(task.description?.toLowerCase().includes(q)) &&
          !task.labels.some((l) => l.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (filters.assignee === 'unassigned' && task.assignee) return false;
    if (filters.assignee && filters.assignee !== 'unassigned' && task.assignee?._id !== filters.assignee) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  const sortedColumns = [...project.columns].sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;
    const overColumn = project.columns.find((c) => c.title === over.id);
    if (overColumn && activeTask.column !== overColumn.title) {
      moveTask(activeTask._id, overColumn.title, 0);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const draggedTask = tasks.find((t) => t._id === active.id);
    if (!draggedTask) return;
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask && overTask._id !== draggedTask._id) {
      moveTask(draggedTask._id, overTask.column, overTask.order);
    }
    const overColumn = project.columns.find((c) => c.title === over.id);
    if (overColumn) moveTask(draggedTask._id, overColumn.title, 0);
  };

  const isFiltering = !!(filters.search || filters.assignee || filters.priority);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 h-full overflow-x-auto">
        {isFiltering && filteredTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-300 font-semibold text-lg">No tasks match your filters</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting the search or filter options above</p>
          </div>
        )}
        <SortableContext items={sortedColumns.map((c) => c.title)} strategy={horizontalListSortingStrategy}>
          {sortedColumns.map((column) => (
            <BoardColumn
              key={column.title}
              column={column}
              project={project}
              tasks={filteredTasks.filter((t) => t.column === column.title)}
              totalTasksInColumn={tasks.filter((t) => t.column === column.title).length}
              isFiltering={isFiltering}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
