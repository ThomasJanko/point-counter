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

const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  rankedPlayers,
  gameGoal,
  scoreLimit,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.resultsModalOverlay}>
        <View style={styles.resultsModalContent}>
          <Text style={styles.resultsTitle}>🏆 Partie Terminée 🏆</Text>
          <Text style={styles.resultsSubtitle}>
            Classement Final (
            {gameGoal === 'highest'
              ? 'Score le plus élevé gagne'
              : 'Score le plus bas gagne'}
            )
          </Text>
          {scoreLimit && (
            <Text style={styles.scoreLimitInfo}>
              🎯 Limite de {scoreLimit} points atteinte!
            </Text>
          )}

          <ScrollView style={styles.rankingList}>
            {rankedPlayers.map((player, index) => (
              <View key={player.id} style={styles.rankingItem}>
                <View style={styles.rankingLeft}>
                  <Text style={styles.rankingPosition}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `${index + 1}.`}
                  </Text>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: player.color },
                    ]}
                  />
                  <Text style={styles.rankingName}>{player.name}</Text>
                </View>
                <Text style={styles.rankingScore}>{player.score} pts</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.savedMessage}>
            ✓ Partie enregistrée dans l'historique
          </Text>

          <TouchableOpacity style={styles.resultsButton} onPress={onClose}>
            <Text style={styles.resultsButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  resultsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsModalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  scoreLimitInfo: {
    fontSize: 14,
    color: '#8b5cf6',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  rankingScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  savedMessage: {
    fontSize: 14,
    color: '#4ade80',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  resultsButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resultsButtonText: {
    color: '#ffffff',
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
