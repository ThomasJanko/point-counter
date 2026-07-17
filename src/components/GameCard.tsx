import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game } from '../types';
import { useTheme } from '../theme';
import { FONTS, tabularNums } from '../theme/types';

interface GameCardProps {
  game: Game;
  onPress: () => void;
  onLongPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPress, onLongPress }) => {
  const { theme } = useTheme();

  const getWinner = (targetGame: Game) => {
    let maxScore = -Infinity;
    let winner = null;
    for (const player of targetGame.players) {
      const score = targetGame.scores[player.id] || 0;
      if (score > maxScore) {
        maxScore = score;
        winner = player;
      }
    }
    return winner;
  };

  const winner = getWinner(game);
  // Overlapping avatar stack, most recently added player on top — matches
  // the reference design's dot-stack treatment on history cards.
  const dots = game.players.slice(0, 4).reverse();
  const extra = Math.max(0, game.players.length - 4);

  return (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {game.name}
        </Text>
        {winner && (
          <Text style={[styles.score, tabularNums, { color: theme.colors.primary }]}>
            {game.scores[winner.id] ?? 0} PTS
          </Text>
        )}
      </View>

      <Text style={[styles.metaLine, { color: theme.colors.textSecondary }]}>
        {new Date(game.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        })}
        {' · '}
        {game.players.length} joueur{game.players.length > 1 ? 's' : ''}
      </Text>

      <View style={styles.footerRow}>
        {dots.map((player, index) => (
          <View
            key={player.id}
            style={[
              styles.dot,
              { backgroundColor: player.color, borderColor: theme.colors.surface },
              index > 0 && styles.dotOverlap,
            ]}
          />
        ))}
        {extra > 0 && (
          <Text style={[styles.extraLabel, { color: theme.colors.textSecondary }]}>+{extra}</Text>
        )}
        {winner && (
          <Text style={[styles.winnerLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            🏆 {winner.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gameCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
    flex: 1,
  },
  score: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  metaLine: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    marginTop: 4,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  dotOverlap: {
    marginLeft: -6,
  },
  extraLabel: {
    fontSize: 10,
    fontFamily: FONTS.titleBold,
    marginLeft: 6,
  },
  winnerLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    marginLeft: 8,
    flexShrink: 1,
  },
});

export default GameCard;
