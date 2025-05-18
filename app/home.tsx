import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Button, Surface, Divider } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';

const { width } = Dimensions.get('window');

// Composant pour les cartes de fonctionnalités avec animation
const FeatureCard = ({ icon, title, description, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animation avec délai basé sur l'index pour un effet en cascade
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        }
      ]}
    >
      <Surface style={styles.featureCardSurface}>
        <View style={styles.featureIconContainer}>
          <IconSymbol name={icon} size={32} color={COLORS.primary.main} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </Surface>
    </Animated.View>
  );
};

// Composant pour les témoignages avec animation
const TestimonialCard = ({ quote, author, role, image, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const delay = index * 150;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, index]);

  return (
    <Animated.View
      style={[
        styles.testimonialCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Surface style={styles.testimonialCardSurface}>
        <View style={styles.testimonialContent}>
          <Text style={styles.testimonialQuote}>"{quote}"</Text>
          <Divider style={styles.testimonialDivider} />
          <View style={styles.testimonialAuthor}>
            <Image source={image} style={styles.testimonialImage} />
            <View>
              <Text style={styles.testimonialName}>{author}</Text>
              <Text style={styles.testimonialRole}>{role}</Text>
            </View>
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const heroTitleAnim = useRef(new Animated.Value(0)).current;
  const heroSubtitleAnim = useRef(new Animated.Value(0)).current;
  const heroDescriptionAnim = useRef(new Animated.Value(0)).current;
  const heroButtonAnim = useRef(new Animated.Value(0)).current;

  // Animation de l'en-tête au chargement
  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(heroTitleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSubtitleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroDescriptionAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroButtonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, heroTitleAnim, heroSubtitleAnim, heroDescriptionAnim, heroButtonAnim]);

  // Effet de parallaxe pour l'en-tête
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // Navigation vers la page de connexion
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Navigation vers la page d'inscription
  const handleRegister = () => {
    router.push('/auth/register');
  };

  // Navigation en tant qu'invité
  const handleGuestAccess = () => {
    router.replace('/(tabs)');
  };

  // Gestion du défilement
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false, listener: () => {} }
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* En-tête avec dégradé et effet parallaxe */}
      {/* Alerte météo */}
      <Animated.View
        style={[
          styles.alertContainer,
          {
            opacity: headerOpacity,
            transform: [
              {
                translateY: headerOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }
            ],
          }
        ]}
      >
        <View style={styles.alertContent}>
          <IconSymbol name="thermometer.sun" size={20} color="#FF9800" />
          <Text style={styles.alertText}>
            Weather Alert: Heat wave expected. Temperatures +2°C above normal for the next 7 days.
          </Text>
          <TouchableOpacity style={styles.alertCloseButton}>
            <IconSymbol name="xmark" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* En-tête principal avec effet parallaxe */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
      >
        <ImageBackground
          source={require('@/assets/images/crops.jpg')}
          style={styles.headerBackground}
          resizeMode="cover"
          blurRadius={Platform.OS === 'ios' ? 5 : 2}
        >
          <LinearGradient
            colors={['rgba(33, 33, 33, 0.8)', 'rgba(76, 175, 80, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Barre de navigation améliorée */}
            <View style={styles.navbar}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>
                  Agri<Text style={styles.logoTextHighlight}>Connect</Text>
                </Text>
              </View>
              <View style={styles.navButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handleLogin}
                  accessibilityLabel="Login"
                  testID="login-button"
                >
                  <IconSymbol name="person" size={16} color="white" />
                  <Text style={styles.navButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navButton, styles.registerButton]}
                  onPress={handleRegister}
                  accessibilityLabel="Register"
                  testID="register-button"
                >
                  <IconSymbol name="person.badge.plus" size={16} color={COLORS.primary.main} />
                  <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contenu principal de l'en-tête */}
            <View style={styles.heroContent}>
              <Animated.View
                style={[
                  styles.heroTitleContainer,
                  {
                    opacity: heroTitleAnim,
                    transform: [
                      {
                        translateY: heroTitleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        })
                      }
                    ],
                  }
                ]}
              >
                <Text style={styles.welcomeText}>Welcome, Farmer!</Text>
                <Text style={styles.heroTitle}>
                  Agri<Text style={styles.heroTitleHighlight}>Connect</Text>
                </Text>
                <View style={styles.heroTitleUnderline} />
              </Animated.View>

              <Animated.Text
                style={[
                  styles.heroSubtitle,
                  {
                    opacity: heroSubtitleAnim,
                    transform: [
                      {
                        translateY: heroSubtitleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }
                    ],
                  }
                ]}
              >
                Your intelligent farming companion
              </Animated.Text>

              <Animated.View
                style={[
                  styles.heroDescriptionContainer,
                  {
                    opacity: heroDescriptionAnim,
                    transform: [
                      {
                        translateY: heroDescriptionAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }
                    ],
                  }
                ]}
              >
                <Text style={styles.heroDescription}>
                  Manage your crops, track weather trends, and connect with experts to optimize your farm operations. Access agricultural information, marketplace, and farm management tools all in one place.
                </Text>

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>10K+</Text>
                    <Text style={styles.heroStatLabel}>Farmers</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>500+</Text>
                    <Text style={styles.heroStatLabel}>Experts</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>24/7</Text>
                    <Text style={styles.heroStatLabel}>Support</Text>
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.heroButtonsContainer,
                  {
                    opacity: heroButtonAnim,
                    transform: [
                      {
                        translateY: heroButtonAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }
                    ],
                  }
                ]}
              >
                <Button
                  mode="contained"
                  onPress={handleGuestAccess}
                  style={styles.heroButton}
                  labelStyle={styles.heroButtonLabel}
                  accessibilityLabel="Discover the app"
                  testID="discover-button"
                  icon="arrow-right"
                >
                  Discover the App
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleRegister}
                  style={styles.heroButtonSecondary}
                  labelStyle={styles.heroButtonSecondaryLabel}
                  accessibilityLabel="Create an account"
                  testID="create-account-button"
                  icon="account-plus"
                >
                  Create an Account
                </Button>
              </Animated.View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>

      {/* Menu d'accès rapide */}
      <View style={styles.quickAccessContainer}>
        <Surface style={styles.quickAccessSurface}>
          <View style={styles.quickAccessContent}>
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/(tabs)/encyclopedia')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <IconSymbol name="book.fill" size={24} color={COLORS.primary.main} />
              </View>
              <Text style={styles.quickAccessText}>Encyclopedia</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/(tabs)/experts')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                <IconSymbol name="person.2.fill" size={24} color="#2196F3" />
              </View>
              <Text style={styles.quickAccessText}>Consultations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/(tabs)/market')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                <IconSymbol name="cart.fill" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickAccessText}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/(tabs)/farm')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                <IconSymbol name="leaf.fill" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.quickAccessText}>Farm Management</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </View>

      <Animated.ScrollView
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Section À propos avec animation et design moderne */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.sectionSurface}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <IconSymbol name="info.circle" size={24} color={COLORS.primary.main} />
                  <Text style={styles.sectionTitle}>About AgriConnect</Text>
                </View>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>New</Text>
                </View>
              </View>

              <Divider style={styles.sectionDivider} />

              <View style={styles.aboutContentContainer}>
                <Image
                  source={require('@/assets/images/crops.jpg')}
                  style={styles.aboutImage}
                  resizeMode="cover"
                />
                <View style={styles.aboutTextContainer}>
                  <Text style={styles.sectionDescription}>
                    AgriConnect is a mobile application designed for farmers, livestock managers, agricultural professionals,
                    suppliers, and buyers.
                  </Text>
                  <Text style={styles.sectionMission}>
                    Our mission is to facilitate access to agricultural information,
                    connect industry stakeholders, and optimize farm management.
                  </Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>

        {/* Section Fonctionnalités avec animation et design moderne */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.sectionSurface}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <IconSymbol name="star.fill" size={24} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Premium Features</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllButtonText}>See all</Text>
                  <IconSymbol name="chevron.right" size={16} color={COLORS.primary.main} />
                </TouchableOpacity>
              </View>

              <Divider style={styles.sectionDivider} />

              <Text style={styles.featuresSectionDescription}>
                Discover powerful tools that will help you optimize your farm operations and increase your productivity.
              </Text>

              <View style={styles.featuresGrid}>
                <FeatureCard
                  icon="book.fill"
                  title="Agricultural Encyclopedia"
                  description="Comprehensive knowledge base on crops, livestock, and agricultural practices."
                  index={0}
                />
                <FeatureCard
                  icon="person.2.fill"
                  title="Expert Consultations"
                  description="Connect with veterinarians, agronomists, and other specialists."
                  index={1}
                />
                <FeatureCard
                  icon="cart.fill"
                  title="Agricultural Marketplace"
                  description="Buy and sell agricultural products, equipment, and services."
                  index={2}
                />
                <FeatureCard
                  icon="leaf.fill"
                  title="Farm Management"
                  description="Track your farming activities, manage your livestock, and analyze your performance."
                  index={3}
                />
              </View>

              <TouchableOpacity style={styles.featureShowcaseButton}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.1)', 'rgba(33, 150, 243, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureShowcaseGradient}
                >
                  <View style={styles.featureShowcaseContent}>
                    <View style={styles.featureShowcaseTextContainer}>
                      <Text style={styles.featureShowcaseTitle}>Intelligent Weather Forecasts</Text>
                      <Text style={styles.featureShowcaseDescription}>
                        Receive personalized alerts and recommendations based on local weather conditions.
                      </Text>
                    </View>
                    <View style={styles.featureShowcaseIconContainer}>
                      <IconSymbol name="cloud.sun.fill" size={40} color="#2196F3" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>

        {/* Section Témoignages avec animation et design moderne */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.sectionSurface}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <IconSymbol name="bubble.left.fill" size={24} color="#9C27B0" />
                  <Text style={styles.sectionTitle}>Farmer Testimonials</Text>
                </View>
                <View style={styles.testimonialRating}>
                  <IconSymbol name="star.fill" size={16} color="#FFC107" />
                  <IconSymbol name="star.fill" size={16} color="#FFC107" />
                  <IconSymbol name="star.fill" size={16} color="#FFC107" />
                  <IconSymbol name="star.fill" size={16} color="#FFC107" />
                  <IconSymbol name="star.fill" size={16} color="#FFC107" />
                  <Text style={styles.testimonialRatingText}>4.9/5</Text>
                </View>
              </View>
              <Divider style={styles.sectionDivider} />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.testimonialContainer}
                decelerationRate="fast"
                snapToInterval={width * 0.85 + 15}
                snapToAlignment="center"
                pagingEnabled
              >
                <TestimonialCard
                  quote="AgriConnect has transformed how I manage my farm. Expert advice has helped me increase my yields by 20% and reduce my operating costs."
                  author="Thomas Dubois"
                  role="Grain Farmer | User for 2 years"
                  image={require('@/assets/images/logo.png')}
                  index={0}
                />
                <TestimonialCard
                  quote="Thanks to the online marketplace, I've been able to find new customers and sell my products at a better price. The app is intuitive and easy to use."
                  author="Marie Laurent"
                  role="Goat Farmer | User for 1 year"
                  image={require('@/assets/images/logo.png')}
                  index={1}
                />
                <TestimonialCard
                  quote="The agricultural encyclopedia is a wealth of information. I consult the app daily to improve my practices and stay informed about the latest innovations."
                  author="Jean Moreau"
                  role="Organic Market Gardener | User for 6 months"
                  image={require('@/assets/images/logo.png')}
                  index={2}
                />
              </ScrollView>

              <View style={styles.testimonialPagination}>
                <View style={[styles.testimonialPaginationDot, styles.testimonialPaginationDotActive]} />
                <View style={styles.testimonialPaginationDot} />
                <View style={styles.testimonialPaginationDot} />
              </View>
            </View>
          </Surface>
        </View>

        {/* Section Statistiques */}
        <View style={styles.statsSectionWrapper}>
          <LinearGradient
            colors={['rgba(33, 150, 243, 0.05)', 'rgba(76, 175, 80, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <Surface style={styles.statsSurface}>
              <View style={styles.statsSection}>
                <Text style={styles.statsTitle}>AgriConnect in Numbers</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsNumber}>10K+</Text>
                    <Text style={styles.statsLabel}>Farmers</Text>
                  </View>

                  <View style={styles.statsItem}>
                    <Text style={styles.statsNumber}>500+</Text>
                    <Text style={styles.statsLabel}>Experts</Text>
                  </View>

                  <View style={styles.statsItem}>
                    <Text style={styles.statsNumber}>5K+</Text>
                    <Text style={styles.statsLabel}>Products</Text>
                  </View>

                  <View style={styles.statsItem}>
                    <Text style={styles.statsNumber}>50+</Text>
                    <Text style={styles.statsLabel}>Countries</Text>
                  </View>
                </View>
              </View>
            </Surface>
          </LinearGradient>
        </View>

        {/* Section Appel à l'action avec animation et design moderne */}
        <View style={styles.ctaSectionWrapper}>
          <ImageBackground
            source={require('@/assets/images/crops.jpg')}
            style={styles.ctaBackground}
            resizeMode="cover"
            blurRadius={Platform.OS === 'ios' ? 5 : 2}
          >
            <LinearGradient
              colors={['rgba(33, 33, 33, 0.8)', 'rgba(76, 175, 80, 0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Surface style={styles.ctaSurface}>
                <View style={styles.ctaSection}>
                  <View style={styles.ctaIconContainer}>
                    <IconSymbol name="person.badge.plus" size={40} color="white" style={styles.ctaIcon} />
                  </View>
                  <Text style={styles.ctaTitle}>Ready to join the community?</Text>
                  <Text style={styles.ctaDescription}>
                    Create a free account and start enjoying all the features of AgriConnect.
                    Join thousands of farmers who are already optimizing their operations.
                  </Text>

                  <View style={styles.ctaFeatures}>
                    <View style={styles.ctaFeatureItem}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color={COLORS.primary.main} />
                      <Text style={styles.ctaFeatureText}>Access to all features</Text>
                    </View>
                    <View style={styles.ctaFeatureItem}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color={COLORS.primary.main} />
                      <Text style={styles.ctaFeatureText}>24/7 technical support</Text>
                    </View>
                    <View style={styles.ctaFeatureItem}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color={COLORS.primary.main} />
                      <Text style={styles.ctaFeatureText}>Regular updates</Text>
                    </View>
                  </View>

                  <View style={styles.ctaButtons}>
                    <Button
                      mode="contained"
                      onPress={handleRegister}
                      style={styles.ctaButton}
                      labelStyle={styles.ctaButtonLabel}
                      icon="account-plus"
                    >
                      Register for free
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={handleLogin}
                      style={styles.ctaButtonOutline}
                      labelStyle={styles.ctaButtonOutlineLabel}
                      icon="login"
                    >
                      Login
                    </Button>
                  </View>
                </View>
              </Surface>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Pied de page amélioré avec design moderne */}
        <View style={styles.footerWrapper}>
          <LinearGradient
            colors={['rgba(33, 33, 33, 0.95)', 'rgba(33, 33, 33, 0.98)']}
            style={styles.footerGradient}
          >
            <View style={styles.footer}>
              <View style={styles.footerTop}>
                <View style={styles.footerBrand}>
                  <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.footerLogo}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={styles.footerTitle}>
                      Agri<Text style={styles.footerTitleHighlight}>Connect</Text>
                    </Text>
                    <Text style={styles.footerSlogan}>Growing the future together</Text>
                  </View>
                </View>

                <View style={styles.footerSocial}>
                  <TouchableOpacity style={styles.footerSocialIcon}>
                    <IconSymbol name="facebook" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerSocialIcon}>
                    <IconSymbol name="twitter" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerSocialIcon}>
                    <IconSymbol name="instagram" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerSocialIcon}>
                    <IconSymbol name="youtube" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footerColumns}>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Product</Text>
                  <TouchableOpacity><Text style={styles.footerLink}>Features</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Pricing</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Testimonials</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>FAQ</Text></TouchableOpacity>
                </View>

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Resources</Text>
                  <TouchableOpacity><Text style={styles.footerLink}>Blog</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Guides</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Webinars</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Support</Text></TouchableOpacity>
                </View>

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Company</Text>
                  <TouchableOpacity><Text style={styles.footerLink}>About</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Careers</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Partners</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Contact</Text></TouchableOpacity>
                </View>

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Legal</Text>
                  <TouchableOpacity><Text style={styles.footerLink}>Privacy</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Terms</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Cookies</Text></TouchableOpacity>
                  <TouchableOpacity><Text style={styles.footerLink}>Licenses</Text></TouchableOpacity>
                </View>
              </View>

              <Divider style={styles.footerDivider} />

              <View style={styles.footerBottom}>
                <Text style={styles.footerCopyright}>© 2023 AgriConnect - All rights reserved</Text>
                <View style={styles.footerLanguage}>
                  <IconSymbol name="globe" size={16} color="#aaa" />
                  <Text style={styles.footerLanguageText}>English</Text>
                  <IconSymbol name="chevron.down" size={12} color="#aaa" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Styles pour l'alerte météo
  alertContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 225, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#5D4037',
    fontWeight: '500',
  },
  alertCloseButton: {
    padding: 5,
  },

  // Styles pour le menu d'accès rapide
  quickAccessContainer: {
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 120 : 100,
    marginBottom: 16,
    zIndex: 50,
  },
  quickAccessSurface: {
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  quickAccessContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  quickAccessItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },

  // Styles pour l'en-tête
  headerContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 550 : 520,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    height: '100%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoTextHighlight: {
    color: '#8BC34A',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    marginLeft: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: COLORS.primary.main,
    fontWeight: '700',
    marginLeft: 5,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8BC34A',
    marginBottom: 5,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  heroTitleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroTitleHighlight: {
    color: '#8BC34A',
  },
  heroTitleUnderline: {
    height: 4,
    width: 80,
    backgroundColor: '#8BC34A',
    borderRadius: 2,
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroDescriptionContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  heroDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    lineHeight: 24,
    maxWidth: '90%',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '90%',
  },
  heroStatItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  heroStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  heroButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  heroButtonLabel: {
    color: COLORS.primary.main,
    fontWeight: 'bold',
    fontSize: 16,
  },
  heroButtonSecondary: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderColor: 'white',
    borderWidth: 2,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  heroButtonSecondaryLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Styles pour le contenu
  content: {
    flex: 1,
    paddingTop: 20,
    marginTop: -30,
  },

  // Styles pour les sections
  sectionWrapper: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionSurface: {
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  section: {
    padding: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  sectionBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  sectionBadgeText: {
    color: COLORS.primary.main,
    fontWeight: '600',
    fontSize: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllButtonText: {
    color: COLORS.primary.main,
    fontWeight: '600',
    marginRight: 5,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: COLORS.primary.light,
    marginBottom: 20,
    width: '100%',
    opacity: 0.5,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  sectionMission: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginTop: 15,
    fontStyle: 'italic',
  },
  featuresSectionDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  aboutContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  aboutImage: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    marginRight: 20,
    marginBottom: 15,
  },
  aboutTextContainer: {
    flex: 1,
    minWidth: 250,
  },

  // Styles pour les cartes de fonctionnalités
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  featureCard: {
    width: '48%',
    marginBottom: 20,
  },
  featureCardSurface: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureShowcaseButton: {
    marginTop: 20,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  featureShowcaseGradient: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureShowcaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureShowcaseTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  featureShowcaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureShowcaseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureShowcaseIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles pour les témoignages
  testimonialContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  testimonialCard: {
    width: width * 0.85,
    marginHorizontal: 7.5,
  },
  testimonialCardSurface: {
    borderRadius: 15,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  testimonialContent: {
    flex: 1,
  },
  testimonialQuote: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialDivider: {
    height: 2,
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    marginBottom: 20,
    width: '30%',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  testimonialRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  testimonialRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialRatingText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  testimonialPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  testimonialPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  testimonialPaginationDotActive: {
    backgroundColor: '#9C27B0',
    width: 20,
  },

  // Styles pour la section statistiques
  statsSectionWrapper: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsSurface: {
    borderRadius: 20,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  statsSection: {
    padding: 25,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  statsItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 15,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary.main,
    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Styles pour la section d'appel à l'action
  ctaSectionWrapper: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  ctaBackground: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 0,
  },
  ctaSurface: {
    borderRadius: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  ctaSection: {
    padding: 30,
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaIcon: {
    marginBottom: 0,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    maxWidth: '90%',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  ctaFeatures: {
    width: '100%',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  ctaFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaFeatureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  ctaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  ctaButton: {
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  ctaButtonLabel: {
    color: COLORS.primary.main,
    fontWeight: 'bold',
    fontSize: 16,
  },
  ctaButtonOutline: {
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderColor: 'white',
    borderWidth: 2,
  },
  ctaButtonOutlineLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Styles pour le pied de page
  footerWrapper: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  footerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footer: {
    width: '100%',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  footerTitleHighlight: {
    color: '#8BC34A',
  },
  footerSlogan: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  footerSocial: {
    flexDirection: 'row',
  },
  footerSocialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  footerColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  footerColumn: {
    width: '22%',
    minWidth: 150,
    marginBottom: 20,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  footerLink: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginBottom: 20,
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerCopyright: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  footerLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLanguageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
});
