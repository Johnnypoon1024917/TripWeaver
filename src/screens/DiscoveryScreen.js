import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, RefreshControl, } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
// Firebase imports
import { db } from '../services/firebaseService';
import { collection, query, orderBy, limit, getDocs, getDoc, doc as firestoreDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
// Helper function to ensure we have proper Date objects
const ensureDate = (date) => {
    if (date instanceof Date) {
        return date;
    }
    return new Date(date);
};
export default function DiscoveryScreen() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.user);
    const [trips, setTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('popular');
    // Load public trips
    useEffect(() => {
        loadPublicTrips();
    }, []);
    // Filter trips when search query or filter changes
    useEffect(() => {
        filterTrips();
    }, [searchQuery, selectedFilter, trips]);
    const loadPublicTrips = async () => {
        try {
            setLoading(true);
            // Query public trips from Firestore
            const q = query(collection(db, 'publicTrips'), orderBy('createdAt', 'desc'), limit(20));
            const querySnapshot = await getDocs(q);
            const tripsData = [];
            for (const doc of querySnapshot.docs) {
                const tripData = doc.data();
                const trip = {
                    id: doc.id,
                    userId: tripData.userId,
                    title: tripData.title,
                    destination: tripData.destination,
                    startDate: tripData.startDate.toDate(),
                    endDate: tripData.endDate.toDate(),
                    coverImage: tripData.coverImage,
                    description: tripData.description,
                    likes: tripData.likes || 0,
                    comments: tripData.comments || 0,
                    isLiked: tripData.likedBy?.includes(currentUser?.id) || false,
                };
                // Load user data
                if (trip.userId) {
                    const userDoc = await getDoc(firestoreDoc(db, 'users', trip.userId));
                    if (userDoc.exists()) {
                        trip.user = userDoc.data();
                    }
                }
                tripsData.push(trip);
            }
            setTrips(tripsData);
            setFilteredTrips(tripsData);
        }
        catch (error) {
            console.error('Error loading public trips:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadPublicTrips();
        setRefreshing(false);
    };
    const filterTrips = () => {
        let filtered = [...trips];
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(trip => trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.destination.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Apply sort filter
        switch (selectedFilter) {
            case 'popular':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    return ensureDate(b.startDate).getTime() - ensureDate(a.startDate).getTime();
                });
                break;
            case 'duration':
                filtered.sort((a, b) => {
                    const durationA = ensureDate(a.endDate).getTime() - ensureDate(a.startDate).getTime();
                    const durationB = ensureDate(b.endDate).getTime() - ensureDate(b.startDate).getTime();
                    return durationB - durationA;
                });
                break;
        }
        setFilteredTrips(filtered);
    };
    const handleLikeTrip = async (tripId) => {
        try {
            const tripRef = firestoreDoc(db, 'publicTrips', tripId);
            // Update in local state
            setTrips(prevTrips => prevTrips.map(trip => trip.id === tripId
                ? {
                    ...trip,
                    likes: trip.isLiked ? trip.likes - 1 : trip.likes + 1,
                    isLiked: !trip.isLiked
                }
                : trip));
            // Update in Firestore
            await updateDoc(tripRef, {
                likes: increment(1),
                likedBy: arrayUnion(currentUser?.id),
            });
        }
        catch (error) {
            console.error('Error liking trip:', error);
            // Revert local change on error
            setTrips(prevTrips => prevTrips.map(trip => trip.id === tripId
                ? {
                    ...trip,
                    likes: trip.isLiked ? trip.likes + 1 : trip.likes - 1,
                    isLiked: !trip.isLiked
                }
                : trip));
        }
    };
    const renderTripItem = ({ item }) => {
        const durationDays = Math.ceil((ensureDate(item.endDate).getTime() - ensureDate(item.startDate).getTime()) / (1000 * 60 * 60 * 24));
        return (<TouchableOpacity style={styles.tripCard} onPress={() => console.log('View trip details', item.id)}>
        {item.coverImage ? (<Image source={{ uri: item.coverImage }} style={styles.tripImage}/>) : (<View style={[styles.tripImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>)}
        
        <View style={styles.tripContent}>
          <Text style={styles.tripTitle} numberOfLines={1}>
            {item.title}
          </Text>
          
          <Text style={styles.tripDestination} numberOfLines={1}>
            📍 {item.destination}
          </Text>
          
          <View style={styles.tripMeta}>
            <Text style={styles.tripDate}>
              {ensureDate(item.startDate).toLocaleDateString()} - {ensureDate(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.tripDuration}>
              {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </Text>
          </View>
          
          {item.description && (<Text style={styles.tripDescription} numberOfLines={2}>
              {item.description}
            </Text>)}
          
          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleLikeTrip(item.id)}>
              <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
                ❤️ {item.likes}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>
                💬 {item.comments}
              </Text>
            </TouchableOpacity>
            
            {item.user && (<View style={styles.userContainer}>
                {item.user.photoURL ? (<Image source={{ uri: item.user.photoURL }} style={styles.userAvatar}/>) : (<View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Text style={styles.userAvatarText}>
                      {item.user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>)}
                <Text style={styles.userName} numberOfLines={1}>
                  {item.user.displayName}
                </Text>
              </View>)}
          </View>
        </View>
      </TouchableOpacity>);
    };
    return (<View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Explore amazing trips from the community</Text>
      </LinearGradient>
      
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search destinations or trip names..." placeholderTextColor={colors.textLight} value={searchQuery} onChangeText={setSearchQuery}/>
      </View>
      
      <View style={styles.filterContainer}>
        {['popular', 'recent', 'duration'].map((filter) => (<TouchableOpacity key={filter} style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilterButton,
            ]} onPress={() => setSelectedFilter(filter)}>
            <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText,
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>))}
      </View>
      
      <FlatList data={filteredTrips} renderItem={renderTripItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.tripList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} ListEmptyComponent={<View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading trips...' : 'No trips found'}
            </Text>
          </View>}/>
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
    },
    searchContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.sm,
    },
    searchInput: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text,
        ...shadows.sm,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    filterButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderRadius: 20,
        backgroundColor: colors.background,
    },
    selectedFilterButton: {
        backgroundColor: colors.primary,
    },
    filterText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    selectedFilterText: {
        color: colors.surface,
        fontWeight: '600',
    },
    tripList: {
        padding: spacing.md,
    },
    tripCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    tripImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    placeholderImage: {
        backgroundColor: colors.divider,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 48,
    },
    tripContent: {
        padding: spacing.lg,
    },
    tripTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    tripDestination: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    tripMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    tripDate: {
        ...typography.caption,
        color: colors.textLight,
    },
    tripDuration: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    tripDescription: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    tripActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButton: {
        padding: spacing.sm,
    },
    actionText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    likedText: {
        color: colors.error,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: spacing.sm,
    },
    userAvatarPlaceholder: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: colors.surface,
        fontWeight: '700',
    },
    userName: {
        ...typography.caption,
        color: colors.text,
        maxWidth: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textLight,
    },
});
