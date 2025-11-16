import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles';
import { loadSettings, saveSettings } from '../utils/storage';
import { AppSettings } from '../types';

export default function SettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<AppSettings>({
    defaultPaycheckFrequency: 'biweekly',
    categories: [],
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadSettings();
    setSettings(data);
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (settings.categories.includes(newCategory.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }
    const updated = {
      ...settings,
      categories: [...settings.categories, newCategory.trim()],
    };
    setSettings(updated);
    saveSettings(updated);
    setNewCategory('');
  };

  const removeCategory = (category: string) => {
    Alert.alert(
      'Remove Category',
      `Remove "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = {
              ...settings,
              categories: settings.categories.filter(c => c !== category),
            };
            setSettings(updated);
            saveSettings(updated);
          },
        },
      ]
    );
  };

  const moveCategoryUp = (index: number) => {
    if (index > 0) {
      const newCategories = [...settings.categories];
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
      const updated = { ...settings, categories: newCategories };
      setSettings(updated);
      saveSettings(updated);
    }
  };

  const moveCategoryDown = (index: number) => {
    if (index < settings.categories.length - 1) {
      const newCategories = [...settings.categories];
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      const updated = { ...settings, categories: newCategories };
      setSettings(updated);
      saveSettings(updated);
    }
  };

  const renderCategory = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.categoryItem}>
      <TouchableOpacity
        style={styles.moveButton}
        onPress={() => moveCategoryUp(index)}
        disabled={index === 0}
      >
        <Text style={[styles.moveButtonText, index === 0 && styles.disabledText]}>↑</Text>
      </TouchableOpacity>
      <Text style={[typography.bodyPrimary, { flex: 1 }]}>{item}</Text>
      <TouchableOpacity
        style={styles.moveButton}
        onPress={() => moveCategoryDown(index)}
        disabled={index === settings.categories.length - 1}
      >
        <Text style={[styles.moveButtonText, index === settings.categories.length - 1 && styles.disabledText]}>↓</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeCategory(item)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.headingMedium}>Settings</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={typography.headingSmall}>Categories</Text>
          <View style={styles.addCategoryContainer}>
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="New category"
              placeholderTextColor={colors.secondaryText}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCategory}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={settings.categories}
            renderItem={renderCategory}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.categoryList}
          />
        </View>
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
  section: {
    marginBottom: spacing.lg,
  },
  addCategoryContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.inputPadding,
    fontSize: typography.normal,
    color: colors.primaryText,
    marginRight: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: typography.normal,
    fontWeight: '500',
  },
  categoryList: {
    marginTop: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: borderRadius.small,
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },



  moveButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.small,
    marginHorizontal: spacing.xs,
  },
  moveButtonText: {
    color: colors.primaryText,
    fontSize: typography.medium,
    fontWeight: 'bold',
  },
  disabledText: {
    color: colors.secondaryText,
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeButtonText: {
    color: colors.primaryText,
    fontSize: typography.small,
  },
});