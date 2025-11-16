import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { loadPaychecks, loadRecurringExpenses, loadOneTimeExpenses, loadGoals } from '../utils/storage';
import { getBudgetStatus } from '../utils/budget';
import { RecurringExpense, Goal, BudgetPeriod } from '../types';

export default function DashboardScreen({ navigation }: any) {
  const [budgetStatus, setBudgetStatus] = useState<BudgetPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [paychecks, recurring, expenses, goals] = await Promise.all([
        loadPaychecks(),
        loadRecurringExpenses(),
        loadOneTimeExpenses(),
        loadGoals(),
      ]);
      const status = getBudgetStatus(paychecks, recurring, expenses, goals);
      setBudgetStatus(status);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getCustomDisplay = (item: RecurringExpense | Goal, paycheckFrequency: string) => {
    const amount = 'amount' in item ? item.amount : item.targetAmount;
    if (!item.customNumber || !item.customUnit) {
      return `${formatCurrency(amount)}/${item.customNumber || 0} ${item.customUnit || 'custom'}`;
    }

    // Calculate what this custom item amounts to for the paycheck frequency
    const ratePerUnit = amount / item.customNumber;
    let displayAmount = 0;
    let displayUnit = paycheckFrequency;

    switch (paycheckFrequency) {
      case 'weekly':
        switch (item.customUnit) {
          case 'days':
            displayAmount = ratePerUnit * 7;
            break;
          case 'weeks':
            displayAmount = ratePerUnit;
            break;
          case 'months':
            displayAmount = ratePerUnit / 4.333;
            break;
          case 'years':
            displayAmount = ratePerUnit / 52;
            break;
        }
        break;
      case 'biweekly':
        switch (item.customUnit) {
          case 'days':
            displayAmount = ratePerUnit * 14;
            break;
          case 'weeks':
            displayAmount = ratePerUnit * 2;
            break;
          case 'months':
            displayAmount = ratePerUnit / 2.167;
            break;
          case 'years':
            displayAmount = ratePerUnit / 26;
            break;
        }
        break;
      case 'monthly':
        switch (item.customUnit) {
          case 'days':
            displayAmount = ratePerUnit * 30;
            break;
          case 'weeks':
            displayAmount = ratePerUnit * 4.333;
            break;
          case 'months':
            displayAmount = ratePerUnit;
            break;
          case 'years':
            displayAmount = ratePerUnit / 12;
            break;
        }
        break;
      default:
        return `${formatCurrency(amount)}/${item.customNumber} ${item.customUnit}`;
    }

    return `${formatCurrency(displayAmount)}/${displayUnit}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <Text style={styles.settingsText}>⚙</Text>
        </TouchableOpacity>
      </View>
        <View style={styles.content}>
          <Text style={typography.bodyPrimary}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={typography.headingLarge}></Text>

        </View>
        <View style={styles.content}>
          {budgetStatus ? (
            <>
              <View style={styles.card}>
                <Text style={typography.headingMedium}>Current Period</Text>
                <Text style={typography.bodySecondary}>
                  {formatDate(budgetStatus.startDate)} - {formatDate(budgetStatus.endDate)}
                </Text>
                <View style={styles.budgetRow}>
                  <Text style={typography.bodyPrimary}>Total Budget:</Text>
                  <Text style={typography.bodyPrimary}>{formatCurrency(budgetStatus.totalBudget)}</Text>
                </View>
                 <View style={styles.budgetRow}>
                   <Text style={typography.bodySecondary}>Recurring:</Text>
                   <Text style={typography.bodySecondary}>{formatCurrency(budgetStatus.recurringTotal)}</Text>
                 </View>
                 <View style={styles.budgetRow}>
                   <Text style={typography.bodySecondary}>Goals:</Text>
                   <Text style={typography.bodySecondary}>{formatCurrency(budgetStatus.goalsTotal)}</Text>
                 </View>
                 <View style={styles.budgetRow}>
                   <Text style={typography.bodySecondary}>Spent:</Text>
                   <Text style={typography.bodySecondary}>{formatCurrency(budgetStatus.spent)}</Text>
                 </View>
                 <View style={styles.budgetRow}>
                   <Text style={[typography.bodyPrimary, { fontWeight: 'bold' as const }]}>Remaining:</Text>
                   <Text style={[typography.bodyPrimary, { fontWeight: 'bold' as const }]}>
                     {formatCurrency(budgetStatus.remaining)}
                   </Text>
                 </View>
               </View>

              <View style={styles.card}>
                <Text style={typography.headingSmall}>Goals</Text>
                {budgetStatus.goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.expenseRow}
                    onPress={() => navigation.navigate('GoalDetail', { goal })}
                  >
                    <Text style={typography.bodyPrimary}>{goal.name}</Text>
                    <Text style={typography.bodySecondary}>
                      {goal.frequency === 'custom'
                        ? getCustomDisplay(goal, budgetStatus.paycheckFrequency)
                        : `${formatCurrency(goal.targetAmount)}/${goal.frequency}`
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
                {budgetStatus.goals.length === 0 && (
                  <Text style={typography.bodySecondary}>No goals set</Text>
                )}
              </View>

              <View style={styles.card}>
                <Text style={typography.headingSmall}>Recurring Expenses</Text>
                {budgetStatus.recurringExpenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    style={styles.expenseRow}
                    onPress={() => expense.frequency === 'custom' && navigation.navigate('CustomExpenseDetail', { expense })}
                  >
                    <Text style={typography.bodyPrimary}>{expense.name}</Text>
                    <Text style={typography.bodySecondary}>
                      {expense.frequency === 'custom'
                        ? getCustomDisplay(expense, budgetStatus.paycheckFrequency)
                        : `${formatCurrency(expense.amount)}/${expense.frequency}`
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
               {budgetStatus.recurringExpenses.length === 0 && (
                 <Text style={typography.bodySecondary}>No recurring expenses</Text>
               )}
              </View>

             <View style={styles.card}>
               <Text style={typography.headingSmall}>Recent Expenses</Text>
               {budgetStatus.expenses
                 .sort((a, b) => b.date.getTime() - a.date.getTime())
                 .slice(0, 5)
                 .map((expense) => (
                   <View key={expense.id} style={styles.expenseRow}>
                     <Text style={typography.bodyPrimary}>{expense.name}</Text>
                     <Text style={typography.bodySecondary}>{formatCurrency(expense.amount)}</Text>
                   </View>
                 ))}
              {budgetStatus.expenses.length === 0 && (
                <Text style={typography.bodySecondary}>No expenses yet</Text>
              )}
            </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={typography.headingMedium}>No Paycheck Set</Text>
              <Text style={typography.bodyPrimary}>Add your first paycheck to get started.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button Menu */}
      {menuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('AddPaycheck');
            }}
          >
            <Text style={styles.menuItemText}>Add Paycheck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('AddExpense');
            }}
          >
            <Text style={styles.menuItemText}>Add Expense</Text>
          </TouchableOpacity>
           <TouchableOpacity
             style={styles.menuItem}
             onPress={() => {
               setMenuOpen(false);
               navigation.navigate('AddRecurring');
             }}
           >
             <Text style={styles.menuItemText}>Add Recurring</Text>
           </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('AddGoal');
              }}
            >
              <Text style={styles.menuItemText}>Add Goal</Text>
            </TouchableOpacity>
           <TouchableOpacity
             style={styles.menuItem}
             onPress={() => {
               setMenuOpen(false);
               navigation.navigate('ExpenseList');
             }}
           >
             <Text style={styles.menuItemText}>View Expenses</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={styles.menuItem}
             onPress={() => {
               setMenuOpen(false);
               navigation.navigate('Settings');
             }}
           >
             <Text style={styles.menuItemText}>Settings</Text>
           </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Text style={styles.fabText}>{menuOpen ? '×' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
  settingsButton: {
    marginTop: spacing.md,
  },
  settingsText: {
    fontSize: 24,
    color: colors.primaryText,
  },
  content: {
    padding: spacing.screenPadding,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },

  fab: {
    position: 'absolute',
    right: Dimensions.get('window').width * 0.05,
    bottom: Dimensions.get('window').height * 0.05,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    right: Dimensions.get('window').width * 0.05,
    bottom: Dimensions.get('window').height * 0.05 + 70,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.sm,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
  },
  menuItemText: {
    color: colors.primaryText,
    fontSize: typography.normal,
  },
});
