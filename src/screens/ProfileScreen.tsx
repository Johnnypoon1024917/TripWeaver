import React, { useState, useEffect, useRef  from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
 from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector  from 'react-redux';
import { useNavigation  from '@react-navigation/native';
import { RootState  from '../store';
import { clearUser  from '../store/slices/authSlice';
import { clearAuthData  from '../services/api';
import { colors, spacing, typography, shadows  from '../utils/theme';
import { useTranslation  from '../i18n/useTranslation';
import { Language  from '../i18n/translations';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t, language, changeLanguage  = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const trips = useSelector((state: RootState) => state.trips.items);
  const [showLanguages, setShowLanguages] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const statsAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  
  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      ),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      ),
    ]).start();
    
    // Stagger stats animation
    Animated.stagger(100, 
      statsAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        )
      )
    ).start();
  , []);

  const languages: { code: Language; name: string; flag: string [] = [
    { code: 'en', name: 'English', flag: '🇬🇧' ,
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' ,
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' ,
  ];

  const handleLogout = async () => {
    Alert.alert(t.logout, 'Are you sure you want to logout?', [
      { text: t.cancel, style: 'cancel' ,
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear auth data from AsyncStorage and API
            await clearAuthData();
            // Clear Redux state
            dispatch(clearUser());
           catch (error) {
            console.error('Logout error:', error);
            // Still clear Redux state even if API call fails
            dispatch(clearUser());
          
        ,
      ,
    ]);
  ;

  return (
    <ScrollView style={styles.container>
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]
        style={styles.header
      >
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim ],
          
        >
          <View testID="profile-avatar" style={styles.avatar>
            <Text style={styles.avatarText>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'
            </Text>
          </View>
          <Text style={styles.name>{user?.displayName || 'User'</Text>
          <Text style={styles.email>{user?.email</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.statsCard>
        <Animated.View 
          style={[
            styles.statItem,
            {
              opacity: statsAnims[0],
              transform: [{ scale: statsAnims[0] ],
            ,
          ]
        >
          <Text style={styles.statValue>{trips.length</Text>
          <Text style={styles.statLabel>{t.myTrips</Text>
        </Animated.View>
        <View style={styles.statDivider />
        <Animated.View 
          style={[
            styles.statItem,
            {
              opacity: statsAnims[1],
              transform: [{ scale: statsAnims[1] ],
            ,
          ]
        >
          <Text style={styles.statValue>{0</Text>
          <Text style={styles.statLabel>{t.countries</Text>
        </Animated.View>
        <View style={styles.statDivider />
        <Animated.View 
          style={[
            styles.statItem,
            {
              opacity: statsAnims[2],
              transform: [{ scale: statsAnims[2] ],
            ,
          ]
        >
          <Text style={styles.statValue>{0</Text>
          <Text style={styles.statLabel>{t.cities</Text>
        </Animated.View>
      </View>

      <View style={styles.section>
        {/* Language Selector */
        <TouchableOpacity 
          style={styles.menuItem
          onPress={() => setShowLanguages(!showLanguages)
        >
          <View style={styles.menuLeft>
            <Text style={styles.menuIcon>🌍</Text>
            <Text style={styles.menuText>{t.language</Text>
          </View>
          <View style={styles.menuRight>
            <Text style={styles.languageLabel>
              {languages.find(l => l.code === language)?.name
            </Text>
            <Text style={styles.menuArrow>›</Text>
          </View>
        </TouchableOpacity>

        {showLanguages && (
          <View style={styles.languageList>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemActive,
                ]
                onPress={() => {
                  changeLanguage(lang.code);
                  setShowLanguages(false);
                
              >
                <Text style={styles.languageFlag>{lang.flag</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.languageNameActive,
                ]>
                  {lang.name
                </Text>
                {language === lang.code && (
                  <Text style={styles.checkmark>✓</Text>
                )
              </TouchableOpacity>
            ))
          </View>
        )

        <TouchableOpacity style={styles.menuItem>
          <View style={styles.menuLeft>
            <Text style={styles.menuIcon>⚙️</Text>
            <Text style={styles.menuText>{t.accountSettings</Text>
          </View>
          <Text style={styles.menuArrow>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem
          onPress={() => navigation.navigate('NotificationSettings' as never)
        >
          <View style={styles.menuLeft>
            <Text style={styles.menuIcon>🔔</Text>
            <Text style={styles.menuText>{t.notifications</Text>
          </View>
          <Text style={styles.menuArrow>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem>
          <View style={styles.menuLeft>
            <Text style={styles.menuIcon>🔒</Text>
            <Text style={styles.menuText>{t.privacySecurity</Text>
          </View>
          <Text style={styles.menuArrow>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem>
          <View style={styles.menuLeft>
            <Text style={styles.menuIcon>❓</Text>
            <Text style={styles.menuText>{t.helpSupport</Text>
          </View>
          <Text style={styles.menuArrow>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout>
        <LinearGradient
          colors={[colors.error, '#C0392B']
          style={styles.logoutButton
          start={{ x: 0, y: 0 
          end={{ x: 1, y: 0 
        >
          <Text style={styles.logoutText>{t.logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  ,
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  ,
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  ,
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  ,
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  ,
  email: {
    fontSize: 16,
    color: '#666',
  ,
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    justifyContent: 'space-around',
  ,
  statItem: {
    alignItems: 'center',
  ,
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  ,
  statLabel: {
    fontSize: 14,
    color: '#666',
  ,
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  ,
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
  ,
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  ,
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  ,
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  ,
  menuText: {
    fontSize: 16,
    color: '#333',
  ,
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  ,
  languageLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  ,
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  ,
  languageList: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  ,
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  ,
  languageItemActive: {
    backgroundColor: colors.primary,
  ,
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  ,
  languageName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  ,
  languageNameActive: {
    color: '#fff',
    fontWeight: '600',
  ,
  checkmark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  ,
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  ,
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  ,
);
