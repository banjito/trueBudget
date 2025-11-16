import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../styles';
import { saveOneTimeExpenses, loadOneTimeExpenses, loadSettings } from '../utils/storage';
import { OneTimeExpense } from '../types';

export default function AddExpenseScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const settings = await loadSettings();
    setCategories(settings.categories);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
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

    const newExpense: OneTimeExpense = {
      id: Date.now().toString(),
      name: name || 'Misc.',
      amount: expenseAmount,
      date,
      category,
    };

    try {
      const expenses = await loadOneTimeExpenses();
      expenses.push(newExpense);
      await saveOneTimeExpenses(expenses);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.headingMedium}>Add Expense</Text>
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
          <Text style={typography.bodyPrimary}>Date</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: colors.primaryText }}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Add Expense</Text>
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