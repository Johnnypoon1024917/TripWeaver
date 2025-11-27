import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateSetting } from '../store/slices/settingsSlice';

const NotificationSettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled ?? true);
  const [tripReminders, setTripReminders] = useState(settings.tripRemindersEnabled ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(settings.budgetAlertsEnabled ?? true);
  const [collaborationNotifications, setCollaborationNotifications] = useState(settings.collaborationNotificationsEnabled ?? true);
  const [weatherAlerts, setWeatherAlerts] = useState(settings.weatherAlertsEnabled ?? true);

  const toggleSetting = (setting: string, value: boolean) => {
    dispatch(updateSetting({ key: setting, value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <Text style={styles.sectionDescription}>
            Customize which notifications you receive from TripWeaver
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Turn on/off all notifications from TripWeaver
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              toggleSetting('notificationsEnabled', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Trip Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified before your trips start
            </Text>
          </View>
          <Switch
            value={tripReminders}
            onValueChange={(value) => {
              setTripReminders(value);
              toggleSetting('tripRemindersEnabled', value);
            }}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={tripReminders ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Budget Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified when you're approaching budget limits
            </Text>
          </View>
          <Switch
            value={budgetAlerts}
            onValueChange={(value) => {
              setBudgetAlerts(value);
              toggleSetting('budgetAlertsEnabled', value);
            }}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={budgetAlerts ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Collaboration Updates</Text>
            <Text style={styles.settingDescription}>
              Get notified about changes from trip collaborators
            </Text>
          </View>
          <Switch
            value={collaborationNotifications}
            onValueChange={(value) => {
              setCollaborationNotifications(value);
              toggleSetting('collaborationNotificationsEnabled', value);
            }}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={collaborationNotifications ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Weather Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified about severe weather conditions for your trips
            </Text>
          </View>
          <Switch
            value={weatherAlerts}
            onValueChange={(value) => {
              setWeatherAlerts(value);
              toggleSetting('weatherAlertsEnabled', value);
            }}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={weatherAlerts ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Timing</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Quiet Hours</Text>
            <Text style={styles.settingDescription}>
              Disable notifications between 10 PM and 7 AM
            </Text>
          </View>
          <Switch
            value={settings.quietHoursEnabled ?? false}
            onValueChange={(value) => {
              toggleSetting('quietHoursEnabled', value);
            }}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={(settings.quietHoursEnabled ?? false) ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Note: You can still receive critical notifications even during quiet hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  infoSection: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

export default NotificationSettingsScreen;