import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { saveGoals, loadGoals, loadSettings } from '../utils/storage';
import { Goal, AppSettings } from '../types';

export default function AddGoalScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customNumber, setCustomNumber] = useState('');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('months');
  const [category, setCategory] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [goalCategories, setGoalCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const settings = await loadSettings();
        // Ensure goalCategories exists (for backward compatibility)
        const categories = settings.goalCategories || ['Emergency Fund', 'Vacation', 'Car Purchase', 'Home Down Payment', 'Investments', 'Education', 'Retirement', 'Other'];
        setGoalCategories(categories);
        if (categories.length > 0) {
          setCategory(categories[0]);
        }
      } catch (error) {
        console.error('Error loading goal categories:', error);
        // Fallback to default categories
        const defaultCategories = ['Emergency Fund', 'Vacation', 'Car Purchase', 'Home Down Payment', 'Investments', 'Education', 'Retirement', 'Other'];
        setGoalCategories(defaultCategories);
        setCategory(defaultCategories[0]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !targetAmount.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: name.trim(),
      targetAmount: amount,
      frequency,
      customNumber: isCustom ? parseInt(customNumber) : undefined,
      customUnit: isCustom ? customUnit : undefined,
      startDate: new Date(),
      category,
      isActive: true,
    };

    try {
      const existingGoals = await loadGoals();
      await saveGoals([...existingGoals, newGoal]);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const frequencyOptions = [
    { label: 'Daily', value: 'daily' as const },
    { label: 'Weekly', value: 'weekly' as const },
    { label: 'Biweekly', value: 'biweekly' as const },
    { label: 'Monthly', value: 'monthly' as const },
    { label: 'Yearly', value: 'yearly' as const },
    { label: 'Custom', value: 'custom' as const },
  ];

  const customUnitOptions = [
    { label: 'Days', value: 'days' as const },
    { label: 'Weeks', value: 'weeks' as const },
    { label: 'Months', value: 'months' as const },
    { label: 'Years', value: 'years' as const },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={typography.headingMedium}>Add New Goal</Text>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Goal Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={colors.borders}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Target Amount *</Text>
          <TextInput
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={colors.borders}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  frequency === option.value && styles.frequencyOptionSelected,
                ]}
                onPress={() => {
                  setFrequency(option.value);
                  setIsCustom(option.value === 'custom');
                }}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === option.value && styles.frequencyTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isCustom && (
          <View style={styles.customContainer}>
            <View style={styles.inputGroup}>
              <Text style={typography.bodyPrimary}>Every</Text>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
                value={customNumber}
                onChangeText={setCustomNumber}
                placeholder="2"
                keyboardType="numeric"
                placeholderTextColor={colors.borders}
              />
              <View style={styles.unitContainer}>
                {customUnitOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.unitOption,
                      customUnit === option.value && styles.unitOptionSelected,
                    ]}
                    onPress={() => setCustomUnit(option.value)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        customUnit === option.value && styles.unitTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Category</Text>
          {loading ? (
            <Text style={typography.bodySecondary}>Loading categories...</Text>
          ) : (
            <View style={styles.categoryContainer}>
              {goalCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Goal</Text>
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
  content: {
    padding: spacing.screenPadding,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    color: colors.primaryText,
    backgroundColor: colors.surface,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  frequencyOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.borders,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  frequencyText: {
    color: colors.primaryText,
    fontSize: 14,
  },
  frequencyTextSelected: {
    color: colors.background,
    fontWeight: 'bold' as const,
  },
  customContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  unitContainer: {
    flexDirection: 'row',
    flex: 2,
  },
  unitOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.borders,
    marginHorizontal: 1,
    backgroundColor: colors.surface,
  },
  unitOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unitText: {
    color: colors.primaryText,
    fontSize: 12,
  },
  unitTextSelected: {
    color: colors.background,
    fontWeight: 'bold' as const,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.borders,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  categoryOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryText: {
    color: colors.primaryText,
    fontSize: 14,
  },
  categoryTextSelected: {
    color: colors.background,
    fontWeight: 'bold' as const,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});