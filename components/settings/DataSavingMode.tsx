import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { COLORS } from '@/constants/Theme';

// Storage keys
const DATA_SAVING_ENABLED_KEY = 'data_saving_enabled';
const DATA_SAVING_SETTINGS_KEY = 'data_saving_settings';

// Default settings
const DEFAULT_SETTINGS = {
  lowResImages: true,
  deferNonEssentialContent: true,
  preloadFrequentContent: true,
  reducedAnimations: true,
  compressData: true,
  bandwidthLimit: false,
  bandwidthLimitValue: 50, // MB
};

// Data saving settings interface
export interface DataSavingSettings {
  lowResImages: boolean;
  deferNonEssentialContent: boolean;
  preloadFrequentContent: boolean;
  reducedAnimations: boolean;
  compressData: boolean;
  bandwidthLimit: boolean;
  bandwidthLimitValue: number;
}

// Context for data saving mode
export const DataSavingContext = React.createContext<{
  isEnabled: boolean;
  settings: DataSavingSettings;
  toggleDataSaving: () => Promise<void>;
  updateSettings: (settings: Partial<DataSavingSettings>) => Promise<void>;
}>({
  isEnabled: false,
  settings: DEFAULT_SETTINGS,
  toggleDataSaving: async () => {},
  updateSettings: async () => {},
});

// Hook to use data saving context
export const useDataSaving = () => React.useContext(DataSavingContext);

// Props for DataSavingProvider
interface DataSavingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for data saving mode
 */
export const DataSavingProvider: React.FC<DataSavingProviderProps> = ({ children }) => {
  // State
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [settings, setSettings] = useState<DataSavingSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load data saving state from storage
  useEffect(() => {
    const loadDataSavingState = async () => {
      try {
        // Load data saving enabled status
        const enabledValue = await AsyncStorage.getItem(DATA_SAVING_ENABLED_KEY);
        const isEnabledValue = enabledValue === 'true';
        setIsEnabled(isEnabledValue);
        
        // Load data saving settings
        const settingsValue = await AsyncStorage.getItem(DATA_SAVING_SETTINGS_KEY);
        const settingsObject = settingsValue ? JSON.parse(settingsValue) : DEFAULT_SETTINGS;
        setSettings(settingsObject);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data saving state:', error);
        setIsLoading(false);
      }
    };
    
    loadDataSavingState();
  }, []);
  
  // Toggle data saving mode
  const toggleDataSaving = async () => {
    try {
      const newValue = !isEnabled;
      await AsyncStorage.setItem(DATA_SAVING_ENABLED_KEY, newValue.toString());
      setIsEnabled(newValue);
    } catch (error) {
      console.error('Error toggling data saving mode:', error);
    }
  };
  
  // Update data saving settings
  const updateSettings = async (newSettings: Partial<DataSavingSettings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      
      await AsyncStorage.setItem(DATA_SAVING_SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating data saving settings:', error);
    }
  };
  
  // Context value
  const contextValue = {
    isEnabled,
    settings,
    toggleDataSaving,
    updateSettings,
  };
  
  if (isLoading) {
    return <>{children}</>;
  }
  
  return (
    <DataSavingContext.Provider value={contextValue}>
      {children}
    </DataSavingContext.Provider>
  );
};

// Props for DataSavingModal
interface DataSavingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Modal component for data saving settings
 */
