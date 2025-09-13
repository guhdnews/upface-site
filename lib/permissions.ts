// Role hierarchy and permissions system for Upface.dev
export type UserRole = 'agent' | 'manager' | 'admin' | 'owner';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  canAccessRoles: UserRole[];
}

// Define the role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  agent: 1,
  manager: 2, 
  admin: 3,
  owner: 4
};

// All available permissions in the system
export const PERMISSIONS: Permission[] = [
  // CRM Permissions
  {
    id: 'crm.access',
    name: 'CRM Access',
    description: 'Access the CRM system and features',
    category: 'CRM'
  },
  {
    id: 'crm.clients.view',
    name: 'View Clients',
    description: 'View client information and details',
    category: 'CRM'
  },
  {
    id: 'crm.clients.create',
    name: 'Create Clients',
    description: 'Add new clients to the system',
    category: 'CRM'
  },
  {
    id: 'crm.clients.edit',
    name: 'Edit Clients',
    description: 'Modify existing client information',
    category: 'CRM'
  },
  {
    id: 'crm.clients.delete',
    name: 'Delete Clients',
    description: 'Remove clients from the system',
    category: 'CRM'
  },
  {
    id: 'crm.clients.assign',
    name: 'Assign Clients',
    description: 'Assign clients to team members',
    category: 'CRM'
  },
  {
    id: 'crm.clients.viewAll',
    name: 'View All Clients',
    description: 'View clients across all team members',
    category: 'CRM'
  },

  // User Management Permissions
  {
    id: 'users.view',
    name: 'View Users',
    description: 'View user profiles and information',
    category: 'User Management'
  },
  {
    id: 'users.create',
    name: 'Create Users',
    description: 'Add new users to the system',
    category: 'User Management'
  },
  {
    id: 'users.edit',
    name: 'Edit Users',
    description: 'Modify user information and settings',
    category: 'User Management'
  },
  {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Remove users from the system',
    category: 'User Management'
  },
  {
    id: 'users.permissions',
    name: 'Manage Permissions',
    description: 'Modify user roles and permissions',
    category: 'User Management'
  },

  // Training & Documentation
  {
    id: 'training.agent',
    name: 'Agent Training',
    description: 'Access sales agent training materials',
    category: 'Training'
  },
  {
    id: 'training.manager',
    name: 'Manager Training',
    description: 'Access account manager training materials',
    category: 'Training'
  },
  {
    id: 'training.admin',
    name: 'Admin Training',
    description: 'Access administrator training materials',
    category: 'Training'
  },
  {
    id: 'training.owner',
    name: 'Owner Manual',
    description: 'Access business owner strategic materials',
    category: 'Training'
  },

  // Analytics & Reporting
  {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'View performance reports and analytics',
    category: 'Analytics'
  },
  {
    id: 'analytics.export',
    name: 'Export Data',
    description: 'Export reports and data',
    category: 'Analytics'
  },

  // System Administration
  {
    id: 'system.config',
    name: 'System Configuration',
    description: 'Modify system settings and configuration',
    category: 'System'
  },
  {
    id: 'system.backup',
    name: 'System Backup',
    description: 'Create and manage system backups',
    category: 'System'
  },
  {
    id: 'system.security',
    name: 'Security Management',
    description: 'Manage security settings and audit logs',
    category: 'System'
  },
  {
    id: 'system.integration',
    name: 'Integrations',
    description: 'Manage third-party integrations and APIs',
    category: 'System'
  }
];

// Role-based permission assignments
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  agent: {
    role: 'agent',
    permissions: [
      'crm.access',
      'crm.clients.view',
      'crm.clients.create',
      'crm.clients.edit',
      'training.agent',
      'analytics.view'
    ],
    canAccessRoles: ['agent']
  },
  manager: {
    role: 'manager',
    permissions: [
      'crm.access',
      'crm.clients.view',
      'crm.clients.create',
      'crm.clients.edit',
      'crm.clients.assign',
      'crm.clients.viewAll',
      'users.view',
      'users.edit',
      'training.agent',
      'training.manager',
      'analytics.view',
      'analytics.export'
    ],
    canAccessRoles: ['agent', 'manager']
  },
  admin: {
    role: 'admin',
    permissions: [
      'crm.access',
      'crm.clients.view',
      'crm.clients.create',
      'crm.clients.edit',
      'crm.clients.delete',
      'crm.clients.assign',
      'crm.clients.viewAll',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.permissions',
      'training.agent',
      'training.manager',
      'training.admin',
      'analytics.view',
      'analytics.export',
      'system.config',
      'system.backup',
      'system.security'
    ],
    canAccessRoles: ['agent', 'manager', 'admin']
  },
  owner: {
    role: 'owner',
    permissions: [
      // Owners have all permissions
      ...PERMISSIONS.map(p => p.id)
    ],
    canAccessRoles: ['agent', 'manager', 'admin', 'owner']
  }
};

