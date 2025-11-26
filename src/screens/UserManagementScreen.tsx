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
import { useTheme } from '../theme';

const UserManagementScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
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
    <View style={[styles.userCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.userInfo}>
        <View
          style={[styles.colorIndicator, { backgroundColor: item.color }]}
        />
        <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.info }]}
          onPress={() => navigation.navigate('EditUser', { user: item })}
        >
          <Text style={[styles.editButtonText, { color: theme.colors.text }]}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={[styles.deleteButtonText, { color: theme.colors.text }]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.textSecondary }]}>
          {users.length} Utilisateur{users.length !== 1 ? 's' : ''} Enregistré
          {users.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddUser')}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.text }]}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Aucun Utilisateur</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Ajoutez votre premier utilisateur pour commencer à compter les
            points
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddUser')}
          >
            <Text style={[styles.emptyButtonText, { color: theme.colors.text }]}>
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
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
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
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserManagementScreen;
