import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { UserRole, Permission } from '@/types/user';

interface PermissionGuardOptions {
  /**
   * The roles that are allowed to access the route
   * If not provided, all roles are allowed
   */
  allowedRoles?: UserRole[];
  
  /**
   * The permissions that are required to access the route
   * If not provided, no specific permissions are required
   */
  requiredPermissions?: Permission[];
  
  /**
   * Whether all permissions are required (AND logic) or just one (OR logic)
   * Default is false (OR logic)
   */
  requireAllPermissions?: boolean;
  
  /**
   * Whether authentication is required to access the route
   * Default is true
   */
  requireAuth?: boolean;
  
  /**
   * The route to redirect to if access is denied
   * Default is '/auth/login' for unauthenticated users and '/' for authenticated users without permission
   */
  redirectTo?: string;
  
  /**
   * Whether to perform the redirect
   * Default is true
   */
  performRedirect?: boolean;
}

/**
 * Hook to guard routes based on user roles and permissions
 * 
 * @param options Permission guard options
 * @returns Object with hasAccess flag
 */
export const usePermissionGuard = ({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  requireAuth = true,
  redirectTo,
  performRedirect = true,
}: PermissionGuardOptions = {}) => {
  const router = useRouter();
  const { isAuthenticated, roles, hasRole, hasPermission } = useUser();
  
  // Check if user is authenticated
  const isUserAuthenticated = isAuthenticated;
  
  // Check if user has at least one of the allowed roles
  const hasAllowedRole = !allowedRoles || allowedRoles.length === 0 || 
    allowedRoles.some(role => hasRole(role));
  
  // Check if user has the required permissions
  let hasRequiredPermissions = true;
  
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      // AND logic - user must have all permissions
      hasRequiredPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
    } else {
      // OR logic - user must have at least one permission
      hasRequiredPermissions = requiredPermissions.some(permission => 
        hasPermission(permission)
      );
    }
  }
  
  // Determine if user has access
  const hasAccess = 
    (!requireAuth || isUserAuthenticated) && 
    (!isUserAuthenticated || hasAllowedRole) && 
    (!isUserAuthenticated || hasRequiredPermissions);
  
  // Redirect if access is denied
  useEffect(() => {
    if (!hasAccess && performRedirect) {
      if (!isUserAuthenticated && requireAuth) {
        // Redirect unauthenticated users to login
        router.replace(redirectTo || '/auth/login');
      } else if (isUserAuthenticated) {
        // Redirect authenticated users without permission to home
        router.replace(redirectTo || '/');
      }
    }
  }, [hasAccess, isUserAuthenticated, requireAuth, redirectTo, performRedirect, router]);
  
  return { hasAccess };
};

/**
 * Hook to guard routes that require super admin access
 */
export const useSuperAdminGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['super_admin'],
  });
};

/**
 * Hook to guard routes that require expert access
 */
export const useExpertGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['expert', 'super_admin'],
  });
};

/**
 * Hook to guard routes that require vendor access
 */
export const useVendorGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['vendor', 'super_admin'],
  });
};

/**
 * Hook to guard routes that require farmer access
 */
export const useFarmerGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['farmer', 'super_admin'],
  });
};

/**
 * Hook to guard routes that require moderator access
 */
export const useModeratorGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['moderator', 'super_admin'],
  });
};

/**
 * Hook to guard routes that require financial partner access
 */
export const useFinancialPartnerGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['financial_partner', 'super_admin'],
  });
};

/**
 * Hook to guard routes that require field agent access
 */
export const useFieldAgentGuard = (options: Omit<PermissionGuardOptions, 'allowedRoles'> = {}) => {
  return usePermissionGuard({
    ...options,
    allowedRoles: ['field_agent', 'super_admin'],
  });
};

export default usePermissionGuard;
