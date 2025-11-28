import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, Platform, Animated, } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addDestination } from '../store/slices/itinerarySlice';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { GOOGLE_MAPS_API_KEY, mapStyle, defaultMapRegion } from '../config/maps';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');
// Conditional import for maps
let MapView;
let Marker;
let Polyline;
let PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}
else {
    MapView = require('../components/WebMap').default;
}
export default function MapScreen({ navigation }) {
    const mapRef = useRef(null);
    const dispatch = useDispatch();
    const selectedTrip = useSelector((state) => state.trips.selectedTrip);
    const itinerary = useSelector((state) => state.itinerary.days);
    const selectedDay = useSelector((state) => state.itinerary.selectedDay);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [region, setRegion] = useState(defaultMapRegion);
    // Animation values
    const markerAnims = useRef(new Map()).current;
    const searchPanelAnim = useRef(new Animated.Value(0)).current;
    const placeInfoAnim = useRef(new Animated.Value(0)).current;
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
        }
        else {
            placeInfoAnim.setValue(0);
        }
    }, [selectedPlace]);
    // Get all destinations for current trip
    const allDestinations = itinerary.flatMap(day => day.destinations);
    const currentDayDestinations = itinerary.find(d => d.dayNumber === selectedDay)?.destinations || [];
    useEffect(() => {
        if (allDestinations.length > 0) {
            // Fit map to show all destinations
            fitToDestinations();
        }
    }, [allDestinations.length]);
    const fitToDestinations = () => {
        if (allDestinations.length > 0 && mapRef.current) {
            const coordinates = allDestinations.map(dest => ({
                latitude: dest.latitude,
                longitude: dest.longitude,
            }));
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
            });
        }
    };
    const searchPlaces = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            if (data.results) {
                setSearchResults(data.results.slice(0, 5));
            }
        }
        catch (error) {
            console.error('Search error:', error);
        }
    };
    const handleSearch = () => {
        searchPlaces(searchQuery);
    };
    const selectPlace = (place) => {
        setSelectedPlace(place);
        setRegion({
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setShowSearch(false);
    };
    const addPlaceToTrip = () => {
        if (selectedPlace && selectedTrip) {
            const newDestination = {
                id: Date.now().toString(),
                tripId: selectedTrip.id,
                dayNumber: selectedDay,
                name: selectedPlace.name,
                address: selectedPlace.formatted_address,
                latitude: selectedPlace.geometry.location.lat,
                longitude: selectedPlace.geometry.location.lng,
                placeId: selectedPlace.place_id,
                category: 'attraction',
                order: currentDayDestinations.length,
            };
            dispatch(addDestination({ dayNumber: selectedDay, destination: newDestination }));
            alert(`Added to Day ${selectedDay}`);
            setSelectedPlace(null);
        }
    };
    const getMarkerColor = (index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
        return colors[index % colors.length];
    };
    return (<View style={styles.container}>
      <MapView ref={mapRef} provider={Platform.OS !== 'web' ? PROVIDER_GOOGLE : undefined} style={styles.map} initialRegion={region} region={region} customMapStyle={Platform.OS !== 'web' ? mapStyle : undefined} showsUserLocation={Platform.OS !== 'web'} showsMyLocationButton={Platform.OS !== 'web'} onRegionChangeComplete={Platform.OS !== 'web' ? setRegion : undefined}>
        {Platform.OS !== 'web' && (<>
            {/* Current day destinations */}
            {currentDayDestinations.map((dest, index) => {
                // Create animation for this marker if it doesn't exist
                if (!markerAnims.has(dest.id)) {
                    const anim = new Animated.Value(0);
                    markerAnims.set(dest.id, anim);
                    // Animate marker drop
                    Animated.spring(anim, {
                        toValue: 1,
                        delay: index * 100,
                        useNativeDriver: true,
                        tension: 40,
                        friction: 6,
                    }).start();
                }
                return (<Marker key={dest.id} coordinate={{
                        latitude: dest.latitude,
                        longitude: dest.longitude,
                    }} pinColor={getMarkerColor(index)}>
                <View style={styles.markerContainer}>
                  <View style={[styles.markerBubble, { backgroundColor: getMarkerColor(index) }]}>
                    <Text style={styles.markerNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.markerArrow}/>
                </View>
              </Marker>);
            })}

            {/* Selected place marker */}
            {selectedPlace && (<Marker coordinate={{
                    latitude: selectedPlace.geometry.location.lat,
                    longitude: selectedPlace.geometry.location.lng,
                }} pinColor={colors.accent}/>)}

            {/* Route polyline */}
            {currentDayDestinations.length > 1 && (<Polyline coordinates={currentDayDestinations.map(dest => ({
                    latitude: dest.latitude,
                    longitude: dest.longitude,
                }))} strokeColor={colors.primary} strokeWidth={3} lineDashPattern={[1]}/>)}
          </>)}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput style={styles.searchInput} placeholder="Search places..." placeholderTextColor={colors.textLight} value={searchQuery} onChangeText={setSearchQuery} onFocus={() => setShowSearch(true)} onSubmitEditing={handleSearch} returnKeyType="search"/>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (<Animated.View style={[
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
            ]}>
            <ScrollView>
              {searchResults.map((place) => (<TouchableOpacity key={place.place_id} style={styles.resultItem} onPress={() => selectPlace(place)}>
                  <Text style={styles.resultName}>{place.name}</Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {place.formatted_address}
                  </Text>
                  {place.rating && (<Text style={styles.resultRating}>⭐ {place.rating}</Text>)}
                </TouchableOpacity>))}
            </ScrollView>
          </Animated.View>)}
      </View>

      {/* Selected Place Info */}
      {selectedPlace && (<Animated.View style={[
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
            ]}>
          <View style={styles.placeInfoContent}>
            <View style={styles.placeDetails}>
              <Text style={styles.placeName}>{selectedPlace.name}</Text>
              <Text style={styles.placeAddress} numberOfLines={2}>
                {selectedPlace.formatted_address}
              </Text>
            </View>
            <TouchableOpacity onPress={addPlaceToTrip}>
              <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.addButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.addButtonText}>+ Add to Day {selectedDay}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>)}

      {/* Day Selector & Route Info */}
      <View style={styles.bottomPanel}>
        <View style={styles.daySelector}>
          <Text style={styles.daySelectorLabel}>Day {selectedDay}</Text>
          <Text style={styles.destinationCount}>
            {currentDayDestinations.length} {currentDayDestinations.length === 1 ? 'place' : 'places'}
          </Text>
        </View>

        {currentDayDestinations.length > 0 && (<TouchableOpacity style={styles.viewRouteButton} onPress={fitToDestinations}>
            <Text style={styles.viewRouteButtonText}>🗺️ View Full Route</Text>
          </TouchableOpacity>)}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {currentDayDestinations.slice(0, 3).map((dest, index) => (<View key={dest.id} style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: getMarkerColor(index) }]}>
              <Text style={styles.legendNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.legendText} numberOfLines={1}>
              {dest.name}
            </Text>
          </View>))}
        {currentDayDestinations.length > 3 && (<Text style={styles.legendMore}>+{currentDayDestinations.length - 3} more</Text>)}
      </View>
    </View>);
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
        alignItems: 'center',
    },
    markerBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    markerNumber: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: colors.primary,
    },
    placeInfo: {
        position: 'absolute',
        bottom: 140,
        left: spacing.md,
        right: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        ...shadows.lg,
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
    legend: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 140 : 100,
        left: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.sm,
        ...shadows.md,
        maxWidth: width * 0.6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    legendMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    legendNumber: {
        color: colors.surface,
        fontSize: 12,
        fontWeight: '700',
    },
    legendText: {
        ...typography.caption,
        color: colors.text,
        flex: 1,
    },
    legendMore: {
        ...typography.small,
        color: colors.textLight,
        fontStyle: 'italic',
    },
});
