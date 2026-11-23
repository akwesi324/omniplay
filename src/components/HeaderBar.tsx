import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { UserProfile } from '../types/game';

interface HeaderBarProps {
  user: UserProfile | null;
  searchQuery: string;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  onChangeSearch: (query: string) => void;
  onOpenProfile: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  searchQuery,
  isSearchOpen,
  onToggleSearch,
  onChangeSearch,
  onOpenProfile,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand & Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandIcon}>⚡</Text>
          <View>
            <Text style={styles.brandName}>
              OMNI<Text style={styles.brandAccent}>PLAY</Text>
            </Text>
            <Text style={styles.subBrand}>UNIVERSAL ARCADE</Text>
          </View>
        </View>

        {/* Right Action Cluster */}
        <View style={styles.rightActions}>
          {/* Search Toggle Button */}
          <TouchableOpacity
            style={[styles.iconBtn, isSearchOpen && styles.iconBtnActive]}
            onPress={onToggleSearch}
            activeOpacity={0.7}
          >
            <Text style={styles.btnIconText}>{isSearchOpen ? '✕' : '🔍'}</Text>
          </TouchableOpacity>

          {/* User Profile Pill */}
          <TouchableOpacity
            style={styles.profilePill}
            onPress={onOpenProfile}
            activeOpacity={0.7}
          >
            {user ? (
              <>
                <Text style={styles.avatarEmoji}>👾</Text>
                <View style={styles.userTextCol}>
                  <Text style={styles.gamerTag} numberOfLines={1}>
                    {user.gamerTag}
                  </Text>
                  <Text style={styles.lvlBadge}>
                    LVL {user.gamerLevel} • {user.xp} XP
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.registerBadge}>
                <Text style={styles.registerText}>+ REGISTER PASS</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search all on & off-store games..."
            placeholderTextColor="#5B6482"
            value={searchQuery}
            onChangeText={onChangeSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeSearch('')}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Under 1GB Guarantee Banner */}
      <View style={styles.guaranteeBanner}>
        <View style={styles.guaranteeDot} />
        <Text style={styles.guaranteeText}>
          LIGHTWEIGHT CLOUD INSTANT ARCHIVE • TOTAL FOOTPRINT &lt; 30MB (UNDER 1GB LIMIT)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F111A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2436',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    fontSize: 24,
    color: '#00F59B',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: '#00F59B',
  },
  subBrand: {
    color: '#00D2FF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1B1F2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#293047',
  },
  iconBtnActive: {
    borderColor: '#00F59B',
    backgroundColor: '#00F59B18',
  },
  btnIconText: {
    fontSize: 14,
    color: '#FFF',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C2B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2F3652',
    gap: 6,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  userTextCol: {
    maxWidth: 90,
  },
  gamerTag: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  lvlBadge: {
    color: '#00F59B',
    fontSize: 9,
    fontWeight: '700',
  },
  registerBadge: {
    backgroundColor: '#00F59B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  registerText: {
    color: '#0A0B10',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  searchContainer: {
    position: 'relative',
    marginVertical: 6,
  },
  searchInput: {
    backgroundColor: '#161926',
    borderWidth: 1,
    borderColor: '#00D2FF66',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    top: 9,
  },
  clearSearchText: {
    color: '#7E88A1',
    fontSize: 14,
    fontWeight: '700',
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141F',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#1D2233',
    gap: 6,
  },
  guaranteeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F59B',
  },
  guaranteeText: {
    color: '#7D87A0',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
