import { Platform } from 'react-native';
import * as Network from 'expo-network';
import { STORAGE_KEYS, getData, storeData } from '@/utils/storage';

// Types for the sync system
export interface SyncInfo {
  lastSyncTimestamp: number;
  currentDatabaseVersion: string;
  availableVersion: string | null;
  updateAvailable: boolean;
  syncInProgress: boolean;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  description: string;
  updateType: 'minor' | 'major' | 'critical';
  contentUpdates: {
    category: string;
    itemCount: number;
    description: string;
  }[];
}

export interface SyncResult {
  success: boolean;
  message: string;
  updatedItems?: number;
  newItems?: number;
  errors?: string[];
}

// Mock data for available updates
const MOCK_AVAILABLE_UPDATES: UpdateInfo[] = [
  {
    version: '2.1.0',
    releaseDate: '2023-05-15',
    description: 'New disease treatments and updated pest control recommendations',
    updateType: 'minor',
    contentUpdates: [
      {
        category: 'Diseases',
        itemCount: 12,
        description: 'Updated treatments for common crop diseases'
      },
      {
        category: 'Pests',
        itemCount: 8,
        description: 'New pest control methods with reduced environmental impact'
      }
    ]
  },
  {
    version: '2.0.0',
    releaseDate: '2023-04-01',
    description: 'Major update with new plant varieties and livestock breeds',
    updateType: 'major',
    contentUpdates: [
      {
        category: 'Plant Varieties',
        itemCount: 25,
        description: 'Added drought-resistant crop varieties'
      },
      {
        category: 'Livestock Breeds',
        itemCount: 15,
        description: 'Added heat-tolerant cattle breeds'
      },
      {
        category: 'Soil Management',
        itemCount: 10,
        description: 'Updated soil conservation techniques'
      }
    ]
  },
  {
    version: '1.9.5',
    releaseDate: '2023-03-10',
    description: 'Critical update for tomato disease identification',
    updateType: 'critical',
    contentUpdates: [
      {
        category: 'Diseases',
        itemCount: 5,
        description: 'Updated information on tomato blight and treatment options'
      }
    ]
  }
];

// Default sync info
const DEFAULT_SYNC_INFO: SyncInfo = {
  lastSyncTimestamp: 0,
  currentDatabaseVersion: '1.9.0',
  availableVersion: null,
  updateAvailable: false,
  syncInProgress: false
};

/**
 * SyncService handles synchronization of encyclopedia content with the central database
 */
