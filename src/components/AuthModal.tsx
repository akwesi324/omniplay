import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { UserProfile } from '../types/game';
import { StorageService } from '../services/storageService';

interface AuthModalProps {
  visible: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onUserSaved: (user: UserProfile) => void;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop',
];

const EMOJI_AVATARS = ['👾', '🚀', '⚡', '🐉', '🎮', '🕹️', '🛡️', '💀', '🤖', '🦊'];

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  currentUser,
  onClose,
  onUserSaved,
}) => {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [gamerTag, setGamerTag] = useState(currentUser?.gamerTag || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarUrl || AVATARS[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim() || !gamerTag.trim()) {
      alert('Please fill in both Username and GamerTag.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser: UserProfile = {
        id: currentUser?.id || `user_${Date.now()}`,
        username: username.trim(),
        gamerTag: gamerTag.startsWith('#') ? gamerTag.trim() : `#${gamerTag.trim()}`,
        email: currentUser?.email || `${username.toLowerCase().replace(/\s+/g, '')}@omniplay.app`,
        avatarUrl: selectedAvatar,
        gamerLevel: currentUser?.gamerLevel || 1,
        xp: currentUser?.xp || 0,
        registeredDate: currentUser?.registeredDate || new Date().toISOString().split('T')[0],
        totalGamesPlayed: currentUser?.totalGamesPlayed || 0,
        savedStatesCount: currentUser?.savedStatesCount || 0,
        favorites: currentUser?.favorites || [],
      };

      await StorageService.saveUserProfile(updatedUser);
      onUserSaved(updatedUser);
      onClose();
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {currentUser ? 'PLAYER PROFILE' : 'REGISTER GAMER PASS'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            Instant cloud sync for all preserved and on-store games.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar Selection */}
            <Text style={styles.fieldLabel}>CHOOSE YOUR CALLSIGN ICON</Text>
            <View style={styles.avatarRow}>
              {EMOJI_AVATARS.map((av, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.avatarBubble,
                    selectedAvatar === AVATARS[idx % AVATARS.length] && styles.avatarBubbleSelected,
                  ]}
                  onPress={() => setSelectedAvatar(AVATARS[idx % AVATARS.length])}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <Text style={styles.fieldLabel}>PLAYER USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Mercer"
              placeholderTextColor="#555B77"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.fieldLabel}>GAMERTAG / CALLSIGN NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. #007 or #Viper99"
              placeholderTextColor="#555B77"
              value={gamerTag}
              onChangeText={setGamerTag}
              autoCapitalize="none"
            />

            {currentUser && (
              <View style={styles.statsBox}>
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>LVL {currentUser.gamerLevel}</Text>
                  <Text style={styles.statLabel}>Player Rank</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{currentUser.xp} XP</Text>
                  <Text style={styles.statLabel}>Total Experience</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{currentUser.savedStatesCount}</Text>
                  <Text style={styles.statLabel}>Save States</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {loading ? 'SYNCING...' : currentUser ? 'SAVE CHANGES' : 'REGISTER & PLAY'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#12141F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262C42',
    padding: 20,
    shadowColor: '#00F59B',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#00F59B',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#7D859E',
    fontSize: 16,
    fontWeight: '700',
  },
  subTitle: {
    color: '#8A92A6',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C2030',
    borderWidth: 1,
    borderColor: '#2E354F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBubbleSelected: {
    borderColor: '#00F59B',
    backgroundColor: '#00F59B22',
    transform: [{ scale: 1.08 }],
  },
  avatarEmoji: {
    fontSize: 20,
  },
  input: {
    backgroundColor: '#171B29',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2B324D',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: '#181C2B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E354F',
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  statLabel: {
    color: '#7E88A1',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#2E354F',
  },
  actionBtn: {
    backgroundColor: '#00F59B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#00F59B',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  actionBtnText: {
    color: '#0A0B10',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
