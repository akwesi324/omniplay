import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Game } from '../types/game';

interface GameCardProps {
  game: Game;
  isFavorite?: boolean;
  onPlay: (game: Game) => void;
  onToggleFavorite?: (gameId: string) => void;
}

const CARD_WIDTH = 210;

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite = false,
  onPlay,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  const getOriginBadge = () => {
    switch (game.origin) {
      case 'Off-Store Preserved':
        return { label: 'PRESERVED / DELISTED', bg: '#FF3366', color: '#FFF' };
      case 'Retro Arcade':
        return { label: 'RETRO CLASSIC', bg: '#00D2FF', color: '#0A0B10' };
      case 'App Store Classic':
        return { label: 'STORE HIT', bg: '#00F59B', color: '#0A0B10' };
      case 'Indie Homebrew':
        return { label: 'HOMEBREW', bg: '#7928CA', color: '#FFF' };
      default:
        return { label: 'CLOUD PLAY', bg: '#7928CA', color: '#FFF' };
    }
  };

  const badge = getOriginBadge();

  return (
    <View style={styles.card}>
      {/* Thumbnail Area */}
      <View style={styles.thumbnailContainer}>
        {!imageError ? (
          <Image
            source={{ uri: game.coverUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.fallbackThumbnail}>
            <Text style={styles.fallbackIcon}>🎮</Text>
            <Text style={styles.fallbackTitle}>{game.title}</Text>
          </View>
        )}

        {/* Origin Badge */}
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => onToggleFavorite(game.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}

        {/* Instant play footprint badge */}
        <View style={styles.footprintBadge}>
          <Text style={styles.footprintText}>⚡ {game.sizeMb} MB</Text>
        </View>
      </View>

      {/* Info Area */}
      <View style={styles.infoArea}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.tagline} numberOfLines={2}>
          {game.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐ {game.rating.toFixed(1)}</Text>
          <Text style={styles.players}>👥 {game.playersCount}</Text>
          <Text style={styles.year}>{game.releaseYear}</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => onPlay(game)}
          activeOpacity={0.8}
        >
          <Text style={styles.playBtnText}>▶ INSTANT PLAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#131622',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23293D',
    overflow: 'hidden',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  thumbnailContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#1E2336',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  fallbackThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C2033',
    padding: 10,
  },
  fallbackIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  fallbackTitle: {
    color: '#00F59B',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(10, 11, 16, 0.75)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#363E5C',
  },
  favIcon: {
    fontSize: 13,
  },
  footprintBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00D2FF44',
  },
  footprintText: {
    color: '#00D2FF',
    fontSize: 9,
    fontWeight: '700',
  },
  infoArea: {
    padding: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    color: '#7E88A1',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 3,
    height: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1F2437',
  },
  rating: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '700',
  },
  players: {
    color: '#7E88A1',
    fontSize: 10,
    fontWeight: '600',
  },
  year: {
    color: '#00F59B',
    fontSize: 10,
    fontWeight: '800',
  },
  playBtn: {
    backgroundColor: '#00F59B',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00F59B',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playBtnText: {
    color: '#0A0B10',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
