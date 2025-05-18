import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

// Palette de couleurs de l'application inspirée de la nature
export const COLORS = {
  // Couleurs primaires - Vert feuille
  primary: {
    main: '#2E7D32', // Vert forêt
    light: '#60ad5e',
    dark: '#005005',
    contrastText: '#ffffff',
  },

  // Couleurs secondaires - Terre
  secondary: {
    main: '#795548', // Marron terre
    light: '#a98274',
    dark: '#4b2c20',
    contrastText: '#ffffff',
  },

  // Couleurs d'accentuation - Soleil
  accent: {
    main: '#FFB300', // Jaune doré
    light: '#ffe54c',
    dark: '#c68400',
    contrastText: '#000000',
  },

  // Couleurs de fond
  background: {
    default: '#F9F7F3', // Beige très clair
    paper: '#ffffff',
    dark: '#121212',
    darkPaper: '#1e1e1e',
  },

  // Couleurs de texte
  text: {
    primary: '#33291A', // Brun foncé
    secondary: '#5D5348', // Brun moyen
    disabled: '#9e9e9e',
    hint: '#9e9e9e',
    primaryDark: '#F9F7F3', // Beige très clair
    secondaryDark: '#D3CEC4', // Beige moyen
  },

  // Couleurs d'état
  state: {
    success: '#388E3C', // Vert forêt
    info: '#0288D1', // Bleu ciel
    warning: '#F57C00', // Orange
    error: '#D32F2F', // Rouge
  },

  // Couleurs pour les catégories (inspirées de la nature)
  categories: {
    crops: '#558B2F', // Vert feuille
    livestock: '#BF360C', // Terre cuite
    soil: '#8D6E63', // Marron terre
    weather: '#0277BD', // Bleu ciel
    finance: '#00695C', // Vert-bleu
    general: '#546E7A', // Bleu-gris
  },

  // Couleurs pour les graphiques (palette naturelle)
  charts: {
    blue: '#0277BD', // Bleu ciel
    green: '#558B2F', // Vert feuille
    orange: '#EF6C00', // Orange
    red: '#C62828', // Rouge
    brown: '#6D4C41', // Marron
    teal: '#00796B', // Vert-bleu
    amber: '#FFB300', // Jaune doré
    olive: '#827717', // Vert olive
    sand: '#D7CCC8', // Sable
    forest: '#33691E', // Vert forêt
  },

  // Dégradés naturels
  gradients: {
    primary: ['#2E7D32', '#60ad5e'], // Vert forêt à vert clair
    secondary: ['#795548', '#a98274'], // Marron foncé à marron clair
    accent: ['#FFB300', '#ffe54c'], // Jaune doré à jaune clair
    success: ['#388E3C', '#66BB6A'], // Vert forêt à vert clair
    info: ['#0288D1', '#4FC3F7'], // Bleu ciel à bleu clair
    warning: ['#F57C00', '#FFB74D'], // Orange foncé à orange clair
    error: ['#D32F2F', '#EF5350'], // Rouge foncé à rouge clair
    sunrise: ['#FF7043', '#FFB300'], // Orange à jaune (lever de soleil)
    sunset: ['#5D4037', '#FF7043'], // Marron à orange (coucher de soleil)
    forest: ['#1B5E20', '#81C784'], // Vert forêt foncé à vert clair
    earth: ['#3E2723', '#8D6E63'], // Marron foncé à marron clair
  },

  // Couleurs saisonnières
  seasons: {
    spring: {
      light: '#C5E1A5', // Vert clair printemps
      main: '#7CB342', // Vert printemps
      dark: '#33691E', // Vert foncé printemps
    },
    summer: {
      light: '#FFE082', // Jaune clair été
      main: '#FFB300', // Jaune été
      dark: '#FF8F00', // Jaune foncé été
    },
    autumn: {
      light: '#FFAB91', // Orange clair automne
      main: '#E64A19', // Orange automne
      dark: '#BF360C', // Orange foncé automne
    },
    winter: {
      light: '#B3E5FC', // Bleu clair hiver
      main: '#0288D1', // Bleu hiver
      dark: '#01579B', // Bleu foncé hiver
    },
  },
};

