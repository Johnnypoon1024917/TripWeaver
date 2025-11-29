import { createSlice, PayloadAction  from '@reduxjs/toolkit';

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  categoryId: string;


export interface PackingCategory {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];


export interface TripPackingList {
  tripId: string;
  categories: PackingCategory[];


interface PackingState {
  packingLists: TripPackingList[];


const initialState: PackingState = {
  packingLists: [],
;

const packingSlice = createSlice({
  name: 'packing',
  initialState,
  reducers: {
    setPackingList: (state, action: PayloadAction<TripPackingList>) => {
      const index = state.packingLists.findIndex(p => p.tripId === action.payload.tripId);
      if (index >= 0) {
        state.packingLists[index] = action.payload;
      
        state.packingLists.push(action.payload);
      
    ,
    
    addCategory: (state, action: PayloadAction<{ tripId: string; category: PackingCategory >) => {
      const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
      if (list) {
        list.categories.push(action.payload.category);
      
        state.packingLists.push({
          tripId: action.payload.tripId,
          categories: [action.payload.category],
        );
      
    ,
    
    removeCategory: (state, action: PayloadAction<{ tripId: string; categoryId: string >) => {
      const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
      if (list) {
        list.categories = list.categories.filter(c => c.id !== action.payload.categoryId);
      
    ,
    
    addItem: (state, action: PayloadAction<{ tripId: string; categoryId: string; item: PackingItem >) => {
      const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
      if (list) {
        const category = list.categories.find(c => c.id === action.payload.categoryId);
        if (category) {
          category.items.push(action.payload.item);
        
      
    ,
    
    removeItem: (state, action: PayloadAction<{ tripId: string; categoryId: string; itemId: string >) => {
      const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
      if (list) {
        const category = list.categories.find(c => c.id === action.payload.categoryId);
        if (category) {
          category.items = category.items.filter(i => i.id !== action.payload.itemId);
        
      
    ,
    
    toggleItem: (state, action: PayloadAction<{ tripId: string; categoryId: string; itemId: string >) => {
      const list = state.packingLists.find(p => p.tripId === action.payload.tripId);
      if (list) {
        const category = list.categories.find(c => c.id === action.payload.categoryId);
        if (category) {
          const item = category.items.find(i => i.id === action.payload.itemId);
          if (item) {
            item.checked = !item.checked;
          
        
      
    ,
    
    clearPackingList: (state, action: PayloadAction<string>) => {
      state.packingLists = state.packingLists.filter(p => p.tripId !== action.payload);
    ,
  ,
);

export const {
  setPackingList,
  addCategory,
  removeCategory,
  addItem,
  removeItem,
  toggleItem,
  clearPackingList,
 = packingSlice.actions;

export default packingSlice.reducer;
