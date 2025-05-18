import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Définition des types
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  offlineMode: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // en minutes
  lastSyncTimestamp: number | null;
}

interface AppState {
  isFirstLaunch: boolean;
  isAppReady: boolean;
  isOnline: boolean;
  settings: AppSettings;
  pushToken: string | null;
  
  // Actions
  setFirstLaunch: (value: boolean) => void;
  setAppReady: (value: boolean) => void;
  setOnlineStatus: (value: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  setPushToken: (token: string | null) => void;
}

// Paramètres par défaut
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'fr',
  fontSize: 'medium',
  offlineMode: false,
  dataUsage: 'medium',
  notificationsEnabled: true,
  locationEnabled: true,
  autoSync: true,
  syncInterval: 60, // 1 heure
  lastSyncTimestamp: null,
};

// Création du store avec persistance
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      isAppReady: false,
      isOnline: true,
      settings: defaultSettings,
      pushToken: null,
      
      // Définir si c'est le premier lancement
      setFirstLaunch: (value) => set({ isFirstLaunch: value }),
      
      // Définir si l'application est prête
      setAppReady: (value) => set({ isAppReady: value }),
      
      // Mettre à jour le statut de connexion
      setOnlineStatus: (value) => set({ isOnline: value }),
      
      // Mettre à jour les paramètres
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      
      // Réinitialiser les paramètres
      resetSettings: () => set({ settings: defaultSettings }),
      
      // Définir le token de notification push
      setPushToken: (token) => set({ pushToken: token }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isFirstLaunch: state.isFirstLaunch,
        settings: state.settings,
        pushToken: state.pushToken,
      }),
    }
  )
);
