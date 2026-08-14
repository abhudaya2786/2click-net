import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  User, 
  Flag, 
  Calendar, 
  CheckSquare, 
  Sparkles,
  ListTodo,
  Check
} from 'lucide-react';
import { ActionItem, PriorityLevel, TaskStatus } from '../types';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onUpdateActionItems: (items: ActionItem[]) => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  onUpdateActionItems,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('Medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const completedCount = actionItems.filter((i) => i.status === 'Completed').length;
  const inProgressCount = actionItems.filter((i) => i.status === 'In Progress').length;
  const progressPercent = actionItems.length > 0 ? Math.round((completedCount / actionItems.length) * 100) : 0;

  const handleToggleStatus = (id: string) => {
    const updated = actionItems.map((item) => {
      if (item.id === id) {
        let nextStatus: TaskStatus = 'Pending';
        if (item.status === 'Pending') nextStatus = 'In Progress';
        else if (item.status === 'In Progress') nextStatus = 'Completed';
        else if (item.status === 'Completed') nextStatus = 'Pending';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    onUpdateActionItems(updated);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateActionItems(actionItems.filter((item) => item.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newItem: ActionItem = {
      id: `task-${Date.now()}`,
      task: newTaskText.trim(),
      owner: newTaskOwner.trim() || 'Unassigned',
      priority: newTaskPriority,
      deadline: newTaskDeadline.trim() || 'TBD',
      status: 'Pending',
    };

    onUpdateActionItems([...actionItems, newItem]);
    setNewTaskText('');
    setNewTaskOwner('');
    setNewTaskDeadline('');
    setIsAddingTask(false);
  };

  const filteredItems = actionItems.filter((item) => {
    if (filterPriority === 'All') return true;
    return item.priority === filterPriority;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60">
            <Flag className="w-3 h-3 text-rose-500 fill-rose-500" /> High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60">
            <Flag className="w-3 h-3 text-amber-500" /> Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Flag className="w-3 h-3 text-slate-400" /> Low
          </span>
        );
    }
  };

  return (
    <div id="action-items-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs">
      {/* Header with stats and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Deliverables & Action Items ({actionItems.length})
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedCount} Completed</span>
              <span>•</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inProgressCount} In Progress</span>
            </div>
          </div>
        </div>

        {/* Priority Filter & Add Task Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg transition min-h-[30px] touch-manipulation cursor-pointer ${
                  filterPriority === p
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:bg-indigo-800 transition shadow-xs min-h-[36px] touch-manipulation cursor-pointer flex-shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No action items matching the selected priority filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 shadow-2xs ${
                item.status === 'Completed'
                  ? 'bg-slate-50/60 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                  : item.status === 'In Progress'
                  ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40'
                  : 'bg-slate-50/70 dark:bg-slate-850/60 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Task Text & Status Button */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-indigo-600 transition min-w-[32px] min-h-[32px] flex items-center justify-center -ml-1 cursor-pointer touch-manipulation active:scale-90"
                  title="Click to advance status"
                >
                  {item.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                  ) : item.status === 'In Progress' ? (
                    <Clock className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleToggleStatus(item.id)}>
                  <p
                    className={`text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug ${
                      item.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {item.task}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                      <User className="w-3 h-3 text-indigo-500" /> {item.owner}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" /> Due {item.deadline}
                    </span>
                    <span>•</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      item.status === 'Completed' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' :
                      item.status === 'In Progress' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'text-slate-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge, Priority & Delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {getPriorityBadge(item.priority)}

                <button
                  onClick={() => handleDeleteTask(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer touch-manipulation"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Form Modal / Inline */}
      {isAddingTask && (
        <form
          onSubmit={handleAddTask}
          className="mt-4 p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3.5 shadow-xs"
        >
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-indigo-900 dark:text-indigo-300">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Create New Deliverable</span>
          </div>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="e.g. Prepare API integration specifications for security review"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[42px]"
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Assignee / Owner</label>
              <input
                type="text"
                value={newTaskOwner}
                onChange={(e) => setNewTaskOwner(e.target.value)}
                placeholder="e.g. Sarah K."
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Target Deadline</label>
              <input
                type="text"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                placeholder="e.g. Friday, 5:00 PM"
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 min-h-[38px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 min-h-[38px] cursor-pointer shadow-xs"
            >
              Save Deliverable
            </button>
          </div>
        </form>
      )}
    </div>
  );
};


