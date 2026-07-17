import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS, tabularNums } from '../theme/types';

interface PlayerWithScore extends User {
  score: number;
}

interface ResultsModalProps {
  visible: boolean;
  gameTitle: string;
  rankedPlayers: PlayerWithScore[];
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  onClose: () => void;
  onPlayAgain: () => void;
}

function getCompetitionRank(
  players: PlayerWithScore[],
  gameGoal: 'highest' | 'lowest',
  playerScore: number,
): number {
  const strictlyBetter = players.filter(p =>
    gameGoal === 'highest' ? p.score > playerScore : p.score < playerScore,
  ).length;
  return strictlyBetter + 1;
}

const medalFor = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}e`;
};

const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  gameTitle,
  rankedPlayers,
  gameGoal,
  onClose,
  onPlayAgain,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Partie terminée 🎉</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{gameTitle}</Text>

          <ScrollView style={styles.list}>
            {rankedPlayers.map(player => {
              const rank = getCompetitionRank(rankedPlayers, gameGoal, player.score);
              return (
                <View key={player.id} style={[styles.row, { backgroundColor: theme.colors.surface2 }]}>
                  <Text style={styles.medal}>{medalFor(rank)}</Text>
                  <View style={[styles.dot, { backgroundColor: player.color }]} />
                  <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={[styles.score, tabularNums, { color: theme.colors.text }]}>{player.score}</Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.outlinedButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.outlinedButtonText, { color: theme.colors.text }]}>Accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={onPlayAgain}
            >
              <Text style={[styles.filledButtonText, { color: theme.colors.onPrimary }]}>Rejouer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.titleExtraBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    maxHeight: 320,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  medal: {
    fontSize: 16,
    width: 26,
    textAlign: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  score: {
    fontSize: 15,
    fontFamily: FONTS.titleExtraBold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlinedButton: {
    borderWidth: 1,
  },
  outlinedButtonText: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  filledButtonText: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
});

export default ResultsModal;
