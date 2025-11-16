import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { loadOneTimeExpenses, saveOneTimeExpenses } from '../utils/storage';
import { Goal, OneTimeExpense } from '../types';

interface GoalDetailScreenProps {
  navigation: any;
  route: {
    params: {
      goal: Goal;
    };
  };
}

export default function GoalDetailScreen({ navigation, route }: GoalDetailScreenProps) {
  const { goal } = route.params;
  const [relatedExpenses, setRelatedExpenses] = useState<OneTimeExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [showContributionInput, setShowContributionInput] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadRelatedExpenses();
    }, [])
  );

  const loadRelatedExpenses = async () => {
    try {
      const allExpenses = await loadOneTimeExpenses();
      // Filter expenses that match this goal name (case insensitive)
      const related = allExpenses.filter(e =>
        e.name.toLowerCase().includes(goal.name.toLowerCase()) ||
        goal.name.toLowerCase().includes(e.name.toLowerCase())
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

  const handleAddContribution = async () => {
    if (!contributionAmount.trim()) {
      Alert.alert('Error', 'Please enter a contribution amount');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newContribution: OneTimeExpense = {
      id: Date.now().toString(),
      name: `Goal: ${goal.name}`,
      amount: amount,
      date: new Date(),
      category: goal.category,
    };

    try {
      const allExpenses = await loadOneTimeExpenses();
      await saveOneTimeExpenses([...allExpenses, newContribution]);
      setContributionAmount('');
      setShowContributionInput(false);
      // Reload the contributions
      loadRelatedExpenses();
    } catch (error) {
      Alert.alert('Error', 'Failed to save contribution');
    }
  };

  const getTotalSaved = () => {
    return relatedExpenses.reduce((total, exp) => total + exp.amount, 0);
  };

  const getProgressPercentage = () => {
    const saved = getTotalSaved();
    return Math.min((saved / goal.targetAmount) * 100, 100);
  };

  const getNextContributionDate = () => {
    if (!goal.customNumber || !goal.customUnit) return null;

    let unitMs = 0;

    switch (goal.customUnit) {
      case 'days':
        unitMs = goal.customNumber * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        unitMs = goal.customNumber * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'months':
        unitMs = goal.customNumber * 30 * 24 * 60 * 60 * 1000; // approximate
        break;
      case 'years':
        unitMs = goal.customNumber * 365 * 24 * 60 * 60 * 1000; // approximate
        break;
    }

    // Find the last contribution date from related expenses
    if (relatedExpenses.length > 0) {
      const lastContribution = relatedExpenses
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      return new Date(lastContribution.date.getTime() + unitMs);
    } else {
      // If no contributions yet, use the start date
      return new Date(goal.startDate.getTime() + unitMs);
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

  const totalSaved = getTotalSaved();
  const progressPercent = getProgressPercentage();
  const nextContribution = getNextContributionDate();

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
            <Text style={typography.headingMedium}>{goal.name}</Text>
            <Text style={typography.bodySecondary}>
              Target: {formatCurrency(goal.targetAmount)} over {goal.customNumber} {goal.customUnit}
            </Text>
            <Text style={typography.bodySecondary}>
              Started: {formatDate(goal.startDate)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={typography.headingSmall}>Progress</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={[typography.bodyPrimary, { fontWeight: 'bold' as const }]}>
              {formatCurrency(totalSaved)} of {formatCurrency(goal.targetAmount)} saved
            </Text>
            <Text style={typography.bodySecondary}>
              {progressPercent.toFixed(1)}% complete
            </Text>
            {nextContribution && (
              <Text style={typography.bodySecondary}>
                Next contribution due: {formatDate(nextContribution)}
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.contributionHeader}>
              <Text style={typography.headingSmall}>Add Contribution</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowContributionInput(!showContributionInput)}
              >
                <Text style={styles.addButtonText}>{showContributionInput ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            </View>

            {showContributionInput && (
              <View style={styles.contributionInput}>
                <TextInput
                  style={styles.amountInput}
                  value={contributionAmount}
                  onChangeText={setContributionAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={colors.borders}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleAddContribution}>
                  <Text style={styles.saveButtonText}>Save Contribution</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={typography.headingSmall}>Contribution History</Text>
            {relatedExpenses.length > 0 ? (
              relatedExpenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((contribution) => (
                  <View key={contribution.id} style={styles.paymentRow}>
                    <Text style={typography.bodyPrimary}>{formatDate(contribution.date)}</Text>
                    <Text style={typography.bodySecondary}>{formatCurrency(contribution.amount)}</Text>
                  </View>
                ))
            ) : (
              <Text style={typography.bodySecondary}>No contributions recorded yet</Text>
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
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.small,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  contributionInput: {
    marginTop: spacing.sm,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    color: colors.primaryText,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: borderRadius.small,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});