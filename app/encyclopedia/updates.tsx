import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { syncService, SyncInfo, UpdateInfo } from '@/services/SyncService';
import { formatBytes } from '@/utils/storage';

// Update card component
const UpdateCard = ({ update, onPress }: { update: UpdateInfo, onPress: () => void }) => {
  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return '#F44336';
      case 'major': return '#FF9800';
      case 'minor': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.updateCard} onPress={onPress}>
      <ThemedView style={styles.updateCardHeader}>
        <ThemedView>
          <ThemedText type="subtitle">Version {update.version}</ThemedText>
          <ThemedText style={styles.updateDate}>{update.releaseDate}</ThemedText>
        </ThemedView>
        <ThemedView 
          style={[
            styles.updateTypeBadge,
            { backgroundColor: getUpdateTypeColor(update.updateType) }
          ]}
        >
          <ThemedText style={styles.updateTypeText}>
            {update.updateType.toUpperCase()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedText style={styles.updateDescription}>{update.description}</ThemedText>
      
      <ThemedView style={styles.updateStats}>
        {update.contentUpdates.map((contentUpdate, index) => (
          <ThemedView key={index} style={styles.updateStatItem}>
            <ThemedText style={styles.updateStatCount}>{contentUpdate.itemCount}</ThemedText>
            <ThemedText style={styles.updateStatLabel}>{contentUpdate.category}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function UpdatesScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  const [syncInfo, setSyncInfo] = useState<SyncInfo>(syncService.getSyncInfo());
  const [updateHistory, setUpdateHistory] = useState<UpdateInfo[]>(syncService.getUpdateHistory());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncInterval, setSyncInterval] = useState<number>(60); // 60 minutes
  
  useEffect(() => {
    // Start auto-sync when component mounts
    syncService.startAutoSync(syncInterval);
    
    // Clean up when component unmounts
    return () => {
      if (!autoSyncEnabled) {
        syncService.stopAutoSync();
      }
    };
  }, [syncInterval, autoSyncEnabled]);
  
  const handleCheckForUpdates = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to check for updates.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsChecking(true);
    
    try {
      const updateAvailable = await syncService.checkForUpdates();
      setSyncInfo(syncService.getSyncInfo());
      
      if (updateAvailable) {
        const updateInfo = syncService.getAvailableUpdateInfo();
        Alert.alert(
          'Update Available',
          `Version ${updateInfo?.version} is available. Would you like to update now?`,
          [
            {
              text: 'Later',
              style: 'cancel'
            },
            {
              text: 'Update Now',
              onPress: handleApplyUpdates
            }
          ]
        );
      } else {
        Alert.alert(
          'No Updates Available',
          'Your encyclopedia is up to date.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      Alert.alert(
        'Error',
        'There was an error checking for updates. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleApplyUpdates = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to apply updates.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!syncInfo.updateAvailable) {
      Alert.alert(
        'No Updates Available',
        'There are no updates available to apply.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await syncService.applyUpdates();
      setSyncInfo(syncService.getSyncInfo());
      setUpdateHistory(syncService.getUpdateHistory());
      
      if (result.success) {
        Alert.alert(
          'Update Successful',
          `${result.message}\n\nUpdated items: ${result.updatedItems}\nNew items: ${result.newItems}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Update Failed',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error applying updates:', error);
      Alert.alert(
        'Error',
        'There was an error applying updates. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAutoSync = () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    
    if (newValue) {
      syncService.startAutoSync(syncInterval);
    } else {
      syncService.stopAutoSync();
    }
  };
  
  const handleUpdateIntervalChange = (newInterval: number) => {
    setSyncInterval(newInterval);
    syncService.startAutoSync(newInterval);
  };
  
  const formatLastSyncTime = (timestamp: number) => {
    if (timestamp === 0) {
      return 'Never';
    }
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  const handleUpdatePress = (update: UpdateInfo) => {
    Alert.alert(
      `Version ${update.version}`,
      `Release Date: ${update.releaseDate}\n\n${update.description}\n\nContent Updates:\n${
        update.contentUpdates.map(cu => `• ${cu.category}: ${cu.description} (${cu.itemCount} items)`).join('\n')
      }`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Encyclopedia Updates</ThemedText>
        
        {!isOnline && (
          <ThemedView style={styles.offlineBanner}>
            <IconSymbol name="wifi.slash" size={16} color="white" />
            <ThemedText style={styles.offlineBannerText}>
              You're offline. Update features are limited.
            </ThemedText>
          </ThemedView>
        )}
        
        <ThemedView style={styles.syncInfoCard}>
          <ThemedView style={styles.syncInfoRow}>
            <ThemedText type="defaultSemiBold">Current Version:</ThemedText>
            <ThemedText>{syncInfo.currentDatabaseVersion}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.syncInfoRow}>
            <ThemedText type="defaultSemiBold">Last Checked:</ThemedText>
            <ThemedText>{formatLastSyncTime(syncInfo.lastSyncTimestamp)}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.syncInfoRow}>
            <ThemedText type="defaultSemiBold">Status:</ThemedText>
            <ThemedView style={styles.statusContainer}>
              {syncInfo.updateAvailable ? (
                <>
                  <ThemedView style={styles.statusDot} />
                  <ThemedText style={styles.updateAvailableText}>
                    Update Available ({syncInfo.availableVersion})
                  </ThemedText>
                </>
              ) : (
                <ThemedText>Up to date</ThemedText>
              )}
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.syncButtons}>
            <TouchableOpacity 
              style={[styles.syncButton, styles.checkButton]} 
              onPress={handleCheckForUpdates}
              disabled={isChecking || !isOnline}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <IconSymbol name="arrow.clockwise" size={16} color="white" />
                  <ThemedText style={styles.syncButtonText}>Check for Updates</ThemedText>
                </>
              )}
            </TouchableOpacity>
            
            {syncInfo.updateAvailable && (
              <TouchableOpacity 
                style={[styles.syncButton, styles.updateButton]} 
                onPress={handleApplyUpdates}
                disabled={isLoading || !isOnline}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <IconSymbol name="arrow.down.circle" size={16} color="white" />
                    <ThemedText style={styles.syncButtonText}>Update Now</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.settingsCard}>
          <ThemedText type="subtitle" style={styles.settingsTitle}>Sync Settings</ThemedText>
          
          <ThemedView style={styles.settingRow}>
            <ThemedText>Automatic Updates</ThemedText>
            <Switch
              value={autoSyncEnabled}
              onValueChange={toggleAutoSync}
              trackColor={{ false: '#767577', true: '#0a7ea4' }}
              thumbColor="#f4f3f4"
            />
          </ThemedView>
          
          {autoSyncEnabled && (
            <ThemedView style={styles.intervalContainer}>
              <ThemedText style={styles.intervalLabel}>Check Interval:</ThemedText>
              <ThemedView style={styles.intervalButtons}>
                <TouchableOpacity 
                  style={[
                    styles.intervalButton,
                    syncInterval === 30 && styles.intervalButtonActive
                  ]}
                  onPress={() => handleUpdateIntervalChange(30)}
                >
                  <ThemedText 
                    style={[
                      styles.intervalButtonText,
                      syncInterval === 30 && styles.intervalButtonTextActive
                    ]}
                  >
                    30 min
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.intervalButton,
                    syncInterval === 60 && styles.intervalButtonActive
                  ]}
                  onPress={() => handleUpdateIntervalChange(60)}
                >
                  <ThemedText 
                    style={[
                      styles.intervalButtonText,
                      syncInterval === 60 && styles.intervalButtonTextActive
                    ]}
                  >
                    1 hour
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.intervalButton,
                    syncInterval === 360 && styles.intervalButtonActive
                  ]}
                  onPress={() => handleUpdateIntervalChange(360)}
                >
                  <ThemedText 
                    style={[
                      styles.intervalButtonText,
                      syncInterval === 360 && styles.intervalButtonTextActive
                    ]}
                  >
                    6 hours
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.intervalButton,
                    syncInterval === 1440 && styles.intervalButtonActive
                  ]}
                  onPress={() => handleUpdateIntervalChange(1440)}
                >
                  <ThemedText 
                    style={[
                      styles.intervalButtonText,
                      syncInterval === 1440 && styles.intervalButtonTextActive
                    ]}
                  >
                    Daily
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
        
        {updateHistory.length > 0 && (
          <ThemedView style={styles.historySection}>
            <ThemedText type="subtitle" style={styles.historyTitle}>Update History</ThemedText>
            
            {updateHistory.map((update, index) => (
              <UpdateCard 
                key={index} 
                update={update} 
                onPress={() => handleUpdatePress(update)} 
              />
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  title: {
    marginBottom: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  syncInfoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 6,
  },
  updateAvailableText: {
    color: '#F44336',
    fontWeight: '500',
  },
  syncButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  checkButton: {
    backgroundColor: '#0a7ea4',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  intervalContainer: {
    marginBottom: 8,
  },
  intervalLabel: {
    marginBottom: 8,
  },
  intervalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intervalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  intervalButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  intervalButtonText: {
    fontSize: 12,
  },
  intervalButtonTextActive: {
    color: 'white',
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    marginBottom: 16,
  },
  updateCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  updateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  updateDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  updateTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  updateTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  updateDescription: {
    marginBottom: 12,
  },
  updateStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  updateStatItem: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  updateStatCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  updateStatLabel: {
    fontSize: 12,
    color: '#757575',
  },
});
