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
import { FONTS } from '../theme/types';

interface GameMenuProps {
  visible: boolean;
  onClose: () => void;
  onModifyGame: () => void;
  onReset: () => void;
  onSave: () => void;
  onEndGame: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  visible,
  onClose,
  onModifyGame,
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
        { text: 'Terminer', style: 'destructive', onPress: onEndGame },
      ],
    );
  };

  const handleReset = () => {
    onClose();
    Alert.alert(
      'Réinitialiser les scores',
      'Êtes-vous sûr de vouloir remettre tous les scores à zéro ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', onPress: onReset },
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
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.colors.borderLight }]}
            onPress={() => {
              onClose();
              onModifyGame();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Modifier la partie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.colors.borderLight }]}
            onPress={handleReset}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Réinitialiser les scores</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.colors.borderLight }]}
            onPress={() => {
              onClose();
              onSave();
            }}
          >
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Sauvegarder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleEndGame}>
            <Text style={[styles.menuItemTextDanger, { color: theme.colors.error }]}>
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
    paddingRight: 16,
  },
  menuContainer: {
    borderRadius: 12,
    minWidth: 200,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
  },
  menuItemTextDanger: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
  },
});

export default GameMenu;
