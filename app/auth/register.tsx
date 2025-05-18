import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/context/UserContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RoleSelector, { RoleDetails } from '@/components/auth/RoleSelector';
import { UserRole } from '@/types/user';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error, clearError } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [showRoleDetails, setShowRoleDetails] = useState(false);

  // Form validation errors
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Clear field errors when input changes
  useEffect(() => {
    if (fullName) setFullNameError('');
  }, [fullName]);

  useEffect(() => {
    if (email) setEmailError('');
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError('');
  }, [password]);

  useEffect(() => {
    if (confirmPassword) setConfirmPasswordError('');
  }, [confirmPassword]);

  useEffect(() => {
    if (selectedRole) setRoleError('');
  }, [selectedRole]);

  // Toggle role details visibility
  const toggleRoleDetails = () => {
    setShowRoleDetails(!showRoleDetails);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    // Validate full name
    if (!fullName) {
      setFullNameError('Full name is required');
      isValid = false;
    }

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    // Validate role
    if (!selectedRole) {
      setRoleError('Please select a role');
      isValid = false;
    }

    return isValid;
  };

  // Handle registration
  const handleRegister = async () => {
    // Clear any previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Attempt registration
      await register({
        fullName,
        email,
        password,
        passwordConfirm: confirmPassword,
        role: selectedRole,
      });
    } catch (error) {
      console.error('Registration error:', error);
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
              Create your account
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Join the AgriConnect community
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
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
            error={!!fullNameError}
            disabled={isLoading}
            left={<TextInput.Icon icon="account" />}
            accessibilityLabel="Full Name input field"
            accessibilityHint="Enter your full name"
            testID="register-name-input"
          />
          {fullNameError ? <ThemedText style={styles.fieldError}>{fullNameError}</ThemedText> : null}

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
            accessibilityLabel="Email input field"
            accessibilityHint="Enter your email address"
            testID="register-email-input"
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
            accessibilityLabel="Password input field"
            accessibilityHint="Enter your password, minimum 6 characters"
            testID="register-password-input"
          />
          {passwordError ? <ThemedText style={styles.fieldError}>{passwordError}</ThemedText> : null}

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!confirmPasswordError}
            disabled={isLoading}
            left={<TextInput.Icon icon="lock-check" />}
            accessibilityLabel="Confirm Password input field"
            accessibilityHint="Re-enter your password to confirm"
            testID="register-confirm-password-input"
          />
          {confirmPasswordError ? <ThemedText style={styles.fieldError}>{confirmPasswordError}</ThemedText> : null}

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Select your role:
          </ThemedText>

          {roleError ? <ThemedText style={styles.fieldError}>{roleError}</ThemedText> : null}

          <ThemedView style={styles.roleSelectorContainer}>
            <RoleSelector
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              excludeRoles={['super_admin', 'moderator']}
            />
          </ThemedView>

          <TouchableOpacity
            style={styles.roleDetailsButton}
            onPress={toggleRoleDetails}
            disabled={isLoading}
          >
            <ThemedText style={styles.roleDetailsButtonText}>
              {showRoleDetails ? 'Hide role details' : 'View role details'}
            </ThemedText>
            <IconSymbol
              name={showRoleDetails ? 'chevron.up' : 'chevron.down'}
              size={16}
              color="#2196F3"
            />
          </TouchableOpacity>

          {showRoleDetails && (
            <RoleDetails role={selectedRole} />
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            disabled={isLoading}
            loading={isLoading}
            accessibilityLabel="Register button"
            accessibilityHint="Press to create your account"
            testID="register-button"
          >
            Register
          </Button>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
            <Link href="/auth/login" asChild>
              <TouchableOpacity
                accessibilityLabel="Login link"
                accessibilityHint="Navigate to login page"
                testID="login-link"
              >
                <ThemedText style={styles.loginLink}>Sign In</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  roleSelectorContainer: {
    marginBottom: 16,
  },
  roleDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 8,
  },
  roleDetailsButtonText: {
    color: '#0088E0',
    marginRight: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#0088E0',
    borderRadius: 8,
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
});
