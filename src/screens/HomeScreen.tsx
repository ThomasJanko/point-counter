import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { Game } from '../types';
import { useTheme } from '../theme';
import StatsCard from '../components/StatsCard';
import ActionButtons from '../components/ActionButtons';
import GameHistory from '../components/GameHistory';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { theme } = useTheme();
  const [userCount, setUserCount] = useState(0);
  const [games, setGames] = useState<Game[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserCount();
      loadGames();
    }, []),
  );

  const loadUserCount = async () => {
    const users = await storageService.getUsers();
    setUserCount(users.length);
  };

  const loadGames = async () => {
    const savedGames = await storageService.getGames();
    // Sort by date, most recent first
    const sortedGames = [...savedGames].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setGames(sortedGames);
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

  const handleLoadGame = (game: Game) => {
    Alert.alert('Charger la partie', `Voulez-vous charger "${game.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Charger',
        onPress: () => {
          navigation.navigate('Game', { savedGame: game });
        },
      },
    ]);
  };

  const handleDeleteGame = (game: Game) => {
    Alert.alert(
      'Supprimer la partie',
      `Voulez-vous supprimer "${game.name}" de l'historique ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            storageService.deleteGame(game.id).then(() => {
              loadGames();
            });
          },
        },
      ],
    );
  };

  const handleDeleteAllGames = () => {
    storageService.deleteAllGames().then(() => {
      loadGames();
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Compteur de Points</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Suivez les points dans vos jeux</Text>

        <StatsCard userCount={userCount} />

        <ActionButtons
          userCount={userCount}
          onStartGame={handleStartGame}
          navigation={navigation}
        />

        <GameHistory
          games={games}
          onLoadGame={handleLoadGame}
          onDeleteGame={handleDeleteGame}
          onDeleteAllGames={handleDeleteAllGames}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default HomeScreen;
