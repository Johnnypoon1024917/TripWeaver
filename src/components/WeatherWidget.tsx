import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';

interface WeatherWidgetProps {
  location: string;
  date: Date;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, date }) => {
  // In a real app, this would fetch actual weather data
  const getWeatherIcon = () => '☀️';
  const getTemperature = () => '24°C';
  const getWeatherCondition = () => 'Sunny';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.date}>
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.weatherInfo}>
        <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{getTemperature()}</Text>
          <Text style={styles.condition}>{getWeatherCondition()}</Text>
        </View>
      </View>
      
      <View style={styles.forecast}>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastDay}>Tomorrow</Text>
          <Text style={styles.forecastIcon}>🌤️</Text>
          <Text style={styles.forecastTemp}>26°</Text>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastDay}>Wed</Text>
          <Text style={styles.forecastIcon}>🌧️</Text>
          <Text style={styles.forecastTemp}>22°</Text>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastDay}>Thu</Text>
          <Text style={styles.forecastIcon}>⛅</Text>
          <Text style={styles.forecastTemp}>23°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  location: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  condition: {
    ...typography.body,
    color: colors.textSecondary,
  },
  forecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDay: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  forecastTemp: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});

export default WeatherWidget;