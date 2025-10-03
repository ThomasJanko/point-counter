import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';

interface TotalScoresProps {
  selectedUsers: User[];
  scores: { [userId: string]: number };
}

const TotalScores: React.FC<TotalScoresProps> = ({ selectedUsers, scores }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default TotalScores;
