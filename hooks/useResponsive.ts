import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import Layout, { SCREEN_SIZES, ORIENTATIONS } from '@/constants/Layout';

interface ResponsiveInfo {
  window: ScaledSize;
  screen: ScaledSize;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  screenSize: string;
  orientation: string;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Hook personnalisé pour gérer la réactivité de l'application
 * Fournit des informations sur la taille de l'écran, l'orientation et le type d'appareil
 */
export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });

    return () => subscription.remove();
  }, []);

  const { width, height } = dimensions.window;
  const isPortrait = height > width;
  const isLandscape = width > height;

  // Déterminer le type d'appareil
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 480;
  const isLargeDevice = width >= 480 && width < 720;
  const isTablet = width >= 720;

  // Déterminer la taille d'écran
  let screenSize = SCREEN_SIZES.MEDIUM;
  if (isSmallDevice) screenSize = SCREEN_SIZES.SMALL;
  if (isLargeDevice) screenSize = SCREEN_SIZES.LARGE;
  if (isTablet) screenSize = SCREEN_SIZES.TABLET;

  // Déterminer l'orientation
  const orientation = isPortrait ? ORIENTATIONS.PORTRAIT : ORIENTATIONS.LANDSCAPE;

  return {
    window: dimensions.window,
    screen: dimensions.screen,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    screenSize,
    orientation,
    isPortrait,
    isLandscape,
  };
}

export default useResponsive;
