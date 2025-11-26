import React, { useState, useEffect, useRef } from 'react';
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

const GameScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { theme } = useTheme();
  const savedGame = (route.params as any)?.savedGame as Game | undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [scores, setScores] = useState<{ [userId: string]: number }>({});
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [scoreLines, setScoreLines] = useState<{
    [lineId: string]: { [userId: string]: number | null };
  }>({});
  const [nextLineId, setNextLineId] = useState(1);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [gameGoal, setGameGoal] = useState<'highest' | 'lowest'>('highest');
  const [scoreLimit, setScoreLimit] = useState<number | null>(null);
  const [limitReachedUsers, setLimitReachedUsers] = useState<Set<string>>(
    new Set(),
  );

  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldKeepModalOpenRef = useRef(false);
  const previousUsersCountRef = useRef(0);

  const autoSaveGame = async () => {
    // Only auto-save if there's a game title or if it's an existing game
    if (!gameTitle.trim() && !currentGameId) {
      return;
    }

    try {
      const game = {
        id: currentGameId || Date.now().toString(),
        name: gameTitle.trim() || `Partie ${new Date().toLocaleDateString()}`,
        players: selectedUsers,
        scores,
        scoreLines,
        gameGoal,
        scoreLimit,
        createdAt: new Date(),
      };

      if (currentGameId) {
        // Update existing game
        await storageService.updateGame(game);
      } else {
        // Save new game
        await storageService.saveGame(game);
        setCurrentGameId(game.id);
      }
    } catch (error) {
      console.error('Error auto-saving game:', error);
      // Silent fail for auto-save
    }
  };

  useEffect(() => {
    loadUsers().then(usersData => {
      // Initialize the previous count after first load
      previousUsersCountRef.current = usersData.length;
    });
    if (savedGame) {
      loadSavedGame(savedGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update navigation header title when gameTitle changes
  useEffect(() => {
    navigation.setOptions({
      title: gameTitle || 'Nouvelle Partie',
    });
  }, [gameTitle, navigation]);

  // Auto-save when scores or selectedUsers change (with debouncing)
  useEffect(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Only auto-save if game has started (has scoreLines or selectedUsers)
    if (Object.keys(scoreLines).length === 0 && selectedUsers.length === 0) {
      return;
    }

    // Debounce auto-save by 1 second
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveGame();
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreLines, selectedUsers, scores, gameTitle, currentGameId]);

  useFocusEffect(
    React.useCallback(() => {
      const previousCount = previousUsersCountRef.current;
      loadUsers().then(updatedUsers => {
        // If we should keep modal open (coming back from AddUser), check for new user
        if (shouldKeepModalOpenRef.current) {
          if (updatedUsers.length > previousCount) {
            // Find the newest user (highest ID, which is timestamp)
            const sortedUsers = [...updatedUsers].sort(
              (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
            );
            const newUser = sortedUsers[0];
            // Auto-select if not already selected
            if (newUser && !selectedUsers.some(u => u.id === newUser.id)) {
              handleUserToggle(newUser);
            }
          }
          // Reopen the modal and reset the flag
          setShowUserSelection(true);
          shouldKeepModalOpenRef.current = false;
        }
        // Update the previous count after loading
        previousUsersCountRef.current = updatedUsers.length;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users.length, selectedUsers]),
  );

  const loadUsers = async () => {
    const usersData = await storageService.getUsers();
    setUsers(usersData);
    return usersData;
  };

  const loadSavedGame = (game: Game) => {
    // Set game ID to track this loaded game
    setCurrentGameId(game.id);

    // Set game title
    setGameTitle(game.name);

    // Set selected users (players)
    setSelectedUsers(game.players);

    // Set scores
    setScores(game.scores);

    // Set game configuration
    setGameGoal(game.gameGoal || 'highest');
    setScoreLimit(game.scoreLimit || null);

    // Restore all score lines if they exist
    if (game.scoreLines && Object.keys(game.scoreLines).length > 0) {
      setScoreLines(game.scoreLines);

      // Calculate next line ID based on existing lines
      const lineIds = Object.keys(game.scoreLines);
      const lineNumberRegex = /line_(\d+)/;
      const maxLineNumber = Math.max(
        ...lineIds.map(id => {
          const match = lineNumberRegex.exec(id);
          return match ? parseInt(match[1], 10) : 0;
        }),
      );
      setNextLineId(maxLineNumber + 1);
    } else {
      // Fallback: Create a single score line with the final scores
      const lineId = 'line_1';
      const lineScores: { [userId: string]: number | null } = {};
      game.players.forEach(player => {
        lineScores[player.id] = game.scores[player.id] || 0;
      });
      setScoreLines({ [lineId]: lineScores });
      setNextLineId(2);
    }
  };

  const handleUserToggle = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const startGame = () => {
    if (selectedUsers.length < 2) {
      Alert.alert(
        'Erreur',
        'Veuillez sélectionner au moins 2 joueurs pour commencer une partie.',
      );
      return;
    }

    // Initialize total scores to 0
    const initialScores: { [userId: string]: number } = {};
    selectedUsers.forEach(user => {
      initialScores[user.id] = 0;
    });
    setScores(initialScores);

    // Initialize first score line with null values
    const firstLineId = `line_${nextLineId}`;
    const nullScores: { [userId: string]: number | null } = {};
    selectedUsers.forEach(user => {
      nullScores[user.id] = null;
    });

    // Set the first score line with null values
    setScoreLines({
      [firstLineId]: nullScores,
    });
    setNextLineId(prev => prev + 1);

    // Reset limit reached users for new game
    setLimitReachedUsers(new Set());

    // Hide the user selection screen
    setShowUserSelection(false);
  };

  const updateScoreInLine = (lineId: string, userId: string, value: string) => {
    // Always store the raw string value during typing
    setScoreLines(prev => {
      const updatedLines = {
        ...prev,
        [lineId]: {
          ...prev[lineId],
          [userId]: value as any, // Store as string during typing
        },
      };

      // ---- auto-add new line logic stays the same ----
      const updatedLine = updatedLines[lineId];
      const allPlayersHaveScores = selectedUsers.every(
        user =>
          updatedLine[user.id] !== null &&
          updatedLine[user.id] !== undefined &&
          updatedLine[user.id] !== '',
      );

      if (allPlayersHaveScores) {
        const hasEmptyLine = Object.values(updatedLines).some(line =>
          selectedUsers.some(
            user =>
              line[user.id] === null ||
              line[user.id] === undefined ||
              line[user.id] === '',
          ),
        );

        if (!hasEmptyLine) {
          const newLineId = `line_${nextLineId}`;
          const newLineScores: { [userId: string]: number | null } = {};
          selectedUsers.forEach(user => {
            newLineScores[user.id] = null;
          });
          updatedLines[newLineId] = newLineScores;
          setNextLineId(prevLineId => prevLineId + 1);
        }
      }

      return updatedLines;
    });

    // Update total scores with the new value
    setScores(prevScores => {
      const newTotalScores = { ...prevScores };

      // Recalculate total for the current user
      let userTotal = 0;
      Object.values(scoreLines).forEach(line => {
        const lineValue = line[userId];
        if (lineValue !== null && lineValue !== undefined) {
          const numValue = parseFloat(lineValue.toString());
          if (!isNaN(numValue)) {
            userTotal += numValue;
          }
        }
      });

      // Add the current update
      const oldValue = scoreLines[lineId][userId] || 0;
      const oldNumValue = parseFloat(oldValue.toString());
      const currentValue = parseFloat(value);
      const validCurrentValue = isNaN(currentValue) ? 0 : currentValue;
      const validOldValue = isNaN(oldNumValue) ? 0 : oldNumValue;

      newTotalScores[userId] = userTotal - validOldValue + validCurrentValue;

      return newTotalScores;
    });
  };

  const checkScoreLimit = (userId: string) => {
    if (scoreLimit === null) return;

    // Check if this user has already reached the limit and chose to continue
    if (limitReachedUsers.has(userId)) return;

    // Add a small delay to ensure the score has been properly updated
    setTimeout(() => {
      // Process string values to numbers
      setScoreLines(prev => {
        const updatedLines = { ...prev };

        // Process all entries for this user
        Object.keys(updatedLines).forEach(lineId => {
          const lineValue = updatedLines[lineId][userId];
          if (lineValue !== null && lineValue !== undefined) {
            const numValue = parseFloat(lineValue.toString());
            if (!isNaN(numValue)) {
              updatedLines[lineId][userId] = numValue;
            }
          }
        });

        return updatedLines;
      });

      // Then check total score after processing
      setTimeout(() => {
        // Calculate current total score for the user
        let userTotal = 0;
        Object.values(scoreLines).forEach(line => {
          const lineValue = line[userId];
          if (
            lineValue !== null &&
            lineValue !== undefined &&
            typeof lineValue === 'number'
          ) {
            userTotal += lineValue;
          }
        });

        // Check if user has reached or exceeded the score limit
        if (userTotal >= scoreLimit) {
          const userWhoReachedLimit = selectedUsers.find(u => u.id === userId);
          if (userWhoReachedLimit) {
            Alert.alert(
              '🎯 Limite Atteinte!',
              `${userWhoReachedLimit.name} a atteint la limite de ${scoreLimit} points!\n\nQue souhaitez-vous faire ?`,
              [
                {
                  text: 'Continuer',
                  style: 'cancel',
                  onPress: () => {
                    // Add user to the set of users who reached limit and chose to continue
                    setLimitReachedUsers(prev => new Set([...prev, userId]));
                  },
                },
                {
                  text: 'Terminer la partie',
                  onPress: () => {
                    // Update the score first, then end the game
                    setTimeout(() => {
                      endGame();
                    }, 100);
                  },
                },
              ],
            );
          }
        }
      }, 100);
    }, 300); // Small delay to ensure score is updated
  };

  const deleteScoreLine = (lineId: string) => {
    setScoreLines(prev => {
      const newLines = { ...prev };
      delete newLines[lineId];

      // Recalculate total scores using the new lines (after deletion)
      const newTotalScores: { [userId: string]: number } = {};
      selectedUsers.forEach(user => {
        newTotalScores[user.id] = Object.values(newLines).reduce(
          (sum, line) => {
            const lineValue = line[user.id];
            if (lineValue !== null && lineValue !== undefined) {
              const numValue = parseFloat(lineValue.toString());
              if (!isNaN(numValue)) {
                return sum + numValue;
              }
            }
            return sum;
          },
          0,
        );
      });
      setScores(newTotalScores);

      return newLines;
    });
  };

  const resetScores = () => {
    Alert.alert(
      'Réinitialiser les Scores',
      'Êtes-vous sûr de vouloir remettre tous les scores à 0 ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: () => {
            const newResetScores: { [userId: string]: number } = {};
            selectedUsers.forEach(user => {
              newResetScores[user.id] = 0;
            });
            setScores(newResetScores);

            // Reset to a single score line with null values
            const firstLineId = `line_${nextLineId}`;
            const nullScores: { [userId: string]: number | null } = {};
            selectedUsers.forEach(user => {
              nullScores[user.id] = null;
            });
            setScoreLines({
              [firstLineId]: nullScores,
            });
            setNextLineId(prev => prev + 1);

            // Reset limit reached users
            setLimitReachedUsers(new Set());
          },
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
      const game = {
        id: currentGameId || Date.now().toString(),
        name: gameTitle.trim(),
        players: selectedUsers,
        scores,
        scoreLines,
        gameGoal,
        scoreLimit,
        createdAt: new Date(),
      };

      if (currentGameId) {
        // Update existing game
        await storageService.updateGame(game);
      } else {
        // Save new game
        await storageService.saveGame(game);
        setCurrentGameId(game.id);
      }

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
    // Check if game title is set
    if (!gameTitle.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer un titre de partie avant de terminer.',
      );
      return;
    }

    try {
      // Save the game first
      const game = {
        id: currentGameId || Date.now().toString(),
        name: gameTitle.trim(),
        players: selectedUsers,
        scores,
        scoreLines,
        gameGoal,
        scoreLimit,
        createdAt: new Date(),
      };

      if (currentGameId) {
        // Update existing game
        await storageService.updateGame(game);
      } else {
        // Save new game
        await storageService.saveGame(game);
        setCurrentGameId(game.id);
      }

      // Show results modal
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert(
        'Erreur',
        "Échec de l'enregistrement de la partie. Veuillez réessayer.",
      );
    }
  };

  const getRankedPlayers = () => {
    return selectedUsers
      .map(user => ({
        ...user,
        score: scores[user.id] || 0,
      }))
      .sort((a, b) => {
        if (gameGoal === 'highest') {
          return b.score - a.score;
        } else {
          return a.score - b.score;
        }
      });
  };

  if (selectedUsers.length === 0 || Object.keys(scoreLines).length === 0) {
    return (
      <UserSelection
        users={users}
        selectedUsers={selectedUsers}
        gameTitle={gameTitle}
        gameGoal={gameGoal}
        scoreLimit={scoreLimit}
        onGameTitleChange={setGameTitle}
        onGameGoalChange={setGameGoal}
        onScoreLimitChange={setScoreLimit}
        onUserToggle={handleUserToggle}
        onStartGame={startGame}
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
        {/* {scoreLimit && (
          <Text style={[styles.scoreLimitIndicator, { color: theme.colors.primary }]}>
            Limite: {scoreLimit} pts
          </Text>
        )} */}
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderLight,
            },
          ]}
          onPress={() => setShowMenu(true)}
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
        onInputBlur={(userId: string) => {
          setFocusedInput(null);
          checkScoreLimit(userId);
        }}
        onDeleteLine={deleteScoreLine}
        onUsersReorder={setSelectedUsers}
      />

      <TotalScores
        selectedUsers={selectedUsers}
        scores={scores}
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
          // Don't close modal, just navigate - we'll reopen it when returning
          shouldKeepModalOpenRef.current = true;
          previousUsersCountRef.current = users.length;
          navigation.navigate('AddUser');
        }}
      />

      <GameMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onChangePlayers={() => setShowUserSelection(true)}
        onReset={resetScores}
        onSave={saveGame}
        onEndGame={endGame}
      />

      <ResultsModal
        visible={showResultsModal}
        rankedPlayers={getRankedPlayers()}
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
  scoreLimitIndicator: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
