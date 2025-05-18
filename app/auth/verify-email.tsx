import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AuthService from '@/services/AuthService';
import { COLORS } from '@/constants/Theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setIsLoading(false);
        return;
      }

      try {
        await AuthService.verifyEmail(token as string);
        setIsVerified(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify email. The link may be expired or invalid.');
        console.error('Email verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await AuthService.resendVerificationEmail();
      setError('A new verification email has been sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email. Please try again later.');
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
              Email Verification
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Verify your AgriConnect account
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary.main} />
                <ThemedText style={styles.loadingText}>
                  Verifying your email...
                </ThemedText>
              </View>
            ) : isVerified ? (
              <View style={styles.successContainer}>
                <IconSymbol name="checkmark.circle.fill" size={64} color="#4CAF50" style={styles.successIcon} />
                <ThemedText type="subtitle" style={styles.successTitle}>Email Verified</ThemedText>
                <ThemedText style={styles.successText}>
                  Your email has been successfully verified. You can now log in to your account.
                </ThemedText>
                <Button
                  mode="contained"
                  onPress={handleGoToLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Go to Login
                </Button>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={64} color="#F44336" style={styles.errorIcon} />
                <ThemedText type="subtitle" style={styles.errorTitle}>Verification Failed</ThemedText>
                <ThemedText style={styles.errorText}>
                  {error}
                </ThemedText>
                <Button
                  mode="contained"
                  onPress={handleResendVerification}
                  style={styles.resendButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Resend Verification Email
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleGoToLogin}
                  style={styles.loginButtonOutlined}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabelOutlined}
                >
                  Back to Login
                </Button>
              </View>
            )}
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
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
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
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F44336',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575',
    lineHeight: 22,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0088E0',
    borderRadius: 8,
  },
  resendButton: {
    width: '100%',
    backgroundColor: '#0088E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonOutlined: {
    width: '100%',
    borderColor: '#0088E0',
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonLabelOutlined: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0088E0',
  },
});
