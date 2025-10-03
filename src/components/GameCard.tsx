import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onPress: () => void;
  onLongPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPress, onLongPress }) => {
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

  const winner = getWinner(game);

  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameCardTitle}>{game.name}</Text>
        <Text style={styles.gameCardDate}>
          {new Date(game.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.gameCardInfo}>
        <View style={styles.playersInfo}>
          <Text style={styles.gameCardLabel}>Joueurs:</Text>
          <View style={styles.playerDots}>
            {game.players.map(player => (
              <View
                key={player.id}
                style={[styles.playerDot, { backgroundColor: player.color }]}
              />
            ))}
          </View>
          <Text style={styles.playerCount}>{game.players.length}</Text>
        </View>

        {winner && (
          <View style={styles.winnerInfo}>
            <Text style={styles.winnerLabel}>🏆 Gagnant:</Text>
            <View
              style={[styles.winnerDot, { backgroundColor: winner.color }]}
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
};

const styles = StyleSheet.create({
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

export default GameCard;
