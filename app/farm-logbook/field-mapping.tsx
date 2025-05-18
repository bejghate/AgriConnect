import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, View, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useOffline } from '@/context/OfflineContext';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { FieldEntry, FieldIssue, FieldCoordinates } from '@/data/farm-management';

// Field issue types
const FIELD_ISSUE_TYPES = [
  { id: 'pest', label: 'Pest Infestation', icon: 'ant.fill', color: '#F44336' },
  { id: 'disease', label: 'Disease', icon: 'cross.case.fill', color: '#9C27B0' },
  { id: 'erosion', label: 'Soil Erosion', icon: 'drop.triangle.fill', color: '#FF9800' },
  { id: 'water', label: 'Water Issue', icon: 'drop.fill', color: '#2196F3' },
  { id: 'nutrient', label: 'Nutrient Deficiency', icon: 'leaf.fill', color: '#4CAF50' },
  { id: 'other', label: 'Other Issue', icon: 'exclamationmark.triangle.fill', color: '#607D8B' },
];

// Field status options
const FIELD_STATUS_OPTIONS = [
  { id: 'active', label: 'Active', color: '#4CAF50' },
  { id: 'fallow', label: 'Fallow', color: '#FF9800' },
  { id: 'preparation', label: 'In Preparation', color: '#2196F3' },
  { id: 'harvested', label: 'Harvested', color: '#9C27B0' },
  { id: 'inactive', label: 'Inactive', color: '#607D8B' },
];

