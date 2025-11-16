import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { saveRecurringExpenses, loadRecurringExpenses, loadSettings, saveSettings } from '../utils/storage';
import { RecurringExpense } from '../types';

export default function AddRecurringExpenseScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<RecurringExpense['frequency']>('monthly');
  const [customNumber, setCustomNumber] = useState('');
  const [customUnit, setCustomUnit] = useState<NonNullable<RecurringExpense['customUnit']>>('days');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<string[]>([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const settings = await loadSettings();
    setCategories(settings.categories);
  };

  const handleSubmit = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please enter amount and category');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (frequency === 'custom') {
      const num = parseInt(customNumber);
      if (isNaN(num) || num <= 0) {
        Alert.alert('Error', 'Please enter a valid custom number');
        return;
      }
    }

    const newExpense: RecurringExpense = {
      id: Date.now().toString(),
      name: name || 'Misc.',
      amount: expenseAmount,
      frequency,
      startDate: new Date(startDate),
      category,
      isActive: true,
      ...(frequency === 'custom' && {
        customNumber: parseInt(customNumber),
        customUnit,
      }),
    };

    try {
      const expenses = await loadRecurringExpenses();
      expenses.push(newExpense);
      await saveRecurringExpenses(expenses);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save recurring expense');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.headingMedium}>Add Recurring Expense</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Expense name (optional)"
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, category === cat && styles.categoryButtonSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => {
                Alert.prompt(
                  'Add Category',
                  'Enter new category name',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Add',
                      onPress: async (newCat) => {
                        if (newCat && newCat.trim()) {
                          const settings = await loadSettings();
                          if (!settings.categories.includes(newCat.trim())) {
                            settings.categories.push(newCat.trim());
                            await saveSettings(settings);
                            setCategories(settings.categories);
                            setCategory(newCat.trim());
                          } else {
                            Alert.alert('Category already exists');
                          }
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.addCategoryButtonText}>+ Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {(['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[styles.frequencyButton, frequency === freq && styles.frequencyButtonActive]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[styles.frequencyText, frequency === freq && styles.frequencyTextActive]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {frequency === 'custom' && (
          <View style={styles.inputGroup}>
            <Text style={typography.bodyPrimary}>Custom Frequency</Text>
            <Text style={typography.caption}>
              Total amount will be divided evenly over the specified interval (e.g., $600 every 10 months = $60/month)
            </Text>
            <View style={styles.customFrequencyContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
                value={customNumber}
                onChangeText={setCustomNumber}
                placeholder="e.g. 10"
                keyboardType="numeric"
                placeholderTextColor={colors.secondaryText}
              />
              <View style={styles.unitContainer}>
                {(['days', 'weeks', 'months', 'years'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitButton, customUnit === unit && styles.unitButtonSelected]}
                    onPress={() => setCustomUnit(unit)}
                  >
                    <Text style={[styles.unitText, customUnit === unit && styles.unitTextSelected]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2023-12-01"
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Add Recurring Expense</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  content: {
    padding: spacing.screenPadding,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.inputPadding,
    fontSize: typography.normal,
    color: colors.primaryText,
    marginTop: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryButtonText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
  categoryButtonTextSelected: {
    color: colors.background,
  },
  addCategoryButton: {
    backgroundColor: colors.secondaryText,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  addCategoryButtonText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
  customFrequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitContainer: {
    flexDirection: 'row',
  },
  unitButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  unitButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unitText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
  unitTextSelected: {
    color: colors.background,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  frequencyButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  frequencyButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  frequencyText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
  frequencyTextActive: {
    color: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.normal,
    fontWeight: '500',
  },
});