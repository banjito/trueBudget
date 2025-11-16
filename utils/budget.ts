import { Paycheck, RecurringExpense, OneTimeExpense, Goal, BudgetPeriod } from '../types';

// Calculate goals contributions spent in a period
export const calculateGoalsSpentInPeriod = (expenses: OneTimeExpense[], goals: Goal[], start: Date, end: Date): number => {
  return expenses
    .filter(expense => {
      // Check if this expense is a contribution to any goal
      return goals.some(goal =>
        expense.name.includes(`Goal: ${goal.name}`) ||
        goal.name.includes(expense.name.replace('Goal: ', ''))
      );
    })
    .filter(expense => expense.date >= start && expense.date <= end)
    .reduce((total, expense) => total + expense.amount, 0);
};

// Calculate cost for a specific period for a recurring expense
export const calculatePeriodCost = (expense: RecurringExpense, start: Date, end: Date): number => {
  if (!expense.isActive || expense.startDate > end) return 0;

  const periodDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

  switch (expense.frequency) {
    case 'daily':
      return expense.amount * periodDays;
    case 'weekly':
      return expense.amount * Math.ceil(periodDays / 7);
    case 'biweekly':
      return expense.amount * Math.ceil(periodDays / 14);
    case 'monthly':
      return expense.amount * Math.ceil(periodDays / 30);
    case 'yearly':
      return periodDays > 365 ? expense.amount : 0;
    case 'custom':
      if (expense.customNumber && expense.customUnit) {
        let unitDays = 0;
        switch (expense.customUnit) {
          case 'days':
            unitDays = 1;
            break;
          case 'weeks':
            unitDays = 7;
            break;
          case 'months':
            unitDays = 30; // approximate
            break;
          case 'years':
            unitDays = 365; // approximate
            break;
        }
        const ratePerUnit = expense.amount / expense.customNumber;
        return ratePerUnit * (periodDays / unitDays);
      }
      return 0;
    default:
      return 0;
  }
};

// Get the current paycheck period based on the latest paycheck (excluding future dates)
export const getCurrentPaycheckPeriod = (paychecks: Paycheck[]): { start: Date; end: Date; amount: number } | null => {
  if (paychecks.length === 0) return null;

  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Filter out future paychecks and sort by date descending
  const validPaychecks = paychecks.filter(p => p.date <= today);
  if (validPaychecks.length === 0) return null;

  const sortedPaychecks = [...validPaychecks].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latestPaycheck = sortedPaychecks[0];

  const start = new Date(latestPaycheck.date);
  let end: Date;

  switch (latestPaycheck.frequency) {
    case 'weekly':
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'biweekly':
      end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
      break;
    case 'semimonthly':
      // Approximate 15 days
      end = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000); // default biweekly
  }

  return { start, end, amount: latestPaycheck.amount };
};

// Calculate total recurring expenses for a period
export const calculateRecurringForPeriod = (recurring: RecurringExpense[], start: Date, end: Date): number => {
  let total = 0;

  recurring.forEach(expense => {
    total += calculatePeriodCost(expense, start, end);
  });

  return total;
};

// Calculate spent amount from one-time expenses in period
export const calculateSpentInPeriod = (expenses: OneTimeExpense[], start: Date, end: Date): number => {
  return expenses
    .filter(expense => expense.date >= start && expense.date <= end)
    .reduce((total, expense) => total + expense.amount, 0);
};

// Get budget status for current period
export const getBudgetStatus = (
  paychecks: Paycheck[],
  recurring: RecurringExpense[],
  expenses: OneTimeExpense[],
  goals: Goal[]
): BudgetPeriod | null => {
  const period = getCurrentPaycheckPeriod(paychecks);
  if (!period) return null;

  // Get the latest paycheck frequency
  const sortedPaychecks = [...paychecks].sort((a, b) => b.date.getTime() - a.date.getTime());
  const paycheckFrequency = sortedPaychecks[0].frequency;

  const recurringTotal = calculateRecurringForPeriod(recurring, period.start, period.end);
  const goalsTotal = calculateGoalsSpentInPeriod(expenses, goals, period.start, period.end);
  const spent = calculateSpentInPeriod(expenses, period.start, period.end);
  const remaining = period.amount - recurringTotal - goalsTotal - spent;

  return {
    startDate: period.start,
    endDate: period.end,
    totalBudget: period.amount,
    spent,
    recurringTotal,
    goalsTotal,
    remaining,
    expenses: expenses.filter(e => e.date >= period.start && e.date <= period.end),
    recurringExpenses: recurring.filter(r => r.isActive),
    goals: goals.filter(g => g.isActive),
    paycheckFrequency,
  };
};