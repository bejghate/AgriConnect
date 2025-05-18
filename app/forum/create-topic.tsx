import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { forumCategories, ForumCategory } from '@/data/forum';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
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
    marginTop: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  contentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    margin: 4,
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
  submitButton: {
    marginBottom: 16,
  },
});

export default function CreateTopicScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId as string || '');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          setCategories(forumCategories);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading categories:', error);
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
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

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour votre sujet');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un contenu pour votre sujet');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would send the data to an API
      setTimeout(() => {
        // Navigate to the newly created topic
        Alert.alert('Succès', 'Votre sujet a été créé avec succès', [
          {
            text: 'OK',
            onPress: () => router.push('/forum/topic?id=topic-1')
          }
        ]);

        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating topic:', error);
      setIsSubmitting(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du sujet');
    }
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Nouveau Sujet
        </ThemedText>

        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Votre sujet sera publié lorsque vous serez en ligne.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Titre"
            value={title}
            onChangeText={setTitle}
            placeholder="Entrez un titre pour votre sujet"
            required
          />

          <ThemedText style={styles.inputLabel}>Catégorie</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionnez une catégorie" value="" />
              {categories.map(category => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
          </ThemedView>

          <ThemedText style={styles.inputLabel}>Contenu</ThemedText>
          <RNTextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Décrivez votre sujet en détail..."
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <ThemedText style={styles.inputLabel}>Tags</ThemedText>
          <ThemedView style={styles.tagInputContainer}>
            <RNTextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Ajouter un tag"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
            >
              <IconSymbol name="plus" size={20} color="white" />
            </TouchableOpacity>
          </ThemedView>

          {tags.length > 0 && (
            <ThemedView style={styles.tagsContainer}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  onClose={() => handleRemoveTag(tag)}
                  style={styles.tagChip}
                >
                  {tag}
                </Chip>
              ))}
            </ThemedView>
          )}

          <ThemedText style={styles.inputLabel}>Images</ThemedText>
          <ThemedView style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <IconSymbol name="photo.on.rectangle" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Galerie</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <IconSymbol name="camera.fill" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Appareil photo</ThemedText>
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

        <Button
          title="Publier"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
