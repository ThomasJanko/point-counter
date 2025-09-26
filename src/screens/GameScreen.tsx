import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';

const GameScreen = () => {
  const navigation = useNavigation();
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await storageService.getUsers();
    setUsers(usersData);
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

    // Hide the user selection screen
    setShowUserSelection(false);
  };

  const updateScoreInLine = (lineId: string, userId: string, value: string) => {
    setScoreLines(prev => {
      const updatedLines = {
        ...prev,
        [lineId]: {
          ...prev[lineId],
          [userId]: value, // store raw string
        },
      };

      // Try parsing into number only if it's a valid float
      const numValue = parseFloat(value);
      const isValidNumber = !isNaN(numValue);

      if (isValidNumber) {
        updatedLines[lineId][userId] = numValue;
      }

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
          setNextLineId(prev => prev + 1);
        }
      }

      return updatedLines;
    });

    // Update total scores with the new value
    setScores(prev => {
      const newTotalScores = { ...prev };

      // Recalculate total for the current user
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

      // Add the current update
      const oldValue = scoreLines[lineId][userId] || 0;
      const numValue = parseFloat(value);
      const currentValue = isNaN(numValue) ? 0 : numValue;
      newTotalScores[userId] = userTotal - oldValue + currentValue;

      return newTotalScores;
    });
  };

  const deleteScoreLine = (lineId: string) => {
    setScoreLines(prev => {
      const newLines = { ...prev };
      delete newLines[lineId];
      return newLines;
    });

    // Recalculate total scores
    const newTotalScores: { [userId: string]: number } = {};
    selectedUsers.forEach(user => {
      newTotalScores[user.id] = Object.values(scoreLines).reduce(
        (sum, line) => {
          if (lineId in scoreLines && line === scoreLines[lineId]) return sum;
          return sum + (line[user.id] || 0);
        },
        0,
      );
    });
    setScores(newTotalScores);
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
            const resetScores: { [userId: string]: number } = {};
            selectedUsers.forEach(user => {
              resetScores[user.id] = 0;
            });
            setScores(resetScores);

            // Reset all score lines
            const resetLines: {
              [lineId: string]: { [userId: string]: number };
            } = {};
            Object.keys(scoreLines).forEach(lineId => {
              resetLines[lineId] = { ...resetScores };
            });
            setScoreLines(resetLines);
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
        id: Date.now().toString(),
        name: gameTitle.trim(),
        players: selectedUsers,
        scores,
        createdAt: new Date(),
      };

      await storageService.saveGame(game);
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

  const renderUserSelection = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.userSelectionItem,
          isSelected && styles.selectedUserItem,
        ]}
        onPress={() => handleUserToggle(item)}
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

  if (selectedUsers.length === 0 || Object.keys(scoreLines).length === 0) {
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
            onChangeText={setGameTitle}
            placeholder="Entrez le titre de la partie"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.userSelectionHeader}>
          <Text style={styles.userSelectionTitle}>
            Sélectionner les Joueurs
          </Text>
          <TouchableOpacity
            style={styles.addUserButton}
            onPress={() => navigation.navigate('AddUser')}
          >
            <Text style={styles.addUserButtonText}>+ Nouveau Joueur</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderUserSelection}
          contentContainerStyle={styles.userListContainer}
        />

        <View style={styles.startGameContainer}>
          <TouchableOpacity
            style={[
              styles.startGameButton,
              selectedUsers.length < 2 && styles.disabledButton,
            ]}
            onPress={startGame}
            disabled={selectedUsers.length < 2}
          >
            <Text style={styles.startGameButtonText}>
              Commencer la Partie ({selectedUsers.length} joueur
              {selectedUsers.length !== 1 ? 's' : ''})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitleDisplay}>
          {gameTitle || 'Partie sans titre'}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreTableContainer}>
        <View style={styles.tableHeaderContainer}>
          <Text style={styles.leaderboardTitle}>Scores</Text>
        </View>

        <ScrollView
          style={styles.scoreTable}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
        >
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={styles.lineNumberHeader}>#</Text>
              {selectedUsers.map((user, index) => (
                <View key={user.id} style={styles.playerHeaderCell}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: user.color },
                    ]}
                  />
                  <Text style={styles.playerHeaderText}>{user.name}</Text>
                </View>
              ))}
              <Text style={styles.actionHeader}>Action</Text>
            </View>

            {/* Score Lines */}
            {Object.entries(scoreLines).map(
              ([lineId, lineScores], lineIndex) => (
                <View key={lineId} style={styles.tableRow}>
                  <Text style={styles.lineNumberCell}>{lineIndex + 1}</Text>
                  {selectedUsers.map(user => {
                    const inputKey = `${lineId}_${user.id}`;
                    const isFocused = focusedInput === inputKey;
                    return (
                      <TextInput
                        key={inputKey}
                        style={[
                          styles.scoreInputCell,
                          isFocused && styles.scoreInputCellFocused,
                        ]}
                        value={
                          lineScores[user.id] !== null
                            ? lineScores[user.id]?.toString() || ''
                            : ''
                        }
                        onChangeText={value =>
                          updateScoreInLine(lineId, user.id, value)
                        }
                        onFocus={() => setFocusedInput(inputKey)}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                        selectTextOnFocus={true}
                        returnKeyType="next"
                      />
                    );
                  })}
                  <TouchableOpacity
                    style={styles.deleteLineButton}
                    onPress={() => deleteScoreLine(lineId)}
                  >
                    <Text style={styles.deleteLineButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ),
            )}
          </View>
        </ScrollView>
      </View>

      {/* Total Scores Display */}
      <View style={styles.totalScoresContainer}>
        <Text style={styles.totalScoresTitle}>Totaux</Text>
        <View style={styles.totalScoresGrid}>
          {selectedUsers.map(user => (
            <View key={user.id} style={styles.totalScoreItem}>
              <View
                style={[styles.colorIndicator, { backgroundColor: user.color }]}
              />
              <Text style={styles.totalScoreName}>{user.name}</Text>
              <Text style={styles.totalScoreValue}>{scores[user.id] || 0}</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal
        visible={showUserSelection}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner les Joueurs</Text>
              <TouchableOpacity
                style={styles.modalAddUserButton}
                onPress={() => {
                  setShowUserSelection(false);
                  navigation.navigate('AddUser');
                }}
              >
                <Text style={styles.modalAddUserButtonText}>+ Nouveau</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderUserSelection}
              contentContainerStyle={styles.modalUserList}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowUserSelection(false)}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => {
                  if (selectedUsers.length < 2) {
                    Alert.alert(
                      'Erreur',
                      'Veuillez sélectionner au moins 2 joueurs.',
                    );
                    return;
                  }
                  setShowUserSelection(false);
                }}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3-Dot Menu Modal */}
      <Modal visible={showMenu} animationType="fade" transparent={true}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowUserSelection(true);
              }}
            >
              <Text style={styles.menuItemText}>Changer les joueurs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                resetScores();
              }}
            >
              <Text style={styles.menuItemText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                saveGame();
              }}
            >
              <Text style={styles.menuItemText}>Enregistrer la partie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowMenu(false);
                // Add end game logic here
                Alert.alert(
                  'Terminer la partie',
                  'Êtes-vous sûr de vouloir terminer cette partie ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Terminer',
                      style: 'destructive',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                );
              }}
            >
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Terminer la partie
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  userListContainer: {
    padding: 20,
  },
  userSelectionItem: {
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
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 12,
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
  gameHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTitleDisplay: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameTitleContainer: {
    padding: 20,
    paddingBottom: 10,
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
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  userSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  userSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addUserButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addUserButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreTableContainer: {
    marginTop: -20,
    flex: 1,
    padding: 10,
    paddingTop: 5,
  },
  tableHeaderContainer: {
    marginBottom: 8,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scoreTable: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  tableContainer: {
    minWidth: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lineNumberHeader: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  playerHeaderCell: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  playerHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginLeft: 4,
    textAlign: 'center',
  },
  actionHeader: {
    width: 50,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    alignItems: 'center',
    minHeight: 50,
  },
  lineNumberCell: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  scoreInputCell: {
    width: 100,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 4,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  scoreInputCellFocused: {
    borderColor: '#8b5cf6',
    backgroundColor: '#3a2a4a',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteLineButton: {
    width: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLineButtonText: {
    fontSize: 16,
  },
  totalScoresContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 10,
    margin: 14,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  totalScoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalScoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  totalScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 120,
  },
  totalScoreName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  totalScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalAddUserButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modalAddUserButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalUserList: {
    maxHeight: 300,
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
  // 3-Dot Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuItemDanger: {
    backgroundColor: '#4a1a1a',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#ff6b6b',
  },
});

export default GameScreen;
