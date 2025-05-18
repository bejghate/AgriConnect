import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Storage keys
export const STORAGE_KEYS = {
  ENCYCLOPEDIA_DATA: 'agriconnect_encyclopedia_data',
  WEATHER_DATA: 'agriconnect_weather_data',
  USER_PREFERENCES: 'agriconnect_user_preferences',
  OFFLINE_ARTICLES: 'agriconnect_offline_articles',
  LAST_SYNC: 'agriconnect_last_sync',
  CACHED_IMAGES: 'agriconnect_cached_images',
  SYNC_INFO: 'agriconnect_sync_info',
  UPDATE_HISTORY: 'agriconnect_update_history',
  FAVORITES: 'agriconnect_favorites',
  RECENT_SEARCHES: 'agriconnect_recent_searches',
  SYMPTOM_HISTORY: 'agriconnect_symptom_history',
  NOTIFICATIONS: 'agriconnect_notifications',
  HEALTH_ALERTS: 'agriconnect_health_alerts',
  CALENDAR_REMINDERS: 'agriconnect_calendar_reminders',
  SEASONAL_ADVICE: 'agriconnect_seasonal_advice',
  URGENT_ALERTS: 'agriconnect_urgent_alerts',
  EXPERT_MESSAGES: 'agriconnect_expert_messages',
  MARKET_UPDATES: 'agriconnect_market_updates',
  NOTIFICATION_SETTINGS: 'agriconnect_notification_settings',
  USER_LOCATION: 'agriconnect_user_location',
  // Clés pour le module de gestion d'exploitation
  FARM_LOG_ENTRIES: 'agriconnect_farm_log_entries',
  FARM_STATISTICS: 'agriconnect_farm_statistics',
  FARM_FIELDS: 'agriconnect_farm_fields',
  FARM_ANIMALS: 'agriconnect_farm_animals',
  FARM_EQUIPMENT: 'agriconnect_farm_equipment',
  FARM_INVENTORY: 'agriconnect_farm_inventory',
};

// Interface for sync status
export interface SyncStatus {
  lastSyncTime: number;
  syncStatus: 'success' | 'failed' | 'in-progress' | 'not-synced';
  syncedModules: {
    encyclopedia: boolean;
    weather: boolean;
    marketplace: boolean;
    consultations: boolean;
    notifications: boolean;
    healthAlerts: boolean;
    calendarReminders: boolean;
    seasonalAdvice: boolean;
  };
}

// Default sync status
const DEFAULT_SYNC_STATUS: SyncStatus = {
  lastSyncTime: 0,
  syncStatus: 'not-synced',
  syncedModules: {
    encyclopedia: false,
    weather: false,
    marketplace: false,
    consultations: false,
    notifications: false,
    healthAlerts: false,
    calendarReminders: false,
    seasonalAdvice: false,
  },
};

/**
 * Check if the device is connected to the internet
 * @returns Promise<boolean> - True if connected, false otherwise
 */
export const isConnected = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

/**
 * Save data to AsyncStorage
 * @param key - Storage key
 * @param data - Data to store
 * @returns Promise<void>
 */
export const storeData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`Data stored successfully for key: ${key}`);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param key - Storage key
 * @returns Promise<T | null> - Retrieved data or null if not found
 */
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param key - Storage key
 * @returns Promise<void>
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data removed successfully for key: ${key}`);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all app data from AsyncStorage
 * @returns Promise<void>
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('All app data cleared successfully');
  } catch (error) {
    console.error('Error clearing all app data:', error);
    throw error;
  }
};

/**
 * Get the current sync status
 * @returns Promise<SyncStatus> - Current sync status
 */
export const getSyncStatus = async (): Promise<SyncStatus> => {
  try {
    const status = await getData<SyncStatus>(STORAGE_KEYS.LAST_SYNC);
    return status ?? DEFAULT_SYNC_STATUS;
  } catch (error) {
    console.error('Error getting sync status:', error);
    return DEFAULT_SYNC_STATUS;
  }
};

/**
 * Update the sync status
 * @param status - New sync status
 * @returns Promise<void>
 */
export const updateSyncStatus = async (status: Partial<SyncStatus>): Promise<void> => {
  try {
    const currentStatus = await getSyncStatus();
    const newStatus = { ...currentStatus, ...status };
    await storeData(STORAGE_KEYS.LAST_SYNC, newStatus);
    console.log('Sync status updated successfully');
  } catch (error) {
    console.error('Error updating sync status:', error);
    throw error;
  }
};

/**
 * Calculate the storage size used by the app
 * @returns Promise<number> - Size in bytes
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    let totalSize = 0;
    const keys = Object.values(STORAGE_KEYS);

    for (const key of keys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

/**
 * Format bytes to a human-readable format
 * @param bytes - Size in bytes
 * @returns string - Formatted size (e.g., "1.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if data is stale (older than the specified time)
 * @param timestamp - Timestamp to check
 * @param maxAge - Maximum age in milliseconds
 * @returns boolean - True if data is stale, false otherwise
 */
export const isDataStale = (timestamp: number, maxAge: number): boolean => {
  const now = Date.now();
  return now - timestamp > maxAge;
};
