import { createSlice, PayloadAction  from '@reduxjs/toolkit';
import { Budget, Expense  from '../../types';

interface BudgetState {
  budgets: Budget[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;


const initialState: BudgetState = {
  budgets: [],
  expenses: [],
  loading: false,
  error: null,
;

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.loading = false;
    ,
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    ,
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      
    ,
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(b => b.id !== action.payload);
    ,
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    ,
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
      const budget = state.budgets.find(b => b.id === action.payload.budgetId);
      if (budget) {
        budget.spent += action.payload.amount;
      
    ,
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        const oldExpense = state.expenses[index];
        const budget = state.budgets.find(b => b.id === oldExpense.budgetId);
        if (budget) {
          budget.spent -= oldExpense.amount;
          budget.spent += action.payload.amount;
        
        state.expenses[index] = action.payload;
      
    ,
    deleteExpense: (state, action: PayloadAction<string>) => {
      const expense = state.expenses.find(e => e.id === action.payload);
      if (expense) {
        const budget = state.budgets.find(b => b.id === expense.budgetId);
        if (budget) {
          budget.spent -= expense.amount;
        
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      
    ,
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    ,
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    ,
  ,
);

export const {
  setBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setLoading,
  setError,
 = budgetSlice.actions;

export default budgetSlice.reducer;
