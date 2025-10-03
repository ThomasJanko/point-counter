import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  userCount: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ userCount }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userCount}</Text>
        <Text style={styles.statLabel}>Utilisateurs Enregistrés</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#a0a0a0',
  },
});

export default StatsCard;
