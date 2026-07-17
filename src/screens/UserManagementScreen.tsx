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
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS } from '../theme/types';
import ScreenHeader from '../components/ScreenHeader';

const UserManagementScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
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
    <View style={[styles.userCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
      <View style={[styles.avatar, { backgroundColor: item.color }]} />
      <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name}</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('EditUser', { user: item })}
        accessibilityLabel={`Modifier ${item.name}`}
      >
        <Text style={[styles.iconGlyph, { color: theme.colors.text }]}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => handleDeleteUser(item)}
        accessibilityLabel={`Supprimer ${item.name}`}
      >
        <Text style={[styles.iconGlyph, { color: theme.colors.error }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Joueurs"
        onBack={() => navigation.goBack()}
        rightIcon="+"
        onRightPress={() => navigation.navigate('AddUser')}
        rightAccessibilityLabel="Ajouter un joueur"
        rightFilled
      />

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Aucun joueur</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Ajoutez votre premier joueur pour commencer à compter les points
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddUser')}
          >
            <Text style={[styles.emptyButtonText, { color: theme.colors.onPrimary }]}>
              Ajouter un joueur
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
  listContainer: {
    padding: 20,
    gap: 8,
  },
  userCard: {
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.titleBold,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.titleBold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: FONTS.titleBold,
  },
});

export default UserManagementScreen;
