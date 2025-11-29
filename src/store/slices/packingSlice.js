import { createSlice  from '@reduxjs/toolkit';
const initialState = {
    packingLists: [],
;
const packingSlice = createSlice({
    name: 'packing',
    initialState,
    reducers: {
        setPackingList: (state, action) => {
            const index = state.packingLists.findIndex(p => p.tripId === action.payload.tripId);
            if (index >= 0) {
                state.packingLists[index] = action.payload;
            
            else {
                state.packingLists.push(action.payload);
            
        ,
        addCategory: (state, action) => {
            const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
            if (list) {
                list.categories.push(action.payload.category);
            
            else {
                state.packingLists.push({
                    tripId: action.payload.tripId,
                    categories: [action.payload.category],
                );
            
        ,
        removeCategory: (state, action) => {
            const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
            if (list) {
                list.categories = list.categories.filter(c => c.id !== action.payload.categoryId);
            
        ,
        addItem: (state, action) => {
            const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
            if (list) {
                const category = list.categories.find(c => c.id === action.payload.categoryId);
                if (category) {
                    category.items.push(action.payload.item);
                
            
        ,
        removeItem: (state, action) => {
            const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
            if (list) {
                const category = list.categories.find(c => c.id === action.payload.categoryId);
                if (category) {
                    category.items = category.items.filter(i => i.id !== action.payload.itemId);
                
            
        ,
        toggleItem: (state, action) => {
            const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
            if (list) {
                const category = list.categories.find(c => c.id === action.payload.categoryId);
                if (category) {
                    const item = category.items.find(i => i.id === action.payload.itemId);
                    if (item) {
                        item.checked = !item.checked;
                    
                
            
        ,
        clearPackingList: (state, action) => {
            state.packingLists = state.packingLists.filter(p => p.tripId !== action.payload);
        ,
    ,
);
export const { setPackingList, addCategory, removeCategory, addItem, removeItem, toggleItem, clearPackingList,  = packingSlice.actions;
export default packingSlice.reducer;