// Soil types
const SOIL_TYPES = [
  { id: 'clay', label: 'Clay' },
  { id: 'sandy', label: 'Sandy' },
  { id: 'loamy', label: 'Loamy' },
  { id: 'silty', label: 'Silty' },
  { id: 'peaty', label: 'Peaty' },
  { id: 'chalky', label: 'Chalky' },
  { id: 'mixed', label: 'Mixed' },
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
  formGroup: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeInput: {
    flex: 2,
    marginRight: 8,
  },
  unitContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  unitButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedUnitButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitButtonText: {
    color: '#212121',
  },
  selectedUnitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedStatusButton: {
    backgroundColor: '#e8f5e9',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusButtonText: {
    fontSize: 14,
  },
  soilTypeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  soilTypeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSoilTypeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  soilTypeButtonText: {
    fontSize: 14,
  },
  selectedSoilTypeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapButtonsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  activeMapButton: {
    backgroundColor: '#4CAF50',
  },
  noIssuesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noIssuesText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  noIssuesSubtext: {
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  issuesList: {
    maxHeight: 200,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resolvedIssueItem: {
    opacity: 0.6,
  },
  issueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  issueDate: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  issueStatusButton: {
    padding: 4,
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
  noImagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noImagesText: {
    marginTop: 8,
    color: '#757575',
  },
  saveButton: {
    marginTop: 16,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: Dimensions.get('window').width - 48,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  issueTypesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    marginBottom: 16,
  },
  issueTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  selectedIssueTypeButton: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  issueTypeText: {
    marginLeft: 4,
    fontSize: 12,
  },
  selectedIssueTypeText: {
    color: 'white',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#757575',
  },
  saveIssueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveIssueButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 'auto',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default function FieldMappingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { isOnline } = useOffline();
  const { addLogEntry, updateLogEntry, logEntries } = useFarmManagement();
  const mapRef = useRef<MapView>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [isDrawingBoundary, setIsDrawingBoundary] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [unit, setUnit] = useState<string>('hectares');
  const [status, setStatus] = useState<string>('active');
  const [soilType, setSoilType] = useState<string>('loamy');
  const [currentCrop, setCurrentCrop] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  // Map state
  const [initialRegion, setInitialRegion] = useState({
    latitude: 12.3714,
    longitude: -1.5197,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [boundary, setBoundary] = useState<FieldCoordinates[]>([]);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<FieldIssue | null>(null);

  // Load existing field if editing
  useEffect(() => {
    const loadField = async () => {
      if (params.id) {
        const entry = logEntries.find(e => e.id === params.id);
        if (entry && entry.category === 'field') {
          const fieldEntry = entry as FieldEntry;
          setName(fieldEntry.title);
          setDescription(fieldEntry.description);
          setSize(fieldEntry.size?.toString() || '');
          setUnit(fieldEntry.unit || 'hectares');
          setStatus(fieldEntry.status || 'active');
          setSoilType(fieldEntry.soilType || 'loamy');
          setCurrentCrop(fieldEntry.currentCrop || '');
          setImages(fieldEntry.images || []);
          setNotes(fieldEntry.notes || '');
          setTags(fieldEntry.tags.join(', '));

          if (fieldEntry.boundary && fieldEntry.boundary.length > 0) {
            setBoundary(fieldEntry.boundary);

            // Center map on the field
            const latitudes = fieldEntry.boundary.map(coord => coord.latitude);
            const longitudes = fieldEntry.boundary.map(coord => coord.longitude);

            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            const latDelta = (maxLat - minLat) * 1.5;
            const lngDelta = (maxLng - minLng) * 1.5;

            setInitialRegion({
              latitude: centerLat,
              longitude: centerLng,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            });
          }

          if (fieldEntry.issues && fieldEntry.issues.length > 0) {
            setIssues(fieldEntry.issues);
          }
        }
      } else {
        // Get current location
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setInitialRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }

      setIsLoading(false);
    };

    loadField();
  }, [params.id, logEntries]);

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

  // Handle map press for drawing boundary or adding issues
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    if (isDrawingBoundary) {
      // Add point to boundary
      setBoundary([...boundary, coordinate]);
    } else if (isAddingMarker) {
      // Show issue type selection
      setSelectedIssue({
        id: `issue-${Date.now()}`,
        type: 'pest',
        title: '',
        description: '',
        coordinates: coordinate,
        date: new Date().toISOString(),
        resolved: false,
      });
      setIsAddingMarker(false);
    }
  };

  // Complete boundary drawing
  const completeBoundary = () => {
    if (boundary.length < 3) {
      Alert.alert('Error', 'Please add at least 3 points to create a boundary');
      return;
    }

    setIsDrawingBoundary(false);
  };

  // Clear boundary
  const clearBoundary = () => {
    setBoundary([]);
  };

  // Save issue
  const saveIssue = (issue: FieldIssue) => {
    if (!issue.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the issue');
      return;
    }

    const existingIssueIndex = issues.findIndex(i => i.id === issue.id);

    if (existingIssueIndex >= 0) {
      // Update existing issue
      const updatedIssues = [...issues];
      updatedIssues[existingIssueIndex] = issue;
      setIssues(updatedIssues);
    } else {
      // Add new issue
      setIssues([...issues, issue]);
    }

    setSelectedIssue(null);
  };

  // Delete issue
  const deleteIssue = (issueId: string) => {
    setIssues(issues.filter(issue => issue.id !== issueId));
    setSelectedIssue(null);
  };

  // Toggle issue resolved status
  const toggleIssueResolved = (issueId: string) => {
    setIssues(issues.map(issue =>
      issue.id === issueId
        ? { ...issue, resolved: !issue.resolved }
        : issue
    ));
  };

  // Save the field
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the field');
      return;
    }

    if (boundary.length < 3) {
      Alert.alert('Error', 'Please draw a boundary with at least 3 points');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare field entry
      const fieldEntry: Partial<FieldEntry> = {
        type: 'field',
        category: 'field',
        title: name,
        description,
        date: new Date().toISOString(),
        boundary,
        issues,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: images.length > 0 ? images : undefined,
        notes: notes || undefined,
        status,
        soilType,
        currentCrop: currentCrop || undefined,
      };

      if (size && !isNaN(parseFloat(size))) {
        fieldEntry.size = parseFloat(size);
        fieldEntry.unit = unit;
      }

      // Save entry
      if (params.id) {
        await updateLogEntry(params.id, fieldEntry);
        Alert.alert('Success', 'Field updated successfully');
      } else {
        await addLogEntry(fieldEntry);
        Alert.alert('Success', 'Field added successfully');
      }

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error saving field:', error);
      Alert.alert('Error', 'Failed to save field. Please try again.');
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
          {params.id ? 'Edit Field' : 'New Field'}
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
        {/* Basic Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Field Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter field name"
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

          <ThemedView style={styles.rowContainer}>
            <TextInput
              label="Size"
              value={size}
              onChangeText={setSize}
              placeholder="Enter size"
              keyboardType="numeric"
              style={styles.sizeInput}
            />

            <ThemedView style={styles.unitContainer}>
              <ThemedText style={styles.inputLabel}>Unit</ThemedText>
              <ThemedView style={styles.unitButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unit === 'hectares' && styles.selectedUnitButton
                  ]}
                  onPress={() => setUnit('hectares')}
                >
                  <ThemedText style={[
                    styles.unitButtonText,
                    unit === 'hectares' && styles.selectedUnitButtonText
                  ]}>ha</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unit === 'acres' && styles.selectedUnitButton
                  ]}
                  onPress={() => setUnit('acres')}
                >
                  <ThemedText style={[
                    styles.unitButtonText,
                    unit === 'acres' && styles.selectedUnitButtonText
                  ]}>ac</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unit === 'square_meters' && styles.selectedUnitButton
                  ]}
                  onPress={() => setUnit('square_meters')}
                >
                  <ThemedText style={[
                    styles.unitButtonText,
                    unit === 'square_meters' && styles.selectedUnitButtonText
                  ]}>m²</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Field Status and Properties */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Field Properties</ThemedText>
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.inputLabel}>Status</ThemedText>
          <ThemedView style={styles.statusButtonsContainer}>
            {FIELD_STATUS_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.statusButton,
                  status === option.id && styles.selectedStatusButton,
                  { borderColor: option.color }
                ]}
                onPress={() => setStatus(option.id)}
              >
                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                <ThemedText style={styles.statusButtonText}>{option.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedText style={styles.inputLabel}>Soil Type</ThemedText>
          <ThemedView style={styles.soilTypeButtonsContainer}>
            {SOIL_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.soilTypeButton,
                  soilType === type.id && styles.selectedSoilTypeButton
                ]}
                onPress={() => setSoilType(type.id)}
              >
                <ThemedText style={[
                  styles.soilTypeButtonText,
                  soilType === type.id && styles.selectedSoilTypeButtonText
                ]}>{type.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <TextInput
            label="Current Crop"
            value={currentCrop}
            onChangeText={setCurrentCrop}
            placeholder="Enter current crop (if any)"
          />
        </ThemedView>

        {/* Field Mapping */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Field Mapping</ThemedText>
        <ThemedView style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            onPress={handleMapPress}
          >
            {boundary.length > 0 && (
              <Polygon
                coordinates={boundary}
                strokeColor="#4CAF50"
                fillColor="rgba(76, 175, 80, 0.2)"
                strokeWidth={2}
              />
            )}

            {boundary.map((coord, index) => (
              <Marker
                key={`boundary-${index}`}
                coordinate={coord}
                pinColor="#4CAF50"
                opacity={0.7}
              />
            ))}

            {issues.map(issue => (
              <Marker
                key={issue.id}
                coordinate={issue.coordinates}
                pinColor={issue.resolved ? '#607D8B' : FIELD_ISSUE_TYPES.find(t => t.id === issue.type)?.color || '#F44336'}
                onPress={() => setSelectedIssue(issue)}
              />
            ))}
          </MapView>

          <ThemedView style={styles.mapButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.mapButton,
                isDrawingBoundary && styles.activeMapButton
              ]}
              onPress={() => {
                setIsDrawingBoundary(!isDrawingBoundary);
                setIsAddingMarker(false);
              }}
            >
              <IconSymbol name="pencil" size={20} color={isDrawingBoundary ? 'white' : '#4CAF50'} />
            </TouchableOpacity>

            {isDrawingBoundary && (
              <>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={completeBoundary}
                >
                  <IconSymbol name="checkmark" size={20} color="#4CAF50" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={clearBoundary}
                >
                  <IconSymbol name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.mapButton,
                isAddingMarker && styles.activeMapButton
              ]}
              onPress={() => {
                setIsAddingMarker(!isAddingMarker);
                setIsDrawingBoundary(false);
              }}
            >
              <IconSymbol name="mappin.and.ellipse" size={20} color={isAddingMarker ? 'white' : '#F44336'} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Field Issues */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Field Issues ({issues.length})</ThemedText>
        <ThemedView style={styles.formGroup}>
          {issues.length === 0 ? (
            <ThemedView style={styles.noIssuesContainer}>
              <IconSymbol name="checkmark.circle" size={48} color="#4CAF50" />
              <ThemedText style={styles.noIssuesText}>No issues reported</ThemedText>
              <ThemedText style={styles.noIssuesSubtext}>
                Tap the marker button on the map and then tap a location to add an issue
              </ThemedText>
            </ThemedView>
          ) : (
            <ScrollView style={styles.issuesList}>
              {issues.map(issue => (
                <TouchableOpacity
                  key={issue.id}
                  style={[
                    styles.issueItem,
                    issue.resolved && styles.resolvedIssueItem
                  ]}
                  onPress={() => setSelectedIssue(issue)}
                >
                  <ThemedView style={[
                    styles.issueIcon,
                    { backgroundColor: issue.resolved ? '#607D8B' : FIELD_ISSUE_TYPES.find(t => t.id === issue.type)?.color || '#F44336' }
                  ]}>
                    <IconSymbol
                      name={FIELD_ISSUE_TYPES.find(t => t.id === issue.type)?.icon || 'exclamationmark.triangle.fill'}
                      size={16}
                      color="white"
                    />
                  </ThemedView>

                  <ThemedView style={styles.issueContent}>
                    <ThemedText style={styles.issueTitle}>{issue.title}</ThemedText>
                    <ThemedText style={styles.issueDescription} numberOfLines={1}>
                      {issue.description}
                    </ThemedText>
                    <ThemedText style={styles.issueDate}>
                      {new Date(issue.date).toLocaleDateString()}
                    </ThemedText>
                  </ThemedView>

                  <TouchableOpacity
                    style={styles.issueStatusButton}
                    onPress={() => toggleIssueResolved(issue.id)}
                  >
                    <IconSymbol
                      name={issue.resolved ? 'checkmark.circle.fill' : 'circle'}
                      size={24}
                      color={issue.resolved ? '#4CAF50' : '#757575'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Field Images */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Field Images</ThemedText>
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

          {images.length > 0 ? (
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
          ) : (
            <ThemedView style={styles.noImagesContainer}>
              <IconSymbol name="photo" size={48} color="#e0e0e0" />
              <ThemedText style={styles.noImagesText}>No images added</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Additional Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Additional Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter additional notes"
            multiline
            numberOfLines={4}
          />

          <TextInput
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="Enter tags separated by commas"
          />
        </ThemedView>

        {/* Save Button */}
        <Button
          title={params.id ? 'Update Field' : 'Save Field'}
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        />
      </ScrollView>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {selectedIssue.id.startsWith('issue-') && !selectedIssue.title ? 'New Issue' : 'Issue Details'}
            </ThemedText>

            <ThemedText style={styles.inputLabel}>Issue Type</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.issueTypesContainer}
            >
              {FIELD_ISSUE_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.issueTypeButton,
                    selectedIssue.type === type.id && styles.selectedIssueTypeButton,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedIssue({ ...selectedIssue, type: type.id })}
                >
                  <IconSymbol
                    name={type.icon}
                    size={20}
                    color={selectedIssue.type === type.id ? 'white' : type.color}
                  />
                  <ThemedText
                    style={[
                      styles.issueTypeText,
                      selectedIssue.type === type.id && styles.selectedIssueTypeText
                    ]}
                  >
                    {type.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              label="Title"
              value={selectedIssue.title}
              onChangeText={(text) => setSelectedIssue({ ...selectedIssue, title: text })}
              placeholder="Enter issue title"
              required
            />

            <TextInput
              label="Description"
              value={selectedIssue.description}
              onChangeText={(text) => setSelectedIssue({ ...selectedIssue, description: text })}
              placeholder="Enter issue description"
              multiline
              numberOfLines={3}
            />

            <ThemedView style={styles.modalButtonsContainer}>
              {!selectedIssue.id.startsWith('issue-') && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteIssue(selectedIssue.id)}
                >
                  <IconSymbol name="trash" size={20} color="white" />
                  <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedIssue(null)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveIssueButton}
                onPress={() => saveIssue(selectedIssue)}
              >
                <ThemedText style={styles.saveIssueButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}
