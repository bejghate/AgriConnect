import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GlobalSearchButton } from '@/components/search/GlobalSearchButton';
import { NavigationHistoryButton } from '@/components/navigation/NavigationHistoryButton';
import { DataSavingButton } from '@/components/settings/DataSavingButton';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { OfflineStatusBar } from '@/components/OfflineStatusBar';
import OnboardingTutorial from '@/components/onboarding/OnboardingTutorial';
import FeatureTip from '@/components/onboarding/FeatureTip';
import ProgressTracker from '@/components/onboarding/ProgressTracker';
import { useOffline } from '@/context/OfflineContext';
import { useUser, userTypeDetails, UserType } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { useNavigationHistory } from '@/context/NavigationHistoryContext';
import { useOnboarding } from '@/hooks/useOnboarding';

// Mock data for weather
const weatherData = {
  location: 'Your Farm',
  temperature: '24°C',
  condition: 'Partly Cloudy',
  humidity: '65%',
  wind: '12 km/h',
  forecast: [
    { day: 'Today', temp: '24°C', icon: 'cloud.sun.fill' },
    { day: 'Tomorrow', temp: '26°C', icon: 'sun.max.fill' },
    { day: 'Wed', temp: '22°C', icon: 'cloud.rain.fill' },
    { day: 'Thu', temp: '20°C', icon: 'cloud.heavyrain.fill' },
    { day: 'Fri', temp: '23°C', icon: 'sun.max.fill' },
  ],
  alerts: [
    {
      id: '1',
      type: 'drought',
      title: 'Drought Risk',
      description: 'Rainfall 30% below average. Consider water conservation.',
      severity: 'high',
    },
    {
      id: '2',
      type: 'heat',
      title: 'Heat Wave',
      description: 'Temperatures 5°C above normal expected for next 7 days.',
      severity: 'medium',
    }
  ],
  climateData: {
    temperatureChange: '+1.2°C',
    rainfallChange: '-15%',
    growingSeasonChange: '+12 days',
  }
};

// Mock data for notifications
const notifications = [
  {
    id: '1',
    title: 'Time to irrigate North Field',
    description: 'Soil moisture levels are below optimal threshold.',
    time: '2 hours ago',
    icon: 'drop.fill',
    color: '#2196F3',
  },
  {
    id: '2',
    title: 'Pest alert in South Field',
    description: 'Early signs of aphid infestation detected.',
    time: '5 hours ago',
    icon: 'ladybug.fill',
    color: '#F44336',
  },
  {
    id: '3',
    title: 'Market price update',
    description: 'Corn prices have increased by 5% this week.',
    time: '1 day ago',
    icon: 'chart.line.uptrend.xyaxis.fill',
    color: '#4CAF50',
  },
];

// Feature card component
const FeatureCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.featureCard}>
    <ThemedView style={[styles.iconContainer, { backgroundColor: color }]}>
      <IconSymbol size={32} name={icon} color="white" />
    </ThemedView>
    <ThemedText style={styles.featureTitle}>{title}</ThemedText>
  </TouchableOpacity>
);

// Weather forecast item component
const ForecastItem = ({ item }) => (
  <ThemedView style={styles.forecastItem}>
    <ThemedText style={styles.forecastDay}>{item.day}</ThemedText>
    <IconSymbol size={24} name={item.icon} color="#0a7ea4" style={styles.forecastIcon} />
    <ThemedText style={styles.forecastTemp}>{item.temp}</ThemedText>
  </ThemedView>
);

// Notification item component
const NotificationItem = ({ notification }) => (
  <ThemedView style={styles.notificationItem}>
    <ThemedView style={[styles.notificationIcon, { backgroundColor: notification.color }]}>
      <IconSymbol size={20} name={notification.icon} color="white" />
    </ThemedView>
    <ThemedView style={styles.notificationContent}>
      <ThemedText type="defaultSemiBold">{notification.title}</ThemedText>
      <ThemedText style={styles.notificationDescription}>{notification.description}</ThemedText>
      <ThemedText style={styles.notificationTime}>{notification.time}</ThemedText>
    </ThemedView>
  </ThemedView>
);

