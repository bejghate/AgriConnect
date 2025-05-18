import React from 'react';
import { render } from '@testing-library/react-native';
import { TranslatedText, T } from '@/components/TranslatedText';
import LocalizationService from '@/services/LocalizationService';

// Mock LocalizationService
jest.mock('@/services/LocalizationService', () => ({
  translate: jest.fn(),
  getLocale: jest.fn(),
}));

describe('TranslatedText', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation
    (LocalizationService.translate as jest.Mock).mockImplementation((key, values) => {
      if (key === 'test.key') return 'Translated Text';
      if (key === 'test.interpolation') return `Hello, ${values?.name}`;
      return key;
    });
    
    (LocalizationService.getLocale as jest.Mock).mockReturnValue('en');
  });

  it('renders correctly with a simple key', () => {
    const { getByText } = render(<TranslatedText i18nKey="test.key" />);
    
    // Check that the component renders the translated text
    expect(getByText('Translated Text')).toBeTruthy();
    
    // Check that LocalizationService.translate was called with the correct parameters
    expect(LocalizationService.translate).toHaveBeenCalledWith('test.key', undefined);
  });

  it('renders correctly with interpolation values', () => {
    const { getByText } = render(
      <TranslatedText i18nKey="test.interpolation" values={{ name: 'John' }} />
    );
    
    // Check that the component renders the translated text with interpolation
    expect(getByText('Hello, John')).toBeTruthy();
    
    // Check that LocalizationService.translate was called with the correct parameters
    expect(LocalizationService.translate).toHaveBeenCalledWith('test.interpolation', { name: 'John' });
  });

  it('renders the fallback text when translation is not found', () => {
    const { getByText } = render(
      <TranslatedText i18nKey="non.existent.key" fallback="Fallback Text" />
    );
    
    // Check that the component renders the fallback text
    expect(getByText('Fallback Text')).toBeTruthy();
  });

  it('renders the key when translation and fallback are not found', () => {
    const { getByText } = render(
      <TranslatedText i18nKey="non.existent.key" />
    );
    
    // Check that the component renders the key itself
    expect(getByText('non.existent.key')).toBeTruthy();
  });

  it('applies the correct text type', () => {
    const { getByTestId } = render(
      <TranslatedText i18nKey="test.key" type="title" testID="translated-text" />
    );
    
    // Get the component
    const component = getByTestId('translated-text');
    
    // Check that the component has the correct type prop
    expect(component.props.type).toBe('title');
  });

  it('passes other props to ThemedText', () => {
    const { getByTestId } = render(
      <TranslatedText 
        i18nKey="test.key" 
        testID="translated-text"
        style={{ fontSize: 16 }}
        numberOfLines={2}
      />
    );
    
    // Get the component
    const component = getByTestId('translated-text');
    
    // Check that the component has the correct props
    expect(component.props.style).toEqual(expect.objectContaining({ fontSize: 16 }));
    expect(component.props.numberOfLines).toBe(2);
  });

  describe('T component', () => {
    it('renders correctly as a shorthand for TranslatedText', () => {
      const { getByText } = render(<T i18nKey="test.key" />);
      
      // Check that the component renders the translated text
      expect(getByText('Translated Text')).toBeTruthy();
      
      // Check that LocalizationService.translate was called with the correct parameters
      expect(LocalizationService.translate).toHaveBeenCalledWith('test.key', undefined);
    });
  });
});
