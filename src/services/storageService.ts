import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Game } from '../types';
import { ThemeMode } from '../theme/types';

const USERS_KEY = 'point_counter_users';
const GAMES_KEY = 'point_counter_games';
const THEME_MODE_KEY = 'point_counter_theme_mode';
const THEME_PRIMARY_COLOR_KEY = 'point_counter_theme_primary_color';

export const storageService = {
  // User management
  async getUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
  },

  async updateUser(updatedUser: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      await this.saveUsers(users);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    await this.saveUsers(filteredUsers);
  },

  // Game management
  async getGames(): Promise<Game[]> {
    try {
      const gamesJson = await AsyncStorage.getItem(GAMES_KEY);
      return gamesJson ? JSON.parse(gamesJson) : [];
    } catch (error) {
      console.error('Error getting games:', error);
      return [];
    }
  },

  async saveGame(game: Game): Promise<void> {
    try {
      const games = await this.getGames();
      games.push(game);
      await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  },

  async updateGame(updatedGame: Game): Promise<void> {
    try {
      const games = await this.getGames();
      const index = games.findIndex(game => game.id === updatedGame.id);
      if (index !== -1) {
        games[index] = updatedGame;
        await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(games));
      }
    } catch (error) {
      console.error('Error updating game:', error);
    }
  },

  async deleteGame(gameId: string): Promise<void> {
    try {
      const games = await this.getGames();
      const filteredGames = games.filter(game => game.id !== gameId);
      await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(filteredGames));
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  },

  async deleteAllGames(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GAMES_KEY);
    } catch (error) {
      console.error('Error deleting all games:', error);
    }
  },

  // Theme management
  async getThemeMode(): Promise<ThemeMode | 'auto' | null> {
    try {
      const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
      return mode as ThemeMode | 'auto' | null;
    } catch (error) {
      console.error('Error getting theme mode:', error);
      return null;
    }
  },

  async saveThemeMode(mode: ThemeMode | 'auto'): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  },

  async getThemePrimaryColor(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(THEME_PRIMARY_COLOR_KEY);
    } catch (error) {
      console.error('Error getting theme primary color:', error);
      return null;
    }
  },

  async saveThemePrimaryColor(color: string): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_PRIMARY_COLOR_KEY, color);
    } catch (error) {
      console.error('Error saving theme primary color:', error);
    }
  },
};
