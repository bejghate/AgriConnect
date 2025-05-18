import { useCallback, useEffect, useState } from 'react';
import LocalizationService, { SUPPORTED_LANGUAGES } from '@/services/LocalizationService';
import { useAppStore } from '@/store/useAppStore';

/**
 * Hook for using translations in functional components.
 * 
 * @returns An object with translation functions and language utilities
 */
export const useTranslation = () => {
  const { settings } = useAppStore();
  const [currentLocale, setCurrentLocale] = useState(settings.language || LocalizationService.getLocale());
  
  // Update the current locale when the app settings change
  useEffect(() => {
    if (settings.language && settings.language !== currentLocale) {
      setCurrentLocale(settings.language);
    }
  }, [settings.language, currentLocale]);
  
  /**
   * Translate a key with optional interpolation values
   * 
   * @param key The translation key
   * @param values Optional values to interpolate
   * @returns The translated string
   */
  const t = useCallback((key: string, values?: Record<string, any>): string => {
    return LocalizationService.translate(key, values);
  }, [currentLocale]);
  
  /**
   * Format a date according to the current locale
   * 
   * @param date The date to format
   * @param options Optional Intl.DateTimeFormatOptions
   * @returns The formatted date string
   */
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return LocalizationService.formatDate(date, options);
  }, [currentLocale]);
  
  /**
   * Format a number according to the current locale
   * 
   * @param number The number to format
   * @param options Optional Intl.NumberFormatOptions
   * @returns The formatted number string
   */
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
    return LocalizationService.formatNumber(number, options);
  }, [currentLocale]);
  
  /**
   * Format a currency amount according to the current locale
   * 
   * @param amount The amount to format
   * @param currencyCode The currency code (e.g., 'USD', 'EUR')
   * @returns The formatted currency string
   */
  const formatCurrency = useCallback((amount: number, currencyCode: string = 'USD'): string => {
    return LocalizationService.formatCurrency(amount, currencyCode);
  }, [currentLocale]);
  
  /**
   * Check if the current language is RTL
   * 
   * @returns True if the current language is RTL
   */
  const isRTL = useCallback((): boolean => {
    return LocalizationService.isRTL();
  }, [currentLocale]);
  
  /**
   * Get the text direction for the current language
   * 
   * @returns 'rtl' or 'ltr'
   */
  const getTextDirection = useCallback((): 'rtl' | 'ltr' => {
    return LocalizationService.getTextDirection();
  }, [currentLocale]);
  
  /**
   * Get details about the current language
   * 
   * @returns Language details object
   */
  const getCurrentLanguage = useCallback(() => {
    return SUPPORTED_LANGUAGES[currentLocale] || SUPPORTED_LANGUAGES.en;
  }, [currentLocale]);
  
  /**
   * Get a list of all supported languages
   * 
   * @returns Array of language details
   */
  const getSupportedLanguages = useCallback(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, details]) => ({
      code,
      ...details
    }));
  }, []);
  
  /**
   * Change the current language
   * 
   * @param locale The locale code to change to
   * @returns A promise that resolves when the language is changed
   */
  const changeLanguage = useCallback(async (locale: string): Promise<void> => {
    await LocalizationService.setLocale(locale);
    setCurrentLocale(locale);
  }, []);
  
  return {
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL,
    getTextDirection,
    currentLocale,
    getCurrentLanguage,
    getSupportedLanguages,
    changeLanguage
  };
};
