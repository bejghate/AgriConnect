import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { STORAGE_KEYS, getData, storeData } from '@/utils/storage';

// Types for the diagnostic system
interface SymptomOption {
  id: string;
  text: string;
  followUpQuestions?: string[];
}

interface PlantPart {
  id: string;
  name: string;
  symptoms: SymptomOption[];
}

interface DiagnosticResult {
  id: string;
  title: string;
  type: 'disease' | 'pest' | 'deficiency' | 'environmental';
  confidence: number; // 0-100
  description: string;
  imageUrl: string;
  matchedSymptoms: string[];
  recommendedActions: string[];
  encyclopediaItemId?: string; // Link to encyclopedia item if available
}

interface DiagnosticSession {
  plantType: string;
  selectedPlantParts: string[];
  selectedSymptoms: string[];
  imageUri?: string;
  notes?: string;
  timestamp: number;
  results?: DiagnosticResult[];
}

// Mock data for tomato plant parts and symptoms
const TOMATO_PLANT_PARTS: PlantPart[] = [
  {
    id: 'leaves',
    name: 'Leaves',
    symptoms: [
      { 
        id: 'yellow-spots', 
        text: 'Yellow spots or patches',
        followUpQuestions: ['Are the spots circular?', 'Do the spots have dark borders?']
      },
      { 
        id: 'brown-spots', 
        text: 'Brown spots or lesions',
        followUpQuestions: ['Are the spots circular with concentric rings?', 'Do the spots appear water-soaked?']
      },
      { 
        id: 'wilting', 
        text: 'Wilting or drooping',
        followUpQuestions: ['Does wilting occur even when soil is moist?', 'Does wilting improve in the evening?']
      },
      { 
        id: 'curling', 
        text: 'Curling or distortion',
        followUpQuestions: ['Are the leaves curling upward?', 'Are the leaves curling downward?']
      },
      { 
        id: 'white-powder', 
        text: 'White powdery coating',
        followUpQuestions: ['Is the powder easily wiped off?', 'Does it appear on both sides of leaves?']
      }
    ]
  },
  {
    id: 'stems',
    name: 'Stems',
    symptoms: [
      { 
        id: 'dark-lesions', 
        text: 'Dark lesions or cankers',
        followUpQuestions: ['Are the lesions sunken?', 'Do they encircle the stem?']
      },
      { 
        id: 'splitting', 
        text: 'Splitting or cracking',
        followUpQuestions: ['Is there discoloration around the splits?', 'Is there oozing from the cracks?']
      },
      { 
        id: 'soft-rot', 
        text: 'Soft, mushy areas',
        followUpQuestions: ['Is there a foul odor?', 'Is the tissue water-soaked?']
      }
    ]
  },
  {
    id: 'fruit',
    name: 'Fruit',
    symptoms: [
      { 
        id: 'blossom-end-rot', 
        text: 'Dark, sunken areas at bottom of fruit',
        followUpQuestions: ['Is the affected area leathery?', 'Does it appear water-soaked initially?']
      },
      { 
        id: 'cracking', 
        text: 'Cracking or splitting',
        followUpQuestions: ['Are the cracks radiating from the stem?', 'Are the cracks circular around the top?']
      },
      { 
        id: 'spots-on-fruit', 
        text: 'Spots or lesions on fruit surface',
        followUpQuestions: ['Are the spots sunken?', 'Do they have concentric rings?']
      },
      { 
        id: 'catfacing', 
        text: 'Deformed or misshapen fruit',
        followUpQuestions: ['Is there scarring on the fruit?', 'Are there multiple lobes or indentations?']
      }
    ]
  }
];

// Mock diagnostic results for tomato late blight (the example case)
const TOMATO_LATE_BLIGHT: DiagnosticResult = {
  id: 'late-blight',
  title: 'Late Blight (Phytophthora infestans)',
  type: 'disease',
  confidence: 92,
  description: 'Late blight is a destructive disease affecting tomatoes and potatoes. It spreads rapidly in cool, wet conditions and can destroy a crop within days if not controlled.',
  imageUrl: 'https://example.com/images/late-blight.jpg',
  matchedSymptoms: [
    'Brown spots or lesions on leaves',
    'Water-soaked appearance',
    'White fuzzy growth on undersides of leaves',
    'Dark lesions on stems',
    'Brown spots on fruit'
  ],
  recommendedActions: [
    'Remove and destroy infected plants',
    'Apply fungicide containing chlorothalonil or copper',
    'Improve air circulation around plants',
    'Avoid overhead watering',
    'Rotate crops in future seasons'
  ],
  encyclopediaItemId: 'tomato-disease-1' // This would link to the full encyclopedia entry
};

