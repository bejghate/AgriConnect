import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { useAppTheme } from '@/constants/Theme';
import { Platform, useEffect } from 'react-native';
import VoiceCommandHandler from '@/components/accessibility/VoiceCommandHandler';

import { OfflineProvider } from '@/context/OfflineContext';
import { UserProvider } from '@/context/UserContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { FarmManagementProvider } from '@/context/FarmManagementContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { NavigationHistoryProvider } from '@/context/NavigationHistoryContext';
import DataSavingProvider from '@/components/settings/DataSavingMode';
import { useColorScheme } from '@/hooks/useColorScheme';
import { disableAccessibilityWarnings } from '@/utils/disableAccessibilityWarnings';

// Import services
import DatabaseService from '@/services/DatabaseService';
import SyncManager from '@/services/SyncManager';
import LocalizationService from '@/services/LocalizationService';
import GeolocationService from '@/services/GeolocationService';
import SecurityService from '@/services/SecurityService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = useAppTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('Initializing services...');

        // Initialize database
        await DatabaseService.initialize();
        console.log('Database initialized');

        // Initialize localization
        await LocalizationService.initialize();
        console.log('Localization initialized');

        // Initialize geolocation
        await GeolocationService.initialize();
        console.log('Geolocation initialized');

        // Initialize sync manager
        await SyncManager.initialize();
        console.log('Sync manager initialized');

        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      const cleanupServices = async () => {
        try {
          await SyncManager.cleanup();
          await GeolocationService.cleanup();
          await DatabaseService.close();
          console.log('Services cleaned up');
        } catch (error) {
          console.error('Error cleaning up services:', error);
        }
      };

      cleanupServices();
    };
  }, []);

  // Désactiver les avertissements d'accessibilité sur le web
  if (Platform.OS === 'web') {
    disableAccessibilityWarnings();
  }

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <AccessibilityProvider>
        <OfflineProvider>
          <UserProvider>
            <NotificationsProvider>
              <FarmManagementProvider>
                <NavigationHistoryProvider>
                  <DataSavingProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                      <Stack.Screen name="home" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="settings/accessibility" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/two-factor" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/change-password" options={{ title: 'Change Password' }} />
                    <Stack.Screen name="settings/security" options={{ title: 'Security Settings' }} />
                    <Stack.Screen name="settings/offline" options={{ title: 'Offline Settings' }} />
                    <Stack.Screen name="settings/language" options={{ title: 'Language Settings' }} />
                    <Stack.Screen name="profile" options={{ title: 'Your Profile' }} />
                    <Stack.Screen name="offline-content" options={{ title: 'Offline Content' }} />
                    <Stack.Screen name="climate-impact" options={{ title: 'Climate Impact' }} />
                    <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
                    <Stack.Screen name="calendar" options={{ title: 'Agricultural Calendar' }} />
                    <Stack.Screen name="health-alerts" options={{ title: 'Health Alerts' }} />
                    <Stack.Screen name="seasonal-advice" options={{ title: 'Seasonal Advice' }} />
                    <Stack.Screen name="urgent-alerts" options={{ title: 'Urgent Alerts' }} />
                    <Stack.Screen name="notification-settings" options={{ title: 'Notification Settings' }} />
                    <Stack.Screen name="locust-invasion-example" options={{ title: 'Locust Invasion Example' }} />
                    <Stack.Screen name="farm-management" options={{ title: 'Gestion de l\'Exploitation' }} />
                    <Stack.Screen name="farm-logbook" options={{ title: 'Carnet de Bord' }} />
                    <Stack.Screen name="farm-statistics" options={{ title: 'Statistiques' }} />
                    <Stack.Screen name="farm-export" options={{ title: 'Exporter les Données' }} />
                    <Stack.Screen name="farm-birth-example" options={{ title: 'Exemple: Enregistrer une Naissance' }} />
                    <Stack.Screen name="frontend-example" options={{ title: 'Exemple Frontend' }} />
                    <Stack.Screen name="location-example" options={{ title: 'Exemple de Localisation' }} />
                    <Stack.Screen name="accessibility-settings" options={{ title: 'Paramètres d\'accessibilité' }} />
                    <Stack.Screen name="ui-design-example" options={{ title: 'Design UI' }} />
                    <Stack.Screen name="about" options={{ title: 'About AgriConnect' }} />
                    <Stack.Screen name="forum" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/products" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/product-details" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/apply" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/applications" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/application-details" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/repayments" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/education" options={{ headerShown: false }} />
                    <Stack.Screen name="financial-services/calculators" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                  <VoiceCommandHandler />
                </ThemeProvider>
                </DataSavingProvider>
                </NavigationHistoryProvider>
              </FarmManagementProvider>
            </NotificationsProvider>
          </UserProvider>
        </OfflineProvider>
      </AccessibilityProvider>
    </PaperProvider>
  );
}
