import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';
import MockAuthService from './MockAuthService';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/user';

// Définir si on utilise le mock ou le vrai service
const USE_MOCK = true; // Mettre à true pour le développement sans backend

// Using types from @/types/user

class AuthService {
  private token: string | null = null;
  private apiUrl = API_URL || 'http://localhost:3000/api';

  constructor() {
    // Load token from storage when service is initialized
    this.loadToken();
  }

  // Load token from AsyncStorage
  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.token = token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  // Save token to AsyncStorage
  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  // Remove token from AsyncStorage
  private async removeToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
      this.token = null;
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Register a new user
  async register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
      return MockAuthService.register(data);
    }

    try {
      const response = await axios.post(`${this.apiUrl}/auth/register`, data);
      const { user, token } = response.data;

      await this.saveToken(token);

      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login a user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      return MockAuthService.login(credentials);
    }

    try {
      const response = await axios.post(`${this.apiUrl}/auth/login`, credentials);
      const { user, token, requireTwoFactor, twoFactorMethod } = response.data;

      // If two-factor authentication is required, don't save the token yet
      if (requireTwoFactor) {
        return {
          user,
          token,
          requireTwoFactor: true,
          twoFactorMethod
        };
      }

      // No 2FA required, save token and proceed
      await this.saveToken(token);
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Complete login after two-factor authentication
  async completeTwoFactorAuth(userId: string, token: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      return MockAuthService.completeTwoFactorAuth(userId, token);
    }

    try {
      // Save the token after successful 2FA verification
      await this.saveToken(token);

      // Get the user data
      const user = await this.getCurrentUser();

      if (!user) {
        throw new Error('Failed to get user data after two-factor authentication');
      }

      return { user, token };
    } catch (error) {
      console.error('Complete two-factor auth error:', error);
      throw error;
    }
  }

  // Logout a user
  async logout(): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.logout();
    }

    try {
      await this.removeToken();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) {
      return MockAuthService.getCurrentUser();
    }

    if (!this.token) {
      return null;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If unauthorized, clear token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.removeToken();
      }
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (USE_MOCK) {
      return MockAuthService.isAuthenticated();
    }
    return !!this.token;
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      return MockAuthService.updateProfile(data);
    }

    try {
      const response = await axios.put(`${this.apiUrl}/auth/profile`, data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.changePassword(oldPassword, newPassword);
    }

    try {
      await axios.put(`${this.apiUrl}/auth/change-password`, {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.requestPasswordReset(email);
    }

    try {
      await axios.post(`${this.apiUrl}/auth/forgot-password`, { email });
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.resetPassword(token, newPassword);
    }

    try {
      await axios.post(`${this.apiUrl}/auth/reset-password`, {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.verifyEmail(token);
    }

    try {
      await axios.post(`${this.apiUrl}/auth/verify-email/${token}`);
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerificationEmail(email?: string): Promise<void> {
    if (USE_MOCK) {
      return MockAuthService.resendVerificationEmail(email);
    }

    try {
      await axios.post(`${this.apiUrl}/auth/resend-verification`, { email });
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    if (USE_MOCK) {
      return MockAuthService.changePassword(userId, currentPassword, newPassword);
    }

    try {
      const response = await axios.post(`${this.apiUrl}/auth/change-password`, {
        userId,
        currentPassword,
        newPassword,
      });
      return response.data.success;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new AuthService();
