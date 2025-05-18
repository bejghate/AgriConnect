import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

// Définir les tailles d'écran standard pour la réactivité
export const SCREEN_SIZES = {
  SMALL: 'small',     // Petits téléphones (< 360dp)
  MEDIUM: 'medium',   // Téléphones standard (360dp - 480dp)
  LARGE: 'large',     // Grands téléphones (480dp - 720dp)
  TABLET: 'tablet',   // Tablettes (> 720dp)
};

// Déterminer la taille d'écran actuelle
export const getScreenSize = () => {
  if (width < 360) return SCREEN_SIZES.SMALL;
  if (width < 480) return SCREEN_SIZES.MEDIUM;
  if (width < 720) return SCREEN_SIZES.LARGE;
  return SCREEN_SIZES.TABLET;
};

// Calculer les dimensions en fonction de la taille de l'écran
export const scale = (size: number) => (width / 375) * size;
export const verticalScale = (size: number) => (height / 812) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Définir les marges et paddings standard
export const SPACING = {
  SMALL: scale(4),
  MEDIUM: scale(8),
  LARGE: scale(16),
  XLARGE: scale(24),
  XXLARGE: scale(32),
};

// Définir les tailles de police standard
export const FONT_SIZES = {
  SMALL: moderateScale(12),
  MEDIUM: moderateScale(14),
  LARGE: moderateScale(16),
  XLARGE: moderateScale(18),
  XXLARGE: moderateScale(20),
  TITLE: moderateScale(24),
  HEADER: moderateScale(28),
};

// Définir les rayons de bordure standard
export const BORDER_RADIUS = {
  SMALL: scale(4),
  MEDIUM: scale(8),
  LARGE: scale(12),
  XLARGE: scale(16),
  ROUND: scale(999),
};

// Définir les hauteurs d'élément standard
export const ELEMENT_HEIGHT = {
  BUTTON: verticalScale(48),
  INPUT: verticalScale(48),
  HEADER: verticalScale(56),
  TAB_BAR: verticalScale(56),
};

// Définir les largeurs d'élément standard
export const ELEMENT_WIDTH = {
  BUTTON_SMALL: scale(120),
  BUTTON_MEDIUM: scale(160),
  BUTTON_LARGE: scale(200),
  ICON_BUTTON: scale(48),
};

// Définir les grilles pour les layouts
export const GRID = {
  COLUMN_1: width * 0.25,
  COLUMN_2: width * 0.5,
  COLUMN_3: width * 0.75,
  COLUMN_4: width,
};

// Définir les breakpoints pour les layouts responsive
export const BREAKPOINTS = {
  PHONE: 0,
  TABLET: 768,
  DESKTOP: 1024,
};

// Définir les orientations
export const ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
};

// Obtenir l'orientation actuelle
export const getOrientation = () => {
  return width > height ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT;
};

// Exporter les dimensions de l'écran
export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 480,
  isLargeDevice: width >= 480 && width < 720,
  isTablet: width >= 720,
  screenSize: getScreenSize(),
  orientation: getOrientation(),
};
