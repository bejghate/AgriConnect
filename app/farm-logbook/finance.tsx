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
import { FinanceEntry, ExpenseEntry, IncomeEntry, InvestmentEntry } from '@/data/farm-management';

// Finance record types
const FINANCE_RECORD_TYPES = [
  { id: 'expense', label: 'Expense', icon: 'arrow.down.circle.fill', color: '#F44336' },
  { id: 'income', label: 'Income', icon: 'arrow.up.circle.fill', color: '#4CAF50' },
  { id: 'investment', label: 'Investment', icon: 'chart.line.uptrend.xyaxis.fill', color: '#2196F3' },
];

// Expense categories
const EXPENSE_CATEGORIES = [
  { id: 'seeds', label: 'Seeds & Plants' },
  { id: 'fertilizer', label: 'Fertilizers' },
  { id: 'pesticides', label: 'Pesticides & Herbicides' },
  { id: 'feed', label: 'Animal Feed' },
  { id: 'veterinary', label: 'Veterinary Services' },
  { id: 'labor', label: 'Labor & Wages' },
  { id: 'equipment', label: 'Equipment & Machinery' },
  { id: 'fuel', label: 'Fuel & Energy' },
  { id: 'rent', label: 'Land Rent' },
  { id: 'maintenance', label: 'Maintenance & Repairs' },
  { id: 'transport', label: 'Transportation' },
  { id: 'marketing', label: 'Marketing & Sales' },
  { id: 'taxes', label: 'Taxes & Insurance' },
  { id: 'loan', label: 'Loan Payments' },
  { id: 'other', label: 'Other Expenses' },
];

// Income categories
const INCOME_CATEGORIES = [
  { id: 'crop_sales', label: 'Crop Sales' },
  { id: 'livestock_sales', label: 'Livestock Sales' },
  { id: 'animal_products', label: 'Animal Products (Milk, Eggs, etc.)' },
  { id: 'services', label: 'Agricultural Services' },
  { id: 'subsidies', label: 'Subsidies & Grants' },
  { id: 'rental', label: 'Land or Equipment Rental' },
  { id: 'other', label: 'Other Income' },
];

// Investment categories
const INVESTMENT_CATEGORIES = [
  { id: 'land', label: 'Land Acquisition' },
  { id: 'buildings', label: 'Buildings & Infrastructure' },
  { id: 'equipment', label: 'Equipment & Machinery' },
  { id: 'livestock', label: 'Breeding Livestock' },
  { id: 'irrigation', label: 'Irrigation Systems' },
  { id: 'technology', label: 'Technology & Software' },
  { id: 'training', label: 'Training & Education' },
  { id: 'certification', label: 'Certifications' },
  { id: 'other', label: 'Other Investments' },
];

// Payment methods
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'mobile_money', label: 'Mobile Money' },
  { id: 'check', label: 'Check' },
  { id: 'credit', label: 'Credit/Deferred Payment' },
  { id: 'barter', label: 'Barter/Exchange' },
  { id: 'other', label: 'Other' },
];

