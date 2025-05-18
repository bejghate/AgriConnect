import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import { 
  isConnected, 
  getSyncStatus, 
  updateSyncStatus, 
  SyncStatus, 
  STORAGE_KEYS, 
  getData, 
  storeData 
} from '@/utils/storage';

// Define offline context type
interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  isSyncing: boolean;
  lastSyncTime: number;
  syncData: () => Promise<void>;
  downloadForOffline: (contentType: string, contentId: string) => Promise<boolean>;
  isContentAvailableOffline: (contentType: string, contentId: string) => Promise<boolean>;
  getOfflineContent: <T>(contentType: string, contentId: string) => Promise<T | null>;
}

// Create context with default values
const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  syncStatus: {
    lastSyncTime: 0,
    syncStatus: 'not-synced',
    syncedModules: {
      encyclopedia: false,
      weather: false,
      marketplace: false,
      consultations: false,
    },
  },
  isSyncing: false,
  lastSyncTime: 0,
  syncData: async () => {},
  downloadForOffline: async () => false,
  isContentAvailableOffline: async () => false,
  getOfflineContent: async () => null,
});

// Interface for offline content
interface OfflineContent {
  [contentId: string]: {
    data: any;
    timestamp: number;
  };
}

// Provider component
export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: 0,
    syncStatus: 'not-synced',
    syncedModules: {
      encyclopedia: false,
      weather: false,
      marketplace: false,
      consultations: false,
    },
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load initial sync status
  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    
    loadSyncStatus();
  }, []);

  // Set up network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
      
      // If we just came back online, check if we need to sync
      if (state.isConnected && !isOnline) {
        console.log('Device is back online, checking if sync is needed...');
      }
    });

    // Check initial connection status
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  // Sync data with the server
  const syncData = async (): Promise<void> => {
    if (!isOnline) {
      console.log('Cannot sync data while offline');
      return;
    }

    try {
      setIsSyncing(true);
      
      // Update sync status to in-progress
      await updateSyncStatus({
        syncStatus: 'in-progress',
      });
      setSyncStatus(prev => ({ ...prev, syncStatus: 'in-progress' }));

      // Simulate syncing data (in a real app, this would be API calls)
      console.log('Syncing encyclopedia data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Syncing weather data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sync status to success
      const newStatus: SyncStatus = {
        lastSyncTime: Date.now(),
        syncStatus: 'success',
        syncedModules: {
          encyclopedia: true,
          weather: true,
          marketplace: true,
          consultations: true,
        },
      };
      
      await updateSyncStatus(newStatus);
      setSyncStatus(newStatus);
      
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      
      // Update sync status to failed
      await updateSyncStatus({
        syncStatus: 'failed',
      });
      setSyncStatus(prev => ({ ...prev, syncStatus: 'failed' }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Download content for offline use
  const downloadForOffline = async (contentType: string, contentId: string): Promise<boolean> => {
    if (!isOnline) {
      console.log('Cannot download content while offline');
      return false;
    }

    try {
      console.log(`Downloading ${contentType} content with ID ${contentId} for offline use...`);
      
      // Get existing offline content
      const storageKey = `${STORAGE_KEYS.OFFLINE_ARTICLES}_${contentType}`;
      const existingContent = await getData<OfflineContent>(storageKey) || {};
      
      // Simulate fetching content data (in a real app, this would be an API call)
      // For now, we'll just use a mock object
      const contentData = {
        id: contentId,
        title: `${contentType} content ${contentId}`,
        content: `This is the content for ${contentType} with ID ${contentId}`,
        // Add more fields as needed
      };
      
      // Store the content with timestamp
      const updatedContent = {
        ...existingContent,
        [contentId]: {
          data: contentData,
          timestamp: Date.now(),
        },
      };
      
      await storeData(storageKey, updatedContent);
      
      console.log(`${contentType} content with ID ${contentId} downloaded successfully`);
      return true;
    } catch (error) {
      console.error(`Error downloading ${contentType} content:`, error);
      return false;
    }
  };

  // Check if content is available offline
  const isContentAvailableOffline = async (contentType: string, contentId: string): Promise<boolean> => {
    try {
      const storageKey = `${STORAGE_KEYS.OFFLINE_ARTICLES}_${contentType}`;
      const offlineContent = await getData<OfflineContent>(storageKey);
      
      return !!offlineContent && !!offlineContent[contentId];
    } catch (error) {
      console.error(`Error checking if ${contentType} content is available offline:`, error);
      return false;
    }
  };

  // Get offline content
  const getOfflineContent = async <T,>(contentType: string, contentId: string): Promise<T | null> => {
    try {
      const storageKey = `${STORAGE_KEYS.OFFLINE_ARTICLES}_${contentType}`;
      const offlineContent = await getData<OfflineContent>(storageKey);
      
      if (offlineContent && offlineContent[contentId]) {
        return offlineContent[contentId].data as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting offline ${contentType} content:`, error);
      return null;
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        syncStatus,
        isSyncing,
        lastSyncTime: syncStatus.lastSyncTime,
        syncData,
        downloadForOffline,
        isContentAvailableOffline,
        getOfflineContent,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook for using the offline context
export const useOffline = () => useContext(OfflineContext);
