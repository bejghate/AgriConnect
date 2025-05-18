import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider, RadioButton } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { TranslatedText, T } from '@/components/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import LocalizationService, { SUPPORTED_LANGUAGES } from '@/services/LocalizationService';
import { useAppStore } from '@/store/useAppStore';

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();
  const { t, currentLocale, getSupportedLanguages, changeLanguage } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language || currentLocale);
  const [languages, setLanguages] = useState(getSupportedLanguages());

  // Load current language
  useEffect(() => {
    const loadLanguage = async () => {
      setIsLoading(true);
      try {
        const currentLocale = LocalizationService.getLocale();
        setSelectedLanguage(currentLocale);
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Handle language selection
  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setIsLoading(true);
      setSelectedLanguage(languageCode);

      // Update language using the hook
      await changeLanguage(languageCode);

      // Update app settings
      updateSettings({
        ...settings,
        language: languageCode as any,
      });

      // Show success message or navigate back
      setTimeout(() => {
        setIsLoading(false);
        router.back();
      }, 500);
    } catch (error) {
      console.error('Error setting language:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <TranslatedText style={styles.loadingText} i18nKey="settings.loading" fallback="Loading language settings..." />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SettingsHeader title={t('common.language_settings')} />

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.section}>
          <TranslatedText type="subtitle" style={styles.sectionTitle} i18nKey="settings.select_app_language" fallback="Select Language" />

          <TranslatedText style={styles.sectionDescription} i18nKey="settings.language_description" fallback="Choose your preferred language for the app interface. This will change all text in the application." />

          <View style={styles.languageList}>
            {languages.map(([code, details]) => (
              <TouchableOpacity
                key={code}
                style={styles.languageItem}
                onPress={() => handleLanguageSelect(code)}
                accessibilityLabel={`Select ${details.name} language`}
                accessibilityHint={`Changes the app language to ${details.name}`}
              >
                <View style={styles.languageInfo}>
                  <ThemedText style={styles.languageFlag}>{details.direction === 'rtl' ? '🔄 ' : ''}{code === 'en' ? '🇬🇧' : code === 'fr' ? '🇫🇷' : code === 'ar' ? '🇪🇬' : code === 'sw' ? '🇹🇿' : code === 'ha' ? '🇳🇬' : '🌍'}</ThemedText>
                  <View style={styles.languageTextContainer}>
                    <ThemedText style={styles.languageName}>{details.name}</ThemedText>
                    <ThemedText style={styles.languageNativeName}>{details.nativeName}</ThemedText>
                  </View>
                </View>
                <RadioButton
                  value={code}
                  status={selectedLanguage === code ? 'checked' : 'unchecked'}
                  onPress={() => handleLanguageSelect(code)}
                  color={COLORS.primary.main}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <TranslatedText type="subtitle" style={styles.sectionTitle} i18nKey="settings.language_info" fallback="Language Information" />

          <View style={styles.infoItem}>
            <IconSymbol name="info.circle.fill" size={20} color={COLORS.primary.main} style={styles.infoIcon} />
            <TranslatedText style={styles.infoText} i18nKey="settings.language_info_description" fallback="AgriConnect is available in multiple languages. If you notice any translation errors, please report them to us." />
          </View>

          <View style={styles.infoItem}>
            <IconSymbol name="arrow.2.circlepath" size={20} color={COLORS.primary.main} style={styles.infoIcon} />
            <TranslatedText style={styles.infoText} i18nKey="settings.restart_required_description" fallback="You may need to restart the app for all changes to take effect." />
          </View>

          <View style={styles.infoItem}>
            <IconSymbol name="globe" size={20} color={COLORS.primary.main} style={styles.infoIcon} />
            <ThemedText style={styles.infoText}>
              {t('settings.supported_languages')}: {languages.map(lang => lang.name).join(', ')}
            </ThemedText>
          </View>
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
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
  languageList: {
    marginTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
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
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