// Thème clair personnalisé inspiré de la nature
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary.main,
    primaryContainer: COLORS.primary.light,
    secondary: COLORS.secondary.main,
    secondaryContainer: COLORS.secondary.light,
    tertiary: COLORS.accent.main,
    tertiaryContainer: COLORS.accent.light,
    surface: COLORS.background.paper,
    surfaceVariant: '#EDEAE2', // Beige clair
    background: COLORS.background.default,
    error: COLORS.state.error,
    errorContainer: '#FFDAD6', // Rouge très clair
    onPrimary: COLORS.primary.contrastText,
    onPrimaryContainer: '#002000', // Vert très foncé
    onSecondary: COLORS.secondary.contrastText,
    onSecondaryContainer: '#2B1710', // Marron très foncé
    onTertiary: COLORS.accent.contrastText,
    onTertiaryContainer: '#462800', // Jaune très foncé
    onSurface: COLORS.text.primary,
    onSurfaceVariant: COLORS.text.secondary,
    onError: '#FFFFFF',
    onErrorContainer: '#410002', // Rouge très foncé
    onBackground: COLORS.text.primary,
    outline: '#857568', // Marron moyen
    outlineVariant: '#D8C2B7', // Beige moyen
    inverseSurface: '#33291A', // Brun foncé
    inverseOnSurface: '#F9F7F3', // Beige très clair
    inversePrimary: '#60ad5e', // Vert clair
    scrim: 'rgba(0, 0, 0, 0.3)',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(121, 85, 72, 0.05)', // Marron transparent
      level2: 'rgba(121, 85, 72, 0.08)',
      level3: 'rgba(121, 85, 72, 0.11)',
      level4: 'rgba(121, 85, 72, 0.12)',
      level5: 'rgba(121, 85, 72, 0.14)',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Thème sombre personnalisé inspiré de la nature nocturne
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary.light, // Vert clair
    primaryContainer: COLORS.primary.dark, // Vert foncé
    secondary: COLORS.secondary.light, // Marron clair
    secondaryContainer: COLORS.secondary.dark, // Marron foncé
    tertiary: COLORS.accent.light, // Jaune clair
    tertiaryContainer: COLORS.accent.dark, // Jaune foncé
    surface: '#1A1A14', // Gris-vert très foncé
    surfaceVariant: '#2C2C24', // Gris-vert foncé
    background: '#121210', // Presque noir avec une touche de vert
    error: '#FFB4AB', // Rouge clair
    errorContainer: '#93000A', // Rouge foncé
    onPrimary: '#002000', // Vert très foncé
    onPrimaryContainer: '#ADFFB0', // Vert très clair
    onSecondary: '#2B1710', // Marron très foncé
    onSecondaryContainer: '#FFDBCF', // Marron très clair
    onTertiary: '#462800', // Jaune très foncé
    onTertiaryContainer: '#FFDEAA', // Jaune très clair
    onSurface: COLORS.text.primaryDark,
    onSurfaceVariant: COLORS.text.secondaryDark,
    onError: '#690005', // Rouge très foncé
    onErrorContainer: '#FFDAD6', // Rouge très clair
    onBackground: COLORS.text.primaryDark,
    outline: '#A08D7F', // Beige moyen
    outlineVariant: '#52443C', // Marron moyen-foncé
    inverseSurface: '#F9F7F3', // Beige très clair
    inverseOnSurface: '#33291A', // Brun foncé
    inversePrimary: '#2E7D32', // Vert forêt
    scrim: 'rgba(0, 0, 0, 0.6)',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(249, 247, 243, 0.05)', // Beige transparent
      level2: 'rgba(249, 247, 243, 0.08)',
      level3: 'rgba(249, 247, 243, 0.11)',
      level4: 'rgba(249, 247, 243, 0.12)',
      level5: 'rgba(249, 247, 243, 0.14)',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Hook pour obtenir le thème en fonction des préférences de l'utilisateur
export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const { settings } = useAppStore();

  // Déterminer le thème en fonction des paramètres de l'utilisateur
  if (settings.theme === 'light') {
    return lightTheme;
  } else if (settings.theme === 'dark') {
    return darkTheme;
  } else {
    // Utiliser le thème du système
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }
};

export default {
  lightTheme,
  darkTheme,
  COLORS,
};
