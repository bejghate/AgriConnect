import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import api from '@/utils/api';

// Types
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationData {
  coords: Coordinates;
  timestamp: number;
}

export interface Region {
  name: string;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface LocationError {
  code: string;
  message: string;
}

class LocationService {
  // Demander les permissions de localisation
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'AgriConnect a besoin d\'accéder à votre position pour vous fournir des informations localisées.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      // Demander les permissions en arrière-plan si nécessaire
      if (useAppStore.getState().settings.locationEnabled) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            'Permission d\'arrière-plan refusée',
            'Les alertes basées sur la localisation ne fonctionneront pas en arrière-plan.',
            [{ text: 'OK' }]
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions de localisation:', error);
      return false;
    }
  }
  
  // Obtenir la position actuelle
  async getCurrentPosition(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermissions();
      
      if (!hasPermission) {
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      return location;
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la position:', error);
      return null;
    }
  }
  
  // Surveiller la position
  watchPosition(
    onSuccess: (location: LocationData) => void,
    onError?: (error: LocationError) => void,
    options?: Location.LocationOptions
  ): Location.LocationSubscription {
    return Location.watchPositionAsync(
      options || { accuracy: Location.Accuracy.Balanced, distanceInterval: 100 },
      onSuccess
    ).then(
      subscription => subscription,
      error => {
        if (onError) {
          onError({
            code: 'WATCH_POSITION_ERROR',
            message: error.message
          });
        }
        throw error;
      }
    );
  }
  
  // Arrêter la surveillance de la position
  stopWatchingPosition(subscription: Location.LocationSubscription): void {
    subscription.remove();
  }
  
  // Obtenir la région à partir des coordonnées
  async getRegionFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await api.get('/location/region', {
        params: { latitude, longitude }
      });
      
      return response.data.data.region;
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la région:', error);
      return null;
    }
  }
  
  // Obtenir l'adresse à partir des coordonnées (géocodage inverse)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<Location.LocationGeocodedAddress[] | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      return addresses;
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      return null;
    }
  }
  
  // Obtenir les coordonnées à partir d'une adresse (géocodage)
  async getCoordinatesFromAddress(address: string): Promise<Location.LocationGeocodedLocation[] | null> {
    try {
      const locations = await Location.geocodeAsync(address);
      
      return locations;
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      return null;
    }
  }
  
  // Calculer la distance entre deux points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit: 'km' | 'mi' = 'km'
  ): number {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0;
    }
    
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
               Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    
    if (dist > 1) {
      dist = 1;
    }
    
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515; // Distance en miles
    
    if (unit === 'km') {
      dist = dist * 1.609344; // Conversion en kilomètres
    }
    
    return parseFloat(dist.toFixed(2));
  }
  
  // Formater la distance pour l'affichage
  formatDistance(distance: number, unit: 'km' | 'mi' = 'km'): string {
    if (distance < 1) {
      // Convertir en mètres ou pieds
      if (unit === 'km') {
        const meters = Math.round(distance * 1000);
        return `${meters} m`;
      } else {
        const feet = Math.round(distance * 5280);
        return `${feet} ft`;
      }
    }
    
    return `${distance.toFixed(1)} ${unit}`;
  }
  
  // Vérifier si un point est dans un rayon donné
  isPointInRadius(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusKm;
  }
}

export default new LocationService();
