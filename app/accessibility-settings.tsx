import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { List, Switch, RadioButton, Divider, Button } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AppHeader } from '@/components/navigation/AppHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibility, FontSizeType } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/Theme';

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const {
    preferences,
    loading,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setHapticFeedback,
    setScreenReaderEnabled,
    triggerHaptic,
    resetPreferences,
  } = useAccessibility();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Gérer le changement de taille de police
  const handleFontSizeChange = (size: FontSizeType) => {
    setFontSize(size);
    triggerHaptic('light');
  };
  
  // Gérer le changement de contraste élevé
  const handleHighContrastChange = (value: boolean) => {
    setHighContrast(value);
    triggerHaptic(value ? 'medium' : 'light');
  };
  
  // Gérer le changement de réduction des animations
  const handleReduceMotionChange = (value: boolean) => {
    setReduceMotion(value);
    triggerHaptic('light');
  };
  
  // Gérer le changement de retour haptique
  const handleHapticFeedbackChange = (value: boolean) => {
    setHapticFeedback(value);
    if (value) {
      triggerHaptic('medium');
    }
  };
  
  // Gérer le changement de mode lecteur d'écran
  const handleScreenReaderChange = (value: boolean) => {
    setScreenReaderEnabled(value);
    triggerHaptic('light');
  };
  
  // Gérer la réinitialisation des préférences
  const handleResetPreferences = () => {
    resetPreferences();
    setShowResetConfirm(false);
    triggerHaptic('success');
  };
  
  // Obtenir la taille de police en fonction des préférences
  const getFontSize = (size: FontSizeType) => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      case 'extra-large':
        return 20;
      default:
        return 16;
    }
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="Paramètres d'accessibilité" showBack />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Chargement des préférences...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <AppHeader
        title="Paramètres d'accessibilité"
        showBack
        accessibilityLabel="Paramètres d'accessibilité"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.description}>
          Personnalisez l'application selon vos besoins d'accessibilité pour une meilleure expérience.
        </ThemedText>
        
        {/* Section Taille de police */}
        <List.Section>
          <List.Subheader>Taille de police</List.Subheader>
          
          <RadioButton.Group
            onValueChange={(value) => handleFontSizeChange(value as FontSizeType)}
            value={preferences.fontSize}
          >
            <List.Item
              title={<ThemedText style={{ fontSize: getFontSize('small') }}>Petite</ThemedText>}
              left={() => <RadioButton value="small" />}
              onPress={() => handleFontSizeChange('small')}
              accessibilityLabel="Petite taille de police"
              accessibilityHint="Définit la taille de police à petite"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'small' }}
            />
            
            <List.Item
              title={<ThemedText style={{ fontSize: getFontSize('medium') }}>Moyenne</ThemedText>}
              left={() => <RadioButton value="medium" />}
              onPress={() => handleFontSizeChange('medium')}
              accessibilityLabel="Taille de police moyenne"
              accessibilityHint="Définit la taille de police à moyenne"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'medium' }}
            />
            
            <List.Item
              title={<ThemedText style={{ fontSize: getFontSize('large') }}>Grande</ThemedText>}
              left={() => <RadioButton value="large" />}
              onPress={() => handleFontSizeChange('large')}
              accessibilityLabel="Grande taille de police"
              accessibilityHint="Définit la taille de police à grande"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'large' }}
            />
            
            <List.Item
              title={<ThemedText style={{ fontSize: getFontSize('extra-large') }}>Très grande</ThemedText>}
              left={() => <RadioButton value="extra-large" />}
              onPress={() => handleFontSizeChange('extra-large')}
              accessibilityLabel="Très grande taille de police"
              accessibilityHint="Définit la taille de police à très grande"
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.fontSize === 'extra-large' }}
            />
          </RadioButton.Group>
        </List.Section>
        
        <Divider />
        
        {/* Section Affichage */}
        <List.Section>
          <List.Subheader>Affichage</List.Subheader>
          
          <List.Item
            title="Mode contraste élevé"
            description="Améliore la lisibilité avec des contrastes plus prononcés"
            left={() => <IconSymbol name="eye" size={24} style={styles.icon} />}
            right={() => (
              <Switch
                value={preferences.highContrast}
                onValueChange={handleHighContrastChange}
              />
            )}
            onPress={() => handleHighContrastChange(!preferences.highContrast)}
            accessibilityLabel="Mode contraste élevé"
            accessibilityHint="Active ou désactive le mode contraste élevé"
            accessibilityRole="switch"
            accessibilityState={{ checked: preferences.highContrast }}
          />
          
          <List.Item
            title="Réduire les animations"
            description="Limite les animations et les transitions"
            left={() => <IconSymbol name="wand.and.stars" size={24} style={styles.icon} />}
            right={() => (
              <Switch
                value={preferences.reduceMotion}
                onValueChange={handleReduceMotionChange}
              />
            )}
            onPress={() => handleReduceMotionChange(!preferences.reduceMotion)}
            accessibilityLabel="Réduire les animations"
            accessibilityHint="Active ou désactive la réduction des animations"
            accessibilityRole="switch"
            accessibilityState={{ checked: preferences.reduceMotion }}
          />
        </List.Section>
        
        <Divider />
        
        {/* Section Interactions */}
        <List.Section>
          <List.Subheader>Interactions</List.Subheader>
          
          {Platform.OS !== 'web' && (
            <List.Item
              title="Retour haptique"
              description="Vibrations légères lors des interactions"
              left={() => <IconSymbol name="iphone.radiowaves.left.and.right" size={24} style={styles.icon} />}
              right={() => (
                <Switch
                  value={preferences.hapticFeedback}
                  onValueChange={handleHapticFeedbackChange}
                />
              )}
              onPress={() => handleHapticFeedbackChange(!preferences.hapticFeedback)}
              accessibilityLabel="Retour haptique"
              accessibilityHint="Active ou désactive le retour haptique"
              accessibilityRole="switch"
              accessibilityState={{ checked: preferences.hapticFeedback }}
            />
          )}
          
          <List.Item
            title="Optimisé pour les lecteurs d'écran"
            description="Améliore la compatibilité avec VoiceOver et TalkBack"
            left={() => <IconSymbol name="speaker.wave.2" size={24} style={styles.icon} />}
            right={() => (
              <Switch
                value={preferences.screenReaderEnabled}
                onValueChange={handleScreenReaderChange}
              />
            )}
            onPress={() => handleScreenReaderEnabled(!preferences.screenReaderEnabled)}
            accessibilityLabel="Optimisé pour les lecteurs d'écran"
            accessibilityHint="Active ou désactive l'optimisation pour les lecteurs d'écran"
            accessibilityRole="switch"
            accessibilityState={{ checked: preferences.screenReaderEnabled }}
          />
        </List.Section>
        
        <Divider />
        
        {/* Section Réinitialisation */}
        <List.Section>
          <List.Subheader>Réinitialisation</List.Subheader>
          
          {!showResetConfirm ? (
            <List.Item
              title="Réinitialiser les paramètres"
              description="Restaurer tous les paramètres d'accessibilité par défaut"
              left={() => <IconSymbol name="arrow.counterclockwise" size={24} style={styles.icon} />}
              onPress={() => setShowResetConfirm(true)}
              accessibilityLabel="Réinitialiser les paramètres"
              accessibilityHint="Restaure tous les paramètres d'accessibilité par défaut"
            />
          ) : (
            <ThemedView style={styles.resetConfirmContainer}>
              <ThemedText style={styles.resetConfirmText}>
                Êtes-vous sûr de vouloir réinitialiser tous les paramètres d'accessibilité ?
              </ThemedText>
              
              <View style={styles.resetButtonsContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setShowResetConfirm(false)}
                  style={styles.resetButton}
                  accessibilityLabel="Annuler"
                >
                  Annuler
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleResetPreferences}
                  style={[styles.resetButton, styles.confirmButton]}
                  accessibilityLabel="Confirmer la réinitialisation"
                >
                  Confirmer
                </Button>
              </View>
            </ThemedView>
          )}
        </List.Section>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    padding: 16,
    paddingBottom: 8,
    opacity: 0.7,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
  },
  resetConfirmContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    margin: 16,
    borderRadius: 8,
  },
  resetConfirmText: {
    marginBottom: 16,
  },
  resetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resetButton: {
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.state.error,
  },
});
