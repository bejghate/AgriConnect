import React from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import IconSymbol from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';
import ParallaxScrollView from '@/components/ui/ParallaxScrollView';

export default function AboutScreen() {
  const router = useRouter();

  const navigateBack = () => {
    router.back();
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E1F5FE', dark: '#01579B' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="info.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">About AgriConnect</ThemedText>
        </ThemedView>

        {/* Mission Section */}
        <Surface style={styles.sectionCard}>
          <ThemedView style={styles.sectionHeader}>
            <IconSymbol name="flag.fill" size={24} color={COLORS.primary.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>Our Mission</ThemedText>
          </ThemedView>
          <Divider style={styles.divider} />
          <ThemedText style={styles.paragraph}>
            AgriConnect is a mobile application designed to centralize digital resources for farmers, 
            livestock managers, agricultural professionals, suppliers, and buyers. Our mission is to 
            facilitate access to agricultural information, connect industry stakeholders, and optimize 
            farm management, even in areas with limited connectivity through a partial offline mode.
          </ThemedText>
        </Surface>

        {/* Context and Justification Section */}
        <Surface style={styles.sectionCard}>
          <ThemedView style={styles.sectionHeader}>
            <IconSymbol name="doc.text.fill" size={24} color={COLORS.primary.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>Context and Justification</ThemedText>
          </ThemedView>
          <Divider style={styles.divider} />
          
          <ThemedText style={styles.paragraph}>
            The agricultural sector faces major challenges that AgriConnect aims to address:
          </ThemedText>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="thermometer.sun" size={20} color="#FF9800" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Climate Change</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Unpredictable weather variations affecting crops and livestock.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="info.circle" size={20} color="#2196F3" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Lack of Access to Information</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Approximately 60% of farmers, especially in rural areas, do not have access to 
                technical advice in a timely manner (source: estimates based on FAO reports).
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="map" size={20} color="#4CAF50" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Logistical Difficulties</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Limited access to experts and markets for inputs and finished products.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="creditcard" size={20} color="#9C27B0" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Limited Financial Inclusion</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Restricted access to credit and financial services adapted to the agricultural sector.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="link" size={20} color="#F44336" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Value Chain Fragmentation</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Numerous intermediaries reducing producers' margins.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.challengeItem}>
            <IconSymbol name="desktopcomputer" size={20} color="#607D8B" />
            <ThemedView style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>Low Technology Adoption Rate</ThemedText>
              <ThemedText style={styles.challengeDescription}>
                Need for simple solutions adapted to users' technical level.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={[styles.paragraph, styles.conclusion]}>
            AgriConnect addresses these issues by centralizing digital resources in a mobile application 
            that is accessible even in areas with low connectivity thanks to a partial offline mode. 
            This initiative is part of a digital transformation of agriculture, promoting more sustainable 
            and profitable production.
          </ThemedText>
        </Surface>

        {/* Version Information */}
        <Surface style={styles.versionCard}>
          <ThemedView style={styles.versionInfo}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
          </ThemedView>
        </Surface>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    opacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  titleContainer: {
    marginBottom: 24,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  divider: {
    marginBottom: 16,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 22,
  },
  challengeItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  challengeContent: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    lineHeight: 20,
  },
  conclusion: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  versionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  versionInfo: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  versionText: {
    opacity: 0.7,
  },
});
