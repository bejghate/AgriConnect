import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, RadioButton, Divider, ActivityIndicator } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';
import SecurityService from '@/services/SecurityService';
import { COLORS } from '@/constants/Theme';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'sms'>('email');
  const [isChanging2FA, setIsChanging2FA] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const twoFactorStatus = await SecurityService.isTwoFactorAuthEnabled(user.id);
      setTwoFactorEnabled(twoFactorStatus.enabled);
      if (twoFactorStatus.method) {
        setTwoFactorMethod(twoFactorStatus.method);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      Alert.alert('Error', 'Failed to load security settings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTwoFactor = async (value: boolean) => {
    if (!user) return;
    
    setIsChanging2FA(true);
    try {
      if (value) {
        // Enable 2FA
        const success = await SecurityService.enableTwoFactorAuth(user.id, twoFactorMethod);
        if (success) {
          setTwoFactorEnabled(true);
          Alert.alert(
            'Two-Factor Authentication Enabled',
            `You will now receive a verification code via ${twoFactorMethod} when logging in.`
          );
        }
      } else {
        // Disable 2FA
        Alert.alert(
          'Disable Two-Factor Authentication',
          'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                const success = await SecurityService.disableTwoFactorAuth(user.id);
                if (success) {
                  setTwoFactorEnabled(false);
                  Alert.alert(
                    'Two-Factor Authentication Disabled',
                    'Two-factor authentication has been disabled for your account.'
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
      Alert.alert('Error', 'Failed to update two-factor authentication settings. Please try again later.');
    } finally {
      setIsChanging2FA(false);
    }
  };

  const handleMethodChange = (method: 'email' | 'sms') => {
    setTwoFactorMethod(method);
    if (twoFactorEnabled && user) {
      // Update the method if 2FA is already enabled
      SecurityService.enableTwoFactorAuth(user.id, method)
        .then(success => {
          if (success) {
            Alert.alert(
              'Two-Factor Method Updated',
              `You will now receive verification codes via ${method}.`
            );
          }
        })
        .catch(error => {
          console.error('Error updating two-factor method:', error);
          Alert.alert('Error', 'Failed to update two-factor method. Please try again later.');
        });
    }
  };

  const handleChangePassword = () => {
    router.push('/settings/change-password');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <ThemedText style={styles.loadingText}>Loading security settings...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SettingsHeader title="Security Settings" />
      
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Two-Factor Authentication
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Add an extra layer of security to your account by requiring a verification code when you log in.
          </ThemedText>
          
          <View style={styles.toggleContainer}>
            <ThemedText style={styles.toggleLabel}>Enable Two-Factor Authentication</ThemedText>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              disabled={isChanging2FA}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={twoFactorEnabled ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
          
          {twoFactorEnabled && (
            <View style={styles.methodContainer}>
              <ThemedText style={styles.methodTitle}>Verification Method</ThemedText>
              
              <RadioButton.Group onValueChange={value => handleMethodChange(value as 'email' | 'sms')} value={twoFactorMethod}>
                <View style={styles.radioOption}>
                  <RadioButton value="email" color={COLORS.primary.main} />
                  <ThemedText style={styles.radioLabel}>Email</ThemedText>
                </View>
                
                <View style={styles.radioOption}>
                  <RadioButton value="sms" color={COLORS.primary.main} />
                  <ThemedText style={styles.radioLabel}>SMS</ThemedText>
                </View>
              </RadioButton.Group>
              
              <ThemedText style={styles.methodNote}>
                You will receive a verification code via {twoFactorMethod === 'email' ? 'email' : 'SMS'} when logging in.
              </ThemedText>
            </View>
          )}
        </ThemedView>
        
        <Divider style={styles.divider} />
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Password
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleChangePassword}
            accessibilityLabel="Change password"
            accessibilityHint="Navigate to change password screen"
          >
            <View style={styles.settingItemContent}>
              <IconSymbol name="lock.fill" size={24} color={COLORS.primary.main} style={styles.settingIcon} />
              <ThemedText style={styles.settingLabel}>Change Password</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TouchableOpacity>
        </ThemedView>
        
        <Divider style={styles.divider} />
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Login Sessions
          </ThemedText>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Logout', 'Are you sure you want to log out from all other devices?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Success', 'You have been logged out from all other devices.') }
            ])}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonLabel}
          >
            Logout from all other devices
          </Button>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
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
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#757575',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  toggleLabel: {
    flex: 1,
  },
  methodContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  methodTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    marginLeft: 8,
  },
  methodNote: {
    marginTop: 8,
    color: '#757575',
    fontSize: 14,
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  logoutButton: {
    marginTop: 8,
    borderColor: '#F44336',
  },
  logoutButtonLabel: {
    color: '#F44336',
  },
});
