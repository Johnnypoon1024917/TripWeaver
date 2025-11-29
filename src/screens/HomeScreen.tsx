import React, { useEffect, useState, useRef  from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
 from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch  from 'react-redux';
import { RootState  from '../store';
import { setTrips, addTrip  from '../store/slices/tripsSlice';
import { clearUser  from '../store/slices/authSlice';
import { Trip  from '../types';
import { tripAPI  from '../services/api';
import { colors, spacing, typography, shadows, borderRadius  from '../utils/theme';
import { useTranslation  from '../i18n/useTranslation';
import placesService from '../services/placesService';
import DatePicker from '../components/DatePicker';
import NotificationDemo from '../components/NotificationDemo';

const { width  = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

export default function HomeScreen({ navigation : any) {
  const dispatch = useDispatch();
  const { t  = useTranslation();
  const trips = useSelector((state: RootState) => state.trips.items);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Create Trip Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [tripStartDate, setTripStartDate] = useState(new Date());
  const [tripEndDate, setTripEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [destQuery, setDestQuery] = useState('');
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [creatingTrip, setCreatingTrip] = useState(false);
  
  // Animation values
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const cardScaleAnims = useRef(new Map()).current;
  
  // Cache and debouncing refs
  const loadTripsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds cache

  const filters = [
    { id: 'all', label: 'All', icon: '🌍' ,
    { id: 'upcoming', label: 'Upcoming', icon: '📅' ,
    { id: 'past', label: 'Past', icon: '✓' ,
    { id: 'favorites', label: 'Favorites', icon: '⭐' ,
  ];
  
  // Animate modal when it opens/closes
  useEffect(() => {
    if (showCreateModal || showDestModal) {
      Animated.spring(modalSlideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      ).start();
    
      modalSlideAnim.setValue(0);
    
  , [showCreateModal, showDestModal]);
  
  // FAB animation on press
  const handleFABPress = () => {
    Animated.sequence([
      Animated.timing(fabScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      ),
      Animated.timing(fabScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      ),
    ]).start();
    setShowCreateModal(true);
  ;

  useEffect(() => {
    // Load trips from database with caching and debouncing
    const loadTrips = async () => {
      if (!user) return;
      
      // Check if we have recent data (within cache duration)
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTimeRef.current;
      
      if (timeSinceLastLoad < CACHE_DURATION && trips.length > 0) {
        console.log('Using cached trips data');
        return;
      
      
      try {
        const userTrips = await tripAPI.getAll();
        dispatch(setTrips(userTrips));
        lastLoadTimeRef.current = now;
       catch (error: any) {
        console.error('Failed to load trips:', error);
        // If token is invalid, clear user session
        if (error.message?.includes('Invalid or expired token')) {
          dispatch(clearUser());
        
        // Only clear trips if we have no cached data
        if (trips.length === 0) {
          dispatch(setTrips([]));
        
      
    ;
    
    // Clear any pending timeout
    if (loadTripsTimeoutRef.current) {
      clearTimeout(loadTripsTimeoutRef.current);
    
    
    // Debounce the load operation
    loadTripsTimeoutRef.current = setTimeout(() => {
      loadTrips();
    , 300);
    
    // Cleanup
    return () => {
      if (loadTripsTimeoutRef.current) {
        clearTimeout(loadTripsTimeoutRef.current);
      
    ;
  , [user]);

  const searchDestinations = async (query: string) => {
    if (query.length < 3) {
      setDestSuggestions([]);
      return;
    
    try {
      const results = await placesService.autocomplete(query);
      setDestSuggestions(results);
     catch (error) {
      console.error('Destination search error:', error);
    
  ;

  const selectDestination = (place: any) => {
    setTripDestination(place.description);
    setDestQuery(place.description);
    setShowDestModal(false);
    setDestSuggestions([]);
  ;

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTripStartDate(selectedDate);
      if (selectedDate > tripEndDate) {
        setTripEndDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
      
    
      // User cancelled or closed the picker
      setShowStartDatePicker(false);
    
  ;

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTripEndDate(selectedDate);
    
      // User cancelled or closed the picker
      setShowEndDatePicker(false);
    
  ;

  const handleCreateTrip = async () => {
    if (!tripTitle || !tripDestination) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    

    if (tripEndDate < tripStartDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    

    setCreatingTrip(true);
    try {
      const newTrip: Trip = {
        id: '',
        userId: user?.id || '',
        title: tripTitle,
        destination: tripDestination,
        startDate: tripStartDate,
        endDate: tripEndDate,
        description: tripDescription,
        collaborators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      ;

      const savedTrip = await tripAPI.create(newTrip);
      dispatch(addTrip(savedTrip));
      
      // Reset form
      setTripTitle('');
      setTripDestination('');
      setTripDescription('');
      setTripStartDate(new Date());
      setTripEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setShowCreateModal(false);
      
      Alert.alert('Success', 'Trip created and saved!');
     catch (error) {
      console.error('Failed to create trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
     finally {
      setCreatingTrip(false);
    
  ;

  const renderTripCard = ({ item, index : { item: Trip; index: number ) => {
    // Convert dates to Date objects if they're strings (from API/persistence)
    const startDate = item.startDate instanceof Date ? item.startDate : new Date(item.startDate);
    const endDate = item.endDate instanceof Date ? item.endDate : new Date(item.endDate);
    
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Create animation for this card if it doesn't exist
    if (!cardScaleAnims.has(item.id)) {
      const anim = new Animated.Value(0);
      cardScaleAnims.set(item.id, anim);
      // Trigger animation immediately
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      ).start();
    
    const scaleAnim = cardScaleAnims.get(item.id)!;

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim ],
          opacity: scaleAnim,
        
      >
        <TouchableOpacity
          testID="trip-list-item"
          style={styles.tripCardGrid
          onPress={() => navigation.navigate('TripDetail', { tripId: item.id )
          activeOpacity={0.9
        >
        <View style={styles.imageContainerGrid>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage  style={styles.tripImageGrid />
          ) : (
            <LinearGradient
              colors={[colors.gradientPurple, colors.gradientPurpleEnd]
              style={styles.tripImageGrid
              start={{ x: 0, y: 0 
              end={{ x: 1, y: 1 
            >
              <Text style={styles.placeholderText>✈️</Text>
            </LinearGradient>
          )
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']
            style={styles.imageOverlayGrid
          />
          <View style={styles.durationBadgeTop>
            <Text style={styles.durationTextTop>{daysD</Text>
          </View>
        </View>
        
        <View style={styles.tripInfoGrid>
          <Text style={styles.tripTitleGrid numberOfLines={2>{item.title</Text>
          <View style={styles.infoRowGrid>
            <Text style={styles.iconSmall>📍</Text>
            <Text style={styles.tripDestinationGrid numberOfLines={1>
              {item.destination
            </Text>
          </View>
          <Text style={styles.tripDatesGrid>
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' )
          </Text>
        </View>
      </TouchableOpacity>
      </Animated.View>
    );
  ;

  return (
    <View style={styles.container>
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]
        style={styles.header
      >
        <Text style={styles.headerTitle>{t.myTrips</Text>
        <Text style={styles.headerSubtitle>{t.exploreAdventures</Text>
        
        {/* Search Bar */
        <View style={styles.searchContainer>
          <Text style={styles.searchIcon>🔍</Text>
          <TextInput
            style={styles.searchInput
            placeholder={t.search + " trips..."
            placeholderTextColor={colors.textLight
            value={searchQuery
            onChangeText={setSearchQuery
          />
        </View>
      </LinearGradient>

      {/* Notification Demo */
      <NotificationDemo />

      {/* Filters */
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false
        style={styles.filtersContainer
        contentContainerStyle={styles.filtersContent
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]
            onPress={() => setSelectedFilter(filter.id)
          >
            <Text style={styles.filterIcon>{filter.icon</Text>
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]
            >
              {filter.label
            </Text>
          </TouchableOpacity>
        ))
      </ScrollView>

      {trips.length === 0 ? (
        <View style={styles.emptyState>
          <Text style={styles.emptyIcon>🌍</Text>
          <Text style={styles.emptyTitle>{t.noTripsYet</Text>
          <Text style={styles.emptyText>
            {t.startPlanningAdventure
          </Text>
          <TouchableOpacity
            testID="create-trip-button"
            onPress={() => setShowCreateModal(true)
          >
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd]
              style={styles.createButton
              start={{ x: 0, y: 0 
              end={{ x: 1, y: 0 
            >
              <Text style={styles.createButtonText>{t.createFirstTrip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips
          renderItem={renderTripCard
          keyExtractor={(item) => item.id
          numColumns={2
          contentContainerStyle={styles.listContainer
          columnWrapperStyle={styles.columnWrapper
          showsVerticalScrollIndicator={false
        />
      )

      <TouchableOpacity
        style={styles.fab
        onPress={handleFABPress
        activeOpacity={0.8
      >
        <Animated.View style={{ transform: [{ scale: fabScaleAnim ] >
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]
            style={styles.fabGradient
            start={{ x: 0, y: 0 
            end={{ x: 1, y: 0 
          >
            <Text style={styles.fabText>+</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Create Trip Modal */
      <Modal
        visible={showCreateModal
        transparent={true
        animationType="none"
        onRequestClose={() => setShowCreateModal(false)
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalSlideAnim,
            ,
          ]
        >
          <Animated.View 
            style={[
              styles.createTripModal,
              {
                transform: [
                  {
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    ),
                  ,
                ],
              ,
            ]
          >
            <ScrollView showsVerticalScrollIndicator={false>
              <View style={styles.modalHeader>
                <Text style={styles.modalTitle>{t.createNewTrip</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)>
                  <Text style={styles.closeButton>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm>
                <Text style={styles.modalLabel>{t.tripTitleRequired</Text>
                <TextInput
                  style={styles.modalInput
                  placeholder={t.tripTitlePlaceholder
                  value={tripTitle
                  onChangeText={setTripTitle
                  placeholderTextColor="#999"
                />

                <Text style={styles.modalLabel>{t.destinationRequired</Text>
                <TouchableOpacity
                  style={styles.modalInput
                  onPress={() => setShowDestModal(true)
                >
                  <Text style={tripDestination ? styles.modalInputText : styles.modalPlaceholder>
                    {tripDestination || t.searchForDestination
                  </Text>
                </TouchableOpacity>

                <Text style={styles.modalLabel>{t.startDateRequired</Text>
                <TouchableOpacity
                  style={styles.modalInput
                  onPress={() => setShowStartDatePicker(true)
                >
                  <Text style={styles.modalInputText>
                    {tripStartDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    )
                  </Text>
                </TouchableOpacity>

                <Text style={styles.modalLabel>{t.endDateRequired</Text>
                <TouchableOpacity
                  style={styles.modalInput
                  onPress={() => setShowEndDatePicker(true)
                >
                  <Text style={styles.modalInputText>
                    {tripEndDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    )
                  </Text>
                </TouchableOpacity>

                <Text style={styles.modalLabel>{t.descriptionOptional</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]
                  placeholder={t.addNotesAboutTrip
                  value={tripDescription
                  onChangeText={setTripDescription
                  multiline
                  numberOfLines={4
                  placeholderTextColor="#999"
                />

                <TouchableOpacity 
                  style={[styles.modalButton, creatingTrip && styles.modalButtonDisabled] 
                  onPress={handleCreateTrip
                  disabled={creatingTrip
                >
                  {creatingTrip ? (
                    <View style={styles.loadingRow>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Text style={[styles.modalButtonText, { marginLeft: 8 ]>{t.creating</Text>
                    </View>
                  ) : (
                    <Text style={styles.modalButtonText>{t.createTrip</Text>
                  )
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Destination Search Modal */
      <Modal
        visible={showDestModal
        transparent={true
        animationType="none"
        onRequestClose={() => setShowDestModal(false)
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalSlideAnim,
            ,
          ]
        >
          <Animated.View 
            style={[
              styles.searchModal,
              {
                transform: [
                  {
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    ),
                  ,
                ],
              ,
            ]
          >
            <View style={styles.modalHeader>
              <Text style={styles.modalTitle>{t.searchDestinationTitle</Text>
              <TouchableOpacity onPress={() => setShowDestModal(false)>
                <Text style={styles.closeButton>×</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.destSearchInput
              placeholder={t.searchForCityOrPlace
              value={destQuery
              onChangeText={(text) => {
                setDestQuery(text);
                searchDestinations(text);
              
              autoFocus
              placeholderTextColor="#999"
            />
            
            <ScrollView style={styles.suggestionsList>
              {destSuggestions.map((place, index) => (
                <TouchableOpacity
                  key={index
                  style={styles.suggestionItem
                  onPress={() => selectDestination(place)
                >
                  <Text style={styles.suggestionText>{place.description</Text>
                </TouchableOpacity>
              ))
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Date Pickers */
      {showStartDatePicker && (
        <DatePicker
          value={tripStartDate
          mode="date"
          onChange={handleStartDateChange
        />
      )

      {showEndDatePicker && (
        <DatePicker
          value={tripEndDate
          mode="date"
          onChange={handleEndDateChange
        />
      )
    </View>
  );


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  ,
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  ,
  headerTitle: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  ,
  headerSubtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    marginBottom: spacing.md,
  ,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  ,
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  ,
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.surface,
    ...typography.body,
  ,
  filtersContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  ,
  filtersContent: {
    paddingHorizontal: spacing.md,
  ,
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  ,
  filterChipActive: {
    backgroundColor: colors.primary,
  ,
  filterIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  ,
  filterText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  ,
  filterTextActive: {
    color: colors.surface,
    fontWeight: '700',
  ,
  listContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  ,
  columnWrapper: {
    justifyContent: 'space-between',
  ,
  tripCardGrid: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  ,
  imageContainerGrid: {
    width: '100%',
    height: 140,
    position: 'relative',
  ,
  tripImageGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  ,
  placeholderText: {
    fontSize: 32,
  ,
  imageOverlayGrid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  ,
  durationBadgeTop: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  ,
  durationTextTop: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  ,
  tripInfoGrid: {
    padding: spacing.md,
  ,
  tripTitleGrid: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    minHeight: 40,
  ,
  infoRowGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  ,
  iconSmall: {
    fontSize: 12,
    marginRight: 4,
  ,
  tripDestinationGrid: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  ,
  tripDatesGrid: {
    ...typography.small,
    color: colors.textLight,
  ,
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  ,
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  ,
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  ,
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  ,
  createButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.md,
  ,
  createButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  ,
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: 28,
    ...shadows.lg,
  ,
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  ,
  fabText: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '300',
  ,
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  ,
  createTripModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    ...shadows.lg,
  ,
  searchModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...shadows.lg,
  ,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  ,
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  ,
  closeButton: {
    fontSize: 36,
    color: colors.textSecondary,
    fontWeight: '300',
    lineHeight: 36,
  ,
  modalForm: {
    padding: spacing.lg,
  ,
  modalLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  ,
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.divider,
    minHeight: 48,
    justifyContent: 'center',
  ,
  modalInputText: {
    ...typography.body,
    color: colors.text,
  ,
  modalPlaceholder: {
    ...typography.body,
    color: colors.textLight,
  ,
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  ,
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  ,
  modalButtonDisabled: {
    opacity: 0.6,
  ,
  modalButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  ,
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  ,
  destSearchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.divider,
  ,
  suggestionsList: {
    maxHeight: 400,
  ,
  suggestionItem: {
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  ,
  suggestionText: {
    ...typography.body,
    color: colors.text,
  ,
);
