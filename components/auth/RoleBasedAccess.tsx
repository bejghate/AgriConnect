import React from 'react';
import { useUser } from '@/context/UserContext';
import { UserRole, Permission } from '@/types/user';

interface RoleBasedAccessProps {
  /**
   * The roles that are allowed to access the content
   * If not provided, all roles are allowed
   */
  allowedRoles?: UserRole[];
  
  /**
   * The permissions that are required to access the content
   * If not provided, no specific permissions are required
   */
  requiredPermissions?: Permission[];
  
  /**
   * Whether all permissions are required (AND logic) or just one (OR logic)
   * Default is false (OR logic)
   */
  requireAllPermissions?: boolean;
  
  /**
   * Content to render if access is granted
   */
  children: React.ReactNode;
  
  /**
   * Content to render if access is denied
   * If not provided, nothing will be rendered when access is denied
   */
  fallback?: React.ReactNode;
}

/**
 * Component to control access to UI elements based on user roles and permissions
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  children,
  fallback = null,
}) => {
  const { roles, hasRole, hasPermission } = useUser();
  
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
  
  // Grant access only if user has both an allowed role and the required permissions
  const hasAccess = hasAllowedRole && hasRequiredPermissions;
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component to show content only to super administrators
 */
export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to experts
 */
export const ExpertOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['expert', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to vendors
 */
export const VendorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['vendor', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to farmers
 */
export const FarmerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['farmer', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to moderators
 */
export const ModeratorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['moderator', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to financial partners
 */
export const FinancialPartnerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['financial_partner', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to field agents
 */
export const FieldAgentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <RoleBasedAccess allowedRoles={['field_agent', 'super_admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component to show content only to authenticated users
 */
export const AuthenticatedOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  const { isAuthenticated } = useUser();
  
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default RoleBasedAccess;
