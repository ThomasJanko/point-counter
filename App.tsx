/**
 * Tablée
 * A React Native app for counting points during board game nights
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { StatusBar, StyleSheet } from 'react-native';
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
          // Every screen builds its own in-content header (back button,
          // title, action icons) to match the reference design, so the
          // native stack header is hidden globally.
          headerShown: false,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen
          name="AddUser"
          component={AddUserScreen}
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            // Drawer/bottom-sheet feel: slides up from the bottom edge
            // instead of the default fade/scale modal transition.
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
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
