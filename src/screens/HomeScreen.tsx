import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { Game } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userCount, setUserCount] = useState(0);
  const [games, setGames] = useState<Game[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserCount();
      loadGames();
    }, []),
  );

  const loadUserCount = async () => {
    const users = await storageService.getUsers();
    setUserCount(users.length);
  };

  const loadGames = async () => {
    const savedGames = await storageService.getGames();
    // Sort by date, most recent first
    const sortedGames = [...savedGames].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setGames(sortedGames);
  };

  const handleStartGame = () => {
    if (userCount === 0) {
      Alert.alert(
        'Aucun Utilisateur',
        'Veuillez ajouter au moins un utilisateur avant de commencer une partie.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ajouter des Utilisateurs',
            onPress: () => navigation.navigate('UserManagement'),
          },
        ],
      );
    } else {
      navigation.navigate('Game');
    }
  };

  const handleLoadGame = (game: Game) => {
    Alert.alert('Charger la partie', `Voulez-vous charger "${game.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Charger',
        onPress: () => {
          navigation.navigate('Game', { savedGame: game });
        },
      },
    ]);
  };

  const handleDeleteGame = (game: Game) => {
    Alert.alert(
      'Supprimer la partie',
      `Voulez-vous supprimer "${game.name}" de l'historique ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteGame(game.id);
            loadGames();
          },
        },
      ],
    );
  };

  const getWinner = (game: Game) => {
    let maxScore = -Infinity;
    let winner = null;
    for (const player of game.players) {
      const score = game.scores[player.id] || 0;
      if (score > maxScore) {
        maxScore = score;
        winner = player;
      }
    }
    return winner;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Compteur de Points</Text>
        <Text style={styles.subtitle}>Suivez les points dans vos jeux</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userCount}</Text>
            <Text style={styles.statLabel}>Utilisateurs Enregistrés</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartGame}
          >
            <Text style={styles.buttonText}>Nouvelle Partie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={styles.secondaryButtonText}>
              Gérer les Utilisateurs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Historique</Text>
          {games.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryIcon}>📋</Text>
              <Text style={styles.emptyHistoryText}>
                Aucun historique disponible
              </Text>
            </View>
          ) : (
            <View>
              {games.map(game => {
                const winner = getWinner(game);
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={styles.gameCard}
                    onPress={() => handleLoadGame(game)}
                    onLongPress={() => handleDeleteGame(game)}
                  >
                    <View style={styles.gameCardHeader}>
                      <Text style={styles.gameCardTitle}>{game.name}</Text>
                      <Text style={styles.gameCardDate}>
                        {formatDate(game.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.gameCardInfo}>
                      <View style={styles.playersInfo}>
                        <Text style={styles.gameCardLabel}>Joueurs:</Text>
                        <View style={styles.playerDots}>
                          {game.players.map(player => (
                            <View
                              key={player.id}
                              style={[
                                styles.playerDot,
                                { backgroundColor: player.color },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={styles.playerCount}>
                          {game.players.length}
                        </Text>
                      </View>

                      {winner && (
                        <View style={styles.winnerInfo}>
                          <Text style={styles.winnerLabel}>🏆 Gagnant:</Text>
                          <View
                            style={[
                              styles.winnerDot,
                              { backgroundColor: winner.color },
                            ]}
                          />
                          <Text style={styles.winnerName}>{winner.name}</Text>
                          <Text style={styles.winnerScore}>
                            ({game.scores[winner.id]} pts)
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.loadHint}>
                      Appuyez pour charger • Maintenez pour supprimer
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  gameCardDate: {
    fontSize: 12,
    color: '#a0a0a0',
    marginLeft: 8,
  },
  gameCardInfo: {
    marginBottom: 8,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameCardLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginRight: 8,
  },
  playerDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  playerCount: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 8,
  },
  winnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  winnerName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 4,
  },
  winnerScore: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  loadHint: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
