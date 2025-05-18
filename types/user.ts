/**
 * User-related types for the AgriConnect application
 */

// User roles
export type UserRole =
  | 'super_admin'
  | 'expert'
  | 'vendor'
  | 'farmer'
  | 'moderator'
  | 'financial_partner'
  | 'field_agent';

// User role details for UI display
export interface RoleDetails {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
}

// User permissions
export type Permission =
  | 'user.manage'
  | 'content.manage'
  | 'system.manage'
  | 'stats.view'
  | 'profile.manage'
  | 'consultation.respond'
  | 'content.publish'
  | 'marketplace.manage'
  | 'order.manage'
  | 'buyer.message'
  | 'encyclopedia.access'
  | 'expert.access'
  | 'marketplace.access'
  | 'farm.manage'
  | 'dashboard.customize'
  | 'notification.manage'
  | 'content.validate'
  | 'dispute.resolve'
  | 'report.manage'
  | 'finance.access'
  | 'credit.manage'
  | 'farmer.group.manage'
  | 'training.track'
  | 'user.register';

// User data interface
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Permission[];
  profileImage?: string;
  location?: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  lastLogin: string;
  active: boolean;
  verified: boolean;
  phoneNumber?: string;
  language: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    theme: string;
    dashboardLayout: string;
    [key: string]: any;
  };
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
  phoneNumber?: string;
}

// Auth response from API
export interface AuthResponse {
  user: User;
  token: string;
  requireTwoFactor?: boolean;
  twoFactorMethod?: 'email' | 'sms';
}

// Role definitions with permissions
export const ROLE_DEFINITIONS: Record<UserRole, RoleDetails> = {
  super_admin: {
    id: 'super_admin',
    title: 'Super Administrateur',
    description: 'Gestion totale : utilisateurs, contenu, paramètres système, statistiques',
    icon: 'shield.fill',
    color: '#FF5722',
    permissions: [
      'user.manage',
      'content.manage',
      'system.manage',
      'stats.view'
    ]
  },
  expert: {
    id: 'expert',
    title: 'Expert',
    description: 'Gestion de leur profil, réponse aux consultations, publication de contenu',
    icon: 'person.fill.badge.plus',
    color: '#2196F3',
    permissions: [
      'profile.manage',
      'consultation.respond',
      'content.publish'
    ]
  },
  vendor: {
    id: 'vendor',
    title: 'Vendeur',
    description: 'Création/gestion des annonces, suivi des commandes, messagerie avec acheteurs',
    icon: 'cart.fill',
    color: '#9C27B0',
    permissions: [
      'marketplace.manage',
      'order.manage',
      'buyer.message'
    ]
  },
  farmer: {
    id: 'farmer',
    title: 'Agriculteur',
    description: 'Accès complet : encyclopédie, experts, marketplace, outils de gestion',
    icon: 'leaf.fill',
    color: '#4CAF50',
    permissions: [
      'encyclopedia.access',
      'expert.access',
      'marketplace.access',
      'farm.manage',
      'dashboard.customize',
      'notification.manage'
    ]
  },
  moderator: {
    id: 'moderator',
    title: 'Modérateur',
    description: 'Validation du contenu utilisateur, résolution des litiges dans le marketplace',
    icon: 'checkmark.shield.fill',
    color: '#FFC107',
    permissions: [
      'content.validate',
      'dispute.resolve',
      'report.manage'
    ]
  },
  financial_partner: {
    id: 'financial_partner',
    title: 'Partenaire Financier',
    description: 'Accès limité aux demandes de financement et aux données économiques partagées par les agriculteurs',
    icon: 'dollarsign.circle.fill',
    color: '#3F51B5',
    permissions: [
      'finance.access',
      'credit.manage'
    ]
  },
  field_agent: {
    id: 'field_agent',
    title: 'Agent de Terrain',
    description: 'Création et gestion de groupes d\'agriculteurs, suivi des formations, enregistrement des utilisateurs sans smartphone',
    icon: 'person.3.fill',
    color: '#795548',
    permissions: [
      'farmer.group.manage',
      'training.track',
      'user.register'
    ]
  }
};

// Get permissions for a role
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_DEFINITIONS[role]?.permissions || [];
};

// Check if a role has a specific permission
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_DEFINITIONS[role]?.permissions.includes(permission) || false;
};

// Get all permissions for multiple roles
export const getAllPermissionsForRoles = (roles: UserRole[]): Permission[] => {
  const permissionsSet = new Set<Permission>();

  roles.forEach(role => {
    const rolePermissions = getPermissionsForRole(role);
    rolePermissions.forEach(permission => permissionsSet.add(permission));
  });

  return Array.from(permissionsSet);
};