// Currencies
const CURRENCIES = [
  { id: 'XOF', label: 'CFA Franc (XOF)' },
  { id: 'USD', label: 'US Dollar (USD)' },
  { id: 'EUR', label: 'Euro (EUR)' },
  { id: 'GHS', label: 'Ghanaian Cedi (GHS)' },
  { id: 'NGN', label: 'Nigerian Naira (NGN)' },
  { id: 'KES', label: 'Kenyan Shilling (KES)' },
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recordTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedRecordTypeButton: {
    borderWidth: 0,
  },
  recordTypeText: {
    marginLeft: 8,
    color: '#212121',
    fontWeight: '500',
  },
  selectedRecordTypeText: {
    color: 'white',
    fontWeight: 'bold',
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
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountInput: {
    flex: 2,
    marginRight: 8,
  },
  currencyPickerContainer: {
    flex: 1,
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
  receiptContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeReceiptButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  noReceiptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noReceiptText: {
    marginTop: 8,
    color: '#757575',
  },
  saveButton: {
    marginTop: 16,
  },
});

export default function FinanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string, type?: string }>();
  const { isOnline } = useOffline();
  const { addLogEntry, updateLogEntry, logEntries } = useFarmManagement();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Form state
  const [recordType, setRecordType] = useState<string>(params.type || 'expense');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('XOF');
  const [category, setCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [location, setLocation] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [receipt, setReceipt] = useState<string>('');
  const [relatedEntryId, setRelatedEntryId] = useState<string>('');

  // Investment specific fields
  const [expectedReturn, setExpectedReturn] = useState<string>('');
  const [returnPeriod, setReturnPeriod] = useState<string>('');
  const [depreciationPeriod, setDepreciationPeriod] = useState<string>('');

  // Load existing entry if editing
  useEffect(() => {
    const loadEntry = async () => {
      if (params.id) {
        const entry = logEntries.find(e => e.id === params.id);
        if (entry && entry.category === 'finance') {
          setRecordType(entry.type);
          setTitle(entry.title);
          setDescription(entry.description);
          setDate(new Date(entry.date));
          setAmount(entry.amount.toString());
          setCurrency(entry.currency);
          setPaymentMethod(entry.paymentMethod || 'cash');
          setLocation(entry.location?.name || '');
          setTags(entry.tags.join(', '));
          setReceipt(entry.receipt || '');
          setRelatedEntryId(entry.relatedEntryId || '');

          // Set type-specific fields
          if (entry.type === 'expense') {
            const expenseEntry = entry as ExpenseEntry;
            setCategory(expenseEntry.expenseCategory || '');
          } else if (entry.type === 'income') {
            const incomeEntry = entry as IncomeEntry;
            setCategory(incomeEntry.incomeCategory || '');
          } else if (entry.type === 'investment') {
            const investmentEntry = entry as InvestmentEntry;
            setCategory(investmentEntry.investmentCategory || '');
            setExpectedReturn(investmentEntry.expectedReturn?.toString() || '');
            setReturnPeriod(investmentEntry.returnPeriod || '');
            setDepreciationPeriod(investmentEntry.depreciationPeriod?.toString() || '');
          }
        }
      } else if (params.type) {
        setRecordType(params.type);
        // Set default category based on type
        if (params.type === 'expense') {
          setCategory('seeds');
        } else if (params.type === 'income') {
          setCategory('crop_sales');
        } else if (params.type === 'investment') {
          setCategory('equipment');
        }
      } else {
        // Set default category for expense
        setCategory('seeds');
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

  // Pick receipt image
  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceipt(result.assets[0].uri);
    }
  };

  // Take receipt photo
  const takeReceiptPhoto = async () => {
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
      setReceipt(result.assets[0].uri);
    }
  };

  // Remove receipt image
  const removeReceipt = () => {
    setReceipt('');
  };

  // Get categories based on record type
  const getCategories = () => {
    switch (recordType) {
      case 'expense':
        return EXPENSE_CATEGORIES;
      case 'income':
        return INCOME_CATEGORIES;
      case 'investment':
        return INVESTMENT_CATEGORIES;
      default:
        return [];
    }
  };

  // Save the entry
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare base entry
      const baseEntry: any = {
        type: recordType,
        category: 'finance',
        title,
        description,
        date: date.toISOString(),
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        location: location ? { name: location } : undefined,
        receipt: receipt || undefined,
        relatedEntryId: relatedEntryId || undefined,
      };

      // Add type-specific fields
      if (recordType === 'expense') {
        baseEntry.expenseCategory = category;
      } else if (recordType === 'income') {
        baseEntry.incomeCategory = category;
      } else if (recordType === 'investment') {
        baseEntry.investmentCategory = category;
        if (expectedReturn && !isNaN(parseFloat(expectedReturn))) {
          baseEntry.expectedReturn = parseFloat(expectedReturn);
        }
        baseEntry.returnPeriod = returnPeriod || undefined;
        if (depreciationPeriod && !isNaN(parseInt(depreciationPeriod))) {
          baseEntry.depreciationPeriod = parseInt(depreciationPeriod);
        }
      }

      // Save entry
      if (params.id) {
        await updateLogEntry(params.id, baseEntry);
        Alert.alert('Success', 'Financial record updated successfully');
      } else {
        await addLogEntry(baseEntry);
        Alert.alert('Success', 'Financial record added successfully');
      }

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error saving financial record:', error);
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
          {params.id ? 'Edit Financial Record' : 'New Financial Record'}
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
        <ThemedView style={styles.recordTypeContainer}>
          {FINANCE_RECORD_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.recordTypeButton,
                recordType === type.id && styles.selectedRecordTypeButton,
                { borderColor: type.color, backgroundColor: recordType === type.id ? type.color : '#f5f5f5' }
              ]}
              onPress={() => {
                setRecordType(type.id);
                // Reset category when changing type
                if (type.id === 'expense') {
                  setCategory('seeds');
                } else if (type.id === 'income') {
                  setCategory('crop_sales');
                } else if (type.id === 'investment') {
                  setCategory('equipment');
                }
              }}
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
        </ThemedView>

        {/* Basic Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder={`Enter a title for this ${recordType}`}
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

        {/* Financial Information */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Financial Information</ThemedText>
        <ThemedView style={styles.formGroup}>
          <ThemedView style={styles.amountContainer}>
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.amountInput}
              required
            />

            <ThemedView style={styles.currencyPickerContainer}>
              <ThemedText style={styles.inputLabel}>Currency</ThemedText>
              <ThemedView style={styles.pickerContainer}>
                <Picker
                  selectedValue={currency}
                  onValueChange={(itemValue) => setCurrency(itemValue)}
                  style={styles.picker}
                >
                  {CURRENCIES.map(curr => (
                    <Picker.Item key={curr.id} label={curr.label} value={curr.id} />
                  ))}
                </Picker>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.inputLabel}>Category</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {getCategories().map(cat => (
                <Picker.Item key={cat.id} label={cat.label} value={cat.id} />
              ))}
            </Picker>
          </ThemedView>

          <ThemedText style={styles.inputLabel}>Payment Method</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              style={styles.picker}
            >
              {PAYMENT_METHODS.map(method => (
                <Picker.Item key={method.id} label={method.label} value={method.id} />
              ))}
            </Picker>
          </ThemedView>

          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location (e.g., 'Market', 'Farm Supply Store')"
          />

          <TextInput
            label="Related Entry ID (optional)"
            value={relatedEntryId}
            onChangeText={setRelatedEntryId}
            placeholder="Enter ID of a related entry"
          />
        </ThemedView>

        {/* Investment-specific fields */}
        {recordType === 'investment' && (
          <ThemedView style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Investment Details</ThemedText>

            <TextInput
              label="Expected Return"
              value={expectedReturn}
              onChangeText={setExpectedReturn}
              placeholder="Enter expected return amount"
              keyboardType="numeric"
            />

            <TextInput
              label="Return Period"
              value={returnPeriod}
              onChangeText={setReturnPeriod}
              placeholder="Enter return period (e.g., '2 years', 'Annual')"
            />

            <TextInput
              label="Depreciation Period (months)"
              value={depreciationPeriod}
              onChangeText={setDepreciationPeriod}
              placeholder="Enter depreciation period in months"
              keyboardType="numeric"
            />
          </ThemedView>
        )}

        {/* Receipt */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Receipt</ThemedText>
        <ThemedView style={styles.formGroup}>
          <ThemedView style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickReceipt}>
              <IconSymbol name="photo.on.rectangle" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Gallery</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takeReceiptPhoto}>
              <IconSymbol name="camera.fill" size={20} color="#4CAF50" />
              <ThemedText style={styles.imageButtonText}>Camera</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {receipt ? (
            <ThemedView style={styles.receiptContainer}>
              <Image source={{ uri: receipt }} style={styles.receiptImage} />
              <TouchableOpacity
                style={styles.removeReceiptButton}
                onPress={removeReceipt}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#F44336" />
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView style={styles.noReceiptContainer}>
              <IconSymbol name="doc.text" size={48} color="#e0e0e0" />
              <ThemedText style={styles.noReceiptText}>No receipt added</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

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
