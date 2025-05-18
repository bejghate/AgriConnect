import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import useResponsive from '@/hooks/useResponsive';
import { SCREEN_SIZES, FONT_SIZES, moderateScale } from '@/constants/Layout';

interface ResponsiveTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  sizes?: {
    small?: number;
    medium?: number;
    large?: number;
    tablet?: number;
  };
  type?: 'default' | 'title' | 'subtitle' | 'header' | 'caption' | 'button';
  adjustsFontSizeToFit?: boolean;
  numberOfLines?: number;
  [key: string]: any;
}

/**
 * Composant de texte responsive qui ajuste la taille de la police
 * en fonction de la taille de l'écran
 * 
 * Exemple d'utilisation:
 * <ResponsiveText
 *   sizes={{
 *     small: 14,
 *     medium: 16,
 *     large: 18,
 *     tablet: 20
 *   }}
 *   type="title"
 * >
 *   Titre responsive
 * </ResponsiveText>
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  style,
  sizes,
  type = 'default',
  adjustsFontSizeToFit,
  numberOfLines,
  ...props
}) => {
  const { screenSize } = useResponsive();
  
  // Obtenir la taille de base en fonction du type
  let baseSize = FONT_SIZES.MEDIUM;
  switch (type) {
    case 'title':
      baseSize = FONT_SIZES.TITLE;
      break;
    case 'subtitle':
      baseSize = FONT_SIZES.XLARGE;
      break;
    case 'header':
      baseSize = FONT_SIZES.HEADER;
      break;
    case 'caption':
      baseSize = FONT_SIZES.SMALL;
      break;
    case 'button':
      baseSize = FONT_SIZES.MEDIUM;
      break;
    default:
      baseSize = FONT_SIZES.MEDIUM;
  }
  
  // Déterminer la taille de la police en fonction de la taille de l'écran
  let fontSize = baseSize;
  
  if (sizes) {
    switch (screenSize) {
      case SCREEN_SIZES.SMALL:
        fontSize = sizes.small ? moderateScale(sizes.small) : baseSize;
        break;
      case SCREEN_SIZES.MEDIUM:
        fontSize = sizes.medium ? moderateScale(sizes.medium) : baseSize;
        break;
      case SCREEN_SIZES.LARGE:
        fontSize = sizes.large ? moderateScale(sizes.large) : baseSize;
        break;
      case SCREEN_SIZES.TABLET:
        fontSize = sizes.tablet ? moderateScale(sizes.tablet) : baseSize;
        break;
    }
  }
  
  // Appliquer les styles en fonction du type
  let typeStyle: StyleProp<TextStyle> = {};
  switch (type) {
    case 'title':
      typeStyle = styles.title;
      break;
    case 'subtitle':
      typeStyle = styles.subtitle;
      break;
    case 'header':
      typeStyle = styles.header;
      break;
    case 'caption':
      typeStyle = styles.caption;
      break;
    case 'button':
      typeStyle = styles.button;
      break;
  }
  
  return (
    <Text
      style={[{ fontSize }, typeStyle, style]}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * Composant de titre responsive
 */
export const ResponsiveTitle: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => {
  return <ResponsiveText {...props} type="title" />;
};

/**
 * Composant de sous-titre responsive
 */
export const ResponsiveSubtitle: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => {
  return <ResponsiveText {...props} type="subtitle" />;
};

/**
 * Composant d'en-tête responsive
 */
export const ResponsiveHeader: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => {
  return <ResponsiveText {...props} type="header" />;
};

/**
 * Composant de légende responsive
 */
export const ResponsiveCaption: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => {
  return <ResponsiveText {...props} type="caption" />;
};

/**
 * Composant de texte de bouton responsive
 */
export const ResponsiveButtonText: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => {
  return <ResponsiveText {...props} type="button" />;
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  caption: {
    color: '#757575',
  },
  button: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ResponsiveText;
