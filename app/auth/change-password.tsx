import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';
import AuthService from '@/services/AuthService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Clear field errors when input changes
  useEffect(() => {
    if (currentPassword) setCurrentPasswordError('');
  }, [currentPassword]);
  
  useEffect(() => {
    if (newPassword) setNewPasswordError('');
  }, [newPassword]);
  
  useEffect(() => {
    if (confirmPassword) setConfirmPasswordError('');
  }, [confirmPassword]);
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    }
    
    // Validate new password
    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('New password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle password change
  const handleChangePassword = async () => {
    // Clear any previous errors
    setError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <IconSymbol name="lock.shield" size={48} color="#0a7ea4" style={styles.headerIcon} />
          <ThemedText type="title" style={styles.title}>Change Password</ThemedText>
          <ThemedText style={styles.subtitle}>Update your account password</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.formContainer}>
          {success ? (
            <ThemedView style={styles.successContainer}>
              <IconSymbol name="checkmark.circle.fill" size={48} color="#4CAF50" style={styles.successIcon} />
              <ThemedText type="subtitle" style={styles.successTitle}>Password Changed Successfully</ThemedText>
              <ThemedText style={styles.successText}>
                Your password has been updated. You can now use your new password to log in.
              </ThemedText>
              <Button
                mode="contained"
                onPress={() => router.push('/profile')}
                style={styles.backToProfileButton}
              >
                Back to Profile
              </Button>
            </ThemedView>
          ) : (
            <>
              {error && (
                <ThemedView style={styles.errorContainer}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F44336" />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </ThemedView>
              )}
              
              <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showCurrentPassword}
                error={!!currentPasswordError}
                disabled={isSubmitting}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showCurrentPassword ? "eye-off" : "eye"}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
              />
              {currentPasswordError ? <ThemedText style={styles.fieldError}>{currentPasswordError}</ThemedText> : null}
              
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showNewPassword}
                error={!!newPasswordError}
                disabled={isSubmitting}
                left={<TextInput.Icon icon="lock-open" />}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? "eye-off" : "eye"}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
              />
              {newPasswordError ? <ThemedText style={styles.fieldError}>{newPasswordError}</ThemedText> : null}
              
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                error={!!confirmPasswordError}
                disabled={isSubmitting}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              {confirmPasswordError ? <ThemedText style={styles.fieldError}>{confirmPasswordError}</ThemedText> : null}
              
              <ThemedView style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  style={styles.saveButton}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Save Changes
                </Button>
              </ThemedView>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  fieldError: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  backToProfileButton: {
    width: '100%',
    paddingVertical: 8,
  },
});
