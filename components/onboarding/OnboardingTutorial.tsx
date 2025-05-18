import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ProgressBar, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { COLORS } from '@/constants/Theme';

// Storage key for onboarding completion
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_PROGRESS_KEY = 'onboarding_progress';

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AgriConnect',
    description: 'Your all-in-one platform for modern farming. Let\'s take a quick tour to help you get started.',
    icon: 'leaf.fill',
    color: COLORS.primary.main,
    image: require('@/assets/images/onboarding/welcome.png'),
  },
  {
    id: 'encyclopedia',
    title: 'Agricultural Encyclopedia',
    description: 'Access a comprehensive knowledge base covering crops, livestock, farming techniques, and more.',
    icon: 'book.fill',
    color: COLORS.categories.crops,
    image: require('@/assets/images/onboarding/encyclopedia.png'),
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Buy and sell agricultural products, find equipment, and connect with suppliers and buyers.',
    icon: 'cart.fill',
    color: COLORS.categories.livestock,
    image: require('@/assets/images/onboarding/marketplace.png'),
  },
  {
    id: 'experts',
    title: 'Expert Consultations',
    description: 'Connect with agricultural experts for personalized advice and solutions to your farming challenges.',
    icon: 'person.2.fill',
    color: COLORS.categories.weather,
    image: require('@/assets/images/onboarding/experts.png'),
  },
  {
    id: 'farm',
    title: 'Farm Management',
    description: 'Track your farm operations, monitor livestock health, and manage crop cycles with our digital tools.',
    icon: 'chart.bar.doc.horizontal.fill',
    color: COLORS.categories.general,
    image: require('@/assets/images/onboarding/farm.png'),
  },
  {
    id: 'offline',
    title: 'Offline Access',
    description: 'Access important information even without internet connection. Download content for offline use.',
    icon: 'arrow.down.circle.fill',
    color: COLORS.categories.soil,
    image: require('@/assets/images/onboarding/offline.png'),
  },
  {
    id: 'financial',
    title: 'Financial Services',
    description: 'Access agricultural loans, insurance, and financial planning tools to support your farming business.',
    icon: 'dollarsign.circle.fill',
    color: COLORS.categories.finance,
    image: require('@/assets/images/onboarding/financial.png'),
  },
  {
    id: 'community',
    title: 'Community Forum',
    description: 'Connect with other farmers, share experiences, and learn from the agricultural community.',
    icon: 'bubble.left.and.bubble.right.fill',
    color: COLORS.accent.main,
    image: require('@/assets/images/onboarding/community.png'),
  },
  {
    id: 'getstarted',
    title: 'Get Started',
    description: 'You\'re all set! Explore AgriConnect and discover how it can help you improve your farming operations.',
    icon: 'checkmark.circle.fill',
    color: COLORS.state.success,
    image: require('@/assets/images/onboarding/getstarted.png'),
  },
];

interface OnboardingTutorialProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: number;
}

/**
 * Interactive onboarding tutorial for new users
 */
export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isVisible,
  onClose,
  onComplete,
  initialStep = 0,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { preferences, triggerHaptic } = useAccessibilityContext();
  
  // State
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate progress
  const progress = (currentStep + 1) / ONBOARDING_STEPS.length;
  
  // Animation when step changes
  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(1);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Save progress
      saveProgress(currentStep);
    }
  }, [currentStep, isVisible]);
  
  // Animation when modal opens
  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);
  
  // Save onboarding progress
  const saveProgress = async (step: number) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, step.toString());
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };
  
  // Mark onboarding as completed
  const markOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('medium');
    }
    
    handleComplete();
  };
  
  // Handle complete
  const handleComplete = () => {
    markOnboardingCompleted();
    onComplete();
    onClose();
  };
  
  // Current step data
  const currentStepData = ONBOARDING_STEPS[currentStep];
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
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
        <ThemedView style={styles.content}>
          <ProgressBar
            progress={progress}
            color={currentStepData.color}
            style={styles.progressBar}
          />
          
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.stepContent,
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 100],
                      }),
                    },
                  ],
                  opacity: fadeAnim,
                },
              ]}
            >
              <ThemedView
                style={[
                  styles.iconContainer,
                  { backgroundColor: currentStepData.color },
                ]}
              >
                <IconSymbol
                  name={currentStepData.icon}
                  size={40}
                  color="white"
                />
              </ThemedView>
              
              <ThemedText type="title" style={styles.title}>
                {currentStepData.title}
              </ThemedText>
              
              <ThemedText style={styles.description}>
                {currentStepData.description}
              </ThemedText>
              
              {currentStepData.image && (
                <Image
                  source={currentStepData.image}
                  style={styles.image}
                  contentFit="cover"
                  transition={300}
                />
              )}
            </Animated.View>
          </ScrollView>
          
          <ThemedView style={styles.buttonsContainer}>
            {currentStep > 0 ? (
              <Button
                mode="text"
                onPress={handlePrevious}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Previous
              </Button>
            ) : (
              <Button
                mode="text"
                onPress={handleSkip}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Skip
              </Button>
            )}
            
            <Button
              mode="contained"
              onPress={handleNext}
              style={[styles.button, { backgroundColor: currentStepData.color }]}
              labelStyle={styles.buttonLabel}
            >
              {currentStep < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </ThemedView>
        </ThemedView>
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    borderRadius: 0,
  },
  scrollContent: {
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    minWidth: 100,
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default OnboardingTutorial;
