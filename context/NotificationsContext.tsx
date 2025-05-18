import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUser } from './UserContext';
import { useOffline } from './OfflineContext';
import { STORAGE_KEYS, getData, storeData } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';
import {
  Notification,
  HealthAlert,
  CalendarReminder,
  SeasonalAdvice,
  UrgentAlert,
  ExpertMessage,
  MarketUpdate,
  sampleNotifications
} from '@/data/notifications';
import NotificationService, { NotificationType } from '@/services/NotificationService';

// Define notifications context type
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  healthAlerts: HealthAlert[];
  calendarReminders: CalendarReminder[];
  seasonalAdvice: SeasonalAdvice[];
  urgentAlerts: UrgentAlert[];
  expertMessages: ExpertMessage[];
  marketUpdates: MarketUpdate[];

  // Methods for managing notifications
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Methods for calendar reminders
  addCalendarReminder: (reminder: Omit<CalendarReminder, 'id' | 'timestamp' | 'isRead'>) => void;
  updateCalendarReminder: (reminder: CalendarReminder) => void;

  // Methods for filtering notifications
  getNotificationsByType: (type: 'health_alert' | 'calendar_reminder' | 'seasonal_advice' | 'urgent_alert' | 'expert_message' | 'market_update') => Notification[];
  getNotificationsByPriority: (priority: 'low' | 'medium' | 'high') => Notification[];
  getUpcomingReminders: (days: number) => CalendarReminder[];
  getNotificationsForUserType: (userType: string) => Notification[];
  getLocationBasedNotifications: (latitude: number, longitude: number, radius: number) => Notification[];

  // Methods for checking notification status
  hasUnreadNotifications: () => boolean;
  hasHighPriorityNotifications: () => boolean;

  // Push notification methods
  registerForPushNotifications: () => Promise<void>;
  isPushNotificationsEnabled: () => boolean;
  togglePushNotifications: (enabled: boolean) => Promise<boolean>;

  // Refresh notifications from server (mock)
  refreshNotifications: () => Promise<void>;
  isRefreshing: boolean;
}

// Create context with default values
const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  healthAlerts: [],
  calendarReminders: [],
  seasonalAdvice: [],
  urgentAlerts: [],
  expertMessages: [],
  marketUpdates: [],

  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},

  addCalendarReminder: () => {},
  updateCalendarReminder: () => {},

  getNotificationsByType: () => [],
  getNotificationsByPriority: () => [],
  getUpcomingReminders: () => [],
  getNotificationsForUserType: () => [],
  getLocationBasedNotifications: () => [],

  hasUnreadNotifications: () => false,
  hasHighPriorityNotifications: () => false,

  registerForPushNotifications: async () => {},
  isPushNotificationsEnabled: () => false,
  togglePushNotifications: async () => false,

  refreshNotifications: async () => {},
  isRefreshing: false,
});

// Provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userTypes, primaryUserType } = useUser();
  const { isOnline } = useOffline();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Derived state
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const healthAlerts = notifications.filter(n => n.type === 'health_alert') as HealthAlert[];
  const calendarReminders = notifications.filter(n => n.type === 'calendar_reminder') as CalendarReminder[];
  const seasonalAdvice = notifications.filter(n => n.type === 'seasonal_advice') as SeasonalAdvice[];
  const urgentAlerts = notifications.filter(n => n.type === 'urgent_alert') as UrgentAlert[];
  const expertMessages = notifications.filter(n => n.type === 'expert_message') as ExpertMessage[];
  const marketUpdates = notifications.filter(n => n.type === 'market_update') as MarketUpdate[];

  // Load notifications from storage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await getData(STORAGE_KEYS.NOTIFICATIONS);
        if (storedNotifications) {
          setNotifications(storedNotifications);
        } else {
          // Use sample data for first run
          setNotifications(sampleNotifications);
          await storeData(STORAGE_KEYS.NOTIFICATIONS, sampleNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to sample data
        setNotifications(sampleNotifications);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to storage when they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await storeData(STORAGE_KEYS.NOTIFICATIONS, notifications);
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    };

    if (notifications.length > 0) {
      saveNotifications();
    }
  }, [notifications]);

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Add a new calendar reminder
  const addCalendarReminder = (reminder: Omit<CalendarReminder, 'id' | 'timestamp' | 'isRead'>) => {
    const newReminder: CalendarReminder = {
      ...reminder,
      id: `calendar-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newReminder, ...prev]);
  };

  // Update an existing calendar reminder
  const updateCalendarReminder = (reminder: CalendarReminder) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === reminder.id
          ? reminder
          : notification
      )
    );
  };

  // Get notifications by type
  const getNotificationsByType = (type: 'health_alert' | 'calendar_reminder' | 'seasonal_advice' | 'urgent_alert' | 'expert_message' | 'market_update') => {
    return notifications.filter(notification => notification.type === type);
  };

  // Get notifications by priority
  const getNotificationsByPriority = (priority: 'low' | 'medium' | 'high') => {
    return notifications.filter(notification => notification.priority === priority);
  };

  // Get upcoming reminders for the next X days
  const getUpcomingReminders = (days: number) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return calendarReminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  };

  // Get notifications for a specific user type
  const getNotificationsForUserType = (userType: string) => {
    return notifications.filter(notification => {
      if (notification.type === 'seasonal_advice') {
        return (notification as SeasonalAdvice).applicableUserTypes.includes(userType);
      } else if (notification.type === 'expert_message') {
        return (notification as ExpertMessage).applicableUserTypes.includes(userType);
      }
      return true; // Other notification types are not filtered by user type
    });
  };

  // Get location-based notifications within a certain radius
  const getLocationBasedNotifications = (latitude: number, longitude: number, radius: number) => {
    // Update user location for future notifications
    setUserLocation({ latitude, longitude });

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      return d;
    };

    const deg2rad = (deg: number): number => {
      return deg * (Math.PI / 180);
    };

    return notifications.filter(notification => {
      // Filter health alerts by location
      if (notification.type === 'health_alert' && (notification as HealthAlert).location.coordinates) {
        const alertLocation = (notification as HealthAlert).location.coordinates!;
        const distance = calculateDistance(
          latitude,
          longitude,
          alertLocation.latitude,
          alertLocation.longitude
        );
        return distance <= radius;
      }

      // Filter urgent alerts by location
      if (notification.type === 'urgent_alert' && (notification as UrgentAlert).location.coordinates) {
        const alertLocation = (notification as UrgentAlert).location.coordinates!;
        const distance = calculateDistance(
          latitude,
          longitude,
          alertLocation.latitude,
          alertLocation.longitude
        );
        return distance <= radius;
      }

      // Filter market updates by location if they have location info
      if (notification.type === 'market_update' && (notification as MarketUpdate).location) {
        // For market updates, we don't have exact coordinates, so we just check if the region matches
        // In a real app, we would have coordinates for regions and cities
        return true;
      }

      return false; // Other notification types are not location-based
    });
  };

  // Check if there are any unread notifications
  const hasUnreadNotifications = () => {
    return notifications.some(notification => !notification.isRead);
  };

  // Check if there are any high priority notifications
  const hasHighPriorityNotifications = () => {
    return notifications.some(notification => notification.priority === 'high' && !notification.isRead);
  };

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        console.log('Push notification token:', token);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      Alert.alert('Error', 'Failed to register for push notifications. Please try again later.');
    }
  };

  // Check if push notifications are enabled
  const isPushNotificationsEnabled = () => {
    return useAppStore.getState().settings.notificationsEnabled;
  };

  // Toggle push notifications
  const togglePushNotifications = async (enabled: boolean) => {
    useAppStore.getState().updateSettings({ notificationsEnabled: enabled });
    return enabled;
  };

  // Refresh notifications from server (mock implementation)
  const refreshNotifications = async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'Cannot refresh notifications while offline.');
      return;
    }

    setIsRefreshing(true);

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would fetch from an API
      // For now, we'll just add a new notification occasionally
      const randomValue = Math.random();
      let newNotification: Notification | null = null;

      // Update user types in the push notification service
      pushNotificationService.setUserTypes(userTypes as any[], primaryUserType);

      // Randomly select which type of notification to add
      if (randomValue < 0.2) {
        // Add a health alert
        newNotification = {
          id: `health-alert-${Date.now()}`,
          type: 'health_alert',
          title: 'New Disease Alert',
          description: 'A new crop disease has been reported in neighboring regions.',
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'high',
          icon: 'exclamationmark.triangle.fill',
          color: '#F44336',
          diseaseType: 'plant',
          diseaseName: 'Fusarium Wilt',
          affectedSpecies: ['Tomatoes', 'Bananas'],
          location: {
            region: 'Eastern',
            coordinates: {
              latitude: 12.2383,
              longitude: 1.5616,
            },
            radius: 75,
          },
          source: 'Agricultural Research Institute',
          reportedDate: new Date().toISOString(),
          recommendedActions: [
            'Monitor crops for wilting symptoms',
            'Implement crop rotation',
            'Use resistant varieties if available',
            'Apply appropriate fungicides if necessary'
          ],
        };
      } else if (randomValue < 0.4) {
        // Add an urgent alert (locust swarm example)
        newNotification = {
          id: `urgent-alert-${Date.now()}`,
          type: 'urgent_alert',
          title: 'Locust Swarm Approaching',
          description: 'A large swarm of desert locusts has been spotted 100km from your location, moving in your direction.',
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'high',
          icon: 'exclamationmark.triangle.fill',
          color: '#F44336',
          alertType: 'pest',
          alertTitle: 'Desert Locust Swarm',
          location: {
            region: 'Eastern',
            coordinates: {
              latitude: 12.5383,
              longitude: 1.8616,
            },
            radius: 100,
          },
          source: 'National Pest Monitoring Service',
          reportedDate: new Date().toISOString(),
          recommendedActions: [
            'Harvest mature crops immediately if possible',
            'Apply recommended pesticides to protect remaining crops',
            'Cover young plants with netting if available',
            'Coordinate with neighboring farmers for collective action',
            'Report sightings to agricultural authorities'
          ],
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          imageUrl: 'https://example.com/images/locust-swarm.jpg',
        };

        // Schedule a local push notification for this urgent alert
        if (isPushNotificationsEnabled() && userLocation) {
          // Check if the alert is within the user's distance threshold
          // In a real app, we would calculate the distance between the user's location and the alert location
          const isWithinThreshold = true; // Simplified for demo

          if (isWithinThreshold) {
            await NotificationService.sendImmediateNotification({
              type: NotificationType.WEATHER_ALERT,
              title: 'URGENT: Locust Swarm Alert',
              body: 'A locust swarm has been detected 100km from your location. Take action now to protect your crops.',
              data: { id: newNotification.id, type: 'urgent_alert' }
            });
          }
        }
      } else if (randomValue < 0.6) {
        // Add an expert message based on user type
        if (primaryUserType === 'livestock') {
          newNotification = {
            id: `expert-message-${Date.now()}`,
            type: 'expert_message',
            title: 'Livestock Vaccination Reminder',
            description: 'It\'s time to vaccinate your livestock against common seasonal diseases.',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'medium',
            icon: 'person.fill.badge.plus',
            color: '#2196F3',
            expertName: 'Dr. Aminata Diallo',
            expertRole: 'Veterinary Specialist',
            expertProfileImage: 'https://example.com/images/experts/aminata-diallo.jpg',
            messageType: 'advice',
            applicableUserTypes: ['livestock'],
            applicableLivestock: ['Cattle', 'Sheep', 'Goats'],
            contactInfo: 'Phone: +226 70 12 34 56, Email: a.diallo@agrivet.com',
          };
        } else {
          newNotification = {
            id: `expert-message-${Date.now()}`,
            type: 'expert_message',
            title: 'Crop Protection Advice',
            description: 'Here are some tips to protect your crops during the upcoming rainy season.',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'medium',
            icon: 'person.fill.badge.plus',
            color: '#2196F3',
            expertName: 'Prof. Ibrahim Ouédraogo',
            expertRole: 'Agronomist',
            expertProfileImage: 'https://example.com/images/experts/ibrahim-ouedraogo.jpg',
            messageType: 'advice',
            applicableUserTypes: ['farmer'],
            applicableCrops: ['Maize', 'Rice', 'Millet'],
            contactInfo: 'Phone: +226 76 98 76 54, Email: i.ouedraogo@agriuniv.edu',
          };
        }
      } else if (randomValue < 0.8) {
        // Add a market update
        newNotification = {
          id: `market-update-${Date.now()}`,
          type: 'market_update',
          title: 'Market Price Update',
          description: 'Prices for agricultural products have changed in your region.',
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'medium',
          icon: 'chart.line.uptrend.xyaxis.fill',
          color: '#4CAF50',
          updateType: 'price_change',
          products: primaryUserType === 'livestock' ? ['Cattle', 'Sheep', 'Goats'] : ['Maize', 'Rice', 'Millet'],
          priceChange: {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            percentage: Math.floor(Math.random() * 20) + 5, // 5-25%
          },
          source: 'Agricultural Market Information Service',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          linkToMarketplace: '/marketplace',
        };
      } else {
        // Add a seasonal advice
        const seasons = ['rainy', 'dry', 'summer', 'winter'];
        const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];

        newNotification = {
          id: `seasonal-advice-${Date.now()}`,
          type: 'seasonal_advice',
          title: `${randomSeason.charAt(0).toUpperCase() + randomSeason.slice(1)} Season Preparation`,
          description: `Get your farm ready for the upcoming ${randomSeason} season with these tips.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'low',
          icon: randomSeason === 'rainy' ? 'cloud.rain.fill' :
                randomSeason === 'dry' ? 'sun.max.fill' :
                randomSeason === 'summer' ? 'thermometer.sun.fill' : 'snowflake',
          color: '#9C27B0',
          season: randomSeason as any,
          applicableUserTypes: [primaryUserType],
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          tips: [
            'Prepare your equipment and tools',
            'Check your irrigation systems',
            'Plan your planting or harvesting schedule',
            'Stock up on necessary supplies',
            'Monitor weather forecasts regularly'
          ],
        };
      }

      if (newNotification) {
        setNotifications(prev => [newNotification!, ...prev]);

        // If push notifications are enabled and it's a high priority notification, send a local notification
        if (isPushNotificationsEnabled() && newNotification.priority === 'high') {
          await NotificationService.sendImmediateNotification({
            type: newNotification.type === 'health_alert' ? NotificationType.HEALTH_ALERT :
                  newNotification.type === 'urgent_alert' ? NotificationType.WEATHER_ALERT :
                  newNotification.type === 'market_update' ? NotificationType.MARKET_PRICE :
                  newNotification.type === 'seasonal_advice' ? NotificationType.SEASONAL_ADVICE :
                  NotificationType.SYSTEM,
            title: newNotification.title,
            body: newNotification.description,
            data: { id: newNotification.id, type: newNotification.type }
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      Alert.alert('Error', 'Failed to refresh notifications. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        healthAlerts,
        calendarReminders,
        seasonalAdvice,
        urgentAlerts,
        expertMessages,
        marketUpdates,

        markAsRead,
        markAllAsRead,
        deleteNotification,

        addCalendarReminder,
        updateCalendarReminder,

        getNotificationsByType,
        getNotificationsByPriority,
        getUpcomingReminders,
        getNotificationsForUserType,
        getLocationBasedNotifications,

        hasUnreadNotifications,
        hasHighPriorityNotifications,

        registerForPushNotifications,
        isPushNotificationsEnabled,
        togglePushNotifications,

        refreshNotifications,
        isRefreshing,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use the notifications context
export const useNotifications = () => useContext(NotificationsContext);
