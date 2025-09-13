import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  Unlock, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  UserX,
  Edit,
  Save,
  X
} from 'lucide-react';
import { 
  UserRole, 
  Permission, 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROLE_HIERARCHY,
  getPermissionsByCategory,
  canManageUser,
  hasPermission
} from '../../lib/permissions';
import { usePermissions } from '../security/ProtectedRoute';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
}

interface PermissionsManagerProps {
  users: User[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  onUpdateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<void>;
}

export default function PermissionsManager({
  users,
  onUpdateUserRole,
  onUpdateUserStatus
}: PermissionsManagerProps) {
  const { userRole } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');

  useEffect(() => {
    setPermissionsByCategory(getPermissionsByCategory());
  }, []);

  // Check if current user can manage the target user
  const canEditUser = (targetUser: User) => {
    return userRole && canManageUser(userRole, targetUser.role);
  };

  // Get available roles for assignment based on current user's role
  const getAvailableRoles = (): UserRole[] => {
    if (!userRole) return [];
    
    const roles: UserRole[] = ['agent', 'manager', 'admin', 'owner'];
    return roles.filter(role => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role]);
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (!canEditUser(user)) return;
    
    try {
      await onUpdateUserRole(user.id, newRole);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleStatusChange = async (user: User, newStatus: 'active' | 'inactive') => {
    if (!canEditUser(user)) return;
    
    try {
      await onUpdateUserStatus(user.id, newStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
      // Handle error (show toast, etc.)
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      agent: <User className="w-4 h-4" />,
      manager: <UserCheck className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
      owner: <Settings className="w-4 h-4" />
    };
    return icons[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      agent: 'text-green-400',
      manager: 'text-blue-400', 
      admin: 'text-purple-400',
      owner: 'text-red-400'
    };
    return colors[role];
  };

  if (!userRole || !hasPermission(userRole, 'users.permissions')) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-red-400 font-semibold mb-2">Access Denied</h3>
        <p className="text-red-300 text-sm">You don&apos;t have permission to manage user permissions.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-2">Permissions Management</h2>
        <p className="text-gray-400">Manage user roles, permissions, and access levels</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 px-6">
          {['users', 'roles', 'permissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">User Management</h3>
              <div className="text-sm text-gray-400">
                {users.length} total users
              </div>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium">{user.name}</h4>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>

                    {canEditUser(user) && (
                      <div className="flex items-center space-x-2">
                        {editingUser === user.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                              className="text-sm bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                            >
                              {getAvailableRoles().map(role => (
                                <option key={role} value={role} className="capitalize">
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user.id)}
                              className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-700"
                              title="Edit role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(user, user.status === 'active' ? 'inactive' : 'active')}
                              className={`p-2 rounded-lg hover:bg-gray-700 ${
                                user.status === 'active'
                                  ? 'text-red-400 hover:text-red-300'
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                              title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedUser?.id === user.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-white font-medium mb-2">Current Permissions</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ROLE_PERMISSIONS[user.role].permissions.map(permId => {
                          const permission = PERMISSIONS.find(p => p.id === permId);
                          return permission ? (
                            <div key={permId} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-gray-300">{permission.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {selectedUser?.id === user.id ? 'Hide' : 'Show'} Permissions
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Role Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(ROLE_HIERARCHY) as UserRole[]).map((role) => (
                <div key={role} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                  role === 'agent' ? 'border-green-400' :
                  role === 'manager' ? 'border-blue-400' :
                  role === 'admin' ? 'border-purple-400' : 'border-red-400'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={getRoleColor(role)}>{getRoleIcon(role)}</span>
                    <h4 className="text-white font-medium capitalize">{role}</h4>
                    <span className="text-xs text-gray-400">Level {ROLE_HIERARCHY[role]}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">
                      {ROLE_PERMISSIONS[role].permissions.length} permissions
                    </p>
                    <p className="text-gray-500 text-xs">
                      Can manage: {ROLE_PERMISSIONS[role].canAccessRoles.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">System Permissions</h3>
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Lock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-white text-sm font-medium">{permission.name}</h5>
                        <p className="text-gray-400 text-xs">{permission.description}</p>
                        <p className="text-gray-500 text-xs mt-1">ID: {permission.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}