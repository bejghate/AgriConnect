import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, ProgressBar } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';
import SecurityService from '@/services/SecurityService';
import AuthService from '@/services/AuthService';
import { COLORS } from '@/constants/Theme';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useUser();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Password strength
  const passwordStrength = SecurityService.checkPasswordStrength(newPassword);

  const validateForm = () => {
    let isValid = true;
    
    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    } else {
      setCurrentPasswordError('');
    }
    
    // Validate new password
    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (passwordStrength.score < 2) {
      setNewPasswordError('Password is too weak. Please use a stronger password.');
      isValid = false;
    } else if (SecurityService.isCommonPassword(newPassword)) {
      setNewPasswordError('This password is too common and easily guessable');
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError('New password must be different from current password');
      isValid = false;
    } else {
      setNewPasswordError('');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await AuthService.changePassword(
        user.id,
        currentPassword,
        newPassword
      );
      
      if (success) {
        Alert.alert(
          'Password Changed',
          'Your password has been successfully changed.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to change password. Please try again.');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        setCurrentPasswordError('Current password is incorrect');
      } else {
        Alert.alert('Error', 'Failed to change password. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0: return '#F44336'; // Red
      case 1: return '#FF9800'; // Orange
      case 2: return '#FFC107'; // Amber
      case 3: return '#4CAF50'; // Green
      case 4: return '#2E7D32'; // Dark Green
      default: return '#E0E0E0'; // Grey
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SettingsHeader title="Change Password" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.formContainer}>
            <ThemedText style={styles.formDescription}>
              Create a strong password that you don't use for other accounts.
            </ThemedText>
            
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              mode="outlined"
              style={styles.input}
              error={!!currentPasswordError}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
              theme={{ colors: { primary: COLORS.primary.main } }}
            />
            {currentPasswordError ? (
              <ThemedText style={styles.errorText}>{currentPasswordError}</ThemedText>
            ) : null}
            
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              mode="outlined"
              style={styles.input}
              error={!!newPasswordError}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
              theme={{ colors: { primary: COLORS.primary.main } }}
            />
            {newPasswordError ? (
              <ThemedText style={styles.errorText}>{newPasswordError}</ThemedText>
            ) : null}
            
            {newPassword ? (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthLabelContainer}>
                  <ThemedText style={styles.strengthLabel}>Password Strength:</ThemedText>
                  <ThemedText style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                    {passwordStrength.feedback}
                  </ThemedText>
                </View>
                <ProgressBar
                  progress={(passwordStrength.score + 1) / 5}
                  color={getPasswordStrengthColor()}
                  style={styles.strengthBar}
                />
                <View style={styles.strengthChecklist}>
                  <View style={styles.strengthCheckItem}>
                    <IconSymbol
                      name={passwordStrength.isLongEnough ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      color={passwordStrength.isLongEnough ? '#4CAF50' : '#F44336'}
                    />
                    <ThemedText style={styles.strengthCheckText}>At least 8 characters</ThemedText>
                  </View>
                  <View style={styles.strengthCheckItem}>
                    <IconSymbol
                      name={passwordStrength.hasUpperCase ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      color={passwordStrength.hasUpperCase ? '#4CAF50' : '#F44336'}
                    />
                    <ThemedText style={styles.strengthCheckText}>Uppercase letter</ThemedText>
                  </View>
                  <View style={styles.strengthCheckItem}>
                    <IconSymbol
                      name={passwordStrength.hasLowerCase ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      color={passwordStrength.hasLowerCase ? '#4CAF50' : '#F44336'}
                    />
                    <ThemedText style={styles.strengthCheckText}>Lowercase letter</ThemedText>
                  </View>
                  <View style={styles.strengthCheckItem}>
                    <IconSymbol
                      name={passwordStrength.hasNumbers ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      color={passwordStrength.hasNumbers ? '#4CAF50' : '#F44336'}
                    />
                    <ThemedText style={styles.strengthCheckText}>Number</ThemedText>
                  </View>
                  <View style={styles.strengthCheckItem}>
                    <IconSymbol
                      name={passwordStrength.hasSpecialChars ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      color={passwordStrength.hasSpecialChars ? '#4CAF50' : '#F44336'}
                    />
                    <ThemedText style={styles.strengthCheckText}>Special character</ThemedText>
                  </View>
                </View>
              </View>
            ) : null}
            
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              mode="outlined"
              style={styles.input}
              error={!!confirmPasswordError}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              theme={{ colors: { primary: COLORS.primary.main } }}
            />
            {confirmPasswordError ? (
              <ThemedText style={styles.errorText}>{confirmPasswordError}</ThemedText>
            ) : null}
            
            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              disabled={isLoading}
              loading={isLoading}
            >
              Change Password
            </Button>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formDescription: {
    marginBottom: 24,
    color: '#757575',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  strengthContainer: {
    marginBottom: 16,
  },
  strengthLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
  },
  strengthChecklist: {
    marginTop: 12,
  },
  strengthCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthCheckText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#757575',
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: COLORS.primary.main,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
