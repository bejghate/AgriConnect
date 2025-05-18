import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_PROGRESS_KEY = 'onboarding_progress';
const FEATURE_TIPS_KEY = 'feature_tips_shown';
const ONBOARDING_GAMIFICATION_KEY = 'onboarding_gamification';

// Interface for onboarding state
export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  featureTipsShown: Record<string, boolean>;
  gamificationProgress: {
    points: number;
    level: number;
    featuresExplored: string[];
  };
}

// Interface for onboarding hook return value
export interface UseOnboardingReturn extends OnboardingState {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  markOnboardingCompleted: () => Promise<void>;
  saveOnboardingProgress: (step: number) => Promise<void>;
  markFeatureTipShown: (featureId: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  addGamificationPoints: (points: number, feature?: string) => Promise<void>;
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding(): UseOnboardingReturn {
  // State
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [featureTipsShown, setFeatureTipsShown] = useState<Record<string, boolean>>({});
  const [gamificationProgress, setGamificationProgress] = useState<OnboardingState['gamificationProgress']>({
    points: 0,
    level: 1,
    featuresExplored: [],
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load onboarding state from storage
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        // Load onboarding completion status
        const completedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        const isCompletedValue = completedValue === 'true';
        setIsCompleted(isCompletedValue);
        
        // Load onboarding progress
        const progressValue = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);
        const currentStepValue = progressValue ? parseInt(progressValue, 10) : 0;
        setCurrentStep(currentStepValue);
        
        // Load feature tips shown
        const featureTipsValue = await AsyncStorage.getItem(FEATURE_TIPS_KEY);
        const featureTipsShownValue = featureTipsValue ? JSON.parse(featureTipsValue) : {};
        setFeatureTipsShown(featureTipsShownValue);
        
        // Load gamification progress
        const gamificationValue = await AsyncStorage.getItem(ONBOARDING_GAMIFICATION_KEY);
        const gamificationProgressValue = gamificationValue ? JSON.parse(gamificationValue) : {
          points: 0,
          level: 1,
          featuresExplored: [],
        };
        setGamificationProgress(gamificationProgressValue);
        
        // Show onboarding if not completed
        setShowOnboarding(!isCompletedValue);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading onboarding state:', error);
        setIsLoading(false);
      }
    };
    
    loadOnboardingState();
  }, []);
  
  // Mark onboarding as completed
  const markOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setIsCompleted(true);
      
      // Add points for completing onboarding
      await addGamificationPoints(100, 'onboarding');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  };
  
  // Save onboarding progress
  const saveOnboardingProgress = async (step: number) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, step.toString());
      setCurrentStep(step);
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };
  
  // Mark feature tip as shown
  const markFeatureTipShown = async (featureId: string) => {
    try {
      const updatedFeatureTips = {
        ...featureTipsShown,
        [featureId]: true,
      };
      
      await AsyncStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(updatedFeatureTips));
      setFeatureTipsShown(updatedFeatureTips);
      
      // Add points for discovering a feature
      await addGamificationPoints(10, featureId);
    } catch (error) {
      console.error('Error marking feature tip as shown:', error);
    }
  };
  
  // Reset onboarding
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      
      setIsCompleted(false);
      setCurrentStep(0);
      setShowOnboarding(true);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };
  
  // Add gamification points
  const addGamificationPoints = async (points: number, feature?: string) => {
    try {
      const newPoints = gamificationProgress.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      // Add feature to explored features if provided and not already explored
      let newFeaturesExplored = [...gamificationProgress.featuresExplored];
      if (feature && !newFeaturesExplored.includes(feature)) {
        newFeaturesExplored.push(feature);
      }
      
      const newGamificationProgress = {
        points: newPoints,
        level: newLevel,
        featuresExplored: newFeaturesExplored,
      };
      
      await AsyncStorage.setItem(ONBOARDING_GAMIFICATION_KEY, JSON.stringify(newGamificationProgress));
      setGamificationProgress(newGamificationProgress);
    } catch (error) {
      console.error('Error adding gamification points:', error);
    }
  };
  
  return {
    isCompleted,
    currentStep,
    featureTipsShown,
    gamificationProgress,
    showOnboarding,
    setShowOnboarding,
    markOnboardingCompleted,
    saveOnboardingProgress,
    markFeatureTipShown,
    resetOnboarding,
    addGamificationPoints,
  };
}

export default useOnboarding;
