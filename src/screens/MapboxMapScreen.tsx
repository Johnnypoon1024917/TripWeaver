import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addDestination, reorderDestinations } from '../store/slices/itinerarySlice';
import { Destination } from '../types';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { MAPBOX_ACCESS_TOKEN, defaultMapRegion } from '../config/maps';
import { LinearGradient } from 'expo-linear-gradient';
import { routeOptimizationService } from '../services/routeOptimizationService';
import DraggableFlatList from 'react-native-draggable-flatlist';

// Conditional import for Mapbox
let MapboxGL: any;
if (Platform.OS !== 'web') {
  MapboxGL = require('@rnmapbox/maps').default;
  // Set Mapbox access token only on native platforms
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  // For web, we'll use our WebMap component
  MapboxGL = {
    setAccessToken: () => {}, // No-op on web
    setTelemetryEnabled: () => {}, // No-op on web
    offlineManager: {
      createPack: () => Promise.reject(new Error('Offline maps not supported on web'))
    }
  };
}

const { width, height } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  rating?: number;
}

// Add type definitions for MapboxGL components
interface MapboxGLComponents {
  MapView: any;
  Camera: any;
  ShapeSource: any;
  LineLayer: any;
  SymbolLayer: any;
  PointAnnotation: any;
}

const TypedMapboxGL: MapboxGLComponents = MapboxGL;

