import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { PUSH_NOTIFICATION_CONFIG } from '@/constants/Config';
import api from '@/utils/api';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    try {
      // Récupérer les paramètres de notification
      const settings = await this.getNotificationSettings();

      // Vérifier si les notifications sont activées
      if (!settings.enabled) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }

      // Récupérer le type de notification
      const type = notification.request.content.data?.type as NotificationType || NotificationType.SYSTEM;

      // Vérifier si ce type de notification est activé
      if (!settings.types[type]) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: true, // Toujours mettre à jour le badge
        };
      }

      // Vérifier les heures silencieuses
      if (settings.quietHours.enabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        // Vérifier si l'heure actuelle est dans les heures silencieuses
        const isQuietHours = endTime > startTime
          ? (currentTime >= startTime && currentTime <= endTime)
          : (currentTime >= startTime || currentTime <= endTime);

        // Si c'est les heures silencieuses et que la notification n'est pas urgente
        if (isQuietHours && notification.request.content.data?.priority !== NotificationPriority.URGENT) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }
      }

      // Gérer les notifications urgentes
      if (notification.request.content.data?.priority === NotificationPriority.URGENT) {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true, // Toujours jouer un son pour les notifications urgentes
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        };
      }

      // Comportement par défaut
      return {
        shouldShowAlert: true,
        shouldPlaySound: settings.sound,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      };
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
      // En cas d'erreur, afficher la notification par défaut
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    }
  },
});

// Types de notifications
export enum NotificationType {
  HEALTH_ALERT = 'health_alert',
  WEATHER_ALERT = 'weather_alert',
  MARKET_PRICE = 'market_price',
  SEASONAL_ADVICE = 'seasonal_advice',
  SYSTEM = 'system',
  MESSAGE = 'message',
  MARKETPLACE_UPDATE = 'marketplace_update',
  REMINDER = 'reminder',
  FORUM_ACTIVITY = 'forum_activity',
  FINANCIAL_UPDATE = 'financial_update',
}

// Priorités de notifications
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Interface pour les notifications
export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  imageUrl?: string;
  deepLink?: string;
  actions?: NotificationAction[];
  data?: any;
  read?: boolean;
  createdAt?: number;
  expiresAt?: number;
}

// Interface pour les actions de notification
export interface NotificationAction {
  title: string;
  identifier: string;
  options?: {
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
    opensAppToForeground?: boolean;
  };
}

// Interface pour les paramètres de notification
export interface NotificationSettings {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
  };
  vibration: boolean;
  sound: boolean;
}

// Clés de stockage
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATION_HISTORY_KEY = 'notification_history';

// Paramètres de notification par défaut
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  types: {
    [NotificationType.HEALTH_ALERT]: true,
    [NotificationType.WEATHER_ALERT]: true,
    [NotificationType.MARKET_PRICE]: true,
    [NotificationType.SEASONAL_ADVICE]: true,
    [NotificationType.SYSTEM]: true,
    [NotificationType.MESSAGE]: true,
    [NotificationType.MARKETPLACE_UPDATE]: true,
    [NotificationType.REMINDER]: true,
    [NotificationType.FORUM_ACTIVITY]: true,
    [NotificationType.FINANCIAL_UPDATE]: true,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "07:00",
  },
  vibration: true,
  sound: true,
};

