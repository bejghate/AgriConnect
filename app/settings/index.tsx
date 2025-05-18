import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';
import { useOffline } from '@/context/OfflineContext';
import { COLORS } from '@/constants/Theme';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { OfflineStatusBar } from '@/components/OfflineStatusBar';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { isOnline } = useOffline();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <ThemedView style={styles.container}>
      <SettingsHeader title="Settings" />
      <OfflineStatusBar showSyncButton={false} />

      <ScrollView style={styles.scrollView}>
        {/* Account Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/profile')}
            accessibilityLabel="Profile settings"
            accessibilityHint="Navigate to profile settings"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="person.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Profile</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/settings/security')}
            accessibilityLabel="Security settings"
            accessibilityHint="Navigate to security settings"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="lock.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Security</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/notification-settings')}
            accessibilityLabel="Notification settings"
            accessibilityHint="Navigate to notification settings"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="bell.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>
        </ThemedView>

        <Divider style={styles.divider} />

        {/* App Settings Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App Settings
          </ThemedText>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/settings/offline')}
            accessibilityLabel="Offline settings"
            accessibilityHint="Navigate to offline settings"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol
                name={isOnline ? "wifi" : "wifi.slash"}
                size={24}
                color={COLORS.primary.main}
                style={styles.settingIcon}
              />
              <ThemedText style={styles.settingLabel}>Offline Mode</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/settings/accessibility')}
            accessibilityLabel="Accessibility settings"
            accessibilityHint="Navigate to accessibility settings"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="accessibility" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Accessibility</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {/* Toggle theme */}}
            accessibilityLabel="Theme settings"
            accessibilityHint="Toggle between light and dark theme"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="moon.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Theme</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/settings/language')}
            accessibilityLabel="Language settings"
            accessibilityHint="Change application language"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="globe" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Language</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>
        </ThemedView>

        <Divider style={styles.divider} />

        {/* Support Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Support
          </ThemedText>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo('/about')}
            accessibilityLabel="About AgriConnect"
            accessibilityHint="View information about the application"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="info.circle.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>About</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {/* Open help center */}}
            accessibilityLabel="Help center"
            accessibilityHint="Get help with using the application"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="questionmark.circle.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Help Center</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {/* Open feedback form */}}
            accessibilityLabel="Send feedback"
            accessibilityHint="Send feedback about the application"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="envelope.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Send Feedback</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>
        </ThemedView>

        <Divider style={styles.divider} />

        {/* Logout Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={logout}
            accessibilityLabel="Logout"
            accessibilityHint="Log out of your account"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="arrow.right.square.fill" size={24} color="#F44336" style={styles.settingIcon} />
              <ThemedText style={[styles.settingLabel, styles.logoutLabel]}>Logout</ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>AgriConnect v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutLabel: {
    color: '#F44336',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#757575',
  },
});
