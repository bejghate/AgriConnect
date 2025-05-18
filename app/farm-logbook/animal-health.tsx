import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput as RNTextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useOffline } from '@/context/OfflineContext';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { AnimalHealthEntry, VaccinationEntry, DiseaseEntry, BirthEntry, DeathEntry } from '@/data/farm-management';

// Animal health record types
const HEALTH_RECORD_TYPES = [
  { id: 'animal_health', label: 'General Health Check', icon: 'heart.text.square.fill', color: '#4CAF50' },
  { id: 'vaccination', label: 'Vaccination', icon: 'syringe.fill', color: '#2196F3' },
  { id: 'disease', label: 'Disease Treatment', icon: 'cross.case.fill', color: '#F44336' },
  { id: 'birth', label: 'Birth Record', icon: 'heart.fill', color: '#FF9800' },
  { id: 'death', label: 'Death Record', icon: 'xmark.square.fill', color: '#607D8B' },
];

// Animal types
const ANIMAL_TYPES = [
  { id: 'cattle', label: 'Cattle' },
  { id: 'sheep', label: 'Sheep' },
  { id: 'goat', label: 'Goat' },
  { id: 'poultry', label: 'Poultry' },
  { id: 'pig', label: 'Pig' },
  { id: 'other', label: 'Other' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  recordTypeContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  recordTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  selectedRecordTypeButton: {
    backgroundColor: '#4CAF50',
  },
  recordTypeText: {
    marginLeft: 8,
    color: '#212121',
  },
  selectedRecordTypeText: {
    color: 'white',
  },
  formGroup: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#212121',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default function AnimalHealthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string, type?: string }>();
  const { isOnline } = useOffline();
  const { addLogEntry, updateLogEntry, logEntries } = useFarmManagement();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Form state
  const [recordType, setRecordType] = useState<string>(params.type || 'animal_health');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [animalType, setAnimalType] = useState<string>('cattle');
  const [animalGroup, setAnimalGroup] = useState<string>('');
  const [count, setCount] = useState<string>('1');
  const [location, setLocation] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  // Vaccination specific fields
  const [vaccineName, setVaccineName] = useState<string>('');
  const [vaccineType, setVaccineType] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [boosterRequired, setBoosterRequired] = useState<boolean>(false);
  const [boosterDate, setBoosterDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() + 6))
  );

  // Disease specific fields
  const [diseaseName, setDiseaseName] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [treatment, setTreatment] = useState<string>('');
  const [medication, setMedication] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [treatmentDuration, setTreatmentDuration] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 7))
  );

  // Birth specific fields
  const [motherAnimalId, setMotherAnimalId] = useState<string>('');
  const [numberOfOffspring, setNumberOfOffspring] = useState<string>('1');
  const [offspringGender, setOffspringGender] = useState<string>('');
  const [birthWeight, setBirthWeight] = useState<string>('');
  const [complications, setComplications] = useState<string>('');

  // Death specific fields
  const [cause, setCause] = useState<string>('');
  const [postMortemPerformed, setPostMortemPerformed] = useState<boolean>(false);
  const [postMortemResults, setPostMortemResults] = useState<string>('');

  // Load existing entry if editing
  useEffect(() => {
    const loadEntry = async () => {
      if (params.id) {
        const entry = logEntries.find(e => e.id === params.id);
        if (entry && entry.category === 'animal') {
          setRecordType(entry.type);
          setTitle(entry.title);
          setDescription(entry.description);
          setDate(new Date(entry.date));
          setAnimalType(entry.animalType);
          setAnimalGroup(entry.animalGroup || '');
          setCount(entry.count.toString());
          setLocation(entry.location?.name || '');
          setTags(entry.tags.join(', '));
          setImages(entry.images || []);

          // Set type-specific fields
          if (entry.type === 'vaccination') {
            const vaccEntry = entry as VaccinationEntry;
            setVaccineName(vaccEntry.vaccineName || '');
            setVaccineType(vaccEntry.vaccineType || '');
            setBatchNumber(vaccEntry.batchNumber || '');
            setExpiryDate(new Date(vaccEntry.expiryDate || new Date()));
            setBoosterRequired(vaccEntry.boosterRequired || false);
            setBoosterDate(new Date(vaccEntry.boosterDate || new Date()));
          } else if (entry.type === 'disease') {
            const diseaseEntry = entry as DiseaseEntry;
            setDiseaseName(diseaseEntry.diseaseName || '');
            setSymptoms(diseaseEntry.symptoms || '');
            setDiagnosis(diseaseEntry.diagnosis || '');
            setTreatment(diseaseEntry.treatment || '');
            setMedication(diseaseEntry.medication || '');
            setDosage(diseaseEntry.dosage || '');
            setTreatmentDuration(diseaseEntry.treatmentDuration || '');
            setFollowUpDate(new Date(diseaseEntry.followUpDate || new Date()));
          } else if (entry.type === 'birth') {
            const birthEntry = entry as BirthEntry;
            setMotherAnimalId(birthEntry.motherAnimalId || '');
            setNumberOfOffspring(birthEntry.numberOfOffspring.toString());
            setOffspringGender((birthEntry.offspringGender || []).join(', '));
            setBirthWeight((birthEntry.birthWeight || []).join(', '));
            setComplications(birthEntry.complications || '');
          } else if (entry.type === 'death') {
            const deathEntry = entry as DeathEntry;
            setCause(deathEntry.cause || '');
            setPostMortemPerformed(deathEntry.postMortemPerformed || false);
            setPostMortemResults(deathEntry.postMortemResults || '');
          }
        }
      } else if (params.type) {
        setRecordType(params.type);
      }

      setIsLoading(false);
    };

    loadEntry();
  }, [params.id, logEntries]);

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access camera was denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Save the entry
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare base entry
      const baseEntry: any = {
        type: recordType,
        category: 'animal',
        title,
        description,
        date: date.toISOString(),
        animalType,
        animalGroup: animalGroup || undefined,
        count: parseInt(count) || 1,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: images.length > 0 ? images : undefined,
        location: location ? { name: location } : undefined,
      };

      // Add type-specific fields
      if (recordType === 'vaccination') {
        baseEntry.vaccineName = vaccineName;
        baseEntry.vaccineType = vaccineType;
        baseEntry.batchNumber = batchNumber;
        baseEntry.expiryDate = expiryDate.toISOString();
        baseEntry.boosterRequired = boosterRequired;
        if (boosterRequired) {
          baseEntry.boosterDate = boosterDate.toISOString();
        }
      } else if (recordType === 'disease') {
        baseEntry.diseaseName = diseaseName;
        baseEntry.symptoms = symptoms;
        baseEntry.diagnosis = diagnosis;
        baseEntry.treatment = treatment;
        baseEntry.medication = medication;
        baseEntry.dosage = dosage;
        baseEntry.treatmentDuration = treatmentDuration;
        baseEntry.followUpDate = followUpDate.toISOString();
      } else if (recordType === 'birth') {
        baseEntry.motherAnimalId = motherAnimalId || undefined;
        baseEntry.numberOfOffspring = parseInt(numberOfOffspring) || 1;
        baseEntry.offspringGender = offspringGender.split(',').map(g => g.trim().toLowerCase()).filter(g => g === 'male' || g === 'female');
        baseEntry.birthWeight = birthWeight.split(',').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
        baseEntry.complications = complications || undefined;
      } else if (recordType === 'death') {
        baseEntry.cause = cause || undefined;
        baseEntry.postMortemPerformed = postMortemPerformed;
        if (postMortemPerformed) {
          baseEntry.postMortemResults = postMortemResults;
        }
      }

      // Save entry
      if (params.id) {
        await updateLogEntry(params.id, baseEntry);
        Alert.alert('Success', 'Record updated successfully');
      } else {
        await addLogEntry(baseEntry);
        Alert.alert('Success', 'Record added successfully');
      }

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error saving animal health record:', error);
      Alert.alert('Error', 'Failed to save record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <ThemedText type="title">
          {params.id ? 'Edit Animal Health Record' : 'New Animal Health Record'}
        </ThemedText>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Your changes will be saved locally.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Record Type Selection */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Record Type</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recordTypeContainer}
        >
          {HEALTH_RECORD_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.recordTypeButton,
                recordType === type.id && styles.selectedRecordTypeButton,
                { borderColor: type.color }
              ]}
              onPress={() => setRecordType(type.id)}
            >
              <IconSymbol
                name={type.icon}
                size={24}
                color={recordType === type.id ? 'white' : type.color}
              />
              <ThemedText
                style={[
                  styles.recordTypeText,
                  recordType === type.id && styles.selectedRecordTypeText
                ]}
              >
                {type.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Basic Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for this record"
            required
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a description"
            multiline
            numberOfLines={3}
          />

          <ThemedText style={styles.inputLabel}>Date</ThemedText>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>{date.toLocaleDateString()}</ThemedText>
            <IconSymbol name="calendar" size={20} color="#757575" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </ThemedView>

        {/* Animal Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Animal Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.inputLabel}>Animal Type</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={animalType}
              onValueChange={(itemValue) => setAnimalType(itemValue)}
              style={styles.picker}
            >
              {ANIMAL_TYPES.map(type => (
                <Picker.Item key={type.id} label={type.label} value={type.id} />
              ))}
            </Picker>
          </ThemedView>

          <TextInput
            label="Animal Group/Herd"
            value={animalGroup}
            onChangeText={setAnimalGroup}
            placeholder="Enter group or herd name"
          />

          <TextInput
            label="Number of Animals"
            value={count}
            onChangeText={setCount}
            placeholder="Enter number of animals"
            keyboardType="numeric"
          />

          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location (e.g., 'North Paddock')"
          />
        </ThemedView>

        {/* Render type-specific fields */}
        {recordType === 'vaccination' && (
          <ThemedView style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Vaccination Details</ThemedText>

            <TextInput
              label="Vaccine Name"
              value={vaccineName}
              onChangeText={setVaccineName}
              placeholder="Enter vaccine name"
            />

            <TextInput
              label="Vaccine Type"
              value={vaccineType}
              onChangeText={setVaccineType}
              placeholder="Enter vaccine type (e.g., 'Live', 'Inactivated')"
            />

            <TextInput
              label="Batch Number"
              value={batchNumber}
              onChangeText={setBatchNumber}
              placeholder="Enter batch number"
            />

            <ThemedText style={styles.inputLabel}>Expiry Date</ThemedText>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setShowDatePicker(true);
                // We would need to handle this better in a real app
              }}
            >
              <ThemedText>{expiryDate.toLocaleDateString()}</ThemedText>
              <IconSymbol name="calendar" size={20} color="#757575" />
            </TouchableOpacity>

            <ThemedView style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setBoosterRequired(!boosterRequired)}
              >
                {boosterRequired && (
                  <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>Booster Required</ThemedText>
            </ThemedView>

            {boosterRequired && (
              <>
                <ThemedText style={styles.inputLabel}>Booster Date</ThemedText>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    setShowDatePicker(true);
                    // We would need to handle this better in a real app
                  }}
                >
                  <ThemedText>{boosterDate.toLocaleDateString()}</ThemedText>
                  <IconSymbol name="calendar" size={20} color="#757575" />
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        )}

        {recordType === 'disease' && (
          <ThemedView style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Disease Details</ThemedText>

            <TextInput
              label="Disease Name"
              value={diseaseName}
              onChangeText={setDiseaseName}
              placeholder="Enter disease name"
            />

            <TextInput
              label="Symptoms"
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Enter observed symptoms"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Diagnosis"
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Enter diagnosis"
            />

            <TextInput
              label="Treatment"
              value={treatment}
              onChangeText={setTreatment}
              placeholder="Enter treatment details"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Medication"
              value={medication}
              onChangeText={setMedication}
              placeholder="Enter medication used"
            />

            <TextInput
              label="Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholder="Enter dosage"
            />

            <TextInput
              label="Treatment Duration"
              value={treatmentDuration}
              onChangeText={setTreatmentDuration}
              placeholder="Enter treatment duration"
            />

            <ThemedText style={styles.inputLabel}>Follow-up Date</ThemedText>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setShowDatePicker(true);
                // We would need to handle this better in a real app
              }}
            >
              <ThemedText>{followUpDate.toLocaleDateString()}</ThemedText>
              <IconSymbol name="calendar" size={20} color="#757575" />
            </TouchableOpacity>
          </ThemedView>
        )}

        {recordType === 'birth' && (
          <ThemedView style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Birth Details</ThemedText>

            <TextInput
              label="Mother Animal ID (optional)"
              value={motherAnimalId}
              onChangeText={setMotherAnimalId}
              placeholder="Enter mother animal ID"
            />

            <TextInput
              label="Number of Offspring"
              value={numberOfOffspring}
              onChangeText={setNumberOfOffspring}
              placeholder="Enter number of offspring"
              keyboardType="numeric"
            />

            <TextInput
              label="Offspring Gender"
              value={offspringGender}
              onChangeText={setOffspringGender}
              placeholder="Enter gender (male, female) separated by commas"
            />

            <TextInput
              label="Birth Weight (kg)"
              value={birthWeight}
              onChangeText={setBirthWeight}
              placeholder="Enter weights separated by commas"
              keyboardType="numeric"
            />

            <TextInput
              label="Complications"
              value={complications}
              onChangeText={setComplications}
              placeholder="Enter any complications"
              multiline
              numberOfLines={3}
            />
          </ThemedView>
        )}

        {recordType === 'death' && (
          <ThemedView style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Death Details</ThemedText>

            <TextInput
              label="Cause of Death"
              value={cause}
              onChangeText={setCause}
              placeholder="Enter cause of death"
              multiline
              numberOfLines={3}
            />

            <ThemedView style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setPostMortemPerformed(!postMortemPerformed)}
              >
                {postMortemPerformed && (
                  <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>Post-mortem Performed</ThemedText>
            </ThemedView>

            {postMortemPerformed && (
              <TextInput
                label="Post-mortem Results"
                value={postMortemResults}
                onChangeText={setPostMortemResults}
                placeholder="Enter post-mortem results"
                multiline
                numberOfLines={3}
              />
            )}
          </ThemedView>
        )}

        {/* Tags */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tags</ThemedText>
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="Enter tags separated by commas"
          />
        </ThemedView>

        {/* Images */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Images</ThemedText>
        <ThemedView style={styles.formGroup}>
          <ThemedView style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <IconSymbol name="photo.on.rectangle" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Gallery</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <IconSymbol name="camera.fill" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Camera</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContainer}
            >
              {images.map((uri, index) => (
                <ThemedView key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#F44336" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Save Button */}
        <Button
          title={params.id ? 'Update Record' : 'Save Record'}
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
    </ThemedView>
  );
}
