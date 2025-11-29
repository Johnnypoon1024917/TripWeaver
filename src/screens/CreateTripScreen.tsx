import React, { useState  from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
 from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector  from 'react-redux';
import { RootState  from '../store';
import { addTrip  from '../store/slices/tripsSlice';
import { Trip  from '../types';
import placesService from '../services/placesService';
import { tripAPI  from '../services/api';
import { colors, spacing, typography  from '../utils/theme';

export default function CreateTripScreen({ navigation : any) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [description, setDescription] = useState('');
  
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const searchDestinations = async (query: string) => {
    if (query.length < 3) {
      setDestinationSuggestions([]);
      return;
    

    try {
      const results = await placesService.autocomplete(query);
      setDestinationSuggestions(results);
     catch (error) {
      console.error('Destination search error:', error);
    
  ;

  const selectDestination = (place: any) => {
    setDestination(place.description);
    setDestinationQuery(place.description);
    setShowDestinationModal(false);
    setDestinationSuggestions([]);
  ;

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
      
    
  ;

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    
  ;

  const handleCreateTrip = async () => {
    if (!title || !destination) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    

    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    

    setCreating(true);
    try {
      const newTrip: Trip = {
        id: '', // Backend will generate UUID
        userId: user?.id || '',
        title,
        destination,
        startDate,
        endDate,
        description,
        collaborators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      ;

      // Save to database
      const savedTrip = await tripAPI.create(newTrip);
      
      // Update Redux with saved trip
      dispatch(addTrip(savedTrip));
      
      Alert.alert('Success', 'Trip created and saved to database!', [
        { text: 'OK', onPress: () => navigation.goBack() ,
      ]);
     catch (error) {
      console.error('Failed to create trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
     finally {
      setCreating(false);
    
  ;

  return (
    <ScrollView style={styles.container>
      <View style={styles.form>
        <Text style={styles.label>Trip Title *</Text>
        <TextInput
          style={styles.input
          placeholder="e.g., Summer Europe Adventure"
          value={title
          onChangeText={setTitle
        />

        <Text style={styles.label>Destination *</Text>
        <TouchableOpacity
          style={styles.input
          onPress={() => setShowDestinationModal(true)
        >
          <Text style={destination ? styles.inputText : styles.placeholderText>
            {destination || 'Search for destination...'
          </Text>
        </TouchableOpacity>

        <Text style={styles.label>Start Date *</Text>
        <TouchableOpacity
          style={styles.input
          onPress={() => setShowStartDatePicker(true)
        >
          <Text style={styles.inputText>
            {startDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            )
          </Text>
        </TouchableOpacity>

        <Text style={styles.label>End Date *</Text>
        <TouchableOpacity
          style={styles.input
          onPress={() => setShowEndDatePicker(true)
        >
          <Text style={styles.inputText>
            {endDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            )
          </Text>
        </TouchableOpacity>

        <Text style={styles.label>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]
          placeholder="Add notes about your trip..."
          value={description
          onChangeText={setDescription
          multiline
          numberOfLines={4
        />

        <TouchableOpacity 
          style={[styles.button, creating && styles.buttonDisabled] 
          onPress={handleCreateTrip
          disabled={creating
        >
          {creating ? (
            <View style={styles.loadingRow>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={[styles.buttonText, { marginLeft: 8 ]>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText>Create Trip</Text>
          )
        </TouchableOpacity>
      </View>

      {/* Destination Search Modal */
      <Modal
        visible={showDestinationModal
        transparent
        animationType="slide"
        onRequestClose={() => setShowDestinationModal(false)
      >
        <View style={styles.modalOverlay>
          <View style={styles.modalContent>
            <View style={styles.modalHeader>
              <Text style={styles.modalTitle>Search Destination</Text>
              <TouchableOpacity onPress={() => setShowDestinationModal(false)>
                <Text style={styles.closeButton>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput
              placeholder="Type destination name..."
              value={destinationQuery
              onChangeText={(text) => {
                setDestinationQuery(text);
                searchDestinations(text);
              
              autoFocus
            />

            <FlatList
              data={destinationSuggestions
              keyExtractor={(item) => item.place_id
              renderItem={({ item ) => (
                <TouchableOpacity
                  style={styles.suggestionItem
                  onPress={() => selectDestination(item)
                >
                  <Text style={styles.suggestionMain>
                    {item.structured_formatting.main_text
                  </Text>
                  <Text style={styles.suggestionSecondary>
                    {item.structured_formatting.secondary_text
                  </Text>
                </TouchableOpacity>
              )
              ListEmptyComponent={
                destinationQuery.length >= 3 ? (
                  <Text style={styles.emptyText>No destinations found</Text>
                ) : (
                  <Text style={styles.emptyText>Type at least 3 characters to search</Text>
                )
              
            />
          </View>
        </View>
      </Modal>

      {/* Date Pickers */
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'
          onChange={handleStartDateChange
          minimumDate={new Date()
        />
      )

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'
          onChange={handleEndDateChange
          minimumDate={startDate
        />
      )
    </ScrollView>
  );


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  ,
  form: {
    padding: 20,
  ,
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  ,
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  ,
  inputText: {
    fontSize: 16,
    color: '#333',
  ,
  placeholderText: {
    fontSize: 16,
    color: '#999',
  ,
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  ,
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  ,
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  ,
  buttonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  ,
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  ,
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  ,
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  ,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  ,
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  ,
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  ,
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  ,
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  ,
  suggestionMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  ,
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
  ,
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  ,
);
