import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { useTheme, ProgressBar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { COLORS } from '@/constants/Theme';

// Feature data for progress tracking
const FEATURES = [
  {
    id: 'onboarding',
    title: 'Complete Onboarding',
    description: 'Learn the basics of AgriConnect',
    icon: 'checkmark.circle.fill',
    color: COLORS.state.success,
    points: 100,
  },
  {
    id: 'encyclopedia',
    title: 'Explore Encyclopedia',
    description: 'Browse the agricultural knowledge base',
    icon: 'book.fill',
    color: COLORS.categories.crops,
    points: 10,
  },
  {
    id: 'marketplace',
    title: 'Visit Marketplace',
    description: 'Discover products and services',
    icon: 'cart.fill',
    color: COLORS.categories.livestock,
    points: 10,
  },
  {
    id: 'experts',
    title: 'Connect with Experts',
    description: 'Explore expert consultations',
    icon: 'person.2.fill',
    color: COLORS.categories.weather,
    points: 10,
  },
  {
    id: 'farm',
    title: 'Farm Management',
    description: 'Try farm management tools',
    icon: 'chart.bar.doc.horizontal.fill',
    color: COLORS.categories.general,
    points: 10,
  },
  {
    id: 'offline',
    title: 'Offline Access',
    description: 'Download content for offline use',
    icon: 'arrow.down.circle.fill',
    color: COLORS.categories.soil,
    points: 10,
  },
  {
    id: 'financial',
    title: 'Financial Services',
    description: 'Explore financial tools',
    icon: 'dollarsign.circle.fill',
    color: COLORS.categories.finance,
    points: 10,
  },
  {
    id: 'community',
    title: 'Join Community',
    description: 'Participate in the forum',
    icon: 'bubble.left.and.bubble.right.fill',
    color: COLORS.accent.main,
    points: 10,
  },
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Fill in your profile information',
    icon: 'person.crop.circle.fill',
    color: COLORS.primary.main,
    points: 20,
  },
  {
    id: 'search',
    title: 'Use Search',
    description: 'Search for content across the app',
    icon: 'magnifyingglass',
    color: COLORS.secondary.main,
    points: 5,
  },
];

interface ProgressTrackerProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Component to display gamified progress tracking
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  isVisible,
  onClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { gamificationProgress } = useOnboarding();
  const { preferences, triggerHaptic } = useAccessibilityContext();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  
  // Calculate progress percentage
  const totalFeatures = FEATURES.length;
  const completedFeatures = gamificationProgress.featuresExplored.length;
  const progressPercentage = totalFeatures > 0 ? completedFeatures / totalFeatures : 0;
  
  // Calculate points to next level
  const pointsToNextLevel = (gamificationProgress.level * 100) - gamificationProgress.points;
  const levelProgress = 1 - (pointsToNextLevel / 100);
  
  // Animation when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Trigger haptic feedback
      if (preferences.hapticFeedback) {
        triggerHaptic('light');
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);
  
  // Handle close
  const handleClose = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    onClose();
  };
  
  // Check if feature is completed
  const isFeatureCompleted = (featureId: string) => {
    return gamificationProgress.featuresExplored.includes(featureId);
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Your Progress
            </ThemedText>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close progress tracker"
              accessibilityRole="button"
            >
              <IconSymbol name="xmark" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.levelContainer}>
              <ThemedView style={styles.levelBadge}>
                <ThemedText style={styles.levelText}>
                  Level {gamificationProgress.level}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.pointsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.pointsText}>
                  {gamificationProgress.points} Points
                </ThemedText>
                
                <ThemedText style={styles.nextLevelText}>
                  {pointsToNextLevel} points to next level
                </ThemedText>
                
                <ProgressBar
                  progress={levelProgress}
                  color={COLORS.primary.main}
                  style={styles.levelProgressBar}
                />
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.featuresContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Features Explored
              </ThemedText>
              
              <ThemedText style={styles.progressText}>
                {completedFeatures} of {totalFeatures} features ({Math.round(progressPercentage * 100)}%)
              </ThemedText>
              
              <ProgressBar
                progress={progressPercentage}
                color={COLORS.accent.main}
                style={styles.progressBar}
              />
              
              <ThemedView style={styles.featuresList}>
                {FEATURES.map((feature) => (
                  <ThemedView
                    key={feature.id}
                    style={[
                      styles.featureItem,
                      isFeatureCompleted(feature.id) && styles.completedFeatureItem,
                    ]}
                  >
                    <ThemedView
                      style={[
                        styles.featureIconContainer,
                        { backgroundColor: isFeatureCompleted(feature.id) ? feature.color : '#e0e0e0' },
                      ]}
                    >
                      <IconSymbol
                        name={feature.icon}
                        size={20}
                        color="white"
                      />
                    </ThemedView>
                    
                    <ThemedView style={styles.featureTextContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                        {feature.title}
                      </ThemedText>
                      
                      <ThemedText style={styles.featureDescription}>
                        {feature.description}
                      </ThemedText>
                    </ThemedView>
                    
                    <ThemedView style={styles.featurePointsContainer}>
                      <ThemedText style={styles.featurePoints}>
                        +{feature.points}
                      </ThemedText>
                      
                      {isFeatureCompleted(feature.id) && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={16}
                          color={COLORS.state.success}
                        />
                      )}
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pointsContainer: {
    flex: 1,
  },
  pointsText: {
    fontSize: 18,
    marginBottom: 4,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  levelProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  completedFeatureItem: {
    backgroundColor: '#E8F5E9',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#757575',
  },
  featurePointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featurePoints: {
    fontWeight: 'bold',
    color: COLORS.primary.main,
    marginRight: 4,
  },
});

export default ProgressTracker;
