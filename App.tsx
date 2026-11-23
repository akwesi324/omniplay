import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Game, UserProfile } from './src/types/game';
import { GAMES_CATALOG, CATEGORIES_METADATA } from './src/data/gamesCatalog';
import { StorageService } from './src/services/storageService';
import { HeaderBar } from './src/components/HeaderBar';
import { CategoryRail } from './src/components/CategoryRail';
import { GameCard } from './src/components/GameCard';
import { GamePlayerModal } from './src/components/GamePlayerModal';
import { AuthModal } from './src/components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load user profile & favorites on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await StorageService.getUserProfile();
      if (user) {
        setCurrentUser(user);
      }
      const favs = await StorageService.getFavorites();
      setFavorites(favs || []);
    } catch (err) {
      console.warn('Error loading user', err);
    }
  };

  const handleToggleFavorite = async (gameId: string) => {
    const updated = await StorageService.toggleFavorite(gameId);
    setFavorites(updated);
  };

  const handlePlayGame = async (game: Game) => {
    setSelectedGame(game);
    setIsPlayerOpen(true);
    await StorageService.logRecentlyPlayed(game.id);
  };

  const handleXpGained = async (xpGain: number) => {
    const updatedUser = await StorageService.addXp(xpGain);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  // Filtered games based on activeTab and searchQuery
  const getFilteredGames = (): Game[] => {
    let list: Game[] = GAMES_CATALOG;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return list.filter(
        (g: Game) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.origin.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'favorites') {
      return list.filter((g: Game) => favorites.includes(g.id));
    }

    if (activeTab === 'off-store') {
      return list.filter((g: Game) => g.origin === 'Off-Store Preserved');
    }

    if (activeTab !== 'all') {
      return list.filter((g: Game) => g.category === activeTab);
    }

    return list;
  };

  const filteredGames = getFilteredGames();
  const featuredGame: Game =
    GAMES_CATALOG.find((g: Game) => g.category === 'featured') || GAMES_CATALOG[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        {/* Header Bar */}
        <HeaderBar
          user={currentUser}
          searchQuery={searchQuery}
          isSearchOpen={isSearchOpen}
          onToggleSearch={() => {
            setIsSearchOpen((prev) => !prev);
            if (isSearchOpen) setSearchQuery('');
          }}
          onChangeSearch={setSearchQuery}
          onOpenProfile={() => setIsAuthOpen(true)}
        />

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
              onPress={() => setActiveTab('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                🎮 ALL GAMES ({GAMES_CATALOG.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabPill,
                styles.tabPillOffStore,
                activeTab === 'off-store' && styles.tabPillActiveOffStore,
              ]}
              onPress={() => setActiveTab('off-store')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  styles.tabTextOffStore,
                  activeTab === 'off-store' && styles.tabTextActive,
                ]}
              >
                💾 OFF-STORE PRESERVED
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'favorites' && styles.tabPillActive]}
              onPress={() => setActiveTab('favorites')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
                ❤️ SAVED ({favorites.length})
              </Text>
            </TouchableOpacity>

            {CATEGORIES_METADATA.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabPill, activeTab === cat.id && styles.tabPillActive]}
                onPress={() => setActiveTab(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === cat.id && styles.tabTextActive]}>
                  {cat.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content Area */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Spotlight Hero Banner (Only on 'All' tab with no active search) */}
          {activeTab === 'all' && searchQuery.trim().length === 0 && (
            <View style={styles.heroCard}>
              <Image
                source={{ uri: featuredGame.coverUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroGradient}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.heroSpotlightTag}>
                    <Text style={styles.heroSpotlightText}>🔥 FEATURED RELEASE</Text>
                  </View>
                  <View style={styles.heroFootprintTag}>
                    <Text style={styles.heroFootprintText}>📦 {featuredGame.sizeMb} MB</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>{featuredGame.title}</Text>
                <Text style={styles.heroTagline} numberOfLines={2}>
                  {featuredGame.description}
                </Text>

                <View style={styles.heroActions}>
                  <TouchableOpacity
                    style={styles.heroPlayBtn}
                    onPress={() => handlePlayGame(featuredGame)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.heroPlayText}>▶ LAUNCH FULL GAME</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.heroFavBtn}
                    onPress={() => handleToggleFavorite(featuredGame.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heroFavText}>
                      {favorites.includes(featuredGame.id) ? '❤️ SAVED' : '🤍 SAVE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* If Active Tab is 'all' and no search: Show Category Rails */}
          {activeTab === 'all' && searchQuery.trim().length === 0 ? (
            <>
              {/* Preserved / Off-Store Rail */}
              <CategoryRail
                title="Preserved Off-Store Classics"
                icon="💾"
                description="Iconic titles preserved and playable without store limits"
                games={GAMES_CATALOG.filter((g: Game) => g.origin === 'Off-Store Preserved')}
                favorites={favorites}
                onPlay={handlePlayGame}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* Rails per Category */}
              {CATEGORIES_METADATA.map((cat) => {
                const catGames = GAMES_CATALOG.filter((g: Game) => g.category === cat.id);
                return (
                  <CategoryRail
                    key={cat.id}
                    title={cat.label}
                    icon={cat.icon}
                    description={cat.description}
                    games={catGames}
                    favorites={favorites}
                    onPlay={handlePlayGame}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
            </>
          ) : (
            /* Filtered Grid View for specific Tab or Search */
            <View style={styles.filteredContainer}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : activeTab === 'favorites'
                    ? 'Saved Favorites'
                    : activeTab === 'off-store'
                    ? 'Off-Store Preserved Titles'
                    : CATEGORIES_METADATA.find((c) => c.id === activeTab)?.label}
                </Text>
                <Text style={styles.filterCount}>{filteredGames.length} titles found</Text>
              </View>

              {filteredGames.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🕹️</Text>
                  <Text style={styles.emptyTitle}>No games found</Text>
                  <Text style={styles.emptySub}>
                    Try searching for another genre, title, or check back later!
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsGrid}>
                  {filteredGames.map((game: Game) => (
                    <View key={game.id} style={styles.gridCardWrapper}>
                      <GameCard
                        game={game}
                        isFavorite={favorites.includes(game.id)}
                        onPlay={handlePlayGame}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Footer Footprint Certification */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerTitle}>OMNIPLAY ULTRA-LIGHT ARCHIVE</Text>
            <Text style={styles.footerText}>
              Every title executes via high-speed native canvas & WebGL virtualization engines,
              enabling thousands of retro, indie, and preserved games without exceeding 1GB
              storage. All game states and user profiles sync securely locally and to the cloud.
            </Text>
          </View>
        </ScrollView>

        {/* Game Player Fullscreen Modal */}
        <GamePlayerModal
          game={selectedGame}
          visible={isPlayerOpen}
          user={currentUser}
          onClose={() => setIsPlayerOpen(false)}
          onXpGained={handleXpGained}
        />

        {/* User Auth / Profile Modal */}
        <AuthModal
          visible={isAuthOpen}
          currentUser={currentUser}
          onClose={() => setIsAuthOpen(false)}
          onUserSaved={(user: UserProfile) => {
            setCurrentUser(user);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0B10',
  },
  root: {
    flex: 1,
    backgroundColor: '#0A0B10',
  },
  tabsContainer: {
    backgroundColor: '#0E1018',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E2E',
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#161926',
    borderWidth: 1,
    borderColor: '#262D42',
  },
  tabPillActive: {
    backgroundColor: '#00F59B',
    borderColor: '#00F59B',
  },
  tabPillOffStore: {
    borderColor: '#FF336666',
  },
  tabPillActiveOffStore: {
    backgroundColor: '#FF3366',
    borderColor: '#FF3366',
  },
  tabText: {
    color: '#8B95B3',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#0A0B10',
    fontWeight: '900',
  },
  tabTextOffStore: {
    color: '#FF6688',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    margin: 16,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#161926',
    borderWidth: 1,
    borderColor: '#262E44',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 16, 0.75)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroSpotlightTag: {
    backgroundColor: '#00F59B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  heroSpotlightText: {
    color: '#0A0B10',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroFootprintTag: {
    backgroundColor: '#1A2133',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00D2FF44',
  },
  heroFootprintText: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTagline: {
    color: '#B3BCCC',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPlayBtn: {
    flex: 1,
    backgroundColor: '#00F59B',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#00F59B',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  heroPlayText: {
    color: '#0A0B10',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  heroFavBtn: {
    backgroundColor: '#1A2033',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F3854',
  },
  heroFavText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  filteredContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  filterCount: {
    color: '#00F59B',
    fontSize: 12,
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridCardWrapper: {
    marginBottom: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    color: '#7E88A1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
  },
  footerInfo: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#10131E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D2336',
  },
  footerTitle: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  footerText: {
    color: '#6F7994',
    fontSize: 11,
    lineHeight: 16,
  },
});
