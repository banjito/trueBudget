// Data models for True Budget app

export interface Paycheck {
  id: string;
  amount: number;
  date: Date;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly';
  name?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';
  customNumber?: number;
  customUnit?: 'days' | 'weeks' | 'months' | 'years';
  startDate: Date;
  category: string;
  isActive: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';
  customNumber?: number;
  customUnit?: 'days' | 'weeks' | 'months' | 'years';
  startDate: Date;
  category: string;
  isActive: boolean;
}

export interface OneTimeExpense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
}

export type Expense = RecurringExpense | OneTimeExpense;

export interface BudgetPeriod {
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  spent: number;
  recurringTotal: number;
  goalsTotal: number;
  remaining: number;
  expenses: OneTimeExpense[];
  recurringExpenses: RecurringExpense[];
  goals: Goal[];
  paycheckFrequency: Paycheck['frequency'];
}

export interface AppSettings {
  defaultPaycheckFrequency: Paycheck['frequency'];
  categories: string[];
  goalCategories: string[];
}