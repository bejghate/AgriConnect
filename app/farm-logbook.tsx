import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Modal, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { useOffline } from '@/context/OfflineContext';
import { 
  FarmLogEntry, 
  LogEntryType, 
  LogEntryCategory 
} from '@/data/farm-management';

// Composant pour les filtres
const FilterBar = ({ filters, setFilters, onApplyFilters }) => {
  const [isFilterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [tempFilters, setTempFilters] = useState(filters);
  
  // Appliquer les filtres
  const applyFilters = () => {
    onApplyFilters(tempFilters);
    setFilterModalVisible(false);
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setTempFilters({});
    onApplyFilters({});
    setFilterModalVisible(false);
  };
  
  return (
    <ThemedView style={styles.filterBar}>
      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={filters.searchQuery || ''}
          onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
        />
      </ThemedView>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <IconSymbol name="line.3.horizontal.decrease" size={20} color="#0a7ea4" />
      </TouchableOpacity>
      
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.filterModal}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">Filtres</ThemedText>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <IconSymbol name="xmark" size={20} color="#757575" />
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedText style={styles.filterLabel}>Catégorie</ThemedText>
            <Picker
              selectedValue={tempFilters.categories?.[0] || ''}
              onValueChange={(value) => 
                setTempFilters({ 
                  ...tempFilters, 
                  categories: value ? [value as LogEntryCategory] : undefined 
                })
              }
              style={styles.picker}
            >
              <Picker.Item label="Toutes les catégories" value="" />
              <Picker.Item label="Animaux" value="animal" />
              <Picker.Item label="Cultures" value="crop" />
              <Picker.Item label="Finances" value="finance" />
              <Picker.Item label="Général" value="general" />
            </Picker>
            
            <ThemedText style={styles.filterLabel}>Type</ThemedText>
            <Picker
              selectedValue={tempFilters.types?.[0] || ''}
              onValueChange={(value) => 
                setTempFilters({ 
                  ...tempFilters, 
                  types: value ? [value as LogEntryType] : undefined 
                })
              }
              style={styles.picker}
            >
              <Picker.Item label="Tous les types" value="" />
              <Picker.Item label="Vaccination" value="vaccination" />
              <Picker.Item label="Naissance" value="birth" />
              <Picker.Item label="Maladie" value="disease" />
              <Picker.Item label="Plantation" value="planting" />
              <Picker.Item label="Récolte" value="harvest" />
              <Picker.Item label="Dépense" value="expense" />
              <Picker.Item label="Revenu" value="income" />
              <Picker.Item label="Note" value="note" />
            </Picker>
            
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <ThemedText style={styles.resetButtonText}>Réinitialiser</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <ThemedText style={styles.applyButtonText}>Appliquer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
};

// Composant pour une entrée du carnet de bord
const LogEntryItem = ({ entry, onPress }) => {
  // Obtenir l'icône en fonction du type d'entrée
  const getEntryIcon = (type: string): string => {
    switch (type) {
      case 'vaccination':
        return 'syringe';
      case 'birth':
        return 'heart.fill';
      case 'planting':
        return 'leaf.fill';
      case 'harvest':
        return 'cart.fill';
      case 'expense':
        return 'arrow.down.circle.fill';
      case 'income':
        return 'arrow.up.circle.fill';
      default:
        return 'doc.text.fill';
    }
  };
  
  // Obtenir la couleur en fonction de la catégorie
  const getCategoryColor = (category: LogEntryCategory): string => {
    switch (category) {
      case 'animal':
        return '#FF9800';
      case 'crop':
        return '#4CAF50';
      case 'finance':
        return '#2196F3';
      case 'general':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };
  
  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <TouchableOpacity style={styles.entryItem} onPress={() => onPress(entry)}>
      <ThemedView style={[styles.entryIcon, { backgroundColor: getCategoryColor(entry.category) }]}>
        <IconSymbol name={getEntryIcon(entry.type)} size={20} color="white" />
      </ThemedView>
      <ThemedView style={styles.entryContent}>
        <ThemedText type="defaultSemiBold" style={styles.entryTitle}>{entry.title}</ThemedText>
        <ThemedText style={styles.entryDescription} numberOfLines={2}>{entry.description}</ThemedText>
        <ThemedView style={styles.entryFooter}>
          <ThemedText style={styles.entryDate}>{formatDate(entry.date)}</ThemedText>
          <ThemedView style={styles.entryTags}>
            {entry.tags.slice(0, 2).map((tag, index) => (
              <ThemedView key={index} style={styles.tagBadge}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </ThemedView>
            ))}
            {entry.tags.length > 2 && (
              <ThemedText style={styles.moreTags}>+{entry.tags.length - 2}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function FarmLogbookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, action } = params;
  
  const { isOnline } = useOffline();
  const { 
    logEntries, 
    filteredEntries,
    filters,
    setFilters,
    isLoading 
  } = useFarmManagement();
  
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Naviguer vers l'écran d'ajout d'entrée
  useEffect(() => {
    if (action === 'add') {
      // Naviguer vers le formulaire d'ajout
      Alert.alert('Ajouter une entrée', 'Cette fonctionnalité sera implémentée prochainement.');
    }
  }, [action]);
  
  // Naviguer vers l'écran de détail d'entrée
  useEffect(() => {
    if (id) {
      // Naviguer vers le détail de l'entrée
      const entry = logEntries.find(entry => entry.id === id);
      if (entry) {
        Alert.alert('Détail de l\'entrée', 'Cette fonctionnalité sera implémentée prochainement.');
      } else {
        Alert.alert('Erreur', 'Entrée non trouvée.');
        router.back();
      }
    }
  }, [id, logEntries]);
  
  // Appliquer les filtres
  const handleApplyFilters = (newFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };
  
  // Gérer l'appui sur une entrée
  const handleEntryPress = (entry) => {
    router.push(`/farm-logbook?id=${entry.id}`);
  };
  
  // Ajouter une nouvelle entrée
  const handleAddEntry = () => {
    router.push('/farm-logbook?action=add');
  };
  
  // Naviguer vers l'écran précédent
  const navigateBack = () => {
    router.back();
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Carnet de Bord</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      <FilterBar 
        filters={localFilters} 
        setFilters={setLocalFilters} 
        onApplyFilters={handleApplyFilters} 
      />
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}
      
      {filteredEntries.length > 0 ? (
        <FlatList
          data={filteredEntries}
          renderItem={({ item }) => <LogEntryItem entry={item} onPress={handleEntryPress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.entriesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="doc.text" size={48} color="#757575" />
          <ThemedText style={styles.emptyText}>
            Aucune entrée trouvée
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {Object.keys(localFilters).length > 0 
              ? 'Essayez de modifier vos filtres' 
              : 'Commencez à enregistrer vos activités agricoles'}
          </ThemedText>
        </ThemedView>
      )}
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  filterBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  picker: {
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#0a7ea4',
    marginLeft: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  entriesList: {
    paddingBottom: 80,
  },
  entryItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 12,
    color: '#757575',
  },
  entryTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#757575',
  },
  moreTags: {
    fontSize: 10,
    color: '#757575',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0a7ea4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
