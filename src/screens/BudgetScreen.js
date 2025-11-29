import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,  from 'react-native';
import { useSelector  from 'react-redux';
export default function BudgetScreen() {
    const budgets = useSelector((state) => state.budget.budgets);
    const expenses = useSelector((state) => state.budget.expenses);
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    return (<View style={styles.container>
      <View style={styles.header>
        <Text style={styles.headerTitle>Budget</Text>
      </View>

      <ScrollView style={styles.content>
        <View style={styles.summaryCard>
          <Text style={styles.summaryTitle>Trip Budget Summary</Text>
          
          <View style={styles.summaryRow>
            <Text style={styles.summaryLabel>Total Budget</Text>
            <Text style={styles.summaryValue>${totalBudget.toFixed(2)</Text>
          </View>
          
          <View style={styles.summaryRow>
            <Text style={styles.summaryLabel>Total Spent</Text>
            <Text style={[styles.summaryValue, styles.spentValue]>
              ${totalSpent.toFixed(2)
            </Text>
          </View>
          
          <View style={styles.summaryRow>
            <Text style={styles.summaryLabel>Remaining</Text>
            <Text style={[
            styles.summaryValue,
            remaining < 0 ? styles.overBudget : styles.remainingValue,
        ]>
              ${remaining.toFixed(2)
            </Text>
          </View>

          <View style={styles.progressBar>
            <View style={[
            styles.progressFill,
            {
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)%`,
                backgroundColor: totalSpent > totalBudget ? '#FF3B30' : '#007AFF',
            ,
        ]/>
          </View>
        </View>

        <View style={styles.section>
          <Text style={styles.sectionTitle>Budget by Category</Text>
          
          {budgets.length === 0 ? (<Text style={styles.emptyText>No budget categories yet</Text>) : (budgets.map((budget) => (<View key={budget.id style={styles.categoryCard>
                <View style={styles.categoryHeader>
                  <Text style={styles.categoryName>{budget.category</Text>
                  <Text style={styles.categoryAmount>
                    ${budget.spent.toFixed(2) / ${budget.amount.toFixed(2)
                  </Text>
                </View>
                <View style={styles.categoryProgressBar>
                  <View style={[
                styles.categoryProgressFill,
                {
                    width: `${Math.min((budget.spent / budget.amount) * 100, 100)%`,
                    backgroundColor: budget.spent > budget.amount ? '#FF3B30' : '#34C759',
                ,
            ]/>
                </View>
              </View>)))
        </View>

        <View style={styles.section>
          <Text style={styles.sectionTitle>Recent Expenses</Text>
          
          {expenses.length === 0 ? (<Text style={styles.emptyText>No expenses recorded</Text>) : (expenses.slice(0, 10).map((expense) => (<View key={expense.id style={styles.expenseCard>
                <View style={styles.expenseInfo>
                  <Text style={styles.expenseDescription>
                    {expense.description
                  </Text>
                  <Text style={styles.expenseCategory>{expense.category</Text>
                  <Text style={styles.expenseDate>
                    {expense.date.toLocaleDateString()
                  </Text>
                </View>
                <Text style={styles.expenseAmount>
                  ${expense.amount.toFixed(2)
                </Text>
              </View>)))
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab>
        <Text style={styles.fabText>+ Add Expense</Text>
      </TouchableOpacity>
    </View>);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    ,
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    ,
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    ,
    content: {
        flex: 1,
    ,
    summaryCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 12,
    ,
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    ,
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    ,
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    ,
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    ,
    spentValue: {
        color: '#FF9500',
    ,
    remainingValue: {
        color: '#34C759',
    ,
    overBudget: {
        color: '#FF3B30',
    ,
    progressBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginTop: 15,
        overflow: 'hidden',
    ,
    progressFill: {
        height: '100%',
        borderRadius: 4,
    ,
    section: {
        margin: 15,
    ,
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    ,
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    ,
    categoryCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    ,
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    ,
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    ,
    categoryAmount: {
        fontSize: 14,
        color: '#666',
    ,
    categoryProgressBar: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden',
    ,
    categoryProgressFill: {
        height: '100%',
        borderRadius: 3,
    ,
    expenseCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    ,
    expenseInfo: {
        flex: 1,
    ,
    expenseDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    ,
    expenseCategory: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
        marginBottom: 2,
    ,
    expenseDate: {
        fontSize: 12,
        color: '#999',
    ,
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    ,
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 ,
        shadowOpacity: 0.3,
        shadowRadius: 4,
    ,
    fabText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    ,
);