class SyncService {
  private syncInfo: SyncInfo = DEFAULT_SYNC_INFO;
  private updateHistory: UpdateInfo[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private syncIntervalMinutes = 60; // Check for updates every hour by default
  
  constructor() {
    this.loadSyncInfo();
  }
  
  /**
   * Load sync information from storage
   */
  private async loadSyncInfo(): Promise<void> {
    try {
      const storedSyncInfo = await getData<SyncInfo>(STORAGE_KEYS.SYNC_INFO);
      if (storedSyncInfo) {
        this.syncInfo = storedSyncInfo;
      }
      
      const storedUpdateHistory = await getData<UpdateInfo[]>(STORAGE_KEYS.UPDATE_HISTORY);
      if (storedUpdateHistory) {
        this.updateHistory = storedUpdateHistory;
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  }
  
  /**
   * Save sync information to storage
   */
  private async saveSyncInfo(): Promise<void> {
    try {
      await storeData(STORAGE_KEYS.SYNC_INFO, this.syncInfo);
      await storeData(STORAGE_KEYS.UPDATE_HISTORY, this.updateHistory);
    } catch (error) {
      console.error('Error saving sync info:', error);
    }
  }
  
  /**
   * Start automatic synchronization at the specified interval
   */
  public startAutoSync(intervalMinutes: number = this.syncIntervalMinutes): void {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncIntervalMinutes = intervalMinutes;
    
    // Set up new interval
    this.syncInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, intervalMinutes * 60 * 1000);
    
    // Do an initial check
    this.checkForUpdates();
  }
  
  /**
   * Stop automatic synchronization
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Check if updates are available
   */
  public async checkForUpdates(): Promise<boolean> {
    // Don't check if already syncing
    if (this.syncInfo.syncInProgress) {
      return false;
    }
    
    try {
      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        return false;
      }
      
      this.syncInfo.syncInProgress = true;
      await this.saveSyncInfo();
      
      // In a real app, this would be an API call to check for updates
      // For now, we'll simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in a real app, this would come from the server
      const latestVersion = MOCK_AVAILABLE_UPDATES[0].version;
      
      // Compare versions
      const currentVersion = this.syncInfo.currentDatabaseVersion.split('.').map(Number);
      const newVersion = latestVersion.split('.').map(Number);
      
      let updateAvailable = false;
      
      // Compare major version
      if (newVersion[0] > currentVersion[0]) {
        updateAvailable = true;
      } else if (newVersion[0] === currentVersion[0]) {
        // Compare minor version
        if (newVersion[1] > currentVersion[1]) {
          updateAvailable = true;
        } else if (newVersion[1] === currentVersion[1]) {
          // Compare patch version
          if (newVersion[2] > currentVersion[2]) {
            updateAvailable = true;
          }
        }
      }
      
      this.syncInfo.availableVersion = updateAvailable ? latestVersion : null;
      this.syncInfo.updateAvailable = updateAvailable;
      this.syncInfo.syncInProgress = false;
      this.syncInfo.lastSyncTimestamp = Date.now();
      
      await this.saveSyncInfo();
      
      return updateAvailable;
    } catch (error) {
      console.error('Error checking for updates:', error);
      this.syncInfo.syncInProgress = false;
      await this.saveSyncInfo();
      return false;
    }
  }
  
  /**
   * Download and apply updates
   */
  public async applyUpdates(): Promise<SyncResult> {
    if (!this.syncInfo.updateAvailable || !this.syncInfo.availableVersion) {
      return {
        success: false,
        message: 'No updates available'
      };
    }
    
    if (this.syncInfo.syncInProgress) {
      return {
        success: false,
        message: 'Sync already in progress'
      };
    }
    
    try {
      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        return {
          success: false,
          message: 'No internet connection'
        };
      }
      
      this.syncInfo.syncInProgress = true;
      await this.saveSyncInfo();
      
      // In a real app, this would download and apply updates from the server
      // For now, we'll simulate a network request and update process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the update info for the available version
      const updateInfo = MOCK_AVAILABLE_UPDATES.find(
        update => update.version === this.syncInfo.availableVersion
      );
      
      if (!updateInfo) {
        throw new Error('Update info not found');
      }
      
      // Calculate total items to update
      const totalItems = updateInfo.contentUpdates.reduce(
        (sum, update) => sum + update.itemCount, 0
      );
      
      // Update sync info
      this.syncInfo.currentDatabaseVersion = this.syncInfo.availableVersion;
      this.syncInfo.availableVersion = null;
      this.syncInfo.updateAvailable = false;
      this.syncInfo.syncInProgress = false;
      this.syncInfo.lastSyncTimestamp = Date.now();
      
      // Add to update history
      this.updateHistory.unshift(updateInfo);
      
      await this.saveSyncInfo();
      
      return {
        success: true,
        message: `Successfully updated to version ${updateInfo.version}`,
        updatedItems: Math.floor(totalItems * 0.7),
        newItems: Math.floor(totalItems * 0.3)
      };
    } catch (error) {
      console.error('Error applying updates:', error);
      this.syncInfo.syncInProgress = false;
      await this.saveSyncInfo();
      
      return {
        success: false,
        message: `Error applying updates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Get current sync information
   */
  public getSyncInfo(): SyncInfo {
    return { ...this.syncInfo };
  }
  
  /**
   * Get update history
   */
  public getUpdateHistory(): UpdateInfo[] {
    return [...this.updateHistory];
  }
  
  /**
   * Get available update info
   */
  public getAvailableUpdateInfo(): UpdateInfo | null {
    if (!this.syncInfo.updateAvailable || !this.syncInfo.availableVersion) {
      return null;
    }
    
    return MOCK_AVAILABLE_UPDATES.find(
      update => update.version === this.syncInfo.availableVersion
    ) || null;
  }
}

// Export a singleton instance
export const syncService = new SyncService();
