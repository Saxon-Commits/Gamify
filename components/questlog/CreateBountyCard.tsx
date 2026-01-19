import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { X, Plus, PenSquare, CheckCircle2, Repeat, Users, PlusCircle } from 'lucide-react';

interface CreateBountyCardProps {
    projectId: string;
    onCreate: (task: any) => void;
    initialData?: Task;
    onCancel?: () => void;
    defaultExpanded?: boolean;
}

export const CreateBountyCard: React.FC<CreateBountyCardProps> = ({
    projectId,
    onCreate,
    initialData,
    onCancel,
    defaultExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(!!initialData || defaultExpanded);
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [category, setCategory] = useState<'col-todo' | 'col-habit' | 'col-guild'>((initialData?.projectId as any) || projectId || 'col-todo');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Enhanced Fields
    const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'custom'>(initialData?.frequency || 'once');

    // Format deadline for input if it exists
    const formatDeadline = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            // datetime-local expects YYYY-MM-DDThh:mm
            return date.toISOString().slice(0, 16);
        } catch (e) { return ''; }
    };

    const [deadline, setDeadline] = useState(formatDeadline(initialData?.deadline));

    const [subtasks, setSubtasks] = useState<{ id: string, text: string, completed: boolean }[]>(initialData?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');

    // Reset internal state if initialData changes (e.g. switching edit target)
    useEffect(() => {
        if (initialData) {
            setIsExpanded(true);
            setName(initialData.name);
            setDescription(initialData.description || '');
            setCategory(initialData.projectId as any);
            setFrequency(initialData.frequency || 'once');
            setDeadline(formatDeadline(initialData.deadline));
            setSubtasks(initialData.subtasks || []);
        }
    }, [initialData]);

    const categories = [
        { id: 'col-todo', label: 'To-Do', icon: CheckCircle2, color: 'text-emerald-500' },
        { id: 'col-habit', label: 'Habit', icon: Repeat, color: 'text-amber-500' },
        { id: 'col-guild', label: 'Guild', icon: Users, color: 'text-purple-500' }
    ];

    const frequencies = ['once', 'daily', 'weekly', 'monthly'];

    // Default rewards based on difficulty
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { id: crypto.randomUUID(), text: newSubtask, completed: false }]);
        setNewSubtask('');
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);

        // Add subtasks bonus? Optional: increase reward based on subtasks count

        const taskData: any = {
            ...initialData, // Preserve ID if editing
            projectId: category,
            name,
            description,
            type: frequency !== 'once' ? 'daily' : (category === 'col-guild' ? 'guild' : 'main'),
            xpReward: 100,
            goldReward: 25,
            completed: initialData?.completed || false,
            frequency: frequency !== 'once' ? frequency : undefined,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            subtasks: subtasks.length > 0 ? subtasks : undefined
        };

        onCreate(taskData);

        if (onCancel) {
            onCancel(); // Close edit mode
            setIsSubmitting(false); // Reset just in case, though component likely unmounts
        } else {
            // Reset form for create mode
            setName('');
            setDescription('');
            setIsExpanded(false);
            setFrequency('once');
            setDeadline('');
            setSubtasks([]);
            setNewSubtask('');

            // Delay releasing the lock to prevent accidental double-clicks from creating duplicates
            setTimeout(() => setIsSubmitting(false), 500);
        }
    };

    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
            >
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    <PlusCircle size={20} className="group-hover:text-indigo-500 transition-colors" />
                    <span className="text-sm font-medium">Create a Bounty...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
                onClick={() => onCancel ? onCancel() : setIsExpanded(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
                <X size={16} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">{initialData ? 'Edit Bounty' : 'New Bounty'}</h3>

                {/* Name Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Bounty Title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
                        autoFocus
                    />
                </div>

                {/* Category Selection */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-lg">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${category === cat.id
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <cat.icon size={12} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Recurrence */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Recurrence</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs font-medium focus:border-indigo-500 outline-none"
                        >
                            {frequencies.map(f => (
                                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Deadline (Optional)</label>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs font-medium focus:border-indigo-500 outline-none block"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Subtasks</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                            placeholder="Add step..."
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs focus:border-indigo-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={addSubtask}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    {subtasks.length > 0 && (
                        <div className="space-y-1 pl-1">
                            {subtasks.map(st => (
                                <div key={st.id} className="flex items-center justify-between group/st text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        <span className="text-slate-600 dark:text-slate-300">{st.text}</span>
                                    </div>
                                    <button type="button" onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover/st:opacity-100 text-slate-400 hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Submit */}
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {initialData ? <PenSquare size={16} /> : <Plus size={16} />}
                    {initialData ? 'Save Changes' : 'Create Bounty'}
                </button>

            </form>
        </div>
    );
};
