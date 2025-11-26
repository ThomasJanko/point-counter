import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../theme';

interface GameMenuProps {
  visible: boolean;
  onClose: () => void;
  onChangePlayers: () => void;
  onReset: () => void;
  onSave: () => void;
  onEndGame: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  visible,
  onClose,
  onChangePlayers,
  onReset,
  onSave,
  onEndGame,
}) => {
  const { theme } = useTheme();
  const handleEndGame = () => {
    onClose();
    Alert.alert(
      'Terminer la partie',
      'La partie sera enregistrée et le classement final sera affiché.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: onEndGame,
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <TouchableOpacity
        style={[styles.menuOverlay, { backgroundColor: theme.colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menuContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onChangePlayers();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Changer les joueurs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onReset();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onSave();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Enregistrer la partie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.errorLight + '20' }]}
            onPress={handleEndGame}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.errorLight }]}>
              Terminer la partie
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GameMenu;
