import React from 'react';
import { TextProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import LocalizationService from '@/services/LocalizationService';

interface TranslatedTextProps extends TextProps {
  i18nKey: string;
  values?: Record<string, any>;
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'error' | 'success' | 'warning' | 'info';
  fallback?: string;
}

/**
 * A component that renders translated text using the i18n system.
 * 
 * @param i18nKey The key to look up in the translation files
 * @param values Optional values to interpolate into the translation
 * @param type The type of text styling to apply
 * @param fallback Optional fallback text if the key is not found
 * @param props Other text props
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  values,
  type = 'default',
  fallback,
  ...props
}) => {
  // Get the translated text
  const translatedText = LocalizationService.translate(i18nKey, values) || fallback || i18nKey;
  
  return (
    <ThemedText type={type} {...props}>
      {translatedText}
    </ThemedText>
  );
};

/**
 * A shorthand component for translated text with default styling.
 */
export const T: React.FC<TranslatedTextProps> = (props) => {
  return <TranslatedText {...props} />;
};