export default function MapboxMapScreen({ navigation }: any) {
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const dispatch = useDispatch();
  
  const selectedTrip = useSelector((state: RootState) => state.trips.selectedTrip);
  const itinerary = useSelector((state: RootState) => state.itinerary.days);
  const selectedDay = useSelector((state: RootState) => state.itinerary.selectedDay);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [region, setRegion] = useState(defaultMapRegion);
  const [offlinePack, setOfflinePack] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Animation values
  const markerAnims = useRef(new Map()).current;
  const searchPanelAnim = useRef(new Animated.Value(0)).current;
  const placeInfoAnim = useRef(new Animated.Value(0)).current;
  
  // Get all destinations for current trip
  const allDestinations = itinerary.flatMap(day => day.destinations);
  const currentDayDestinations = itinerary.find(d => d.dayNumber === selectedDay)?.destinations || [];
  
  // Initialize map
  useEffect(() => {
    MapboxGL.setTelemetryEnabled(false);
  }, []);
  
  // Animate search panel
  useEffect(() => {
    Animated.timing(searchPanelAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSearch]);
  
  // Animate place info when selected
  useEffect(() => {
    if (selectedPlace) {
      Animated.spring(placeInfoAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      placeInfoAnim.setValue(0);
    }
  }, [selectedPlace]);
  
  // Fit map to show all destinations
  useEffect(() => {
    if (allDestinations.length > 0 && cameraRef.current) {
      fitToDestinations();
    }
  }, [allDestinations.length]);
  
  const fitToDestinations = () => {
    if (allDestinations.length > 0 && cameraRef.current) {
      const coordinates = allDestinations.map(dest => [dest.longitude, dest.latitude]);
      cameraRef.current.fitBounds(
        [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
        [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))],
        [50, 50, 50, 300],
        1000
      );
    }
  };
  
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      // This would connect to a places API service
      // For now, we'll simulate results
      const mockResults: Place[] = [
        {
          id: '1',
          name: `${query} Location 1`,
          address: '123 Main St',
          latitude: region.latitude + (Math.random() - 0.5) * 0.1,
          longitude: region.longitude + (Math.random() - 0.5) * 0.1,
          category: 'attraction',
          rating: 4.5,
        },
        {
          id: '2',
          name: `${query} Location 2`,
          address: '456 Oak Ave',
          latitude: region.latitude + (Math.random() - 0.5) * 0.1,
          longitude: region.longitude + (Math.random() - 0.5) * 0.1,
          category: 'restaurant',
          rating: 4.2,
        },
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  };
  
  const handleSearch = () => {
    searchPlaces(searchQuery);
  };
  
  const selectPlace = (place: Place) => {
    setSelectedPlace(place);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [place.longitude, place.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
    setShowSearch(false);
  };
  
  const addPlaceToTrip = () => {
    if (selectedPlace && selectedTrip) {
      const newDestination: Destination = {
        id: Date.now().toString(),
        tripId: selectedTrip.id,
        dayNumber: selectedDay,
        name: selectedPlace.name,
        address: selectedPlace.address,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        category: (selectedPlace.category as any) || 'attraction',
        order: currentDayDestinations.length,
      };
      
      dispatch(addDestination({ dayNumber: selectedDay, destination: newDestination }));
      Alert.alert('Success', `Added to Day ${selectedDay}`);
      setSelectedPlace(null);
    }
  };
  
  const getMarkerColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    return colors[index % colors.length];
  };
  
  const optimizeDayRoute = async () => {
    if (currentDayDestinations.length < 2) {
      Alert.alert('Info', 'Add at least 2 destinations to optimize route');
      return;
    }
    
    try {
      const optimizedRoute = await routeOptimizationService.optimizeRoute(currentDayDestinations);
      
      // Update destination orders
      optimizedRoute.orderedDestinations.forEach((dest, index) => {
        dispatch(reorderDestinations({ 
          dayNumber: selectedDay, 
          destinations: optimizedRoute.orderedDestinations.map((d, i) => ({ ...d, order: i }))
        }));
      });
      
      Alert.alert('Success', 'Route optimized successfully!');
    } catch (error) {
      console.error('Optimization error:', error);
      Alert.alert('Error', 'Failed to optimize route');
    }
  };
  
  const downloadOfflineMap = async () => {
    if (!selectedTrip) return;
    
    // Show alert for web platform since offline maps are not supported
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Supported', 
        'Offline maps are not supported on web platform. Please use the mobile app for this feature.'
      );
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Create offline pack for the trip area
      const bounds: [number[], number[]] = [
        [region.longitude - 0.1, region.latitude - 0.1],
        [region.longitude + 0.1, region.latitude + 0.1]
      ];
      
      const pack = await MapboxGL.offlineManager.createPack({
        name: `trip_${selectedTrip.id}`,
        styleURL: MapboxGL.StyleURL.Street,
        bounds,
        minZoom: 10,
        maxZoom: 16,
      }, (progress: any) => {
        console.log('Download progress:', (progress as any).percentage || progress);
      });
      
      setOfflinePack(pack);
      Alert.alert('Success', 'Offline map downloaded successfully!');
    } catch (error) {
      console.error('Offline download error:', error);
      Alert.alert('Error', 'Failed to download offline map');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const renderDraggableItem = ({ item, drag, isActive }: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.draggableItem,
          { backgroundColor: colors.surface },
          isActive && styles.draggingItem
        ]}
        onLongPress={drag}
      >
        <Text style={styles.draggableItemText}>{item.name}</Text>
        <Text style={styles.draggableItemAddress}>{item.address}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Render WebMap component for web platform
        <View style={styles.map}>
          <Text style={styles.webMapPlaceholder}>
            Map functionality is not available on web platform. 
            Please use the mobile app for full map features.
          </Text>
        </View>
      ) : (
        // Render Mapbox components for native platforms
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [region.longitude, region.latitude],
              zoomLevel: 12,
            }}
          />
          
          {/* Current day destinations */}
          {currentDayDestinations.map((dest, index) => (
            <MapboxGL.PointAnnotation
              key={dest.id}
              id={`destination-${dest.id}`}
              coordinate={[dest.longitude, dest.latitude]}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(index) }]}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
              
              <MapboxGL.Callout title={dest.name}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{dest.name}</Text>
                  <Text style={styles.calloutAddress}>{dest.address}</Text>
                </View>
              </MapboxGL.Callout>
            </MapboxGL.PointAnnotation>
          ))}
          
          {/* Selected place marker */}
          {selectedPlace && (
            <MapboxGL.PointAnnotation
              id={`selected-place-${selectedPlace.id}`}
              coordinate={[selectedPlace.longitude, selectedPlace.latitude]}
            >
              <View style={[styles.markerContainer, { backgroundColor: colors.accent }]}>
                <Text style={styles.markerText}>📍</Text>
              </View>
            </MapboxGL.PointAnnotation>
          )}
          
          {/* Route line */}
          {currentDayDestinations.length > 1 && (
            <MapboxGL.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: currentDayDestinations.map(dest => [dest.longitude, dest.latitude]),
                },
              }}
            >
              <MapboxGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: colors.primary,
                  lineWidth: 4,
                  lineDasharray: [2, 2],
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSearch(true)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <Animated.View 
            style={[
              styles.searchResults,
              {
                opacity: searchPanelAnim,
                transform: [
                  {
                    translateY: searchPanelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ScrollView>
              {searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.resultItem}
                  onPress={() => selectPlace(place)}
                >
                  <Text style={styles.resultName}>{place.name}</Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {place.address}
                  </Text>
                  {place.rating && (
                    <Text style={styles.resultRating}>⭐ {place.rating}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
      
      {/* Selected Place Info */}
      {selectedPlace && (
        <Animated.View 
          style={[
            styles.placeInfo,
            {
              opacity: placeInfoAnim,
              transform: [
                {
                  translateY: placeInfoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.placeInfoContent}>
            <View style={styles.placeDetails}>
              <Text style={styles.placeName}>{selectedPlace.name}</Text>
              <Text style={styles.placeAddress} numberOfLines={2}>
                {selectedPlace.address}
              </Text>
            </View>
            <TouchableOpacity onPress={addPlaceToTrip}>
              <LinearGradient
                colors={[colors.primary, colors.gradientEnd]}
                style={styles.addButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addButtonText}>+ Add to Day {selectedDay}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={optimizeDayRoute}
          >
            <Text style={styles.controlButtonText}>🧭 Optimize</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={downloadOfflineMap}
            disabled={isDownloading}
          >
            <Text style={styles.controlButtonText}>
              {isDownloading ? '📥 Downloading...' : '📥 Offline Map'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.daySelector}>
          <Text style={styles.daySelectorLabel}>Day {selectedDay}</Text>
          <Text style={styles.destinationCount}>
            {currentDayDestinations.length} {currentDayDestinations.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
        
        {currentDayDestinations.length > 0 && (
          <TouchableOpacity
            style={styles.viewRouteButton}
            onPress={fitToDestinations}
          >
            <Text style={styles.viewRouteButtonText}>🗺️ View Full Route</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Draggable Destinations List */}
      {currentDayDestinations.length > 0 && (
        <View style={styles.destinationsPanel}>
          <Text style={styles.destinationsTitle}>Drag to Reorder</Text>
          <DraggableFlatList
            data={currentDayDestinations}
            renderItem={renderDraggableItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              // Update order of destinations
              dispatch(reorderDestinations({ 
                dayNumber: selectedDay, 
                destinations: data.map((dest, index) => ({ ...dest, order: index }))
              }));
            }}
            style={styles.draggableList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.lg,
  },
  searchInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    padding: spacing.md,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  searchResults: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: spacing.sm,
    maxHeight: 250,
    ...shadows.md,
  },
  resultItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  resultName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resultAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultRating: {
    ...typography.caption,
    color: colors.warning,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  markerText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  calloutContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    ...shadows.md,
  },
  calloutTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  calloutAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  placeInfo: {
    position: 'absolute',
    bottom: 200,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.lg,
    zIndex: 10,
  },
  placeInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  placeName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  placeAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  controlButton: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  controlButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  daySelectorLabel: {
    ...typography.h3,
    color: colors.text,
  },
  destinationCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewRouteButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewRouteButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  destinationsPanel: {
    position: 'absolute',
    bottom: 180,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.lg,
    maxHeight: 200,
  },
  destinationsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  draggableList: {
    flex: 1,
  },
  draggableItem: {
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    ...shadows.sm,
  },
  draggingItem: {
    opacity: 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  draggableItemText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  draggableItemAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  webMapPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
});
