import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { addDestination } from '../store/slices/itinerarySlice';
import { Destination, PlaceCategory } from '../types';
import placesService from '../services/placesService';

export default function AddDestinationScreen({ route, navigation }: any) {
  const { tripId, dayNumber } = route.params;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('attraction');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const dispatch = useDispatch();

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setPlaceSuggestions([]);
      return;
    }

    try {
      const results = await placesService.searchText(query);
      setPlaceSuggestions(results);
    } catch (error) {
      console.error('Place search error:', error);
    }
  };

  const selectPlace = (place: any) => {
    setName(place.name);
    setAddress(place.formatted_address);
    setSearchQuery('');
    setShowPlaceModal(false);
    setPlaceSuggestions([]);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
      if (selectedTime >= endTime) {
        setEndTime(new Date(selectedTime.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleAddDestination = () => {
    if (!name || !address) {
      Alert.alert('Error', 'Please fill in name and address');
      return;
    }

    const newDestination: Destination = {
      id: Date.now().toString(),
      tripId,
      dayNumber,
      name,
      address,
      latitude: 0,
      longitude: 0,
      category,
      notes,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      order: 0,
    };

    dispatch(addDestination({ dayNumber, destination: newDestination }));
    Alert.alert('Success', 'Destination added successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Place Name *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPlaceModal(true)}
        >
          <Text style={name ? styles.inputText : styles.placeholderText}>
            {name || 'Search for a place...'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Address will be auto-filled"
          value={address}
          onChangeText={setAddress}
          editable={!!name}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {['attraction', 'restaurant', 'hotel', 'shopping', 'activity'].map(
            (cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat as PlaceCategory)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Text style={styles.inputText}>
            {formatTime(startTime)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Text style={styles.inputText}>
            {formatTime(endTime)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add notes about this place..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddDestination}>
          <Text style={styles.buttonText}>Add Destination</Text>
        </TouchableOpacity>
      </View>

      {/* Place Search Modal */}
      <Modal
        visible={showPlaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Place</Text>
              <TouchableOpacity onPress={() => setShowPlaceModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Type place name..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchPlaces(text);
              }}
              autoFocus
            />

            <FlatList
              data={placeSuggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => selectPlace(item)}
                >
                  <Text style={styles.suggestionMain}>{item.name}</Text>
                  <Text style={styles.suggestionSecondary}>
                    {item.formatted_address}
                  </Text>
                  {item.rating && (
                    <Text style={styles.suggestionRating}>
                      ⭐ {item.rating.toFixed(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 3 ? (
                  <Text style={styles.emptyText}>No places found</Text>
                ) : (
                  <Text style={styles.emptyText}>Type at least 3 characters to search</Text>
                )
              }
            />
          </View>
        </View>
      </Modal>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndTimeChange}
          minimumDate={startTime}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionRating: {
    fontSize: 14,
    color: '#FF9500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  },
});
