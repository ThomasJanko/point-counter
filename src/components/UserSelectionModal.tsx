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
} from 'react-native';
import { User } from '../types';

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
          isSelected && styles.selectedUserItem,
        ]}
        onPress={() => onUserToggle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userSelectionInfo}>
          <View
            style={[styles.colorIndicator, { backgroundColor: item.color }]}
          />
          <Text style={styles.userSelectionName}>{item.name}</Text>
        </View>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
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
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner les Joueurs</Text>
            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher..."
                  placeholderTextColor="#666"
                />
              </View>
              <TouchableOpacity
                style={styles.modalAddUserButton}
                onPress={() => {
                  onClose();
                  onAddUser();
                }}
              >
                <Text style={styles.modalAddUserButtonText}>+ Nouveau</Text>
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
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Aucun joueur trouvé'
                    : 'Aucun joueur disponible'}
                </Text>
              </View>
            }
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    height: 36,
  },
  modalAddUserButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
  },
  modalAddUserButtonText: {
    color: '#ffffff',
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
    color: '#666',
    textAlign: 'center',
  },
  userSelectionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  selectedUserItem: {
    borderColor: '#8b5cf6',
    backgroundColor: '#2a1a3a',
  },
  userSelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userSelectionName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    color: '#8b5cf6',
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
    borderColor: '#6b7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSelectionModal;
