import React, { useState } from 'react';
import { Task, TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES } from '../../lib/crm-types';
import { Calendar, Clock, User, MessageCircle, Paperclip, MoreHorizontal, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete, compact = false }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const priorityConfig = TASK_PRIORITIES.find(p => p.value === task.priority);
  const statusConfig = TASK_STATUSES.find(s => s.value === task.status);
  const typeConfig = TASK_TYPES.find(t => t.value === task.type);

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const isDueSoon = task.status !== 'completed' && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-3 h-3 rounded-full ${priorityConfig?.color === 'red' ? 'bg-red-500' : 
              priorityConfig?.color === 'orange' ? 'bg-orange-500' :
              priorityConfig?.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {task.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {typeConfig?.icon} {typeConfig?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {statusConfig?.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-4 h-4 rounded-full mt-1 ${priorityConfig?.color === 'red' ? 'bg-red-500' : 
            priorityConfig?.color === 'orange' ? 'bg-orange-500' :
            priorityConfig?.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {task.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <span>{typeConfig?.icon}</span>
                <span>{typeConfig?.label}</span>
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {priorityConfig?.icon} {priorityConfig?.label}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={() => onEdit?.(task.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Edit Task
              </button>
              <button
                onClick={() => onDelete?.(task.id)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Status and Due Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
            {statusConfig?.icon} {statusConfig?.label}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue
            </span>
          )}
          {isDueSoon && !isOverdue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />
              Due Soon
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>Assignee</span>
          </div>
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-4 h-4" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {task.status !== 'completed' && (
            <button
              onClick={() => onStatusChange?.(task.id, 'completed')}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Mark as completed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {task.status === 'completed' && (
            <button
              onClick={() => onStatusChange?.(task.id, 'todo')}
              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Reopen task"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}