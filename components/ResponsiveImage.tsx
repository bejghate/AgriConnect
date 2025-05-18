import React from 'react';
import { StyleSheet, StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import useResponsive from '@/hooks/useResponsive';
import { SCREEN_SIZES } from '@/constants/Layout';

interface ResponsiveImageProps {
  sources: {
    small?: string;
    medium?: string;
    large?: string;
    tablet?: string;
    default: string;
  };
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  alt?: string;
}

/**
 * Composant d'image responsive qui charge différentes résolutions d'image
 * en fonction de la taille de l'écran
 * 
 * Exemple d'utilisation:
 * <ResponsiveImage
 *   sources={{
 *     small: 'https://example.com/image-small.jpg',
 *     medium: 'https://example.com/image-medium.jpg',
 *     large: 'https://example.com/image-large.jpg',
 *     tablet: 'https://example.com/image-tablet.jpg',
 *     default: 'https://example.com/image-default.jpg'
 *   }}
 *   style={{ width: '100%', height: 200 }}
 *   contentFit="cover"
 *   transition={300}
 * />
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  sources,
  style,
  containerStyle,
  placeholder,
  contentFit = 'cover',
  transition = 200,
  alt,
}) => {
  const { screenSize } = useResponsive();
  
  // Sélectionner la source d'image appropriée en fonction de la taille de l'écran
  let source = sources.default;
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      source = sources.small || sources.default;
      break;
    case SCREEN_SIZES.MEDIUM:
      source = sources.medium || sources.default;
      break;
    case SCREEN_SIZES.LARGE:
      source = sources.large || sources.default;
      break;
    case SCREEN_SIZES.TABLET:
      source = sources.tablet || sources.default;
      break;
  }
  
  return (
    <Image
      source={{ uri: source }}
      style={[styles.image, style]}
      contentFit={contentFit}
      placeholder={placeholder ? { uri: placeholder } : undefined}
      transition={transition}
      accessible={!!alt}
      accessibilityLabel={alt}
    />
  );
};

/**
 * Composant d'image responsive qui ajuste automatiquement sa taille
 * en fonction de la taille de l'écran
 * 
 * Exemple d'utilisation:
 * <AutoSizeImage
 *   source="https://example.com/image.jpg"
 *   baseWidth={300}
 *   baseHeight={200}
 *   contentFit="cover"
 * />
 */
export const AutoSizeImage: React.FC<{
  source: string;
  baseWidth: number;
  baseHeight: number;
  minScale?: number;
  maxScale?: number;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  alt?: string;
}> = ({
  source,
  baseWidth,
  baseHeight,
  minScale = 0.5,
  maxScale = 1.5,
  style,
  contentFit = 'cover',
  transition = 200,
  alt,
}) => {
  const { window } = useResponsive();
  
  // Calculer le facteur d'échelle en fonction de la largeur de l'écran
  // Utiliser une largeur de référence de 375 (iPhone 8)
  const scaleFactor = Math.max(minScale, Math.min(maxScale, window.width / 375));
  
  // Calculer les dimensions ajustées
  const width = baseWidth * scaleFactor;
  const height = baseHeight * scaleFactor;
  
  return (
    <Image
      source={{ uri: source }}
      style={[{ width, height }, style]}
      contentFit={contentFit}
      transition={transition}
      accessible={!!alt}
      accessibilityLabel={alt}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
  },
});

export default ResponsiveImage;
