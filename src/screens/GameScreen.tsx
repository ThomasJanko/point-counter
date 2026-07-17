import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User, Game } from '../types';
import { PLAYER_COLOR_PALETTE } from '../theme/types';
import { useTheme } from '../theme';
import UserSelection from '../components/UserSelection';
import ScoreTable from '../components/ScoreTable';
import TotalScores from '../components/TotalScores';
import GameMenu from '../components/GameMenu';
import ResultsModal from '../components/ResultsModal';
import ScreenHeader from '../components/ScreenHeader';
import { useGameSession } from '../useGameSession';

type FocusedCell = { lineId: string; userId: string } | null;

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
  const [focusedCell, setFocusedCell] = useState<FocusedCell>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, []),
  );

  const loadUsers = async () => {
    const usersData = await storageService.getUsers();
    setUsers(usersData);
    return usersData;
  };

  const handleUserToggle = (user: User) => {
    dispatch({ type: 'TOGGLE_USER', user });
  };

  // Inline "quick add" from the setup screen: name only, color auto-assigned
  // from the fixed cycled palette, no navigation away from this screen.
  const quickAddPlayer = async (name: string) => {
    const color = PLAYER_COLOR_PALETTE[users.length % PLAYER_COLOR_PALETTE.length];
    const newUser: User = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date(),
    };
    await storageService.addUser(newUser);
    await loadUsers();
    handleUserToggle(newUser);
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
  };

  const confirmEditGameSetup = () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins 2 joueurs pour continuer.');
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

  // Single owner of the "which cell is being edited" state. Runs the
  // score-limit check for the cell being *left* (if any) before switching,
  // so it fires reliably whether the move is a tap on another cell, "next"
  // on the keyboard, or dismissing the keyboard entirely (next === null) —
  // rather than depending on a native TextInput blur event, which isn't
  // guaranteed to fire when the previously-focused cell unmounts.
  const handleFocusChange = (next: FocusedCell) => {
    if (
      focusedCell &&
      (!next || focusedCell.lineId !== next.lineId || focusedCell.userId !== next.userId)
    ) {
      checkScoreLimit(focusedCell.userId, (user, limit) => {
        Alert.alert(
          'Limite atteinte !',
          `${user.name} a atteint la limite de ${limit} points !\n\nQue souhaitez-vous faire ?`,
          [
            {
              text: 'Continuer',
              style: 'cancel',
              onPress: () => {
                dispatch({ type: 'MARK_LIMIT_REACHED', userId: user.id });
              },
            },
            { text: 'Terminer la partie', onPress: () => endGame() },
          ],
        );
      });
    }
    setFocusedCell(next);
  };

  const deleteScoreLine = (lineId: string) => {
    dispatch({ type: 'DELETE_LINE', lineId });
  };

  const resetScores = () => {
    dispatch({ type: 'RESET_SCORES' });
  };

  const saveGame = async () => {
    if (!gameTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre de partie.');
      return;
    }
    try {
      await persistGame();
      Alert.alert('Succès', 'Partie enregistrée avec succès !');
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert('Erreur', "Échec de l'enregistrement de la partie. Veuillez réessayer.");
    }
  };

  const endGame = async () => {
    if (!gameTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre de partie avant de terminer.');
      return;
    }
    try {
      await persistGame();
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert('Erreur', "Échec de l'enregistrement de la partie. Veuillez réessayer.");
    }
  };

  const goHomeFromResults = () => {
    setShowResultsModal(false);
    navigation.goBack();
  };

  const playAgainSameGroup = () => {
    setShowResultsModal(false);
    dispatch({ type: 'RESTART_KEEP_PLAYERS' });
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
        onGameTitleChange={title => dispatch({ type: 'SET_GAME_TITLE', title })}
        onGameGoalChange={goal => dispatch({ type: 'SET_GAME_GOAL', goal })}
        onScoreLimitChange={limit => dispatch({ type: 'SET_SCORE_LIMIT', limit })}
        onUserToggle={handleUserToggle}
        onStartGame={handleUserSelectionContinue}
        onQuickAddUser={quickAddPlayer}
        onBack={() =>
          editingGameSetup
            ? dispatch({ type: 'CONFIRM_EDIT_SETUP' })
            : navigation.goBack()
        }
      />
    );
  }

  return (
    // Tapping anywhere that isn't itself an interactive element (a score
    // cell, a button…) dismisses the keyboard, which blurs the currently
    // focused TextInput and runs the normal onBlur flow below.
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader
          title={gameTitle || 'Partie'}
          subtitle={scoreLimit ? `Limite ${scoreLimit} pts` : undefined}
          onBack={() => navigation.goBack()}
          rightIcon="⋮"
          onRightPress={() => setShowMenu(true)}
          rightAccessibilityLabel="Menu de la partie"
        />

        <ScoreTable
          selectedUsers={selectedUsers}
          scoreLines={scoreLines}
          focusedCell={focusedCell}
          scoreLimit={scoreLimit}
          onScoreChange={updateScoreInLine}
          onFocusChange={handleFocusChange}
          onDeleteLine={deleteScoreLine}
          onUsersReorder={reorderedUsers => dispatch({ type: 'REORDER_USERS', users: reorderedUsers })}
        />

        <TotalScores selectedUsers={selectedUsers} scores={totals} />

        <GameMenu
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          onModifyGame={() => dispatch({ type: 'START_EDIT_SETUP' })}
          onReset={resetScores}
          onSave={saveGame}
          onEndGame={endGame}
        />

        <ResultsModal
          visible={showResultsModal}
          gameTitle={gameTitle}
          rankedPlayers={rankedPlayers}
          gameGoal={gameGoal}
          scoreLimit={scoreLimit}
          onClose={goHomeFromResults}
          onPlayAgain={playAgainSameGroup}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GameScreen;
