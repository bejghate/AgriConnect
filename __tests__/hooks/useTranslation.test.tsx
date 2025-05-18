import { renderHook, act } from '@testing-library/react-hooks';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizationService from '@/services/LocalizationService';
import { useAppStore } from '@/store/useAppStore';

// Mock dependencies
jest.mock('@/services/LocalizationService', () => ({
  translate: jest.fn(),
  formatDate: jest.fn(),
  formatTime: jest.fn(),
  formatNumber: jest.fn(),
  formatCurrency: jest.fn(),
  isRTL: jest.fn(),
  getTextDirection: jest.fn(),
  getLocale: jest.fn(),
  setLocale: jest.fn(),
  getSupportedLanguages: jest.fn(),
  getMonthNames: jest.fn(),
  getDayNames: jest.fn(),
  pluralize: jest.fn(),
}));

jest.mock('@/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

describe('useTranslation', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    (LocalizationService.translate as jest.Mock).mockImplementation((key) => `Translated: ${key}`);
    (LocalizationService.formatDate as jest.Mock).mockImplementation((date) => `Formatted date: ${date.toISOString()}`);
    (LocalizationService.formatTime as jest.Mock).mockImplementation((date) => `Formatted time: ${date.toISOString()}`);
    (LocalizationService.formatNumber as jest.Mock).mockImplementation((number) => `Formatted number: ${number}`);
    (LocalizationService.formatCurrency as jest.Mock).mockImplementation((amount, currency) => `Formatted currency: ${amount} ${currency}`);
    (LocalizationService.isRTL as jest.Mock).mockReturnValue(false);
    (LocalizationService.getTextDirection as jest.Mock).mockReturnValue('ltr');
    (LocalizationService.getLocale as jest.Mock).mockReturnValue('en');
    (LocalizationService.getSupportedLanguages as jest.Mock).mockReturnValue({
      en: { name: 'English', nativeName: 'English' },
      fr: { name: 'French', nativeName: 'Français' },
    });
    (LocalizationService.getMonthNames as jest.Mock).mockReturnValue(['January', 'February']);
    (LocalizationService.getDayNames as jest.Mock).mockReturnValue(['Sunday', 'Monday']);
    (LocalizationService.pluralize as jest.Mock).mockImplementation((key, count) => `Pluralized: ${key} (${count})`);
    
    // Mock useAppStore
    (useAppStore as jest.Mock).mockReturnValue({
      settings: {
        language: 'en',
      },
      updateSettings: jest.fn(),
    });
  });

  it('should return translation functions and language utilities', () => {
    const { result } = renderHook(() => useTranslation());
    
    // Check that all expected functions and values are returned
    expect(result.current.t).toBeDefined();
    expect(result.current.formatDate).toBeDefined();
    expect(result.current.formatTime).toBeDefined();
    expect(result.current.formatNumber).toBeDefined();
    expect(result.current.formatCurrency).toBeDefined();
    expect(result.current.isRTL).toBeDefined();
    expect(result.current.getTextDirection).toBeDefined();
    expect(result.current.currentLocale).toBeDefined();
    expect(result.current.getCurrentLanguage).toBeDefined();
    expect(result.current.getSupportedLanguages).toBeDefined();
    expect(result.current.changeLanguage).toBeDefined();
    expect(result.current.getMonthNames).toBeDefined();
    expect(result.current.getDayNames).toBeDefined();
    expect(result.current.pluralize).toBeDefined();
  });

  it('should translate a key using the t function', () => {
    const { result } = renderHook(() => useTranslation());
    
    // Call the t function
    const translation = result.current.t('test.key');
    
    // Check that LocalizationService.translate was called with the correct parameters
    expect(LocalizationService.translate).toHaveBeenCalledWith('test.key', undefined);
    
    // Check that the translation is correct
    expect(translation).toBe('Translated: test.key');
  });

  it('should format a date using the formatDate function', () => {
    const { result } = renderHook(() => useTranslation());
    
    // Create a date for testing
    const date = new Date(2023, 0, 15); // January 15, 2023
    
    // Call the formatDate function
    const formattedDate = result.current.formatDate(date);
    
    // Check that LocalizationService.formatDate was called with the correct parameters
    expect(LocalizationService.formatDate).toHaveBeenCalledWith(date, undefined);
    
    // Check that the formatted date is correct
    expect(formattedDate).toBe(`Formatted date: ${date.toISOString()}`);
  });

  it('should change the language using the changeLanguage function', async () => {
    const { result } = renderHook(() => useTranslation());
    
    // Initial locale should be 'en'
    expect(result.current.currentLocale).toBe('en');
    
    // Change the language to 'fr'
    await act(async () => {
      await result.current.changeLanguage('fr');
    });
    
    // Check that LocalizationService.setLocale was called with the correct parameters
    expect(LocalizationService.setLocale).toHaveBeenCalledWith('fr');
    
    // Current locale should now be 'fr'
    expect(result.current.currentLocale).toBe('fr');
  });

  it('should get supported languages using the getSupportedLanguages function', () => {
    const { result } = renderHook(() => useTranslation());
    
    // Call the getSupportedLanguages function
    const languages = result.current.getSupportedLanguages();
    
    // Check that LocalizationService.getSupportedLanguages was called
    expect(LocalizationService.getSupportedLanguages).toHaveBeenCalled();
    
    // Check that the languages are correct
    expect(languages).toEqual([
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
    ]);
  });

  it('should get the current language using the getCurrentLanguage function', () => {
    const { result } = renderHook(() => useTranslation());
    
    // Call the getCurrentLanguage function
    const language = result.current.getCurrentLanguage();
    
    // Check that the language is correct
    expect(language).toEqual({ name: 'English', nativeName: 'English' });
  });

  it('should update currentLocale when settings.language changes', () => {
    // Initial settings
    (useAppStore as jest.Mock).mockReturnValue({
      settings: {
        language: 'en',
      },
      updateSettings: jest.fn(),
    });
    
    const { result, rerender } = renderHook(() => useTranslation());
    
    // Initial locale should be 'en'
    expect(result.current.currentLocale).toBe('en');
    
    // Update settings to change language to 'fr'
    (useAppStore as jest.Mock).mockReturnValue({
      settings: {
        language: 'fr',
      },
      updateSettings: jest.fn(),
    });
    
    // Rerender the hook
    rerender();
    
    // Current locale should now be 'fr'
    expect(result.current.currentLocale).toBe('fr');
  });
});
