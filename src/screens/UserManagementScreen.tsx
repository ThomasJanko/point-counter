import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';

const UserManagementScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, []),
  );

  const loadUsers = async () => {
    try {
      const usersData = await storageService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Supprimer l'Utilisateur",
      `Êtes-vous sûr de vouloir supprimer ${user.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            storageService.deleteUser(user.id).then(() => {
              loadUsers();
            });
          },
        },
      ],
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View
          style={[styles.colorIndicator, { backgroundColor: item.color }]}
        />
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditUser', { user: item })}
        >
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {users.length} Utilisateur{users.length !== 1 ? 's' : ''} Enregistré
          {users.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddUser')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Aucun Utilisateur</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez votre premier utilisateur pour commencer à compter les
            points
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AddUser')}
          >
            <Text style={styles.emptyButtonText}>
              Ajouter le Premier Utilisateur
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderUser}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 18,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  userCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserManagementScreen;
