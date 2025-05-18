import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { STORAGE_KEYS, getData, storeData } from '@/utils/storage';
import { UserType } from '@/context/UserContext';

// Types for push notifications
export interface PushNotificationSettings {
  enabled: boolean;
  token?: string;
  categories: {
    urgentAlerts: boolean;
    expertMessages: boolean;
    marketUpdates: boolean;
    weatherAlerts: boolean;
    calendarReminders: boolean;
    aiRecommendations: boolean;
  };
  locationBasedAlerts: boolean;
  distanceThreshold: number; // in kilometers
  doNotDisturb: {
    enabled: boolean;
    startTime: string; // Format: "HH:MM" (24-hour)
    endTime: string; // Format: "HH:MM" (24-hour)
    days: number[]; // 0-6, where 0 is Sunday
    exceptHighPriority: boolean; // Allow high priority notifications during DND
  };
}

// Types for push notification data
export interface PushNotificationData {
  type: 'urgent_alert' | 'expert_message' | 'market_update' | 'weather_alert' | 'calendar_reminder';
  title: string;
  body: string;
  data: {
    id: string;
    priority: 'low' | 'medium' | 'high';
    [key: string]: any;
  };
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: PushNotificationSettings = {
  enabled: true,
  categories: {
    urgentAlerts: true,
    expertMessages: true,
    marketUpdates: true,
    weatherAlerts: true,
    calendarReminders: true,
    aiRecommendations: true,
  },
  locationBasedAlerts: true,
  distanceThreshold: 100, // 100km by default
  doNotDisturb: {
    enabled: false,
    startTime: "22:00",
    endTime: "06:00",
    days: [0, 1, 2, 3, 4, 5, 6], // All days
    exceptHighPriority: true,
  },
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private settings: PushNotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private userLocation: { latitude: number; longitude: number } | null = null;
  private userTypes: UserType[] = ['farmer'];
  private primaryUserType: UserType = 'farmer';

  constructor() {
    this.loadSettings();
  }

  // Load notification settings from storage
  private async loadSettings() {
    try {
      const storedSettings = await getData<PushNotificationSettings>(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (storedSettings) {
        this.settings = storedSettings;
      } else {
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  // Save notification settings to storage
  private async saveSettings() {
    try {
      await storeData(STORAGE_KEYS.NOTIFICATION_SETTINGS, this.settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Register for push notifications
  public async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available on emulator/simulator');
      return null;
    }

    // Check if we already have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If we still don't have permission, return null
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save the token
    this.settings.token = token;
    await this.saveSettings();

    // Configure for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0A7EA4',
      });
    }

    return token;
  }

  // Update user location
  public setUserLocation(latitude: number, longitude: number) {
    this.userLocation = { latitude, longitude };
  }

  // Update user types
  public setUserTypes(types: UserType[], primaryType: UserType) {
    this.userTypes = types;
    this.primaryUserType = primaryType;
  }

  // Enable/disable push notifications
  public async togglePushNotifications(enabled: boolean) {
    this.settings.enabled = enabled;
    await this.saveSettings();
    return this.settings.enabled;
  }

  // Update notification category settings
  public async updateCategorySettings(category: keyof PushNotificationSettings['categories'], enabled: boolean) {
    this.settings.categories[category] = enabled;
    await this.saveSettings();
    return this.settings.categories[category];
  }

  // Toggle location-based alerts
  public async toggleLocationBasedAlerts(enabled: boolean) {
    this.settings.locationBasedAlerts = enabled;
    await this.saveSettings();
    return this.settings.locationBasedAlerts;
  }

  // Update distance threshold for location-based alerts
  public async updateDistanceThreshold(distance: number) {
    this.settings.distanceThreshold = distance;
    await this.saveSettings();
    return this.settings.distanceThreshold;
  }

  // Toggle Do Not Disturb mode
  public async toggleDoNotDisturb(enabled: boolean) {
    this.settings.doNotDisturb.enabled = enabled;
    await this.saveSettings();
    return this.settings.doNotDisturb.enabled;
  }

  // Update Do Not Disturb time range
  public async updateDoNotDisturbTimeRange(startTime: string, endTime: string) {
    this.settings.doNotDisturb.startTime = startTime;
    this.settings.doNotDisturb.endTime = endTime;
    await this.saveSettings();
    return {
      startTime: this.settings.doNotDisturb.startTime,
      endTime: this.settings.doNotDisturb.endTime
    };
  }

  // Update Do Not Disturb days
  public async updateDoNotDisturbDays(days: number[]) {
    this.settings.doNotDisturb.days = days;
    await this.saveSettings();
    return this.settings.doNotDisturb.days;
  }

  // Toggle exception for high priority notifications during Do Not Disturb
  public async toggleDoNotDisturbHighPriorityException(enabled: boolean) {
    this.settings.doNotDisturb.exceptHighPriority = enabled;
    await this.saveSettings();
    return this.settings.doNotDisturb.exceptHighPriority;
  }

  // Get current notification settings
  public getSettings(): PushNotificationSettings {
    return this.settings;
  }

  // Schedule a local notification
  public async scheduleLocalNotification(
    title: string,
    body: string,
    data: any,
    trigger: Notifications.NotificationTriggerInput = null
  ) {
    if (!this.settings.enabled) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger,
    });
  }

  // Send an immediate local notification
  public async sendLocalNotification(title: string, body: string, data: any) {
    return this.scheduleLocalNotification(title, body, data);
  }

  // Cancel a scheduled notification
  public async cancelScheduledNotification(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  // Cancel all scheduled notifications
  public async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Check if a notification should be shown based on user preferences
  public shouldShowNotification(notification: PushNotificationData): boolean {
    if (!this.settings.enabled) return false;

    // Check if notification is allowed by category settings
    let isCategoryAllowed = false;
    switch (notification.type) {
      case 'urgent_alert':
        isCategoryAllowed = this.settings.categories.urgentAlerts;
        break;
      case 'expert_message':
        isCategoryAllowed = this.settings.categories.expertMessages;
        break;
      case 'market_update':
        isCategoryAllowed = this.settings.categories.marketUpdates;
        break;
      case 'weather_alert':
        isCategoryAllowed = this.settings.categories.weatherAlerts;
        break;
      case 'calendar_reminder':
        isCategoryAllowed = this.settings.categories.calendarReminders;
        break;
      case 'ai_recommendation':
        isCategoryAllowed = this.settings.categories.aiRecommendations;
        break;
      default:
        isCategoryAllowed = true;
    }

    if (!isCategoryAllowed) return false;

    // Check Do Not Disturb settings
    if (this.settings.doNotDisturb.enabled) {
      // Check if current time is within DND hours
      const now = new Date();
      const currentDay = now.getDay(); // 0-6, where 0 is Sunday
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Check if today is a DND day
      if (this.settings.doNotDisturb.days.includes(currentDay)) {
        const startTime = this.settings.doNotDisturb.startTime;
        const endTime = this.settings.doNotDisturb.endTime;

        // Handle time comparison
        const isInDndTimeRange = this.isTimeInRange(currentTime, startTime, endTime);

        if (isInDndTimeRange) {
          // During DND time, only allow high priority if exception is enabled
          return this.settings.doNotDisturb.exceptHighPriority && notification.data.priority === 'high';
        }
      }
    }

    return true;
  }

  // Helper method to check if a time is within a range
  private isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    // Handle cases where end time is earlier than start time (overnight)
    if (startTime > endTime) {
      return time >= startTime || time < endTime;
    }
    // Normal case (start time is earlier than end time)
    return time >= startTime && time < endTime;
  }

  // Calculate distance between two coordinates in kilometers
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Check if a location-based notification is within the user's threshold
  public isWithinDistanceThreshold(
    notificationLocation: { latitude: number; longitude: number }
  ): boolean {
    if (!this.settings.locationBasedAlerts || !this.userLocation || !notificationLocation) {
      return false;
    }

    const distance = this.calculateDistance(
      this.userLocation.latitude,
      this.userLocation.longitude,
      notificationLocation.latitude,
      notificationLocation.longitude
    );

    return distance <= this.settings.distanceThreshold;
  }
}

// Create a singleton instance
export const pushNotificationService = new PushNotificationService();
