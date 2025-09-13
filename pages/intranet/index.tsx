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
  BarChart3
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
    tasksCompleted: 12,
    totalTasks: 18,
    upcomingMeetings: 3,
    unreadMessages: 5,
    thisMonthSales: 45000,
    totalLeads: 23,
    timeOffBalance: 12.5,
    performanceScore: 87
  });
  const [recentActivity] = useState([
    { id: 1, type: 'task', message: 'Completed client follow-up for ABC Corp', time: '2 hours ago', icon: CheckSquare },
    { id: 2, type: 'lead', message: 'New lead assigned: John Smith - Software Co', time: '4 hours ago', icon: Target },
    { id: 3, type: 'message', message: 'Message from Sarah Johnson', time: '6 hours ago', icon: MessageSquare },
    { id: 4, type: 'training', message: 'Completed Sales Fundamentals module', time: '1 day ago', icon: Award }
  ]);

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
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {getGreeting()}, {user?.displayName || 'there'}! 👋
                </h2>
                <p className="text-blue-100 mt-1">
                  Ready to make today productive? Here's your overview.
                </p>
              </div>
              <div className="hidden md:block">
                <Activity className="w-16 h-16 text-blue-200" />
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
                    {stats.tasksCompleted}/{stats.totalTasks}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {Math.round((stats.tasksCompleted / stats.totalTasks) * 100)}% Complete
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.tasksCompleted / stats.totalTasks) * 100}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                  <p className="text-sm text-blue-600 mt-1">Requires attention</p>
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
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <activity.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                    <p className="text-xs text-gray-500">Today, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Call - ABC Corp</p>
                    <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Training: Advanced Sales</p>
                    <p className="text-xs text-gray-500">Friday, 9:00 AM</p>
                  </div>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-sm text-gray-600">Active Leads</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${stats.thisMonthSales?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">New Clients</p>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">24</p>
                  <p className="text-xs text-gray-600">Total Users</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">18</p>
                  <p className="text-xs text-gray-600">Active Users</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">156</p>
                  <p className="text-xs text-gray-600">Tasks Created</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Bell className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-600">System Alerts</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}