// Security utility functions
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.permissions.includes(permission) || false;
}

export function canAccessRole(userRole: UserRole | undefined, targetRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.canAccessRoles.includes(targetRole) || false;
}

export function hasHigherRole(userRole: UserRole | undefined, compareRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[compareRole];
}

export function canManageUser(managerRole: UserRole | undefined, targetUserRole: UserRole): boolean {
  if (!managerRole) return false;
  
  // Users can only manage users with lower role hierarchy (not equal)
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetUserRole];
}

/**
 * STRICT: Check if user can access specific role-based content
 * Only allows access to content at or below their level
 */
export function canAccessRoleContent(userRole: UserRole | undefined, contentRole: UserRole): boolean {
  if (!userRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const contentLevel = ROLE_HIERARCHY[contentRole];
  
  // Users can only access content for their role level or below
  return userLevel >= contentLevel;
}

/**
 * STRICT: Get maximum accessible role level for a user
 * Returns the highest role level content they can access
 */
export function getMaxAccessibleRole(userRole: UserRole | undefined): UserRole[] {
  if (!userRole) return [];
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const accessibleRoles: UserRole[] = [];
  
  (Object.keys(ROLE_HIERARCHY) as UserRole[]).forEach(role => {
    if (ROLE_HIERARCHY[role] <= userLevel) {
      accessibleRoles.push(role);
    }
  });
  
  return accessibleRoles;
}

/**
 * STRICT: Permission check that prevents privilege escalation
 */
export function strictPermissionCheck(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Must have exact role or higher in hierarchy
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
}

/**
 * STRICT: Check if user can access training for a specific role
 */
export function canAccessTraining(userRole: UserRole | undefined, trainingRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Training access is hierarchical - higher roles can access lower role training
  return canAccessRoleContent(userRole, trainingRole);
}

// Get permissions by category for UI display
export function getPermissionsByCategory(): Record<string, Permission[]> {
  return PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}

// Get available permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  const rolePerms = ROLE_PERMISSIONS[role]?.permissions || [];
  return PERMISSIONS.filter(p => rolePerms.includes(p.id));
}

// Security validation functions
export function validateAccess(userRole: UserRole | undefined, requiredPermissions: string[]): boolean {
  if (!userRole) return false;
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}

export function getAccessibleTrainingModules(userRole: UserRole | undefined): UserRole[] {
  if (!userRole) return [];
  return ROLE_PERMISSIONS[userRole]?.canAccessRoles || [];
}

// Audit logging types
export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: string;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'access_denied'
  | 'permission_change';

// Security constants
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  REQUIRE_MFA_FOR_ADMIN: true,
  AUDIT_RETENTION_DAYS: 90
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  API_GENERAL: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  API_SENSITIVE: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute for sensitive operations
  CRM_OPERATIONS: { requests: 50, windowMs: 60 * 1000 } // 50 CRM operations per minute
} as const;

// User permissions interface
export interface UserPermissionsData {
  role: UserRole;
  permissions: string[];
}

// Mock function to get user permissions (replace with actual implementation)
export async function getUserPermissions(userId: string): Promise<UserPermissionsData> {
  // In a real implementation, this would fetch from your database
  // For now, returning mock data based on user ID or defaulting to 'agent'
  
  // Mock role assignment based on userId patterns (you can customize this)
  let role: UserRole = 'agent';
  
  if (userId.includes('owner') || userId.includes('admin')) {
    role = 'owner';
  } else if (userId.includes('manager')) {
    role = 'manager';
  } else if (userId.includes('admin')) {
    role = 'admin';
  }
  
  const permissions = ROLE_PERMISSIONS[role]?.permissions || [];
  
  return {
    role,
    permissions
  };
}
