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
import { FONTS } from '../theme/types';
import ScreenHeader from './ScreenHeader';

interface UserSelectionProps {
  users: User[];
  selectedUsers: User[];
  gameTitle: string;
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  /** When true, user is editing an in-progress game (copy and primary action differ). */
  isEditMode?: boolean;
  onGameTitleChange: (title: string) => void;
  onGameGoalChange: (goal: 'highest' | 'lowest') => void;
  onScoreLimitChange: (limit: number | null) => void;
  onUserToggle: (user: User) => void;
  onStartGame: () => void;
  /** Creates a new player (name only, color auto-assigned from the palette) without leaving this screen. */
  onQuickAddUser: (name: string) => void;
  onBack: () => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({
  users,
  selectedUsers,
  gameTitle,
  gameGoal,
  scoreLimit,
  isEditMode = false,
  onGameTitleChange,
  onGameGoalChange,
  onScoreLimitChange,
  onUserToggle,
  onStartGame,
  onQuickAddUser,
  onBack,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddName, setQuickAddName] = useState('');

  const submitQuickAdd = () => {
    const trimmed = quickAddName.trim();
    if (!trimmed) return;
    onQuickAddUser(trimmed);
    setQuickAddName('');
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  const renderUserSelection = (item: User) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.userRow,
          {
            backgroundColor: isSelected ? theme.colors.primaryBackground : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
          },
        ]}
        onPress={() => onUserToggle(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: item.color }]} />
        <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name}</Text>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: theme.colors.primary,
              backgroundColor: isSelected ? theme.colors.primary : 'transparent',
            },
          ]}
        >
          {isSelected && <Text style={[styles.checkmark, { color: theme.colors.onPrimary }]}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const startButtonLabel = isEditMode
    ? 'Enregistrer les modifications'
    : 'Commencer la partie';
  const canStart = selectedUsers.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={isEditMode ? 'Modifier la partie' : 'Nouvelle partie'}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>TITRE DE LA PARTIE</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            value={gameTitle}
            onChangeText={onGameTitleChange}
            placeholder={`Partie du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>OBJECTIF</Text>
          <View style={styles.goalRow}>
            <TouchableOpacity
              style={[
                styles.goalButton,
                {
                  borderColor: gameGoal === 'highest' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: gameGoal === 'highest' ? theme.colors.primaryBackground : theme.colors.surface,
                },
              ]}
              onPress={() => onGameGoalChange('highest')}
            >
              <Text style={[styles.goalButtonText, { color: theme.colors.text }]}>Score le + haut gagne</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                {
                  borderColor: gameGoal === 'lowest' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: gameGoal === 'lowest' ? theme.colors.primaryBackground : theme.colors.surface,
                },
              ]}
              onPress={() => onGameGoalChange('lowest')}
            >
              <Text style={[styles.goalButtonText, { color: theme.colors.text }]}>Score le + bas gagne</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>LIMITE DE SCORE (OPTIONNEL)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            value={scoreLimit?.toString() || ''}
            onChangeText={value => {
              const numValue = Number.parseInt(value, 10);
              onScoreLimitChange(Number.isNaN(numValue) ? null : numValue);
            }}
            placeholder="Aucune limite"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>
            JOUEURS ({selectedUsers.length})
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.searchInput,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un joueur"
            placeholderTextColor={theme.colors.placeholder}
          />

          {filteredUsers.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              {searchQuery ? 'Aucun joueur trouvé' : 'Aucun joueur disponible'}
            </Text>
          ) : (
            <View style={styles.userList}>{filteredUsers.map(renderUserSelection)}</View>
          )}

          <View style={styles.quickAddRow}>
            <TextInput
              style={[
                styles.input,
                styles.quickAddInput,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
              ]}
              value={quickAddName}
              onChangeText={setQuickAddName}
              placeholder="Nouveau joueur…"
              placeholderTextColor={theme.colors.placeholder}
              onSubmitEditing={submitQuickAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.quickAddButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={submitQuickAdd}
              accessibilityLabel="Ajouter un joueur"
            >
              <Text style={[styles.quickAddButtonText, { color: theme.colors.primary }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: canStart ? theme.colors.primary : theme.colors.surface2 },
          ]}
          onPress={onStartGame}
          disabled={!canStart}
        >
          <Text
            style={[
              styles.startButtonText,
              { color: canStart ? theme.colors.onPrimary : theme.colors.textTertiary },
            ]}
          >
            {startButtonLabel}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.titleBold,
    letterSpacing: 0.6,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: FONTS.titleBold,
    borderWidth: 1,
  },
  searchInput: {
    fontFamily: FONTS.bodyMedium,
    marginBottom: 10,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  goalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  goalButtonText: {
    fontSize: 12,
    fontFamily: FONTS.titleBold,
    textAlign: 'center',
  },
  userList: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 44,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userName: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickAddInput: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    borderStyle: 'dashed',
  },
  quickAddButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddButtonText: {
    fontSize: 20,
    fontFamily: FONTS.titleBold,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 15,
    fontFamily: FONTS.titleExtraBold,
  },
});

export default UserSelection;
