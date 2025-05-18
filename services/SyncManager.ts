import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import DatabaseService, { Tables } from './DatabaseService';
import api from '@/utils/api';
import { useAppStore } from '@/store/useAppStore';
import { APP_CONFIG } from '@/constants/Config';

// Background sync task name
const BACKGROUND_SYNC_TASK = 'background-sync';

// Sync status types
export type SyncStatus = 'pending' | 'in-progress' | 'success' | 'failed' | 'partial';

// Sync info interface
export interface SyncInfo {
  module: string;
  lastSyncTime: number;
  syncStatus: SyncStatus;
  version: string;
}

// Sync options interface
export interface SyncOptions {
  forceSync?: boolean;
  syncModules?: string[];
  compressionEnabled?: boolean;
  lowBandwidthMode?: boolean;
  syncTimeout?: number;
}

// Default sync options
const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  forceSync: false,
  syncModules: ['encyclopedia', 'weather', 'marketplace', 'farm_management', 'consultations', 'financial_services'],
  compressionEnabled: true,
  lowBandwidthMode: false,
  syncTimeout: 30000, // 30 seconds
};

// Sync manager class
class SyncManager {
  private isInitialized: boolean = false;
  private isSyncing: boolean = false;
  private syncQueue: string[] = [];
  private networkListener: any = null;
  private lastConnectionType: string | null = null;
  private pendingSync: boolean = false;
  private syncInterval: any = null;

  // Initialize the sync manager
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize the database
      await DatabaseService.initialize();

      // Register background sync task
      this.registerBackgroundSync();

      // Set up network listener
      this.setupNetworkListener();

      // Set up automatic sync
      this.setupAutoSync();

