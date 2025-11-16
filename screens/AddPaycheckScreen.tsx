import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../styles';
import { savePaychecks, loadPaychecks } from '../utils/storage';
import { Paycheck } from '../types';

export default function AddPaycheckScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Paycheck['frequency']>('biweekly');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newPaycheck: Paycheck = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      date,
      frequency,
      name: name || undefined,
    };

    try {
      const paychecks = await loadPaychecks();
      paychecks.push(newPaycheck);
      await savePaychecks(paychecks);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save paycheck');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.headingMedium}>Add Paycheck</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Paycheck name"
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
          <Text style={typography.bodyPrimary}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {(['weekly', 'biweekly', 'semimonthly', 'monthly'] as const).map((freq) => (
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

        <View style={styles.inputGroup}>
          <Text style={typography.bodyPrimary}>Paycheck Date (optional)</Text>
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
          <Text style={styles.primaryButtonText}>Add Paycheck</Text>
        </TouchableOpacity>
      </View>
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