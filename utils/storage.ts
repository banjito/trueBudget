import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paycheck, RecurringExpense, OneTimeExpense, Goal, AppSettings } from './types';

// Storage keys
const PAYCHECKS_KEY = 'paychecks';
const RECURRING_EXPENSES_KEY = 'recurringExpenses';
const ONETIME_EXPENSES_KEY = 'onetimeExpenses';
const GOALS_KEY = 'goals';
const SETTINGS_KEY = 'settings';

// Paychecks
export const savePaychecks = async (paychecks: Paycheck[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PAYCHECKS_KEY, JSON.stringify(paychecks));
  } catch (error) {
    console.error('Error saving paychecks:', error);
  }
};

export const loadPaychecks = async (): Promise<Paycheck[]> => {
  try {
    const data = await AsyncStorage.getItem(PAYCHECKS_KEY);
    if (data) {
      const paychecks = JSON.parse(data);
      // Convert date strings back to Date objects
      return paychecks.map((p: any) => ({ ...p, date: new Date(p.date) }));
    }
    return [];
  } catch (error) {
    console.error('Error loading paychecks:', error);
    return [];
  }
};

// Recurring Expenses
export const saveRecurringExpenses = async (expenses: RecurringExpense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RECURRING_EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving recurring expenses:', error);
  }
};

export const loadRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  try {
    const data = await AsyncStorage.getItem(RECURRING_EXPENSES_KEY);
    if (data) {
      const expenses = JSON.parse(data);
      return expenses.map((e: any) => ({ ...e, startDate: new Date(e.startDate) }));
    }
    return [];
  } catch (error) {
    console.error('Error loading recurring expenses:', error);
    return [];
  }
};

// One-time Expenses
export const saveOneTimeExpenses = async (expenses: OneTimeExpense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONETIME_EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving one-time expenses:', error);
  }
};

export const loadOneTimeExpenses = async (): Promise<OneTimeExpense[]> => {
  try {
    const data = await AsyncStorage.getItem(ONETIME_EXPENSES_KEY);
    if (data) {
      const expenses = JSON.parse(data);
      return expenses.map((e: any) => ({ ...e, date: new Date(e.date) }));
    }
    return [];
  } catch (error) {
    console.error('Error loading one-time expenses:', error);
    return [];
  }
};

// Goals
export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals:', error);
  }
};

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    if (data) {
      const goals = JSON.parse(data);
      return goals.map((g: any) => ({ ...g, startDate: new Date(g.startDate) }));
    }
    return [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

// Settings
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      defaultPaycheckFrequency: 'biweekly',
      categories: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'],
      goalCategories: ['Emergency Fund', 'Vacation', 'Car Purchase', 'Home Down Payment', 'Investments', 'Education', 'Retirement', 'Other'],
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      defaultPaycheckFrequency: 'biweekly',
      categories: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'],
      goalCategories: ['Emergency Fund', 'Vacation', 'Car Purchase', 'Home Down Payment', 'Investments', 'Education', 'Retirement', 'Other'],
    };
  }
};