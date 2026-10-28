import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Game } from '../types';
import { useTheme } from '../theme';
import { FONTS } from '../theme/types';
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
    if (game.name.toLowerCase().includes(query)) return true;
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
    <View>
      {games.length > 0 && (
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Rechercher une partie"
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <View style={styles.historyHeaderRow}>
        <Text style={[styles.historyLabel, { color: theme.colors.textTertiary }]}>
          HISTORIQUE
        </Text>
        {games.length > 0 && (
          <TouchableOpacity onPress={handleDeleteAll}>
            <Text style={[styles.clearAllText, { color: theme.colors.error }]}>
              Tout supprimer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredGames.length === 0 && games.length > 0 && (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Aucune partie trouvée pour « {searchQuery} »
        </Text>
      )}
      {games.length === 0 && (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Aucun historique disponible
        </Text>
      )}

      <View style={styles.list}>
        {filteredGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => onLoadGame(game)}
            onLongPress={() => onDeleteGame(game)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    borderWidth: 1,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  historyLabel: {
    fontSize: 11,
    fontFamily: FONTS.titleExtraBold,
    letterSpacing: 1,
  },
  clearAllText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center',
    paddingVertical: 30,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
});

export default GameHistory;
