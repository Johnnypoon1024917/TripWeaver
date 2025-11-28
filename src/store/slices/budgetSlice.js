import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    budgets: [],
    expenses: [],
    loading: false,
    error: null,
};
const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    reducers: {
        setBudgets: (state, action) => {
            state.budgets = action.payload;
            state.loading = false;
        },
        addBudget: (state, action) => {
            state.budgets.push(action.payload);
        },
        updateBudget: (state, action) => {
            const index = state.budgets.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.budgets[index] = action.payload;
            }
        },
        deleteBudget: (state, action) => {
            state.budgets = state.budgets.filter(b => b.id !== action.payload);
        },
        setExpenses: (state, action) => {
            state.expenses = action.payload;
        },
        addExpense: (state, action) => {
            state.expenses.push(action.payload);
            const budget = state.budgets.find(b => b.id === action.payload.budgetId);
            if (budget) {
                budget.spent += action.payload.amount;
            }
        },
        updateExpense: (state, action) => {
            const index = state.expenses.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                const oldExpense = state.expenses[index];
                const budget = state.budgets.find(b => b.id === oldExpense.budgetId);
                if (budget) {
                    budget.spent -= oldExpense.amount;
                    budget.spent += action.payload.amount;
                }
                state.expenses[index] = action.payload;
            }
        },
        deleteExpense: (state, action) => {
            const expense = state.expenses.find(e => e.id === action.payload);
            if (expense) {
                const budget = state.budgets.find(b => b.id === expense.budgetId);
                if (budget) {
                    budget.spent -= expense.amount;
                }
                state.expenses = state.expenses.filter(e => e.id !== action.payload);
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { setBudgets, addBudget, updateBudget, deleteBudget, setExpenses, addExpense, updateExpense, deleteExpense, setLoading, setError, } = budgetSlice.actions;
export default budgetSlice.reducer;
