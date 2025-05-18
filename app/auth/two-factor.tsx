import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput as RNTextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';
import { COLORS } from '@/constants/Theme';
import SecurityService from '@/services/SecurityService';
import AuthService from '@/services/AuthService';

export default function TwoFactorScreen() {
  const router = useRouter();
  const { userId, method = 'email' } = useLocalSearchParams();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const { login, isAuthenticated } = useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Start countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]; // Only take the first character if multiple are pasted
    }

    // Only allow digits
    if (!/^\d*$/.test(text)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on an empty input
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verification
  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await SecurityService.verifyTwoFactorAuth(userId as string, otpString);

      if (success) {
        try {
          // Get the token from the URL params or local storage
          const token = await AsyncStorage.getItem('temp_auth_token');

          if (!token) {
            setError('Authentication token not found. Please try logging in again.');
            return;
          }

          // Complete the login process
          const authResponse = await AuthService.completeTwoFactorAuth(userId as string, token);

          // Update the user context
          await login(authResponse);

          // Redirect to home
          router.replace('/');
        } catch (loginErr: any) {
          setError(loginErr.message || 'Failed to complete authentication. Please try again.');
          console.error('Complete authentication error:', loginErr);
        }
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please try again.');
      console.error('Two-factor verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await SecurityService.requestTwoFactorAuth(userId as string, method as 'sms' | 'email');
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
      console.error('Resend code error:', err);
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
              Two-Factor Authentication
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter the verification code sent to your {method === 'email' ? 'email' : 'phone'}
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <ThemedText style={styles.formDescription}>
              We've sent a 6-digit verification code to your {method === 'email' ? 'email address' : 'phone number'}.
              Enter the code below to verify your identity.
            </ThemedText>

            {error && (
              <View style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F44336" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            <View style={styles.otpContainer}>
              {Array(6).fill(0).map((_, index) => (
                <RNTextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.otpInput}
                  value={otp[index]}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>

            <Button
              mode="contained"
              onPress={handleVerify}
              style={styles.verifyButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              disabled={isLoading || otp.join('').length !== 6}
              loading={isLoading}
            >
              Verify
            </Button>

            <View style={styles.resendContainer}>
              <ThemedText style={styles.resendText}>
                Didn't receive the code?
              </ThemedText>
              {canResend ? (
                <Button
                  mode="text"
                  onPress={handleResend}
                  disabled={isLoading}
                  style={styles.resendButton}
                  labelStyle={styles.resendButtonLabel}
                >
                  Resend Code
                </Button>
              ) : (
                <ThemedText style={styles.countdownText}>
                  Resend in {countdown}s
                </ThemedText>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  verifyButton: {
    marginBottom: 16,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resendText: {
    color: '#757575',
    fontSize: 14,
  },
  resendButton: {
    marginLeft: 4,
  },
  resendButtonLabel: {
    color: '#0088E0',
    fontSize: 14,
  },
  countdownText: {
    color: '#0088E0',
    fontSize: 14,
    marginLeft: 4,
  },
});
