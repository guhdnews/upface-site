import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, hasPermission, canAccessRole, validateAccess } from '../../lib/permissions';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { UserService } from '../../lib/user-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredPermission?: string;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredPermission,
  requiredRole,
  allowedRoles = [],
  fallbackPath = '/login',
  showUnauthorized = false
}: ProtectedRouteProps) {
  const { user, userProfile, loading, hasPermission: authHasPermission } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!user) {
      router.push(fallbackPath);
      return;
    }

    // Check if user profile exists and is active
    if (!userProfile) {
      // Profile not loaded yet or doesn't exist
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    if (userProfile.status !== 'active') {
      // User account is inactive
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    // Check permissions
    let authorized = true;

    // Check single permission
    if (requiredPermission && !authHasPermission(requiredPermission)) {
      authorized = false;
    }

    // Check specific role requirement
    if (requiredRole && userProfile.role !== requiredRole && !canAccessRole(userProfile.role, requiredRole)) {
      authorized = false;
    }

    // Check allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
      authorized = false;
    }

    // Check specific permissions (array)
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(perm => authHasPermission(perm));
      if (!hasAllPermissions) {
        authorized = false;
      }
    }

    if (!authorized) {
      if (showUnauthorized) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      } else {
        // Log unauthorized access attempt
        logUnauthorizedAccess(user, router.pathname, userProfile.role);
        router.push('/unauthorized');
        return;
      }
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, userProfile, loading, router, requiredPermissions, requiredPermission, requiredRole, allowedRoles, fallbackPath, showUnauthorized, authHasPermission]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl text-white mb-2">Verifying Access</h2>
          <p className="text-gray-400">Please wait while we verify your permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if configured to do so
  if (!isAuthorized && showUnauthorized) {
    return <UnauthorizedAccess userProfile={userProfile} requiredPermission={requiredPermission} requiredPermissions={requiredPermissions} />;
  }

  // User is authorized, render children
  return <>{children}</>;
}

interface UnauthorizedAccessProps {
  userProfile?: any;
  requiredPermission?: string;
  requiredPermissions?: string[];
}

function UnauthorizedAccess({ userProfile, requiredPermission, requiredPermissions }: UnauthorizedAccessProps) {
  const router = useRouter();

  const getRequiredText = () => {
    if (requiredPermission) return requiredPermission;
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requiredPermissions.join(', ');
    }
    return 'Unknown permission';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          
          {!userProfile ? (
            <p className="text-gray-300 mb-6">
              Your user profile could not be found or is inactive. Please contact support.
            </p>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                You don&apos;t have the required permissions to access this resource.
              </p>
              <div className="text-sm text-red-400/70 mb-6">
                <div>Your role: <span className="capitalize font-medium">{userProfile.role}</span></div>
                <div className="mt-1">Required: {getRequiredText()}</div>
              </div>
            </>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full btn btn-secondary"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/crm')}
              className="w-full btn btn-primary"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}

// Utility function to get user role from auth user (fallback for backward compatibility)
function getUserRole(user: any): UserRole | undefined {
  // Check if role is directly available in user object
  if (user.role) {
    return user.role as UserRole;
  }

  // Check custom claims from Firebase
  if (user.customClaims?.role) {
    return user.customClaims.role as UserRole;
  }

  // Check email-based role assignment for initial setup
  const email = user.email?.toLowerCase();
  if (email?.includes('admin') || email?.includes('phelps')) {
    return 'owner';
  }
  if (email?.includes('manager')) {
    return 'manager';
  }
  
  // Default to agent for new users
  return 'agent';
}

// Log unauthorized access attempts for security monitoring
function logUnauthorizedAccess(user: any, path: string, userRole?: UserRole) {
  console.warn('Unauthorized access attempt:', {
    userId: user.uid,
    email: user.email,
    role: userRole,
    path: path,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
  });

  // In production, send this to your audit logging system
  // auditLogger.log('access_denied', { ... });
}

// Hook for checking permissions in components
export function usePermissions() {
  const { userProfile, hasPermission: authHasPermission } = useAuth();
  const userRole = userProfile?.role;

  return {
    userRole,
    userProfile,
    hasPermission: authHasPermission,
    canAccessRole: (role: UserRole) => canAccessRole(userRole, role),
    validateAccess: (permissions: string[]) => validateAccess(userRole, permissions)
  };
}

// Component for conditionally rendering based on permissions
interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export function ConditionalRender({
  children,
  requiredPermissions = [],
  requiredRole,
  allowedRoles = [],
  fallback = null
}: ConditionalRenderProps) {
  const { userRole, validateAccess, canAccessRole } = usePermissions();

  if (!userRole) return <>{fallback}</>;

  let authorized = true;

  // Check specific role requirement
  if (requiredRole && userRole !== requiredRole && !canAccessRole(requiredRole)) {
    authorized = false;
  }

  // Check allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    authorized = false;
  }

  // Check specific permissions
  if (requiredPermissions.length > 0 && !validateAccess(requiredPermissions)) {
    authorized = false;
  }

  return authorized ? <>{children}</> : <>{fallback}</>;
}

// Page wrapper for easy protection
export function SecurePage({ 
  children, 
  ...props 
}: ProtectedRouteProps & { children: React.ReactNode }) {
  return (
    <ProtectedRoute {...props}>
      {children}
    </ProtectedRoute>
  );
}