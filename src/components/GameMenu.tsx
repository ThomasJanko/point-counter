import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

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
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onChangePlayers();
            }}
          >
            <Text style={styles.menuItemText}>Changer les joueurs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onReset();
            }}
          >
            <Text style={styles.menuItemText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onSave();
            }}
          >
            <Text style={styles.menuItemText}>Enregistrer la partie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={handleEndGame}
          >
            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
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
  menuItemDanger: {
    backgroundColor: '#4a1a1a',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#ff6b6b',
  },
});

export default GameMenu;
