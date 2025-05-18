import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '@/services/AuthService';
import {
  User,
  UserRole,
  Permission,
  LoginCredentials,
  RegisterData,
  ROLE_DEFINITIONS,
  getPermissionsForRole,
  roleHasPermission,
  getAllPermissionsForRoles
} from '@/types/user';

// Define user context type
interface UserContextType {
  // Role related
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Permission[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;

  // Auth related
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  // Role related
  roles: ['farmer'],
  primaryRole: 'farmer',
  permissions: getPermissionsForRole('farmer'),
  hasRole: () => false,
  hasPermission: () => false,

  // Auth related
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// User type details for UI display
export const userTypeDetails = {
  farmer: {
    id: 'farmer',
    title: 'Farmer',
    description: 'Crop cultivation, small to large scale farming operations',
    icon: 'leaf.fill',
    color: '#4CAF50',
  },
  livestock: {
    id: 'livestock',
    title: 'Livestock Manager',
    description: 'Cattle, sheep, goats, poultry management',
    icon: 'hare.fill',
    color: '#FF9800',
  },
  professional: {
    id: 'professional',
    title: 'Agricultural Professional',
    description: 'Veterinarians, agronomists, agricultural technicians',
    icon: 'person.fill.badge.plus',
    color: '#2196F3',
  },
  supplier: {
    id: 'supplier',
    title: 'Input Supplier',
    description: 'Sellers of seeds, fertilizers, equipment, veterinary products',
    icon: 'shippingbox.fill',
    color: '#9C27B0',
  },
  buyer: {
    id: 'buyer',
    title: 'Agricultural Buyer',
    description: 'Wholesalers, retailers, consumers of agricultural products',
    icon: 'cart.fill',
    color: '#F44336',
  },
};

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role state
  const [roles, setRoles] = useState<UserRole[]>(['farmer']);
  const [primaryRole, setPrimaryRole] = useState<UserRole>('farmer');
  const [permissions, setPermissions] = useState<Permission[]>(getPermissionsForRole('farmer'));

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  // Update permissions when roles change
  useEffect(() => {
    setPermissions(getAllPermissionsForRoles(roles));
  }, [roles]);

  // Update user roles and permissions from user object
  const updateUserRolesAndPermissions = (userData: User) => {
    if (userData.roles && Array.isArray(userData.roles)) {
      setRoles(userData.roles);
    }

    if (userData.primaryRole) {
      setPrimaryRole(userData.primaryRole);
    }

    // Update permissions based on roles
    const userPermissions = getAllPermissionsForRoles(userData.roles || []);
    setPermissions(userPermissions);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);

      // Check if two-factor authentication is required
      if (response.requireTwoFactor) {
        // Save the temporary token for later use
        await AsyncStorage.setItem('temp_auth_token', response.token);

        // Redirect to two-factor authentication screen
        const router = require('expo-router').router;
        router.push({
          pathname: '/auth/two-factor',
          params: {
            userId: response.user.id,
            method: response.twoFactorMethod || 'email'
          }
        });

        // Don't set authenticated yet, wait for 2FA verification
        setIsLoading(false);
        return;
      }

      // No 2FA required or already verified, proceed with login
      setUser(response.user);
      setIsAuthenticated(true);

      // Update roles and permissions
      updateUserRolesAndPermissions(response.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);

      // Update roles and permissions
      updateUserRolesAndPermissions(response.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);

    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Reset to default values
      setRoles(['farmer']);
      setPrimaryRole('farmer');
      setPermissions(getPermissionsForRole('farmer'));
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        const currentUser = await AuthService.getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);

          // Update roles and permissions
          updateUserRolesAndPermissions(currentUser);
        } else {
          // Load roles from storage if not authenticated
          try {
            const storedRoles = await AsyncStorage.getItem('user_roles');
            const storedPrimaryRole = await AsyncStorage.getItem('primary_role');

            if (storedRoles) {
              const parsedRoles = JSON.parse(storedRoles) as UserRole[];
              setRoles(parsedRoles);
              setPermissions(getAllPermissionsForRoles(parsedRoles));
            }

            if (storedPrimaryRole) {
              setPrimaryRole(storedPrimaryRole as UserRole);
            }
          } catch (storageErr) {
            console.error('Error loading roles from storage:', storageErr);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Save roles to storage when they change
  useEffect(() => {
    const saveRoles = async () => {
      try {
        await AsyncStorage.setItem('user_roles', JSON.stringify(roles));
        await AsyncStorage.setItem('primary_role', primaryRole);
      } catch (err) {
        console.error('Error saving roles to storage:', err);
      }
    };

    saveRoles();
  }, [roles, primaryRole]);

  return (
    <UserContext.Provider
      value={{
        // Role related
        roles,
        primaryRole,
        permissions,
        hasRole,
        hasPermission,

        // Auth related
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the user context
export const useUser = () => useContext(UserContext);
