import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme';

interface UserSelectionProps {
  users: User[];
  selectedUsers: User[];
  gameTitle: string;
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  onGameTitleChange: (title: string) => void;
  onGameGoalChange: (goal: 'highest' | 'lowest') => void;
  onScoreLimitChange: (limit: number | null) => void;
  onUserToggle: (user: User) => void;
  onStartGame: () => void;
  onAddUser: () => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({
  users,
  selectedUsers,
  gameTitle,
  gameGoal,
  scoreLimit,
  onGameTitleChange,
  onGameGoalChange,
  onScoreLimitChange,
  onUserToggle,
  onStartGame,
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

  const renderUserSelection = (item: User) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.userSelectionItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.border,
          },
          isSelected && {
            backgroundColor: theme.colors.primaryBackground,
          },
        ]}
        onPress={() => onUserToggle(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.colorIndicator, { backgroundColor: item.color }]}
        />
        <Text style={[styles.userSelectionName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
            ✓
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Nouvelle Partie
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          Choisissez au moins 2 joueurs pour commencer la partie
        </Text>
      </View>

      <View style={styles.gameTitleContainer}>
        <Text style={[styles.gameTitleLabel, { color: theme.colors.text }]}>
          Titre de la Partie
        </Text>
        <TextInput
          style={[
            styles.gameTitleInput,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={gameTitle}
          onChangeText={onGameTitleChange}
          placeholder="Entrez le titre de la partie"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>

      <View style={styles.gameConfigContainer}>
        <Text style={[styles.gameConfigLabel, { color: theme.colors.text }]}>
          Configuration de la Partie
        </Text>

        <View style={styles.gameGoalContainer}>
          <Text style={[styles.gameGoalLabel, { color: theme.colors.text }]}>
            Objectif:
          </Text>
          <View style={styles.gameGoalButtons}>
            <TouchableOpacity
              style={[
                styles.gameGoalButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                gameGoal === 'highest' && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => onGameGoalChange('highest')}
            >
              <Text
                style={[
                  styles.gameGoalButtonText,
                  { color: theme.colors.text },
                  gameGoal === 'highest' && styles.gameGoalButtonTextSelected,
                ]}
              >
                Score le plus élevé
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.gameGoalButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                gameGoal === 'lowest' && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => onGameGoalChange('lowest')}
            >
              <Text
                style={[
                  styles.gameGoalButtonText,
                  { color: theme.colors.text },
                  gameGoal === 'lowest' && styles.gameGoalButtonTextSelected,
                ]}
              >
                Score le plus bas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scoreLimitContainer}>
          <Text style={[styles.scoreLimitLabel, { color: theme.colors.text }]}>
            Limite de score (optionnel):
          </Text>
          <TextInput
            style={[
              styles.scoreLimitInput,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={scoreLimit?.toString() || ''}
            onChangeText={value => {
              const numValue = Number.parseInt(value, 10);
              onScoreLimitChange(Number.isNaN(numValue) ? null : numValue);
            }}
            placeholder="Ex: 100"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.userSelectionHeader}>
        <Text style={[styles.userSelectionTitle, { color: theme.colors.text }]}>
          Sélectionner les Joueurs
        </Text>
        <View style={styles.headerActions}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.colors.card,
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
              styles.addUserButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onAddUser}
          >
            <Text
              style={[styles.addUserButtonText, { color: theme.colors.text }]}
            >
              + Nouveau Joueur
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.userListContainer}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyStateText,
                { color: theme.colors.textTertiary },
              ]}
            >
              {searchQuery ? 'Aucun joueur trouvé' : 'Aucun joueur disponible'}
            </Text>
          </View>
        ) : (
          <View style={styles.userListWrapper}>
            {filteredUsers.map(renderUserSelection)}
          </View>
        )}
      </ScrollView>

      <View style={styles.startGameContainer}>
        <TouchableOpacity
          style={[
            styles.startGameButton,
            {
              backgroundColor:
                selectedUsers.length < 2 || gameTitle === ''
                  ? theme.colors.disabled
                  : theme.colors.primary,
            },
          ]}
          onPress={onStartGame}
          disabled={selectedUsers.length < 2 || gameTitle === ''}
        >
          <Text
            style={[styles.startGameButtonText, { color: theme.colors.text }]}
          >
            Commencer la Partie ({selectedUsers.length} joueur
            {selectedUsers.length === 1 ? '' : 's'})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    paddingHorizontal: 30,
    textAlign: 'center',
  },
  gameTitleContainer: {
    paddingHorizontal: 20,
  },
  gameTitleLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  gameTitleInput: {
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  gameConfigContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  gameConfigLabel: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  gameGoalContainer: {
    marginBottom: 12,
  },
  gameGoalLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  gameGoalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  gameGoalButton: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  gameGoalButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  gameGoalButtonTextSelected: {
    fontWeight: '600',
  },
  scoreLimitContainer: {
    marginBottom: 12,
  },
  scoreLimitLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreLimitInput: {
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  userSelectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 14,
  },
  userSelectionTitle: {
    fontSize: 18,
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
    height: 36,
  },
  addUserButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
  },
  addUserButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  userListWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  userSelectionName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 4,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  startGameContainer: {
    padding: 20,
  },
  startGameButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startGameButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UserSelection;
