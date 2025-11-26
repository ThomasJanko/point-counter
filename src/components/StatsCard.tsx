import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface StatsCardProps {
  userCount: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ userCount }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{userCount}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Utilisateurs Enregistrés</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
  },
});

export default StatsCard;
