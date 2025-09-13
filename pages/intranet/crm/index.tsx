import React, { useState, useEffect } from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserPermissions } from '../../../lib/permissions';
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Mail,
  Target,
  CheckSquare,
  Phone,
  DollarSign,
  BarChart3,
  Plus,
  ArrowRight,
  Briefcase
} from 'lucide-react';

export default function CRMDashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('agent');
  const [stats, setStats] = useState({
    totalClients: 0,
    newInquiries: 0,
    pendingFollowUps: 0,
    thisWeekConversions: 0,
    totalLeads: 0,
    activeTasks: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (user) {
      loadUserPermissions();
      loadCRMData();
    }
  }, [user]);

  const loadUserPermissions = async () => {
    if (!user) return;
    try {
      const permissions = await getUserPermissions(user.uid);
      setUserRole(permissions.role);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const loadCRMData = async () => {
    // Mock data - in a real app this would load from actual CRM services
    setStats({
      totalClients: 45,
      newInquiries: 12,
      pendingFollowUps: 8,
      thisWeekConversions: 3,
      totalLeads: 28,
      activeTasks: 15,
      monthlyRevenue: 125000,
      conversionRate: 18.5
    });
  };

  const quickActions = [
    {
      label: 'New Lead',
      href: '/intranet/crm/leads/new',
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      label: 'Add Client',
      href: '/intranet/crm/clients/new',
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      label: 'Schedule Follow-up',
      href: '/intranet/crm/tasks/new',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      label: 'Log Call',
      href: '/intranet/crm/activities/new',
      icon: Phone,
      color: 'bg-orange-500'
    }
  ];

  return (
    <ProtectedRoute requiredPermissions={['crm.access']}>
      <IntranetLayout title="CRM Dashboard">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Welcome to your CRM Dashboard! 🎯
                </h2>
                <p className="text-blue-100">
                  Manage your sales pipeline and client relationships effectively.
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                  <p className="text-sm text-blue-600 mt-1">Active accounts</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-sm text-green-600 mt-1">In pipeline</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.newInquiries}</p>
                  <p className="text-sm text-purple-600 mt-1">This week</p>
                </div>
                <Mail className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">This month</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Performance */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-500">Conversion Rate:</span>
                  <span className="text-sm font-semibold text-green-600">{stats.conversionRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-sm text-gray-600">Active Leads</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeekConversions}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  <p className="text-sm text-gray-600">Total Clients</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CRM Modules</h3>
              <div className="space-y-3">
                <a
                  href="/intranet/crm/leads"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Lead Management</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </a>
                
                <a
                  href="/intranet/crm/clients"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">Client Management</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </a>
                
                <a
                  href="/intranet/crm/inquiries"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900">Inquiries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stats.newInquiries > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {stats.newInquiries}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </a>
                
                <a
                  href="/intranet/crm/tasks"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900">Tasks & Follow-ups</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stats.pendingFollowUps > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {stats.pendingFollowUps}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </a>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Quick Tip</span>
                </div>
                <p className="text-sm text-blue-700">
                  Focus on following up with your {stats.totalLeads} active leads to improve your conversion rate!
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <a href="/intranet/crm/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </a>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New client added: <strong>ABC Corporation</strong></p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Lead qualified: <strong>John Smith - Tech Solutions</strong></p>
                  <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New inquiry received from contact form</p>
                  <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}