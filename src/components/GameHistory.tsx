import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Game } from '../types';
import { useTheme } from '../theme';
import GameCard from './GameCard';

interface GameHistoryProps {
  games: Game[];
  onLoadGame: (game: Game) => void;
  onDeleteGame: (game: Game) => void;
  onDeleteAllGames: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({
  games,
  onLoadGame,
  onDeleteGame,
  onDeleteAllGames,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter(game => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search by game title
    if (game.name.toLowerCase().includes(query)) return true;

    // Search by player names
    return game.players.some(player =>
      player.name.toLowerCase().includes(query),
    );
  });

  const handleDeleteAll = () => {
    if (games.length === 0) return;

    Alert.alert(
      "Supprimer tout l'historique",
      `Voulez-vous supprimer toutes les ${games.length} parties de l'historique ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: onDeleteAllGames,
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.historyContainer,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
          Historique
        </Text>
        {games.length > 0 && (
          <TouchableOpacity
            style={[
              styles.deleteAllButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={handleDeleteAll}
          >
            <Text
              style={[styles.deleteAllButtonText, { color: theme.colors.text }]}
            >
              🗑️
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {games.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Rechercher par titre ou joueur..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {filteredGames.length === 0 && games.length > 0 && (
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchIcon}>🔍</Text>
          <Text
            style={[
              styles.emptySearchText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Aucune partie trouvée pour "{searchQuery}"
          </Text>
        </View>
      )}
      {games.length === 0 && (
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyHistoryIcon}>📋</Text>
          <Text
            style={[
              styles.emptyHistoryText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Aucun historique disponible
          </Text>
        </View>
      )}
      {filteredGames.length > 0 && (
        <ScrollView
          style={styles.gamesScrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => onLoadGame(game)}
              onLongPress={() => onDeleteGame(game)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  deleteAllButton: {
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAllButtonText: {
    fontSize: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
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
    textAlign: 'center',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptySearchText: {
    fontSize: 16,
    textAlign: 'center',
  },
  gamesScrollView: {
    maxHeight: 400,
  },
});

export default GameHistory;
