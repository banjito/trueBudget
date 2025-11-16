import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { loadOneTimeExpenses, loadPaychecks } from '../utils/storage';
import { OneTimeExpense, Paycheck } from '../types';

type PeriodType = 'all' | 'paycheck' | 'month' | 'week' | 'day';

export default function ExpenseListScreen({ navigation }: any) {
  const [expenses, setExpenses] = useState<OneTimeExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<OneTimeExpense[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, periodType, paychecks]);

  const loadData = async () => {
    try {
      const [expenseData, paycheckData] = await Promise.all([
        loadOneTimeExpenses(),
        loadPaychecks(),
      ]);
      setExpenses(expenseData);
      setPaychecks(paycheckData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    switch (periodType) {
      case 'paycheck':
        if (paychecks.length > 0) {
          const latestPaycheck = paychecks.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
          const periodEnd = new Date(latestPaycheck.date);
          switch (latestPaycheck.frequency) {
            case 'weekly':
              periodEnd.setDate(periodEnd.getDate() + 7);
              break;
            case 'biweekly':
              periodEnd.setDate(periodEnd.getDate() + 14);
              break;
            case 'semimonthly':
              periodEnd.setDate(periodEnd.getDate() + 15);
              break;
            case 'monthly':
              periodEnd.setDate(periodEnd.getDate() + 30);
              break;
          }
          filtered = expenses.filter(e => e.date >= latestPaycheck.date && e.date <= periodEnd);
        }
        break;
      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);
        filtered = expenses.filter(e => e.date >= monthStart && e.date <= monthEnd);
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        filtered = expenses.filter(e => e.date >= weekStart && e.date <= weekEnd);
        break;
      case 'day':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = expenses.filter(e => e.date >= today && e.date < tomorrow);
        break;
      default:
        // all
        break;
    }

    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    setFilteredExpenses(filtered);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const renderExpense = ({ item }: { item: OneTimeExpense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={typography.bodyPrimary}>{item.name}</Text>
        <Text style={typography.bodySecondary}>{item.category}</Text>
        <Text style={typography.caption}>{formatDate(item.date)}</Text>
      </View>
      <Text style={typography.bodyPrimary}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.headingMedium}>Expenses</Text>
        <Text style={typography.bodySecondary}>Total: {formatCurrency(totalSpent)}</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'paycheck', 'month', 'week', 'day'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, periodType === type && styles.filterButtonActive]}
            onPress={() => setPeriodType(type)}
          >
            <Text style={[styles.filterText, periodType === type && styles.filterTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={typography.bodySecondary}>No expenses found for this period</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
  filterButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
  filterTextActive: {
    color: colors.background,
  },
  listContainer: {
    padding: spacing.screenPadding,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  expenseInfo: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});