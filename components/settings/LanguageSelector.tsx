import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, FlatList, ActivityIndicator, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';
import LocalizationService, { SUPPORTED_LANGUAGES } from '@/services/LocalizationService';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/services/LocalizationService';

interface LanguageSelectorProps {
  compact?: boolean;
  showLabel?: boolean;
  onLanguageChange?: (languageCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  showLabel = true,
  onLanguageChange,
}) => {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language || 'fr');
  const [modalVisible, setModalVisible] = useState(false);
  const [languages, setLanguages] = useState(Object.entries(SUPPORTED_LANGUAGES));

  // Get language details
  const getLanguageDetails = (code: string) => {
    return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
  };

  // Get language flag emoji
  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'en': return '🇬🇧';
      case 'fr': return '🇫🇷';
      case 'ar': return '🇪🇬';
      case 'sw': return '🇹🇿';
      case 'ha': return '🇳🇬';
      default: return '🌍';
    }
  };

  // Handle language selection
  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setIsLoading(true);
      setSelectedLanguage(languageCode);
      setModalVisible(false);

      // Get language details
      const langDetails = SUPPORTED_LANGUAGES[languageCode];
      const isRTL = langDetails?.direction === 'rtl';

      // Update RTL setting if needed
      if (isRTL !== I18nManager.isRTL) {
        // This will trigger a reload of the app
        I18nManager.forceRTL(isRTL);
      }

      // Update language in the service
      await LocalizationService.setLocale(languageCode);

      // Update app settings
      updateSettings({
        ...settings,
        language: languageCode as any,
      });

      // Call the callback if provided
      if (onLanguageChange) {
        onLanguageChange(languageCode);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error setting language:', error);
      setIsLoading(false);
    }
  };

  // Navigate to language settings
  const navigateToLanguageSettings = () => {
    setModalVisible(false);
    router.push('/settings/language');
  };

  // Render language item
  const renderLanguageItem = ({ item }: { item: [string, typeof SUPPORTED_LANGUAGES.en] }) => {
    const [code, details] = item;
    const isSelected = code === selectedLanguage;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageSelect(code)}
        accessibilityLabel={`Select ${details.name} language`}
        accessibilityHint={`Changes the app language to ${details.name}`}
      >
        <View style={styles.languageInfo}>
          <ThemedText style={styles.languageFlag}>
            {details.direction === 'rtl' ? '🔄 ' : ''}{getLanguageFlag(code)}
          </ThemedText>
          <View style={styles.languageTextContainer}>
            <ThemedText style={[styles.languageName, isSelected && styles.selectedText]}>
              {details.name}
            </ThemedText>
            <ThemedText style={[styles.languageNativeName, isSelected && styles.selectedText]}>
              {details.nativeName}
            </ThemedText>
          </View>
        </View>
        {isSelected && (
          <IconSymbol name="checkmark" size={20} color={COLORS.primary.main} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, compact && styles.compactButton]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Language selector"
        accessibilityHint="Opens language selection menu"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary.main} />
        ) : (
          <>
            <ThemedText style={styles.languageFlag}>
              {getLanguageFlag(selectedLanguage)}
            </ThemedText>
            {showLabel && (
              <ThemedText style={styles.selectorText}>
                {getLanguageDetails(selectedLanguage).name}
              </ThemedText>
            )}
            <IconSymbol name="chevron.down" size={16} color="#757575" style={styles.selectorIcon} />
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {t('common.select_language')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close language selector"
                accessibilityHint="Closes the language selection menu"
              >
                <IconSymbol name="xmark" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={([code]) => code}
              style={styles.languageList}
            />

            <TouchableOpacity
              style={styles.moreOptionsButton}
              onPress={navigateToLanguageSettings}
              accessibilityLabel="More language options"
              accessibilityHint="Navigate to language settings screen"
            >
              <IconSymbol name="gear" size={20} color={COLORS.primary.main} style={styles.moreOptionsIcon} />
              <ThemedText style={styles.moreOptionsText}>
                {t('common.more_options')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compactButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectorText: {
    fontSize: 14,
    marginLeft: 8,
  },
  selectorIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    backgroundColor: `${COLORS.primary.main}20`,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageNativeName: {
    fontSize: 14,
    color: '#757575',
  },
  selectedText: {
    color: COLORS.primary.main,
  },
  moreOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  moreOptionsIcon: {
    marginRight: 8,
  },
  moreOptionsText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
});
