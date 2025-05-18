import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import useResponsive from '@/hooks/useResponsive';
import { useAccessibility, FontSizeType } from '@/hooks/useAccessibility';
import { FONT_SIZES, moderateScale } from '@/constants/Layout';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  sizes?: {
    small?: number;
    medium?: number;
    large?: number;
    tablet?: number;
  };
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  sizes,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { screenSize } = useResponsive();
  const { preferences } = useAccessibility();

  // Obtenir la taille de base en fonction du type
  let baseSize = FONT_SIZES.MEDIUM;
  switch (type) {
    case 'title':
      baseSize = FONT_SIZES.TITLE;
      break;
    case 'subtitle':
      baseSize = FONT_SIZES.XLARGE;
      break;
    case 'default':
    case 'defaultSemiBold':
      baseSize = FONT_SIZES.MEDIUM;
      break;
    case 'link':
      baseSize = FONT_SIZES.MEDIUM;
      break;
  }

  // Déterminer la taille de la police en fonction de la taille de l'écran
  let fontSize = baseSize;

  if (sizes) {
    switch (screenSize) {
      case 'small':
        fontSize = sizes.small ? moderateScale(sizes.small) : baseSize;
        break;
      case 'medium':
        fontSize = sizes.medium ? moderateScale(sizes.medium) : baseSize;
        break;
      case 'large':
        fontSize = sizes.large ? moderateScale(sizes.large) : baseSize;
        break;
      case 'tablet':
        fontSize = sizes.tablet ? moderateScale(sizes.tablet) : baseSize;
        break;
    }
  }

  // Appliquer le facteur d'échelle en fonction des préférences d'accessibilité
  const fontSizeMultiplier = getFontSizeMultiplier(preferences.fontSize);
  fontSize = fontSize * fontSizeMultiplier;

  // Déterminer si le texte doit être optimisé pour les lecteurs d'écran
  const accessibilityProps = preferences.screenReaderEnabled
    ? {
        accessibilityRole: type === 'link' ? 'link' : undefined,
        accessibilityLabel: rest.accessibilityLabel || rest.children?.toString(),
      }
    : {};

  return (
    <Text
      style={[
        { color, fontSize },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        // Appliquer un contraste élevé si nécessaire
        preferences.highContrast && type === 'link' ? styles.highContrastLink : undefined,
        style,
      ]}
      {...accessibilityProps}
      {...rest}
    />
  );
}

/**
 * Obtient le multiplicateur de taille de police en fonction des préférences d'accessibilité
 * @param fontSize - Taille de police préférée
 * @returns Multiplicateur de taille de police
 */
const getFontSizeMultiplier = (fontSize: FontSizeType): number => {
  switch (fontSize) {
    case 'small':
      return 0.85;
    case 'medium':
      return 1.0;
    case 'large':
      return 1.15;
    case 'extra-large':
      return 1.3;
    default:
      return 1.0;
  }
};

const styles = StyleSheet.create({
  default: {
    lineHeight: 24,
  },
  defaultSemiBold: {
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    lineHeight: 1.2, // Utiliser une valeur relative pour la hauteur de ligne
  },
  subtitle: {
    fontWeight: 'bold',
    lineHeight: 1.3, // Utiliser une valeur relative pour la hauteur de ligne
  },
  link: {
    lineHeight: 1.5, // Utiliser une valeur relative pour la hauteur de ligne
    color: '#0a7ea4',
  },
  highContrastLink: {
    color: '#0056b3', // Bleu plus foncé pour un meilleur contraste
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
