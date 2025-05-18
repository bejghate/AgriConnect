import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';

// Mock voice recognition for demo purposes
// In a real app, you would use a library like react-native-voice
const mockVoiceRecognition = (callback: (result: string) => void) => {
  // This is just a mock implementation
  // In a real app, you would use a proper voice recognition library
  return {
    start: () => {
      console.log('Voice recognition started');
    },
    stop: () => {
      console.log('Voice recognition stopped');
    },
    destroy: () => {
      console.log('Voice recognition destroyed');
    },
    onResult: callback,
    isListening: false,
  };
};

// Command mapping
const COMMANDS = {
  'search': '/search',
  'home': '/',
  'encyclopedia': '/encyclopedia',
  'marketplace': '/marketplace',
  'experts': '/experts',
  'farm': '/farm-management',
  'financial': '/financial-services',
  'forum': '/forum',
  'profile': '/profile',
  'settings': '/settings',
  'help': '/help',
  'back': 'BACK',
  'history': 'HISTORY',
  'data saving': 'DATA_SAVING',
};

interface VoiceCommandHandlerProps {
  onCommand?: (command: string) => void;
}

/**
 * Component to handle voice commands
 */
export const VoiceCommandHandler: React.FC<VoiceCommandHandlerProps> = ({
  onCommand,
}) => {
  const router = useRouter();
  const { preferences } = useAccessibilityContext();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [commandExecuted, setCommandExecuted] = useState(false);
  const appState = useRef(AppState.currentState);
  
  // Voice recognition reference
  const voiceRecognition = useRef(
    mockVoiceRecognition((result) => {
      setRecognizedText(result);
      handleCommand(result);
    })
  );
  
  // Initialize voice recognition
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web implementation would go here
      return;
    }
    
    // Start listening when voice commands are enabled
    if (preferences.voiceCommands) {
      startListening();
    }
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        preferences.voiceCommands
      ) {
        // App has come to the foreground
        startListening();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background
        stopListening();
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      stopListening();
      subscription.remove();
    };
  }, [preferences.voiceCommands]);
  
  // Start listening for voice commands
  const startListening = () => {
    if (!isListening && preferences.voiceCommands) {
      try {
        voiceRecognition.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };
  
  // Stop listening for voice commands
  const stopListening = () => {
    if (isListening) {
      try {
        voiceRecognition.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  };
  
  // Handle recognized command
  const handleCommand = (text: string) => {
    if (!text) return;
    
    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Check for commands
    let commandFound = false;
    
    Object.entries(COMMANDS).forEach(([command, action]) => {
      if (lowerText.includes(command)) {
        executeCommand(command, action);
        commandFound = true;
      }
    });
    
    // Show feedback
    if (commandFound) {
      showCommandFeedback(text, true);
    } else {
      showCommandFeedback(text, false);
    }
  };
  
  // Execute a command
  const executeCommand = (command: string, action: string) => {
    // Call the onCommand callback if provided
    if (onCommand) {
      onCommand(command);
    }
    
    // Handle special commands
    if (action === 'BACK') {
      router.back();
    } else if (action === 'HISTORY') {
      // This would be handled by the parent component
    } else if (action === 'DATA_SAVING') {
      // This would be handled by the parent component
    } else {
      // Navigate to the specified route
      router.push(action);
    }
    
    setCommandExecuted(true);
  };
  
  // Show feedback for recognized command
  const showCommandFeedback = (text: string, success: boolean) => {
    setRecognizedText(text);
    setShowFeedback(true);
    setCommandExecuted(success);
    
    // Hide feedback after a delay
    setTimeout(() => {
      setShowFeedback(false);
      setRecognizedText('');
    }, 3000);
  };
  
  // Don't render anything if voice commands are disabled
  if (!preferences.voiceCommands) {
    return null;
  }
  
  return (
    <>
      {showFeedback && (
        <ThemedView style={styles.feedbackContainer}>
          <ThemedView
            style={[
              styles.feedbackContent,
              commandExecuted ? styles.successFeedback : styles.errorFeedback,
            ]}
          >
            <IconSymbol
              name={commandExecuted ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
              size={24}
              color={commandExecuted ? COLORS.state.success : COLORS.state.error}
              style={styles.feedbackIcon}
            />
            
            <ThemedView style={styles.feedbackTextContainer}>
              <ThemedText style={styles.recognizedText}>
                "{recognizedText}"
              </ThemedText>
              
              <ThemedText style={styles.feedbackText}>
                {commandExecuted
                  ? 'Command recognized'
                  : 'Command not recognized'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
      
      {isListening && (
        <ThemedView style={styles.listeningIndicator}>
          <IconSymbol
            name="mic.fill"
            size={16}
            color={COLORS.primary.main}
          />
        </ThemedView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successFeedback: {
    backgroundColor: `${COLORS.state.success}10`,
    borderColor: COLORS.state.success,
    borderWidth: 1,
  },
  errorFeedback: {
    backgroundColor: `${COLORS.state.error}10`,
    borderColor: COLORS.state.error,
    borderWidth: 1,
  },
  feedbackIcon: {
    marginRight: 12,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  recognizedText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#757575',
  },
  listeningIndicator: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: `${COLORS.primary.main}20`,
    borderRadius: 12,
    padding: 8,
    zIndex: 1000,
  },
});

export default VoiceCommandHandler;
