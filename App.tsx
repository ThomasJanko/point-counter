/**
 * Point Counter App
 * A React Native app for counting points in games
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Theme
import { ThemeProvider, useTheme } from './src/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AddUserScreen from './src/screens/AddUserScreen';
import EditUserScreen from './src/screens/EditUserScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: theme.colors.text,
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Compteur de Points' }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{ title: 'Gérer les Utilisateurs' }}
        />
        <Stack.Screen
          name="AddUser"
          component={AddUserScreen}
          options={{ title: 'Ajouter un Utilisateur' }}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{ title: "Modifier l'Utilisateur" }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'Nouvelle Partie' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
