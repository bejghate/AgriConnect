import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/Theme';
import { globalStyles, homeStyles } from '@/constants/Styles';
import { Button, Card, ListItem, Badge, Header } from '@/components/ui';
import { useUser, userTypeDetails } from '@/context/UserContext';
import { useOffline } from '@/context/OfflineContext';
import { useNotifications } from '@/context/NotificationsContext';

// Mock data for weather
const weatherData = {
  location: 'Your Farm',
  temperature: '24°C',
  condition: 'Partly Cloudy',
  humidity: '65%',
  wind: '12 km/h',
  forecast: [
    { day: 'Today', temp: '24°C', icon: 'partly-sunny' },
    { day: 'Tomorrow', temp: '26°C', icon: 'sunny' },
    { day: 'Wed', temp: '22°C', icon: 'rainy' },
    { day: 'Thu', temp: '20°C', icon: 'thunderstorm' },
    { day: 'Fri', temp: '23°C', icon: 'sunny' },
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
  ]
};

// Weather forecast item component
const ForecastItem = ({ day, temp, icon }) => (
  <View style={styles.forecastItem}>
    <Text style={styles.forecastDay}>{day}</Text>
    <Ionicons name={icon} size={24} color={COLORS.categories.weather} style={styles.forecastIcon} />
    <Text style={styles.forecastTemp}>{temp}</Text>
  </View>
);

