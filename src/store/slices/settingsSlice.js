import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        setCurrency: (state, action) => {
            state.currency = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        updateSetting: (state, action) => {
            const { key, value } = action.payload;
            state[key] = value;
        },
    },
});
export const { setLanguage, setCurrency, setTheme, updateSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