      this.isInitialized = true;
      console.log('Sync manager initialized successfully');
    } catch (error) {
      console.error('Error initializing sync manager:', error);
      throw error;
    }
  }

  // Register background sync task
  private registerBackgroundSync(): void {
    if (Platform.OS === 'web') {
      return; // Background fetch not supported on web
    }

    // Define the task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      try {
        const isConnected = await this.checkConnectivity();
        if (!isConnected) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Get app settings
        const { settings } = useAppStore.getState();
        if (!settings.autoSync) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Perform sync with low bandwidth mode
        const syncOptions: SyncOptions = {
          ...DEFAULT_SYNC_OPTIONS,
          lowBandwidthMode: true,
          syncModules: ['encyclopedia', 'weather'], // Only sync essential modules in background
        };

        const result = await this.syncData(syncOptions);
        return result.success
          ? BackgroundFetch.BackgroundFetchResult.NewData
          : BackgroundFetch.BackgroundFetchResult.Failed;
      } catch (error) {
        console.error('Error in background sync task:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register the task
    BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes minimum
      stopOnTerminate: false,
      startOnBoot: true,
    }).catch((error) => {
      console.error('Error registering background sync task:', error);
    });
  }

  // Set up network listener
  private setupNetworkListener(): void {
    // Remove existing listener if any
    if (this.networkListener) {
      this.networkListener();
    }

    // Set up new listener
    this.networkListener = NetInfo.addEventListener(this.handleNetworkChange);

    // Get initial network state
    NetInfo.fetch().then(this.handleNetworkChange);
  }

  // Handle network state changes
  private handleNetworkChange = (state: NetInfoState): void => {
    const isConnected = state.isConnected ?? false;
    const connectionType = state.type;

    // Update online status in app store
    useAppStore.getState().setOnlineStatus(isConnected);

    // Check if we need to sync after reconnection
    if (isConnected && !this.lastConnectionType) {
      // We just reconnected
      console.log('Network reconnected, checking for pending sync');
      this.checkPendingSync();
    } else if (isConnected && this.lastConnectionType !== connectionType) {
      // Connection type changed (e.g., from cellular to wifi)
      console.log(`Connection type changed from ${this.lastConnectionType} to ${connectionType}`);
      
      // If we switched to a better connection (e.g., from cellular to wifi), sync data
      if (
        (this.lastConnectionType === 'cellular' && connectionType === 'wifi') ||
        (this.lastConnectionType === '2g' && (connectionType === '3g' || connectionType === '4g' || connectionType === 'wifi')) ||
        (this.lastConnectionType === '3g' && (connectionType === '4g' || connectionType === 'wifi'))
      ) {
        console.log('Switched to a better connection, syncing data');
        this.syncData({
          ...DEFAULT_SYNC_OPTIONS,
          lowBandwidthMode: connectionType !== 'wifi',
        });
      }
    }

    // Update last connection type
    this.lastConnectionType = connectionType;
  };

  // Set up automatic sync
  private setupAutoSync(): void {
    // Clear existing interval if any
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Get sync interval from settings
    const { settings } = useAppStore.getState();
    if (!settings.autoSync) {
      return;
    }

    const intervalMinutes = settings.syncInterval || APP_CONFIG.DEFAULT_SYNC_INTERVAL;
    
    // Set up new interval
    this.syncInterval = setInterval(() => {
      this.checkAutoSync();
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto sync set up with interval of ${intervalMinutes} minutes`);
  }

  // Check if we should perform auto sync
  private async checkAutoSync(): Promise<void> {
    try {
      // Check if auto sync is enabled
      const { settings } = useAppStore.getState();
      if (!settings.autoSync) {
        return;
      }

      // Check connectivity
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        this.pendingSync = true;
        return;
      }

      // Check if we're on a metered connection and respect data usage setting
      const netInfo = await NetInfo.fetch();
      const isMetered = netInfo.isConnectionExpensive ?? false;
      const lowBandwidthMode = isMetered && settings.dataUsage === 'low';

      // Perform sync
      await this.syncData({
        ...DEFAULT_SYNC_OPTIONS,
        lowBandwidthMode,
      });
    } catch (error) {
      console.error('Error in auto sync check:', error);
    }
  }

  // Check for pending sync after reconnection
  private async checkPendingSync(): Promise<void> {
    try {
      // Check if we have a pending sync
      if (!this.pendingSync) {
        // Check if last sync was too long ago
        const lastSyncTime = await this.getLastSyncTime();
        const now = Date.now();
        const { settings } = useAppStore.getState();
        const syncInterval = settings.syncInterval || APP_CONFIG.DEFAULT_SYNC_INTERVAL;
        
        // If last sync was more than 2x the sync interval ago, we should sync
        if (now - lastSyncTime > syncInterval * 60 * 1000 * 2) {
          this.pendingSync = true;
        } else {
          return;
        }
      }

      // Reset pending sync flag
      this.pendingSync = false;

      // Check connectivity
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        this.pendingSync = true;
        return;
      }

      // Check if we're on a metered connection and respect data usage setting
      const netInfo = await NetInfo.fetch();
      const isMetered = netInfo.isConnectionExpensive ?? false;
      const { settings } = useAppStore.getState();
      const lowBandwidthMode = isMetered && settings.dataUsage === 'low';

      // Perform sync
      await this.syncData({
        ...DEFAULT_SYNC_OPTIONS,
        lowBandwidthMode,
      });
    } catch (error) {
      console.error('Error checking pending sync:', error);
    }
  }

  // Check connectivity
  private async checkConnectivity(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }

  // Get last sync time
  private async getLastSyncTime(): Promise<number> {
    try {
      // Get the latest sync time from the database
      const syncInfos = await DatabaseService.query<SyncInfo>(
        `SELECT * FROM ${Tables.SYNC_INFO} ORDER BY last_sync_time DESC LIMIT 1`
      );

      if (syncInfos.length === 0) {
        return 0;
      }

      return syncInfos[0].lastSyncTime;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return 0;
    }
  }

  // Sync data with the server
  async syncData(options: SyncOptions = DEFAULT_SYNC_OPTIONS): Promise<{ success: boolean; message: string }> {
    // Check if already syncing
    if (this.isSyncing) {
      console.log('Sync already in progress, queueing modules');
      
      // Queue modules for sync
      if (options.syncModules) {
        options.syncModules.forEach((module) => {
          if (!this.syncQueue.includes(module)) {
            this.syncQueue.push(module);
          }
        });
      }
      
      return { success: false, message: 'Sync already in progress' };
    }

    // Check connectivity
    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      this.pendingSync = true;
      return { success: false, message: 'No internet connection' };
    }

    // Merge options with defaults
    const syncOptions: SyncOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };
    
    // Start syncing
    this.isSyncing = true;
    
    try {
      console.log('Starting data sync with options:', syncOptions);
      
      // Update sync status in app store
      const { settings } = useAppStore.getState();
      useAppStore.getState().updateSettings({
        ...settings,
        lastSyncTimestamp: Date.now(),
      });
      
      // Sync each module
      const results: { module: string; success: boolean; message: string }[] = [];
      
      for (const module of syncOptions.syncModules!) {
        try {
          // Update sync status in database
          await DatabaseService.execute(
            `INSERT OR REPLACE INTO ${Tables.SYNC_INFO} (module, last_sync_time, sync_status, version) 
             VALUES (?, ?, ?, ?)`,
            [module, Date.now(), 'in-progress', '1.0']
          );
          
          // Sync module data
          const result = await this.syncModule(module, syncOptions);
          results.push({ module, ...result });
          
          // Update sync status in database
          await DatabaseService.execute(
            `UPDATE ${Tables.SYNC_INFO} SET sync_status = ?, last_sync_time = ? WHERE module = ?`,
            [result.success ? 'success' : 'failed', Date.now(), module]
          );
        } catch (error) {
          console.error(`Error syncing module ${module}:`, error);
          results.push({ module, success: false, message: `Error: ${error.message}` });
          
          // Update sync status in database
          await DatabaseService.execute(
            `UPDATE ${Tables.SYNC_INFO} SET sync_status = ?, last_sync_time = ? WHERE module = ?`,
            ['failed', Date.now(), module]
          );
        }
      }
      
      // Process queued modules
      if (this.syncQueue.length > 0) {
        const queuedModules = [...this.syncQueue];
        this.syncQueue = [];
        
        // Sync queued modules
        for (const module of queuedModules) {
          if (!syncOptions.syncModules!.includes(module)) {
            try {
              // Update sync status in database
              await DatabaseService.execute(
                `INSERT OR REPLACE INTO ${Tables.SYNC_INFO} (module, last_sync_time, sync_status, version) 
                 VALUES (?, ?, ?, ?)`,
                [module, Date.now(), 'in-progress', '1.0']
              );
              
              // Sync module data
              const result = await this.syncModule(module, syncOptions);
              results.push({ module, ...result });
              
              // Update sync status in database
              await DatabaseService.execute(
                `UPDATE ${Tables.SYNC_INFO} SET sync_status = ?, last_sync_time = ? WHERE module = ?`,
                [result.success ? 'success' : 'failed', Date.now(), module]
              );
            } catch (error) {
              console.error(`Error syncing queued module ${module}:`, error);
              results.push({ module, success: false, message: `Error: ${error.message}` });
              
              // Update sync status in database
              await DatabaseService.execute(
                `UPDATE ${Tables.SYNC_INFO} SET sync_status = ?, last_sync_time = ? WHERE module = ?`,
                ['failed', Date.now(), module]
              );
            }
          }
        }
      }
      
      // Determine overall success
      const allSuccess = results.every((result) => result.success);
      const someSuccess = results.some((result) => result.success);
      
      // Update overall sync status
      const overallStatus: SyncStatus = allSuccess ? 'success' : someSuccess ? 'partial' : 'failed';
      
      console.log('Sync completed with status:', overallStatus);
      
      return {
        success: allSuccess,
        message: allSuccess
          ? 'All modules synced successfully'
          : someSuccess
          ? 'Some modules synced successfully'
          : 'All modules failed to sync',
      };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, message: `Error: ${error.message}` };
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync a specific module
  private async syncModule(
    module: string,
    options: SyncOptions
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Syncing module: ${module}`);
      
      // Get last sync time for this module
      const syncInfos = await DatabaseService.query<SyncInfo>(
        `SELECT * FROM ${Tables.SYNC_INFO} WHERE module = ?`,
        [module]
      );
      
      const lastSyncTime = syncInfos.length > 0 ? syncInfos[0].lastSyncTime : 0;
      
      // Prepare API request
      const requestOptions: any = {
        params: {
          lastSyncTime,
          compressionEnabled: options.compressionEnabled,
          lowBandwidthMode: options.lowBandwidthMode,
        },
        timeout: options.syncTimeout,
      };
      
      // Make API request
      const response = await api.get(`/sync/${module}`, requestOptions);
      
      // Process response data
      if (response.data && response.data.data) {
        await this.processModuleData(module, response.data.data);
      }
      
      return { success: true, message: 'Module synced successfully' };
    } catch (error) {
      console.error(`Error syncing module ${module}:`, error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  // Process module data
  private async processModuleData(module: string, data: any): Promise<void> {
    // Process data based on module type
    switch (module) {
      case 'encyclopedia':
        await this.processEncyclopediaData(data);
        break;
      case 'weather':
        await this.processWeatherData(data);
        break;
      case 'marketplace':
        await this.processMarketplaceData(data);
        break;
      case 'farm_management':
        await this.processFarmManagementData(data);
        break;
      case 'consultations':
        await this.processConsultationsData(data);
        break;
      case 'financial_services':
        await this.processFinancialServicesData(data);
        break;
      default:
        console.warn(`Unknown module: ${module}`);
    }
  }

  // Process encyclopedia data
  private async processEncyclopediaData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing encyclopedia data');
  }

  // Process weather data
  private async processWeatherData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing weather data');
  }

  // Process marketplace data
  private async processMarketplaceData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing marketplace data');
  }

  // Process farm management data
  private async processFarmManagementData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing farm management data');
  }

  // Process consultations data
  private async processConsultationsData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing consultations data');
  }

  // Process financial services data
  private async processFinancialServicesData(data: any): Promise<void> {
    // Implementation will be added in a separate file
    console.log('Processing financial services data');
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    // Remove network listener
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }

    // Clear sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Unregister background sync task
    if (Platform.OS !== 'web') {
      try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      } catch (error) {
        console.error('Error unregistering background sync task:', error);
      }
    }

    // Close database
    await DatabaseService.close();

    this.isInitialized = false;
  }
}

// Export a singleton instance
export default new SyncManager();
