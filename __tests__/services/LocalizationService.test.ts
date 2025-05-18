import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import LocalizationService from '@/services/LocalizationService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  locale: 'en-US',
}));

describe('LocalizationService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getLocale', () => {
    it('should return the current locale', () => {
      const locale = LocalizationService.getLocale();
      expect(locale).toBeDefined();
      expect(typeof locale).toBe('string');
    });
  });

  describe('setLocale', () => {
    it('should set the locale and save it to AsyncStorage', async () => {
      const locale = 'fr';
      await LocalizationService.setLocale(locale);
      
      // Check if AsyncStorage.setItem was called with the correct parameters
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_locale', locale);
      
      // Check if the locale was set correctly
      expect(LocalizationService.getLocale()).toBe(locale);
    });

    it('should throw an error for unsupported locales', async () => {
      const unsupportedLocale = 'unsupported';
      
      await expect(LocalizationService.setLocale(unsupportedLocale)).rejects.toThrow();
      
      // Check that AsyncStorage.setItem was not called
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('translate', () => {
    it('should translate a simple key', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Test a simple translation
      const translation = LocalizationService.translate('common.app_name');
      expect(translation).toBe('AgriConnect');
    });

    it('should translate a key with interpolation', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Test a translation with interpolation
      const translation = LocalizationService.translate('auth.welcome_user', { name: 'John' });
      expect(translation).toContain('John');
    });

    it('should return the key if translation is not found', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Test a non-existent key
      const nonExistentKey = 'non.existent.key';
      const translation = LocalizationService.translate(nonExistentKey);
      expect(translation).toBe(nonExistentKey);
    });

    it('should switch languages correctly', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Get translation in English
      const enTranslation = LocalizationService.translate('common.save');
      expect(enTranslation).toBe('Save');
      
      // Switch to French
      LocalizationService.setLocale('fr');
      
      // Get translation in French
      const frTranslation = LocalizationService.translate('common.save');
      expect(frTranslation).toBe('Enregistrer');
    });
  });

  describe('formatDate', () => {
    it('should format a date according to the current locale', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Create a fixed date for testing
      const date = new Date(2023, 0, 15); // January 15, 2023
      
      // Format the date
      const formattedDate = LocalizationService.formatDate(date);
      
      // Check that the formatted date contains the expected parts
      expect(formattedDate).toContain('2023');
      expect(formattedDate).toContain('15');
    });
  });

  describe('formatNumber', () => {
    it('should format a number according to the current locale', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Format a number
      const formattedNumber = LocalizationService.formatNumber(1234.56);
      
      // Check that the formatted number is as expected
      expect(formattedNumber).toBe('1,234.56');
      
      // Switch to French
      LocalizationService.setLocale('fr');
      
      // Format the same number
      const formattedNumberFr = LocalizationService.formatNumber(1234.56);
      
      // Check that the formatted number is as expected in French
      expect(formattedNumberFr).toBe('1 234,56');
    });
  });

  describe('formatCurrency', () => {
    it('should format a currency amount according to the current locale', () => {
      // Set locale to English
      LocalizationService.setLocale('en');
      
      // Format a currency amount
      const formattedCurrency = LocalizationService.formatCurrency(1234.56, 'USD');
      
      // Check that the formatted currency is as expected
      expect(formattedCurrency).toContain('1,234.56');
      expect(formattedCurrency).toContain('$');
      
      // Switch to French
      LocalizationService.setLocale('fr');
      
      // Format the same currency amount
      const formattedCurrencyFr = LocalizationService.formatCurrency(1234.56, 'EUR');
      
      // Check that the formatted currency is as expected in French
      expect(formattedCurrencyFr).toContain('1 234,56');
      expect(formattedCurrencyFr).toContain('€');
    });
  });

  describe('isRTL', () => {
    it('should return false for LTR languages', () => {
      // Set locale to English (LTR)
      LocalizationService.setLocale('en');
      
      // Check if the language is RTL
      const isRtl = LocalizationService.isRTL();
      
      // English is not RTL
      expect(isRtl).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('should return "ltr" for LTR languages', () => {
      // Set locale to English (LTR)
      LocalizationService.setLocale('en');
      
      // Get the text direction
      const direction = LocalizationService.getTextDirection();
      
      // English uses LTR direction
      expect(direction).toBe('ltr');
    });
  });
});
