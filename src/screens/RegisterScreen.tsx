import React, { useState, useEffect, useRef  from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
 from 'react-native';
import { useDispatch  from 'react-redux';
import { setUser, setLoading  from '../store/slices/authSlice';
import { User  from '../types';
import { authAPI  from '../services/api';
import { useTranslation  from '../i18n/useTranslation';

export default function RegisterScreen({ navigation : any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();
  const { t  = useTranslation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Fade in and slide up animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      ),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      ),
    ]).start();
  , []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    

    dispatch(setLoading(true));

    try {
      const response = await authAPI.register(email, password, name);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
        photoURL: response.user.photoURL,
        createdAt: new Date(response.user.createdAt),
      ;
      
      dispatch(setUser(user));
     catch (error: any) {
      dispatch(setLoading(false));
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    
  ;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'
      style={styles.container
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim ],
          ,
        ]
      >
        <Text style={styles.title>{t.createAccount</Text>
        <Text style={styles.subtitle>Join TripWeaver today</Text>

        <View style={styles.form>
          <TextInput
            style={styles.input
            placeholder={t.fullName
            value={name
            onChangeText={setName
          />

          <TextInput
            style={styles.input
            placeholder={t.email
            value={email
            onChangeText={setEmail
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input
            placeholder={t.password
            value={password
            onChangeText={setPassword
            secureTextEntry
          />

          <TextInput
            style={styles.input
            placeholder={t.confirmPassword
            value={confirmPassword
            onChangeText={setConfirmPassword
            secureTextEntry
          />

          <TouchableOpacity style={styles.button onPress={handleRegister>
            <Text style={styles.buttonText>{t.register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton
            onPress={() => navigation.navigate('Login')
          >
            <Text style={styles.linkText>
              {t.alreadyHaveAccount {t.login
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  ,
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  ,
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  ,
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  ,
  form: {
    width: '100%',
  ,
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  ,
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  ,
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  ,
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  ,
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  ,
);
