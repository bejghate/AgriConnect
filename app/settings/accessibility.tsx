import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, RadioButton, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/navigation/AppHeader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { FontSizeType } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/Theme';

/**
 * Accessibility settings screen
 */
export default function AccessibilityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    preferences,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setHapticFeedback,
    setScreenReaderEnabled,
    setVoiceCommands,
    setTextToSpeech,
    triggerHaptic,
    resetPreferences,
  } = useAccessibilityContext();
  
  // State for confirmation dialog
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // Handle font size change
  const handleFontSizeChange = async (size: FontSizeType) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setFontSize(size);
  };
  
  // Handle toggle switches
  const handleToggleHighContrast = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setHighContrast(value);
  };
  
  const handleToggleReduceMotion = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setReduceMotion(value);
  };
  
  const handleToggleHapticFeedback = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setHapticFeedback(value);
  };
  
  const handleToggleScreenReader = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setScreenReaderEnabled(value);
  };
  
  const handleToggleVoiceCommands = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setVoiceCommands(value);
  };
  
  const handleToggleTextToSpeech = async (value: boolean) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await setTextToSpeech(value);
  };
  
  // Handle reset preferences
  const handleResetPreferences = async () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('warning');
    }
    
    setShowResetConfirmation(true);
  };
  
  // Confirm reset preferences
  const confirmResetPreferences = async () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('success');
    }
    
    await resetPreferences();
    setShowResetConfirmation(false);
  };
  
  // Cancel reset preferences
  const cancelResetPreferences = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    setShowResetConfirmation(false);
  };
  
  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AppHeader
        title="Accessibility"
        showBack
        showMenu={false}
        showNotifications={false}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Display
        </ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
            Font Size
          </ThemedText>
          
          <ThemedView style={styles.fontSizeOptions}>
            <TouchableOpacity
              style={[
                styles.fontSizeOption,
                preferences.fontSize === 'small' && styles.selectedFontSizeOption,
              ]}
              onPress={() => handleFontSizeChange('small')}
              accessibilityLabel="Small font size"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'small' }}
            >
              <ThemedText style={styles.fontSizeSmall}>Aa</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.fontSizeOption,
                preferences.fontSize === 'medium' && styles.selectedFontSizeOption,
              ]}
              onPress={() => handleFontSizeChange('medium')}
              accessibilityLabel="Medium font size"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'medium' }}
            >
              <ThemedText style={styles.fontSizeMedium}>Aa</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.fontSizeOption,
                preferences.fontSize === 'large' && styles.selectedFontSizeOption,
              ]}
              onPress={() => handleFontSizeChange('large')}
              accessibilityLabel="Large font size"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'large' }}
            >
              <ThemedText style={styles.fontSizeLarge}>Aa</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.fontSizeOption,
                preferences.fontSize === 'extra-large' && styles.selectedFontSizeOption,
              ]}
              onPress={() => handleFontSizeChange('extra-large')}
              accessibilityLabel="Extra large font size"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'extra-large' }}
            >
              <ThemedText style={styles.fontSizeExtraLarge}>Aa</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <Divider style={styles.divider} />
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                High Contrast
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Increase contrast for better visibility
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.highContrast}
              onValueChange={handleToggleHighContrast}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.highContrast ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
          
          <Divider style={styles.divider} />
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                Reduce Motion
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Minimize animations throughout the app
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.reduceMotion}
              onValueChange={handleToggleReduceMotion}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.reduceMotion ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
        </ThemedView>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Interaction
        </ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                Haptic Feedback
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Vibration feedback when interacting with the app
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.hapticFeedback}
              onValueChange={handleToggleHapticFeedback}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.hapticFeedback ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
          
          <Divider style={styles.divider} />
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                Screen Reader Support
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Optimize app for screen readers
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.screenReaderEnabled}
              onValueChange={handleToggleScreenReader}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.screenReaderEnabled ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
          
          <Divider style={styles.divider} />
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                Voice Commands
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Navigate the app using voice commands
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.voiceCommands}
              onValueChange={handleToggleVoiceCommands}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.voiceCommands ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
          
          <Divider style={styles.divider} />
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                Text-to-Speech
              </ThemedText>
              
              <ThemedText style={styles.settingDescription}>
                Read text content aloud
              </ThemedText>
            </ThemedView>
            
            <Switch
              value={preferences.textToSpeech}
              onValueChange={handleToggleTextToSpeech}
              trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
              thumbColor={preferences.textToSpeech ? COLORS.primary.main : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </ThemedView>
        </ThemedView>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPreferences}
          accessibilityLabel="Reset accessibility settings"
          accessibilityRole="button"
        >
          <IconSymbol
            name="arrow.counterclockwise"
            size={20}
            color={COLORS.state.error}
            style={styles.resetIcon}
          />
          
          <ThemedText style={styles.resetText}>
            Reset to Default Settings
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
      
      {showResetConfirmation && (
        <ThemedView style={styles.confirmationOverlay}>
          <ThemedView style={styles.confirmationDialog}>
            <ThemedText type="subtitle" style={styles.confirmationTitle}>
              Reset Settings?
            </ThemedText>
            
            <ThemedText style={styles.confirmationText}>
              This will reset all accessibility settings to their default values.
            </ThemedText>
            
            <ThemedView style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelResetPreferences}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <ThemedText style={styles.cancelButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmResetPreferences}
                accessibilityLabel="Reset"
                accessibilityRole="button"
              >
                <ThemedText style={styles.confirmButtonText}>
                  Reset
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
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
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  fontSizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  fontSizeOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFontSizeOption: {
    backgroundColor: `${COLORS.primary.main}20`,
    borderWidth: 2,
    borderColor: COLORS.primary.main,
  },
  fontSizeSmall: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fontSizeMedium: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontSizeLarge: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  fontSizeExtraLarge: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: `${COLORS.state.error}10`,
    borderRadius: 8,
    marginBottom: 24,
  },
  resetIcon: {
    marginRight: 8,
  },
  resetText: {
    color: COLORS.state.error,
    fontWeight: '500',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationDialog: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmationTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: COLORS.state.error,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
