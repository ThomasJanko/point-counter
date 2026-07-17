import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { Game } from '../types';
import { useTheme } from '../theme';
import { ACCENT_COLORS, FONTS } from '../theme/types';
import GameHistory from '../components/GameHistory';

const BRAND_COLORS = ACCENT_COLORS.map(a => a.value);

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
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        {BRAND_COLORS.map(color => (
          <View key={color} style={[styles.topBarSegment, { backgroundColor: color }]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.mosaic}>
            {BRAND_COLORS.map(color => (
              <View key={color} style={[styles.mosaicSquare, { backgroundColor: color }]} />
            ))}
          </View>
          <Text style={[styles.appTitle, { color: theme.colors.text }]}>Tablée</Text>
          <TouchableOpacity
            style={[styles.gearButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Paramètres"
          >
            <Text style={[styles.gearIcon, { color: theme.colors.text }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.playerCountLabel, { color: theme.colors.textSecondary }]}>
          {userCount} JOUEUR{userCount !== 1 ? 'S' : ''} ENREGISTRÉ{userCount !== 1 ? 'S' : ''}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.outlinedButton, { borderColor: theme.colors.primary }]}
            onPress={handleStartGame}
          >
            <Text style={[styles.outlinedButtonText, { color: theme.colors.primary }]}>
              🎲 NOUVELLE PARTIE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.surfaceButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={[styles.surfaceButtonText, { color: theme.colors.text }]}>
              Gérer les joueurs
            </Text>
          </TouchableOpacity>
        </View>

        <GameHistory
          games={games}
          onLoadGame={handleLoadGame}
          onDeleteGame={handleDeleteGame}
          onDeleteAllGames={handleDeleteAllGames}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    height: 4,
  },
  topBarSegment: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  mosaic: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mosaicSquare: {
    width: 16,
    height: 16,
  },
  appTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: FONTS.titleExtraBold,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 18,
  },
  playerCountLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  buttonGroup: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  outlinedButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlinedButtonText: {
    fontSize: 14,
    fontFamily: FONTS.titleBold,
    letterSpacing: 0.5,
  },
  surfaceButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  surfaceButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
  },
});

export default HomeScreen;
