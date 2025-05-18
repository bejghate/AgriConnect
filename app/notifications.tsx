import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { Notification } from '@/data/notifications';

// Notification item component
const NotificationItem = ({ notification, onPress, onLongPress }) => {
  // Format timestamp to relative time (e.g., "2h ago", "Yesterday", etc.)
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  // Get icon and color based on notification type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health_alert':
        return 'exclamationmark.triangle.fill';
      case 'calendar_reminder':
        return 'calendar';
      case 'seasonal_advice':
        return 'leaf.fill';
      default:
        return 'bell.fill';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        notification.isRead ? styles.notificationItemRead : null
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <ThemedView
        style={[
          styles.notificationIcon,
          { backgroundColor: notification.color || '#0a7ea4' }
        ]}
      >
        <IconSymbol
          name={notification.icon || getTypeIcon(notification.type)}
          size={20}
          color="white"
        />
      </ThemedView>

      <ThemedView style={styles.notificationContent}>
        <ThemedView style={styles.notificationHeader}>
          <ThemedText
            type={notification.isRead ? 'default' : 'defaultSemiBold'}
            style={styles.notificationTitle}
          >
            {notification.title}
          </ThemedText>
          <ThemedView
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(notification.priority) }
            ]}
          >
            <ThemedText style={styles.priorityText}>
              {notification.priority.charAt(0).toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText
          style={[
            styles.notificationDescription,
            notification.isRead ? styles.notificationDescriptionRead : null
          ]}
          numberOfLines={2}
        >
          {notification.description}
        </ThemedText>

        <ThemedText style={styles.notificationTime}>
          {formatRelativeTime(notification.timestamp)}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

// Empty state component
const EmptyState = () => (
  <ThemedView style={styles.emptyContainer}>
    <IconSymbol name="bell.slash.fill" size={48} color="#757575" />
    <ThemedText type="subtitle" style={styles.emptyTitle}>
      No Notifications
    </ThemedText>
    <ThemedText style={styles.emptyText}>
      You don't have any notifications at the moment. Check back later for updates on health alerts, calendar reminders, and seasonal advice.
    </ThemedText>
  </ThemedView>
);

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    isRefreshing
  } = useNotifications();
  const { isOnline } = useOffline();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.isRead;
    return notification.type === activeFilter;
  });

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate to appropriate screen based on notification type
    switch (notification.type) {
      case 'health_alert':
        router.push(`/health-alerts?id=${notification.id}`);
        break;
      case 'calendar_reminder':
        router.push(`/calendar?id=${notification.id}`);
        break;
      case 'seasonal_advice':
        router.push(`/seasonal-advice?id=${notification.id}`);
        break;
      default:
        // Do nothing
        break;
    }
  };

  // Handle notification long press
  const handleNotificationLongPress = (notification: Notification) => {
    Alert.alert(
      'Notification Options',
      'What would you like to do with this notification?',
      [
        {
          text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
          onPress: () => markAsRead(notification.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle filter press
  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (notifications.length === 0) {
      Alert.alert('No Notifications', 'You don\'t have any notifications to mark as read.');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark All',
          onPress: markAllAsRead,
        },
      ]
    );
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Filter button component
  const FilterButton = ({ label, filter, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => handleFilterPress(filter)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive
        ]}
      >
        {label} {count > 0 && `(${count})`}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.headerTitle}>Notifications</ThemedText>

        <ThemedView style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/notification-settings')}
          >
            <IconSymbol name="gear" size={20} color="#0a7ea4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllAsRead}>
            <ThemedText style={styles.headerButtonText}>Mark All Read</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some notifications may not be up to date.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.filtersContainer}>
        <FilterButton
          label="All"
          filter="all"
          count={notifications.length}
        />
        <FilterButton
          label="Unread"
          filter="unread"
          count={notifications.filter(n => !n.isRead).length}
        />
        <FilterButton
          label="Health"
          filter="health_alert"
          count={notifications.filter(n => n.type === 'health_alert').length}
        />
        <FilterButton
          label="Calendar"
          filter="calendar_reminder"
          count={notifications.filter(n => n.type === 'calendar_reminder').length}
        />
        <FilterButton
          label="Seasonal"
          filter="seasonal_advice"
          count={notifications.filter(n => n.type === 'seasonal_advice').length}
        />
      </ThemedView>

      <FlatList
        data={filteredNotifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onLongPress={() => handleNotificationLongPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshNotifications}
            colors={['#0a7ea4']}
            tintColor="#0a7ea4"
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerButtonText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  notificationsList: {
    padding: 16,
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notificationItemRead: {
    backgroundColor: '#f9f9f9',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDescriptionRead: {
    color: '#757575',
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
});
