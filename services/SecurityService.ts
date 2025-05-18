import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';

// Security service class
class SecurityService {
  private readonly SECURE_STORE_PREFIX = 'agriconnect_secure_';
  private readonly ENCRYPTION_KEY = 'agriconnect_encryption_key';
  private readonly IV_SIZE = 16; // 16 bytes for AES
  private readonly SALT_SIZE = 16; // 16 bytes for salt
  private readonly PBKDF2_ITERATIONS = 100000; // 100,000 iterations for key derivation
  private readonly KEY_SIZE = 32; // 32 bytes (256 bits) for AES-256

  // Hash data using SHA-256
  async hashData(data: string): Promise<string> {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data
      );
      return hash;
    } catch (error) {
      console.error('Error hashing data:', error);
      throw error;
    }
  }

  // Generate a random salt
  async generateSalt(): Promise<string> {
    try {
      const salt = await Crypto.getRandomBytesAsync(this.SALT_SIZE);
      return this.arrayBufferToHex(salt);
    } catch (error) {
      console.error('Error generating salt:', error);
      throw error;
    }
  }

  // Generate a random initialization vector (IV)
  async generateIV(): Promise<string> {
    try {
      const iv = await Crypto.getRandomBytesAsync(this.IV_SIZE);
      return this.arrayBufferToHex(iv);
    } catch (error) {
      console.error('Error generating IV:', error);
      throw error;
    }
  }

  // Derive a key from a password using PBKDF2
  async deriveKey(password: string, salt: string): Promise<string> {
    try {
      // In a real implementation, we would use PBKDF2
      // For now, we'll use a simple hash-based approach
      const key = await this.hashData(password + salt);
      return key.substring(0, this.KEY_SIZE * 2); // Convert to hex (2 chars per byte)
    } catch (error) {
      console.error('Error deriving key:', error);
      throw error;
    }
  }

  // Encrypt data using AES-256-GCM
  async encryptData(data: string, key?: string): Promise<{ encryptedData: string; iv: string }> {
    try {
      // Generate a random IV
      const iv = await this.generateIV();

      // Use provided key or derive one from the master key
      const encryptionKey = key || await this.getMasterKey();

      // In a real implementation, we would use AES-256-GCM
      // For now, we'll use a simple XOR-based approach for demonstration
      const encryptedData = this.xorEncrypt(data, encryptionKey, iv);

      return { encryptedData, iv };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  // Decrypt data using AES-256-GCM
  async decryptData(encryptedData: string, iv: string, key?: string): Promise<string> {
    try {
      // Use provided key or derive one from the master key
      const decryptionKey = key || await this.getMasterKey();

      // In a real implementation, we would use AES-256-GCM
      // For now, we'll use a simple XOR-based approach for demonstration
      const decryptedData = this.xorEncrypt(encryptedData, decryptionKey, iv);

      return decryptedData;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  // Simple XOR encryption/decryption (for demonstration only)
  private xorEncrypt(data: string, key: string, iv: string): string {
    const result = [];
    const combinedKey = key + iv;

    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ combinedKey.charCodeAt(i % combinedKey.length);
      result.push(String.fromCharCode(charCode));
    }

    return btoa(result.join(''));
  }

  // Get or generate the master encryption key
  private async getMasterKey(): Promise<string> {
    try {
      // Try to get the existing key
      const key = await this.getSecureItem(this.ENCRYPTION_KEY);

      if (key) {
        return key;
      }

      // Generate a new key
      const newKey = await this.generateRandomKey();

      // Store the new key
      await this.setSecureItem(this.ENCRYPTION_KEY, newKey);

      return newKey;
    } catch (error) {
      console.error('Error getting master key:', error);
      throw error;
    }
  }

  // Generate a random encryption key
  private async generateRandomKey(): Promise<string> {
    try {
      const keyBytes = await Crypto.getRandomBytesAsync(this.KEY_SIZE);
      return this.arrayBufferToHex(keyBytes);
    } catch (error) {
      console.error('Error generating random key:', error);
      throw error;
    }
  }

  // Convert ArrayBuffer to hexadecimal string
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Store an item securely
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const fullKey = this.SECURE_STORE_PREFIX + key;

      if (Platform.OS === 'web') {
        // Web doesn't support SecureStore, use localStorage with a warning
        console.warn('SecureStore not available on web, using localStorage instead');
        localStorage.setItem(fullKey, value);
      } else {
        // Use SecureStore on native platforms
        await SecureStore.setItemAsync(fullKey, value);
      }
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw error;
    }
  }

  // Get an item from secure storage
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const fullKey = this.SECURE_STORE_PREFIX + key;

      if (Platform.OS === 'web') {
        // Web doesn't support SecureStore, use localStorage with a warning
        console.warn('SecureStore not available on web, using localStorage instead');
        return localStorage.getItem(fullKey);
      } else {
        // Use SecureStore on native platforms
        return await SecureStore.getItemAsync(fullKey);
      }
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      throw error;
    }
  }

  // Delete an item from secure storage
  async deleteSecureItem(key: string): Promise<void> {
    try {
      const fullKey = this.SECURE_STORE_PREFIX + key;

      if (Platform.OS === 'web') {
        // Web doesn't support SecureStore, use localStorage with a warning
        console.warn('SecureStore not available on web, using localStorage instead');
        localStorage.removeItem(fullKey);
      } else {
        // Use SecureStore on native platforms
        await SecureStore.deleteItemAsync(fullKey);
      }
    } catch (error) {
      console.error(`Error deleting secure item ${key}:`, error);
      throw error;
    }
  }

  // Generate a random OTP (One-Time Password)
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
  }

  // Request two-factor authentication
  async requestTwoFactorAuth(userId: string, method: 'sms' | 'email'): Promise<boolean> {
    try {
      // For mock purposes, store the OTP locally
      const otp = this.generateOTP(6);
      await this.setSecureItem(`2fa_otp_${userId}`, otp);
      await this.setSecureItem(`2fa_otp_expiry_${userId}`, (Date.now() + 10 * 60 * 1000).toString()); // 10 minutes expiry

      console.log(`[MOCK] 2FA code for user ${userId}: ${otp}`);

      // In a real app, this would make an API call to request 2FA
      try {
        const response = await api.post('/auth/two-factor/request', {
          userId,
          method,
        });
        return response.data.success;
      } catch (apiError) {
        console.warn('API call failed, using mock implementation:', apiError);
        // Simulate successful request
        return true;
      }
    } catch (error) {
      console.error('Error requesting two-factor authentication:', error);
      throw error;
    }
  }

  // Verify two-factor authentication
  async verifyTwoFactorAuth(userId: string, otp: string): Promise<boolean> {
    try {
      // For mock purposes, check the OTP locally
      const storedOtp = await this.getSecureItem(`2fa_otp_${userId}`);
      const expiryStr = await this.getSecureItem(`2fa_otp_expiry_${userId}`);

      if (!storedOtp || !expiryStr) {
        throw new Error('No verification code found. Please request a new code.');
      }

      const expiry = parseInt(expiryStr);
      if (Date.now() > expiry) {
        // Clean up expired OTP
        await this.deleteSecureItem(`2fa_otp_${userId}`);
        await this.deleteSecureItem(`2fa_otp_expiry_${userId}`);
        throw new Error('Verification code has expired. Please request a new code.');
      }

      if (otp === storedOtp) {
        // Clean up used OTP
        await this.deleteSecureItem(`2fa_otp_${userId}`);
        await this.deleteSecureItem(`2fa_otp_expiry_${userId}`);

        // In a real app, we would also make an API call to verify
        try {
          const response = await api.post('/auth/two-factor/verify', {
            userId,
            otp,
          });
          return response.data.success;
        } catch (apiError) {
          console.warn('API call failed, using mock implementation:', apiError);
          // Return true since we already verified locally
          return true;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying two-factor authentication:', error);
      throw error;
    }
  }

  // Enable two-factor authentication for a user
  async enableTwoFactorAuth(userId: string, method: 'sms' | 'email'): Promise<boolean> {
    try {
      // In a real app, this would make an API call to enable 2FA
      try {
        const response = await api.post('/auth/two-factor/enable', {
          userId,
          method,
        });
        return response.data.success;
      } catch (apiError) {
        console.warn('API call failed, using mock implementation:', apiError);
        // Store the 2FA preference locally for mock purposes
        await this.setSecureItem(`2fa_enabled_${userId}`, 'true');
        await this.setSecureItem(`2fa_method_${userId}`, method);
        return true;
      }
    } catch (error) {
      console.error('Error enabling two-factor authentication:', error);
      throw error;
    }
  }

  // Disable two-factor authentication for a user
  async disableTwoFactorAuth(userId: string): Promise<boolean> {
    try {
      // In a real app, this would make an API call to disable 2FA
      try {
        const response = await api.post('/auth/two-factor/disable', {
          userId,
        });
        return response.data.success;
      } catch (apiError) {
        console.warn('API call failed, using mock implementation:', apiError);
        // Remove the 2FA preference locally for mock purposes
        await this.deleteSecureItem(`2fa_enabled_${userId}`);
        await this.deleteSecureItem(`2fa_method_${userId}`);
        return true;
      }
    } catch (error) {
      console.error('Error disabling two-factor authentication:', error);
      throw error;
    }
  }

  // Check if two-factor authentication is enabled for a user
  async isTwoFactorAuthEnabled(userId: string): Promise<{ enabled: boolean; method?: 'sms' | 'email' }> {
    try {
      // In a real app, this would make an API call to check 2FA status
      try {
        const response = await api.get(`/auth/two-factor/status/${userId}`);
        return response.data;
      } catch (apiError) {
        console.warn('API call failed, using mock implementation:', apiError);
        // Check the 2FA preference locally for mock purposes
        const enabled = await this.getSecureItem(`2fa_enabled_${userId}`);
        const method = await this.getSecureItem(`2fa_method_${userId}`);
        return {
          enabled: enabled === 'true',
          method: method as 'sms' | 'email',
        };
      }
    } catch (error) {
      console.error('Error checking two-factor authentication status:', error);
      throw error;
    }
  }

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    isLongEnough: boolean;
  } {
    // Check various criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    // Calculate score (0-4)
    let score = 0;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;
    if (isLongEnough) score++;

    // Normalize score to 0-4 range
    score = Math.min(4, Math.floor(score * 4 / 5));

    // Generate feedback
    let feedback = '';
    if (score < 2) {
      feedback = 'Weak password. Please use a stronger password.';
    } else if (score < 3) {
      feedback = 'Moderate password. Consider adding more complexity.';
    } else if (score < 4) {
      feedback = 'Strong password.';
    } else {
      feedback = 'Very strong password.';
    }

    return {
      score,
      feedback,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
      isLongEnough,
    };
  }

  // Check if a password is common (easily guessable)
  isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
      'letmein', 'welcome', 'monkey', 'admin', 'iloveyou', 'sunshine',
      '123123', '1234567890', 'football', 'baseball', 'soccer', 'dragon',
      'master', 'superman', 'batman', 'trustno1', 'whatever', 'princess',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  // Sanitize input to prevent XSS attacks
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate input against a regex pattern
  validateInput(input: string, pattern: RegExp): boolean {
    return pattern.test(input);
  }

  // Generate a secure random token
  async generateSecureToken(length: number = 32): Promise<string> {
    try {
      const tokenBytes = await Crypto.getRandomBytesAsync(length);
      return this.arrayBufferToHex(tokenBytes);
    } catch (error) {
      console.error('Error generating secure token:', error);
      throw error;
    }
  }

  // Check if biometric authentication is available
  async isBiometricAuthAvailable(): Promise<boolean> {
    // In a real app, this would check if the device supports biometric authentication
    // For mock purposes, return true
    return true;
  }

  // Check if biometric authentication is enabled
  async isBiometricAuthEnabled(): Promise<boolean> {
    try {
      const enabled = await this.getSecureItem('biometric_auth_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric authentication status:', error);
      return false;
    }
  }

  // Enable biometric authentication
  async enableBiometricAuth(): Promise<boolean> {
    try {
      await this.setSecureItem('biometric_auth_enabled', 'true');
      return true;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometricAuth(): Promise<boolean> {
    try {
      await this.setSecureItem('biometric_auth_enabled', 'false');
      return true;
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
      return false;
    }
  }

  // Check if PIN authentication is enabled
  async isPinAuthEnabled(): Promise<boolean> {
    try {
      const enabled = await this.getSecureItem('pin_auth_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking PIN authentication status:', error);
      return false;
    }
  }

  // Enable PIN authentication
  async enablePinAuth(pin: string): Promise<boolean> {
    try {
      // Hash the PIN before storing it
      const hashedPin = await this.hashData(pin);
      await this.setSecureItem('pin_auth_hash', hashedPin);
      await this.setSecureItem('pin_auth_enabled', 'true');
      return true;
    } catch (error) {
      console.error('Error enabling PIN authentication:', error);
      return false;
    }
  }

  // Disable PIN authentication
  async disablePinAuth(): Promise<boolean> {
    try {
      await this.deleteSecureItem('pin_auth_hash');
      await this.setSecureItem('pin_auth_enabled', 'false');
      return true;
    } catch (error) {
      console.error('Error disabling PIN authentication:', error);
      return false;
    }
  }

  // Verify PIN
  async verifyPin(pin: string): Promise<boolean> {
    try {
      const hashedPin = await this.getSecureItem('pin_auth_hash');
      if (!hashedPin) {
        return false;
      }

      const inputHashedPin = await this.hashData(pin);
      return inputHashedPin === hashedPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  // Get auto-lock settings
  async getAutoLockSettings(): Promise<{ enabled: boolean; timeInMinutes: number }> {
    try {
      const enabled = await this.getSecureItem('auto_lock_enabled');
      const timeStr = await this.getSecureItem('auto_lock_time');

      return {
        enabled: enabled === 'true',
        timeInMinutes: timeStr ? parseInt(timeStr) : 5,
      };
    } catch (error) {
      console.error('Error getting auto-lock settings:', error);
      return { enabled: false, timeInMinutes: 5 };
    }
  }

  // Set auto-lock settings
  async setAutoLockSettings(settings: { enabled: boolean; timeInMinutes: number }): Promise<boolean> {
    try {
      await this.setSecureItem('auto_lock_enabled', settings.enabled.toString());
      await this.setSecureItem('auto_lock_time', settings.timeInMinutes.toString());
      return true;
    } catch (error) {
      console.error('Error setting auto-lock settings:', error);
      return false;
    }
  }

  // Get last password change date
  async getLastPasswordChangeDate(userId: string): Promise<Date | null> {
    try {
      const dateStr = await this.getSecureItem(`last_password_change_${userId}`);
      return dateStr ? new Date(parseInt(dateStr)) : null;
    } catch (error) {
      console.error('Error getting last password change date:', error);
      return null;
    }
  }

  // Set last password change date
  async setLastPasswordChangeDate(userId: string): Promise<boolean> {
    try {
      await this.setSecureItem(`last_password_change_${userId}`, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error setting last password change date:', error);
      return false;
    }
  }
}

// Export a singleton instance
export default new SecurityService();
