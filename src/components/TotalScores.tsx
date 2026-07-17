import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS, tabularNums } from '../theme/types';

interface TotalScoresProps {
  selectedUsers: User[];
  scores: { [userId: string]: number };
}

const TotalScores: React.FC<TotalScoresProps> = ({ selectedUsers, scores }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.primary }]}>
      <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>TOTAL</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {selectedUsers.map(user => (
          <View key={user.id} style={styles.column}>
            <Text style={[styles.value, tabularNums, { color: theme.colors.text }]}>
              {scores[user.id] || 0}
            </Text>
            <Text style={[styles.medal, { color: user.color }]} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: FONTS.titleExtraBold,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    width: 80,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontFamily: FONTS.titleExtraBold,
  },
  medal: {
    fontSize: 10,
    fontFamily: FONTS.titleBold,
    marginTop: 2,
  },
});

export default TotalScores;