// Feature card component
const FeatureCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <View style={[styles.featureIconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { userTypes, primaryUserType, isUserType, isAuthenticated } = useUser();
  const { isOnline } = useOffline();
  const { notifications, unreadCount } = useNotifications();
  const [showClimateAlert, setShowClimateAlert] = useState(true);

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

  // Get alert icon based on alert type
  const getAlertIcon = (type) => {
    switch (type) {
      case 'drought': return 'water-outline';
      case 'heat': return 'thermometer-outline';
      case 'flood': return 'rainy';
      case 'frost': return 'snow';
      case 'wind': return 'thunderstorm-outline';
      default: return 'warning-outline';
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.paper} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <Card
          variant="filled"
          style={homeStyles.welcomeCard}
          title={getUserGreeting()}
          content={getIntroText()}
          footer={
            <View style={styles.welcomeCardFooter}>
              {!isAuthenticated ? (
                <Button 
                  title="Login / Register" 
                  variant="primary"
                  size="small"
                  onPress={() => router.push('/auth/login')}
                  leftIcon={<Ionicons name="log-in-outline" size={16} color="#FFFFFF" />}
                />
              ) : (
                <Button 
                  title="View Profile" 
                  variant="outline"
                  size="small"
                  onPress={() => router.push('/profile')}
                  leftIcon={<Ionicons name="person-outline" size={16} color={COLORS.primary.main} />}
                />
              )}
            </View>
          }
        />

        {/* Offline Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={20} color="#F57F17" />
            <Text style={styles.offlineBannerText}>
              You're offline. Some features may be limited.
            </Text>
          </View>
        )}

        {/* Climate Alert */}
        {showClimateAlert && isOnline && (
          <Card
            variant="outlined"
            style={styles.climateAlert}
            icon={<Ionicons name="thermometer-outline" size={24} color="#F57F17" />}
            title="Climate Alert: Heat Wave Expected"
            content="Temperatures 5°C above normal for next 7 days. Tap for adaptation strategies."
            onPress={() => router.push('/climate-impact')}
            footer={
              <TouchableOpacity
                style={styles.climateAlertClose}
                onPress={() => setShowClimateAlert(false)}
              >
                <Text style={styles.climateAlertCloseText}>Dismiss</Text>
              </TouchableOpacity>
            }
          />
        )}

        {/* Quick Access Section */}
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Quick Access</Text>
        
        <View style={styles.featuresGrid}>
          {isUserType('farmer') && (
            <FeatureCard
              title="Farm Management"
              icon="analytics-outline"
              color={COLORS.categories.general}
              onPress={() => router.push('/farm-management')}
            />
          )}
          <FeatureCard
            title="Encyclopedia"
            icon="book-outline"
            color={COLORS.categories.crops}
            onPress={() => router.push('/encyclopedia')}
          />
          {(isUserType('farmer') || isUserType('livestock')) && (
            <FeatureCard
              title="Consultations"
              icon="people-outline"
              color={COLORS.categories.weather}
              onPress={() => router.push('/consultations')}
            />
          )}
          <FeatureCard
            title="Marketplace"
            icon="cart-outline"
            color={COLORS.categories.livestock}
            onPress={() => router.push('/marketplace')}
          />
        </View>

        {/* Weather Section */}
        <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Weather Forecast</Text>
        
        <Card
          variant="elevated"
          style={styles.weatherCard}
          content={
            <View>
              <View style={styles.currentWeather}>
                <View>
                  <Text style={styles.weatherLocation}>{weatherData.location}</Text>
                  <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
                </View>
                <View style={styles.weatherTempContainer}>
                  <Ionicons name="partly-sunny" size={36} color={COLORS.categories.weather} />
                  <Text style={styles.weatherTemp}>{weatherData.temperature}</Text>
                </View>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water-outline" size={16} color={COLORS.categories.weather} />
                  <Text style={styles.weatherDetailText}>Humidity: {weatherData.humidity}</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="speedometer-outline" size={16} color={COLORS.categories.weather} />
                  <Text style={styles.weatherDetailText}>Wind: {weatherData.wind}</Text>
                </View>
              </View>

              <View style={styles.forecastContainer}>
                {weatherData.forecast.map((item, index) => (
                  <ForecastItem key={index} day={item.day} temp={item.temp} icon={item.icon} />
                ))}
              </View>

              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <View style={styles.alertsContainer}>
                  <Text style={styles.alertsTitle}>Weather Alerts</Text>
                  
                  {weatherData.alerts.map((alert) => (
                    <View key={alert.id} style={styles.alertItem}>
                      <Ionicons 
                        name={getAlertIcon(alert.type)} 
                        size={24} 
                        color={alert.severity === 'high' ? COLORS.state.error : COLORS.state.warning} 
                      />
                      <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Text style={styles.alertDescription}>{alert.description}</Text>
                      </View>
                      <Badge 
                        label={alert.severity} 
                        variant={alert.severity === 'high' ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          }
          footer={
            <Button
              title="View Climate Impact"
              variant="outline"
              onPress={() => router.push('/climate-impact')}
              fullWidth
            />
          }
        />

        {/* Notifications Section */}
        <View style={styles.notificationsHeader}>
          <Text style={globalStyles.sectionTitle}>Recent Notifications</Text>
          {unreadCount > 0 && (
            <Badge label={unreadCount.toString()} variant="primary" size="small" />
          )}
        </View>

        {notifications && notifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            {notifications.slice(0, 3).map((notification) => (
              <ListItem
                key={notification.id}
                title={notification.title}
                subtitle={notification.description}
                description={new Date(notification.timestamp).toLocaleDateString()}
                leftIcon={
                  <View style={[styles.notificationIcon, { backgroundColor: notification.color || COLORS.primary.main }]}>
                    <Ionicons name={notification.icon || 'notifications-outline'} size={20} color="#FFFFFF" />
                  </View>
                }
                onPress={() => router.push(`/notifications?id=${notification.id}`)}
              />
            ))}
            
            <Button
              title="View All Notifications"
              variant="primary"
              onPress={() => router.push('/notifications')}
              style={styles.viewAllButton}
              fullWidth
            />
          </View>
        ) : (
          <Card
            variant="outlined"
            style={styles.emptyNotifications}
            icon={<Ionicons name="notifications-off-outline" size={32} color="#757575" />}
            title="No Notifications"
            content="You don't have any notifications yet. We'll notify you of important updates and alerts."
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  sectionTitle: {
    marginTop: 24,
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
    marginBottom: 16,
  },
  climateAlertClose: {
    alignItems: 'center',
  },
  climateAlertCloseText: {
    color: COLORS.text.secondary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...globalStyles.shadow,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  weatherCard: {
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
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  weatherCondition: {
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 12,
    marginBottom: 4,
    color: COLORS.text.secondary,
  },
  forecastIcon: {
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  alertsContainer: {
    marginTop: 8,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text.primary,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.text.primary,
  },
  alertDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationsContainer: {
    marginBottom: 24,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotifications: {
    marginBottom: 24,
    alignItems: 'center',
  },
  viewAllButton: {
    marginTop: 16,
  },
  welcomeCardFooter: {
    alignItems: 'flex-end',
  },
});
