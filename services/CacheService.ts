import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// Cache configuration
const DEFAULT_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DEFAULT_IMAGE_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const DEFAULT_CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB in bytes

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  size: number;
}

// Cache metadata interface
interface CacheMetadata {
  totalSize: number;
  entries: {
    [key: string]: {
      key: string;
      timestamp: number;
      expiry: number;
      size: number;
    };
  };
}

// Cache options interface
interface CacheOptions {
  expiry?: number;
  priority?: 'low' | 'medium' | 'high';
  forceRefresh?: boolean;
}

// Cache service class
class CacheService {
  private readonly CACHE_PREFIX = 'agriconnect_cache_';
  private readonly METADATA_KEY = 'agriconnect_cache_metadata';
  private readonly IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
  private metadata: CacheMetadata = { totalSize: 0, entries: {} };
  private isMetadataLoaded = false;

  constructor() {
    this.initializeCache();
  }

  // Initialize cache
  private async initializeCache(): Promise<void> {
    try {
      // Create image cache directory if it doesn't exist
      if (Platform.OS !== 'web') {
        const dirInfo = await FileSystem.getInfoAsync(this.IMAGE_CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(this.IMAGE_CACHE_DIR, { intermediates: true });
        }
      }

      // Load cache metadata
      await this.loadMetadata();
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  // Load cache metadata
  private async loadMetadata(): Promise<void> {
    try {
      const metadataJson = await AsyncStorage.getItem(this.METADATA_KEY);
      if (metadataJson) {
        this.metadata = JSON.parse(metadataJson);
      } else {
        this.metadata = { totalSize: 0, entries: {} };
      }
      this.isMetadataLoaded = true;
    } catch (error) {
      console.error('Error loading cache metadata:', error);
      this.metadata = { totalSize: 0, entries: {} };
      this.isMetadataLoaded = true;
    }
  }

  // Save cache metadata
  private async saveMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }

  // Generate cache key
  private async generateCacheKey(key: string): Promise<string> {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        key
      );
      return `${this.CACHE_PREFIX}${hash.substring(0, 16)}`;
    } catch (error) {
      console.error('Error generating cache key:', error);
      // Fallback to a simple key if crypto fails
      return `${this.CACHE_PREFIX}${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
  }

  // Calculate data size in bytes
  private calculateDataSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new TextEncoder().encode(jsonString).length;
    } catch (error) {
      console.error('Error calculating data size:', error);
      return 0;
    }
  }

  // Check if cache entry is expired
  private isCacheExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return now > entry.timestamp + entry.expiry;
  }

  // Clean up cache if it exceeds size limit
  private async cleanupCache(): Promise<void> {
    if (this.metadata.totalSize <= DEFAULT_CACHE_SIZE_LIMIT) {
      return;
    }

    try {
      // Sort entries by timestamp (oldest first)
      const entries = Object.values(this.metadata.entries).sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Remove entries until we're under the limit
      for (const entry of entries) {
        if (this.metadata.totalSize <= DEFAULT_CACHE_SIZE_LIMIT * 0.8) {
          break;
        }

        await this.removeFromCache(entry.key);
      }

      await this.saveMetadata();
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  // Remove an entry from cache
  private async removeFromCache(key: string): Promise<void> {
    try {
      const cacheKey = await this.generateCacheKey(key);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(cacheKey);
      
      // Update metadata
      if (this.metadata.entries[key]) {
        this.metadata.totalSize -= this.metadata.entries[key].size;
        delete this.metadata.entries[key];
      }
    } catch (error) {
      console.error(`Error removing ${key} from cache:`, error);
    }
  }

  // Cache data
  async cacheData<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.isMetadataLoaded) {
      await this.loadMetadata();
    }

    try {
      const cacheKey = await this.generateCacheKey(key);
      const dataSize = this.calculateDataSize(data);
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: options.expiry || DEFAULT_CACHE_EXPIRY,
        size: dataSize,
      };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Update metadata
      this.metadata.entries[key] = {
        key,
        timestamp: entry.timestamp,
        expiry: entry.expiry,
        size: entry.size,
      };
      
      // Update total size
      if (this.metadata.entries[key]) {
        this.metadata.totalSize -= this.metadata.entries[key].size;
      }
      this.metadata.totalSize += dataSize;
      
      await this.saveMetadata();
      
      // Clean up if necessary
      if (this.metadata.totalSize > DEFAULT_CACHE_SIZE_LIMIT) {
        await this.cleanupCache();
      }
    } catch (error) {
      console.error(`Error caching data for ${key}:`, error);
    }
  }

  // Get cached data
  async getCachedData<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isMetadataLoaded) {
      await this.loadMetadata();
    }

    try {
      // If force refresh is requested, return null
      if (options.forceRefresh) {
        return null;
      }
      
      const cacheKey = await this.generateCacheKey(key);
      const entryJson = await AsyncStorage.getItem(cacheKey);
      
      if (!entryJson) {
        return null;
      }
      
      const entry: CacheEntry<T> = JSON.parse(entryJson);
      
      // Check if cache is expired
      if (this.isCacheExpired(entry)) {
        await this.removeFromCache(key);
        return null;
      }
      
      // Update timestamp to indicate recent use
      entry.timestamp = Date.now();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Update metadata
      if (this.metadata.entries[key]) {
        this.metadata.entries[key].timestamp = entry.timestamp;
        await this.saveMetadata();
      }
      
      return entry.data;
    } catch (error) {
      console.error(`Error getting cached data for ${key}:`, error);
      return null;
    }
  }

  // Cache an image
  async cacheImage(url: string, options: CacheOptions = {}): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web doesn't support FileSystem, so we just return the original URL
      return url;
    }

    if (!this.isMetadataLoaded) {
      await this.loadMetadata();
    }

    try {
      const cacheKey = await this.generateCacheKey(url);
      const imagePath = `${this.IMAGE_CACHE_DIR}${cacheKey}`;
      
      // Check if image already exists in cache
      const imageInfo = await FileSystem.getInfoAsync(imagePath);
      
      if (imageInfo.exists && !options.forceRefresh) {
        // Check if cache is expired
        const metadataEntry = this.metadata.entries[url];
        if (metadataEntry && Date.now() > metadataEntry.timestamp + metadataEntry.expiry) {
          // Expired, download again
          await FileSystem.deleteAsync(imagePath);
        } else {
          // Update timestamp to indicate recent use
          if (metadataEntry) {
            this.metadata.entries[url].timestamp = Date.now();
            await this.saveMetadata();
          }
          return imagePath;
        }
      }
      
      // Download the image
      const downloadResult = await FileSystem.downloadAsync(url, imagePath);
      
      if (downloadResult.status !== 200) {
        console.error(`Failed to download image from ${url}: ${downloadResult.status}`);
        return null;
      }
      
      // Get file size
      const newImageInfo = await FileSystem.getInfoAsync(imagePath);
      const fileSize = newImageInfo.size || 0;
      
      // Update metadata
      this.metadata.entries[url] = {
        key: url,
        timestamp: Date.now(),
        expiry: options.expiry || DEFAULT_IMAGE_CACHE_EXPIRY,
        size: fileSize,
      };
      
      // Update total size
      if (this.metadata.entries[url]) {
        this.metadata.totalSize -= this.metadata.entries[url].size;
      }
      this.metadata.totalSize += fileSize;
      
      await this.saveMetadata();
      
      // Clean up if necessary
      if (this.metadata.totalSize > DEFAULT_CACHE_SIZE_LIMIT) {
        await this.cleanupCache();
      }
      
      return imagePath;
    } catch (error) {
      console.error(`Error caching image from ${url}:`, error);
      return null;
    }
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    try {
      // Clear AsyncStorage cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      
      // Clear image cache
      if (Platform.OS !== 'web') {
        await FileSystem.deleteAsync(this.IMAGE_CACHE_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(this.IMAGE_CACHE_DIR, { intermediates: true });
      }
      
      // Reset metadata
      this.metadata = { totalSize: 0, entries: {} };
      await this.saveMetadata();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    if (!this.isMetadataLoaded) {
      await this.loadMetadata();
    }

    try {
      const now = Date.now();
      const expiredKeys = Object.values(this.metadata.entries)
        .filter(entry => now > entry.timestamp + entry.expiry)
        .map(entry => entry.key);
      
      for (const key of expiredKeys) {
        await this.removeFromCache(key);
      }
      
      await this.saveMetadata();
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    totalSize: number;
    entryCount: number;
    oldestEntry: number;
    newestEntry: number;
  }> {
    if (!this.isMetadataLoaded) {
      await this.loadMetadata();
    }

    try {
      const entries = Object.values(this.metadata.entries);
      const timestamps = entries.map(entry => entry.timestamp);
      
      return {
        totalSize: this.metadata.totalSize,
        entryCount: entries.length,
        oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
        newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalSize: 0,
        entryCount: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }
  }
}

// Export a singleton instance
export default new CacheService();
