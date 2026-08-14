import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Filter,
  Search,
  Check,
  Copy,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { ActionItemEntity, FullMeetingRecord } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface ActionItemsStudioProps {
  meeting: FullMeetingRecord;
  onRefresh: () => void;
}

export const ActionItemsStudio: React.FC<ActionItemsStudioProps> = ({ meeting, onRefresh }) => {
  const actionItems: ActionItemEntity[] = meeting.actionItems || [];

  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [newTask, setNewTask] = useState('');
  const [newResponsible, setNewResponsible] = useState(meeting.organizer || 'Not specified');
  const [newDeadline, setNewDeadline] = useState('Friday');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low' | 'Critical'>('Medium');
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredItems = actionItems.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.task.toLowerCase().includes(q) ||
        item.responsible_person.toLowerCase().includes(q) ||
        item.deadline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusToggle = async (item: ActionItemEntity) => {
    try {
      setUpdatingId(item.id);
      const nextStatus =
        item.status === 'Completed'
          ? 'Pending'
          : item.status === 'Pending'
          ? 'In Progress'
          : 'Completed';

      await meetingDb.updateActionItem(item.id, { status: nextStatus });
      await onRefresh();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriorityChange = async (itemId: string, priority: 'High' | 'Medium' | 'Low' | 'Critical') => {
    try {
      setUpdatingId(itemId);
      await meetingDb.updateActionItem(itemId, { priority });
      await onRefresh();
    } catch (err) {
      console.error('Failed to update priority:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setUpdatingId(itemId);
      await meetingDb.deleteActionItem(itemId);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setIsSubmitting(true);
      await meetingDb.createActionItem(meeting.id, {
        task: newTask.trim(),
        responsible_person: newResponsible.trim() || 'Not specified',
        deadline: newDeadline.trim() || 'Not specified',
        priority: newPriority,
        status: newStatus,
      });

      setNewTask('');
      setShowAddForm(false);
      await onRefresh();
    } catch (err) {
      console.error('Failed to create action item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyActionItems = () => {
    if (actionItems.length === 0) return;
    const formatted = actionItems
      .map(
        (a, idx) =>
          `${idx + 1}. [${a.status.toUpperCase()}] ${a.task}\n   Assignee: ${a.responsible_person} | Deadline: ${a.deadline} | Priority: ${a.priority}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(
      `# Action Items - ${meeting.title}\nDate: ${meeting.date}\n\n${formatted}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingCount = actionItems.filter((a) => a.status === 'Pending').length;
  const inProgressCount = actionItems.filter((a) => a.status === 'In Progress').length;
  const completedCount = actionItems.filter((a) => a.status === 'Completed').length;

  return (
    <div id="action-items-module" className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Action Items & Deliverables
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {completedCount} of {actionItems.length} completed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tasks assigned during the meeting with owners, deadlines, priority, and progress tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionItems.length > 0 && (
            <button
              onClick={handleCopyActionItems}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Tasks</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Bar */}
      {actionItems.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Pending</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md text-[11px]">
              {pendingCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">In Progress</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md text-[11px]">
              {inProgressCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Completed</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md text-[11px]">
              {completedCount}
            </span>
          </div>
        </div>
      )}

      {/* Add New Task Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateItem}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-300/60 dark:border-indigo-800/60 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Action Item
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="e.g. Audit audio latency buffers on low-bandwidth cellular network"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                placeholder="Person name or Team"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Deadline
              </label>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="e.g. Friday or 2026-08-20"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !newTask.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? 'Adding...' : 'Add Action Item'}
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      {actionItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Status:
            </span>
            {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or assignees..."
              className="text-xs px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-48"
            />
          </div>
        </div>
      )}

      {/* Action Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isCompleted = item.status === 'Completed';
            const isHigh = item.priority === 'High' || item.priority === 'Critical';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all shadow-xs group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Status Checkbox / Action Trigger */}
                  <button
                    onClick={() => handleStatusToggle(item)}
                    disabled={updatingId === item.id}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition mt-0.5 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'In Progress'
                        ? 'bg-blue-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                    title="Click to toggle status (Pending -> In Progress -> Completed)"
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    {item.status === 'In Progress' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {item.task}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {/* Assignee */}
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.responsible_person}</span>
                      </span>

                      {/* Deadline */}
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.deadline}</span>
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.priority === 'Critical'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : item.priority === 'High'
                            ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                            : item.priority === 'Medium'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.priority} Priority
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={updatingId === item.id}
                    className="p-1.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete action item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          <ListTodo className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            {searchQuery || statusFilter !== 'All'
              ? 'No action items matching your filter'
              : 'No action items recorded in database'}
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Action items are extracted automatically when AI Minutes are generated, or you can create one with the button above.
          </p>
        </div>
      )}
    </div>
  );
};
