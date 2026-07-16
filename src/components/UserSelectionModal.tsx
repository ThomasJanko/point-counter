import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme';

interface UserSelectionModalProps {
  visible: boolean;
  users: User[];
  selectedUsers: User[];
  onUserToggle: (user: User) => void;
  onClose: () => void;
  onConfirm: () => void;
  onAddUser: () => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  users,
  selectedUsers,
  onUserToggle,
  onClose,
  onConfirm,
  onAddUser,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  const renderUserSelection = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.userSelectionItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
          isSelected && { backgroundColor: theme.colors.primaryBackground },
        ]}
        onPress={() => onUserToggle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userSelectionInfo}>
          <View
            style={[styles.colorIndicator, { backgroundColor: item.color }]}
          />
          <Text style={[styles.userSelectionName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
        </View>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
            ✓
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleConfirm = () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins 2 joueurs.');
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        // Native <Modal> renders in its own Android window, so it doesn't
        // benefit from the activity's windowSoftInputMode="adjustResize" —
        // it needs its own keyboard handling to avoid the search input
        // getting covered.
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Sélectionner les Joueurs
            </Text>
            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher..."
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.modalAddUserButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={onAddUser}
              >
                <Text
                  style={[
                    styles.modalAddUserButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  + Nouveau
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={renderUserSelection}
            contentContainerStyle={styles.modalUserList}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {searchQuery
                    ? 'Aucun joueur trouvé'
                    : 'Aucun joueur disponible'}
                </Text>
              </View>
            }
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                { borderColor: theme.colors.textTertiary },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.modalCancelButtonText,
                  { color: theme.colors.textTertiary },
                ]}
              >
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleConfirm}
            >
              <Text
                style={[
                  styles.modalConfirmButtonText,
                  { color: theme.colors.text },
                ]}
              >
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    height: 40,
  },
  modalAddUserButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
  },
  modalAddUserButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalUserList: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  userSelectionItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  userSelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userSelectionName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSelectionModal;
