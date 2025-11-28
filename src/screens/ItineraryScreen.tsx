import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  Switch,
  Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
// import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

// Conditional import for maps
let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

import { 
  addDay, 
  addDestination, 
  updateDestination, 
  deleteDestination, 
  reorderDestinations,
  setSelectedDay,
  setItinerary,
  updateDay,
  deleteDay
} from '../store/slices/itinerarySlice';
import { selectTrip } from '../store/slices/tripsSlice';
import { RootState } from '../store';
import { 
  DayItinerary, 
  Destination, 
  Trip 
} from '../types';
import { 
  colors, 
  spacing, 
  typography, 
  shadows 
} from '../utils/theme';
import { 
  mapStyle 
} from '../config/maps';
import { 
  useWindowDimensions 
} from '../hooks/useWindowDimensions';
import type { 
  RootStackParamList, 
  TabParamList 
} from '../navigation/AppNavigator';
import TravelTimeService from '../services/travelTimeService';
import PackingListModal from '../components/PackingListModal';
import AddDestinationModal from '../components/AddDestinationModal';
import CollapsibleSection from '../components/CollapsibleSection';
import WeatherWidget from '../components/WeatherWidget';

// Define navigation and route types
type ItineraryScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<TabParamList, 'Itinerary'>,
  StackNavigationProp<RootStackParamList>
>;

type ItineraryScreenRouteProp = RouteProp<TabParamList, 'Itinerary'>;

// Helper function to ensure we have proper Date objects
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

