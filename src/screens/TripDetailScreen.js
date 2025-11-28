import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Animated, } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { selectTrip } from '../store/slices/tripsSlice';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { mapStyle } from '../config/maps';
// Conditional import for maps
let MapView;
let Marker;
let PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}
else {
    // For web, use our custom WebMap component
    const WebMap = require('../components/WebMap').default;
    MapView = WebMap;
    Marker = () => null; // No-op component for web
    PROVIDER_GOOGLE = undefined;
}
// Helper function to ensure we have proper Date objects
const ensureDate = (date) => {
    if (date instanceof Date) {
        return date;
    }
    return new Date(date);
};
export default function TripDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const statsAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const { tripId } = route.params;
    const trip = useSelector((state) => state.trips.items.find((t) => t.id === tripId) || state.trips.selectedTrip);
    const itinerary = useSelector((state) => state.itinerary.days.filter((day) => day.tripId === tripId));
    const allDestinations = itinerary.flatMap((day) => day.destinations);
    if (!trip) {
        return (<View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>);
    }
    // Ensure dates are proper Date objects
    const startDate = ensureDate(trip.startDate);
    const endDate = ensureDate(trip.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const mapRegion = allDestinations.length > 0 ? {
        latitude: allDestinations[0].latitude,
        longitude: allDestinations[0].longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    } : {
        latitude: 25.0330,
        longitude: 121.5654,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };
    const handleViewItinerary = () => {
        // Set the selected trip in Redux
        if (trip) {
            dispatch(selectTrip(trip));
            // Navigate to MainTabs and then to Itinerary tab
            navigation.navigate('MainTabs', { screen: 'Itinerary' });
        }
    };
    const handleViewMap = () => {
        if (trip) {
            dispatch(selectTrip(trip));
            navigation.navigate('MainTabs', { screen: 'Map' });
        }
    };
    const handleViewBudget = () => {
        if (trip) {
            dispatch(selectTrip(trip));
            navigation.navigate('MainTabs', { screen: 'Budget' });
        }
    };
    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        // Stagger stats cards
        Animated.stagger(80, statsAnims.map(anim => Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }))).start();
    }, []);
    return (<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover Image or Gradient */}
      {trip.coverImage ? (<View style={styles.coverContainer}>
          <Image source={{ uri: trip.coverImage }} style={styles.coverImage}/>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.coverOverlay}>
            <Text style={styles.coverTitle}>{trip.title}</Text>
            <Text style={styles.coverDestination}>📍 {trip.destination}</Text>
          </LinearGradient>
        </View>) : (<LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.coverGradient}>
          <Text style={styles.coverTitle}>{trip.title}</Text>
          <Text style={styles.coverDestination}>📍 {trip.destination}</Text>
        </LinearGradient>)}

      <View style={styles.content}>
        {/* Quick Stats */}
        <Animated.View style={[
            styles.statsRow,
            { opacity: fadeAnim },
        ]}>
          <Animated.View style={[
            styles.statCard,
            {
                opacity: statsAnims[0],
                transform: [{ scale: statsAnims[0] }],
            },
        ]}>
            <Text style={styles.statNumber}>{days}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </Animated.View>
          <Animated.View style={[
            styles.statCard,
            {
                opacity: statsAnims[1],
                transform: [{ scale: statsAnims[1] }],
            },
        ]}>
            <Text style={styles.statNumber}>{allDestinations.length}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </Animated.View>
          <Animated.View style={[
            styles.statCard,
            {
                opacity: statsAnims[2],
                transform: [{ scale: statsAnims[2] }],
            },
        ]}>
            <Text style={styles.statNumber}>{itinerary.length}</Text>
            <Text style={styles.statLabel}>Planned Days</Text>
          </Animated.View>
        </Animated.View>

        {/* Date Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>📅</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>
                {startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })}
              </Text>
            </View>
          </View>
          <View style={styles.divider}/>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🏁</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>End Date</Text>
              <Text style={styles.infoValue}>
                {endDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {trip.description && (<View style={styles.section}>
            <Text style={styles.sectionTitle}>About this trip</Text>
            <Text style={styles.description}>{trip.description}</Text>
          </View>)}

        {/* Map Preview */}
        {allDestinations.length > 0 && (<View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Route Preview</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}>
                <Text style={styles.viewAllText}>View Full Map →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <MapView provider={Platform.OS !== 'web' ? PROVIDER_GOOGLE : undefined} style={styles.map} region={mapRegion} customMapStyle={Platform.OS !== 'web' ? mapStyle : undefined} scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}>
                {Platform.OS !== 'web' && allDestinations.map((dest, index) => (<Marker key={dest.id} coordinate={{
                    latitude: dest.latitude,
                    longitude: dest.longitude,
                }} pinColor={colors.primary}/>))}
              </MapView>
              <TouchableOpacity style={styles.mapOverlay} onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}>
                <View style={styles.mapOverlayContent}>
                  <Text style={styles.mapOverlayText}>Tap to explore</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>)}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleViewItinerary}>
            <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionButtonText}>View Itinerary</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewMap}>
            <LinearGradient colors={[colors.secondary, '#95E1D3']} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionButtonText}>Explore Map</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewBudget}>
            <LinearGradient colors={[colors.accent, '#FFD93D']} style={styles.actionButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionButtonText}>Manage Budget</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>);
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
    coverContainer: {
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    coverGradient: {
        width: '100%',
        height: 250,
        padding: spacing.lg,
        paddingTop: 80,
    },
    coverTitle: {
        ...typography.h1,
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    coverDestination: {
        ...typography.h3,
        color: colors.surface,
        opacity: 0.9,
    },
    content: {
        padding: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    statNumber: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    infoCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoIcon: {
        fontSize: 20,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    infoValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: spacing.sm,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
    },
    viewAllText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.md,
    },
    map: {
        flex: 1,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayContent: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 20,
        ...shadows.md,
    },
    mapOverlayText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    actions: {
        marginTop: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    actionButtonText: {
        color: colors.surface,
        ...typography.body,
        fontWeight: '700',
    },
});
