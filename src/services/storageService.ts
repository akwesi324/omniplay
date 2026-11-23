import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, GameSaveState } from '../types/game';

const KEYS = {
  USER_PROFILE: '@omniplay_user_profile',
  FAVORITES: '@omniplay_favorites',
  SAVED_STATES: '@omniplay_saved_states',
  RECENTLY_PLAYED: '@omniplay_recently_played',
};

export const DEFAULT_USER: UserProfile = {
  id: 'user_player1',
  username: 'RetroStriker',
  gamerTag: '#007',
  email: 'player@omniplay.app',
  avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop',
  gamerLevel: 5,
  xp: 1420,
  registeredDate: '2026-11-20',
  totalGamesPlayed: 14,
  savedStatesCount: 6,
};

export const StorageService = {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with default player
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {}
  },

  async addXp(amount: number): Promise<UserProfile> {
    const user = await this.getUserProfile();
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    const updated = {
      ...user,
      xp: newXp,
      gamerLevel: newLevel,
      totalGamesPlayed: user.totalGamesPlayed + 1,
    };
    await this.saveUserProfile(updated);
    return updated;
  },

  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['game_space_invaders', 'game_retro_runner'];
    } catch (e) {
      return [];
    }
  },

  async toggleFavorite(gameId: string): Promise<string[]> {
    const favs = await this.getFavorites();
    const updated = favs.includes(gameId)
      ? favs.filter((id) => id !== gameId)
      : [...favs, gameId];
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  },

  async saveGameState(save: GameSaveState): Promise<void> {
    try {
      const existing = await this.getSavedStates();
      const filtered = existing.filter((s) => s.gameId !== save.gameId);
      const updated = [save, ...filtered];
      await AsyncStorage.setItem(KEYS.SAVED_STATES, JSON.stringify(updated));
      
      const user = await this.getUserProfile();
      await this.saveUserProfile({
        ...user,
        savedStatesCount: updated.length,
      });
    } catch (e) {}
  },

  async getSavedStates(): Promise<GameSaveState[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_STATES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  async getSaveForGame(gameId: string): Promise<GameSaveState | null> {
    const states = await this.getSavedStates();
    return states.find((s) => s.gameId === gameId) || null;
  },

  async logRecentlyPlayed(gameId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECENTLY_PLAYED);
      const recents: string[] = data ? JSON.parse(data) : [];
      const updated = [gameId, ...recents.filter((id) => id !== gameId)].slice(0, 10);
      await AsyncStorage.setItem(KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
    } catch (e) {}
  },

  async getRecentlyPlayed(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
};
