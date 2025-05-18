import React from 'react';
import { View, StyleSheet } from 'react-native';
import useResponsive from '@/hooks/useResponsive';
import { SCREEN_SIZES, ORIENTATIONS } from '@/constants/Layout';

interface ResponsiveProps {
  children: React.ReactNode;
  small?: React.ReactNode;
  medium?: React.ReactNode;
  large?: React.ReactNode;
  tablet?: React.ReactNode;
  portrait?: React.ReactNode;
  landscape?: React.ReactNode;
  style?: any;
}

/**
 * Composant qui affiche différents contenus en fonction de la taille de l'écran et de l'orientation
 * 
 * Exemple d'utilisation:
 * <Responsive
 *   small={<SmallScreenComponent />}
 *   medium={<MediumScreenComponent />}
 *   large={<LargeScreenComponent />}
 *   tablet={<TabletComponent />}
 * >
 *   <DefaultComponent />
 * </Responsive>
 */
export const Responsive: React.FC<ResponsiveProps> = ({
  children,
  small,
  medium,
  large,
  tablet,
  portrait,
  landscape,
  style,
}) => {
  const { screenSize, orientation } = useResponsive();

  // Déterminer le contenu à afficher en fonction de la taille de l'écran
  let content = children;

  // Priorité à la taille d'écran spécifique
  if (screenSize === SCREEN_SIZES.SMALL && small) {
    content = small;
  } else if (screenSize === SCREEN_SIZES.MEDIUM && medium) {
    content = medium;
  } else if (screenSize === SCREEN_SIZES.LARGE && large) {
    content = large;
  } else if (screenSize === SCREEN_SIZES.TABLET && tablet) {
    content = tablet;
  }

  // Si l'orientation est spécifiée, elle a priorité sur la taille d'écran
  if (orientation === ORIENTATIONS.PORTRAIT && portrait) {
    content = portrait;
  } else if (orientation === ORIENTATIONS.LANDSCAPE && landscape) {
    content = landscape;
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

/**
 * Composant qui n'affiche son contenu que sur les petits écrans
 */
export const SmallScreenOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isSmallDevice } = useResponsive();
  if (!isSmallDevice) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu que sur les écrans moyens
 */
export const MediumScreenOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isMediumDevice } = useResponsive();
  if (!isMediumDevice) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu que sur les grands écrans
 */
export const LargeScreenOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isLargeDevice } = useResponsive();
  if (!isLargeDevice) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu que sur les tablettes
 */
export const TabletOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isTablet } = useResponsive();
  if (!isTablet) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu qu'en mode portrait
 */
export const PortraitOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isPortrait } = useResponsive();
  if (!isPortrait) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu qu'en mode paysage
 */
export const LandscapeOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isLandscape } = useResponsive();
  if (!isLandscape) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

/**
 * Composant qui n'affiche son contenu que sur les appareils mobiles (non tablettes)
 */
export const MobileOnly: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { isTablet } = useResponsive();
  if (isTablet) return null;
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Responsive;
