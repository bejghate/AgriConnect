import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useOffline } from '@/context/OfflineContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';
import { formatDistanceToNow } from 'date-fns';

interface OfflineStatusBarProps {
  showSyncButton?: boolean;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  showSyncButton = true
}) => {
  const {
    isOnline,
    syncStatus,
    isSyncing,
    lastSyncTime,
    syncData
  } = useOffline();

  const [isVisible, setIsVisible] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Show the status bar when offline or when sync status changes
  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
    } else if (syncStatus.syncStatus === 'failed') {
      setIsVisible(true);
    } else if (syncStatus.syncStatus === 'in-progress') {
      setIsVisible(true);
    } else if (syncStatus.syncStatus === 'success') {
      // Hide after 5 seconds if online and sync is successful
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOnline, syncStatus.syncStatus]);

  // Update sync message
  useEffect(() => {
    if (!isOnline) {
      setSyncMessage('You are offline. Some features may be limited.');
    } else if (syncStatus.syncStatus === 'failed') {
      setSyncMessage('Last sync failed. Tap to retry.');
    } else if (syncStatus.syncStatus === 'in-progress') {
      setSyncMessage('Syncing...');
    } else if (syncStatus.syncStatus === 'success' && lastSyncTime > 0) {
      const timeAgo = formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true });
      setSyncMessage(`Last sync: ${timeAgo}`);
    } else {
      setSyncMessage('Not yet synced');
    }
  }, [isOnline, syncStatus.syncStatus, lastSyncTime]);

  // Handle sync button press
  const handleSyncPress = () => {
    if (isOnline && !isSyncing) {
      syncData();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      !isOnline ? styles.offlineContainer :
      syncStatus.syncStatus === 'failed' ? styles.errorContainer :
      syncStatus.syncStatus === 'in-progress' ? styles.syncingContainer :
      styles.onlineContainer
    ]}>
      <View style={styles.statusContent}>
        <IconSymbol
          name={
            !isOnline ? 'wifi.slash' :
            syncStatus.syncStatus === 'failed' ? 'exclamationmark.triangle.fill' :
            syncStatus.syncStatus === 'in-progress' ? 'arrow.clockwise' :
            'checkmark.circle.fill'
          }
          size={16}
          color="white"
          style={[
            styles.icon,
            syncStatus.syncStatus === 'in-progress' && styles.spinningIcon
          ]}
        />
        <ThemedText style={styles.statusText}>{syncMessage}</ThemedText>
      </View>

      {showSyncButton && isOnline && !isSyncing && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncPress}
          disabled={isSyncing || !isOnline}
          accessibilityLabel="Sync data"
          accessibilityHint="Synchronize data with the server"
        >
          <ThemedText style={styles.syncButtonText}>Sync</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  offlineContainer: {
    backgroundColor: '#F44336', // Red
  },
  onlineContainer: {
    backgroundColor: '#4CAF50', // Green
  },
  errorContainer: {
    backgroundColor: '#FF9800', // Orange
  },
  syncingContainer: {
    backgroundColor: '#2196F3', // Blue
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  spinningIcon: {
    // In a real implementation, we would add animation:
    // transform: [{ rotate: '360deg' }],
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