export default function HomeScreen() {
  const router = useRouter();
  const { userTypes, primaryUserType, isUserType, isAuthenticated } = useUser();
  const { isOnline } = useOffline();
  const { notifications, unreadCount, calendarReminders, healthAlerts, seasonalAdvice } = useNotifications();

  const [showClimateAlert, setShowClimateAlert] = useState<boolean>(true);

  const navigateToFeature = (route) => {
    router.push(route);
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  // Get alert icon based on alert type
  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'drought':
        return 'drop.degreesign';
      case 'heat':
        return 'thermometer.sun.fill';
      case 'flood':
        return 'cloud.heavyrain.fill';
      case 'frost':
        return 'snowflake';
      case 'wind':
        return 'wind';
      default:
        return 'exclamationmark.triangle.fill';
    }
  };

  // Get severity style based on severity level
  const getSeverityStyle = (severity: string): { borderLeftColor: string, borderLeftWidth: number } => {
    switch (severity) {
      case 'high':
        return { borderLeftColor: '#F44336', borderLeftWidth: 4 };
      case 'medium':
        return { borderLeftColor: '#FF9800', borderLeftWidth: 4 };
      case 'low':
        return { borderLeftColor: '#4CAF50', borderLeftWidth: 4 };
      default:
        return { borderLeftColor: '#757575', borderLeftWidth: 4 };
    }
  };

  // Get severity color based on severity level
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  // User type-specific recommendations
  const getUserRecommendations = () => {
    switch (primaryUserType) {
      case 'farmer':
        return [
          { title: 'Seasonal Planting Guide', icon: 'calendar', color: '#4CAF50' },
          { title: 'Crop Disease Prevention', icon: 'leaf.fill', color: '#8BC34A' },
          { title: 'Weather Forecast Analysis', icon: 'cloud.sun.fill', color: '#03A9F4' },
        ];
      case 'livestock':
        return [
          { title: 'Animal Health Monitoring', icon: 'heart.fill', color: '#F44336' },
          { title: 'Feed Management', icon: 'cart.fill', color: '#FF9800' },
          { title: 'Breeding Calendar', icon: 'calendar', color: '#9C27B0' },
        ];
      case 'professional':
        return [
          { title: 'Latest Research Papers', icon: 'doc.text.fill', color: '#2196F3' },
          { title: 'Client Management', icon: 'person.2.fill', color: '#3F51B5' },
          { title: 'Professional Network', icon: 'link', color: '#009688' },
        ];
      case 'supplier':
        return [
          { title: 'Inventory Management', icon: 'shippingbox.fill', color: '#9C27B0' },
          { title: 'Market Trends', icon: 'chart.line.uptrend.xyaxis.fill', color: '#FF5722' },
          { title: 'Customer Analytics', icon: 'person.3.fill', color: '#795548' },
        ];
      case 'buyer':
        return [
          { title: 'Product Quality Guide', icon: 'star.fill', color: '#FFC107' },
          { title: 'Seasonal Availability', icon: 'calendar', color: '#4CAF50' },
          { title: 'Price Comparison', icon: 'dollarsign.circle.fill', color: '#607D8B' },
        ];
      default:
        return [];
    }
  };

  // Get user type-specific greeting
  const getUserGreeting = () => {
    const userDetail = userTypeDetails[primaryUserType];
    return `Welcome, ${userDetail.title}!`;
  };

  // Get user type-specific intro text
  const getIntroText = () => {
    switch (primaryUserType) {
      case 'farmer':
        return 'Manage your crops, track weather patterns, and connect with experts to optimize your farming operations.';
      case 'livestock':
        return 'Monitor your livestock health, manage breeding cycles, and find the best supplies for your animals.';
      case 'professional':
        return 'Connect with farmers who need your expertise, access the latest research, and grow your professional network.';
      case 'supplier':
        return 'Showcase your products, connect with potential customers, and track market trends to optimize your business.';
      case 'buyer':
        return 'Find quality agricultural products, connect directly with farmers, and discover the best deals in your area.';
      default:
        return 'Your all-in-one platform for modern farming. Access agricultural information, connect with experts, buy and sell products, and manage your farm operations.';
    }
  };

  const { preferences } = useAccessibilityContext();
  const { history } = useNavigationHistory();
  const {
    showOnboarding,
    setShowOnboarding,
    isCompleted,
    markOnboardingCompleted,
    saveOnboardingProgress,
    currentStep,
    markFeatureTipShown,
    featureTipsShown,
    addGamificationPoints,
  } = useOnboarding();

  // State for progress tracker
  const [showProgressTracker, setShowProgressTracker] = useState(false);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    markOnboardingCompleted();
  };

  // Show feature tip for search when onboarding is completed
  useEffect(() => {
    if (isCompleted && !featureTipsShown['search']) {
      // Add a delay to show the tip after onboarding is completed
      const timer = setTimeout(() => {
        // The tip will be shown automatically by the FeatureTip component
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, featureTipsShown]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title">{getUserGreeting()}</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.headerButtons}>
          {!isOnline && (
            <ThemedView style={styles.offlineIndicator}>
              <IconSymbol name="wifi.slash" size={16} color="white" />
              <ThemedText style={styles.offlineText}>Offline</ThemedText>
            </ThemedView>
          )}
          <GlobalSearchButton
            style={styles.searchButton}
            size={20}
            accessibilityLabel={preferences.voiceCommands ? "Search. Say 'search' to activate" : "Search"}
          />
          <NavigationHistoryButton
            style={styles.searchButton}
            size={20}
            accessibilityLabel={preferences.voiceCommands ? "History. Say 'history' to activate" : "History"}
          />
          <DataSavingButton
            style={styles.searchButton}
            size={20}
            accessibilityLabel={preferences.voiceCommands ? "Data saving. Say 'data saving' to activate" : "Data saving"}
          />
          <View style={styles.searchButton}>
            <LanguageSelector compact={true} showLabel={true} />
          </View>
          {isAuthenticated ? (
            <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
              <IconSymbol name="person.crop.circle" size={20} color="#0a7ea4" />
              <ThemedText style={styles.profileButtonText}>Profile</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.profileButton, styles.loginButton]}
              onPress={() => router.push('/auth/login')}
            >
              <IconSymbol name="person.badge.plus" size={20} color="#4CAF50" />
              <ThemedText style={[styles.profileButtonText, styles.loginButtonText]}>Login</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      <OfflineStatusBar />

      {showClimateAlert && isOnline && (
        <TouchableOpacity
          style={styles.climateAlert}
          onPress={() => router.push('/climate-impact')}
        >
          <ThemedView style={styles.climateAlertContent}>
            <IconSymbol name="thermometer.sun.fill" size={24} color="#F57F17" />
            <ThemedView style={styles.climateAlertText}>
              <ThemedText type="defaultSemiBold" style={styles.climateAlertTitle}>
                Climate Alert: Heat Wave Expected
              </ThemedText>
              <ThemedText style={styles.climateAlertDescription}>
                Temperatures 5°C above normal for next 7 days. Tap for adaptation strategies.
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <TouchableOpacity
            style={styles.climateAlertClose}
            onPress={(e) => {
              e.stopPropagation();
              setShowClimateAlert(false);
            }}
          >
            <IconSymbol name="xmark" size={16} color="#757575" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ThemedText style={styles.introText}>
        {getIntroText()}
      </ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Access</ThemedText>

      <ThemedView style={styles.featuresGrid}>
        {isUserType('farmer') && (
          <FeatureCard
            title="Gestion de l'Exploitation"
            icon="chart.bar.doc.horizontal.fill"
            color="#9C27B0"
            onPress={() => navigateToFeature('/farm-management')}
          />
        )}
        <FeatureCard
          title="Encyclopedia"
          icon="book.fill"
          color="#4CAF50"
          onPress={() => navigateToFeature('/encyclopedia')}
        />
        {(isUserType('farmer') || isUserType('livestock')) && (
          <FeatureCard
            title="Consultations"
            icon="person.2.fill"
            color="#2196F3"
            onPress={() => navigateToFeature('/consultations')}
          />
        )}
        <FeatureCard
          title="Marketplace"
          icon="cart.fill"
          color="#FF9800"
          onPress={() => navigateToFeature('/marketplace')}
        />
      </ThemedView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recommended for {userTypeDetails[primaryUserType].title}s
      </ThemedText>

      <ThemedView style={styles.recommendationsContainer}>
        {getUserRecommendations().map((recommendation, index) => (
          <TouchableOpacity key={index} style={styles.recommendationCard}>
            <ThemedView style={[styles.recommendationIcon, { backgroundColor: recommendation.color }]}>
              <IconSymbol size={24} name={recommendation.icon} color="white" />
            </ThemedView>
            <ThemedText style={styles.recommendationTitle}>{recommendation.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedView style={styles.weatherHeader}>
        <ThemedText type="subtitle">Weather Forecast</ThemedText>
        <TouchableOpacity onPress={() => router.push('/climate-impact')}>
          <ThemedText style={styles.climateLink}>Climate Impact</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.weatherCard}>
        <ThemedView style={styles.currentWeather}>
          <ThemedView>
            <ThemedText type="defaultSemiBold" style={styles.weatherLocation}>{weatherData.location}</ThemedText>
            <ThemedText style={styles.weatherCondition}>{weatherData.condition}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.weatherTempContainer}>
            <IconSymbol size={36} name="cloud.sun.fill" color="#0a7ea4" />
            <ThemedText style={styles.weatherTemp}>{weatherData.temperature}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.weatherDetails}>
          <ThemedView style={styles.weatherDetailItem}>
            <IconSymbol size={16} name="humidity.fill" color="#0a7ea4" />
            <ThemedText style={styles.weatherDetailText}>Humidity: {weatherData.humidity}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.weatherDetailItem}>
            <IconSymbol size={16} name="wind" color="#0a7ea4" />
            <ThemedText style={styles.weatherDetailText}>Wind: {weatherData.wind}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.forecastContainer}>
          {weatherData.forecast.map((item, index) => (
            <ForecastItem key={index} item={item} />
          ))}
        </ThemedView>

        {isOnline && weatherData.alerts && weatherData.alerts.length > 0 && (
          <>
            <ThemedView style={styles.weatherDivider} />

            <ThemedText type="defaultSemiBold" style={styles.alertsTitle}>Weather Alerts</ThemedText>

            {weatherData.alerts.map((alert) => (
              <ThemedView
                key={alert.id}
                style={[styles.weatherAlert, getSeverityStyle(alert.severity)]}
              >
                <IconSymbol
                  name={getAlertIcon(alert.type)}
                  size={20}
                  color={getSeverityColor(alert.severity)}
                />
                <ThemedView style={styles.alertContent}>
                  <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
                    {alert.title}
                  </ThemedText>
                  <ThemedText style={styles.alertDescription}>
                    {alert.description}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}

            <ThemedView style={styles.weatherDivider} />

            <ThemedView style={styles.climateImpactContainer}>
              <ThemedText type="defaultSemiBold" style={styles.climateImpactTitle}>
                Climate Trends
              </ThemedText>

              <ThemedView style={styles.climateImpactStats}>
                <ThemedView style={styles.climateImpactStat}>
                  <IconSymbol name="thermometer" size={16} color="#F44336" />
                  <ThemedText style={styles.climateImpactValue}>
                    {weatherData.climateData.temperatureChange}
                  </ThemedText>
                  <ThemedText style={styles.climateImpactLabel}>Temp</ThemedText>
                </ThemedView>

                <ThemedView style={styles.climateImpactStat}>
                  <IconSymbol name="drop.fill" size={16} color="#2196F3" />
                  <ThemedText style={styles.climateImpactValue}>
                    {weatherData.climateData.rainfallChange}
                  </ThemedText>
                  <ThemedText style={styles.climateImpactLabel}>Rain</ThemedText>
                </ThemedView>

                <ThemedView style={styles.climateImpactStat}>
                  <IconSymbol name="calendar" size={16} color="#4CAF50" />
                  <ThemedText style={styles.climateImpactValue}>
                    {weatherData.climateData.growingSeasonChange}
                  </ThemedText>
                  <ThemedText style={styles.climateImpactLabel}>Season</ThemedText>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                style={styles.climateImpactButton}
                onPress={() => router.push('/climate-impact')}
              >
                <ThemedText style={styles.climateImpactButtonText}>
                  View Climate Impact
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.notificationsHeader}>
        <ThemedText type="subtitle">Recent Notifications</ThemedText>
        {unreadCount > 0 && (
          <ThemedView style={styles.unreadBadge}>
            <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.notificationsContainer}>
        {notifications.length > 0 ? (
          notifications.slice(0, 3).map(notification => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => {
                switch (notification.type) {
                  case 'health_alert':
                    router.push(`/health-alerts?id=${notification.id}`);
                    break;
                  case 'calendar_reminder':
                    router.push(`/calendar?id=${notification.id}`);
                    break;
                  case 'seasonal_advice':
                    router.push(`/seasonal-advice?id=${notification.id}`);
                    break;
                }
              }}
            >
              <ThemedView style={[styles.notificationItem, !notification.isRead && styles.unreadNotification]}>
                <ThemedView style={[styles.notificationIcon, { backgroundColor: notification.color }]}>
                  <IconSymbol size={20} name={notification.icon} color="white" />
                </ThemedView>
                <ThemedView style={styles.notificationContent}>
                  <ThemedText type={notification.isRead ? 'default' : 'defaultSemiBold'}>
                    {notification.title}
                  </ThemedText>
                  <ThemedText style={styles.notificationDescription}>
                    {notification.description}
                  </ThemedText>
                  <ThemedText style={styles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
                {!notification.isRead && (
                  <ThemedView style={styles.unreadDot} />
                )}
              </ThemedView>
            </TouchableOpacity>
          ))
        ) : (
          <ThemedView style={styles.emptyNotifications}>
            <IconSymbol name="bell.slash" size={32} color="#757575" />
            <ThemedText style={styles.emptyNotificationsText}>
              No notifications yet
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => router.push('/notifications')}
      >
        <ThemedText style={styles.viewAllButtonText}>View All Notifications</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exampleCard}
        onPress={() => router.push('/locust-invasion-example')}
      >
        <ThemedView style={styles.exampleCardContent}>
          <IconSymbol name="ladybug.fill" size={24} color="#F44336" />
          <ThemedView style={styles.exampleCardTextContent}>
            <ThemedText type="defaultSemiBold" style={styles.exampleCardTitle}>
              Example: Locust Invasion Alert
            </ThemedText>
            <ThemedText style={styles.exampleCardDescription}>
              See how to respond to a locust invasion alert with step-by-step guidance
            </ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={20} color="#757575" />
        </ThemedView>
      </TouchableOpacity>

      {/* Progress tracker button */}
      <TouchableOpacity
        style={styles.progressButton}
        onPress={() => setShowProgressTracker(true)}
      >
        <ThemedView style={styles.progressButtonContent}>
          <IconSymbol name="chart.bar.fill" size={20} color="#4CAF50" />
          <ThemedText style={styles.progressButtonText}>Your Progress</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {/* Onboarding tutorial */}
      <OnboardingTutorial
        isVisible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        initialStep={currentStep}
      />

      {/* Progress tracker */}
      <ProgressTracker
        isVisible={showProgressTracker}
        onClose={() => setShowProgressTracker(false)}
      />

      {/* Feature tips */}
      <FeatureTip
        featureId="search"
        title="Global Search"
        description="Search across all content in AgriConnect with our powerful global search feature."
        icon="magnifyingglass"
        color={COLORS.primary.main}
        position="bottom"
        showCondition={isCompleted && !featureTipsShown['search']}
      />

      <FeatureTip
        featureId="history"
        title="Navigation History"
        description="Access your browsing history to quickly return to previously visited pages."
        icon="clock.arrow.circlepath"
        color={COLORS.secondary.main}
        position="bottom"
        showCondition={isCompleted && !featureTipsShown['history'] && history.length > 3}
        delay={5000}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  offlineText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: '#E65100',
    marginLeft: 8,
    fontSize: 14,
  },
  climateAlert: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    flexDirection: 'row',
  },
  climateAlertContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  climateAlertText: {
    marginLeft: 12,
    flex: 1,
  },
  climateAlertTitle: {
    marginBottom: 4,
  },
  climateAlertDescription: {
    fontSize: 14,
    color: '#757575',
  },
  climateAlertClose: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileButtonText: {
    marginLeft: 6,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#E8F5E9',
  },
  loginButtonText: {
    color: '#4CAF50',
  },
  progressButton: {
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  progressButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '500',
  },
  introText: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  recommendationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  recommendationCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  climateLink: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  weatherCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherLocation: {
    fontSize: 18,
  },
  weatherCondition: {
    marginTop: 4,
  },
  weatherTempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherDetailText: {
    marginLeft: 6,
    fontSize: 14,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 12,
    marginBottom: 4,
  },
  forecastIcon: {
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
  },
  weatherDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  alertsTitle: {
    marginBottom: 12,
  },
  weatherAlert: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#757575',
  },
  climateImpactContainer: {
    marginTop: 8,
  },
  climateImpactTitle: {
    marginBottom: 12,
  },
  climateImpactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  climateImpactStat: {
    alignItems: 'center',
    flex: 1,
  },
  climateImpactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  climateImpactLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  climateImpactButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  climateImpactButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  unreadNotification: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: '#0a7ea4',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  notificationTime: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyNotificationsText: {
    marginTop: 8,
    color: '#757575',
  },
  viewAllButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  viewAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  exampleCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    overflow: 'hidden',
  },
  exampleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exampleCardTextContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  exampleCardTitle: {
    marginBottom: 4,
  },
  exampleCardDescription: {
    fontSize: 14,
    color: '#757575',
  },
});
