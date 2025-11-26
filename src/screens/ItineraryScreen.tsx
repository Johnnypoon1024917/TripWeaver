import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, ImageBackground, Dimensions, Animated, FlatList, Alert, PanResponder, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSelectedDay, deleteDestination as deleteDestinationAction, updateDestination as updateDestinationAction, setDayDestinations, addDestination as addDestinationAction, addDay, setItinerary, setLoading, setError, reorderDestinations } from '../store/slices/itinerarySlice';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { useTranslation } from '../i18n/useTranslation';
import routeOptimizationService from '../services/routeOptimizationService';
import realtimeService from '../services/realtimeService';
import pdfExportService from '../services/pdfExportService';
import shareService from '../services/shareService';
import DatePicker from '../components/DatePicker';
import placesService from '../services/placesService';
import { Destination, DayItinerary } from '../types';
import { tripAPI } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import travelTimeService, { TravelTime } from '../services/travelTimeService';

import { GOOGLE_MAPS_API_KEY } from '../config/maps';

// Conditional imports for maps
let MapView: any;
let Marker: any;
let Polyline: any;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ItineraryScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const selectedTrip = useSelector((state: RootState) => state.trips.selectedTrip);
  const itinerary = useSelector((state: RootState) => state.itinerary.days);
  const currentDay = useSelector((state: RootState) => state.itinerary.selectedDay);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isGuest = useSelector((state: RootState) => state.auth.isGuest);

  // Responsive window dimensions
  const [windowWidth, setWindowWidth] = useState(width);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'day'>('day');
  const [selectedDayView, setSelectedDayView] = useState(1);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [showDestMenu, setShowDestMenu] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMoveToDayModal, setShowMoveToDayModal] = useState(false);
  const [destinationToMove, setDestinationToMove] = useState<any>(null);
  const sidebarAnim = useRef(new Animated.Value(1)).current;
  const [dayStartTime, setDayStartTime] = useState(new Date());
  const [showDayStartPicker, setShowDayStartPicker] = useState(false);
  
  // Add Destination Modal States
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [newDestName, setNewDestName] = useState('');
  const [newDestAddress, setNewDestAddress] = useState('');
  const [newDestCategory, setNewDestCategory] = useState<any>('attraction');
  const [newDestNotes, setNewDestNotes] = useState('');
  const [newDestStartTime, setNewDestStartTime] = useState(new Date());
  const [newDestEndTime, setNewDestEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showNewStartPicker, setShowNewStartPicker] = useState(false);
  const [showNewEndPicker, setShowNewEndPicker] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);
  const [travelTimes, setTravelTimes] = useState<Map<string, TravelTime>>(new Map());
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  // Per-segment travel modes: key is "dayNumber-originId-destId"
  const [segmentTravelModes, setSegmentTravelModes] = useState<Map<string, 'driving' | 'walking' | 'transit'>>(new Map());
  
  // Animation values
  const timelineItemAnims = useRef(new Map()).current;
  const addButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const optimizeButtonAnim = useRef(new Animated.Value(1)).current;
  
  // Resizable columns - Map gets largest area by default
  // Sidebar is 1/5 of screen, center is ~30%, map gets rest
  const [sidebarWidth, setSidebarWidth] = useState(windowWidth < 768 ? 0 : windowWidth * 0.05);
  const [centerWidth, setCenterWidth] = useState(windowWidth < 768 ? windowWidth : Math.min(400, (windowWidth - windowWidth * 0.05) * 0.35));
  
  // Update widths when window resizes
  useEffect(() => {
    if (windowWidth >= 768) {
      setSidebarWidth(windowWidth *0.05);
      setCenterWidth(Math.min(400, (windowWidth - windowWidth * 0.05) * 0.35));
    } else {
      setSidebarWidth(0);
      setCenterWidth(windowWidth);
    }
  }, [windowWidth]);
  
  // Pan responder for left divider (between sidebar and center)
  const leftDividerPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newSidebarWidth = Math.max(250, Math.min(500, sidebarWidth + gestureState.dx));
        setSidebarWidth(newSidebarWidth);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Pan responder for right divider (between center and map)
  const rightDividerPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newCenterWidth = Math.max(300, Math.min(700, centerWidth + gestureState.dx));
        setCenterWidth(newCenterWidth);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Real-time collaboration
  useEffect(() => {
    if (selectedTrip && currentUser) {
      const subscriberId = realtimeService.subscribe(selectedTrip.id, (event) => {
        if (event.userId !== currentUser.id) {
          if (event.type === 'destination_added') {
            dispatch(addDestinationAction({ dayNumber: event.data.dayNumber, destination: event.data }));
          } else if (event.type === 'destination_updated') {
            dispatch(updateDestinationAction(event.data));
          } else if (event.type === 'destination_deleted') {
            dispatch(deleteDestinationAction({ dayNumber: currentDay, destinationId: event.data.destinationId }));
          }
        }
      });
      return () => {
        realtimeService.unsubscribe(selectedTrip.id, subscriberId);
      };
    }
  }, [selectedTrip, currentUser, currentDay]);

  // Update view when itinerary changes
  useEffect(() => {
    // Force re-render when destinations are added/updated
    const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
    if (currentDayData) {
      // Trigger map region update
      if (mapRef && currentDayData.destinations.length > 0) {
        mapRef.animateToRegion(getMapRegion(), 500);
      }
    }
  }, [itinerary, selectedDayView]);

  // Load itinerary from database on mount
  useEffect(() => {
    const loadItinerary = async () => {
      if (selectedTrip) {
        try {
          dispatch(setLoading(true));
          const itineraryData = await tripAPI.getItinerary(selectedTrip.id);
          
          const duration = getDuration();
          
          // Always create all days based on trip duration
          const allDays: DayItinerary[] = [];
          for (let i = 1; i <= duration; i++) {
            // Check if this day exists in the loaded data
            const existingDay = itineraryData.find((d: any) => d.dayNumber === i);
            
            if (existingDay) {
              allDays.push(existingDay);
            } else {
              // Create missing day
              allDays.push({
                tripId: selectedTrip.id,
                dayNumber: i,
                date: new Date(selectedTrip.startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000),
                destinations: [],
                totalDistance: 0,
              });
            }
          }
          
          dispatch(setItinerary(allDays));
        } catch (error) {
          console.error('Failed to load itinerary:', error);
          dispatch(setError('Failed to load itinerary'));
        } finally {
          dispatch(setLoading(false));
        }
      }
    };
    loadItinerary();
  }, [selectedTrip]);

  const onRefresh = async () => {
    if (selectedTrip) {
      try {
        const itineraryData = await tripAPI.getItinerary(selectedTrip.id);
        dispatch(setItinerary(itineraryData));
      } catch (error) {
        console.error('Failed to refresh itinerary:', error);
      }
    }
  };

  const getTotalPlaces = () => itinerary.reduce((sum, day) => sum + day.destinations.length, 0);
  const getTotalDistance = () => itinerary.reduce((sum, day) => sum + (parseFloat(day.totalDistance as any) || 0), 0);
  
  const getDuration = () => {
    if (!selectedTrip) return 0;
    const days = Math.ceil((selectedTrip.endDate.getTime() - selectedTrip.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getMapRegion = () => {
    const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
    if (currentDayData && currentDayData.destinations.length > 0) {
      const lats = currentDayData.destinations.map(d => d.latitude);
      const lngs = currentDayData.destinations.map(d => d.longitude);
      return {
        latitude: lats.reduce((a, b) => a + b, 0) / lats.length,
        longitude: lngs.reduce((a, b) => a + b, 0) / lngs.length,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return { latitude: 22.3193, longitude: 114.1694, latitudeDelta: 0.1, longitudeDelta: 0.1 };
  };

  const handleOptimizeRoute = async () => {
    const day = itinerary.find((d) => d.dayNumber === selectedDayView);
    if (!day || day.destinations.length < 2) {
      alert('Need at least 2 destinations to optimize');
      return;
    }

    setOptimizing(true);
    try {
      const optimized = await routeOptimizationService.optimizeRoute(day.destinations);
      
      const isUUID = selectedTrip && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
      
      if (isUUID) {
        // Real trip - update each destination's order in the database
        for (let i = 0; i < optimized.orderedDestinations.length; i++) {
          const dest = optimized.orderedDestinations[i];
          await tripAPI.updateDestination(selectedTrip!.id, dest.id, { order: i });
        }
      }
      
      // Update Redux store
      dispatch(setDayDestinations({ 
        dayNumber: selectedDayView, 
        destinations: optimized.orderedDestinations 
      }));
      
      alert(`Route optimized${isUUID ? ' and saved' : ''}! Total distance: ${routeOptimizationService.formatDistance(optimized.totalDistance)}`);
    } catch (error) {
      console.error('Failed to optimize route:', error);
      alert('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  const handleDaySelect = (dayNumber: number) => {
    dispatch(setSelectedDay(dayNumber));
  };

  const handleEditDestination = (dest: any) => {
    setEditingDest(dest);
    if (dest.startTime) {
      const [hours, minutes] = dest.startTime.split(':');
      const start = new Date();
      start.setHours(parseInt(hours), parseInt(minutes));
      setTempStartTime(start);
    }
    if (dest.endTime) {
      const [hours, minutes] = dest.endTime.split(':');
      const end = new Date();
      end.setHours(parseInt(hours), parseInt(minutes));
      setTempEndTime(end);
    }
    setTempNotes(dest.notes || '');
    setShowTimeModal(true);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setTempStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setTempEndTime(selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleSaveDestination = async () => {
    if (editingDest && selectedTrip) {
      try {
        const updates = {
          startTime: formatTime(tempStartTime),
          endTime: formatTime(tempEndTime),
          notes: tempNotes,
        };
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
        
        if (isUUID) {
          // Real trip - save to database
          await tripAPI.updateDestination(selectedTrip.id, editingDest.id, updates);
        }
        
        // Update Redux store
        dispatch(updateDestinationAction({
          ...editingDest,
          ...updates,
        }));
        
        setShowTimeModal(false);
        setEditingDest(null);
        Alert.alert('Success', 'Destination updated successfully!');
      } catch (error) {
        console.error('Failed to save destination:', error);
        Alert.alert('Error', 'Failed to save destination');
      }
    }
  };

  const handleDeleteDestination = async (dayNumber: number, destinationId: string) => {
    if (confirm('Are you sure you want to delete this destination?') && selectedTrip) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
        
        if (isUUID) {
          // Real trip - delete from database
          await tripAPI.deleteDestination(selectedTrip.id, destinationId);
        }
        
        // Update Redux store
        dispatch(deleteDestinationAction({ dayNumber, destinationId }));
        
        Alert.alert('Success', 'Destination deleted successfully!');
      } catch (error) {
        console.error('Failed to delete destination:', error);
        Alert.alert('Error', 'Failed to delete destination');
      }
    }
  };

  const handleExportPDF = async () => {
    if (selectedTrip) {
      try {
        await pdfExportService.generatePDF({
          trip: selectedTrip,
          itinerary,
          totalPlaces: getTotalPlaces(),
          totalDays: getDuration(),
        });
        alert('PDF exported successfully!');
      } catch (error) {
        alert('Failed to export PDF');
      }
    }
  };

  const handleZoomIn = () => {
    if (mapRef) {
      const region = getMapRegion();
      mapRef.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      }, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapRef) {
      const region = getMapRegion();
      mapRef.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      }, 300);
    }
  };

  const handleRecenter = () => {
    if (mapRef) {
      mapRef.animateToRegion(getMapRegion(), 500);
    }
  };

  const toggleSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: showMenuDrawer ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowMenuDrawer(!showMenuDrawer);
    });
  };

  const handleDayStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowDayStartPicker(false);
    if (selectedTime) {
      setDayStartTime(selectedTime);
    }
  };

  const handleAddDay = () => {
    if (!selectedTrip) return;
    
    const lastDay = itinerary[itinerary.length - 1];
    const newDayNumber = lastDay ? lastDay.dayNumber + 1 : 1;
    const newDate = lastDay 
      ? new Date(new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000)
      : selectedTrip.startDate;

    const newDay: DayItinerary = {
      tripId: selectedTrip.id,
      dayNumber: newDayNumber,
      date: newDate,
      destinations: [],
      totalDistance: 0,
    };

    dispatch(addDay(newDay));
    setSelectedDayView(newDayNumber);
    setActiveTab('day');
    Alert.alert('Success', `Day ${newDayNumber} added successfully!`);
  };

  const searchDestinations = async (query: string) => {
    if (query.length < 2) {
      setDestSuggestions([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const results = await placesService.autocomplete(query);
      console.log('Search results:', results);
      setDestSuggestions(results);
      
      if (results.length === 0) {
        console.log('No destinations found for:', query);
      }
    } catch (error) {
      console.error('Destination search error:', error);
      setDestSuggestions([]);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const selectDestination = async (place: any) => {
    try {
      // Get full place details
      const details = await placesService.getPlaceDetails(place.place_id);
      if (details) {
        setNewDestName(details.name);
        setNewDestAddress(details.formatted_address);
        setDestSearchQuery('');
        setDestSuggestions([]);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to basic info
      setNewDestName(place.structured_formatting.main_text);
      setNewDestAddress(place.description);
      setDestSearchQuery('');
      setDestSuggestions([]);
    }
  };

  const handleAddNewDestination = async () => {
    if (!newDestName || !newDestAddress) {
      Alert.alert('Error', 'Please search and select a destination');
      return;
    }
    if (!selectedTrip) {
      Alert.alert('Error', 'No trip selected');
      return;
    }

    const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
    if (!currentDayData) {
      Alert.alert('Error', 'Day not found. Please add a day first.');
      return;
    }

    setSavingDestination(true);
    try {
      // Get coordinates from address
      const results = await placesService.searchText(newDestAddress);
      const coords = results[0]?.geometry?.location || { lat: 0, lng: 0 };

      const newDestination: Destination = {
        id: uuidv4(),
        tripId: selectedTrip.id,
        dayNumber: selectedDayView,
        name: newDestName,
        address: newDestAddress,
        latitude: coords.lat,
        longitude: coords.lng,
        category: newDestCategory,
        notes: newDestNotes,
        startTime: formatTime(newDestStartTime),
        endTime: formatTime(newDestEndTime),
        order: currentDayData.destinations.length,
      };

      // Check if this is a mock trip (non-UUID ID) or guest mode - only save locally
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
      
      if (isUUID && !isGuest) {
        // Real trip with authenticated user - save to database
        const savedDestination = await tripAPI.addDestination(selectedTrip.id, newDestination);
        dispatch(addDestinationAction({ dayNumber: selectedDayView, destination: savedDestination }));
      } else {
        // Mock trip or guest user - only update Redux (local state)
        console.log('Guest mode or mock trip detected - saving locally only');
        dispatch(addDestinationAction({ dayNumber: selectedDayView, destination: newDestination }));
      }
      
      // Reset form
      setNewDestName('');
      setNewDestAddress('');
      setNewDestCategory('attraction');
      setNewDestNotes('');
      setNewDestStartTime(new Date());
      setNewDestEndTime(new Date(Date.now() + 60 * 60 * 1000));
      setDestSearchQuery('');
      setDestSuggestions([]);
      setShowAddDestModal(false);
      
      Alert.alert('Success', (isUUID && !isGuest) ? 'Destination saved to database!' : 'Destination added!');
    } catch (error) {
      console.error('Error adding destination:', error);
      Alert.alert('Error', `Failed to save destination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingDestination(false);
    }
  };

  const handleNewStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowNewStartPicker(false);
    if (selectedTime) {
      setNewDestStartTime(selectedTime);
      if (selectedTime >= newDestEndTime) {
        setNewDestEndTime(new Date(selectedTime.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const handleNewEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowNewEndPicker(false);
    if (selectedTime) {
      setNewDestEndTime(selectedTime);
    }
  };

  const handleMoveToDay = async (targetDay: number) => {
    if (!destinationToMove || !selectedTrip) return;

    try {
      const sourceDayNumber = destinationToMove.dayNumber;
      
      // Remove from source day
      const newItinerary = itinerary.map(day => {
        if (day.dayNumber === sourceDayNumber) {
          return {
            ...day,
            destinations: day.destinations.filter(d => d.id !== destinationToMove.id),
          };
        }
        if (day.dayNumber === targetDay) {
          return {
            ...day,
            destinations: [
              ...day.destinations,
              {
                ...destinationToMove,
                dayNumber: targetDay,
                order: day.destinations.length,
              },
            ],
          };
        }
        return day;
      });

      dispatch(setItinerary(newItinerary));

      // Save to backend if authenticated
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
      if (isUUID && !isGuest) {
        await tripAPI.updateDestination(selectedTrip.id, destinationToMove.id, {
          dayNumber: targetDay,
          order: newItinerary.find(d => d.dayNumber === targetDay)!.destinations.length - 1,
        });
      }

      setShowMoveToDayModal(false);
      setDestinationToMove(null);
      Alert.alert('Success', `Moved ${destinationToMove.name} to Day ${targetDay}`);
    } catch (error) {
      console.error('Error moving destination:', error);
      Alert.alert('Error', 'Failed to move destination');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      restaurant: '🍽️',
      attraction: '🏛️',
      hotel: '🏨',
      shopping: '🛍️',
      transport: '🚆',
      activity: '⛷️',
      other: '📍',
    };
    return icons[category] || icons.other;
  };

  // Generate Google Maps URL for web with all destinations
  const getGoogleMapsEmbedUrl = () => {
    const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
    if (!currentDayData || currentDayData.destinations.length === 0) return '';
    
    // For single destination, use place mode
    if (currentDayData.destinations.length === 1) {
      const dest = currentDayData.destinations[0];
      return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(dest.address)}&zoom=15`;
    }
    
    // For multiple destinations, use directions mode
    const origin = currentDayData.destinations[0];
    const destination = currentDayData.destinations[currentDayData.destinations.length - 1];
    
    // Add waypoints (middle destinations)
    const waypoints = currentDayData.destinations
      .slice(1, -1)
      .map(d => encodeURIComponent(d.address))
      .join('|');
    
    let url = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}`;
    url += `&origin=${encodeURIComponent(origin.address)}`;
    url += `&destination=${encodeURIComponent(destination.address)}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += '&mode=driving';
    
    return url;
  };

  // Calculate travel times between destinations with debouncing
  useEffect(() => {
    const calculateTravelTimes = async () => {
      const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
      if (!currentDayData || currentDayData.destinations.length < 2) {
        return;
      }

      const newTravelTimes = new Map<string, TravelTime>();

      // Add delay to debounce API calls
      const timeoutId = setTimeout(async () => {
        for (let i = 0; i < currentDayData.destinations.length - 1; i++) {
          const origin = currentDayData.destinations[i];
          const dest = currentDayData.destinations[i + 1];
          
          const key = `${origin.id}-${dest.id}`;
          const segmentKey = `${selectedDayView}-${origin.id}-${dest.id}`;
          
          // Get the travel mode for this specific segment, or use default
          const mode = segmentTravelModes.get(segmentKey) || 'driving';
          
          try {
            // Calculate travel time with error handling
            const travelTime = await travelTimeService.calculateTravelTime(
              { lat: origin.latitude, lng: origin.longitude },
              { lat: dest.latitude, lng: dest.longitude },
              mode
            );
            
            if (travelTime) {
              newTravelTimes.set(key, travelTime);
            }
          } catch (error) {
            console.error('Travel time calculation error:', error);
            // Continue with next segment even if one fails
          }
          
          // Add small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setTravelTimes(newTravelTimes);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    };

    calculateTravelTimes();
  }, [itinerary, selectedDayView, travelMode, segmentTravelModes]);

  // Handle drag-to-reorder in overview
  const handleOverviewDragEnd = async (dayNumber: number, { data }: { data: Destination[] }) => {
    if (!selectedTrip) return;

    // Update local state
    dispatch(reorderDestinations({ dayNumber, destinations: data }));

    // Save to backend if authenticated
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
    if (isUUID && !isGuest) {
      // Update each destination's order in the database
      try {
        await Promise.all(
          data.map((dest, index) =>
            tripAPI.updateDestination(selectedTrip.id, dest.id, { order: index })
          )
        );
      } catch (error) {
        console.error('Failed to save reorder:', error);
      }
    }
  };

  // Handle drag-to-reorder in day view
  const handleDragEnd = async ({ data }: { data: Destination[] }) => {
    handleOverviewDragEnd(selectedDayView, { data });
  };



  if (!selectedTrip) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No trip selected</Text>
        </View>
      </View>
    );
  }

  const currentDayData = itinerary.find(d => d.dayNumber === selectedDayView);
  const dayTabs = itinerary.map(d => ({
    label: `Day ${d.dayNumber}`,
    date: new Date(d.date),
    dayNumber: d.dayNumber,
  }));

  // Show empty state if no trip is selected
  if (!selectedTrip) {
    return (
      <View style={styles.container}>
        <View style={styles.noTripContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t.noTripSelected}</Text>
          <Text style={styles.emptyTimelineText}>{t.selectTripToViewItinerary}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd]}
              style={styles.goHomeButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.goHomeButtonText}>{t.goToHome}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 3-Column Layout */}
      <View style={styles.threeColumnLayout}>
        {/* LEFT SIDEBAR - Hidden on mobile, show toggle button */}
        {(showMenuDrawer && windowWidth >= 768) && (
          <ScrollView style={[styles.leftSidebar, { width: sidebarWidth }]} showsVerticalScrollIndicator={false}>
            {/* Trip Header */}
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' }}
              style={styles.sidebarHeader}
              blurRadius={2}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                style={styles.sidebarHeaderOverlay}
              >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.sidebarTitle}>{t.trip}</Text>
                <TouchableOpacity style={styles.settingsBtn}>
                  <Text style={styles.settingsBtnText}>⚙</Text>
                </TouchableOpacity>
              </LinearGradient>
            </ImageBackground>

            {/* Trip Info */}
            <View style={styles.tripInfo}>
              <View style={styles.tripDates}>
                <Text style={styles.dateText}>
                  {selectedTrip.startDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} - {selectedTrip.endDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </Text>
                <View style={styles.tripActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('Collaborators', { tripId: selectedTrip.id })}>
                    <Text style={styles.iconCircleText}>👥</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconCircle}>
                    <Text style={styles.iconCircleText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.tripDestination}>{selectedTrip.destination}</Text>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Flight search coming soon!')}>
                <Text style={styles.quickActionIcon}>✈️</Text>
                <Text style={styles.quickActionLabel}>{t.findFlights}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Hotel search coming soon!')}>
                <Text style={styles.quickActionIcon}>🏨</Text>
                <Text style={styles.quickActionLabel}>{t.findHotels}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Car rental coming soon!')}>
                <Text style={styles.quickActionIcon}>🚗</Text>
                <Text style={styles.quickActionLabel}>{t.carRental}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Tickets & Tours coming soon!')}>
                <Text style={styles.quickActionIcon}>🎫</Text>
                <Text style={styles.quickActionLabel}>{t.ticketsAndTours}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📁</Text>
                <Text style={styles.statLabel}>{t.filesAndNotes}</Text>
                <Text style={styles.statValue}>{0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🗺️</Text>
                <Text style={styles.statLabel}>{t.itinerary}</Text>
                <Text style={styles.statValue}>{getTotalDistance().toFixed(1)} km</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📔</Text>
                <Text style={styles.statLabel}>{t.journals}</Text>
                <Text style={styles.statValue}>{0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎒</Text>
                <Text style={styles.statLabel}>{t.packingList}</Text>
                <Text style={styles.statValue}>{0} / {24}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statLabel}>{t.expense}</Text>
                <Text style={styles.statValue}>{0}</Text>
              </View>
            </View>

            {/* Download PDF */}
            <TouchableOpacity style={styles.downloadPDF} onPress={handleExportPDF}>
              <Text style={styles.downloadIcon}>📄</Text>
              <Text style={styles.downloadText}>{t.downloadPDF}</Text>
            </TouchableOpacity>

            {/* Hide Menu Toggle */}
            <TouchableOpacity 
              style={styles.hideMenuBtn}
              onPress={toggleSidebar}
            >
              <Text style={styles.hideMenuText}>{t.hideMenu}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Left Resize Divider */}
        {showMenuDrawer && windowWidth >= 768 && (
          <View {...leftDividerPan.panHandlers} style={styles.resizeDivider}>
            <View style={styles.resizeHandle} />
          </View>
        )}

        {/* CENTER PANEL - Itineraries */}
        <View style={[styles.centerPanel, { width: windowWidth < 768 ? windowWidth : centerWidth }]}>
          {/* Header */}
          <View style={styles.centerHeader}>
            <Text style={styles.centerTitle}>{t.itineraries}</Text>
            <View style={styles.centerHeaderActions}>
              <TouchableOpacity 
                style={styles.optimizeBtn}
                onPress={() => {
                  Animated.sequence([
                    Animated.timing(optimizeButtonAnim, {
                      toValue: 0.95,
                      duration: 100,
                      useNativeDriver: true,
                    }),
                    Animated.timing(optimizeButtonAnim, {
                      toValue: 1,
                      duration: 100,
                      useNativeDriver: true,
                    }),
                  ]).start();
                  handleOptimizeRoute();
                }}
                disabled={optimizing}
              >
                <Animated.View style={{ transform: [{ scale: optimizeButtonAnim }] }}>
                  <Text style={styles.optimizeBtnText}>
                    {optimizing ? t.optimizing : t.optimizeRoute}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Animated.sequence([
                  Animated.timing(addButtonScaleAnim, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                  }),
                  Animated.timing(addButtonScaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                  }),
                ]).start();
                setShowAddDestModal(true);
              }}>
                <Animated.View style={{ transform: [{ scale: addButtonScaleAnim }] }}>
                  <Text style={styles.editBtn}>+ Add</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabSelector}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>{t.overview}</Text>
            </TouchableOpacity>
            {dayTabs.map((tab) => (
              <TouchableOpacity 
                key={tab.dayNumber}
                style={[styles.tab, selectedDayView === tab.dayNumber && activeTab === 'day' && styles.tabActive]}
                onPress={() => {
                  setActiveTab('day');
                  setSelectedDayView(tab.dayNumber);
                }}
              >
                <Text style={[styles.tabText, selectedDayView === tab.dayNumber && activeTab === 'day' && styles.tabTextActive]}>
                  {tab.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={[styles.tabSubtext, selectedDayView === tab.dayNumber && activeTab === 'day' && styles.tabTextActive]}>
                  {t.day} {tab.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.addDayTab}
              onPress={handleAddDay}
            >
              <Text style={styles.addDayTabText}>+ {t.addDay}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextArrow}>
              <Text style={styles.nextArrowText}>›</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Carbon Info */}
          <View style={styles.carbonInfo}>
            <Text style={styles.carbonText}>
              {t.carbonEmissionsText
                .replace('{emissions}', '0.35')
                .replace('{places}', getTotalPlaces().toString())
                .replace('{distance}', getTotalDistance().toFixed(2))}
            </Text>
          </View>

          {/* Day Content */}
          <ScrollView style={styles.dayContent} showsVerticalScrollIndicator={false}>
            {/* Overview Tab - All Days Summary */}
            {activeTab === 'overview' && (() => {
              // Flatten all destinations with day info for cross-day dragging
              const allDestinations = itinerary.flatMap(day => 
                day.destinations.map(dest => ({
                  ...dest,
                  dayNumber: day.dayNumber,
                  dayDate: day.date,
                }))
              );
              
              // Create items array with day headers and destinations
              const renderItems: any[] = [];
              itinerary.forEach(day => {
                // Add day header as non-draggable item
                renderItems.push({
                  type: 'header',
                  id: `header-day-${day.dayNumber}`,
                  dayNumber: day.dayNumber,
                  dayDate: day.date,
                });
                
                // Add destinations for this day
                const dayDests = allDestinations.filter(d => d.dayNumber === day.dayNumber);
                renderItems.push(...dayDests.map(dest => ({ ...dest, type: 'destination' })));
                
                // Add empty placeholder if no destinations
                if (dayDests.length === 0) {
                  renderItems.push({
                    type: 'empty',
                    id: `empty-day-${day.dayNumber}`,
                    dayNumber: day.dayNumber,
                  });
                }
              });
              
              return (
                <View style={styles.overviewContainer}>
                  <DraggableFlatList
                    data={renderItems}
                    onDragBegin={() => {}}
                    onDragEnd={({ data }) => {
                      // Filter out non-destination items
                      const destinations = data.filter(item => item.type === 'destination');
                      
                      // Determine which day each destination should be in based on its position
                      const newItinerary = itinerary.map(day => {
                        const dayIndex = data.findIndex(item => item.type === 'header' && item.dayNumber === day.dayNumber);
                        const nextDayIndex = data.findIndex((item, idx) => idx > dayIndex && item.type === 'header');
                        
                        // Get all destinations between this day's header and next day's header
                        const endIndex = nextDayIndex === -1 ? data.length : nextDayIndex;
                        const dayDestinations = data
                          .slice(dayIndex + 1, endIndex)
                          .filter(item => item.type === 'destination')
                          .map((dest, idx) => ({
                            ...dest,
                            dayNumber: day.dayNumber,
                            order: idx,
                            type: undefined, // Remove type field
                          }));
                        
                        return {
                          ...day,
                          destinations: dayDestinations,
                        };
                      });
                      
                      dispatch(setItinerary(newItinerary));
                      
                      // Debounced batch save to backend
                      if (selectedTrip && !isGuest) {
                        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTrip.id);
                        if (isUUID) {
                          // Collect all updates
                          const updates: Array<{ destId: string; dayNumber: number; order: number }> = [];
                          newItinerary.forEach(day => {
                            day.destinations.forEach((dest, index) => {
                              updates.push({
                                destId: dest.id,
                                dayNumber: day.dayNumber,
                                order: index,
                              });
                            });
                          });
                          
                          // Batch save with delay and rate limiting
                          setTimeout(async () => {
                            try {
                              // Process updates in smaller batches to avoid rate limiting
                              const batchSize = 3;
                              for (let i = 0; i < updates.length; i += batchSize) {
                                const batch = updates.slice(i, i + batchSize);
                                await Promise.all(
                                  batch.map(update => 
                                    tripAPI.updateDestination(selectedTrip.id, update.destId, {
                                      dayNumber: update.dayNumber,
                                      order: update.order,
                                    })
                                  )
                                );
                                // Small delay between batches
                                if (i + batchSize < updates.length) {
                                  await new Promise(resolve => setTimeout(resolve, 300));
                                }
                              }
                            } catch (err) {
                              console.error('Batch save error:', err);
                            }
                          }, 800); // 800ms debounce to allow multiple drags
                        }
                      }
                    }}
                    keyExtractor={(item) => item.id}
                    activationDistance={10}
                    renderItem={({ item, drag, isActive }) => {
                      // Render day header (non-draggable)
                      if (item.type === 'header') {
                        return (
                          <View style={styles.overviewDayHeader} pointerEvents="none">
                            <Text style={styles.overviewDayTitle}>{t.day} {item.dayNumber}</Text>
                            <Text style={styles.overviewDayDate}>
                              {new Date(item.dayDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                        );
                      }
                      
                      // Render empty placeholder (non-draggable)
                      if (item.type === 'empty') {
                        return (
                          <View style={styles.overviewEmptyDay} pointerEvents="none">
                            <Text style={styles.overviewEmptyText}>{t.noDestinationsAdded}</Text>
                          </View>
                        );
                      }
                      
                      // Render draggable destination
                      return (
                        <Animated.View
                          style={[
                            styles.overviewDestItem,
                            isActive && styles.overviewDestItemDragging,
                            isActive && {
                              transform: [{ scale: 1.05 }],
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onLongPress={drag}
                            delayLongPress={150}
                            activeOpacity={0.9}
                            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                          >
                            <View style={styles.overviewDragHandle}>
                              <Text style={styles.overviewDragIcon}>☰</Text>
                            </View>
                            <View style={styles.overviewDestDetails}>
                              <Text style={styles.overviewDestName} numberOfLines={1}>{item.name}</Text>
                              <Text style={styles.overviewDestTime}>
                                {item.startTime || '08:00'} - {item.endTime || '09:00'}
                              </Text>
                              <Text style={styles.overviewDestDay}>{t.day} {item.dayNumber}</Text>
                            </View>
                            <Text style={styles.overviewDestIcon}>{getCategoryIcon(item.category)}</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    }}
                  />
                </View>
              );
            })()}

            {/* Day Detail View */}
            {activeTab === 'day' && currentDayData && (
              <View>
                {/* Day Header */}
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{t.day} {currentDayData.dayNumber}</Text>
                  <Text style={styles.dayDate}>
                    {new Date(currentDayData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <View style={styles.dayStartTime}>
                    <Text style={styles.startTimeLabel}>{t.startTimeLabelColon}</Text>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => setShowDayStartPicker(true)}
                    >
                      <Text style={styles.timeButtonText}>{formatTime(dayStartTime)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.timeline}>
                  {currentDayData.destinations.length > 0 ? (
                    <>
                    {/* Travel Mode Selector */}
                    <View style={styles.travelModeSelector}>
                      <Text style={styles.travelModeLabel}>{t.travelMode}:</Text>
                      {(['driving', 'walking', 'transit'] as const).map((mode) => (
                        <TouchableOpacity
                          key={mode}
                          style={[
                            styles.travelModeBtn,
                            travelMode === mode && styles.travelModeBtnActive,
                          ]}
                          onPress={() => setTravelMode(mode)}
                        >
                          <Text style={[
                            styles.travelModeText,
                            travelMode === mode && styles.travelModeTextActive,
                          ]}>
                            {travelTimeService.getModeIcon(mode)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <DraggableFlatList
                      data={currentDayData.destinations}
                      onDragEnd={handleDragEnd}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item: dest, drag, isActive, getIndex }: RenderItemParams<Destination>) => {
                        const index = getIndex() ?? 0;
                        // Create animation for this destination if it doesn't exist
                        if (!timelineItemAnims.has(dest.id)) {
                          const anim = new Animated.Value(1);
                          timelineItemAnims.set(dest.id, anim);
                        }
                        const itemAnim = timelineItemAnims.get(dest.id)!;
                        
                        // Get travel time to next destination
                        const nextDest = currentDayData.destinations[index + 1];
                        const travelTimeKey = nextDest ? `${dest.id}-${nextDest.id}` : null;
                        const travelTime = travelTimeKey ? travelTimes.get(travelTimeKey) : null;
                        
                        return (
                      <ScaleDecorator>
                      <Animated.View 
                        style={{
                          opacity: isActive ? 0.7 : 1,
                          transform: [
                            {
                              scale: isActive ? 1.05 : 1,
                            },
                          ],
                        }}
                      >
                        {/* Time Badge */}
                        <View style={styles.timeBadge}>
                          <Text style={styles.timeText}>{dest.startTime || '08:00'}</Text>
                          <TouchableOpacity onLongPress={drag} style={styles.timeDot}>
                            <Text style={styles.timeDotNumber}>{index + 1}</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Destination Card */}
                        <TouchableOpacity 
                          style={[styles.destCard, isActive && styles.destCardDragging]}
                          onPress={() => handleEditDestination(dest)}
                          onLongPress={drag}
                          activeOpacity={0.9}
                          disabled={isActive}
                        >
                        {dest.photos && dest.photos[0] ? (
                          <ImageBackground
                            source={{ uri: dest.photos[0] }}
                            style={styles.destImage}
                            imageStyle={styles.destImageRadius}
                          >
                            <TouchableOpacity 
                              style={styles.destMenuBtn}
                              onPress={() => setShowDestMenu(showDestMenu === dest.id ? null : dest.id)}
                            >
                              <Text style={styles.destMenuText}>⋯</Text>
                            </TouchableOpacity>
                            {showDestMenu === dest.id && (
                              <View style={styles.destMenuDropdown}>
                                <TouchableOpacity 
                                  style={styles.destMenuOption}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    handleEditDestination(dest);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionText}>✏️ {t.edit}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={styles.destMenuOption}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    setDestinationToMove(dest);
                                    setShowMoveToDayModal(true);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionText}>📅 Move to Day</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={[styles.destMenuOption, styles.destMenuOptionDanger]}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    handleDeleteDestination(selectedDayView, dest.id);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionDangerText}>🗑️ {t.delete}</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </ImageBackground>
                        ) : (
                          <View style={[styles.destImage, styles.destImagePlaceholder]}>
                            <Text style={styles.destPlaceholderIcon}>{getCategoryIcon(dest.category)}</Text>
                            <TouchableOpacity 
                              style={styles.destMenuBtn}
                              onPress={() => setShowDestMenu(showDestMenu === dest.id ? null : dest.id)}
                            >
                              <Text style={styles.destMenuText}>⋯</Text>
                            </TouchableOpacity>
                            {showDestMenu === dest.id && (
                              <View style={styles.destMenuDropdown}>
                                <TouchableOpacity 
                                  style={styles.destMenuOption}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    handleEditDestination(dest);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionText}>✏️ {t.edit}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={styles.destMenuOption}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    setDestinationToMove(dest);
                                    setShowMoveToDayModal(true);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionText}>📅 Move to Day</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={[styles.destMenuOption, styles.destMenuOptionDanger]}
                                  onPress={() => {
                                    setShowDestMenu(null);
                                    handleDeleteDestination(selectedDayView, dest.id);
                                  }}
                                >
                                  <Text style={styles.destMenuOptionDangerText}>🗑️ {t.delete}</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        )}

                        <View style={styles.destInfo}>
                          <Text style={styles.destName}>{dest.name}</Text>
                          <View style={styles.destMeta}>
                            <Text style={styles.destDuration}>⏱️ {dest.duration || '1 hr'}</Text>
                            {dest.cost && (
                              <Text style={styles.destCost}>💰 ${dest.cost}</Text>
                            )}
                          </View>
                          <Text style={styles.destAddress} numberOfLines={2}>
                            📍 {dest.address}
                          </Text>
                          {dest.notes && (
                            <Text style={styles.destNotes} numberOfLines={2}>
                              📝 {dest.notes}
                            </Text>
                          )}
                          <TouchableOpacity style={styles.confirmBadge}>
                            <Text style={styles.confirmBadgeText}>{t.instantConfirmation}</Text>
                          </TouchableOpacity>
                        </View>
                        </TouchableOpacity>

                        {/* Connector Line with Travel Time */}
                        {index < currentDayData.destinations.length - 1 && (() => {
                          const nextDest = currentDayData.destinations[index + 1];
                          const segmentKey = `${selectedDayView}-${dest.id}-${nextDest.id}`;
                          const segmentMode = segmentTravelModes.get(segmentKey) || 'driving';
                          
                          return (
                          <View style={styles.connector}>
                            <View style={styles.connectorLine} />
                            <View style={styles.travelInfo}>
                              {/* Travel Mode Selector for this segment */}
                              <View style={styles.segmentTravelModeSelector}>
                                {(['driving', 'walking', 'transit'] as const).map((mode) => (
                                  <TouchableOpacity
                                    key={mode}
                                    style={[
                                      styles.segmentTravelModeBtn,
                                      segmentMode === mode && styles.segmentTravelModeBtnActive,
                                    ]}
                                    onPress={() => {
                                      const newModes = new Map(segmentTravelModes);
                                      newModes.set(segmentKey, mode);
                                      setSegmentTravelModes(newModes);
                                    }}
                                  >
                                    <Text style={[
                                      styles.segmentTravelModeText,
                                      segmentMode === mode && styles.segmentTravelModeTextActive,
                                    ]}>
                                      {travelTimeService.getModeIcon(mode)}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                              {travelTime ? (
                                <>
                                  <Text style={styles.travelText}>{travelTime.durationText}</Text>
                                  <Text style={styles.travelDistance}>({travelTime.distanceText})</Text>
                                </>
                              ) : (
                                <Text style={styles.travelText}>{t.calculating}</Text>
                              )}
                              <TouchableOpacity style={styles.directionsBtn}>
                                <Text style={styles.directionsBtnText}>🧭</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          );
                        })()}
                      </Animated.View>
                      </ScaleDecorator>
                      );
                    }}
                    />
                    </>
                ) : (
                  <View style={styles.emptyTimeline}>
                    <Text style={styles.emptyTimelineIcon}>🗺️</Text>
                    <Text style={styles.emptyTimelineTitle}>{t.noDestinationsYet}</Text>
                    <Text style={styles.emptyTimelineText}>{t.startPlanningDay}</Text>
                    <TouchableOpacity 
                      style={styles.emptyTimelineButton}
                      onPress={() => setShowAddDestModal(true)}
                    >
                      <Text style={styles.emptyTimelineButtonText}>{t.addFirstDestination}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                </View>

                {/* Add Buttons */}
                {currentDayData.destinations.length > 0 && (
                  <View style={styles.addButtonsRow}>
                    <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddDestModal(true)}
                  >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <Text style={styles.addButtonText}>{t.addAttractions}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={() => alert('Hotel booking coming soon!')}>
                    <Text style={styles.addButtonIcon}>🏨</Text>
                    <Text style={styles.addButtonText}>{t.addHotel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={() => alert('Tickets & Tours coming soon!')}>
                    <Text style={styles.addButtonIcon}>🎫</Text>
                    <Text style={styles.addButtonText}>{t.ticketsAndTours}</Text>
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
              ref={(ref: any) => setMapRef(ref)}
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
                  <Text style={styles.webMapPlaceholder}>{t.addDestinationsToSeeMap}</Text>
                </View>
              )}
            </View>
          )}

          {/* Map Overlay Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControl} onPress={handleRecenter}>
              <Text style={styles.mapControlIcon}>🧭</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControl} onPress={() => alert('Packing list coming soon!')}>
              <Text style={styles.mapControlIcon}>🎒</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControl} onPress={() => alert('Notes feature coming soon!')}>
              <Text style={styles.mapControlIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControl} onPress={() => alert('Lock view coming soon!')}>
              <Text style={styles.mapControlIcon}>🔒</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <TouchableOpacity style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>💬 {t.comments} (0)</Text>
              <Text style={styles.commentsToggle}>−</Text>
            </TouchableOpacity>
            <View style={styles.commentInput}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>J</Text>
              </View>
              <TextInput
                style={styles.commentInputField}
                placeholder={t.leaveComment}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Map Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
          </View>
          </View>
        )}
      </View>

      {/* Show Menu Button (when drawer hidden OR on mobile) */}
      {(!showMenuDrawer || windowWidth < 768) && (
        <TouchableOpacity 
          style={styles.showMenuFab}
          onPress={() => {
            if (windowWidth < 768) {
              // On mobile, show as fullscreen overlay modal
              setShowMobileMenu(true);
            } else {
              toggleSidebar();
            }
          }}
        >
          <Text style={styles.showMenuText}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Edit Destination Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.edit} {editingDest?.name}</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>{t.startTime}</Text>
              <TouchableOpacity 
                style={styles.modalInput}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.inputText}>{formatTime(tempStartTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>{t.endTime}</Text>
              <TouchableOpacity 
                style={styles.modalInput}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.inputText}>{formatTime(tempEndTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>{t.notes}</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder={t.addNotes}
                value={tempNotes}
                onChangeText={setTempNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={() => {
                  setShowTimeModal(false);
                  if (editingDest) {
                    handleDeleteDestination(selectedDayView, editingDest.id);
                  }
                }}
              >
                <Text style={styles.modalDeleteText}>🗑️ {t.delete}</Text>
              </TouchableOpacity>
              
              <View style={styles.modalRightButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowTimeModal(false)}
                >
                  <Text style={styles.modalCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={handleSaveDestination}
                >
                  <Text style={styles.modalSaveText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DatePicker
          value={tempStartTime}
          mode="time"
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DatePicker
          value={tempEndTime}
          mode="time"
          onChange={handleEndTimeChange}
        />
      )}

      {/* Day Start Time Picker */}
      {showDayStartPicker && (
        <DatePicker
          value={dayStartTime}
          mode="time"
          onChange={handleDayStartTimeChange}
        />
      )}

      {/* Add Destination Modal */}
      <Modal
        visible={showAddDestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.addDestModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.addDestinationToDay} {selectedDayView}</Text>
              <TouchableOpacity onPress={() => setShowAddDestModal(false)}>
                <Text style={styles.modalCloseBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addDestForm} showsVerticalScrollIndicator={false}>
              {/* Search Place */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t.searchDestination} *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t.typeToSearchPlaces}
                  value={destSearchQuery}
                  onChangeText={(text) => {
                    setDestSearchQuery(text);
                    searchDestinations(text);
                  }}
                  autoCapitalize="words"
                />
                {searchingPlaces && (
                  <Text style={styles.searchingText}>{t.searching}</Text>
                )}
                {destSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={destSuggestions}
                      keyExtractor={(item) => item.place_id}
                      style={styles.suggestionsList}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => selectDestination(item)}
                        >
                          <Text style={styles.suggestionMain}>
                            {item.structured_formatting?.main_text || ''}
                          </Text>
                          {item.structured_formatting?.secondary_text && (
                            <Text style={styles.suggestionSecondary}>
                              {item.structured_formatting.secondary_text}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>

              {/* Selected Place Name */}
              {newDestName && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t.selectedPlace}</Text>
                  <View style={styles.selectedPlaceCard}>
                    <Text style={styles.selectedPlaceName}>📍 {newDestName}</Text>
                    <Text style={styles.selectedPlaceAddress}>{newDestAddress}</Text>
                  </View>
                </View>
              )}

              {/* Category */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t.category}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {['attraction', 'restaurant', 'hotel', 'shopping', 'activity'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        newDestCategory === cat && styles.categoryChipActive,
                      ]}
                      onPress={() => setNewDestCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newDestCategory === cat && styles.categoryChipTextActive,
                        ]}
                      >
                        {(t[cat as keyof typeof t] as string) || cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time Range */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t.timeRange}</Text>
                <View style={styles.timeRangeRow}>
                  <View style={styles.timeRangeItem}>
                    <Text style={styles.timeRangeLabel}>{t.start}</Text>
                    <TouchableOpacity
                      style={styles.timeRangeButton}
                      onPress={() => setShowNewStartPicker(true)}
                    >
                      <Text style={styles.timeRangeText}>{formatTime(newDestStartTime)}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeRangeSeparatorContainer}>
                    <Text style={styles.timeRangeSeparator}>{'→'}</Text>
                  </View>
                  <View style={styles.timeRangeItem}>
                    <Text style={styles.timeRangeLabel}>{t.end}</Text>
                    <TouchableOpacity
                      style={styles.timeRangeButton}
                      onPress={() => setShowNewEndPicker(true)}
                    >
                      <Text style={styles.timeRangeText}>{formatTime(newDestEndTime)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t.notesOptional}</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder={t.addNotesAboutDestination}
                  value={newDestNotes}
                  onChangeText={setNewDestNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.addDestActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddDestModal(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, (!newDestName || !newDestAddress || savingDestination) && styles.modalSaveButtonDisabled]}
                onPress={handleAddNewDestination}
                disabled={!newDestName || !newDestAddress || savingDestination}
              >
                {savingDestination ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={[styles.modalSaveText, { marginLeft: 8 }]}>{t.saving}</Text>
                  </View>
                ) : (
                  <Text style={styles.modalSaveText}>{t.addDestination}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Destination Time Pickers */}
      {showNewStartPicker && (
        <DatePicker
          value={newDestStartTime}
          mode="time"
          onChange={handleNewStartTimeChange}
        />
      )}

      {showNewEndPicker && (
        <DatePicker
          value={newDestEndTime}
          mode="time"
          onChange={handleNewEndTimeChange}
        />
      )}

      {/* Move to Day Modal */}
      <Modal
        visible={showMoveToDayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoveToDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Move to Day</Text>
              <TouchableOpacity onPress={() => setShowMoveToDayModal(false)}>
                <Text style={styles.modalCloseBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Destination: {destinationToMove?.name}</Text>
              <Text style={styles.modalHint}>Select the day to move this destination to:</Text>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {itinerary.map((day) => (
                <TouchableOpacity
                  key={day.dayNumber}
                  style={[
                    styles.daySelectItem,
                    destinationToMove?.dayNumber === day.dayNumber && styles.daySelectItemCurrent,
                  ]}
                  onPress={() => handleMoveToDay(day.dayNumber)}
                  disabled={destinationToMove?.dayNumber === day.dayNumber}
                >
                  <View style={styles.daySelectLeft}>
                    <Text style={styles.daySelectNumber}>Day {day.dayNumber}</Text>
                    <Text style={styles.daySelectDate}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.daySelectRight}>
                    <Text style={styles.daySelectCount}>{day.destinations.length} destinations</Text>
                    {destinationToMove?.dayNumber === day.dayNumber && (
                      <Text style={styles.daySelectCurrent}>(Current)</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.addDestActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowMoveToDayModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mobile Menu Modal - Fullscreen overlay on mobile */}
      {selectedTrip && (
        <Modal
          visible={showMobileMenu}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowMobileMenu(false)}
        >
          <ScrollView style={[styles.leftSidebar, { width: '100%' }]} showsVerticalScrollIndicator={false}>
          {/* Trip Header */}
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' }}
            style={styles.sidebarHeader}
            blurRadius={2}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
              style={styles.sidebarHeaderOverlay}
            >
              <TouchableOpacity onPress={() => setShowMobileMenu(false)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.sidebarTitle}>{t.trip}</Text>
            </LinearGradient>
          </ImageBackground>

          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <View style={styles.tripDates}>
              <Text style={styles.dateText}>
                {selectedTrip.startDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} - {selectedTrip.endDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </Text>
            </View>
            <Text style={styles.tripDestination}>{selectedTrip.destination}</Text>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Flight search coming soon!')}>
              <Text style={styles.quickActionIcon}>✈️</Text>
              <Text style={styles.quickActionLabel}>{t.findFlights}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Hotel search coming soon!')}>
              <Text style={styles.quickActionIcon}>🏨</Text>
              <Text style={styles.quickActionLabel}>{t.findHotels}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Car rental coming soon!')}>
              <Text style={styles.quickActionIcon}>🚗</Text>
              <Text style={styles.quickActionLabel}>{t.carRental}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => alert('Tickets & Tours coming soon!')}>
              <Text style={styles.quickActionIcon}>🎫</Text>
              <Text style={styles.quickActionLabel}>{t.ticketsAndTours}</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📁</Text>
              <Text style={styles.statLabel}>{t.filesAndNotes}</Text>
              <Text style={styles.statValue}>{0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🗺️</Text>
              <Text style={styles.statLabel}>{t.itinerary}</Text>
              <Text style={styles.statValue}>{getTotalDistance().toFixed(1)} km</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📔</Text>
              <Text style={styles.statLabel}>{t.journals}</Text>
              <Text style={styles.statValue}>{0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎒</Text>
              <Text style={styles.statLabel}>{t.packingList}</Text>
              <Text style={styles.statValue}>{0} / {24}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statLabel}>{t.expense}</Text>
              <Text style={styles.statValue}>{0}</Text>
            </View>
          </View>

          {/* Download PDF */}
          <TouchableOpacity style={styles.downloadPDF} onPress={handleExportPDF}>
            <Text style={styles.downloadIcon}>📄</Text>
            <Text style={styles.downloadText}>{t.downloadPDF}</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.hideMenuBtn}
            onPress={() => setShowMobileMenu(false)}
          >
            <Text style={styles.hideMenuText}>{t.closeMenu}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    textAlign: 'center',
  },
  threeColumnLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  // LEFT SIDEBAR
  leftSidebar: {
    backgroundColor: '#2C3E50',
    borderRightWidth: 1,
    borderRightColor: '#34495E',
  },
  sidebarHeader: {
    height: 120,
  },
  sidebarHeaderOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  sidebarTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  settingsBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtnText: {
    fontSize: 20,
    color: '#FFF',
  },
  tripInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
  },
  tripDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#ECF0F1',
    fontWeight: '500',
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleText: {
    fontSize: 14,
    color: '#FFF',
  },
  tripDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
  },
  quickActionItem: {
    width: '50%',
    alignItems: 'center',
    padding: 12,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 14,
  },
  statsContainer: {
    padding: 12,
  },
  statCard: {
    backgroundColor: '#34495E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 13,
    color: '#BDC3C7',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  downloadPDF: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 12,
    backgroundColor: '#34495E',
    borderRadius: 8,
  },
  downloadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  downloadText: {
    fontSize: 14,
    color: '#ECF0F1',
    fontWeight: '600',
  },
  hideMenuBtn: {
    padding: 16,
    alignItems: 'center',
  },
  hideMenuText: {
    fontSize: 13,
    color: '#95A5A6',
  },
  // CENTER PANEL
  centerPanel: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  centerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    zIndex: 10,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  editBtn: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
  centerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optimizeBtn: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  optimizeBtnText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  tabSelector: {
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    maxHeight: 60,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#E74C3C',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2C3E50',
    fontWeight: '700',
  },
  tabSubtext: {
    fontSize: 12,
    color: '#95A5A6',
  },
  nextArrow: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  nextArrowText: {
    fontSize: 24,
    color: '#95A5A6',
  },
  addDayTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addDayTabText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  carbonInfo: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  carbonText: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  dayContent: {
    flex: 1,
  },
  dayHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  dayStartTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTimeLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 8,
  },
  timeButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  timeline: {
    padding: 16,
  },
  timeBadge: {
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  timeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDotNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  connector: {
    marginVertical: 12,
    paddingLeft: 40,
  },
  connectorLine: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  travelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  travelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  travelText: {
    flex: 1,
    fontSize: 13,
    color: '#7F8C8D',
  },
  directionsBtn: {
    padding: 4,
  },
  directionsBtnText: {
    fontSize: 18,
  },
  destCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  destImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  destImageRadius: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  } as any,
  destImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  destPlaceholderIcon: {
    fontSize: 48,
  },
  destMenuBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destMenuText: {
    fontSize: 20,
    color: '#FFF',
  },
  destMenuDropdown: {
    position: 'absolute',
    top: 48,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    zIndex: 1000,
  },
  destMenuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  destMenuOptionDanger: {
    borderBottomWidth: 0,
  },
  destMenuOptionText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  destMenuOptionDangerText: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '500',
  },
  destInfo: {
    padding: 16,
  },
  destName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  destDuration: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 16,
  },
  destMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destCost: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  destAddress: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 18,
  },
  destNotes: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  confirmBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmBadgeText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  addButtonsRow: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  addButtonText: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
  // RIGHT PANEL - MAP
  rightPanel: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  markerNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  mapControl: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlIcon: {
    fontSize: 20,
  },
  commentsSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  commentsToggle: {
    fontSize: 20,
    color: '#95A5A6',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  commentInputField: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    gap: 8,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomBtnText: {
    fontSize: 24,
    color: '#2C3E50',
    fontWeight: '300',
  },
  showMenuFab: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  showMenuText: {
    fontSize: 24,
    color: '#FFF',
  },
  inputText: {
    fontSize: 16,
    color: '#343A40',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#343A40',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  modalRightButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDeleteButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  modalDeleteText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  modalSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#007BFF',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
  // OVERVIEW TAB STYLES
  overviewContainer: {
    padding: 16,
  },
  overviewDayCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  overviewDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  overviewDayDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  overviewDestinations: {
    padding: 16,
  },
  overviewDestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  overviewDestNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E74C3C',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  overviewDestDetails: {
    flex: 1,
  },
  overviewDestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  overviewDestTime: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  overviewDestDay: {
    fontSize: 11,
    color: '#E74C3C',
    fontWeight: '600',
    marginTop: 2,
  },
  overviewDestIcon: {
    fontSize: 24,
  },
  overviewDragHandle: {
    padding: 8,
    marginRight: 8,
  },
  overviewDragIcon: {
    fontSize: 18,
    color: '#95A5A6',
  },
  overviewDaySection: {
    marginBottom: 20,
  },
  overviewEmptyDay: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  overviewEmptyText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  overviewEmpty: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  viewDayButton: {
    padding: 14,
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  viewDayButtonText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  // EMPTY STATES
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTimelineIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTimelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyTimelineText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyTimelineButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyTimelineButtonText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '600',
  },
  // ADD DESTINATION MODAL
  addDestModalContent: {
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalCloseBtn: {
    fontSize: 32,
    color: '#95A5A6',
    fontWeight: '300',
  },
  addDestForm: {
    flex: 1,
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 13,
    color: '#3498DB',
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    maxHeight: 200,
    backgroundColor: '#FFF',
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  suggestionMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  suggestionSecondary: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  selectedPlaceCard: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  selectedPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 6,
  },
  selectedPlaceAddress: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeRangeItem: {
    flex: 1,
  },
  timeRangeLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  timeRangeButton: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeRangeText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeRangeSeparator: {
    fontSize: 20,
    color: '#95A5A6',
  },
  timeRangeSeparatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addDestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // RESIZE DIVIDERS
  resizeDivider: {
    width: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D0D0D0',
  } as any,
  resizeHandle: {
    width: 3,
    height: 40,
    backgroundColor: '#95A5A6',
    borderRadius: 2,
  },
  // No Trip Selected State
  noTripContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  goHomeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    ...shadows.md,
  },
  goHomeButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  webMapPlaceholder: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
  },
  webMapPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webMapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  webMapContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  webMapList: {
    flex: 1,
  },
  webMapItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webMapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  webMapMarkerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  webMapItemContent: {
    flex: 1,
  },
  webMapItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  webMapItemAddress: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  webMapItemTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  // Travel Mode Selector
  travelModeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: 8,
  },
  travelModeLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  travelModeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  travelModeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  travelModeText: {
    fontSize: 18,
  },
  travelModeTextActive: {
    opacity: 1,
  },
  travelDistance: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  // Per-segment travel mode selector
  segmentTravelModeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 12,
  },
  segmentTravelModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segmentTravelModeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentTravelModeText: {
    fontSize: 16,
    opacity: 0.6,
  },
  segmentTravelModeTextActive: {
    opacity: 1,
  },
  destCardDragging: {
    ...shadows.lg,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  overviewDestItemDragging: {
    opacity: 0.7,
    ...shadows.lg,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  // Move to Day Modal Styles
  modalHint: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
  daySelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  daySelectItemCurrent: {
    backgroundColor: '#F8F9FA',
    borderColor: '#95A5A6',
    opacity: 0.6,
  },
  daySelectLeft: {
    flex: 1,
  },
  daySelectNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  daySelectDate: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  daySelectRight: {
    alignItems: 'flex-end',
  },
  daySelectCount: {
    fontSize: 13,
    color: '#3498DB',
    fontWeight: '600',
  },
  daySelectCurrent: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
