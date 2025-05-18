import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Slider, Alert, ActivityIndicator, Platform, Modal, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { TranslatedText, T } from '@/components/TranslatedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { pushNotificationService, PushNotificationSettings } from '@/services/PushNotificationService';

// Setting item component with switch
const SettingItem = ({
  title,
  description,
  icon,
  iconColor,
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <ThemedView style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <ThemedView style={styles.settingItemHeader}>
        <ThemedView style={[styles.settingIcon, { backgroundColor: iconColor }]}>
          <IconSymbol name={icon} size={20} color="white" />
        </ThemedView>

        <ThemedView style={styles.settingContent}>
          <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.settingDescription}>
            {description}
          </ThemedText>
        </ThemedView>

        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: '#e0e0e0', true: '#a7d8e4' }}
          thumbColor={value ? '#0a7ea4' : '#f4f3f4'}
        />
      </ThemedView>
    </ThemedView>
  );
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { userTypes, primaryUserType } = useUser();
  const {
    registerForPushNotifications,
    isPushNotificationsEnabled,
    togglePushNotifications
  } = useNotifications();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<PushNotificationSettings | null>(null);
  const [distanceThreshold, setDistanceThreshold] = useState<number>(100);
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Get settings from the service
        const currentSettings = pushNotificationService.getSettings();
        setSettings(currentSettings);
        setDistanceThreshold(currentSettings.distanceThreshold);

        // Register for push notifications if enabled
        if (currentSettings.enabled && !currentSettings.token) {
          await registerForPushNotifications();
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [registerForPushNotifications]);

  // Toggle push notifications
  const handleTogglePushNotifications = async (value: boolean) => {
    if (!isOnline && value) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to enable push notifications. Please try again when you have an internet connection.'
      );
      return;
    }

    try {
      const result = await togglePushNotifications(value);

      if (result && !settings?.token) {
        // If enabling notifications and no token exists, register for push notifications
        await registerForPushNotifications();
      }

      // Update local state
      setSettings(prev => prev ? { ...prev, enabled: result } : null);
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Toggle category settings
  const handleToggleCategory = async (category: keyof PushNotificationSettings['categories'], value: boolean) => {
    try {
      const result = await pushNotificationService.updateCategorySettings(category, value);

      // Update local state
      setSettings(prev =>
        prev ? {
          ...prev,
          categories: {
            ...prev.categories,
            [category]: result
          }
        } : null
      );
    } catch (error) {
      console.error(`Error toggling ${category} notifications:`, error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Toggle location-based alerts
  const handleToggleLocationAlerts = async (value: boolean) => {
    try {
      const result = await pushNotificationService.toggleLocationBasedAlerts(value);

      // Update local state
      setSettings(prev => prev ? { ...prev, locationBasedAlerts: result } : null);
    } catch (error) {
      console.error('Error toggling location-based alerts:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Update distance threshold
  const handleUpdateDistanceThreshold = async (value: number) => {
    setDistanceThreshold(value);
  };

  // Save distance threshold when slider completes
  const handleSaveDistanceThreshold = async () => {
    try {
      const result = await pushNotificationService.updateDistanceThreshold(distanceThreshold);

      // Update local state
      setSettings(prev => prev ? { ...prev, distanceThreshold: result } : null);
    } catch (error) {
      console.error('Error updating distance threshold:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Toggle Do Not Disturb mode
  const handleToggleDoNotDisturb = async (value: boolean) => {
    try {
      const result = await pushNotificationService.toggleDoNotDisturb(value);

      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        doNotDisturb: {
          ...prev.doNotDisturb,
          enabled: result
        }
      } : null);
    } catch (error) {
      console.error('Error toggling Do Not Disturb mode:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Handle start time picker
  const handleStartTimePress = () => {
    setShowStartTimePicker(true);
  };

  // Handle end time picker
  const handleEndTimePress = () => {
    setShowEndTimePicker(true);
  };

  // Handle time selection
  const handleTimeChange = async (event: any, selectedDate: Date | undefined, isStartTime: boolean) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      try {
        const startTime = isStartTime ? timeString : settings?.doNotDisturb?.startTime || "22:00";
        const endTime = isStartTime ? settings?.doNotDisturb?.endTime || "06:00" : timeString;

        const result = await pushNotificationService.updateDoNotDisturbTimeRange(startTime, endTime);

        // Update local state
        setSettings(prev => prev ? {
          ...prev,
          doNotDisturb: {
            ...prev.doNotDisturb,
            startTime: result.startTime,
            endTime: result.endTime
          }
        } : null);
      } catch (error) {
        console.error('Error updating Do Not Disturb time range:', error);
        Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
      }
    }
  };

  // Handle day toggle
  const handleDayToggle = async (day: number) => {
    try {
      const currentDays = settings?.doNotDisturb?.days || [];
      let newDays: number[];

      if (currentDays.includes(day)) {
        // Remove day
        newDays = currentDays.filter(d => d !== day);
      } else {
        // Add day
        newDays = [...currentDays, day];
      }

      const result = await pushNotificationService.updateDoNotDisturbDays(newDays);

      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        doNotDisturb: {
          ...prev.doNotDisturb,
          days: result
        }
      } : null);
    } catch (error) {
      console.error('Error updating Do Not Disturb days:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Toggle high priority exception
  const handleToggleHighPriorityException = async (value: boolean) => {
    try {
      const result = await pushNotificationService.toggleDoNotDisturbHighPriorityException(value);

      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        doNotDisturb: {
          ...prev.doNotDisturb,
          exceptHighPriority: result
        }
      } : null);
    } catch (error) {
      console.error('Error toggling high priority exception:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again later.');
    }
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <TranslatedText style={styles.loadingText} i18nKey="notifications.loading_settings" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <TranslatedText style={styles.backButtonText} i18nKey="common.back" />
        </TouchableOpacity>

        <TranslatedText type="subtitle" style={styles.headerTitle} i18nKey="notifications.settings_title" />

        <ThemedView style={{ width: 60 }} />
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <TranslatedText style={styles.offlineBannerText} i18nKey="common.offline_settings_warning" fallback="You're offline. Some settings may not be available." />
        </ThemedView>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Push Notifications</ThemedText>

          <SettingItem
            title="Enable Push Notifications"
            description="Receive important alerts and updates even when the app is closed"
            icon="bell.fill"
            iconColor="#0a7ea4"
            value={settings?.enabled || false}
            onValueChange={handleTogglePushNotifications}
            disabled={!isOnline}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Notification Categories</ThemedText>

          <SettingItem
            title="Urgent Alerts"
            description="Critical alerts about weather events, pest outbreaks, and other emergencies"
            icon="exclamationmark.triangle.fill"
            iconColor="#F44336"
            value={settings?.categories.urgentAlerts || false}
            onValueChange={(value) => handleToggleCategory('urgentAlerts', value)}
            disabled={!settings?.enabled}
          />

          <SettingItem
            title="Expert Messages"
            description="Advice and announcements from agricultural experts"
            icon="person.fill.badge.plus"
            iconColor="#2196F3"
            value={settings?.categories.expertMessages || false}
            onValueChange={(value) => handleToggleCategory('expertMessages', value)}
            disabled={!settings?.enabled}
          />

          <SettingItem
            title="Market Updates"
            description="Price changes, demand shifts, and other market information"
            icon="chart.line.uptrend.xyaxis.fill"
            iconColor="#4CAF50"
            value={settings?.categories.marketUpdates || false}
            onValueChange={(value) => handleToggleCategory('marketUpdates', value)}
            disabled={!settings?.enabled}
          />

          <SettingItem
            title="Weather Alerts"
            description="Notifications about weather conditions affecting your farm"
            icon="cloud.rain.fill"
            iconColor="#FF9800"
            value={settings?.categories.weatherAlerts || false}
            onValueChange={(value) => handleToggleCategory('weatherAlerts', value)}
            disabled={!settings?.enabled}
          />

          <SettingItem
            title="Calendar Reminders"
            description="Reminders for upcoming farm activities and events"
            icon="calendar"
            iconColor="#9C27B0"
            value={settings?.categories.calendarReminders || false}
            onValueChange={(value) => handleToggleCategory('calendarReminders', value)}
            disabled={!settings?.enabled}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Location-Based Alerts</ThemedText>

          <SettingItem
            title="Location-Based Alerts"
            description="Receive alerts relevant to your geographic location"
            icon="location.fill"
            iconColor="#0a7ea4"
            value={settings?.locationBasedAlerts || false}
            onValueChange={handleToggleLocationAlerts}
            disabled={!settings?.enabled}
          />

          <ThemedView style={[
            styles.sliderContainer,
            (!settings?.enabled || !settings?.locationBasedAlerts) && styles.sliderContainerDisabled
          ]}>
            <ThemedView style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">Alert Distance Threshold</ThemedText>
              <ThemedText style={styles.sliderValue}>{Math.round(distanceThreshold)} km</ThemedText>
            </ThemedView>

            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={500}
              step={10}
              value={distanceThreshold}
              onValueChange={handleUpdateDistanceThreshold}
              onSlidingComplete={handleSaveDistanceThreshold}
              minimumTrackTintColor="#0a7ea4"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#0a7ea4"
              disabled={!settings?.enabled || !settings?.locationBasedAlerts}
            />

            <ThemedView style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>10 km</ThemedText>
              <ThemedText style={styles.sliderLabel}>500 km</ThemedText>
            </ThemedView>

            <ThemedText style={styles.sliderDescription}>
              Receive alerts for events within this distance from your location
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Do Not Disturb</ThemedText>

          <SettingItem
            title="Enable Do Not Disturb"
            description="Silence notifications during specific times"
            icon="moon.fill"
            iconColor="#673AB7"
            value={settings?.doNotDisturb?.enabled || false}
            onValueChange={(value) => handleToggleDoNotDisturb(value)}
            disabled={!settings?.enabled}
          />

          {settings?.doNotDisturb?.enabled && (
            <>
              <ThemedView style={styles.timeRangeContainer}>
                <ThemedText type="defaultSemiBold" style={styles.timeRangeTitle}>
                  Quiet Hours
                </ThemedText>

                <ThemedView style={styles.timeInputsContainer}>
                  <ThemedView style={styles.timeInputWrapper}>
                    <ThemedText style={styles.timeInputLabel}>From</ThemedText>
                    <TouchableOpacity
                      style={styles.timeInput}
                      onPress={() => handleStartTimePress()}
                      disabled={!settings?.enabled}
                    >
                      <ThemedText>{settings?.doNotDisturb?.startTime || "22:00"}</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>

                  <ThemedText style={styles.timeInputSeparator}>to</ThemedText>

                  <ThemedView style={styles.timeInputWrapper}>
                    <ThemedText style={styles.timeInputLabel}>To</ThemedText>
                    <TouchableOpacity
                      style={styles.timeInput}
                      onPress={() => handleEndTimePress()}
                      disabled={!settings?.enabled}
                    >
                      <ThemedText>{settings?.doNotDisturb?.endTime || "06:00"}</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.daysContainer}>
                <ThemedText type="defaultSemiBold" style={styles.daysTitle}>
                  Active Days
                </ThemedText>

                <ThemedView style={styles.dayButtonsContainer}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        settings?.doNotDisturb?.days?.includes(index) && styles.selectedDayButton
                      ]}
                      onPress={() => handleDayToggle(index)}
                      disabled={!settings?.enabled}
                    >
                      <ThemedText
                        style={[
                          styles.dayButtonText,
                          settings?.doNotDisturb?.days?.includes(index) && styles.selectedDayButtonText
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>

              <SettingItem
                title="Allow High Priority Notifications"
                description="Critical alerts will still be delivered during Do Not Disturb hours"
                icon="exclamationmark.triangle.fill"
                iconColor="#F44336"
                value={settings?.doNotDisturb?.exceptHighPriority || true}
                onValueChange={(value) => handleToggleHighPriorityException(value)}
                disabled={!settings?.enabled}
              />
            </>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Personalization</ThemedText>

          <SettingItem
            title="AI-Driven Recommendations"
            description="Receive personalized advice based on your farm data and activity patterns"
            icon="brain"
            iconColor="#9C27B0"
            value={settings?.categories.aiRecommendations || false}
            onValueChange={(value) => handleToggleCategory('aiRecommendations', value)}
            disabled={!settings?.enabled}
          />

          <ThemedView style={styles.infoCard}>
            <IconSymbol name="person.crop.circle.fill" size={24} color="#0a7ea4" />
            <ThemedView style={styles.infoCardContent}>
              <ThemedText type="defaultSemiBold">Profile-Based Recommendations</ThemedText>
              <ThemedText style={styles.infoCardDescription}>
                You are receiving personalized notifications based on your profile:
              </ThemedText>
              <ThemedView style={styles.profileTypeContainer}>
                {userTypes.map((type, index) => (
                  <ThemedView
                    key={index}
                    style={[
                      styles.profileTypeBadge,
                      type === primaryUserType && styles.primaryProfileTypeBadge
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.profileTypeText,
                        type === primaryUserType && styles.primaryProfileTypeText
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      {type === primaryUserType && ' (Primary)'}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
              <ThemedText style={styles.infoCardNote}>
                To change your profile, go to Profile Settings
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Time Pickers */}
      {showStartTimePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            visible={showStartTimePicker}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>Select Start Time</ThemedText>

                <DateTimePicker
                  value={new Date(`2023-01-01T${settings?.doNotDisturb?.startTime || '22:00'}:00`)}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => handleTimeChange(event, date, true)}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={new Date(`2023-01-01T${settings?.doNotDisturb?.startTime || '22:00'}:00`)}
            mode="time"
            display="default"
            onChange={(event, date) => handleTimeChange(event, date, true)}
          />
        )
      )}

      {showEndTimePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            visible={showEndTimePicker}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>Select End Time</ThemedText>

                <DateTimePicker
                  value={new Date(`2023-01-01T${settings?.doNotDisturb?.endTime || '06:00'}:00`)}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => handleTimeChange(event, date, false)}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={new Date(`2023-01-01T${settings?.doNotDisturb?.endTime || '06:00'}:00`)}
            mode="time"
            display="default"
            onChange={(event, date) => handleTimeChange(event, date, false)}
          />
        )
      )}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingItemDisabled: {
    opacity: 0.7,
  },
  settingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  sliderContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sliderContainerDisabled: {
    opacity: 0.7,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderValue: {
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#757575',
  },
  sliderDescription: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoCardDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  infoCardNote: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 8,
  },
  profileTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileTypeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  primaryProfileTypeBadge: {
    backgroundColor: '#0a7ea4',
  },
  profileTypeText: {
    color: '#757575',
  },
  primaryProfileTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeRangeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeRangeTitle: {
    marginBottom: 16,
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeInputSeparator: {
    marginHorizontal: 16,
    color: '#757575',
  },
  daysContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  daysTitle: {
    marginBottom: 16,
  },
  dayButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDayButton: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayButtonText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});