// Service de notifications
class NotificationService {
  // Obtenir les paramètres de notification
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de notification:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  // Sauvegarder les paramètres de notification
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres de notification:', error);
      throw error;
    }
  }

  // Réinitialiser les paramètres de notification
  async resetNotificationSettings(): Promise<NotificationSettings> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS));
      return DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres de notification:', error);
      throw error;
    }
  }

  // Sauvegarder une notification dans l'historique
  async saveNotificationToHistory(notification: NotificationData): Promise<void> {
    try {
      // Ajouter les métadonnées manquantes
      const completeNotification = {
        ...notification,
        read: notification.read || false,
        createdAt: notification.createdAt || Date.now(),
      };

      // Récupérer l'historique existant
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      let history: NotificationData[] = historyJson ? JSON.parse(historyJson) : [];

      // Ajouter la nouvelle notification
      history.unshift(completeNotification);

      // Limiter l'historique à 100 éléments
      if (history.length > 100) {
        history = history.slice(0, 100);
      }

      // Sauvegarder l'historique mis à jour
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la notification dans l\'historique:', error);
    }
  }

  // Obtenir l'historique des notifications
  async getNotificationHistory(): Promise<NotificationData[]> {
    try {
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // Récupérer l'historique existant
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (!historyJson) return;

      const history: NotificationData[] = JSON.parse(historyJson);

      // Trouver et mettre à jour la notification
      const updatedHistory = history.map(notification =>
        notification.data?.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      // Sauvegarder l'historique mis à jour
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      // Récupérer l'historique existant
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (!historyJson) return;

      const history: NotificationData[] = JSON.parse(historyJson);

      // Mettre à jour toutes les notifications
      const updatedHistory = history.map(notification => ({ ...notification, read: true }));

      // Sauvegarder l'historique mis à jour
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      // Récupérer l'historique existant
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (!historyJson) return;

      const history: NotificationData[] = JSON.parse(historyJson);

      // Filtrer la notification
      const updatedHistory = history.filter(notification => notification.data?.id !== notificationId);

      // Sauvegarder l'historique mis à jour
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }

  // Effacer tout l'historique des notifications
  async clearNotificationHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique des notifications:', error);
    }
  }
  // Enregistrer l'appareil pour les notifications push
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Les notifications push ne fonctionnent pas sur l\'émulateur');
      return null;
    }

    // Vérifier les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Demander les permissions si nécessaire
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Si les permissions ne sont pas accordées, sortir
    if (finalStatus !== 'granted') {
      console.log('Les permissions de notification n\'ont pas été accordées');
      return null;
    }

    // Configurer le canal de notification pour Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        PUSH_NOTIFICATION_CONFIG.android.channelId,
        {
          name: PUSH_NOTIFICATION_CONFIG.android.channelName,
          description: PUSH_NOTIFICATION_CONFIG.android.channelDescription,
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: PUSH_NOTIFICATION_CONFIG.android.vibrationPattern,
          lightColor: PUSH_NOTIFICATION_CONFIG.android.lightColor,
        }
      );
    }

    // Obtenir le token de l'appareil
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Stocker le token dans le store
    useAppStore.getState().setPushToken(token.data);

    // Enregistrer le token sur le serveur
    try {
      await api.post('/notifications/register-device', {
        token: token.data,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        deviceYearClass: await Device.getDeviceYearClassAsync(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
    }

    return token.data;
  }

  // Planifier une notification locale
  async scheduleLocalNotification(notification: NotificationData, trigger?: Notifications.NotificationTriggerInput) {
    try {
      // Générer un ID unique pour la notification
      const notificationId = notification.data?.id || `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Préparer le contenu de la notification
      const notificationContent: Notifications.NotificationContentInput = {
        title: notification.title,
        body: notification.body,
        data: {
          id: notificationId,
          type: notification.type,
          priority: notification.priority || NotificationPriority.NORMAL,
          deepLink: notification.deepLink,
          createdAt: notification.createdAt || Date.now(),
          ...notification.data,
        },
        sound: true,
        badge: 1,
      };

      // Ajouter l'image si fournie
      if (notification.imageUrl) {
        notificationContent.attachments = [
          {
            url: notification.imageUrl,
            identifier: 'image',
          },
        ];
      }

      // Ajouter les actions si fournies
      if (notification.actions && notification.actions.length > 0) {
        notificationContent.categoryIdentifier = notification.type;

        // Enregistrer la catégorie avec les actions
        await Notifications.setNotificationCategoryAsync(
          notification.type,
          notification.actions.map(action => ({
            identifier: action.identifier,
            buttonTitle: action.title,
            options: {
              isDestructive: action.options?.isDestructive || false,
              isAuthenticationRequired: action.options?.isAuthenticationRequired || false,
              opensAppToForeground: action.options?.opensAppToForeground !== false,
            },
          }))
        );
      }

      // Planifier la notification
      const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: trigger || null,
      });

      // Sauvegarder la notification dans l'historique
      await this.saveNotificationToHistory({
        ...notification,
        data: {
          ...notification.data,
          id: notificationId,
          scheduledId: scheduledNotificationId,
        },
      });

      return scheduledNotificationId;
    } catch (error) {
      console.error('Erreur lors de la planification de la notification locale:', error);
      throw error;
    }
  }

  // Envoyer une notification immédiate
  async sendImmediateNotification(notification: NotificationData) {
    return await this.scheduleLocalNotification(notification);
  }

  // Planifier une notification pour une date spécifique
  async scheduleNotificationForDate(notification: NotificationData, date: Date) {
    return await this.scheduleLocalNotification(notification, date);
  }

  // Planifier une notification récurrente
  async scheduleRecurringNotification(
    notification: NotificationData,
    frequency: 'minute' | 'hour' | 'day' | 'week',
    count: number
  ) {
    let trigger: Notifications.NotificationTriggerInput;

    switch (frequency) {
      case 'minute':
        trigger = {
          seconds: count * 60,
          repeats: true,
        };
        break;
      case 'hour':
        trigger = {
          seconds: count * 60 * 60,
          repeats: true,
        };
        break;
      case 'day':
        trigger = {
          seconds: count * 60 * 60 * 24,
          repeats: true,
        };
        break;
      case 'week':
        trigger = {
          seconds: count * 60 * 60 * 24 * 7,
          repeats: true,
        };
        break;
    }

    return await this.scheduleLocalNotification(notification, trigger);
  }

  // Annuler toutes les notifications planifiées
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Annuler une notification spécifique
  async cancelScheduledNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Effacer toutes les notifications
  async dismissAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Obtenir toutes les notifications planifiées
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Configurer les gestionnaires d'événements de notification
  setupNotificationHandlers(
    onReceive: (notification: Notifications.Notification) => void,
    onResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Gestionnaire pour les notifications reçues lorsque l'application est au premier plan
    const receiveSubscription = Notifications.addNotificationReceivedListener(onReceive);

    // Gestionnaire pour les réponses aux notifications (lorsque l'utilisateur appuie sur une notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onResponse);

    // Retourner les fonctions de nettoyage
    return () => {
      receiveSubscription.remove();
      responseSubscription.remove();
    };
  }
}

export default new NotificationService();
