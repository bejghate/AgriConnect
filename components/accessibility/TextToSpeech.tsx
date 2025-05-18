import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';

// Mock text-to-speech for demo purposes
// In a real app, you would use a library like expo-speech
const mockTextToSpeech = () => {
  // This is just a mock implementation
  // In a real app, you would use a proper text-to-speech library
  return {
    speak: (text: string, options?: any) => {
      console.log('Speaking:', text, options);
      return Promise.resolve();
    },
    stop: () => {
      console.log('Speech stopped');
      return Promise.resolve();
    },
    isSpeaking: () => {
      return Promise.resolve(false);
    },
  };
};

interface TextToSpeechProps {
  text: string;
  contentDescription?: string;
  size?: number;
  color?: string;
  style?: any;
}

/**
 * Component to provide text-to-speech functionality
 */
export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  contentDescription,
  size = 20,
  color,
  style,
}) => {
  const { preferences, triggerHaptic } = useAccessibilityContext();
  const tts = useRef(mockTextToSpeech());
  const isSpeakingRef = useRef(false);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeakingRef.current) {
        tts.current.stop();
      }
    };
  }, []);
  
  // Handle speak button press
  const handleSpeak = async () => {
    if (preferences.hapticFeedback) {
      triggerHaptic('light');
    }
    
    try {
      // Check if already speaking
      const isSpeaking = await tts.current.isSpeaking();
      
      if (isSpeaking) {
        // Stop speaking if already speaking
        await tts.current.stop();
        isSpeakingRef.current = false;
      } else {
        // Start speaking
        await tts.current.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
        isSpeakingRef.current = true;
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };
  
  // Don't render if text-to-speech is disabled
  if (!preferences.textToSpeech) {
    return null;
  }
  
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleSpeak}
      accessibilityLabel={`Read aloud: ${contentDescription || text}`}
      accessibilityRole="button"
      accessibilityHint="Reads the text aloud using text-to-speech"
    >
      <IconSymbol
        name="speaker.wave.2.fill"
        size={size}
        color={color || COLORS.primary.main}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default TextToSpeech;
