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

interface PlayerWithScore extends User {
  score: number;
}

interface ResultsModalProps {
  visible: boolean;
  rankedPlayers: PlayerWithScore[];
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  onClose: () => void;
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

const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  rankedPlayers,
  gameGoal,
  scoreLimit,
  onClose,
}) => {
  const { theme } = useTheme();

  const rankLabel = (rank: number) => {
    if (rank === 1) {
      return '🥇';
    }
    if (rank === 2) {
      return '🥈';
    }
    if (rank === 3) {
      return '🥉';
    }
    return `${rank}.`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[styles.resultsModalOverlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.resultsModalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
          <Text style={[styles.resultsTitle, { color: theme.colors.primary }]}>🏆 Partie Terminée 🏆</Text>
          <Text style={[styles.resultsSubtitle, { color: theme.colors.text }]}>
            Classement Final (
            {gameGoal === 'highest'
              ? 'Score le plus élevé gagne'
              : 'Score le plus bas gagne'}
            )
          </Text>
          {scoreLimit && (
            <Text style={[styles.scoreLimitInfo, { color: theme.colors.primary }]}>
              🎯 Limite de {scoreLimit} points atteinte!
            </Text>
          )}

          <ScrollView style={styles.rankingList}>
            {rankedPlayers.map(player => {
              const rank = getCompetitionRank(rankedPlayers, gameGoal, player.score);
              return (
              <View key={player.id} style={[styles.rankingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.rankingLeft}>
                  <Text style={styles.rankingPosition}>
                    {rankLabel(rank)}
                  </Text>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: player.color },
                    ]}
                  />
                  <Text style={[styles.rankingName, { color: theme.colors.text }]}>{player.name}</Text>
                </View>
                <Text style={[styles.rankingScore, { color: theme.colors.primary }]}>{player.score} pts</Text>
              </View>
            );
            })}
          </ScrollView>

          <Text style={[styles.savedMessage, { color: theme.colors.success }]}>
            ✓ Partie enregistrée dans l'historique
          </Text>

          <TouchableOpacity style={[styles.resultsButton, { backgroundColor: theme.colors.primary }]} onPress={onClose}>
            <Text style={[styles.resultsButtonText, { color: theme.colors.text }]}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  resultsModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsModalContent: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  scoreLimitInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  rankingList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingPosition: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  rankingName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  rankingScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  savedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  resultsButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resultsButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ResultsModal;
