/**
 * Point Counter App
 * A React Native app for counting points in games
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { NavigationProp } from '@react-navigation/native';
import { StatusBar, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Theme
import { ThemeProvider, useTheme } from './src/theme';

// Error handling
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AddUserScreen from './src/screens/AddUserScreen';
import EditUserScreen from './src/screens/EditUserScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

// Header right component for Settings button
const SettingsHeaderButton = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={headerStyles.button}
    >
      <Text style={headerStyles.buttonText}>⚙️</Text>
    </TouchableOpacity>
  );
};

const headerStyles = StyleSheet.create({
  button: {
    marginRight: 16,
    padding: 8,
  },
  buttonText: {
    fontSize: 24,
  },
});

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
});

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
          options={({ navigation }) => ({
            title: 'Compteur de Points',
            headerRight: () => <SettingsHeaderButton navigation={navigation} />,
          })}
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
          options={({ navigation }) => ({
            title: 'Nouvelle Partie',
            headerRight: () => <SettingsHeaderButton navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Paramètres' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            {/* Single source of truth for the bottom safe-area inset (gesture
                bar / nav bar). Do not add another edges=['bottom'] SafeAreaView
                further down the tree, or the inset gets applied multiple times. */}
            <SafeAreaView edges={['bottom']} style={styles.flexOne}>
              <AppNavigator />
            </SafeAreaView>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
