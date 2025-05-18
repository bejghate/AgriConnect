import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { APP_CONFIG } from '@/constants/Config';

// Import translations
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import ar from '@/locales/ar.json';
import sw from '@/locales/sw.json';
import ha from '@/locales/ha.json';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    region: 'Global'
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    region: 'West Africa'
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    region: 'North Africa'
  },
  sw: {
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    region: 'East Africa'
  },
  ha: {
    name: 'Hausa',
    nativeName: 'Hausa',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    region: 'West Africa'
  }
};

// Default language
export const DEFAULT_LANGUAGE = 'fr';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'agriconnect_language';

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
  ar,
  sw,
  ha,
});

// Localization service class
class LocalizationService {
  private isInitialized: boolean = false;
  private currentLocale: string = DEFAULT_LANGUAGE;

  // Initialize the localization service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up i18n
      i18n.enableFallback = true;
      i18n.defaultLocale = DEFAULT_LANGUAGE;

      // Get stored language preference
      const storedLanguage = await this.getStoredLanguage();

      if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
        // Use stored language preference
        this.currentLocale = storedLanguage;
      } else {
        // Detect device language
        this.currentLocale = await this.detectDeviceLanguage();
      }

      // Set the locale
      i18n.locale = this.currentLocale;

      // Update app store
      const { settings } = useAppStore.getState();
      useAppStore.getState().updateSettings({
        ...settings,
        language: this.currentLocale as any,
      });

      this.isInitialized = true;
      console.log(`Localization initialized with locale: ${this.currentLocale}`);
    } catch (error) {
      console.error('Error initializing localization:', error);

      // Fall back to default language
      this.currentLocale = DEFAULT_LANGUAGE;
      i18n.locale = DEFAULT_LANGUAGE;

      throw error;
    }
  }

  // Get stored language preference
  private async getStoredLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting stored language:', error);
      return null;
    }
  }

  // Store language preference
  private async storeLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error storing language:', error);
    }
  }

  // Detect device language
  private async detectDeviceLanguage(): Promise<string> {
    try {
      // Get device locale
      const deviceLocale = Localization.locale;

      // Extract language code (e.g., 'en-US' -> 'en')
      const languageCode = deviceLocale.split('-')[0];

      // Check if the language is supported
      if (this.isLanguageSupported(languageCode)) {
        return languageCode;
      }

      // Fall back to default language
      return DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Error detecting device language:', error);
      return DEFAULT_LANGUAGE;
    }
  }

  // Check if a language is supported
  private isLanguageSupported(language: string): boolean {
    return Object.keys(SUPPORTED_LANGUAGES).includes(language);
  }

  // Get the device locale without checking if it's supported
  async getDeviceLocale(): Promise<string> {
    try {
      // Get device locale
      const deviceLocale = Localization.locale;

      // Extract language code (e.g., 'en-US' -> 'en')
      return deviceLocale.split('-')[0];
    } catch (error) {
      console.error('Error getting device locale:', error);
      return DEFAULT_LANGUAGE;
    }
  }

  // Get the current locale
  getLocale(): string {
    return this.currentLocale;
  }

  // Set the locale
  async setLocale(locale: string): Promise<void> {
    if (!this.isLanguageSupported(locale)) {
      console.warn(`Language ${locale} is not supported`);
      return;
    }

    try {
      // Update locale
      this.currentLocale = locale;
      i18n.locale = locale;

      // Store language preference
      await this.storeLanguage(locale);

      // Update app store
      const { settings } = useAppStore.getState();
      useAppStore.getState().updateSettings({
        ...settings,
        language: locale as any,
      });

      console.log(`Locale set to: ${locale}`);
    } catch (error) {
      console.error('Error setting locale:', error);
      throw error;
    }
  }

  // Get all supported languages
  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }

  // Translate a key
  translate(key: string, options?: object): string {
    return i18n.t(key, options);
  }

  // Format a date according to the current locale
  formatDate(date: Date, format?: string): string {
    const locale = this.currentLocale;
    const dateFormat = format || SUPPORTED_LANGUAGES[locale]?.dateFormat || 'MM/DD/YYYY';

    // In a real app, we would use a proper date formatting library like date-fns or moment
    // For simplicity, we'll use a basic implementation here
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    let formattedDate = dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString());

    return formattedDate;
  }

  // Format a time according to the current locale
  formatTime(date: Date, format?: string): string {
    const locale = this.currentLocale;
    const timeFormat = format || SUPPORTED_LANGUAGES[locale]?.timeFormat || 'h:mm A';

    // In a real app, we would use a proper date formatting library like date-fns or moment
    // For simplicity, we'll use a basic implementation here
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours24 < 12 ? 'AM' : 'PM';

    let formattedTime = timeFormat
      .replace('HH', hours24.toString().padStart(2, '0'))
      .replace('h', hours12.toString())
      .replace('mm', minutes)
      .replace('A', ampm);

    return formattedTime;
  }

  // Format a number according to the current locale
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.currentLocale;

    return new Intl.NumberFormat(locale, options).format(number);
  }

  // Format a currency according to the current locale
  formatCurrency(amount: number, currency: string = 'XOF'): string {
    const locale = this.currentLocale;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Get the text direction for the current locale
  getTextDirection(): 'ltr' | 'rtl' {
    const locale = this.currentLocale;
    return SUPPORTED_LANGUAGES[locale]?.direction || 'ltr';
  }

  // Check if the current locale is RTL
  isRTL(): boolean {
    return this.getTextDirection() === 'rtl';
  }

  // Get a localized string with pluralization
  pluralize(key: string, count: number, options?: object): string {
    return i18n.t(key, { count, ...options });
  }

  // Get a list of localized month names
  getMonthNames(format: 'long' | 'short' = 'long'): string[] {
    const locale = this.currentLocale;
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(2000, i, 1);
      months.push(
        date.toLocaleDateString(locale, { month: format })
      );
    }

    return months;
  }

  // Get a list of localized day names
  getDayNames(format: 'long' | 'short' = 'long'): string[] {
    const locale = this.currentLocale;
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(2000, 0, 2 + i); // January 2, 2000 was a Sunday
      days.push(
        date.toLocaleDateString(locale, { weekday: format })
      );
    }

    return days;
  }
}

// Export a singleton instance
export default new LocalizationService();

// Export the translate function for convenience
export const t = (key: string, options?: object): string => {
  return i18n.t(key, options);
};
