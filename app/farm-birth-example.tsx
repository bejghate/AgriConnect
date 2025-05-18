import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { useOffline } from '@/context/OfflineContext';

// Composant pour les champs de formulaire
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', required = false }) => (
  <ThemedView style={styles.formField}>
    <ThemedView style={styles.labelContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {required && <ThemedText style={styles.requiredIndicator}>*</ThemedText>}
    </ThemedView>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </ThemedView>
);

// Composant pour les sélecteurs
const FormPicker = ({ label, value, onValueChange, items, required = false }) => (
  <ThemedView style={styles.formField}>
    <ThemedView style={styles.labelContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {required && <ThemedText style={styles.requiredIndicator}>*</ThemedText>}
    </ThemedView>
    <ThemedView style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        {items.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>
    </ThemedView>
  </ThemedView>
);

// Composant pour les étapes
const StepIndicator = ({ currentStep, totalSteps }) => (
  <ThemedView style={styles.stepIndicator}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <ThemedView 
        key={index} 
        style={[
          styles.stepDot, 
          index === currentStep && styles.activeStepDot
        ]} 
      />
    ))}
  </ThemedView>
);

export default function FarmBirthExampleScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { addLogEntry } = useFarmManagement();
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  // Données du formulaire
  const [animalType, setAnimalType] = useState<string>('cattle');
  const [animalGroup, setAnimalGroup] = useState<string>('Troupeau principal');
  const [motherAnimalId, setMotherAnimalId] = useState<string>('COW-235');
  const [birthDate, setBirthDate] = useState<string>('2023-06-10');
  const [numberOfOffspring, setNumberOfOffspring] = useState<string>('3');
  const [offspringGender, setOffspringGender] = useState<string>('mixed');
  const [birthWeight, setBirthWeight] = useState<string>('25, 28, 26');
  const [complications, setComplications] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('naissance, bovins, reproduction');
  
  // Naviguer vers l'écran précédent
  const navigateBack = () => {
    router.back();
  };
  
  // Passer à l'étape suivante
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Revenir à l'étape précédente
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigateBack();
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      // Simuler l'ajout d'une entrée
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Afficher la modal de succès
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée:', error);
      Alert.alert(
        'Erreur',
        'Une erreur s\'est produite lors de l\'ajout de l\'entrée. Veuillez réessayer.'
      );
    }
  };
  
  // Fermer la modal et naviguer vers l'écran de statistiques
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/farm-statistics');
  };
  
  // Rendu de l'étape 1 : Informations générales
  const renderStep1 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Informations Générales</ThemedText>
      
      <FormPicker
        label="Type d'animal"
        value={animalType}
        onValueChange={setAnimalType}
        items={[
          { label: 'Bovins', value: 'cattle' },
          { label: 'Ovins', value: 'sheep' },
          { label: 'Caprins', value: 'goat' },
          { label: 'Volailles', value: 'poultry' },
        ]}
        required
      />
      
      <FormField
        label="Groupe d'animaux"
        value={animalGroup}
        onChangeText={setAnimalGroup}
        placeholder="Ex: Troupeau principal"
        required
      />
      
      <FormField
        label="ID de la mère"
        value={motherAnimalId}
        onChangeText={setMotherAnimalId}
        placeholder="Ex: COW-235"
        required
      />
      
      <FormField
        label="Date de naissance"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="AAAA-MM-JJ"
        required
      />
    </ThemedView>
  );
  
  // Rendu de l'étape 2 : Détails de la naissance
  const renderStep2 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Détails de la Naissance</ThemedText>
      
      <FormField
        label="Nombre de nouveau-nés"
        value={numberOfOffspring}
        onChangeText={setNumberOfOffspring}
        placeholder="Ex: 1"
        keyboardType="numeric"
        required
      />
      
      <FormPicker
        label="Genre des nouveau-nés"
        value={offspringGender}
        onValueChange={setOffspringGender}
        items={[
          { label: 'Mâle(s)', value: 'male' },
          { label: 'Femelle(s)', value: 'female' },
          { label: 'Mixte', value: 'mixed' },
        ]}
        required
      />
      
      <FormField
        label="Poids à la naissance (kg)"
        value={birthWeight}
        onChangeText={setBirthWeight}
        placeholder="Ex: 25, 28, 26 (séparés par des virgules)"
      />
      
      <FormField
        label="Complications"
        value={complications}
        onChangeText={setComplications}
        placeholder="Décrivez les complications s'il y en a eu"
      />
    </ThemedView>
  );
  
  // Rendu de l'étape 3 : Notes et tags
  const renderStep3 = () => (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Notes et Tags</ThemedText>
      
      <ThemedView style={styles.formField}>
        <ThemedView style={styles.labelContainer}>
          <ThemedText style={styles.label}>Notes</ThemedText>
        </ThemedView>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ajoutez des notes supplémentaires ici"
          multiline
          numberOfLines={4}
        />
      </ThemedView>
      
      <FormField
        label="Tags"
        value={tags}
        onChangeText={setTags}
        placeholder="Ex: naissance, bovins, reproduction (séparés par des virgules)"
      />
      
      <ThemedView style={styles.summaryContainer}>
        <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>Résumé</ThemedText>
        <ThemedText style={styles.summaryText}>
          Naissance de {numberOfOffspring} {animalType === 'cattle' ? 'veau(x)' : 
                         animalType === 'sheep' ? 'agneau(x)' : 
                         animalType === 'goat' ? 'chevreau(x)' : 'poussin(s)'} 
          {offspringGender === 'male' ? ' mâle(s)' : 
           offspringGender === 'female' ? ' femelle(s)' : ' (mixte)'} 
          le {birthDate} dans le groupe "{animalGroup}".
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Exemple: Enregistrer une Naissance</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.exampleDescription}>
          Cet exemple montre comment un éleveur peut enregistrer une naissance dans son troupeau, suivre les informations importantes et générer des statistiques pour évaluer ses performances.
        </ThemedText>
        
        <StepIndicator currentStep={currentStep} totalSteps={3} />
        
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
        
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={prevStep}
          >
            <ThemedText style={styles.buttonText}>
              {currentStep === 0 ? 'Annuler' : 'Précédent'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.nextButton]}
            onPress={nextStep}
          >
            <ThemedText style={styles.nextButtonText}>
              {currentStep === 2 ? 'Enregistrer' : 'Suivant'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
      
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.successModal}>
            <IconSymbol name="checkmark.circle.fill" size={64} color="#4CAF50" />
            <ThemedText type="subtitle" style={styles.successTitle}>
              Naissance Enregistrée avec Succès!
            </ThemedText>
            <ThemedText style={styles.successText}>
              Les informations sur la naissance ont été ajoutées à votre carnet de bord. Vous pouvez maintenant consulter les statistiques mises à jour de votre troupeau.
            </ThemedText>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={handleCloseModal}
            >
              <ThemedText style={styles.successButtonText}>
                Voir les Statistiques
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
  },
  headerTitle: {
    textAlign: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  exampleDescription: {
    marginBottom: 24,
    color: '#757575',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  activeStepDot: {
    backgroundColor: '#0a7ea4',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
  },
  requiredIndicator: {
    color: '#F44336',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  summaryContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#0a7ea4',
    marginLeft: 8,
  },
  buttonText: {
    color: '#757575',
    fontWeight: '500',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  successButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
