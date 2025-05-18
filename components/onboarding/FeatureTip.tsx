import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { COLORS } from '@/constants/Theme';

// Feature tip position
export type TipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

// Feature tip props
interface FeatureTipProps {
  featureId: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  position?: TipPosition;
  targetRef?: React.RefObject<View>;
  children?: React.ReactNode;
  onClose?: () => void;
  showCondition?: boolean;
  delay?: number;
}

/**
 * Component to display contextual tips for features
 */
export const FeatureTip: React.FC<FeatureTipProps> = ({
  featureId,
  title,
  description,
  icon = 'lightbulb.fill',
  color = COLORS.accent.main,
  position = 'bottom',
  targetRef,
  children,
  onClose,
  showCondition = true,
  delay = 500,
}) => {
  const theme = useTheme();
  const { featureTipsShown, markFeatureTipShown } = useOnboarding();
  const { preferences, triggerHaptic } = useAccessibilityContext();
  
  // State
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [targetMeasurements, setTargetMeasurements] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Check if tip should be shown
  useEffect(() => {
    const shouldShowTip = showCondition && !featureTipsShown[featureId];
    
    if (shouldShowTip) {
      // Delay showing the tip
      const timer = setTimeout(() => {
        measureTarget();
        setIsVisible(true);
        
        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Trigger haptic feedback
        if (preferences.hapticFeedback) {
          triggerHaptic('light');
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [showCondition, featureTipsShown, featureId]);
  
  // Measure target element position
  const measureTarget = () => {
    if (targetRef?.current) {
      targetRef.current.measureInWindow((x, y, width, height) => {
        setTargetMeasurements({ x, y, width, height });
      });
    }
  };
  
  // Handle close
  const handleClose = () => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      
      // Mark feature tip as shown
      markFeatureTipShown(featureId);
      
      // Call onClose callback
      if (onClose) {
        onClose();
      }
    });
    
    // Trigger haptic feedback
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
  };
  
  // Calculate tip position
  const getTipPosition = () => {
    if (!targetMeasurements) {
      return {
        top: '50%',
        left: '50%',
        transform: [
          { translateX: -150 },
          { translateY: -75 },
        ],
      };
    }
    
    const { x, y, width, height } = targetMeasurements;
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    
    switch (position) {
      case 'top':
        return {
          bottom: windowHeight - y + 16,
          left: x + width / 2,
          transform: [
            { translateX: -150 },
          ],
        };
      case 'bottom':
        return {
          top: y + height + 16,
          left: x + width / 2,
          transform: [
            { translateX: -150 },
          ],
        };
      case 'left':
        return {
          top: y + height / 2,
          right: windowWidth - x + 16,
          transform: [
            { translateY: -75 },
          ],
        };
      case 'right':
        return {
          top: y + height / 2,
          left: x + width + 16,
          transform: [
            { translateY: -75 },
          ],
        };
      case 'center':
      default:
        return {
          top: y + height / 2,
          left: x + width / 2,
          transform: [
            { translateX: -150 },
            { translateY: -75 },
          ],
        };
    }
  };
  
  // Get arrow position
  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return styles.arrowBottom;
      case 'bottom':
        return styles.arrowTop;
      case 'left':
        return styles.arrowRight;
      case 'right':
        return styles.arrowLeft;
      case 'center':
      default:
        return null;
    }
  };
  
  if (!isVisible) {
    return children || null;
  }
  
  return (
    <>
      {children}
      
      <Modal
        transparent
        visible={isVisible}
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.tipContainer,
                getTipPosition(),
                {
                  opacity: fadeAnim,
                  transform: [
                    ...getTipPosition().transform,
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {getArrowPosition() && (
                <View style={[styles.arrow, getArrowPosition(), { borderBottomColor: color }]} />
              )}
              
              <ThemedView style={[styles.tipContent, { borderTopColor: color, borderTopWidth: 4 }]}>
                <ThemedView style={[styles.iconContainer, { backgroundColor: color }]}>
                  <IconSymbol name={icon} size={24} color="white" />
                </ThemedView>
                
                <ThemedText type="defaultSemiBold" style={styles.title}>
                  {title}
                </ThemedText>
                
                <ThemedText style={styles.description}>
                  {description}
                </ThemedText>
                
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: color }]}
                  onPress={handleClose}
                  accessibilityLabel="Close tip"
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.closeButtonText}>Got it</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tipContainer: {
    position: 'absolute',
    width: 300,
    maxWidth: '80%',
    zIndex: 1000,
  },
  tipContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    zIndex: 1001,
  },
  arrowTop: {
    top: -10,
    left: '50%',
    marginLeft: -10,
    transform: [{ rotate: '180deg' }],
  },
  arrowBottom: {
    bottom: -10,
    left: '50%',
    marginLeft: -10,
  },
  arrowLeft: {
    left: -10,
    top: '50%',
    marginTop: -10,
    transform: [{ rotate: '90deg' }],
  },
  arrowRight: {
    right: -10,
    top: '50%',
    marginTop: -10,
    transform: [{ rotate: '-90deg' }],
  },
});

export default FeatureTip;
