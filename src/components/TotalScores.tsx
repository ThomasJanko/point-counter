import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';

interface TotalScoresProps {
  selectedUsers: User[];
  scores: { [userId: string]: number };
  focusedInput?: string | null;
}

const TotalScores: React.FC<TotalScoresProps> = ({
  selectedUsers,
  scores,
  focusedInput: _focusedInput,
}) => {
  const truncateName = (name: string) => {
    return name.length > 15 ? name.slice(0, 15) + '...' : name;
  };

  return (
    <View style={styles.totalScoresContainer}>
      <Text style={styles.totalScoresTitle}>Totaux</Text>
      <View style={styles.totalScoresGrid}>
        {selectedUsers.map(user => (
          <View key={user.id} style={styles.totalScoreItem}>
            <View
              style={[styles.colorIndicator, { backgroundColor: user.color }]}
            />
            <Text numberOfLines={1} style={styles.totalScoreName}>
              {truncateName(user.name)}
            </Text>
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
    padding: 4,
    margin: 14,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  totalScoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
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
    borderRadius: 6,
    padding: 4,
    paddingHorizontal: 6,
    margin: 2,
    gap: 4,
    minWidth: 90,
  },
  totalScoreName: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 4,
  },
  totalScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default TotalScores;
