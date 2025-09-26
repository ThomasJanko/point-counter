import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userCount, setUserCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUserCount();
    }, []),
  );

  const loadUserCount = async () => {
    const users = await storageService.getUsers();
    setUserCount(users.length);
  };

  const handleStartGame = () => {
    if (userCount === 0) {
      Alert.alert(
        'Aucun Utilisateur',
        'Veuillez ajouter au moins un utilisateur avant de commencer une partie.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ajouter des Utilisateurs',
            onPress: () => navigation.navigate('UserManagement'),
          },
        ],
      );
    } else {
      navigation.navigate('Game');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Compteur de Points</Text>
        <Text style={styles.subtitle}>Suivez les points dans vos jeux</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userCount}</Text>
            <Text style={styles.statLabel}>Utilisateurs Enregistrés</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartGame}
          >
            <Text style={styles.buttonText}>Nouvelle Partie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={styles.secondaryButtonText}>
              Gérer les Utilisateurs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Historique</Text>
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryIcon}>📋</Text>
            <Text style={styles.emptyHistoryText}>
              Aucun historique disponible
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 40,
  },
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
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});

export default HomeScreen;
