import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '../../types';
import { SortableQuestCard } from '../../pages/QuestLog';

const KanbanColumn = ({ id, title, tasks }: { id: string, title: string, tasks: Task[] }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 min-w-[280px] flex flex-col h-full border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-4 flex justify-between">
                {title} <span className="text-slate-400">{tasks.length}</span>
            </h3>

            <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 min-h-[100px]">
                    {tasks.map(task => (
                        <SortableQuestCard
                            key={task.id}
                            task={task}
                            completeTask={() => { }}
                            deleteTask={() => { }}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

interface ProjectKanbanProps {
    project: any;
    tasks: Task[];
    onUpdateTasks: (tasks: Task[]) => void; // Parent handles store update
}

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({ project, tasks, onUpdateTasks }) => {
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    // Columns: To Do, In Progress, Done
    const columns = {
        'todo': tasks.filter(t => !t.completed),
        'done': tasks.filter(t => t.completed)
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Logic handled by parent? 
        // Actually, reordering within Todo/Done requires state update.
        // For simplicity in this iteration: strictly toggle completion if dragged between columns.

        const isOverDone = overId === 'done' || columns['done'].some(t => t.id === overId);
        const isOverTodo = overId === 'todo' || columns['todo'].some(t => t.id === overId);

        const task = tasks.find(t => t.id === activeId);
        if (!task) return;

        let newTasks = [...tasks];

        if (task.completed && isOverTodo) {
            // Mark incomplete
            newTasks = newTasks.map(t => t.id === activeId ? { ...t, completed: false } : t);
            onUpdateTasks(newTasks);
        } else if (!task.completed && isOverDone) {
            // Mark complete
            newTasks = newTasks.map(t => t.id === activeId ? { ...t, completed: true } : t);
            onUpdateTasks(newTasks);
        } else {
            // Reorder within column? (Simplified: Ignore for now to save complexity, user just wants "A Kanban Board")
        }
    };

    return (
        <div className="h-full flex gap-6 overflow-x-auto pb-4">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <KanbanColumn id="todo" title="To Do" tasks={columns['todo']} />
                <KanbanColumn id="done" title="Completed" tasks={columns['done']} />

                <DragOverlay>
                    {activeDragId ? (
                        <div className="opacity-80 rotate-2 cursor-grabbing">
                            <SortableQuestCard
                                task={tasks.find(t => t.id === activeDragId)!}
                                completeTask={() => { }}
                                deleteTask={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
