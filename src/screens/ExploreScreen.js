import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { addDestination } from '../store/slices/itinerarySlice';
import { colors, spacing, typography, shadows } from '../utils/theme';
import placesService from '../services/placesService';
const CATEGORIES = [
    { id: 'all', label: 'All', icon: '🌍' },
    { id: 'attraction', label: 'Attractions', icon: '🏛️' },
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { id: 'hotel', label: 'Hotels', icon: '🏨' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'cafe', label: 'Cafes', icon: '☕' },
    { id: 'bar', label: 'Bars', icon: '🍺' },
    { id: 'museum', label: 'Museums', icon: '🎨' },
    { id: 'park', label: 'Parks', icon: '🌳' },
    { id: 'activity', label: 'Activities', icon: '⛷️' },
];
const SORT_OPTIONS = [
    { id: 'rating', label: 'Rating' },
    { id: 'distance', label: 'Distance' },
    { id: 'popularity', label: 'Popularity' },
];
export default function ExploreScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const selectedTrip = useSelector((state) => state.trips.selectedTrip);
    const selectedDay = useSelector((state) => state.itinerary.selectedDay);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [sortBy, setSortBy] = useState('rating');
    const [minRating, setMinRating] = useState(0);
    const searchPlaces = async () => {
        if (!searchQuery.trim())
            return;
        setLoading(true);
        try {
            const results = await placesService.searchText(searchQuery, undefined, selectedCategory);
            setPlaces(results);
            applyFilters(results);
        }
        catch (error) {
            console.error('Search error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = (placesToFilter) => {
        let filtered = [...placesToFilter];
        // Filter by rating
        if (minRating > 0) {
            filtered = placesService.filterByRating(filtered, minRating);
        }
        // Sort
        if (sortBy === 'rating') {
            filtered = placesService.sortByRating(filtered);
        }
        setFilteredPlaces(filtered);
    };
    useEffect(() => {
        applyFilters(places);
    }, [sortBy, minRating, places]);
    const handleAddToTrip = (place, dayNumber) => {
        if (!selectedTrip) {
            alert('Please select a trip first');
            return;
        }
        const newDestination = {
            id: Date.now().toString(),
            tripId: selectedTrip.id,
            dayNumber: dayNumber || selectedDay,
            name: place.name,
            address: place.formatted_address,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            placeId: place.place_id,
            category: mapPlaceTypeToCategory(place.types),
            order: 0,
        };
        dispatch(addDestination({ dayNumber: dayNumber || selectedDay, destination: newDestination }));
        alert(`Added ${place.name} to Day ${dayNumber || selectedDay}`);
    };
    const mapPlaceTypeToCategory = (types) => {
        if (!types || types.length === 0)
            return 'other';
        if (types.includes('restaurant') || types.includes('food'))
            return 'restaurant';
        if (types.includes('tourist_attraction') || types.includes('point_of_interest'))
            return 'attraction';
        if (types.includes('lodging') || types.includes('hotel'))
            return 'hotel';
        if (types.includes('shopping_mall') || types.includes('store'))
            return 'shopping';
        if (types.includes('cafe'))
            return 'restaurant';
        if (types.includes('bar') || types.includes('night_club'))
            return 'activity';
        if (types.includes('museum') || types.includes('art_gallery'))
            return 'attraction';
        if (types.includes('park'))
            return 'attraction';
        return 'other';
    };
    const renderPlaceCard = ({ item }) => (<TouchableOpacity style={styles.placeCard} onPress={() => setSelectedPlace(item)}>
      {item.photos && item.photos.length > 0 ? (<Image source={{
                uri: placesService.getPhotoUrl(item.photos[0].photo_reference, 400, 200),
            }} style={styles.placeImage} resizeMode="cover"/>) : (<View style={[styles.placeImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📍</Text>
        </View>)}

      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {item.formatted_address}
        </Text>

        <View style={styles.placeMetaRow}>
          {item.rating && (<View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              {item.user_ratings_total && (<Text style={styles.ratingCount}>({item.user_ratings_total})</Text>)}
            </View>)}

          {item.price_level && (<Text style={styles.priceLevel}>
              {'$'.repeat(item.price_level)}
            </Text>)}
        </View>

        <View style={styles.placeActions}>
          <TouchableOpacity onPress={() => handleAddToTrip(item)} style={styles.addButton}>
            <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.addButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.addButtonText}>+ Add to Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>);
    return (<View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.header}>
        <Text style={styles.headerTitle}>Explore Places</Text>
        <Text style={styles.headerSubtitle}>
          Discover amazing destinations
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Search for places..." placeholderTextColor={colors.textLight} value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={searchPlaces} returnKeyType="search"/>
          <TouchableOpacity style={styles.searchButton} onPress={searchPlaces}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map((category) => (<TouchableOpacity key={category.id} style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
            ]} onPress={() => {
                setSelectedCategory(category.id);
                if (searchQuery) {
                    searchPlaces();
                }
            }}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>))}
      </ScrollView>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          {SORT_OPTIONS.map((option) => (<TouchableOpacity key={option.id} style={[
                styles.filterChip,
                sortBy === option.id && styles.filterChipActive,
            ]} onPress={() => setSortBy(option.id)}>
              <Text style={[
                styles.filterChipText,
                sortBy === option.id && styles.filterChipTextActive,
            ]}>
                {option.label}
              </Text>
            </TouchableOpacity>))}

          <TouchableOpacity style={[
            styles.filterChip,
            minRating > 0 && styles.filterChipActive,
        ]} onPress={() => setMinRating(minRating > 0 ? 0 : 4)}>
            <Text style={[
            styles.filterChipText,
            minRating > 0 && styles.filterChipTextActive,
        ]}>
              ⭐ 4.0+
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary}/>
          <Text style={styles.loadingText}>Searching places...</Text>
        </View>) : filteredPlaces.length > 0 ? (<FlatList data={filteredPlaces} keyExtractor={(item) => item.place_id} renderItem={renderPlaceCard} contentContainerStyle={styles.placesList} showsVerticalScrollIndicator={false}/>) : (<View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No places found</Text>
          <Text style={styles.emptyText}>
            Try searching for attractions, restaurants, or activities
          </Text>
        </View>)}
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.surface,
        opacity: 0.9,
        marginBottom: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.xs,
        ...shadows.sm,
    },
    searchInput: {
        flex: 1,
        padding: spacing.sm,
        fontSize: 16,
        color: colors.text,
    },
    searchButton: {
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    searchButtonText: {
        fontSize: 20,
    },
    categoriesContainer: {
        marginTop: spacing.md,
    },
    categoriesContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginRight: spacing.sm,
        ...shadows.sm,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    categoryText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: colors.surface,
    },
    filtersRow: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    filtersContent: {
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        gap: spacing.sm,
    },
    filterLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
        marginRight: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    filterChipText: {
        ...typography.small,
        color: colors.text,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: colors.surface,
        fontWeight: '600',
    },
    placesList: {
        padding: spacing.md,
    },
    placeCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.md,
    },
    placeImage: {
        width: '100%',
        height: 200,
    },
    placeholderImage: {
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 64,
    },
    placeInfo: {
        padding: spacing.md,
    },
    placeName: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    placeAddress: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    placeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    ratingIcon: {
        fontSize: 14,
        marginRight: spacing.xs,
    },
    ratingText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '700',
        marginRight: spacing.xs,
    },
    ratingCount: {
        ...typography.small,
        color: colors.textLight,
    },
    priceLevel: {
        ...typography.caption,
        color: colors.success,
        fontWeight: '700',
    },
    placeActions: {
        marginTop: spacing.sm,
    },
    addButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    addButtonGradient: {
        padding: spacing.sm,
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.surface,
        fontSize: 14,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
