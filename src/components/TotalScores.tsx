import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme';

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
  const { theme } = useTheme();
  const truncateName = (name: string) => {
    return name.length > 15 ? name.slice(0, 15) + '...' : name;
  };

  return (
    <View style={[styles.totalScoresContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.totalScoresTitle, { color: theme.colors.text }]}>Totaux</Text>
      <View style={styles.totalScoresGrid}>
        {selectedUsers.map(user => (
          <View key={user.id} style={[styles.totalScoreItem, { backgroundColor: theme.colors.background }]}>
            <View
              style={[styles.colorIndicator, { backgroundColor: user.color }]}
            />
            <Text numberOfLines={1} style={[styles.totalScoreName, { color: theme.colors.text }]}>
              {truncateName(user.name)}
            </Text>
            <Text style={[styles.totalScoreValue, { color: theme.colors.primary }]}>{scores[user.id] || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalScoresContainer: {
    borderRadius: 12,
    padding: 4,
    margin: 14,
    marginTop: 0,
    borderWidth: 1,
  },
  totalScoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 6,
    padding: 4,
    paddingHorizontal: 6,
    margin: 2,
    gap: 4,
    minWidth: 90,
  },
  totalScoreName: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  totalScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default TotalScores;
