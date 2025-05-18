import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScaledSize } from 'react-native';
import { ORIENTATIONS } from '@/constants/Layout';

interface OrientationHandlerProps {
  children: React.ReactNode;
  portrait?: React.ReactNode;
  landscape?: React.ReactNode;
  onOrientationChange?: (orientation: string) => void;
}

/**
 * Composant qui gère l'orientation de l'écran et affiche différents contenus
 * en fonction de l'orientation (portrait ou paysage)
 * 
 * Exemple d'utilisation:
 * <OrientationHandler
 *   portrait={<PortraitLayout />}
 *   landscape={<LandscapeLayout />}
 *   onOrientationChange={(orientation) => console.log(`Orientation changed to ${orientation}`)}
 * >
 *   <DefaultLayout />
 * </OrientationHandler>
 */
export const OrientationHandler: React.FC<OrientationHandlerProps> = ({
  children,
  portrait,
  landscape,
  onOrientationChange,
}) => {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
      
      const { width, height } = window;
      const orientation = width > height ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT;
      
      if (onOrientationChange) {
        onOrientationChange(orientation);
      }
    });

    return () => subscription.remove();
  }, [onOrientationChange]);

  const { width, height } = dimensions.window;
  const isPortrait = height > width;
  const isLandscape = width > height;

  // Déterminer le contenu à afficher en fonction de l'orientation
  let content = children;

  if (isPortrait && portrait) {
    content = portrait;
  } else if (isLandscape && landscape) {
    content = landscape;
  }

  return <View style={styles.container}>{content}</View>;
};

/**
 * Composant qui n'affiche son contenu qu'en mode portrait
 */
export const PortraitOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(
    Dimensions.get('window').height > Dimensions.get('window').width
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsPortrait(window.height > window.width);
    });

    return () => subscription.remove();
  }, []);

  if (!isPortrait) return null;
  return <>{children}</>;
};

/**
 * Composant qui n'affiche son contenu qu'en mode paysage
 */
export const LandscapeOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription.remove();
  }, []);

  if (!isLandscape) return null;
  return <>{children}</>;
};

/**
 * Hook personnalisé pour détecter les changements d'orientation
 * 
 * Exemple d'utilisation:
 * const { isPortrait, isLandscape, orientation } = useOrientation();
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<{
    portrait: boolean;
    landscape: boolean;
    orientation: string;
  }>({
    portrait: Dimensions.get('window').height > Dimensions.get('window').width,
    landscape: Dimensions.get('window').width > Dimensions.get('window').height,
    orientation:
      Dimensions.get('window').height > Dimensions.get('window').width
        ? ORIENTATIONS.PORTRAIT
        : ORIENTATIONS.LANDSCAPE,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const isPortrait = window.height > window.width;
      setOrientation({
        portrait: isPortrait,
        landscape: !isPortrait,
        orientation: isPortrait ? ORIENTATIONS.PORTRAIT : ORIENTATIONS.LANDSCAPE,
      });
    });

    return () => subscription.remove();
  }, []);

  return {
    isPortrait: orientation.portrait,
    isLandscape: orientation.landscape,
    orientation: orientation.orientation,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OrientationHandler;
