import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

// Définition des types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userTypes: string[];
  primaryUserType: string;
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
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserType: (userTypes: string[], primaryUserType: string) => Promise<void>;
  clearError: () => void;
}

// Création du store avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Connexion
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            username: 'farmer_demo',
            email: email,
            fullName: 'Amadou Diallo',
            userTypes: ['farmer', 'livestock'],
            primaryUserType: 'farmer',
            profileImage: 'https://example.com/profile.jpg',
            location: {
              region: 'Centre',
              coordinates: {
                latitude: 12.3456,
                longitude: -1.2345,
              },
            },
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          
          const mockToken = 'mock_jwt_token_123456789';
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: 'Échec de la connexion. Veuillez vérifier vos identifiants.',
            isLoading: false,
          });
        }
      },
      
      // Inscription
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.post(`${API_URL}/auth/register`, userData);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const mockUser: User = {
            id: '2',
            username: userData.username || 'new_user',
            email: userData.email || 'user@example.com',
            fullName: userData.fullName || 'Nouvel Utilisateur',
            userTypes: userData.userTypes || ['farmer'],
            primaryUserType: userData.primaryUserType || 'farmer',
            profileImage: userData.profileImage,
            location: userData.location,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          
          const mockToken = 'mock_jwt_token_for_new_user';
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Registration error:', error);
          set({
            error: 'Échec de l\'inscription. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Déconnexion
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      // Mise à jour du profil utilisateur
      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('Utilisateur non connecté');
          }
          
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.put(`${API_URL}/users/${currentUser.id}`, userData, {
          //   headers: { Authorization: `Bearer ${get().token}` }
          // });
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const updatedUser = {
            ...currentUser,
            ...userData,
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          console.error('Update user error:', error);
          set({
            error: 'Échec de la mise à jour du profil. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Mise à jour des types d'utilisateur
      updateUserType: async (userTypes, primaryUserType) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('Utilisateur non connecté');
          }
          
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.put(`${API_URL}/users/${currentUser.id}/types`, {
          //   userTypes,
          //   primaryUserType
          // }, {
          //   headers: { Authorization: `Bearer ${get().token}` }
          // });
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedUser = {
            ...currentUser,
            userTypes,
            primaryUserType,
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          console.error('Update user type error:', error);
          set({
            error: 'Échec de la mise à jour des types d\'utilisateur. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