export default function SymptomDiagnosticScreen() {
  const router = useRouter();
  const { plantType } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [step, setStep] = useState<number>(1);
  const [selectedPlantParts, setSelectedPlantParts] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, boolean>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [sessionHistory, setSessionHistory] = useState<DiagnosticSession[]>([]);
  
  useEffect(() => {
    // Load session history from storage
    const loadSessionHistory = async () => {
      const history = await getData<DiagnosticSession[]>(STORAGE_KEYS.SYMPTOM_HISTORY);
      if (history) {
        setSessionHistory(history);
      }
    };
    
    loadSessionHistory();
  }, []);
  
  const handlePlantPartSelection = (partId: string) => {
    setSelectedPlantParts(prev => {
      if (prev.includes(partId)) {
        return prev.filter(id => id !== partId);
      } else {
        return [...prev, partId];
      }
    });
  };
  
  const handleSymptomSelection = (symptomId: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
  };
  
  const handleFollowUpAnswer = (questionId: string, answer: boolean) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to analyze.');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // In a real app, this would send data to an API for analysis
      // For now, we'll simulate a network request and return mock results
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For the example case, if the user selected symptoms related to late blight,
      // return the late blight result
      const lateBlight = selectedSymptoms.some(id => 
        id === 'brown-spots' || id === 'dark-lesions' || id === 'spots-on-fruit'
      );
      
      if (lateBlight) {
        setDiagnosticResults([TOMATO_LATE_BLIGHT]);
      } else {
        // Return empty results for now
        setDiagnosticResults([]);
      }
      
      // Save the session to history
      const newSession: DiagnosticSession = {
        plantType: plantType as string || 'tomato',
        selectedPlantParts,
        selectedSymptoms,
        imageUri: imageUri || undefined,
        notes: notes || undefined,
        timestamp: Date.now(),
        results: lateBlight ? [TOMATO_LATE_BLIGHT] : []
      };
      
      const updatedHistory = [newSession, ...sessionHistory].slice(0, 10); // Keep only the last 10 sessions
      setSessionHistory(updatedHistory);
      await storeData(STORAGE_KEYS.SYMPTOM_HISTORY, updatedHistory);
      
      // Move to results step
      setStep(4);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      alert('There was an error analyzing the symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const navigateToEncyclopediaItem = (itemId: string) => {
    router.push(`/encyclopedia/detail?itemId=${itemId}`);
  };
  
  const navigateBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };
  
  const renderStepIndicator = () => (
    <ThemedView style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(stepNumber => (
        <ThemedView 
          key={stepNumber}
          style={[
            styles.stepDot,
            step >= stepNumber && styles.stepDotActive
          ]}
        />
      ))}
    </ThemedView>
  );
  
  const renderPlantPartSelection = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Step 1: Which parts of the plant show symptoms?
      </ThemedText>
      
      <ThemedView style={styles.optionsContainer}>
        {TOMATO_PLANT_PARTS.map(part => (
          <TouchableOpacity
            key={part.id}
            style={[
              styles.optionButton,
              selectedPlantParts.includes(part.id) && styles.optionButtonSelected
            ]}
            onPress={() => handlePlantPartSelection(part.id)}
          >
            <ThemedText 
              style={[
                styles.optionText,
                selectedPlantParts.includes(part.id) && styles.optionTextSelected
              ]}
            >
              {part.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          selectedPlantParts.length === 0 && styles.nextButtonDisabled
        ]}
        onPress={() => setStep(2)}
        disabled={selectedPlantParts.length === 0}
      >
        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
  
  const renderSymptomSelection = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Step 2: Select the symptoms you observe
      </ThemedText>
      
      <ScrollView style={styles.symptomsScrollView}>
        {TOMATO_PLANT_PARTS
          .filter(part => selectedPlantParts.includes(part.id))
          .map(part => (
            <ThemedView key={part.id} style={styles.partSymptoms}>
              <ThemedText type="defaultSemiBold" style={styles.partTitle}>
                {part.name}
              </ThemedText>
              
              {part.symptoms.map(symptom => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomButton,
                    selectedSymptoms.includes(symptom.id) && styles.symptomButtonSelected
                  ]}
                  onPress={() => handleSymptomSelection(symptom.id)}
                >
                  <ThemedText 
                    style={[
                      styles.symptomText,
                      selectedSymptoms.includes(symptom.id) && styles.symptomTextSelected
                    ]}
                  >
                    {symptom.text}
                  </ThemedText>
                  
                  {selectedSymptoms.includes(symptom.id) && (
                    <IconSymbol name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[
          styles.nextButton,
          selectedSymptoms.length === 0 && styles.nextButtonDisabled
        ]}
        onPress={() => setStep(3)}
        disabled={selectedSymptoms.length === 0}
      >
        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
  
  const renderAdditionalInfo = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Step 3: Additional Information (Optional)
      </ThemedText>
      
      <ThemedView style={styles.imageSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Add a photo of the affected area
        </ThemedText>
        
        <ThemedView style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={handleCameraCapture}>
            <IconSymbol name="camera" size={24} color="#0a7ea4" />
            <ThemedText style={styles.imageButtonText}>Take Photo</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
            <IconSymbol name="photo.on.rectangle" size={24} color="#0a7ea4" />
            <ThemedText style={styles.imageButtonText}>Choose Photo</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {imageUri && (
          <ThemedView style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
      
      <ThemedView style={styles.notesSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Additional notes
        </ThemedText>
        
        <TextInput
          style={styles.notesInput}
          placeholder="Add any other observations or details..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </ThemedView>
      
      <TouchableOpacity 
        style={styles.analyzeButton}
        onPress={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <ThemedText style={styles.analyzeButtonText}>Analyze Symptoms</ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
  
  const renderResults = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Diagnostic Results
      </ThemedText>
      
      {diagnosticResults.length > 0 ? (
        <ScrollView style={styles.resultsScrollView}>
          {diagnosticResults.map(result => (
            <ThemedView key={result.id} style={styles.resultCard}>
              <ThemedView style={styles.resultHeader}>
                <ThemedText type="subtitle">{result.title}</ThemedText>
                <ThemedView style={styles.confidenceContainer}>
                  <ThemedText style={styles.confidenceLabel}>Confidence:</ThemedText>
                  <ThemedText style={styles.confidenceValue}>{result.confidence}%</ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedText style={styles.resultDescription}>{result.description}</ThemedText>
              
              <ThemedView style={styles.matchedSymptomsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Matched Symptoms:
                </ThemedText>
                
                {result.matchedSymptoms.map((symptom, index) => (
                  <ThemedView key={index} style={styles.matchedSymptom}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                    <ThemedText style={styles.matchedSymptomText}>{symptom}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
              
              <ThemedView style={styles.recommendationsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Recommended Actions:
                </ThemedText>
                
                {result.recommendedActions.map((action, index) => (
                  <ThemedView key={index} style={styles.recommendedAction}>
                    <ThemedText style={styles.recommendedActionNumber}>{index + 1}.</ThemedText>
                    <ThemedText style={styles.recommendedActionText}>{action}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
              
              {result.encyclopediaItemId && (
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => navigateToEncyclopediaItem(result.encyclopediaItemId!)}
                >
                  <ThemedText style={styles.viewDetailsText}>
                    View Full Details in Encyclopedia
                  </ThemedText>
                  <IconSymbol name="arrow.right" size={16} color="#0a7ea4" />
                </TouchableOpacity>
              )}
            </ThemedView>
          ))}
        </ScrollView>
      ) : (
        <ThemedView style={styles.noResultsContainer}>
          <IconSymbol name="questionmark.circle" size={48} color="#757575" />
          <ThemedText style={styles.noResultsText}>
            No specific diagnosis found for the selected symptoms.
          </ThemedText>
          <ThemedText style={styles.noResultsSubtext}>
            Try selecting different symptoms or adding a photo for better results.
          </ThemedText>
        </ThemedView>
      )}
      
      <TouchableOpacity 
        style={styles.startOverButton}
        onPress={() => {
          setStep(1);
          setSelectedPlantParts([]);
          setSelectedSymptoms([]);
          setFollowUpAnswers({});
          setImageUri(null);
          setNotes('');
          setDiagnosticResults([]);
        }}
      >
        <ThemedText style={styles.startOverText}>Start New Diagnosis</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedText type="title" style={styles.title}>
        Tomato Plant Diagnostic
      </ThemedText>
      
      {renderStepIndicator()}
      
      {step === 1 && renderPlantPartSelection()}
      {step === 2 && renderSymptomSelection()}
      {step === 3 && renderAdditionalInfo()}
      {step === 4 && renderResults()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  title: {
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#0a7ea4',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  optionText: {
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  symptomsScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  partSymptoms: {
    marginBottom: 16,
  },
  partTitle: {
    marginBottom: 8,
  },
  symptomButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  symptomButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  symptomText: {
    color: '#333',
  },
  symptomTextSelected: {
    color: 'white',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  imageButtonText: {
    marginTop: 8,
    color: '#0a7ea4',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultDescription: {
    marginBottom: 16,
  },
  matchedSymptomsContainer: {
    marginBottom: 16,
  },
  matchedSymptom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchedSymptomText: {
    marginLeft: 8,
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendedAction: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendedActionNumber: {
    width: 20,
    fontWeight: 'bold',
  },
  recommendedActionText: {
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#0a7ea4',
    marginRight: 8,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  startOverButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startOverText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
