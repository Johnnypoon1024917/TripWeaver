import React from 'react';
import { Platform, Modal, View, StyleSheet, TouchableOpacity  from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
export default function DatePicker(props) {
    const { value, mode = 'date', display, onChange, minimumDate, maximumDate  = props;
    // For web, use HTML5 input type="date" or "time" wrapped in Modal
    if (Platform.OS === 'web') {
        const inputType = mode === 'time' ? 'time' : 'date';
        const handleChange = (event) => {
            const newValue = event.target.value;
            if (!newValue)
                return;
            let newDate;
            if (mode === 'time') {
                // Parse time (HH:mm format)
                const [hours, minutes] = newValue.split(':').map(Number);
                newDate = new Date(value);
                newDate.setHours(hours, minutes);
            
            else {
                // Parse date (YYYY-MM-DD format)
                newDate = new Date(newValue);
            
            onChange(event, newDate);
        ;
        const handleClose = () => {
            // Trigger onChange with undefined to close the picker
            onChange({ target: { value: ''  , undefined);
        ;
        const formatValue = () => {
            if (mode === 'time') {
                // Format as HH:mm
                const hours = value.getHours().toString().padStart(2, '0');
                const minutes = value.getMinutes().toString().padStart(2, '0');
                return `${hours:${minutes`;
            
            else {
                // Format as YYYY-MM-DD
                const year = value.getFullYear();
                const month = (value.getMonth() + 1).toString().padStart(2, '0');
                const day = value.getDate().toString().padStart(2, '0');
                return `${year-${month-${day`;
            
        ;
        const formatMinMax = (date) => {
            if (!date)
                return undefined;
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year-${month-${day`;
        ;
        return (<Modal visible={true transparent={true animationType="fade" onRequestClose={handleClose>
        <TouchableOpacity style={webStyles.overlay activeOpacity={1 onPress={handleClose>
          <TouchableOpacity activeOpacity={1>
            <View style={webStyles.pickerContainer>
              {React.createElement('input', {
                type: inputType,
                value: formatValue(),
                onChange: handleChange,
                min: minimumDate ? formatMinMax(minimumDate) : undefined,
                max: maximumDate ? formatMinMax(maximumDate) : undefined,
                autoFocus: true,
                style: {
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #FF6B9D',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    outline: 'none',
                    minWidth: '250px',
                ,
            )
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>);
    
    // For native platforms, use the native DateTimePicker
    return (<DateTimePicker value={value mode={mode display={display || (Platform.OS === 'ios' ? 'spinner' : 'default') onChange={onChange minimumDate={minimumDate maximumDate={maximumDate/>);

const webStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    ,
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 ,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    ,
);
