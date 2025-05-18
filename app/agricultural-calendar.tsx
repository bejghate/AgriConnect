import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CalendarUtils } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { sampleCalendarReminders, CalendarReminder } from '@/data/notifications';

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
  calendar: {
    marginBottom: 10,
  },
  legendContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendTitle: {
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#757575',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    flex: 1,
  },
  emptyEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEventsText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#757575',
    textAlign: 'center',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addEventButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  recurringText: {
    fontSize: 12,
    color: '#0a7ea4',
    marginLeft: 4,
  },
  syncContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1f5fe',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  syncButtonText: {
    color: '#0a7ea4',
    fontWeight: '500',
    marginLeft: 8,
  },
});

// Event type colors
const EVENT_COLORS = {
  planting: '#4CAF50',
  harvesting: '#FF9800',
  fertilizing: '#9C27B0',
  pesticide: '#F44336',
  vaccination: '#2196F3',
  general: '#607D8B',
};

// Format date for calendar marking
const formatDate = (dateString: string) => {
  return dateString.split('T')[0]; // Get YYYY-MM-DD part
};

export default function AgriculturalCalendarScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarReminder[]>([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        setReminders(sampleCalendarReminders);
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (reminders.length > 0) {
      // Create marked dates object for calendar
      const marked: any = {};

      reminders.forEach(reminder => {
        const dateKey = formatDate(reminder.dueDate);

        if (!marked[dateKey]) {
          marked[dateKey] = {
            dots: [],
          };
        }

        // Add dot for this event type
        marked[dateKey].dots.push({
          key: reminder.id,
          color: EVENT_COLORS[reminder.eventType],
        });
      });

      // Mark selected date
      if (marked[selectedDate]) {
        marked[selectedDate] = {
          ...marked[selectedDate],
          selected: true,
          selectedColor: '#0a7ea4',
        };
      } else {
        marked[selectedDate] = {
          selected: true,
          selectedColor: '#0a7ea4',
          dots: [],
        };
      }

      setMarkedDates(marked);

      // Filter events for selected date
      const events = reminders.filter(reminder =>
        formatDate(reminder.dueDate) === selectedDate
      );
      setSelectedDateEvents(events);
    }
  }, [reminders, selectedDate]);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleAddReminder = () => {
    router.push(`/add-calendar-reminder?date=${selectedDate}`);
  };

  const handleReminderPress = (reminder: CalendarReminder) => {
    router.push(`/calendar-reminder-detail?id=${reminder.id}`);
  };

  const navigateBack = () => {
    router.back();
  };

  // Get event type icon
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'planting':
        return 'leaf.fill';
      case 'harvesting':
        return 'scissors';
      case 'fertilizing':
        return 'drop.fill';
      case 'pesticide':
        return 'ant.fill';
      case 'vaccination':
        return 'syringe.fill';
      default:
        return 'calendar';
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading agricultural calendar...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText type="title">Agricultural Calendar</ThemedText>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </ThemedView>
      )}

      <Calendar
        style={styles.calendar}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#0a7ea4',
          selectedDayBackgroundColor: '#0a7ea4',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#0a7ea4',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#0a7ea4',
          selectedDotColor: '#ffffff',
          arrowColor: '#0a7ea4',
          monthTextColor: '#0a7ea4',
          indicatorColor: '#0a7ea4',
        }}
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        enableSwipeMonths={true}
      />

      <ThemedView style={styles.legendContainer}>
        <ThemedText type="defaultSemiBold" style={styles.legendTitle}>Event Types</ThemedText>
        <ThemedView style={styles.legendItems}>
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <ThemedView key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <ThemedText style={styles.legendText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.eventsContainer}>
        <ThemedView style={styles.eventsHeader}>
          <ThemedText type="subtitle">
            Events for {new Date(selectedDate).toLocaleDateString()}
          </ThemedText>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddReminder}
          >
            <IconSymbol name="plus" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.eventsList}>
          {selectedDateEvents.length === 0 ? (
            <ThemedView style={styles.emptyEventsContainer}>
              <IconSymbol name="calendar.badge.exclamationmark" size={48} color="#e0e0e0" />
              <ThemedText style={styles.emptyEventsText}>
                No events scheduled for this day.
              </ThemedText>
              <TouchableOpacity
                style={styles.addEventButton}
                onPress={handleAddReminder}
              >
                <IconSymbol name="plus" size={16} color="white" />
                <ThemedText style={styles.addEventButtonText}>Add Event</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            selectedDateEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => handleReminderPress(event)}
              >
                <ThemedView
                  style={[
                    styles.eventIconContainer,
                    { backgroundColor: EVENT_COLORS[event.eventType] }
                  ]}
                >
                  <IconSymbol
                    name={getEventTypeIcon(event.eventType)}
                    size={20}
                    color="white"
                  />
                </ThemedView>

                <ThemedView style={styles.eventContent}>
                  <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                    {event.title}
                  </ThemedText>

                  <ThemedText style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </ThemedText>

                  {event.isRecurring && (
                    <ThemedView style={styles.recurringBadge}>
                      <IconSymbol name="arrow.clockwise" size={12} color="#0a7ea4" />
                      <ThemedText style={styles.recurringText}>
                        {event.recurrencePattern?.frequency.charAt(0).toUpperCase() +
                         event.recurrencePattern?.frequency.slice(1)}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                <IconSymbol name="chevron.right" size={20} color="#757575" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.syncContainer}>
        <TouchableOpacity style={styles.syncButton}>
          <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#0a7ea4" />
          <ThemedText style={styles.syncButtonText}>Sync with External Calendar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
