import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/context/UserContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Clear field errors when input changes
  useEffect(() => {
    if (email) setEmailError('');
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError('');
  }, [password]);

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

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    // Clear any previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Attempt login
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle guest login
  const handleGuestLogin = () => {
    // Navigate to tabs without authentication
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" />
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
              Welcome to AgriConnect
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to continue to your account
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F44336" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
              disabled={isLoading}
              left={<TextInput.Icon icon="email" />}
              theme={{ colors: { primary: COLORS.primary.main } }}
              outlineColor="#E0E0E0"
              activeOutlineColor={COLORS.primary.main}
              accessibilityLabel="Email input field"
              accessibilityHint="Enter your email address"
              testID="login-email-input"
            />
            {emailError ? <ThemedText style={styles.fieldError}>{emailError}</ThemedText> : null}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              error={!!passwordError}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                />
              }
              theme={{ colors: { primary: COLORS.primary.main } }}
              outlineColor="#E0E0E0"
              activeOutlineColor={COLORS.primary.main}
              accessibilityLabel="Password input field"
              accessibilityHint="Enter your password"
              testID="login-password-input"
            />
            {passwordError ? <ThemedText style={styles.fieldError}>{passwordError}</ThemedText> : null}

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                accessibilityLabel={rememberMe ? "Disable remember me" : "Enable remember me"}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <IconSymbol name="checkmark" size={12} color="white" />}
                </View>
                <ThemedText style={styles.rememberMeText}>Remember me</ThemedText>
              </TouchableOpacity>

              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity
                  accessibilityLabel="Forgot password link"
                  accessibilityHint="Navigate to forgot password page"
                  testID="forgot-password-link"
                >
                  <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
              disabled={isLoading}
              loading={isLoading}
              accessibilityLabel="Login button"
              accessibilityHint="Press to sign in to your account"
              testID="login-button"
            >
              Sign In
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <ThemedText style={styles.dividerText}>OR</ThemedText>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGuestLogin}
              style={styles.guestButton}
              contentStyle={styles.guestButtonContent}
              labelStyle={styles.guestButtonLabel}
              disabled={isLoading}
              accessibilityLabel="Continue as guest"
              accessibilityHint="Access the app without signing in"
            >
              Continue as Guest
            </Button>

            <View style={styles.registerContainer}>
              <ThemedText style={styles.registerText}>Don't have an account? </ThemedText>
              <Link href="/auth/register" asChild>
                <TouchableOpacity
                  accessibilityLabel="Register link"
                  accessibilityHint="Navigate to registration page"
                  testID="register-link"
                >
                  <ThemedText style={styles.registerLink}>Sign Up</ThemedText>
                </TouchableOpacity>
              </Link>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#757575',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
    backgroundColor: COLORS.primary.main,
    borderRadius: 8,
  },
  loginButtonContent: {
    height: 48,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#757575',
    fontWeight: '500',
  },
  guestButton: {
    marginBottom: 24,
    borderColor: COLORS.primary.main,
    borderRadius: 8,
  },
  guestButtonContent: {
    height: 48,
  },
  guestButtonLabel: {
    fontSize: 16,
    color: COLORS.primary.main,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#757575',
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary.main,
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
});
