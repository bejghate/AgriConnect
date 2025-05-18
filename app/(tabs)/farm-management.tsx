import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Mock data for farm management tools
const managementTools = [
  { id: '1', name: 'Crop Planning', icon: 'calendar' },
  { id: '2', name: 'Field Mapping', icon: 'map.fill' },
  { id: '3', name: 'Inventory', icon: 'list.bullet' },
  { id: '4', name: 'Weather', icon: 'cloud.sun.fill' },
  { id: '5', name: 'Finance', icon: 'dollarsign.circle.fill' },
  { id: '6', name: 'Tasks', icon: 'checkmark.circle.fill' },
];

// Mock data for active crops
const activeFields = [
  {
    id: '101',
    name: 'North Field',
    crop: 'Corn',
    area: '5.2 hectares',
    plantingDate: '15 March 2025',
    harvestDate: '20 August 2025',
    status: 'Growing',
    progress: 45,
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: '102',
    name: 'East Field',
    crop: 'Wheat',
    area: '3.8 hectares',
    plantingDate: '10 April 2025',
    harvestDate: '15 September 2025',
    status: 'Growing',
    progress: 30,
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: '103',
    name: 'South Field',
    crop: 'Soybeans',
    area: '4.5 hectares',
    plantingDate: '5 May 2025',
    harvestDate: '10 October 2025',
    status: 'Planting',
    progress: 10,
    image: require('@/assets/images/react-logo.png'),
  },
];

// Mock data for upcoming tasks
const upcomingTasks = [
  {
    id: '201',
    title: 'Apply Fertilizer',
    field: 'North Field',
    dueDate: 'Tomorrow',
    priority: 'High',
  },
  {
    id: '202',
    title: 'Irrigation Check',
    field: 'East Field',
    dueDate: 'May 20, 2025',
    priority: 'Medium',
  },
  {
    id: '203',
    title: 'Pest Control',
    field: 'South Field',
    dueDate: 'May 22, 2025',
    priority: 'High',
  },
];

// Tool item component
const ToolItem = ({ tool, onPress }) => (
  <TouchableOpacity onPress={() => onPress(tool)} style={styles.toolItem}>
    <ThemedView style={styles.toolIconContainer}>
      <IconSymbol size={28} name={tool.icon} color="#0a7ea4" />
    </ThemedView>
    <ThemedText style={styles.toolName}>{tool.name}</ThemedText>
  </TouchableOpacity>
);

// Field card component
const FieldCard = ({ field, onPress }) => (
  <TouchableOpacity onPress={() => onPress(field)} style={styles.fieldCard}>
    <Image source={field.image} style={styles.fieldImage} />
    <ThemedView style={styles.fieldOverlay}>
      <ThemedText style={styles.fieldName}>{field.name}</ThemedText>
    </ThemedView>
    <ThemedView style={styles.fieldInfo}>
      <ThemedView style={styles.fieldHeader}>
        <ThemedText type="defaultSemiBold">{field.crop}</ThemedText>
        <ThemedText style={styles.fieldArea}>{field.area}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.fieldDates}>
        <ThemedView style={styles.dateItem}>
          <IconSymbol name="calendar" size={14} color="#0a7ea4" />
          <ThemedText style={styles.dateText}>Planted: {field.plantingDate}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.dateItem}>
          <IconSymbol name="calendar" size={14} color="#0a7ea4" />
          <ThemedText style={styles.dateText}>Harvest: {field.harvestDate}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBar}>
          <ThemedView 
            style={[styles.progressFill, { width: `${field.progress}%` }]} 
          />
        </ThemedView>
        <ThemedText style={styles.progressText}>{field.progress}%</ThemedText>
      </ThemedView>
      
      <ThemedView style={[
        styles.statusBadge, 
        field.status === 'Growing' ? styles.growingStatus : styles.plantingStatus
      ]}>
        <ThemedText style={styles.statusText}>{field.status}</ThemedText>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

// Task item component
const TaskItem = ({ task, onPress }) => (
  <TouchableOpacity onPress={() => onPress(task)} style={styles.taskItem}>
    <ThemedView style={styles.taskCheckbox}>
      <IconSymbol name="circle" size={20} color="#0a7ea4" />
    </ThemedView>
    <ThemedView style={styles.taskInfo}>
      <ThemedText type="defaultSemiBold">{task.title}</ThemedText>
      <ThemedText>{task.field}</ThemedText>
      <ThemedView style={styles.taskFooter}>
        <ThemedView style={styles.taskDueDate}>
          <IconSymbol name="calendar" size={14} color="#0a7ea4" />
          <ThemedText style={styles.taskDueDateText}>{task.dueDate}</ThemedText>
        </ThemedView>
        <ThemedView style={[
          styles.priorityBadge, 
          task.priority === 'High' ? styles.highPriority : styles.mediumPriority
        ]}>
          <ThemedText style={styles.priorityText}>{task.priority}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

export default function FarmManagementScreen() {
  const handleToolPress = (tool) => {
    console.log('Tool pressed:', tool.name);
    // Navigation to tool detail would go here
  };

  const handleFieldPress = (field) => {
    console.log('Field pressed:', field.name);
    // Navigation to field detail would go here
  };

  const handleTaskPress = (task) => {
    console.log('Task pressed:', task.title);
    // Navigation to task detail would go here
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C8E6C9', dark: '#1B5E20' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="leaf.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Farm Management</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.introText}>
        Track and manage your farm operations, monitor crops, and plan your agricultural activities.
      </ThemedText>
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Management Tools</ThemedText>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.toolsContainer}
      >
        {managementTools.map(tool => (
          <ToolItem key={tool.id} tool={tool} onPress={handleToolPress} />
        ))}
      </ScrollView>
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Your Fields</ThemedText>
      
      <FlatList
        data={activeFields}
        renderItem={({ item }) => <FieldCard field={item} onPress={handleFieldPress} />}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.fieldsContainer}
      />
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Upcoming Tasks</ThemedText>
      
      <FlatList
        data={upcomingTasks}
        renderItem={({ item }) => <TaskItem task={item} onPress={handleTaskPress} />}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.tasksContainer}
      />
      
      <Collapsible title="Farm Analytics">
        <ThemedText>
          Track your farm's performance with detailed analytics on crop yields, resource usage, and profitability.
        </ThemedText>
        <TouchableOpacity style={styles.viewAnalyticsButton}>
          <ThemedText style={styles.viewAnalyticsText}>View Analytics Dashboard</ThemedText>
        </TouchableOpacity>
      </Collapsible>
      
      <TouchableOpacity style={styles.addButton}>
        <IconSymbol name="plus" size={20} color="white" style={styles.addButtonIcon} />
        <ThemedText style={styles.addButtonText}>Add New Field</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  toolsContainer: {
    paddingBottom: 16,
    gap: 16,
  },
  toolItem: {
    alignItems: 'center',
    width: 80,
    marginRight: 16,
  },
  toolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolName: {
    textAlign: 'center',
    fontSize: 12,
  },
  fieldsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  fieldCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldImage: {
    width: '100%',
    height: 120,
  },
  fieldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fieldName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  fieldInfo: {
    padding: 12,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldArea: {
    fontSize: 14,
  },
  fieldDates: {
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  growingStatus: {
    backgroundColor: '#E8F5E9',
  },
  plantingStatus: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tasksContainer: {
    gap: 12,
    marginBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDueDateText: {
    marginLeft: 6,
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  highPriority: {
    backgroundColor: '#FFEBEE',
  },
  mediumPriority: {
    backgroundColor: '#FFF8E1',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAnalyticsButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAnalyticsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
