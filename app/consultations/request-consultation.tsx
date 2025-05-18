import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Chip, Divider, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { experts, Expert, ConsultationType, UrgencyLevel, ConsultationRequest } from '@/data/experts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  expertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
  },
  expertImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  expertInfo: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    marginBottom: 24,
  },
  consultationTypes: {
    marginTop: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  symptomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  symptomChip: {
    margin: 4,
  },
  helperText: {
    color: '#757575',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  attachmentButtonText: {
    color: '#0a7ea4',
    marginLeft: 8,
  },
  attachmentsContainer: {
    marginTop: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  attachmentName: {
    flex: 1,
  },
  removeAttachmentButton: {
    padding: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 16,
  },
  datePickerButtonText: {
    marginLeft: 8,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timePickerButtonText: {
    marginLeft: 8,
  },
  groupConsultationContainer: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#0a7ea4',
    padding: 8,
  },
});

export default function RequestConsultationScreen() {
  const router = useRouter();
  const { expertId, consultationType } = useLocalSearchParams();

  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(expertId as string || null);
  const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType | null>(
    consultationType as ConsultationType || null
  );
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('medium');
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [previousActions, setPreviousActions] = useState('');
  const [attachments, setAttachments] = useState<{id: string, uri: string, type: string, name: string}[]>([]);
  const [isGroupConsultation, setIsGroupConsultation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedExpertId) {
      const foundExpert = experts.find(e => e.id === selectedExpertId);
      if (foundExpert) {
        setExpert(foundExpert);
      }
    }
  }, [selectedExpertId]);

  const handleAddSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `Image ${attachments.length + 1}`
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `Photo ${attachments.length + 1}`
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPreferredDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);

      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (timePickerMode === 'start') {
        setStartTime(timeString);
      } else {
        setEndTime(timeString);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedExpertId) {
      Alert.alert('Error', 'Please select an expert');
      return;
    }

    if (!selectedConsultationType) {
      Alert.alert('Error', 'Please select a consultation type');
      return;
    }

    if (!problemTitle.trim()) {
      Alert.alert('Error', 'Please enter a problem title');
      return;
    }

    if (!problemDescription.trim()) {
      Alert.alert('Error', 'Please enter a problem description');
      return;
    }

    // Create consultation request
    const newRequest: ConsultationRequest = {
      id: `request-${Date.now()}`,
      farmerId: 'user-1', // Hardcoded for demo
      expertId: selectedExpertId,
      requestDate: new Date().toISOString(),
      preferredDate: preferredDate ? preferredDate.toISOString() : undefined,
      preferredTimeSlot: startTime && endTime ? {
        start: startTime,
        end: endTime
      } : undefined,
      consultationType: selectedConsultationType,
      urgencyLevel,
      problem: {
        title: problemTitle,
        description: problemDescription,
        category,
        subcategory: subcategory || undefined,
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        duration: duration || undefined,
        previousActions: previousActions || undefined
      },
      attachments: attachments.map(a => ({
        id: a.id,
        type: 'image',
        url: a.uri,
        name: a.name,
      })),
      status: 'pending',
      isGroupConsultation,
    };

    // In a real app, this would be sent to the server
    console.log('New consultation request:', newRequest);

    Alert.alert(
      'Consultation Request Submitted',
      'Your consultation request has been submitted successfully. You will be notified when the expert responds.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/consultations')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
          </TouchableOpacity>
          <ThemedText type="title">Request Consultation</ThemedText>
        </ThemedView>

        {expert && (
          <ThemedView style={styles.expertCard}>
            <Image source={expert.profileImage} style={styles.expertImage} />
            <ThemedView style={styles.expertInfo}>
              <ThemedText type="defaultSemiBold">{expert.name}</ThemedText>
              <ThemedText>{expert.primarySpecialty}</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Consultation Type</ThemedText>
          <ThemedView style={styles.consultationTypes}>
            <RadioButton.Group
              onValueChange={value => setSelectedConsultationType(value as ConsultationType)}
              value={selectedConsultationType || ''}
            >
              <ThemedView style={styles.radioOption}>
                <RadioButton value="message" />
                <ThemedText>Message Consultation</ThemedText>
              </ThemedView>
              <ThemedView style={styles.radioOption}>
                <RadioButton value="audio_call" />
                <ThemedText>Audio Call</ThemedText>
              </ThemedView>
              <ThemedView style={styles.radioOption}>
                <RadioButton value="video_call" />
                <ThemedText>Video Call</ThemedText>
              </ThemedView>
              <ThemedView style={styles.radioOption}>
                <RadioButton value="in_person" />
                <ThemedText>In-Person Consultation</ThemedText>
              </ThemedView>
            </RadioButton.Group>
          </ThemedView>
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Problem Details</ThemedText>

          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            value={problemTitle}
            onChangeText={setProblemTitle}
            placeholder="Brief title of your problem"
          />

          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={styles.textArea}
            value={problemDescription}
            onChangeText={setProblemDescription}
            placeholder="Detailed description of your problem"
            multiline
            numberOfLines={4}
          />

          <ThemedText style={styles.label}>Category</ThemedText>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Livestock, Crops, Soil"
          />

          <ThemedText style={styles.label}>Subcategory (Optional)</ThemedText>
          <TextInput
            style={styles.input}
            value={subcategory}
            onChangeText={setSubcategory}
            placeholder="e.g., Cattle, Maize, Fertilization"
          />

          <ThemedText style={styles.label}>Symptoms (Optional)</ThemedText>
          <ThemedView style={styles.symptomInputContainer}>
            <TextInput
              style={styles.symptomInput}
              value={symptomInput}
              onChangeText={setSymptomInput}
              placeholder="Add a symptom"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSymptom}>
              <IconSymbol name="plus" size={20} color="white" />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.symptomsContainer}>
            {symptoms.map((symptom, index) => (
              <Chip
                key={index}
                onClose={() => handleRemoveSymptom(symptom)}
                style={styles.symptomChip}
              >
                {symptom}
              </Chip>
            ))}
          </ThemedView>

          <ThemedText style={styles.label}>Duration (Optional)</ThemedText>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g., 2 days, 1 week"
          />

          <ThemedText style={styles.label}>Previous Actions Taken (Optional)</ThemedText>
          <TextInput
            style={styles.textArea}
            value={previousActions}
            onChangeText={setPreviousActions}
            placeholder="What have you tried so far?"
            multiline
            numberOfLines={3}
          />
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Urgency Level</ThemedText>
          <RadioButton.Group
            onValueChange={value => setUrgencyLevel(value as UrgencyLevel)}
            value={urgencyLevel}
          >
            <ThemedView style={styles.radioOption}>
              <RadioButton value="low" />
              <ThemedText>Low - Not urgent, seeking general advice</ThemedText>
            </ThemedView>
            <ThemedView style={styles.radioOption}>
              <RadioButton value="medium" />
              <ThemedText>Medium - Need help soon but not an emergency</ThemedText>
            </ThemedView>
            <ThemedView style={styles.radioOption}>
              <RadioButton value="high" />
              <ThemedText>High - Urgent issue requiring prompt attention</ThemedText>
            </ThemedView>
            <ThemedView style={styles.radioOption}>
              <RadioButton value="emergency" />
              <ThemedText>Emergency - Critical situation requiring immediate help</ThemedText>
            </ThemedView>
          </RadioButton.Group>
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Attachments</ThemedText>
          <ThemedText style={styles.helperText}>
            Add photos or documents to help the expert understand your problem better
          </ThemedText>

          <ThemedView style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage}>
              <IconSymbol name="photo.on.rectangle" size={24} color="#0a7ea4" />
              <ThemedText style={styles.attachmentButtonText}>Choose Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentButton} onPress={handleTakePhoto}>
              <IconSymbol name="camera.fill" size={24} color="#0a7ea4" />
              <ThemedText style={styles.attachmentButtonText}>Take Photo</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {attachments.length > 0 && (
            <ThemedView style={styles.attachmentsContainer}>
              {attachments.map(attachment => (
                <ThemedView key={attachment.id} style={styles.attachmentItem}>
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  <ThemedText style={styles.attachmentName}>{attachment.name}</ThemedText>
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={20} color="#F44336" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Preferred Schedule (Optional)</ThemedText>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={20} color="#0a7ea4" />
            <ThemedText style={styles.datePickerButtonText}>
              {preferredDate ? preferredDate.toLocaleDateString() : 'Select Preferred Date'}
            </ThemedText>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={preferredDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <ThemedView style={styles.timePickerContainer}>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => {
                setTimePickerMode('start');
                setShowTimePicker(true);
              }}
            >
              <IconSymbol name="clock" size={20} color="#0a7ea4" />
              <ThemedText style={styles.timePickerButtonText}>
                {startTime || 'Start Time'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => {
                setTimePickerMode('end');
                setShowTimePicker(true);
              }}
            >
              <IconSymbol name="clock" size={20} color="#0a7ea4" />
              <ThemedText style={styles.timePickerButtonText}>
                {endTime || 'End Time'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </ThemedView>

        <Divider style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedView style={styles.groupConsultationContainer}>
            <ThemedText type="defaultSemiBold">Group Consultation</ThemedText>
            <RadioButton.Group
              onValueChange={value => setIsGroupConsultation(value === 'true')}
              value={isGroupConsultation ? 'true' : 'false'}
            >
              <ThemedView style={styles.radioOption}>
                <RadioButton value="true" />
                <ThemedText>Yes, I want to join a group consultation</ThemedText>
              </ThemedView>
              <ThemedView style={styles.radioOption}>
                <RadioButton value="false" />
                <ThemedText>No, I prefer an individual consultation</ThemedText>
              </ThemedView>
            </RadioButton.Group>
            {isGroupConsultation && (
              <ThemedText style={styles.helperText}>
                Group consultations allow multiple farmers with similar issues to consult with an expert together, reducing costs and enabling knowledge sharing.
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Submit Consultation Request
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