export const DataSavingModal: React.FC<DataSavingModalProps> = ({
  isVisible,
  onClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isEnabled, settings, toggleDataSaving, updateSettings } = useDataSaving();
  const { preferences, triggerHaptic } = useAccessibilityContext();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  
  // Animation when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Trigger haptic feedback
      if (preferences.hapticFeedback) {
        triggerHaptic('light');
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);
  
  // Handle toggle data saving
  const handleToggleDataSaving = async () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await toggleDataSaving();
  };
  
  // Handle toggle setting
  const handleToggleSetting = async (key: keyof DataSavingSettings) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    await updateSettings({
      [key]: !settings[key],
    });
  };
  
  // Handle close
  const handleClose = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    onClose();
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Data Saving Mode
            </ThemedText>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close data saving settings"
              accessibilityRole="button"
            >
              <IconSymbol name="xmark" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.mainToggleContainer}>
              <ThemedView style={styles.mainToggleContent}>
                <IconSymbol
                  name="speedometer"
                  size={24}
                  color={isEnabled ? COLORS.primary.main : theme.colors.onSurfaceVariant}
                  style={styles.mainToggleIcon}
                />
                
                <ThemedView style={styles.mainToggleTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.mainToggleTitle}>
                    Data Saving Mode
                  </ThemedText>
                  
                  <ThemedText style={styles.mainToggleDescription}>
                    Reduce data usage by optimizing content loading and display
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <Switch
                value={isEnabled}
                onValueChange={handleToggleDataSaving}
                trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                thumbColor={isEnabled ? COLORS.primary.main : '#f5f5f5'}
                ios_backgroundColor="#e0e0e0"
              />
            </ThemedView>
            
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Settings
            </ThemedText>
            
            <ThemedView style={styles.settingsList}>
              <ThemedView style={styles.settingItem}>
                <ThemedView style={styles.settingTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                    Low Resolution Images
                  </ThemedText>
                  
                  <ThemedText style={styles.settingDescription}>
                    Display images in lower resolution to reduce data usage
                  </ThemedText>
                </ThemedView>
                
                <Switch
                  value={settings.lowResImages}
                  onValueChange={() => handleToggleSetting('lowResImages')}
                  trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                  thumbColor={settings.lowResImages ? COLORS.primary.main : '#f5f5f5'}
                  ios_backgroundColor="#e0e0e0"
                  disabled={!isEnabled}
                />
              </ThemedView>
              
              <ThemedView style={styles.settingItem}>
                <ThemedView style={styles.settingTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                    Defer Non-Essential Content
                  </ThemedText>
                  
                  <ThemedText style={styles.settingDescription}>
                    Load non-essential content only when needed
                  </ThemedText>
                </ThemedView>
                
                <Switch
                  value={settings.deferNonEssentialContent}
                  onValueChange={() => handleToggleSetting('deferNonEssentialContent')}
                  trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                  thumbColor={settings.deferNonEssentialContent ? COLORS.primary.main : '#f5f5f5'}
                  ios_backgroundColor="#e0e0e0"
                  disabled={!isEnabled}
                />
              </ThemedView>
              
              <ThemedView style={styles.settingItem}>
                <ThemedView style={styles.settingTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                    Preload Frequent Content
                  </ThemedText>
                  
                  <ThemedText style={styles.settingDescription}>
                    Preload frequently accessed content for faster access
                  </ThemedText>
                </ThemedView>
                
                <Switch
                  value={settings.preloadFrequentContent}
                  onValueChange={() => handleToggleSetting('preloadFrequentContent')}
                  trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                  thumbColor={settings.preloadFrequentContent ? COLORS.primary.main : '#f5f5f5'}
                  ios_backgroundColor="#e0e0e0"
                  disabled={!isEnabled}
                />
              </ThemedView>
              
              <ThemedView style={styles.settingItem}>
                <ThemedView style={styles.settingTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                    Reduced Animations
                  </ThemedText>
                  
                  <ThemedText style={styles.settingDescription}>
                    Minimize animations to improve performance
                  </ThemedText>
                </ThemedView>
                
                <Switch
                  value={settings.reducedAnimations}
                  onValueChange={() => handleToggleSetting('reducedAnimations')}
                  trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                  thumbColor={settings.reducedAnimations ? COLORS.primary.main : '#f5f5f5'}
                  ios_backgroundColor="#e0e0e0"
                  disabled={!isEnabled}
                />
              </ThemedView>
              
              <ThemedView style={styles.settingItem}>
                <ThemedView style={styles.settingTextContent}>
                  <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                    Compress Data
                  </ThemedText>
                  
                  <ThemedText style={styles.settingDescription}>
                    Compress data transfers to reduce bandwidth usage
                  </ThemedText>
                </ThemedView>
                
                <Switch
                  value={settings.compressData}
                  onValueChange={() => handleToggleSetting('compressData')}
                  trackColor={{ false: '#e0e0e0', true: `${COLORS.primary.main}50` }}
                  thumbColor={settings.compressData ? COLORS.primary.main : '#f5f5f5'}
                  ios_backgroundColor="#e0e0e0"
                  disabled={!isEnabled}
                />
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  mainToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  mainToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainToggleIcon: {
    marginRight: 16,
  },
  mainToggleTextContent: {
    flex: 1,
  },
  mainToggleTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  mainToggleDescription: {
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  settingTextContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#757575',
  },
});

export default DataSavingProvider;
