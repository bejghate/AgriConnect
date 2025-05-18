import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar as RNCalendar } from 'react-native-calendars';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { CalendarReminder } from '@/data/notifications';

// Reminder item component
const ReminderItem = ({ reminder, onPress, onLongPress }) => {
  // Get icon based on event type
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'planting':
        return 'leaf.fill';
      case 'harvesting':
        return 'scissors';
      case 'fertilizing':
        return 'drop.fill';
      case 'pesticide':
        return 'ladybug.fill';
      case 'vaccination':
        return 'syringe.fill';
      default:
        return 'calendar';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };
  
  // Get status color
  const getStatusColor = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return '#F44336'; // Overdue - Red
    } else if (diffDays <= 2) {
      return '#FF9800'; // Due soon - Orange
    } else {
      return '#4CAF50'; // Upcoming - Green
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.reminderItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <ThemedView 
        style={[
          styles.reminderIcon, 
          { backgroundColor: reminder.color || '#0a7ea4' }
        ]}
      >
        <IconSymbol 
          name={reminder.icon || getEventTypeIcon(reminder.eventType)} 
          size={20} 
          color="white" 
        />
      </ThemedView>
      
      <ThemedView style={styles.reminderContent}>
        <ThemedText type="defaultSemiBold" style={styles.reminderTitle}>
          {reminder.title}
        </ThemedText>
        
        <ThemedText style={styles.reminderDescription} numberOfLines={2}>
          {reminder.description}
        </ThemedText>
        
        <ThemedView style={styles.reminderMeta}>
          <ThemedView style={styles.reminderMetaItem}>
            <IconSymbol name="calendar" size={14} color="#757575" />
            <ThemedText style={styles.reminderMetaText}>
              {formatDate(reminder.dueDate)}
            </ThemedText>
          </ThemedView>
          
          {reminder.field && (
            <ThemedView style={styles.reminderMetaItem}>
              <IconSymbol name="map.fill" size={14} color="#757575" />
              <ThemedText style={styles.reminderMetaText}>
                {reminder.field}
              </ThemedText>
            </ThemedView>
          )}
          
          {reminder.crop && (
            <ThemedView style={styles.reminderMetaItem}>
              <IconSymbol name="leaf.fill" size={14} color="#757575" />
              <ThemedText style={styles.reminderMetaText}>
                {reminder.crop}
              </ThemedText>
            </ThemedView>
          )}
          
          {reminder.livestock && (
            <ThemedView style={styles.reminderMetaItem}>
              <IconSymbol name="pawprint.fill" size={14} color="#757575" />
              <ThemedText style={styles.reminderMetaText}>
                {reminder.livestock}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.reminderStatus}>
        <ThemedView 
          style={[
            styles.reminderStatusBadge, 
            { backgroundColor: getStatusColor(reminder.dueDate) }
          ]}
        >
          <ThemedText style={styles.reminderStatusText}>
            {getDaysRemaining(reminder.dueDate)}
          </ThemedText>
        </ThemedView>
        
        {reminder.isRecurring && (
          <ThemedView style={styles.recurringBadge}>
            <IconSymbol name="arrow.clockwise" size={12} color="#0a7ea4" />
            <ThemedText style={styles.recurringText}>Recurring</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

// Empty state component
const EmptyState = () => (
  <ThemedView style={styles.emptyContainer}>
    <IconSymbol name="calendar.badge.exclamationmark" size={48} color="#757575" />
    <ThemedText type="subtitle" style={styles.emptyTitle}>
      No Reminders
    </ThemedText>
    <ThemedText style={styles.emptyText}>
      You don't have any agricultural calendar reminders. Add reminders for planting, harvesting, fertilizing, and other important farm activities.
    </ThemedText>
  </ThemedView>
);

export default function CalendarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { calendarReminders, markAsRead, addCalendarReminder, deleteNotification } = useNotifications();
  const { isOnline } = useOffline();
  const { primaryUserType } = useUser();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remindersForDate, setRemindersForDate] = useState<CalendarReminder[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newReminder, setNewReminder] = useState<{
    title: string;
    description: string;
    eventType: string;
    dueDate: string;
    field?: string;
    crop?: string;
    livestock?: string;
    isRecurring: boolean;
  }>({
    title: '',
    description: '',
    eventType: 'general',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
  });
  
  // Load calendar data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If ID is provided, find and select that reminder's date
      if (id) {
        const reminder = calendarReminders.find(r => r.id === id);
        if (reminder) {
          const reminderDate = new Date(reminder.dueDate).toISOString().split('T')[0];
          setSelectedDate(reminderDate);
          markAsRead(reminder.id);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, calendarReminders, markAsRead]);
  
  // Update reminders for selected date and marked dates when reminders change
  useEffect(() => {
    // Get reminders for selected date
    const reminders = calendarReminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate).toISOString().split('T')[0];
      return reminderDate === selectedDate;
    });
    setRemindersForDate(reminders);
    
    // Create marked dates object for calendar
    const marked = {};
    calendarReminders.forEach(reminder => {
      const reminderDate = new Date(reminder.dueDate).toISOString().split('T')[0];
      
      // Determine dot color based on priority
      let dotColor = '#0a7ea4';
      if (reminder.priority === 'high') {
        dotColor = '#F44336';
      } else if (reminder.priority === 'medium') {
        dotColor = '#FF9800';
      } else if (reminder.priority === 'low') {
        dotColor = '#4CAF50';
      }
      
      if (marked[reminderDate]) {
        // Add another dot if date already has reminders
        marked[reminderDate].dots.push({
          key: reminder.id,
          color: dotColor,
        });
      } else {
        // Create new marked date
        marked[reminderDate] = {
          dots: [{
            key: reminder.id,
            color: dotColor,
          }],
        };
      }
    });
    
    // Add selected date styling
    if (selectedDate) {
      if (marked[selectedDate]) {
        marked[selectedDate].selected = true;
        marked[selectedDate].selectedColor = '#0a7ea4';
      } else {
        marked[selectedDate] = {
          selected: true,
          selectedColor: '#0a7ea4',
          dots: [],
        };
      }
    }
    
    setMarkedDates(marked);
  }, [calendarReminders, selectedDate]);
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };
  
  // Handle reminder press
  const handleReminderPress = (reminder: CalendarReminder) => {
    // Mark as read
    markAsRead(reminder.id);
    
    // Show reminder details (in a real app, this would navigate to a detail screen)
    Alert.alert(
      reminder.title,
      reminder.description,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };
  
  // Handle reminder long press
  const handleReminderLongPress = (reminder: CalendarReminder) => {
    Alert.alert(
      'Reminder Options',
      'What would you like to do with this reminder?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(reminder.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  
  // Handle add reminder
  const handleAddReminder = () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder.');
      return;
    }
    
    if (!newReminder.description.trim()) {
      Alert.alert('Error', 'Please enter a description for the reminder.');
      return;
    }
    
    // Create new reminder
    addCalendarReminder({
      type: 'calendar_reminder',
      title: newReminder.title,
      description: newReminder.description,
      priority: 'medium',
      icon: 'calendar',
      color: '#4CAF50',
      eventType: newReminder.eventType,
      dueDate: newReminder.dueDate,
      field: newReminder.field,
      crop: newReminder.crop,
      livestock: newReminder.livestock,
      isRecurring: newReminder.isRecurring,
      recurrencePattern: newReminder.isRecurring ? {
        frequency: 'yearly',
        interval: 1,
      } : undefined,
    });
    
    // Reset form and close modal
    setNewReminder({
      title: '',
      description: '',
      eventType: 'general',
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
    });
    setShowAddModal(false);
  };
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading calendar...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Agricultural Calendar</ThemedText>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol name="plus" size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </ThemedView>
      )}
      
      <RNCalendar
        current={selectedDate}
        onDayPress={handleDateSelect}
        markingType={'multi-dot'}
        markedDates={markedDates}
        theme={{
          calendarBackground: 'transparent',
          textSectionTitleColor: '#757575',
          selectedDayBackgroundColor: '#0a7ea4',
          selectedDayTextColor: 'white',
          todayTextColor: '#0a7ea4',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#0a7ea4',
          selectedDotColor: 'white',
          arrowColor: '#0a7ea4',
          monthTextColor: '#2d4150',
          indicatorColor: '#0a7ea4',
        }}
      />
      
      <ThemedView style={styles.remindersContainer}>
        <ThemedText type="subtitle" style={styles.remindersTitle}>
          Reminders for {new Date(selectedDate).toLocaleDateString(undefined, { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </ThemedText>
        
        <ScrollView style={styles.remindersList}>
          {remindersForDate.length > 0 ? (
            remindersForDate.map(reminder => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onPress={() => handleReminderPress(reminder)}
                onLongPress={() => handleReminderLongPress(reminder)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </ScrollView>
      </ThemedView>
      
      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">Add New Reminder</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <IconSymbol name="xmark" size={20} color="#757575" />
              </TouchableOpacity>
            </ThemedView>
            
            <ScrollView style={styles.modalForm}>
              <ThemedText style={styles.inputLabel}>Title</ThemedText>
              <TextInput
                style={styles.textInput}
                value={newReminder.title}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, title: text }))}
                placeholder="Enter reminder title"
              />
              
              <ThemedText style={styles.inputLabel}>Description</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={newReminder.description}
                onChangeText={(text) => setNewReminder(prev => ({ ...prev, description: text }))}
                placeholder="Enter reminder description"
                multiline
                numberOfLines={3}
              />
              
              <ThemedText style={styles.inputLabel}>Event Type</ThemedText>
              <ThemedView style={styles.pickerContainer}>
                {/* In a real app, this would be a proper picker component */}
                <ThemedText>General</ThemedText>
              </ThemedView>
              
              <ThemedText style={styles.inputLabel}>Due Date</ThemedText>
              <ThemedView style={styles.pickerContainer}>
                {/* In a real app, this would be a date picker component */}
                <ThemedText>{selectedDate}</ThemedText>
              </ThemedView>
              
              {primaryUserType === 'farmer' && (
                <>
                  <ThemedText style={styles.inputLabel}>Field (Optional)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={newReminder.field}
                    onChangeText={(text) => setNewReminder(prev => ({ ...prev, field: text }))}
                    placeholder="Enter field name"
                  />
                  
                  <ThemedText style={styles.inputLabel}>Crop (Optional)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={newReminder.crop}
                    onChangeText={(text) => setNewReminder(prev => ({ ...prev, crop: text }))}
                    placeholder="Enter crop type"
                  />
                </>
              )}
              
              {primaryUserType === 'livestock' && (
                <>
                  <ThemedText style={styles.inputLabel}>Livestock (Optional)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={newReminder.livestock}
                    onChangeText={(text) => setNewReminder(prev => ({ ...prev, livestock: text }))}
                    placeholder="Enter livestock type"
                  />
                </>
              )}
              
              <ThemedView style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setNewReminder(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                >
                  {newReminder.isRecurring && (
                    <IconSymbol name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxLabel}>Recurring Event (Yearly)</ThemedText>
              </ThemedView>
            </ScrollView>
            
            <ThemedView style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddReminder}
              >
                <ThemedText style={styles.saveButtonText}>Save Reminder</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
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
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  headerTitle: {
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
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
  remindersContainer: {
    flex: 1,
    padding: 16,
  },
  remindersTitle: {
    marginBottom: 12,
  },
  remindersList: {
    flex: 1,
  },
  reminderItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    marginBottom: 4,
  },
  reminderDescription: {
    marginBottom: 8,
    color: '#757575',
    lineHeight: 20,
  },
  reminderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderMetaText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  reminderStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  reminderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reminderStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recurringText: {
    color: '#0a7ea4',
    fontSize: 10,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalForm: {
    padding: 16,
    maxHeight: 400,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
