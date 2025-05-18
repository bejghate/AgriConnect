import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Chip, Divider, Button } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { experts, Expert, ExpertSpecialty, ConsultationType } from '@/data/experts';

// Helper function to convert expert specialty to display name
const getSpecialtyDisplayName = (specialty: ExpertSpecialty): string => {
  const displayNames = {
    'veterinarian_livestock': 'Veterinarian (Livestock)',
    'veterinarian_poultry': 'Veterinarian (Poultry)',
    'agronomist_cereals': 'Agronomist (Cereals)',
    'agronomist_vegetables': 'Agronomist (Vegetables)',
    'agronomist_fruits': 'Agronomist (Fruits)',
    'soil_specialist': 'Soil Specialist',
    'pest_control': 'Pest Control Specialist',
    'agricultural_economics': 'Agricultural Economist',
    'irrigation_specialist': 'Irrigation Specialist',
    'organic_farming': 'Organic Farming Specialist',
    'livestock_nutrition': 'Livestock Nutrition Specialist',
    'agricultural_engineering': 'Agricultural Engineer'
  };

  return displayNames[specialty] || specialty;
};

// Helper function to convert availability status to display text
const getAvailabilityText = (expert: Expert): string => {
  switch (expert.availability.status) {
    case 'available_now':
      return 'Available Now';
    case 'busy':
      return 'Currently Busy';
    case 'available_soon':
      if (expert.availability.nextAvailableSlot) {
        const availableDate = new Date(expert.availability.nextAvailableSlot);
        const now = new Date();
        const diffHours = Math.round((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) {
          return 'Available Soon';
        } else if (diffHours < 24) {
          return `Available in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        } else {
          return `Available on ${availableDate.toLocaleDateString()}`;
        }
      }
      return 'Available Soon';
    case 'offline':
      return 'Currently Offline';
    default:
      return 'Status Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  expertInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertName: {
    fontSize: 24,
    marginRight: 8,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  expertSpecialty: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  availabilityText: {
    marginTop: 4,
    fontSize: 14,
  },
  availableNow: {
    color: '#4CAF50',
  },
  availableSoon: {
    color: '#FF9800',
  },
  busy: {
    color: '#F44336',
  },
  offline: {
    color: '#757575',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  masterBadge: {
    backgroundColor: '#9C27B0',
  },
  advancedBadge: {
    backgroundColor: '#2196F3',
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  bio: {
    marginTop: 8,
    lineHeight: 20,
  },
  divider: {
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  specialtyChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  qualificationsContainer: {
    marginTop: 8,
  },
  qualificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualificationText: {
    marginLeft: 8,
  },
  experienceText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  contactContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 8,
    flex: 1,
  },
  contactButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  consultationOptionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  consultationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  selectedConsultationOption: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  consultationOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  consultationOptionPrice: {
    color: '#757575',
  },
  selectedConsultationOptionText: {
    color: 'white',
  },
  requestButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#0a7ea4',
  },
});

export default function ExpertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType | null>(null);

  useEffect(() => {
    // Find the expert by ID
    const foundExpert = experts.find(e => e.id === id);
    if (foundExpert) {
      setExpert(foundExpert);
    } else {
      Alert.alert('Error', 'Expert not found');
      router.back();
    }
  }, [id]);

  const handleCall = () => {
    if (!expert) return;

    Linking.openURL(`tel:${expert.contactInfo.phone}`);
  };

  const handleEmail = () => {
    if (!expert) return;

    Linking.openURL(`mailto:${expert.contactInfo.email}`);
  };

  const handleConsultationTypeSelect = (type: ConsultationType) => {
    setSelectedConsultationType(type);
  };

  const handleRequestConsultation = () => {
    if (!expert || !selectedConsultationType) return;

    router.push(`/consultations/request-consultation?expertId=${expert.id}&consultationType=${selectedConsultationType}`);
  };

  if (!expert) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading expert details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>

        <ThemedView style={styles.expertHeader}>
          <Image source={expert.profileImage} style={styles.expertImage} />

          <ThemedView style={styles.expertInfo}>
            <ThemedView style={styles.nameContainer}>
              <ThemedText type="title" style={styles.expertName}>{expert.name}</ThemedText>
              {expert.verified && (
                <IconSymbol name="checkmark.seal.fill" size={20} color="#4CAF50" style={styles.verifiedIcon} />
              )}
            </ThemedView>

            <ThemedText style={styles.expertSpecialty}>
              {getSpecialtyDisplayName(expert.primarySpecialty)}
            </ThemedText>

            <ThemedView style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={16} color="#FFD700" />
              <ThemedText style={styles.ratingText}>
                {expert.rating} ({expert.reviewCount} reviews)
              </ThemedText>
            </ThemedView>

            <ThemedText style={[
              styles.availabilityText,
              expert.availability.status === 'available_now' ? styles.availableNow :
              expert.availability.status === 'busy' ? styles.busy :
              expert.availability.status === 'offline' ? styles.offline :
              styles.availableSoon
            ]}>
              {getAvailabilityText(expert)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.badgesContainer}>
        {expert.certificationLevel === 'master' && (
          <ThemedView style={[styles.badge, styles.masterBadge]}>
            <ThemedText style={styles.badgeText}>Master</ThemedText>
          </ThemedView>
        )}
        {expert.certificationLevel === 'advanced' && (
          <ThemedView style={[styles.badge, styles.advancedBadge]}>
            <ThemedText style={styles.badgeText}>Advanced</ThemedText>
          </ThemedView>
        )}
        {expert.freeConsultationAvailable && (
          <ThemedView style={[styles.badge, styles.freeBadge]}>
            <ThemedText style={styles.badgeText}>Free Consultation Available</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText style={styles.bio}>{expert.bio}</ThemedText>
      </ThemedView>

      <Divider style={styles.divider} />

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Specialties</ThemedText>
        <ThemedView style={styles.specialtiesContainer}>
          {expert.specialties.map((specialty, index) => (
            <Chip key={index} style={styles.specialtyChip}>
              {getSpecialtyDisplayName(specialty)}
            </Chip>
          ))}
        </ThemedView>
      </ThemedView>

      <Divider style={styles.divider} />

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Qualifications</ThemedText>
        <ThemedView style={styles.qualificationsContainer}>
          {expert.qualifications.map((qualification, index) => (
            <ThemedView key={index} style={styles.qualificationItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#0a7ea4" />
              <ThemedText style={styles.qualificationText}>{qualification}</ThemedText>
            </ThemedView>
          ))}
          <ThemedText style={styles.experienceText}>
            {expert.yearsOfExperience} years of experience
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <Divider style={styles.divider} />

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Contact Information</ThemedText>
        <ThemedView style={styles.contactContainer}>
          <ThemedView style={styles.contactItem}>
            <IconSymbol name="phone.fill" size={16} color="#0a7ea4" />
            <ThemedText style={styles.contactText}>{expert.contactInfo.phone}</ThemedText>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <ThemedText style={styles.contactButtonText}>Call</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.contactItem}>
            <IconSymbol name="envelope.fill" size={16} color="#0a7ea4" />
            <ThemedText style={styles.contactText}>{expert.contactInfo.email}</ThemedText>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
              <ThemedText style={styles.contactButtonText}>Email</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.contactItem}>
            <IconSymbol name="mappin.and.ellipse" size={16} color="#0a7ea4" />
            <ThemedText style={styles.contactText}>
              {expert.location.city}, {expert.location.region}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <Divider style={styles.divider} />

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Consultation Options</ThemedText>
        <ThemedView style={styles.consultationOptionsContainer}>
          {expert.consultationOptions.messageConsultation && (
            <TouchableOpacity
              style={[
                styles.consultationOption,
                selectedConsultationType === 'message' && styles.selectedConsultationOption
              ]}
              onPress={() => handleConsultationTypeSelect('message')}
            >
              <IconSymbol
                name="message.fill"
                size={24}
                color={selectedConsultationType === 'message' ? 'white' : '#0a7ea4'}
              />
              <ThemedText
                style={[
                  styles.consultationOptionText,
                  selectedConsultationType === 'message' && styles.selectedConsultationOptionText
                ]}
              >
                Message
              </ThemedText>
              <ThemedText
                style={[
                  styles.consultationOptionPrice,
                  selectedConsultationType === 'message' && styles.selectedConsultationOptionText
                ]}
              >
                {expert.pricing.messageRate > 0 ? `${expert.pricing.messageRate} credits` : 'Free'}
              </ThemedText>
            </TouchableOpacity>
          )}

          {expert.consultationOptions.audioCall && (
            <TouchableOpacity
              style={[
                styles.consultationOption,
                selectedConsultationType === 'audio_call' && styles.selectedConsultationOption
              ]}
              onPress={() => handleConsultationTypeSelect('audio_call')}
            >
              <IconSymbol
                name="phone.fill"
                size={24}
                color={selectedConsultationType === 'audio_call' ? 'white' : '#0a7ea4'}
              />
              <ThemedText
                style={[
                  styles.consultationOptionText,
                  selectedConsultationType === 'audio_call' && styles.selectedConsultationOptionText
                ]}
              >
                Audio Call
              </ThemedText>
              <ThemedText
                style={[
                  styles.consultationOptionPrice,
                  selectedConsultationType === 'audio_call' && styles.selectedConsultationOptionText
                ]}
              >
                {expert.pricing.audioCallRate} credits/min
              </ThemedText>
            </TouchableOpacity>
          )}

          {expert.consultationOptions.videoCall && (
            <TouchableOpacity
              style={[
                styles.consultationOption,
                selectedConsultationType === 'video_call' && styles.selectedConsultationOption
              ]}
              onPress={() => handleConsultationTypeSelect('video_call')}
            >
              <IconSymbol
                name="video.fill"
                size={24}
                color={selectedConsultationType === 'video_call' ? 'white' : '#0a7ea4'}
              />
              <ThemedText
                style={[
                  styles.consultationOptionText,
                  selectedConsultationType === 'video_call' && styles.selectedConsultationOptionText
                ]}
              >
                Video Call
              </ThemedText>
              <ThemedText
                style={[
                  styles.consultationOptionPrice,
                  selectedConsultationType === 'video_call' && styles.selectedConsultationOptionText
                ]}
              >
                {expert.pricing.videoCallRate} credits/min
              </ThemedText>
            </TouchableOpacity>
          )}

          {expert.consultationOptions.lowDataCall && (
            <TouchableOpacity
              style={[
                styles.consultationOption,
                selectedConsultationType === 'video_call' && styles.selectedConsultationOption
              ]}
              onPress={() => handleConsultationTypeSelect('video_call')}
            >
              <IconSymbol
                name="video.slash.fill"
                size={24}
                color={selectedConsultationType === 'video_call' ? 'white' : '#0a7ea4'}
              />
              <ThemedText
                style={[
                  styles.consultationOptionText,
                  selectedConsultationType === 'video_call' && styles.selectedConsultationOptionText
                ]}
              >
                Low-Data Call
              </ThemedText>
              <ThemedText
                style={[
                  styles.consultationOptionPrice,
                  selectedConsultationType === 'video_call' && styles.selectedConsultationOptionText
                ]}
              >
                {expert.pricing.audioCallRate} credits/min
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      <Button
        mode="contained"
        onPress={handleRequestConsultation}
        style={styles.requestButton}
        disabled={!selectedConsultationType}
      >
        Request Consultation
      </Button>
    </ScrollView>
  );
}
