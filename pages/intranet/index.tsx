import React, { useState, useEffect } from 'react';
import IntranetLayout from '../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../components/security/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPermissions } from '../../lib/permissions';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  FileText,
  Bell,
  DollarSign,
  Award,
  CheckSquare,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';

interface DashboardStats {
  tasksCompleted: number;
  totalTasks: number;
  upcomingMeetings: number;
  unreadMessages: number;
  thisMonthSales?: number;
  totalLeads?: number;
  timeOffBalance: number;
  performanceScore: number;
}

interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  requiredPermissions?: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'clock-in',
    label: 'Clock In/Out',
    href: '/intranet/hr/timeclock',
    icon: Clock,
    color: 'bg-green-500'
  },
  {
    id: 'new-lead',
    label: 'Add Lead',
    href: '/intranet/crm/leads/new',
    icon: Plus,
    color: 'bg-blue-500',
    requiredPermissions: ['crm.access']
  },
  {
    id: 'request-time-off',
    label: 'Request Time Off',
    href: '/intranet/hr/timeoff',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    id: 'send-message',
    label: 'Send Message',
    href: '/intranet/messages',
    icon: MessageSquare,
    color: 'bg-orange-500'
  },
  {
    id: 'view-payroll',
    label: 'View Payroll',
    href: '/intranet/hr/payroll',
    icon: DollarSign,
    color: 'bg-emerald-500'
  },
  {
    id: 'training',
    label: 'Training',
    href: '/intranet/training',
    icon: Award,
    color: 'bg-indigo-500'
  }
];

export default function IntranetDashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('agent');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    upcomingMeetings: 0,
    unreadMessages: 0,
    thisMonthSales: 0,
    totalLeads: 0,
    timeOffBalance: 0,
    performanceScore: 0
  });
  const [recentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadDashboardData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const permissions = await getUserPermissions(user.uid);
      setUserRole(permissions.role);
      setUserPermissions(permissions.permissions);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    // In a real app, this would load actual data from various services
    // For now, we'll use mock data
    try {
      // Load CRM stats if user has access
      // Load HR stats
      // Load training progress
      // etc.
      console.log('Dashboard data loaded');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const hasPermission = (permissions?: string[]) => {
    if (!permissions) return true;
    return permissions.some(perm => userPermissions.includes(perm));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Dashboard">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                  {getGreeting()}, {user?.displayName || 'there'}! 👋
                </h2>
                <p className="text-blue-100 text-base lg:text-lg">
                  Ready to make today productive? Here's your overview.
                </p>
              </div>
              <div className="flex-shrink-0 self-center sm:self-auto">
                <Activity className="w-12 h-12 lg:w-16 lg:h-16 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions
                .filter(action => hasPermission(action.requiredPermissions))
                .map(action => (
                <a
                  key={action.id}
                  href={action.href}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`${action.color} p-3 rounded-lg mb-2 group-hover:scale-105 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTasks === 0 ? '0' : `${stats.tasksCompleted}/${stats.totalTasks}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalTasks === 0 ? 'No tasks yet' : `${Math.round((stats.tasksCompleted / stats.totalTasks) * 100)}% Complete`}
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: stats.totalTasks === 0 ? '0%' : `${(stats.tasksCompleted / stats.totalTasks) * 100}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.unreadMessages === 0 ? 'No new messages' : 'Requires attention'}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Time Off */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PTO Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.timeOffBalance}</p>
                  <p className="text-sm text-purple-600 mt-1">Days available</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Performance Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.performanceScore}%</p>
                  <p className="text-sm text-orange-600 mt-1">This month</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <a href="/intranet/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">Your activity will appear here</p>
                  </div>
                ) : (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <activity.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
                <a href="/intranet/calendar" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View calendar
                </a>
              </div>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming events</p>
                <p className="text-gray-400 text-xs mt-1">Your calendar events will appear here</p>
              </div>
            </div>
          </div>

          {/* CRM Overview (if user has access) */}
          {hasPermission(['crm.access']) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CRM Overview</h3>
                <a href="/intranet/crm" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  Open CRM
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No CRM data yet</p>
                <p className="text-gray-400 text-xs mt-1">Leads and sales data will appear here</p>
              </div>
            </div>
          )}

          {/* Admin Overview (if user is admin) */}
          {(userRole === 'admin' || userRole === 'owner') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                <a href="/intranet/admin" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  Admin Panel
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">System statistics will appear here</p>
                <p className="text-gray-400 text-xs mt-1">Data will be populated as your team grows</p>
              </div>
            </div>
          )}
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}