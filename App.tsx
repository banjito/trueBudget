import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import DashboardScreen from './screens/DashboardScreen';
import AddPaycheckScreen from './screens/AddPaycheckScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AddRecurringExpenseScreen from './screens/AddRecurringExpenseScreen';
import ExpenseListScreen from './screens/ExpenseListScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomExpenseDetailScreen from './screens/CustomExpenseDetailScreen';
import GoalDetailScreen from './screens/GoalDetailScreen';
import AddGoalScreen from './screens/AddGoalScreen';
import { requestNotificationPermissions } from './utils/notifications';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start
    requestNotificationPermissions();

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap - could navigate to specific expense or budget
      console.log('Notification tapped:', response);
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomColor: '#808080',
              borderBottomWidth: 1,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddPaycheck" component={AddPaycheckScreen} options={{ title: 'Add Paycheck' }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
          <Stack.Screen name="AddRecurring" component={AddRecurringExpenseScreen} options={{ title: 'Add Recurring Expense' }} />
          <Stack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: 'Expenses' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="AddGoal" component={AddGoalScreen} options={{ title: 'Add Goal' }} />
          <Stack.Screen name="CustomExpenseDetail" component={CustomExpenseDetailScreen} options={{ title: 'Expense Progress' }} />
          <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Progress' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}