import React, { useState, useEffect, useRef } from 'react';
import { Client, ClientAssignment } from '../../lib/crm-types';
import { 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  UserPlus
} from 'lucide-react';

interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  tasksAssigned?: number;
  tasksCompleted?: number;
}

interface EnhancedUserCardProps {
  user: MockUser;
  onEdit?: (userId: number) => void;
  onDelete?: (userId: number) => void;
  onViewDetails?: (userId: number) => void;
  onAssignClient?: (userId: number) => void;
}

export default function EnhancedUserCard({ 
  user, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onAssignClient 
}: EnhancedUserCardProps) {
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, [user.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const loadUserData = async () => {
    try {
      // For now, we'll use mock data since we don't have real user IDs
      // In production, this would use the actual user ID from Firebase
      const mockAssignments: ClientAssignment[] = [];
      const mockClients: Client[] = [];

      setAssignments(mockAssignments);
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'agent': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'manager': return '👨‍💼';
      case 'agent': return '👤';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Mock task calculations
  const taskStats = {
    total: user.tasksAssigned || 0,
    completed: user.tasksCompleted || 0,
    overdue: Math.max(0, Math.floor((user.tasksAssigned || 0) * 0.1)),
    inProgress: Math.max(0, (user.tasksAssigned || 0) - (user.tasksCompleted || 0))
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)} capitalize`}>
                  {user.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="More actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-max">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onViewDetails?.(user.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onEdit?.(user.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4 flex-shrink-0" />
                  <span>Edit User</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onAssignClient?.(user.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                  <span>Assign Client</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onDelete?.(user.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span>Delete User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskStats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">Total Tasks</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.completed}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">Completed</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{taskStats.inProgress}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">In Progress</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{taskStats.overdue}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">Overdue</div>
          </div>
        </div>

        {/* Progress Bar */}
        {taskStats.total > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
              <span>Task Completion</span>
              <span className="text-green-600 dark:text-green-400">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {user.role !== 'admin' && (
        <div className="p-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <span>Performance Details</span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {/* Client Assignments */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Clients ({assignments.length})
                </h4>
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No clients assigned yet</p>
                    <button 
                      onClick={() => onAssignClient?.(user.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Assign first client
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clients.slice(0, 3).map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{client.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{client.company || client.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'won' ? 'bg-green-100 text-green-700' :
                          client.status === 'qualified' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    ))}
                    {clients.length > 3 && (
                      <div className="text-center">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View all {clients.length} clients
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Completed 2 tasks this week</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Active on 3 projects</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Last login: Today</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => onViewDetails?.(user.id)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  View Details
                </button>
                <button
                  onClick={() => onAssignClient?.(user.id)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Client</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Special Section */}
      {user.role === 'admin' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-b-xl">
          <div className="flex items-center justify-center space-x-2 text-red-700 dark:text-red-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">System Administrator</span>
          </div>
          <p className="text-center text-sm text-red-600 dark:text-red-400 mt-1">
            Full access to all system functions
          </p>
        </div>
      )}
    </div>
  );
}