import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Same ScrollView as ScoreTable's vertical rows: GameScreen wraps the
// screen in TouchableWithoutFeedback (keyboard dismiss), which steals
// pan gestures from RN's core ScrollView. gesture-handler's native
// recognizer wins that arbitration.
import { ScrollView } from 'react-native-gesture-handler';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS, tabularNums } from '../theme/types';

interface TotalScoresProps {
  selectedUsers: User[];
  scores: { [userId: string]: number };
  gameGoal: 'highest' | 'lowest';
}

const MAX_HEIGHT = 100;

const TotalScores: React.FC<TotalScoresProps> = ({ selectedUsers, scores, gameGoal }) => {
  const { theme } = useTheme();

  // Best score first — "best" depends on the game's goal (highest or
  // lowest score wins).
  const rankedUsers = [...selectedUsers].sort((a, b) => {
    const scoreA = scores[a.id] ?? 0;
    const scoreB = scores[b.id] ?? 0;
    return gameGoal === 'highest' ? scoreB - scoreA : scoreA - scoreB;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.primary }]}>
      <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>TOTAL</Text>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.chipsWrap}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {rankedUsers.map(user => (
          <View
            key={user.id}
            style={[
              styles.chip,
              { backgroundColor: theme.colors.surface2, borderColor: user.color },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: user.color }]} />
            <Text style={[styles.chipName, { color: theme.colors.text }]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.chipScore, tabularNums, { color: theme.colors.text }]}>
              {scores[user.id] || 0}
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
  scrollArea: {
    height: MAX_HEIGHT,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 10,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipName: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    maxWidth: 90,
  },
  chipScore: {
    fontSize: 13,
    fontFamily: FONTS.titleExtraBold,
  },
});

export default TotalScores;
