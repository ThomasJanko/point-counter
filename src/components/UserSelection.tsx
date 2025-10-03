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
          isSelected && styles.selectedUserItem,
        ]}
        onPress={() => onUserToggle(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.colorIndicator, { backgroundColor: item.color }]}
        />
        <Text style={styles.userSelectionName}>{item.name}</Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nouvelle Partie</Text>
        <Text style={styles.headerSubtitle}>
          Choisissez au moins 2 joueurs pour commencer la partie
        </Text>
      </View>

      <View style={styles.gameTitleContainer}>
        <Text style={styles.gameTitleLabel}>Titre de la Partie</Text>
        <TextInput
          style={styles.gameTitleInput}
          value={gameTitle}
          onChangeText={onGameTitleChange}
          placeholder="Entrez le titre de la partie"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.gameConfigContainer}>
        <Text style={styles.gameConfigLabel}>Configuration de la Partie</Text>

        <View style={styles.gameGoalContainer}>
          <Text style={styles.gameGoalLabel}>Objectif:</Text>
          <View style={styles.gameGoalButtons}>
            <TouchableOpacity
              style={[
                styles.gameGoalButton,
                gameGoal === 'highest' && styles.gameGoalButtonSelected,
              ]}
              onPress={() => onGameGoalChange('highest')}
            >
              <Text
                style={[
                  styles.gameGoalButtonText,
                  gameGoal === 'highest' && styles.gameGoalButtonTextSelected,
                ]}
              >
                Score le plus élevé
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.gameGoalButton,
                gameGoal === 'lowest' && styles.gameGoalButtonSelected,
              ]}
              onPress={() => onGameGoalChange('lowest')}
            >
              <Text
                style={[
                  styles.gameGoalButtonText,
                  gameGoal === 'lowest' && styles.gameGoalButtonTextSelected,
                ]}
              >
                Score le plus bas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scoreLimitContainer}>
          <Text style={styles.scoreLimitLabel}>
            Limite de score (optionnel):
          </Text>
          <TextInput
            style={styles.scoreLimitInput}
            value={scoreLimit?.toString() || ''}
            onChangeText={value => {
              const numValue = parseInt(value, 10);
              onScoreLimitChange(isNaN(numValue) ? null : numValue);
            }}
            placeholder="Ex: 100"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.userSelectionHeader}>
        <Text style={styles.userSelectionTitle}>Sélectionner les Joueurs</Text>
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
          <TouchableOpacity style={styles.addUserButton} onPress={onAddUser}>
            <Text style={styles.addUserButtonText}>+ Nouveau Joueur</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.userListContainer}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
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
            (selectedUsers.length < 2 || gameTitle === '') &&
              styles.disabledButton,
          ]}
          onPress={onStartGame}
          disabled={selectedUsers.length < 2 || gameTitle === ''}
        >
          <Text style={styles.startGameButtonText}>
            Commencer la Partie ({selectedUsers.length} joueur
            {selectedUsers.length !== 1 ? 's' : ''})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    paddingHorizontal: 30,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  gameTitleContainer: {
    paddingHorizontal: 20,
  },
  gameTitleLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  gameTitleInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  gameConfigContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  gameConfigLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '500',
  },
  gameGoalContainer: {
    marginBottom: 12,
  },
  gameGoalLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  gameGoalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  gameGoalButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  gameGoalButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  gameGoalButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  gameGoalButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scoreLimitContainer: {
    marginBottom: 12,
  },
  scoreLimitLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreLimitInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  userSelectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 14,
  },
  userSelectionTitle: {
    fontSize: 18,
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
  addUserButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
  },
  addUserButtonText: {
    color: '#ffffff',
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
    color: '#666',
    textAlign: 'center',
  },
  userSelectionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignSelf: 'flex-start',
  },
  selectedUserItem: {
    borderColor: '#8b5cf6',
    backgroundColor: '#2a1a3a',
  },
  userSelectionName: {
    fontSize: 14,
    color: '#ffffff',
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
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startGameContainer: {
    padding: 20,
  },
  startGameButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#4a4a4a',
  },
  startGameButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UserSelection;
