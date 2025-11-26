import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../i18n/translations';

interface SettingsState {
  language: Language;
  currency: string;
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  language: 'en',
  currency: 'USD',
  theme: 'light',
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
  },
});

export const { setLanguage, setCurrency, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
