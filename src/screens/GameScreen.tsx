import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User, Game } from '../types';
import { useTheme } from '../theme';
import UserSelection from '../components/UserSelection';
import ScoreTable from '../components/ScoreTable';
import TotalScores from '../components/TotalScores';
import GameMenu from '../components/GameMenu';
import ResultsModal from '../components/ResultsModal';
import UserSelectionModal from '../components/UserSelectionModal';
import { useGameSession } from '../hooks/useGameSession';

const GameScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { theme } = useTheme();
  const savedGame = (route.params as any)?.savedGame as Game | undefined;

  const {
    state,
    dispatch,
    totals,
    rankedPlayers,
    persistGame,
    checkScoreLimit,
  } = useGameSession(savedGame);
  const {
    selectedUsers,
    gameTitle,
    gameGoal,
    scoreLimit,
    scoreLines,
    editingGameSetup,
  } = state;

  // Pure UI state — not part of the game session domain, so it stays local.
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const shouldKeepModalOpenRef = useRef(false);
  const previousUsersCountRef = useRef(0);

  useEffect(() => {
    loadUsers().then(usersData => {
      previousUsersCountRef.current = usersData.length;
    });
  }, []);

  // Keep the header title in sync with the game title.
  useEffect(() => {
    navigation.setOptions({
      title: gameTitle || 'Nouvelle Partie',
    });
  }, [gameTitle, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const previousCount = previousUsersCountRef.current;
      loadUsers().then(updatedUsers => {
        if (shouldKeepModalOpenRef.current) {
          if (updatedUsers.length > previousCount) {
            const sortedUsers = [...updatedUsers].sort(
              (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
            );
            const newUser = sortedUsers[0];
            if (newUser && !selectedUsers.some(u => u.id === newUser.id)) {
              handleUserToggle(newUser);
            }
          }
          setShowUserSelection(true);
          shouldKeepModalOpenRef.current = false;
        }
        previousUsersCountRef.current = updatedUsers.length;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUsers]),
  );

  const loadUsers = async () => {
    const usersData = await storageService.getUsers();
    setUsers(usersData);
    return usersData;
  };

  const handleUserToggle = (user: User) => {
    dispatch({ type: 'TOGGLE_USER', user });
  };

  const startGame = () => {
    if (selectedUsers.length < 2) {
      Alert.alert(
        'Erreur',
        'Veuillez sélectionner au moins 2 joueurs pour commencer une partie.',
      );
      return;
    }
    dispatch({ type: 'START_GAME' });
    setShowUserSelection(false);
  };

  const confirmEditGameSetup = () => {
    if (selectedUsers.length < 2) {
      Alert.alert(
        'Erreur',
        'Veuillez sélectionner au moins 2 joueurs pour continuer.',
      );
      return;
    }
    if (!gameTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre de partie.');
      return;
    }
    dispatch({ type: 'CONFIRM_EDIT_SETUP' });
  };

  const handleUserSelectionContinue = () => {
    if (editingGameSetup) {
      confirmEditGameSetup();
    } else {
      startGame();
    }
  };

  const updateScoreInLine = (lineId: string, userId: string, value: string) => {
    dispatch({ type: 'UPDATE_SCORE', lineId, userId, value });
  };

  const handleInputBlur = (userId: string) => {
    setFocusedInput(null);
    checkScoreLimit(userId, (user, limit) => {
      Alert.alert(
        '🎯 Limite Atteinte!',
        `${user.name} a atteint la limite de ${limit} points!\n\nQue souhaitez-vous faire ?`,
        [
          {
            text: 'Continuer',
            style: 'cancel',
            onPress: () => {
              dispatch({ type: 'MARK_LIMIT_REACHED', userId: user.id });
            },
          },
          {
            text: 'Terminer la partie',
            onPress: () => {
              endGame();
            },
          },
        ],
      );
    });
  };

  const deleteScoreLine = (lineId: string) => {
    dispatch({ type: 'DELETE_LINE', lineId });
  };

  const resetScores = () => {
    Alert.alert(
      'Réinitialiser les Scores',
      'Êtes-vous sûr de vouloir remettre tous les scores à 0 ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: () => dispatch({ type: 'RESET_SCORES' }),
        },
      ],
    );
  };

  const saveGame = async () => {
    if (!gameTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre de partie.');
      return;
    }

    try {
      await persistGame();
      Alert.alert('Succès', 'Partie enregistrée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert(
        'Erreur',
        "Échec de l'enregistrement de la partie. Veuillez réessayer.",
      );
    }
  };

  const endGame = async () => {
    if (!gameTitle.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer un titre de partie avant de terminer.',
      );
      return;
    }

    try {
      await persistGame();
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert(
        'Erreur',
        "Échec de l'enregistrement de la partie. Veuillez réessayer.",
      );
    }
  };

  if (
    selectedUsers.length === 0 ||
    Object.keys(scoreLines).length === 0 ||
    editingGameSetup
  ) {
    return (
      <UserSelection
        users={users}
        selectedUsers={selectedUsers}
        gameTitle={gameTitle}
        gameGoal={gameGoal}
        scoreLimit={scoreLimit}
        isEditMode={editingGameSetup}
        onGameTitleChange={title =>
          dispatch({ type: 'SET_GAME_TITLE', title })
        }
        onGameGoalChange={goal => dispatch({ type: 'SET_GAME_GOAL', goal })}
        onScoreLimitChange={limit =>
          dispatch({ type: 'SET_SCORE_LIMIT', limit })
        }
        onUserToggle={handleUserToggle}
        onStartGame={handleUserSelectionContinue}
        onAddUser={() => navigation.navigate('AddUser')}
      />
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.gameHeader}>
        <View style={styles.tableHeaderContainer}>
          <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
            Scores
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderLight,
            },
          ]}
          onPress={() => setShowMenu(true)}
          accessibilityLabel="Ouvrir le menu de la partie"
        >
          <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>
            ⋮
          </Text>
        </TouchableOpacity>
      </View>

      <ScoreTable
        selectedUsers={selectedUsers}
        scoreLines={scoreLines}
        focusedInput={focusedInput}
        scoreLimit={scoreLimit}
        onScoreChange={updateScoreInLine}
        onInputFocus={setFocusedInput}
        onInputBlur={handleInputBlur}
        onDeleteLine={deleteScoreLine}
        onUsersReorder={reorderedUsers =>
          dispatch({ type: 'REORDER_USERS', users: reorderedUsers })
        }
      />

      <TotalScores
        selectedUsers={selectedUsers}
        scores={totals}
        gameGoal={gameGoal}
        focusedInput={focusedInput}
      />

      <UserSelectionModal
        visible={showUserSelection}
        users={users}
        selectedUsers={selectedUsers}
        onUserToggle={handleUserToggle}
        onClose={() => {
          setShowUserSelection(false);
          shouldKeepModalOpenRef.current = false;
        }}
        onConfirm={() => {
          setShowUserSelection(false);
          shouldKeepModalOpenRef.current = false;
        }}
        onAddUser={() => {
          shouldKeepModalOpenRef.current = true;
          previousUsersCountRef.current = users.length;
          navigation.navigate('AddUser');
        }}
      />

      <GameMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onChangePlayers={() => setShowUserSelection(true)}
        onModifyGame={() => dispatch({ type: 'START_EDIT_SETUP' })}
        onReset={resetScores}
        onSave={saveGame}
        onEndGame={endGame}
      />

      <ResultsModal
        visible={showResultsModal}
        rankedPlayers={rankedPlayers}
        gameGoal={gameGoal}
        scoreLimit={scoreLimit}
        onClose={() => {
          setShowResultsModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tableHeaderContainer: {
    marginBottom: 4,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameScreen;
