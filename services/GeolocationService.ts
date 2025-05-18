import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import DatabaseService, { Tables } from './DatabaseService';

// Location storage key
const LAST_LOCATION_STORAGE_KEY = 'agriconnect_last_location';

// Location accuracy options
export enum LocationAccuracy {
  LOW = Location.Accuracy.Lowest,
  MEDIUM = Location.Accuracy.Balanced,
  HIGH = Location.Accuracy.High,
  HIGHEST = Location.Accuracy.Highest,
}

// Location interface
export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

// Geolocation service class
class GeolocationService {
  private isInitialized: boolean = false;
  private hasPermission: boolean = false;
  private watchId: Location.LocationSubscription | null = null;
  private lastLocation: LocationData | null = null;

  // Initialize the geolocation service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';

      if (this.hasPermission) {
        // Get last stored location
        const storedLocation = await this.getStoredLocation();
        if (storedLocation) {
          this.lastLocation = storedLocation;
          
          // Update app store
          useAppStore.getState().setLocation(storedLocation);
        }
      }

      this.isInitialized = true;
      console.log('Geolocation service initialized successfully');
    } catch (error) {
      console.error('Error initializing geolocation service:', error);
      throw error;
    }
  }

  // Get stored location
  private async getStoredLocation(): Promise<LocationData | null> {
    try {
      const locationJson = await AsyncStorage.getItem(LAST_LOCATION_STORAGE_KEY);
      if (locationJson) {
        return JSON.parse(locationJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored location:', error);
      return null;
    }
  }

  // Store location
  private async storeLocation(location: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(location));
      
      // Also store in database for offline access
      if (DatabaseService.getDatabase()) {
        await DatabaseService.execute(
          `INSERT OR REPLACE INTO ${Tables.USER_PREFERENCES} (key, value) VALUES (?, ?)`,
          [LAST_LOCATION_STORAGE_KEY, JSON.stringify(location)]
        );
      }
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  // Get current location
  async getCurrentLocation(
    accuracy: LocationAccuracy = LocationAccuracy.HIGH,
    maxAge: number = 60000, // 1 minute
    timeout: number = 15000 // 15 seconds
  ): Promise<LocationData> {
    try {
      // Check if we have permission
      if (!this.hasPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        this.hasPermission = status === 'granted';
        
        if (!this.hasPermission) {
          throw new Error('Location permission not granted');
        }
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: accuracy,
        maxAge: maxAge,
        timeout: timeout,
      });
      
      // Convert to our format
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
      
      // Store location
      this.lastLocation = locationData;
      await this.storeLocation(locationData);
      
      // Update app store
      useAppStore.getState().setLocation(locationData);
      
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // If we have a last location, return it
      if (this.lastLocation) {
        return this.lastLocation;
      }
      
      throw error;
    }
  }

  // Start watching location
  async startWatchingLocation(
    accuracy: LocationAccuracy = LocationAccuracy.MEDIUM,
    distanceInterval: number = 100, // 100 meters
    timeInterval: number = 60000, // 1 minute
    callback?: (location: LocationData) => void
  ): Promise<void> {
    try {
      // Check if we have permission
      if (!this.hasPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        this.hasPermission = status === 'granted';
        
        if (!this.hasPermission) {
          throw new Error('Location permission not granted');
        }
      }
      
      // Stop existing watch if any
      if (this.watchId) {
        await this.stopWatchingLocation();
      }
      
      // Start watching location
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: accuracy,
          distanceInterval: distanceInterval,
          timeInterval: timeInterval,
        },
        (location) => {
          // Convert to our format
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            altitudeAccuracy: location.coords.altitudeAccuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };
          
          // Store location
          this.lastLocation = locationData;
          this.storeLocation(locationData).catch(console.error);
          
          // Update app store
          useAppStore.getState().setLocation(locationData);
          
          // Call callback if provided
          if (callback) {
            callback(locationData);
          }
        }
      );
      
      console.log('Started watching location');
    } catch (error) {
      console.error('Error starting location watch:', error);
      throw error;
    }
  }

  // Stop watching location
  async stopWatchingLocation(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
        console.log('Stopped watching location');
      }
    } catch (error) {
      console.error('Error stopping location watch:', error);
      throw error;
    }
  }

  // Get last known location
  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  // Calculate distance between two points in meters
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  // Calculate distance between two locations in meters
  calculateLocationDistance(
    location1: LocationData,
    location2: LocationData
  ): number {
    return this.calculateDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude
    );
  }

  // Check if a location is within a certain distance of another location
  isLocationWithinDistance(
    location1: LocationData,
    location2: LocationData,
    distance: number
  ): boolean {
    const calculatedDistance = this.calculateLocationDistance(location1, location2);
    return calculatedDistance <= distance;
  }

  // Get nearby locations from a list of locations
  getNearbyLocations(
    currentLocation: LocationData,
    locations: { location: LocationData; data: any }[],
    maxDistance: number
  ): { location: LocationData; data: any; distance: number }[] {
    return locations
      .map((item) => ({
        location: item.location,
        data: item.data,
        distance: this.calculateLocationDistance(currentLocation, item.location),
      }))
      .filter((item) => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location.LocationGeocodedAddress[]> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return addresses;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      throw error;
    }
  }

  // Get coordinates from address (forward geocoding)
  async getCoordinatesFromAddress(
    address: string
  ): Promise<Location.LocationGeocodedLocation[]> {
    try {
      const locations = await Location.geocodeAsync(address);
      return locations;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      throw error;
    }
  }

  // Request background location permissions
  async requestBackgroundLocationPermissions(): Promise<boolean> {
    try {
      // First, request foreground permissions if we don't have them
      if (!this.hasPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        this.hasPermission = status === 'granted';
        
        if (!this.hasPermission) {
          return false;
        }
      }
      
      // Then request background permissions
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting background location permissions:', error);
      return false;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      // Stop watching location
      if (this.watchId) {
        await this.stopWatchingLocation();
      }
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error cleaning up geolocation service:', error);
    }
  }
}

// Export a singleton instance
export default new GeolocationService();
