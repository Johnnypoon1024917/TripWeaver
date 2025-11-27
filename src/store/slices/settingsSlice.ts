import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../i18n/translations';

interface SettingsState {
  language: Language;
  currency: string;
  theme: 'light' | 'dark';
  notificationsEnabled?: boolean;
  tripRemindersEnabled?: boolean;
  budgetAlertsEnabled?: boolean;
  collaborationNotificationsEnabled?: boolean;
  weatherAlertsEnabled?: boolean;
  quietHoursEnabled?: boolean;
}

const initialState: SettingsState = {
  language: 'en',
  currency: 'USD',
  theme: 'light',
  notificationsEnabled: true,
  tripRemindersEnabled: true,
  budgetAlertsEnabled: true,
  collaborationNotificationsEnabled: true,
  weatherAlertsEnabled: true,
  quietHoursEnabled: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    updateSetting: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      (state as any)[key] = value;
    },
  },
});

export const { setLanguage, setCurrency, setTheme, updateSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
