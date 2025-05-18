import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AuthService from '@/services/AuthService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clear field errors when input changes
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text) setEmailError('');
    if (error) setError(null);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    return isValid;
  };

  // Handle password reset request
  const handleResetRequest = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      console.error('Password reset request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient
        colors={['#0056B3', '#0088E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={styles.title}>
              Forgot Password
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Reset your AgriConnect password
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
          {success ? (
            <View style={styles.successContainer}>
              <IconSymbol name="checkmark.circle.fill" size={64} color="#4CAF50" style={styles.successIcon} />
              <ThemedText type="subtitle" style={styles.successTitle}>Reset Email Sent</ThemedText>
              <ThemedText style={styles.successText}>
                We've sent password reset instructions to your email. Please check your inbox and follow the instructions to reset your password.
              </ThemedText>
              <Button
                mode="contained"
                onPress={() => router.push('/auth/login')}
                style={styles.backToLoginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Back to Login
              </Button>
            </View>
          ) : (
            <>
              <ThemedText style={styles.formDescription}>
                Enter your email address below and we'll send you instructions to reset your password.
              </ThemedText>

              {error && (
                <View style={styles.errorContainer}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F44336" />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
                disabled={isLoading}
                left={<TextInput.Icon icon="email" />}
                theme={{ colors: { primary: '#0088E0' } }}
                outlineColor="#E0E0E0"
                activeOutlineColor="#0088E0"
              />
              {emailError ? <ThemedText style={styles.fieldError}>{emailError}</ThemedText> : null}

              <Button
                mode="contained"
                onPress={handleResetRequest}
                style={styles.resetButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                disabled={isLoading}
                loading={isLoading}
              >
                Send Reset Instructions
              </Button>

              <View style={styles.loginContainer}>
                <ThemedText style={styles.loginText}>Remember your password? </ThemedText>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity>
                    <ThemedText style={styles.loginLink}>Sign In</ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
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
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
    fontSize: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  fieldError: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  resetButton: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#0088E0',
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#757575',
  },
  loginLink: {
    fontSize: 14,
    color: '#0088E0',
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575',
    lineHeight: 22,
  },
  backToLoginButton: {
    width: '100%',
    backgroundColor: '#0088E0',
    borderRadius: 8,
  },
});
