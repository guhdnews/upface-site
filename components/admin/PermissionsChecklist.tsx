import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText,
  Settings,
  Lock,
  Database,
  Key,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  UserRole, 
  Permission, 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROLE_HIERARCHY,
  hasPermission,
  canAccessRoleContent,
  getMaxAccessibleRole
} from '../../lib/permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
}

interface PermissionsChecklistProps {
  users: User[];
  currentUserRole: UserRole;
}

interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  permissions: Permission[];
  color: string;
}

export default function PermissionsChecklist({ users, currentUserRole }: PermissionsChecklistProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');
  const [viewMode, setViewMode] = useState<'matrix' | 'checklist'>('checklist');

  // Group permissions by category with icons and colors
  const permissionCategories: PermissionCategory[] = [
    {
      name: 'User Management',
      icon: <Users className="w-5 h-5" />,
      color: 'blue',
      permissions: PERMISSIONS.filter(p => p.category === 'User Management')
    },
    {
      name: 'Training',
      icon: <FileText className="w-5 h-5" />,
      color: 'green', 
      permissions: PERMISSIONS.filter(p => p.category === 'Training')
    },
    {
      name: 'CRM',
      icon: <Database className="w-5 h-5" />,
      color: 'purple',
      permissions: PERMISSIONS.filter(p => p.category === 'CRM')
    },
    {
      name: 'System',
      icon: <Settings className="w-5 h-5" />,
      color: 'red',
      permissions: PERMISSIONS.filter(p => p.category === 'System')
    },
    {
      name: 'Analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'yellow',
      permissions: PERMISSIONS.filter(p => p.category === 'Analytics')
    }
  ];

  const roles: UserRole[] = ['agent', 'manager', 'admin', 'owner'];

  const getRoleUsers = (role: UserRole) => {
    return users.filter(user => user.role === role);
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      agent: <UserCheck className="w-4 h-4" />,
      manager: <Users className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
      owner: <Key className="w-4 h-4" />
    };
    return icons[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      agent: 'green',
      manager: 'blue',
      admin: 'purple', 
      owner: 'red'
    };
    return colors[role];
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' = 'text') => {
    const colorMap = {
      green: { bg: 'bg-green-900/20 border-green-500', text: 'text-green-400', border: 'border-green-500' },
      blue: { bg: 'bg-blue-900/20 border-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
      purple: { bg: 'bg-purple-900/20 border-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
      red: { bg: 'bg-red-900/20 border-red-500', text: 'text-red-400', border: 'border-red-500' },
      yellow: { bg: 'bg-yellow-900/20 border-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' }
    };
    return colorMap[color]?.[variant] || colorMap.blue[variant];
  };

  const canUserAccessRole = (userRole: UserRole, targetRole: UserRole) => {
    return canAccessRoleContent(userRole, targetRole);
  };

  const renderMatrixView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Permission Matrix</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>Has Permission</span>
          <XCircle className="w-4 h-4 text-red-400 ml-4" />
          <span>No Permission</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left p-4 text-white font-medium">Permission</th>
                {roles.map(role => (
                  <th key={role} className="text-center p-4 text-white font-medium min-w-[100px]">
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`${getColorClasses(getRoleColor(role))} flex items-center space-x-1`}>
                        {getRoleIcon(role)}
                        <span className="capitalize">{role}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {getRoleUsers(role).length} users
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionCategories.map((category) => (
                <React.Fragment key={category.name}>
                  <tr className="border-t border-gray-700">
                    <td colSpan={roles.length + 1} className={`p-3 ${getColorClasses(category.color, 'bg')} border ${getColorClasses(category.color, 'border')}`}>
                      <div className={`flex items-center space-x-2 ${getColorClasses(category.color)} font-medium`}>
                        {category.icon}
                        <span>{category.name}</span>
                      </div>
                    </td>
                  </tr>
                  {category.permissions.map((permission) => (
                    <tr key={permission.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium text-sm">{permission.name}</div>
                          <div className="text-gray-400 text-xs">{permission.description}</div>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={role} className="p-4 text-center">
                          {hasPermission(role, permission.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChecklistView = () => (
    <div className="space-y-6">
      {/* Role Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Permission Checklist</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {roles
              .filter(role => canUserAccessRole(currentUserRole, role))
              .map(role => (
                <option key={role} value={role} className="capitalize">
                  {role} ({getRoleUsers(role).length} users)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Role Overview */}
      <div className={`${getColorClasses(getRoleColor(selectedRole), 'bg')} border ${getColorClasses(getRoleColor(selectedRole), 'border')} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${getColorClasses(getRoleColor(selectedRole))} flex items-center space-x-2`}>
              {getRoleIcon(selectedRole)}
              <h4 className="text-lg font-semibold capitalize">{selectedRole}</h4>
            </div>
            <span className="text-sm text-gray-400">
              Level {ROLE_HIERARCHY[selectedRole]} • {ROLE_PERMISSIONS[selectedRole].permissions.length} permissions
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{getRoleUsers(selectedRole).length}</div>
              <div className="text-xs text-gray-400">Active Users</div>
            </div>
          </div>
        </div>

        {/* Users with this role */}
        {getRoleUsers(selectedRole).length > 0 && (
          <div>
            <h5 className="text-white font-medium mb-2">Users with this role:</h5>
            <div className="flex flex-wrap gap-2">
              {getRoleUsers(selectedRole).map(user => (
                <div key={user.id} className="flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-1">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-white text-sm">{user.name}</span>
                  {user.status === 'inactive' && (
                    <UserX className="w-3 h-3 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permission Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {permissionCategories.map((category) => {
          const categoryPermissions = category.permissions;
          const hasPermissions = categoryPermissions.filter(p => 
            hasPermission(selectedRole, p.id)
          );
          const missingPermissions = categoryPermissions.filter(p => 
            !hasPermission(selectedRole, p.id)
          );

          return (
            <div key={category.name} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center space-x-2 ${getColorClasses(category.color)}`}>
                  {category.icon}
                  <h4 className="font-medium">{category.name}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 text-sm font-medium">
                    {hasPermissions.length}/{categoryPermissions.length}
                  </span>
                  {hasPermissions.length === categoryPermissions.length ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : hasPermissions.length > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              {/* Granted Permissions */}
              {hasPermissions.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-green-400 text-sm font-medium mb-2">✓ Granted Permissions</h6>
                  <div className="space-y-2">
                    {hasPermissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">{permission.name}</div>
                          <div className="text-gray-400 text-xs">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Permissions */}
              {missingPermissions.length > 0 && (
                <div>
                  <h6 className="text-red-400 text-sm font-medium mb-2">✗ Missing Permissions</h6>
                  <div className="space-y-2">
                    {missingPermissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-300 font-medium">{permission.name}</div>
                          <div className="text-gray-500 text-xs">{permission.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {categoryPermissions.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No permissions defined for this category
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Permissions Checklist</h2>
            <p className="text-gray-400">Visual overview of role-based permissions and access levels</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('checklist')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'checklist' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Checklist View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'matrix' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Matrix View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'checklist' ? renderChecklistView() : renderMatrixView()}
      </div>

      {/* Access Level Warning */}
      {!canAccessRoleContent(currentUserRole, 'owner') && (
        <div className="mx-6 mb-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-medium">Limited Access</h4>
              <p className="text-yellow-300 text-sm">
                You can only view and manage roles at or below your current level ({currentUserRole}). 
                Contact a higher-level administrator for elevated permissions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}