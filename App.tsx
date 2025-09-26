/**
 * Point Counter App
 * A React Native app for counting points in games
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AddUserScreen from './src/screens/AddUserScreen';
import EditUserScreen from './src/screens/EditUserScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#1a1a1a"
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#8b5cf6',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            cardStyle: {
              backgroundColor: '#1a1a1a',
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
    </SafeAreaProvider>
  );
}

export default App;
