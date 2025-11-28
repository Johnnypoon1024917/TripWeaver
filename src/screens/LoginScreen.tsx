import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setGuestMode } from '../store/slices/authSlice';
import { User } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { authAPI } from '../services/api';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
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
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(setLoading(true));
    
    try {
      const response = await authAPI.login(email, password);
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName,
        photoURL: response.user.photoURL,
        createdAt: new Date(response.user.createdAt),
      };
      
      dispatch(setUser(user));
    } catch (error: any) {
      dispatch(setLoading(false));
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    }
  };

  const handleGuestMode = () => {
    dispatch(setGuestMode());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>✈️ TripWeaver</Text>
          <Text style={styles.subtitle}>{t.createAccount}</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Animated.View 
          style={[
            styles.form,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>{t.welcomeBack}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              testID="login-email-input"
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.password}</Text>
            <TextInput
              testID="login-password-input"
              style={styles.input}
              placeholder={t.enterPassword}
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="login-button" onPress={handleLogin}>
            <LinearGradient
              colors={[colors.primary, colors.gradientEnd]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>{t.login}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity testID="guest-mode-button" onPress={handleGuestMode}>
            <View style={styles.guestButton}>
              <Text style={styles.guestButtonText}>🚀 {t.continueAsGuest}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            testID="register-button"
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              {t.dontHaveAccount} <Text style={styles.linkTextBold}>{t.register}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    height: 280,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    marginTop: -40,
  },
  form: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flex: 1,
    ...shadows.lg,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.md,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textLight,
    marginHorizontal: spacing.md,
  },
  linkButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  guestButton: {
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  guestButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
