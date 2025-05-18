import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { useOffline } from '@/context/OfflineContext';
import { LogEntryCategory, LogEntryType } from '@/data/farm-management';

// Composant pour les options d'exportation
const ExportOption = ({ title, description, icon, color, onPress, disabled = false }) => (
  <TouchableOpacity 
    style={[styles.exportOption, disabled && styles.disabledOption]} 
    onPress={onPress}
    disabled={disabled}
  >
    <ThemedView style={[styles.exportIcon, { backgroundColor: color }]}>
      <IconSymbol name={icon} size={24} color="white" />
    </ThemedView>
    <ThemedView style={styles.exportContent}>
      <ThemedText type="defaultSemiBold" style={styles.exportTitle}>{title}</ThemedText>
      <ThemedText style={styles.exportDescription}>{description}</ThemedText>
    </ThemedView>
    <IconSymbol name="chevron.right" size={20} color="#757575" />
  </TouchableOpacity>
);

export default function FarmExportScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { 
    logEntries, 
    filteredEntries,
    filters,
    setFilters,
    exportToCsv,
    exportToPdf,
    isLoading 
  } = useFarmManagement();
  
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportCategory, setExportCategory] = useState<LogEntryCategory | 'all'>('all');
  const [exportType, setExportType] = useState<LogEntryType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Naviguer vers l'écran précédent
  const navigateBack = () => {
    router.back();
  };
  
  // Exporter les données
  const handleExport = async () => {
    if (!isOnline) {
      Alert.alert(
        'Mode hors ligne',
        'L\'exportation des données n\'est pas disponible en mode hors ligne. Veuillez vous connecter à Internet et réessayer.'
      );
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Appliquer les filtres pour l'exportation
      const exportFilters: any = {};
      
      if (exportCategory !== 'all') {
        exportFilters.categories = [exportCategory];
      }
      
      if (exportType !== 'all') {
        exportFilters.types = [exportType];
      }
      
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (dateRange === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (dateRange === 'quarter') {
          startDate.setMonth(now.getMonth() - 3);
        } else if (dateRange === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        exportFilters.startDate = startDate.toISOString();
        exportFilters.endDate = now.toISOString();
      }
      
      // Appliquer les filtres temporairement
      setFilters(exportFilters);
      
      // Exporter les données
      let result = null;
      if (exportFormat === 'csv') {
        result = await exportToCsv();
      } else {
        result = await exportToPdf();
      }
      
      // Simuler une exportation réussie pour la démo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Partager le fichier (simulation)
      await Share.share({
        title: `Données d'exploitation - ${new Date().toLocaleDateString()}`,
        message: `Données d'exploitation exportées au format ${exportFormat.toUpperCase()} - ${new Date().toLocaleDateString()}`,
      });
      
      Alert.alert(
        'Exportation réussie',
        `Les données ont été exportées avec succès au format ${exportFormat.toUpperCase()}.`
      );
    } catch (error) {
      console.error('Erreur lors de l\'exportation des données:', error);
      Alert.alert(
        'Erreur d\'exportation',
        'Une erreur s\'est produite lors de l\'exportation des données. Veuillez réessayer.'
      );
    } finally {
      setIsExporting(false);
    }
  };
  
  // Afficher l'écran de chargement
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Exporter les Données</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. L'exportation des données n'est pas disponible.
          </ThemedText>
        </ThemedView>
      )}
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.sectionDescription}>
          Exportez vos données agricoles pour les analyser dans d'autres applications ou les partager avec des partenaires.
        </ThemedText>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>Format d'Exportation</ThemedText>
        
        <ThemedView style={styles.optionsContainer}>
          <ExportOption
            title="Exporter en CSV"
            description="Format tabulaire compatible avec Excel, Google Sheets et autres tableurs"
            icon="doc.text.fill"
            color="#4CAF50"
            onPress={() => setExportFormat('csv')}
            disabled={!isOnline}
          />
          
          <ExportOption
            title="Exporter en PDF"
            description="Format de document portable pour l'impression et le partage"
            icon="doc.fill"
            color="#2196F3"
            onPress={() => setExportFormat('pdf')}
            disabled={!isOnline}
          />
        </ThemedView>
        
        <Collapsible title="Options d'Exportation">
          <ThemedView style={styles.filterContainer}>
            <ThemedText style={styles.filterLabel}>Catégorie</ThemedText>
            <ThemedView style={styles.pickerContainer}>
              <Picker
                selectedValue={exportCategory}
                onValueChange={(value) => setExportCategory(value as LogEntryCategory | 'all')}
                style={styles.picker}
                enabled={isOnline}
              >
                <Picker.Item label="Toutes les catégories" value="all" />
                <Picker.Item label="Animaux" value="animal" />
                <Picker.Item label="Cultures" value="crop" />
                <Picker.Item label="Finances" value="finance" />
                <Picker.Item label="Général" value="general" />
              </Picker>
            </ThemedView>
            
            <ThemedText style={styles.filterLabel}>Type</ThemedText>
            <ThemedView style={styles.pickerContainer}>
              <Picker
                selectedValue={exportType}
                onValueChange={(value) => setExportType(value as LogEntryType | 'all')}
                style={styles.picker}
                enabled={isOnline}
              >
                <Picker.Item label="Tous les types" value="all" />
                <Picker.Item label="Vaccination" value="vaccination" />
                <Picker.Item label="Naissance" value="birth" />
                <Picker.Item label="Maladie" value="disease" />
                <Picker.Item label="Plantation" value="planting" />
                <Picker.Item label="Récolte" value="harvest" />
                <Picker.Item label="Dépense" value="expense" />
                <Picker.Item label="Revenu" value="income" />
                <Picker.Item label="Note" value="note" />
              </Picker>
            </ThemedView>
            
            <ThemedText style={styles.filterLabel}>Période</ThemedText>
            <ThemedView style={styles.pickerContainer}>
              <Picker
                selectedValue={dateRange}
                onValueChange={(value) => setDateRange(value as 'all' | 'month' | 'quarter' | 'year')}
                style={styles.picker}
                enabled={isOnline}
              >
                <Picker.Item label="Toutes les données" value="all" />
                <Picker.Item label="Dernier mois" value="month" />
                <Picker.Item label="Dernier trimestre" value="quarter" />
                <Picker.Item label="Dernière année" value="year" />
              </Picker>
            </ThemedView>
          </ThemedView>
        </Collapsible>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>Aperçu des Données</ThemedText>
        
        <ThemedView style={styles.previewContainer}>
          <ThemedView style={styles.previewHeader}>
            <ThemedText style={styles.previewHeaderText}>Format: {exportFormat.toUpperCase()}</ThemedText>
            <ThemedText style={styles.previewHeaderText}>
              Entrées: {logEntries.length}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.previewContent}>
            <ThemedText style={styles.previewText}>
              L'exportation inclura les champs suivants:
            </ThemedText>
            <ThemedView style={styles.previewFields}>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>ID</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Type</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Catégorie</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Titre</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Description</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Date</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Tags</ThemedText>
              </ThemedView>
              <ThemedView style={styles.previewField}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.previewFieldText}>Données spécifiques au type</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <TouchableOpacity 
          style={[styles.exportButton, (!isOnline || isExporting) && styles.disabledButton]}
          onPress={handleExport}
          disabled={!isOnline || isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="square.and.arrow.up" size={20} color="white" />
          )}
          <ThemedText style={styles.exportButtonText}>
            {isExporting ? 'Exportation en cours...' : `Exporter en ${exportFormat.toUpperCase()}`}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionDescription: {
    marginBottom: 24,
    color: '#757575',
  },
  optionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  exportOption: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledOption: {
    opacity: 0.5,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    color: '#757575',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  previewContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    padding: 12,
  },
  previewHeaderText: {
    fontWeight: '500',
  },
  previewContent: {
    padding: 16,
  },
  previewText: {
    marginBottom: 12,
  },
  previewFields: {
    gap: 8,
  },
  previewField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewFieldText: {
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
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
});
