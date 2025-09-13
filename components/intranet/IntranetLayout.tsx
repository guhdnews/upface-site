import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPermissions } from '../../lib/permissions';
import {
  Home,
  Users,
  Target,
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  TrendingUp,
  Shield,
  Building,
  CreditCard,
  UserCheck,
  BarChart3,
  Inbox,
  Award,
  HeartHandshake
} from 'lucide-react';

interface IntranetLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/intranet',
    icon: Home
  },
  {
    id: 'hr',
    label: 'HR & Payroll',
    icon: Users,
    children: [
      { id: 'profile', label: 'My Profile', href: '/intranet/hr/profile', icon: User },
      { id: 'payroll', label: 'Payroll & Benefits', href: '/intranet/hr/payroll', icon: DollarSign },
      { id: 'timeoff', label: 'Time Off Requests', href: '/intranet/hr/timeoff', icon: Calendar },
      { id: 'timeclock', label: 'Time Clock', href: '/intranet/hr/timeclock', icon: Clock },
      { id: 'directory', label: 'Employee Directory', href: '/intranet/hr/directory', icon: Building, requiredRoles: ['manager', 'admin', 'owner'] }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Sales',
    icon: Target,
    requiredPermissions: ['crm.access'],
    children: [
      { id: 'crm-dashboard', label: 'CRM Dashboard', href: '/intranet/crm', icon: BarChart3 },
      { id: 'leads', label: 'Lead Management', href: '/intranet/crm/leads', icon: TrendingUp },
      { id: 'clients', label: 'Client Management', href: '/intranet/crm/clients', icon: UserCheck },
      { id: 'inquiries', label: 'Inquiries', href: '/intranet/crm/inquiries', icon: Inbox },
      { id: 'tasks', label: 'Tasks & Follow-ups', href: '/intranet/crm/tasks', icon: FileText }
    ]
  },
  {
    id: 'training',
    label: 'Training & Development',
    href: '/intranet/training',
    icon: GraduationCap
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    children: [
      { id: 'messages', label: 'Internal Messages', href: '/intranet/messages', icon: MessageSquare },
      { id: 'announcements', label: 'Company News', href: '/intranet/announcements', icon: Bell },
      { id: 'team-chat', label: 'Team Chat', href: '/intranet/chat', icon: Users }
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Award,
    children: [
      { id: 'goals', label: 'Goals & KPIs', href: '/intranet/performance/goals', icon: Target },
      { id: 'reviews', label: 'Performance Reviews', href: '/intranet/performance/reviews', icon: FileText },
      { id: 'achievements', label: 'Achievements', href: '/intranet/performance/achievements', icon: Award }
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    requiredRoles: ['admin', 'owner'],
    children: [
      { id: 'users', label: 'User Management', href: '/intranet/admin/users', icon: Users },
      { id: 'permissions', label: 'Permissions', href: '/intranet/admin/permissions', icon: Shield },
      { id: 'company-settings', label: 'Company Settings', href: '/intranet/admin/company', icon: Building },
      { id: 'system-settings', label: 'System Settings', href: '/intranet/admin/system', icon: Settings }
    ]
  }
];

export default function IntranetLayout({ children, title }: IntranetLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['hr', 'crm']);
  const [userRole, setUserRole] = useState<string>('agent');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasAccess = (item: NavigationItem): boolean => {
    // Check role requirements
    if (item.requiredRoles && !item.requiredRoles.includes(userRole)) {
      return false;
    }
    // Check permission requirements
    if (item.requiredPermissions && !item.requiredPermissions.some(perm => userPermissions.includes(perm))) {
      return false;
    }
    return true;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    if (!hasAccess(item)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = router.pathname === item.href || 
                    (item.children && item.children.some(child => router.pathname === child.href));

    return (
      <div key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <Link
            href={item.href!}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-1 ml-2 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-700">
            <Link href="/intranet" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-white font-bold text-lg">Upface Intranet</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{user.displayName || 'User'}</p>
                <p className="text-gray-400 text-sm capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>

          {/* Bottom Actions */}
          <div className="px-4 py-4 border-t border-gray-700 space-y-2">
            <Link
              href="/intranet/settings"
              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title || 'Intranet'}</h1>
            <div className="w-6 h-6"></div>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span>Welcome back, {user.displayName || user.email}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Link href="/intranet/hr/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}