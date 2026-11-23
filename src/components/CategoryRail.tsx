import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Game } from '../types/game';
import { GameCard } from './GameCard';

interface CategoryRailProps {
  title: string;
  icon: string;
  description?: string;
  games: Game[];
  favorites: string[];
  onPlay: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  title,
  icon,
  description,
  games,
  favorites,
  onPlay,
  onToggleFavorite,
}) => {
  if (games.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Rail Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{games.length}</Text>
          </View>
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Horizontal Games Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favorites.includes(game.id)}
            onPlay={onPlay}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#1E2336',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#303752',
  },
  countText: {
    color: '#00F59B',
    fontSize: 10,
    fontWeight: '800',
  },
  description: {
    color: '#7E88A1',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
