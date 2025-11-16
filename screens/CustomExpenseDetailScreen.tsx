import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { loadOneTimeExpenses } from '../utils/storage';
import { RecurringExpense, OneTimeExpense } from '../types';

interface CustomExpenseDetailScreenProps {
  navigation: any;
  route: {
    params: {
      expense: RecurringExpense;
    };
  };
}

export default function CustomExpenseDetailScreen({ navigation, route }: CustomExpenseDetailScreenProps) {
  const { expense } = route.params;
  const [relatedExpenses, setRelatedExpenses] = useState<OneTimeExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadRelatedExpenses();
    }, [])
  );

  const loadRelatedExpenses = async () => {
    try {
      const allExpenses = await loadOneTimeExpenses();
      // Filter expenses that match this recurring expense name (case insensitive)
      const related = allExpenses.filter(e =>
        e.name.toLowerCase().includes(expense.name.toLowerCase()) ||
        expense.name.toLowerCase().includes(e.name.toLowerCase())
      );
      setRelatedExpenses(related);
    } catch (error) {
      console.error('Error loading related expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getTotalPaid = () => {
    return relatedExpenses.reduce((total, exp) => total + exp.amount, 0);
  };

  const getProgressPercentage = () => {
    const paid = getTotalPaid();
    return Math.min((paid / expense.amount) * 100, 100);
  };

  const getNextPaymentDate = () => {
    if (!expense.customNumber || !expense.customUnit) return null;

    let unitMs = 0;

    switch (expense.customUnit) {
      case 'days':
        unitMs = expense.customNumber * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        unitMs = expense.customNumber * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'months':
        unitMs = expense.customNumber * 30 * 24 * 60 * 60 * 1000; // approximate
        break;
      case 'years':
        unitMs = expense.customNumber * 365 * 24 * 60 * 60 * 1000; // approximate
        break;
    }

    // Find the last payment date from related expenses
    if (relatedExpenses.length > 0) {
      const lastPayment = relatedExpenses
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      return new Date(lastPayment.date.getTime() + unitMs);
    } else {
      // If no payments yet, use the start date
      return new Date(expense.startDate.getTime() + unitMs);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={typography.bodyPrimary}>Loading...</Text>
        </View>
      </View>
    );
  }

  const totalPaid = getTotalPaid();
  const progressPercent = getProgressPercentage();
  const nextPayment = getNextPaymentDate();

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={typography.headingMedium}>{expense.name}</Text>
            <Text style={typography.bodySecondary}>
              {formatCurrency(expense.amount)} every {expense.customNumber} {expense.customUnit}
            </Text>
            <Text style={typography.bodySecondary}>
              Started: {formatDate(expense.startDate)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={typography.headingSmall}>Progress</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={[typography.bodyPrimary, { fontWeight: 'bold' }]}>
              {formatCurrency(totalPaid)} of {formatCurrency(expense.amount)} paid
            </Text>
            <Text style={typography.bodySecondary}>
              {progressPercent.toFixed(1)}% complete
            </Text>
            {nextPayment && (
              <Text style={typography.bodySecondary}>
                Next payment due: {formatDate(nextPayment)}
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={typography.headingSmall}>Payment History</Text>
            {relatedExpenses.length > 0 ? (
              relatedExpenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((payment) => (
                  <View key={payment.id} style={styles.paymentRow}>
                    <Text style={typography.bodyPrimary}>{formatDate(payment.date)}</Text>
                    <Text style={typography.bodySecondary}>{formatCurrency(payment.amount)}</Text>
                  </View>
                ))
            ) : (
              <Text style={typography.bodySecondary}>No payments recorded yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
  backButton: {
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: 16,
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
  progressContainer: {
    height: 20,
    backgroundColor: colors.borders,
    borderRadius: borderRadius.small,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.small,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders,
  },
});