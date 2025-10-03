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
    <View style={styles.historyContainer}>
      <View style={styles.header}>
        <Text style={styles.historyTitle}>Historique</Text>
        {games.length > 0 && (
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteAllButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      {games.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par titre ou joueur..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {filteredGames.length === 0 && games.length > 0 && (
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchIcon}>🔍</Text>
          <Text style={styles.emptySearchText}>
            Aucune partie trouvée pour "{searchQuery}"
          </Text>
        </View>
      )}
      {games.length === 0 && (
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyHistoryIcon}>📋</Text>
          <Text style={styles.emptyHistoryText}>
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
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAllButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
    color: '#a0a0a0',
    textAlign: 'center',
  },
  gamesScrollView: {
    maxHeight: 400,
  },
});

export default GameHistory;
