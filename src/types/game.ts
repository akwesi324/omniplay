export type GameCategory =
  | 'featured'
  | 'retro_offstore'
  | 'action_combat'
  | 'arcade_classic'
  | 'puzzle_strategy'
  | 'racing_sports'
  | 'rpg_roguelike';

export type GameOrigin =
  | 'Off-Store Preserved'
  | 'Retro Arcade'
  | 'App Store Classic'
  | 'Indie Homebrew'
  | 'Cloud WebGL';

export interface Game {
  id: string;
  title: string;
  category: GameCategory;
  origin: GameOrigin;
  coverUrl: string;
  bannerUrl: string;
  rating: number;
  playersCount: string;
  description: string;
  releaseYear: number;
  tags: string[];
  controlsType: 'dpad_action' | 'analog_arcade' | 'touch_swipe' | 'universal_pad';
  embeddedHtml: string; // Offline instant playable 60FPS engine
  externalUrl?: string; // WebGL Cloud stream fallback
  sizeMb: number; // Stays microscopic: 0.2 MB - 3.5 MB
}

export interface UserProfile {
  id: string;
  username: string;
  gamerTag: string;
  email: string;
  avatarUrl: string;
  gamerLevel: number;
  xp: number;
  registeredDate: string;
  totalGamesPlayed: number;
  savedStatesCount: number;
}

export interface GameSaveState {
  gameId: string;
  timestamp: string;
  levelReached: number;
  highScore: number;
  stateData: string;
}

