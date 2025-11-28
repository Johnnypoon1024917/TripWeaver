import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addExpense, addBudget } from '../store/slices/budgetSlice';
import { Expense, SplitDetail, Budget } from '../types';
import { colors, spacing, typography, shadows } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart } from 'react-native-svg-charts';
import { Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

// Define navigation and route types
type EnhancedBudgetScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TripDetail'>;

type EnhancedBudgetScreenRouteProp = RouteProp<RootStackParamList, 'TripDetail'>;

interface EnhancedBudgetScreenProps {
  navigation?: EnhancedBudgetScreenNavigationProp;
  route?: EnhancedBudgetScreenRouteProp;
}

export default function EnhancedBudgetScreen({ navigation, route }: EnhancedBudgetScreenProps) {
  const dispatch = useDispatch();
  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const expenses = useSelector((state: RootState) => state.budget.expenses);
  const collaborators = useSelector((state: RootState) => state.trips.selectedTrip?.collaborators || []);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    budgetId: budgets[0]?.id || '',
    paidBy: currentUser?.id || '',
    splitType: 'even' as 'even' | 'percentage' | 'exact' | 'shares',
  });
  const [splitDetails, setSplitDetails] = useState<Record<string, { amount: string; percentage: string; shares: string }>>({});
  const [newBudget, setNewBudget] = useState({
    category: 'accommodation' as 'accommodation' | 'food' | 'transportation' | 'activities' | 'shopping' | 'other',
    amount: '',
    currency: 'USD',
  });

  const totalBudget = budgets.reduce((sum: number, b: Budget) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum: number, b: Budget) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  // Initialize split details when collaborators change
  React.useEffect(() => {
    const initialSplitDetails: Record<string, { amount: string; percentage: string; shares: string }> = {};
    collaborators.forEach(userId => {
      initialSplitDetails[userId] = { amount: '', percentage: '0', shares: '1' };
    });
    setSplitDetails(initialSplitDetails);
  }, [collaborators]);

  const calculateSplitAmounts = (): SplitDetail[] => {
    const amount = parseFloat(newExpense.amount) || 0;
    const splitDetailsArray: SplitDetail[] = [];

    switch (newExpense.splitType) {
      case 'even':
        const evenAmount = amount / collaborators.length;
        collaborators.forEach(userId => {
          splitDetailsArray.push({
            userId,
            amount: evenAmount,
          });
        });
        break;

      case 'percentage':
        collaborators.forEach(userId => {
          const percentage = parseFloat(splitDetails[userId]?.percentage) || 0;
          const userAmount = (amount * percentage) / 100;
          splitDetailsArray.push({
            userId,
            amount: userAmount,
            percentage,
          });
        });
        break;

      case 'exact':
        collaborators.forEach(userId => {
          const userAmount = parseFloat(splitDetails[userId]?.amount) || 0;
          splitDetailsArray.push({
            userId,
            amount: userAmount,
          });
        });
        break;

      case 'shares':
        const totalShares = collaborators.reduce((sum, userId) => {
          return sum + (parseFloat(splitDetails[userId]?.shares) || 0);
        }, 0);
        
        collaborators.forEach(userId => {
          const shares = parseFloat(splitDetails[userId]?.shares) || 0;
          const userAmount = totalShares > 0 ? (amount * shares) / totalShares : 0;
          splitDetailsArray.push({
            userId,
            amount: userAmount,
            shares,
          });
        });
        break;
    }

    return splitDetailsArray;
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.budgetId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const splitDetailsArray = calculateSplitAmounts();

    const expense: Expense = {
      id: Date.now().toString(),
      tripId: 'current_trip_id', // This should be the actual trip ID
      budgetId: newExpense.budgetId,
      category: budgets.find(b => b.id === newExpense.budgetId)?.category || 'other',
      amount,
      currency: 'USD',
      description: newExpense.description,
      date: new Date(),
      paidBy: newExpense.paidBy,
      splitType: newExpense.splitType,
      splitDetails: splitDetailsArray,
    };

    dispatch(addExpense(expense));
    setShowAddExpenseModal(false);
    resetExpenseForm();
  };

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const budget = {
      id: Date.now().toString(),
      tripId: 'current_trip_id', // This should be the actual trip ID
      category: newBudget.category,
      amount,
      spent: 0,
      currency: newBudget.currency,
    };

    dispatch(addBudget(budget));
    setShowAddBudgetModal(false);
    resetBudgetForm();
  };

  const resetExpenseForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      budgetId: budgets[0]?.id || '',
      paidBy: currentUser?.id || '',
      splitType: 'even',
    });
  };

  const resetBudgetForm = () => {
    setNewBudget({
      category: 'accommodation',
      amount: '',
      currency: 'USD',
    });
  };

  const renderSplitDetails = () => {
    if (newExpense.splitType === 'even') {
      return (
        <Text style={styles.infoText}>
          Amount will be split equally among {collaborators.length} people
        </Text>
      );
    }

    return (
      <View style={styles.splitDetailsContainer}>
        <Text style={styles.sectionTitle}>Split Details</Text>
        {collaborators.map(userId => (
          <View key={userId} style={styles.splitDetailRow}>
            <Text style={styles.splitUserLabel}>User {userId.substring(0, 5)}...</Text>
            {newExpense.splitType === 'percentage' && (
              <TextInput
                style={styles.splitInput}
                placeholder="Percentage"
                value={splitDetails[userId]?.percentage}
                onChangeText={text => {
                  setSplitDetails({
                    ...splitDetails,
                    [userId]: { ...splitDetails[userId], percentage: text },
                  });
                }}
                keyboardType="numeric"
              />
            )}
            {newExpense.splitType === 'exact' && (
              <TextInput
                style={styles.splitInput}
                placeholder="Amount"
                value={splitDetails[userId]?.amount}
                onChangeText={text => {
                  setSplitDetails({
                    ...splitDetails,
                    [userId]: { ...splitDetails[userId], amount: text },
                  });
                }}
                keyboardType="numeric"
              />
            )}
            {newExpense.splitType === 'shares' && (
              <TextInput
                style={styles.splitInput}
                placeholder="Shares"
                value={splitDetails[userId]?.shares}
                onChangeText={text => {
                  setSplitDetails({
                    ...splitDetails,
                    [userId]: { ...splitDetails[userId], shares: text },
                  });
                }}
                keyboardType="numeric"
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Budget</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Budget Summary</Text>
          
          <View style={styles.chartsContainer}>
            <View style={styles.chartWrapper}>
              <Text style={styles.chartTitle}>Budget Distribution</Text>
              {budgets.length > 0 ? (
                <PieChart
                  style={styles.chart}
                  data={budgets.map((budget, index) => ({
                    key: budget.id,
                    value: budget.amount,
                    svg: {
                      fill: [
                        '#FF6B6B',
                        '#4ECDC4',
                        '#45B7D1',
                        '#96CEB4',
                        '#FFEAA7',
                        '#DDA0DD',
                        '#98D8C8',
                      ][index % 7],
                      onPress: () => console.log('press', index),
                    },
                    arc: { cornerRadius: 2 },
                  }))}
                  innerRadius={40}
                  outerRadius={80}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>No data</Text>
                </View>
              )}
            </View>
            
            <View style={styles.chartWrapper}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              {budgets.length > 0 ? (
                <BarChart
                  style={styles.chart}
                  data={budgets.map(budget => ({
                    value: budget.spent,
                    label: budget.category.substring(0, 3),
                  }))}
                  svg={{ fill: colors.primary }}
                  contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>No data</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>${totalBudget.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, styles.spentValue]}>
              ${totalSpent.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text
              style={[
                styles.summaryValue,
                remaining < 0 ? styles.overBudget : styles.remainingValue,
              ]}
            >
              ${remaining.toFixed(2)}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                  backgroundColor:
                    totalSpent > totalBudget ? '#FF3B30' : '#007AFF',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget by Category</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddBudgetModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {budgets.length === 0 ? (
            <Text style={styles.emptyText}>No budget categories yet</Text>
          ) : (
            budgets.map((budget) => (
              <View key={budget.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{budget.category}</Text>
                  <Text style={styles.categoryAmount}>
                    ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%`,
                        backgroundColor:
                          budget.spent > budget.amount ? '#FF3B30' : '#34C759',
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddExpenseModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses recorded</Text>
          ) : (
            expenses.slice(0, 10).map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                  <Text style={styles.expenseDate}>
                    {expense.date.toLocaleDateString()}
                  </Text>
                  <Text style={styles.paidByText}>
                    Paid by: {expense.paidBy === currentUser?.id ? 'You' : `User ${expense.paidBy.substring(0, 5)}...`}
                  </Text>
                  {expense.splitType !== 'even' && (
                    <Text style={styles.splitTypeText}>
                      Split: {expense.splitType}
                    </Text>
                  )}
                </View>
                <Text style={styles.expenseAmount}>
                  ${expense.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpenseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddExpenseModal(false);
                resetExpenseForm();
              }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="What was this expense for?"
                value={newExpense.description}
                onChangeText={text => setNewExpense({...newExpense, description: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={newExpense.amount}
                onChangeText={text => setNewExpense({...newExpense, amount: text})}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <Picker
                selectedValue={newExpense.budgetId}
                style={styles.picker}
                onValueChange={(value: string) => setNewExpense({...newExpense, budgetId: value})}
              >
                {budgets.map(budget => (
                  <Picker.Item 
                    key={budget.id} 
                    label={`${budget.category} ($${budget.spent.toFixed(2)}/${budget.amount.toFixed(2)})`} 
                    value={budget.id} 
                  />
                ))}
              </Picker>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Paid By</Text>
              <Picker
                selectedValue={newExpense.paidBy}
                style={styles.picker}
                onValueChange={(value: string) => setNewExpense({...newExpense, paidBy: value})}
              >
                <Picker.Item label="You" value={currentUser?.id || ''} />
                {collaborators.filter(id => id !== currentUser?.id).map(userId => (
                  <Picker.Item 
                    key={userId} 
                    label={`User ${userId.substring(0, 5)}...`} 
                    value={userId} 
                  />
                ))}
              </Picker>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Split Type</Text>
              <Picker
                selectedValue={newExpense.splitType}
                style={styles.picker}
                onValueChange={(value: string) => setNewExpense({...newExpense, splitType: value as any})}
              >
                <Picker.Item label="Split Evenly" value="even" />
                <Picker.Item label="By Percentage" value="percentage" />
                <Picker.Item label="By Exact Amount" value="exact" />
                <Picker.Item label="By Shares" value="shares" />
              </Picker>
            </View>
            
            {renderSplitDetails()}
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddExpense}
            >
              <Text style={styles.submitButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddBudgetModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Budget Category</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddBudgetModal(false);
                resetBudgetForm();
              }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <Picker
                selectedValue={newBudget.category}
                style={styles.picker}
                onValueChange={(value: string) => setNewBudget({...newBudget, category: value as any})}
              >
                <Picker.Item label="Accommodation" value="accommodation" />
                <Picker.Item label="Food" value="food" />
                <Picker.Item label="Transportation" value="transportation" />
                <Picker.Item label="Activities" value="activities" />
                <Picker.Item label="Shopping" value="shopping" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={newBudget.amount}
                onChangeText={text => setNewBudget({...newBudget, amount: text})}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Currency</Text>
              <TextInput
                style={styles.input}
                placeholder="USD"
                value={newBudget.currency}
                onChangeText={text => setNewBudget({...newBudget, currency: text})}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.submitButtonText}>Add Budget</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.surface,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.md,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  spentValue: {
    color: colors.warning,
  },
  remainingValue: {
    color: colors.success,
  },
  overBudget: {
    color: colors.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    margin: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  expenseCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  expenseDate: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  paidByText: {
    ...typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  splitTypeText: {
    ...typography.small,
    color: colors.secondary,
  },
  expenseAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  picker: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  splitDetailsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  splitDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  splitUserLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  splitInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    width: 100,
    textAlign: 'center',
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  submitButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  chartWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  chartTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chart: {
    height: 150,
    width: '100%',
  },
  emptyChart: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  emptyChartText: {
    ...typography.caption,
    color: colors.textLight,
  },
});