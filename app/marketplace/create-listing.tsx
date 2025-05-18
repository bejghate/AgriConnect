import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import {
  farmerProductCategories,
  FarmerProductCategory,
  DeliveryOption
} from '@/data/marketplace';

// Form section component
const FormSection = ({ title, children }) => (
  <ThemedView style={styles.formSection}>
    <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
    {children}
  </ThemedView>
);

// Form input component
const FormInput = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default', required = false }) => (
  <ThemedView style={styles.formGroup}>
    <ThemedView style={styles.labelContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {required && <ThemedText style={styles.requiredIndicator}>*</ThemedText>}
    </ThemedView>
    <TextInput
      style={[
        styles.input,
        multiline && styles.multilineInput
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </ThemedView>
);

export default function CreateListingScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { primaryUserType } = useUser();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FarmerProductCategory>('grains');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [negotiable, setNegotiable] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [harvestDate, setHarvestDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quality, setQuality] = useState('Standard');
  const [productionMethod, setProductionMethod] = useState('Conventional');

  // Delivery options
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(['pickup_only']);
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Request permission for camera and media library
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  const handleAddImage = async (source: 'camera' | 'library') => {
    try {
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDeliveryOption = (option: DeliveryOption) => {
    setDeliveryOptions(prev =>
      prev.includes(option)
        ? prev.filter(opt => opt !== option)
        : [...prev, option]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (minOrderQuantity.trim() && (isNaN(Number(minOrderQuantity)) || Number(minOrderQuantity) <= 0)) {
      newErrors.minOrderQuantity = 'Minimum order quantity must be a positive number';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (deliveryOptions.includes('local_delivery')) {
      if (!deliveryRadius.trim()) {
        newErrors.deliveryRadius = 'Delivery radius is required for local delivery';
      } else if (isNaN(Number(deliveryRadius)) || Number(deliveryRadius) <= 0) {
        newErrors.deliveryRadius = 'Delivery radius must be a positive number';
      }

      if (!deliveryFee.trim()) {
        newErrors.deliveryFee = 'Delivery fee is required for local delivery';
      } else if (isNaN(Number(deliveryFee)) || Number(deliveryFee) < 0) {
        newErrors.deliveryFee = 'Delivery fee must be a non-negative number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to create a listing. Please try again when you have an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors in the form before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would upload images and submit the form data to an API
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Your listing has been created successfully!',
        [
          {
            text: 'View Listing',
            onPress: () => {
              // In a real app, this would navigate to the newly created listing
              router.push('/marketplace');
            }
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setPrice('');
              setPriceUnit('');
              setNegotiable(true);
              setQuantity('');
              setMinOrderQuantity('');
              setImages([]);
              setHarvestDate('');
              setExpiryDate('');
              setQuality('Standard');
              setProductionMethod('Conventional');
              setDeliveryOptions(['pickup_only']);
              setDeliveryRadius('');
              setDeliveryFee('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert(
        'Error',
        'Failed to create listing. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Create Listing</ThemedText>

        {!isOnline && (
          <ThemedView style={styles.offlineBanner}>
            <IconSymbol name="wifi.slash" size={16} color="white" />
            <ThemedText style={styles.offlineBannerText}>
              You're offline. You can prepare your listing, but you'll need to be online to publish it.
            </ThemedText>
          </ThemedView>
        )}

        <FormSection title="Basic Information">
          <FormInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Premium Quality Maize - 500kg"
            required
          />
          {errors.title && <ThemedText style={styles.errorText}>{errors.title}</ThemedText>}

          <ThemedView style={styles.formGroup}>
            <ThemedView style={styles.labelContainer}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <ThemedText style={styles.requiredIndicator}>*</ThemedText>
            </ThemedView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryButtonsContainer}
            >
              {farmerProductCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonSelected
                  ]}
                  onPress={() => setCategory(cat.id as FarmerProductCategory)}
                >
                  <IconSymbol
                    name={cat.icon}
                    size={16}
                    color={category === cat.id ? 'white' : '#0a7ea4'}
                  />
                  <ThemedText
                    style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextSelected
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          <FormInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product in detail..."
            multiline
            required
          />
          {errors.description && <ThemedText style={styles.errorText}>{errors.description}</ThemedText>}
        </FormSection>

        <FormSection title="Pricing and Quantity">
          <ThemedView style={styles.formGroup}>
            <ThemedView style={styles.labelContainer}>
              <ThemedText style={styles.label}>Price</ThemedText>
              <ThemedText style={styles.requiredIndicator}>*</ThemedText>
            </ThemedView>
            <ThemedView style={styles.priceContainer}>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                keyboardType="numeric"
              />
              <ThemedView style={styles.currencyContainer}>
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => {
                    // Cycle through currencies
                    const currencies = ['XOF', 'USD', 'EUR'];
                    const currentIndex = currencies.indexOf(currency);
                    const nextIndex = (currentIndex + 1) % currencies.length;
                    setCurrency(currencies[nextIndex]);
                  }}
                >
                  <ThemedText style={styles.currencySelectorText}>{currency}</ThemedText>
                  <IconSymbol name="chevron.down" size={12} color="#757575" />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          {errors.price && <ThemedText style={styles.errorText}>{errors.price}</ThemedText>}

          <FormInput
            label="Price Unit (optional)"
            value={priceUnit}
            onChangeText={setPriceUnit}
            placeholder="e.g., per kg, per bag, per crate"
          />

          <ThemedView style={styles.formGroup}>
            <ThemedView style={styles.switchContainer}>
              <ThemedText style={styles.label}>Price is negotiable</ThemedText>
              <Switch
                value={negotiable}
                onValueChange={setNegotiable}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedView style={styles.labelContainer}>
              <ThemedText style={styles.label}>Quantity Available</ThemedText>
              <ThemedText style={styles.requiredIndicator}>*</ThemedText>
            </ThemedView>
            <ThemedView style={styles.quantityContainer}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
              <ThemedView style={styles.unitContainer}>
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() => {
                    // Cycle through units
                    const units = ['kg', 'bags', 'crates', 'units', 'tons'];
                    const currentIndex = units.indexOf(quantityUnit);
                    const nextIndex = (currentIndex + 1) % units.length;
                    setQuantityUnit(units[nextIndex]);
                  }}
                >
                  <ThemedText style={styles.unitSelectorText}>{quantityUnit}</ThemedText>
                  <IconSymbol name="chevron.down" size={12} color="#757575" />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          {errors.quantity && <ThemedText style={styles.errorText}>{errors.quantity}</ThemedText>}

          <FormInput
            label="Minimum Order Quantity (optional)"
            value={minOrderQuantity}
            onChangeText={setMinOrderQuantity}
            placeholder="0"
            keyboardType="numeric"
          />
          {errors.minOrderQuantity && <ThemedText style={styles.errorText}>{errors.minOrderQuantity}</ThemedText>}
        </FormSection>

        <FormSection title="Product Details">
          <FormInput
            label="Harvest Date (optional)"
            value={harvestDate}
            onChangeText={setHarvestDate}
            placeholder="YYYY-MM-DD"
          />

          <FormInput
            label="Expiry Date (optional)"
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="YYYY-MM-DD"
          />

          <ThemedView style={styles.formGroup}>
            <ThemedText style={styles.label}>Quality Grade</ThemedText>
            <ThemedView style={styles.qualityButtonsContainer}>
              {['Premium', 'Grade A', 'Standard', 'Economy'].map(grade => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.qualityButton,
                    quality === grade && styles.qualityButtonSelected
                  ]}
                  onPress={() => setQuality(grade)}
                >
                  <ThemedText
                    style={[
                      styles.qualityButtonText,
                      quality === grade && styles.qualityButtonTextSelected
                    ]}
                  >
                    {grade}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText style={styles.label}>Production Method</ThemedText>
            <ThemedView style={styles.productionMethodButtonsContainer}>
              {['Organic', 'Conventional', 'Low-pesticide', 'Hydroponic'].map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.productionMethodButton,
                    productionMethod === method && styles.productionMethodButtonSelected
                  ]}
                  onPress={() => setProductionMethod(method)}
                >
                  <ThemedText
                    style={[
                      styles.productionMethodButtonText,
                      productionMethod === method && styles.productionMethodButtonTextSelected
                    ]}
                  >
                    {method}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        </FormSection>

        <FormSection title="Images">
          <ThemedView style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <ThemedView key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri }}
                  style={styles.image}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <IconSymbol name="xmark.circle.fill" size={24} color="white" />
                </TouchableOpacity>
                {index === 0 && (
                  <ThemedView style={styles.primaryBadge}>
                    <ThemedText style={styles.primaryBadgeText}>Primary</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            ))}

            {images.length < 5 && (
              <ThemedView style={styles.addImageButtons}>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => handleAddImage('camera')}
                >
                  <IconSymbol name="camera.fill" size={24} color="#0a7ea4" />
                  <ThemedText style={styles.addImageText}>Take Photo</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => handleAddImage('library')}
                >
                  <IconSymbol name="photo.on.rectangle" size={24} color="#0a7ea4" />
                  <ThemedText style={styles.addImageText}>Choose Photo</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
          {errors.images && <ThemedText style={styles.errorText}>{errors.images}</ThemedText>}
        </FormSection>

        <FormSection title="Delivery Options">
          <ThemedView style={styles.deliveryOptionsContainer}>
            <ThemedView style={styles.deliveryOption}>
              <ThemedView style={styles.switchContainer}>
                <ThemedText style={styles.label}>Pickup Only</ThemedText>
                <Switch
                  value={deliveryOptions.includes('pickup_only')}
                  onValueChange={() => toggleDeliveryOption('pickup_only')}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.deliveryOption}>
              <ThemedView style={styles.switchContainer}>
                <ThemedText style={styles.label}>Local Delivery</ThemedText>
                <Switch
                  value={deliveryOptions.includes('local_delivery')}
                  onValueChange={() => toggleDeliveryOption('local_delivery')}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
            </ThemedView>

            {deliveryOptions.includes('local_delivery') && (
              <>
                <FormInput
                  label="Delivery Radius (km)"
                  value={deliveryRadius}
                  onChangeText={setDeliveryRadius}
                  placeholder="0"
                  keyboardType="numeric"
                  required
                />
                {errors.deliveryRadius && <ThemedText style={styles.errorText}>{errors.deliveryRadius}</ThemedText>}

                <FormInput
                  label="Delivery Fee"
                  value={deliveryFee}
                  onChangeText={setDeliveryFee}
                  placeholder="0"
                  keyboardType="numeric"
                  required
                />
                {errors.deliveryFee && <ThemedText style={styles.errorText}>{errors.deliveryFee}</ThemedText>}
              </>
            )}

            <ThemedView style={styles.deliveryOption}>
              <ThemedView style={styles.switchContainer}>
                <ThemedText style={styles.label}>Shipping</ThemedText>
                <Switch
                  value={deliveryOptions.includes('shipping')}
                  onValueChange={() => toggleDeliveryOption('shipping')}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </FormSection>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle" size={20} color="white" />
              <ThemedText style={styles.submitButtonText}>Create Listing</ThemedText>
            </>
          )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  requiredIndicator: {
    color: '#F44336',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  qualityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  qualityButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  qualityButtonText: {
    fontSize: 14,
  },
  qualityButtonTextSelected: {
    color: 'white',
  },
  productionMethodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productionMethodButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  productionMethodButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  productionMethodButtonText: {
    fontSize: 14,
  },
  productionMethodButtonTextSelected: {
    color: 'white',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: '100%',
  },
  currencySelectorText: {
    fontSize: 16,
    marginRight: 4,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: '100%',
  },
  unitSelectorText: {
    fontSize: 16,
    marginRight: 4,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  priceInput: {
    flex: 3,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  currencyContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  currencyPicker: {
    height: 50,
  },
  quantityContainer: {
    flexDirection: 'row',
  },
  quantityInput: {
    flex: 3,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  unitContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  unitPicker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 10,
  },
  addImageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  addImageText: {
    color: '#0a7ea4',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  deliveryOptionsContainer: {
    gap: 16,
  },
  deliveryOption: {
    marginBottom: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
