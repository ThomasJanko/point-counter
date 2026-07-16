import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme';

interface ActionButtonsProps {
  onStartGame: () => void;
  navigation: NavigationProp<any>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onStartGame,
  navigation,
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onStartGame}
      >
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Nouvelle Partie</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.secondaryButton,
          { borderColor: theme.colors.primary },
        ]}
        onPress={() => navigation.navigate('UserManagement')}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>Gérer les Utilisateurs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ActionButtons;
