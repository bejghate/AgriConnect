import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';

// User types with descriptions
const userTypes = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Crop cultivation, small to large scale farming operations',
    icon: 'leaf.fill',
    color: '#4CAF50',
  },
  {
    id: 'livestock',
    title: 'Livestock Manager',
    description: 'Cattle, sheep, goats, poultry management',
    icon: 'hare.fill',
    color: '#FF9800',
  },
  {
    id: 'professional',
    title: 'Agricultural Professional',
    description: 'Veterinarians, agronomists, agricultural technicians',
    icon: 'person.fill.badge.plus',
    color: '#2196F3',
  },
  {
    id: 'supplier',
    title: 'Input Supplier',
    description: 'Sellers of seeds, fertilizers, equipment, veterinary products',
    icon: 'shippingbox.fill',
    color: '#9C27B0',
  },
  {
    id: 'buyer',
    title: 'Agricultural Buyer',
    description: 'Wholesalers, retailers, consumers of agricultural products',
    icon: 'cart.fill',
    color: '#F44336',
  },
];

// Mock user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  location: 'Countryside, Farmland',
  joinDate: 'May 2025',
  profileImage: require('@/assets/images/react-logo.png'),
};

// User type selection card component
const UserTypeCard = ({ type, isSelected, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(type)}
    style={[styles.userTypeCard, isSelected && { borderColor: type.color, borderWidth: 2 }]}
  >
    <ThemedView style={[styles.iconContainer, { backgroundColor: type.color }]}>
      <IconSymbol size={28} name={type.icon} color="white" />
    </ThemedView>
    <ThemedView style={styles.userTypeInfo}>
      <ThemedText type="defaultSemiBold">{type.title}</ThemedText>
      <ThemedText style={styles.userTypeDescription} numberOfLines={2}>
        {type.description}
      </ThemedText>
    </ThemedView>
    {isSelected && (
      <IconSymbol
        size={24}
        name="checkmark.circle.fill"
        color={type.color}
        style={styles.checkmark}
      />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const {
    userTypes: userTypesList,
    primaryUserType,
    addUserType,
    removeUserType,
    setPrimaryUserType,
    user,
    isAuthenticated,
    logout,
    isLoading
  } = useUser();

  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>(['farmer']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Initialize selected user types from context
  useEffect(() => {
    if (userTypesList) {
      setSelectedUserTypes(userTypesList);
    }
  }, [userTypesList]);

  const toggleUserType = (type: any) => {
    if (selectedUserTypes.includes(type.id)) {
      // Don't allow deselecting if it's the only selected type
      if (selectedUserTypes.length > 1) {
        setSelectedUserTypes(selectedUserTypes.filter(id => id !== type.id));
        removeUserType(type.id);
      }
    } else {
      setSelectedUserTypes([...selectedUserTypes, type.id]);
      addUserType(type.id);
    }
  };

  const handleSetPrimaryType = (type: any) => {
    setPrimaryUserType(type.id);
  };

  const navigateToHome = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // If loading or not authenticated, show minimal content
  if (isLoading || !isAuthenticated) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E1F5FE', dark: '#01579B' }}
      headerImage={
        <Image
          source={user?.profileImage ? { uri: user.profileImage } : userData.profileImage}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.profileHeader}>
        <ThemedView style={styles.profileInfo}>
          <ThemedText type="title">{user?.name || userData.name}</ThemedText>
          <ThemedText style={styles.profileEmail}>{user?.email || userData.email}</ThemedText>
          <ThemedView style={styles.locationContainer}>
            <IconSymbol name="location.fill" size={16} color="#0a7ea4" />
            <ThemedText style={styles.locationText}>{userData.location}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.joinDate}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : userData.joinDate}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity style={styles.editButton}>
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Your User Types</ThemedText>
      <ThemedText style={styles.sectionDescription}>
        Select all that apply to you. This helps us personalize your experience.
      </ThemedText>

      {userTypes.map(type => (
        <UserTypeCard
          key={type.id}
          type={type}
          isSelected={selectedUserTypes.includes(type.id)}
          onSelect={toggleUserType}
        />
      ))}

      <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/notification-settings')}
      >
        <ThemedView>
          <ThemedText type="defaultSemiBold">Notification Settings</ThemedText>
          <ThemedText style={styles.settingDescription}>
            Manage push notifications, alerts, and personalized recommendations
          </ThemedText>
        </ThemedView>
        <IconSymbol name="chevron.right" size={20} color="#757575" />
      </TouchableOpacity>

      <ThemedView style={styles.settingItem}>
        <ThemedView>
          <ThemedText type="defaultSemiBold">Location Services</ThemedText>
          <ThemedText style={styles.settingDescription}>
            Enable to find nearby services, products, and weather information
          </ThemedText>
        </ThemedView>
        <Switch
          value={locationEnabled}
          onValueChange={setLocationEnabled}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor={locationEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </ThemedView>

      <Collapsible title="Privacy & Data">
        <ThemedText>
          Your data is securely stored and used only to provide personalized services within the app.
          We do not share your information with third parties without your consent.
        </ThemedText>
        <TouchableOpacity style={styles.privacyButton}>
          <ThemedText style={styles.privacyButtonText}>View Privacy Policy</ThemedText>
        </TouchableOpacity>
      </Collapsible>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/auth/change-password')}
      >
        <ThemedView>
          <ThemedText type="defaultSemiBold">Change Password</ThemedText>
          <ThemedText style={styles.settingDescription}>
            Update your account password
          </ThemedText>
        </ThemedView>
        <IconSymbol name="chevron.right" size={20} color="#757575" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, styles.logoutItem]}
        onPress={handleLogout}
      >
        <ThemedView>
          <ThemedText type="defaultSemiBold" style={styles.logoutText}>Logout</ThemedText>
          <ThemedText style={styles.settingDescription}>
            Sign out of your account
          </ThemedText>
        </ThemedView>
        <IconSymbol name="arrow.right.square" size={20} color="#F44336" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={navigateToHome}>
        <ThemedText style={styles.saveButtonText}>Save Preferences</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerImage: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    position: 'absolute',
    bottom: -60,
    alignSelf: 'center',
  },
  profileHeader: {
    marginTop: 70,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileEmail: {
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 4,
  },
  joinDate: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 16,
  },
  sectionDescription: {
    marginBottom: 16,
  },
  userTypeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userTypeInfo: {
    flex: 1,
  },
  userTypeDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#757575',
  },
  checkmark: {
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  logoutItem: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
  },
  logoutText: {
    color: '#F44336',
  },
  settingDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#757575',
    maxWidth: '80%',
  },
  privacyButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  privacyButtonText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
