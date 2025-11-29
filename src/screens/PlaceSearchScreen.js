import React, { useState, useCallback  from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Platform,  from 'react-native';
import { useSelector, useDispatch  from 'react-redux';
import { debounce  from 'lodash';
import { placesService  from '../services/placesService';
import { addRecentSearch, cachePlace  from '../store/slices/placesSlice';
import { addDestination  from '../store/slices/itinerarySlice';
import { colors, spacing, typography, shadows  from '../utils/theme';
const PlaceSearchScreen = ({ navigation, route ) => {
    const dispatch = useDispatch();
    const selectedTrip = useSelector((state) => state.trips.selectedTrip);
    const selectedDay = useSelector((state) => state.itinerary.selectedDay);
    const recentSearches = useSelector((state) => state.places.recentSearches);
    const cachedPlaces = useSelector((state) => state.places.cachedPlaces);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Debounced search function
    const debouncedSearch = useCallback(debounce(async (query) => {
        if (query.trim().length === 0) {
            setSearchResults([]);
            return;
        
        setIsLoading(true);
        try {
            const results = await placesService.searchText(query, undefined, selectedCategory);
            setSearchResults(results);
            // Cache results
            results.forEach(place => {
                dispatch(cachePlace(place));
            );
            // Add to recent searches
            dispatch(addRecentSearch(query));
        
        catch (error) {
            console.error('Search error:', error);
        
        finally {
            setIsLoading(false);
        
    , 300), [selectedCategory]);
    // Handle search input change
    const handleSearchChange = (text) => {
        setSearchQuery(text);
        debouncedSearch(text);
    ;
    // Refresh search results
    const onRefresh = async () => {
        setRefreshing(true);
        if (searchQuery.trim().length > 0) {
            try {
                const results = await placesService.searchText(searchQuery, undefined, selectedCategory);
                setSearchResults(results);
            
            catch (error) {
                console.error('Refresh error:', error);
            
        
        setRefreshing(false);
    ;
    // Add place to itinerary
    const addPlaceToItinerary = (place) => {
        if (selectedTrip) {
            const newDestination = {
                id: Date.now().toString(),
                tripId: selectedTrip.id,
                dayNumber: selectedDay,
                name: place.name,
                address: place.formatted_address,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                placeId: place.place_id,
                category: 'attraction',
                order: 0, // Will be set by reducer
            ;
            dispatch(addDestination({ dayNumber: selectedDay, destination: newDestination ));
            navigation.goBack();
        
    ;
    // Render a search result item
    const renderSearchResult = ({ item ) => {
        return (<TouchableOpacity style={styles.resultItem onPress={() => addPlaceToItinerary(item)>
        {item.photos && item.photos.length > 0 ? (<Image source={{ uri: placesService.getPhotoUrl(item.photos[0].photo_reference)  style={styles.placeImage/>) : (<View style={[styles.placeholderImage, styles.imagePlaceholder]>
            <Text style={styles.placeholderText>📷</Text>
          </View>)
        
        <View style={styles.resultContent>
          <Text style={styles.resultTitle>{item.name</Text>
          <Text style={styles.resultAddress numberOfLines={1>
            {item.formatted_address
          </Text>
          
          <View style={styles.resultMeta>
            {item.rating && (<View style={styles.ratingContainer>
                <Text style={styles.ratingText>⭐ {item.rating</Text>
                {item.user_ratings_total && (<Text style={styles.ratingCount>({item.user_ratings_total)</Text>)
              </View>)
            
            {item.price_level && (<Text style={styles.priceLevel>
                {'$'.repeat(item.price_level)
              </Text>)
          </View>
        </View>
      </TouchableOpacity>);
    ;
    // Render a recent search item
    const renderRecentSearch = ({ item ) => {
        return (<TouchableOpacity style={styles.recentSearchItem onPress={() => {
                setSearchQuery(item);
                debouncedSearch(item);
            >
        <Text style={styles.recentSearchText>🔍 {item</Text>
      </TouchableOpacity>);
    ;
    // Clear recent searches
    const clearRecentSearches = () => {
        // We would need to add a clearRecentSearches action to the placesSlice
        // For now, we'll just clear the local state
    ;
    return (<View style={styles.container>
      <View style={styles.header>
        <Text style={styles.title>Search Places</Text>
        <TouchableOpacity onPress={() => navigation.goBack()>
          <Text style={styles.closeButton>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer>
        <TextInput style={styles.searchInput placeholder="Search for places, restaurants, hotels..." placeholderTextColor={colors.textLight value={searchQuery onChangeText={handleSearchChange autoFocus/>
        
        {searchQuery.length > 0 && (<TouchableOpacity style={styles.clearButton onPress={() => setSearchQuery('')>
            <Text style={styles.clearButtonText>×</Text>
          </TouchableOpacity>)
      </View>
      
      <View style={styles.categoryFilter>
        {['all', 'restaurant', 'attraction', 'hotel'].map(category => (<TouchableOpacity key={category style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
            ] onPress={() => setSelectedCategory(category)>
            <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
            ]>
              {category.charAt(0).toUpperCase() + category.slice(1)
            </Text>
          </TouchableOpacity>))
      </View>
      
      {searchQuery.length === 0 && recentSearches.length > 0 && (<View style={styles.recentSearchesContainer>
          <View style={styles.sectionHeader>
            <Text style={styles.sectionTitle>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches>
              <Text style={styles.clearAllText>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList data={recentSearches.slice(0, 5) renderItem={renderRecentSearch keyExtractor={(item, index) => index.toString() horizontal showsHorizontalScrollIndicator={false/>
        </View>)
      
      {isLoading && searchQuery.length > 0 && (<View style={styles.loadingContainer>
          <ActivityIndicator size="large" color={colors.primary/>
          <Text style={styles.loadingText>Searching...</Text>
        </View>)
      
      {!isLoading && searchResults.length > 0 && (<FlatList data={searchResults renderItem={renderSearchResult keyExtractor={(item) => item.place_id contentContainerStyle={styles.resultsContainer refreshControl={<RefreshControl refreshing={refreshing onRefresh={onRefresh/>/>)
      
      {!isLoading && searchQuery.length > 0 && searchResults.length === 0 && !refreshing && (<View style={styles.noResultsContainer>
          <Text style={styles.noResultsText>No places found</Text>
          <Text style={styles.noResultsSubtext>Try a different search term</Text>
        </View>)
    </View>);
;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    ,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.xl,
        backgroundColor: colors.surface,
        ...Platform.select({
            ios: {
                ...shadows.md,
            ,
            android: {
                elevation: 2,
            ,
        ),
    ,
    title: {
        ...typography.h2,
        color: colors.text,
    ,
    closeButton: {
        fontSize: 24,
        color: colors.textSecondary,
        padding: spacing.sm,
    ,
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: spacing.lg,
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        ...Platform.select({
            ios: {
                ...shadows.sm,
            ,
            android: {
                elevation: 1,
            ,
        ),
    ,
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.text,
    ,
    clearButton: {
        padding: spacing.sm,
    ,
    clearButtonText: {
        fontSize: 20,
        color: colors.textLight,
    ,
    categoryFilter: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    ,
    categoryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderRadius: 20,
        backgroundColor: colors.background,
    ,
    selectedCategoryButton: {
        backgroundColor: colors.primary,
    ,
    categoryText: {
        ...typography.body,
        color: colors.textSecondary,
    ,
    selectedCategoryText: {
        color: colors.surface,
        fontWeight: '600',
    ,
    recentSearchesContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    ,
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    ,
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
    ,
    clearAllText: {
        ...typography.caption,
        color: colors.primary,
    ,
    recentSearchItem: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginRight: spacing.sm,
        borderRadius: 20,
        ...Platform.select({
            ios: {
                ...shadows.sm,
            ,
            android: {
                elevation: 1,
            ,
        ),
    ,
    recentSearchText: {
        ...typography.body,
        color: colors.text,
    ,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    ,
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    ,
    resultsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    ,
    resultItem: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                ...shadows.sm,
            ,
            android: {
                elevation: 1,
            ,
        ),
    ,
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: spacing.md,
    ,
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    ,
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: spacing.md,
        backgroundColor: colors.divider,
    ,
    placeholderText: {
        fontSize: 24,
    ,
    resultContent: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingRight: spacing.md,
    ,
    resultTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.xs,
    ,
    resultAddress: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    ,
    resultMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    ,
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    ,
    ratingText: {
        ...typography.caption,
        color: colors.warning,
        fontWeight: '600',
    ,
    ratingCount: {
        ...typography.caption,
        color: colors.textLight,
        marginLeft: spacing.xs,
    ,
    priceLevel: {
        ...typography.caption,
        color: colors.textSecondary,
    ,
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    ,
    noResultsText: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.sm,
    ,
    noResultsSubtext: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    ,
);
export default PlaceSearchScreen;