export default function ItineraryScreen({ route }: { route: ItineraryScreenRouteProp }) {
  // const { t } = useTranslation();
  const t = (key: string) => key;
  const navigation = useNavigation<ItineraryScreenNavigationProp>();
  const dispatch = useDispatch();
  const window = useWindowDimensions();
  const windowWidth = window.width;
  const windowHeight = window.height;
  
  // State
  const [selectedDayView, setSelectedDayView] = useState<number>(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [showPackingList, setShowPackingList] = useState(false);
  const [segmentTravelModes, setSegmentTravelModes] = useState<Map<string, 'driving' | 'walking' | 'transit'>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedDayTitle, setEditedDayTitle] = useState('');
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  
  // Refs
  const mapRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const dragRef = useRef<any>(null);
  
  // Redux selectors
  const selectedTrip = useSelector((state: RootState) => state.trips.selectedTrip);
  const days = useSelector((state: RootState) => state.itinerary.days);
  const destinations = useSelector((state: RootState) => state.itinerary.days.flatMap(day => day.destinations));
  
  // Services
  // const travelTimeService = useRef(new TravelTimeService()).current;
  
  // Calculate layout dimensions
  const leftPanelWidth = windowWidth >= 768 ? windowWidth * 0.4 : windowWidth;
  const rightPanelWidth = windowWidth >= 768 ? windowWidth * 0.6 : windowWidth;
  
  // Find current day data
  const currentDayData = days.find(day => `day${day.dayNumber}` === `day${selectedDayView}`) || days[0];
  
  // Create pan responders for resizing
  const leftDividerPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Handle resize logic here
    },
    onPanResponderRelease: () => {
      // Handle release logic here
    },
  });
  
  const rightDividerPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Handle resize logic here
    },
    onPanResponderRelease: () => {
      // Handle release logic here
    },
  });
  
  // Effects
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      // No route params for dayId in current navigation setup
    }, [])
  );
  
  // Helper functions
  const getMapRegion = () => {
    if (!currentDayData || currentDayData.destinations.length === 0) {
      return {
        latitude: 25.0330,
        longitude: 121.5654,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    const firstDest = currentDayData.destinations[0];
    return {
      latitude: firstDest.latitude,
      longitude: firstDest.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };
  
  const getGoogleMapsEmbedUrl = () => {
    if (!currentDayData || currentDayData.destinations.length === 0) {
      return '';
    }
    
    const origin = currentDayData.destinations[0];
    const destination = currentDayData.destinations[currentDayData.destinations.length - 1];
    const waypoints = currentDayData.destinations.slice(1, -1).map(d => `${d.latitude},${d.longitude}`).join('|');
    
    let url = `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    return url;
  };
  
  const handleRecenter = () => {
    if (mapRef.current && currentDayData && currentDayData.destinations.length > 0) {
      const firstDest = currentDayData.destinations[0];
      mapRef.current.animateToRegion({
        latitude: firstDest.latitude,
        longitude: firstDest.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    }
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  const handleEditDay = (dayId: string, currentTitle: string) => {
    setEditingDayId(dayId);
    setEditedDayTitle(currentTitle);
    setIsEditing(true);
  };
  
  const saveEditedDay = () => {
    if (editingDayId && editedDayTitle.trim()) {
      dispatch(updateDay({ id: editingDayId, title: editedDayTitle.trim() }));
      setIsEditing(false);
      setEditingDayId(null);
      setEditedDayTitle('');
    }
  };
  
  const handleDeleteDay = (dayId: string) => {
    Alert.alert(
      'Delete Day',
      'Are you sure you want to delete this day?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteDay(dayId))
        }
      ]
    );
  };
  
  const handleDeleteDestination = (destId: string) => {
    Alert.alert(
      'Delete Destination',
      'Are you sure you want to delete this destination?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteDestination({ dayNumber: currentDayData.dayNumber, destinationId: destId }))
        }
      ]
    );
  };
  
  const handleDragEnd = ({ data }: { data: Destination[] }) => {
    if (currentDayData) {
      dispatch(reorderDestinations({ 
        // dayId: currentDayData.dayNumber, 
        dayNumber: currentDayData.dayNumber, 
        destinations: data 
      }));
    }
  };
  
  const renderItem = ({ item, drag, isActive }: { item: Destination; drag: () => void; isActive: boolean }) => {
    return (
      <ScaleDecorator>
        <Animated.View>
          <TouchableOpacity
            style={styles.destItem}
            onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Map' } as any)}
            onLongPress={drag}
            disabled={isActive}
          >
            <View style={styles.destDragHandle}>
              <Text style={styles.dragIcon}>⋮⋮</Text>
            </View>
            
            <View style={styles.destInfo}>
              <Text style={styles.destName}>{item.name}</Text>
              <View style={styles.destMeta}>
                <Text style={styles.destDuration}>⏱️ {item.duration || '1 hr'}</Text>
                {item.cost && (
                  <Text style={styles.destCost}>💰 ${item.cost}</Text>
                )}
              </View>
              <Text style={styles.destAddress} numberOfLines={2}>
                📍 {item.address}
              </Text>
              {item.notes && (
                <Text style={styles.destNotes} numberOfLines={2}>
                  📝 {item.notes}
                </Text>
              )}
              <TouchableOpacity style={styles.confirmBadge}>
                <Text style={styles.confirmBadgeText}>{'Instant Confirmation'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScaleDecorator>
    );
  };
  
  if (!selectedTrip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{'No trip selected'}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.surface} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>{selectedTrip.title}</Text>
              <Text style={styles.headerSubtitle}>
                {ensureDate(selectedTrip.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })} - {ensureDate(selectedTrip.endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* LEFT PANEL - Timeline */}
        <View style={[styles.leftPanel, { width: leftPanelWidth }]}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.timeline}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {/* Mobile Day Tabs */}
            {windowWidth < 768 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={`day${day.dayNumber}`}
                    style={[
                      styles.dayTab,
                      selectedDayView === day.dayNumber && styles.dayTabActive
                    ]}
                    onPress={() => setSelectedDayView(day.dayNumber)}
                  >
                    <Text style={[
                      styles.dayTabText,
                      selectedDayView === day.dayNumber && styles.dayTabTextActive
                    ]}>
                      {`Day ${day.dayNumber}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            {/* Desktop Day Sidebar */}
            {windowWidth >= 768 && (
              <View style={styles.daySidebar}>
                <Text style={styles.daySidebarTitle}>{'Itinerary'}</Text>
                {days.map((day) => (
                  <TouchableOpacity
                    key={`day${day.dayNumber}`}
                    style={[
                      styles.daySidebarItem,
                      selectedDayView === day.dayNumber && styles.daySidebarItemActive
                    ]}
                    onPress={() => setSelectedDayView(day.dayNumber)}
                  >
                    <Text style={[
                      styles.daySidebarText,
                      selectedDayView === day.dayNumber && styles.daySidebarTextActive
                    ]}>
                      {`Day ${day.dayNumber}`}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={styles.addDayButton}
                  onPress={() => {
                    const newDay: DayItinerary = {
                      tripId: selectedTrip.id,
                      dayNumber: days.length + 1,
                      date: new Date(Date.now() + days.length * 24 * 60 * 60 * 1000),
                      destinations: [],
                    };
                    dispatch(addDay(newDay));
                  }}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addDayButtonText}>{'Add Day'}</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Day Content */}
            {currentDayData && (
              <View style={styles.dayContent}>
                {/* Day Header */}
                <View style={styles.dayHeader}>
                  <View style={styles.dayHeaderLeft}>
                    {isEditing && editingDayId === `day${currentDayData.dayNumber}` ? (
                      <TextInput
                        style={styles.dayTitleInput}
                        value={editedDayTitle}
                        onChangeText={setEditedDayTitle}
                        onSubmitEditing={saveEditedDay}
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.dayTitle}>{`Day ${currentDayData.dayNumber}`}</Text>
                    )}
                    
                    <Text style={styles.dayDate}>
                      {ensureDate(currentDayData.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.dayActions}>
                    <TouchableOpacity 
                      style={styles.dayActionButton}
                      onPress={() => handleEditDay(`day${currentDayData.dayNumber}`, `Day ${currentDayData.dayNumber}`)}
                    >
                      <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.dayActionButton}
                      onPress={() => handleDeleteDay(`day${currentDayData.dayNumber}`)}
                    >
                      <Ionicons name="trash" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Weather Widget */}
                <CollapsibleSection 
                  title={'Weather'} 
                  expanded={expandedSections['weather']}
                  onToggle={() => toggleSection('weather')}
                >
                  <WeatherWidget 
                    location={selectedTrip.destination} 
                    date={currentDayData.date}
                  />
                </CollapsibleSection>
                
                {/* Destinations List */}
                <CollapsibleSection 
                  title={`${'Destinations'} (${currentDayData.destinations.length})`} 
                  expanded={expandedSections['destinations']}
                  onToggle={() => toggleSection('destinations')}
                >
                  {currentDayData.destinations.length > 0 ? (
                    <>
                      <DraggableFlatList
                        ref={dragRef}
                        data={currentDayData.destinations}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        onDragEnd={handleDragEnd}
                        activationDistance={20}
                      />
                    </>
                  ) : (
                    <View style={styles.emptyTimeline}>
                      <Text style={styles.emptyTimelineIcon}>🗺️</Text>
                      <Text style={styles.emptyTimelineTitle}>{'No destinations yet'}</Text>
                      <Text style={styles.emptyTimelineText}>{'Start planning your day by adding destinations'}</Text>
                      <TouchableOpacity 
                        testID="add-destination-button"
                        style={styles.emptyTimelineButton}
                        onPress={() => setShowAddDestModal(true)}
                      >
                        <Text style={styles.emptyTimelineButtonText}>{'Add First Destination'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </CollapsibleSection>
                
                {/* Add Buttons */}
                {currentDayData.destinations.length > 0 && (
                  <View style={styles.addButtonsRow}>
                    <TouchableOpacity 
                      testID="add-destination-button"
                      style={styles.addButton}
                      onPress={() => setShowAddDestModal(true)}
                    >
                      <Text style={styles.addButtonIcon}>+</Text>
                      <Text style={styles.addButtonText}>{'Add Attractions'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => alert('Hotel booking coming soon!')}>
                      <Text style={styles.addButtonIcon}>🏨</Text>
                      <Text style={styles.addButtonText}>{'Add Hotel'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => alert('Tickets & Tours coming soon!')}>
                      <Text style={styles.addButtonIcon}>🎫</Text>
                      <Text style={styles.addButtonText}>{'Tickets & Tours'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Right Resize Divider */}
        {windowWidth >= 768 && (
          <View {...rightDividerPan.panHandlers} style={styles.resizeDivider}>
            <View style={styles.resizeHandle} />
          </View>
        )}
        
        {/* RIGHT PANEL - Map */}
        {windowWidth >= 768 && (
          <View style={styles.rightPanel}>
            {Platform.OS !== 'web' ? (
              <MapView
                ref={(ref: any) => mapRef.current = ref}
                style={styles.map}
                region={getMapRegion()}
                showsUserLocation
                showsMyLocationButton={false}
              >
                {currentDayData?.destinations.map((dest, index) => (
                  <Marker
                    key={dest.id}
                    coordinate={{
                      latitude: dest.latitude,
                      longitude: dest.longitude,
                    }}
                  >
                    <View style={styles.customMarker}>
                      <Text style={styles.markerNumber}>{index + 1}</Text>
                    </View>
                  </Marker>
                ))}
                {currentDayData && currentDayData.destinations.length > 1 && (
                  <Polyline
                    coordinates={currentDayData.destinations.map(d => ({
                      latitude: d.latitude,
                      longitude: d.longitude,
                    }))}
                    strokeColor="#FF1744"
                    strokeWidth={3}
                  />
                )}
              </MapView>
            ) : (
              <View style={styles.map}>
                {currentDayData && currentDayData.destinations.length > 0 ? (
                  // Google Maps embed for web with route
                  React.createElement('iframe', {
                    key: `map-${selectedDayView}-${currentDayData.destinations.length}`,
                    style: {
                      width: '100%',
                      height: '100%',
                      border: 0,
                    },
                    loading: 'lazy',
                    referrerPolicy: 'no-referrer-when-downgrade',
                    src: getGoogleMapsEmbedUrl(),
                    title: 'Destination Map',
                  })
                ) : (
                  <View style={styles.webMapPlaceholderContainer}>
                    <Text style={styles.webMapPlaceholderIcon}>🗺️</Text>
                    <Text style={styles.webMapPlaceholder}>{'Add destinations to see them on the map'}</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Map Overlay Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapControl} onPress={handleRecenter}>
                <Text style={styles.mapControlIcon}>🧭</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControl} onPress={() => setShowPackingList(true)}>
                <Text style={styles.mapControlIcon}>🎒</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControl} onPress={() => alert('Notes feature coming soon!')}>
                <Text style={styles.mapControlIcon}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Modals */}
      <AddDestinationModal
        visible={showAddDestModal}
        onClose={() => setShowAddDestModal(false)}
        onAddDestination={(destination: any) => {
          if (currentDayData) {
            dispatch(addDestination({ 
              ...destination, 
              // dayId: currentDayData.dayNumber,
              dayNumber: currentDayData.dayNumber,
              tripId: selectedTrip.id
            }));
          }
        }}
      />
      
      <PackingListModal
        visible={showPackingList}
        onClose={() => setShowPackingList(false)}
        tripId={selectedTrip.id}
      />
      
      {/* Floating Add Button (Mobile) */}
      {windowWidth < 768 && (
        <TouchableOpacity 
          style={styles.floatingAddButton}
          onPress={() => setShowAddDestModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.surface,
    marginLeft: spacing.md,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
    marginLeft: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
  },
  timeline: {
    flex: 1,
  },
  dayTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dayTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
  },
  dayTabText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayTabTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  daySidebar: {
    width: 200,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
    padding: spacing.lg,
  },
  daySidebarTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  daySidebarItem: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  daySidebarItemActive: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  daySidebarText: {
    ...typography.body,
    color: colors.textSecondary,
    paddingLeft: spacing.md,
  },
  daySidebarTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addDayButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  dayContent: {
    flex: 1,
    padding: spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dayTitleInput: {
    ...typography.h1,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    padding: 0,
    marginBottom: spacing.xs,
  },
  dayDate: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dayActions: {
    flexDirection: 'row',
  },
  dayActionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  resizeDivider: {
    width: 8,
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    // cursor: 'col-resize',
  },
  resizeHandle: {
    width: 4,
    height: 40,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  rightPanel: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerNumber: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 12,
  },
  mapControls: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'column',
  },
  mapControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  mapControlIcon: {
    fontSize: 18,
  },
  webMapPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  webMapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  webMapPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  destItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  destDragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  dragIcon: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  destMeta: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  destDuration: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  destCost: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  destAddress: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  destNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  confirmBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
  },
  confirmBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  emptyTimeline: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: 12,
    ...shadows.sm,
  },
  emptyTimelineIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTimelineTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyTimelineText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyTimelineButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  emptyTimelineButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  addButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  addButtonIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});