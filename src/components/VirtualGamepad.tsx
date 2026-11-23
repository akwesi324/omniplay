import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface VirtualGamepadProps {
  onButtonPress: (btn: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'X' | 'Y' | 'START' | 'SELECT' | 'TURBO') => void;
  onSaveState?: () => void;
}

export default function VirtualGamepad({ onButtonPress, onSaveState }: VirtualGamepadProps) {
  const triggerHaptic = (btn: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onButtonPress(btn);
  };

  return (
    <View style={styles.container}>
      {/* Top Console Bar (Select, Start, Save State) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => triggerHaptic('SELECT')}
          style={styles.pillButton}
          activeOpacity={0.6}
        >
          <Text style={styles.pillText}>SELECT</Text>
        </TouchableOpacity>

        {onSaveState && (
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onSaveState();
            }}
            style={[styles.pillButton, styles.savePill]}
            activeOpacity={0.6}
          >
            <Ionicons name="save-outline" size={12} color="#00F59B" />
            <Text style={[styles.pillText, { color: '#00F59B' }]}>SAVE STATE</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => triggerHaptic('START')}
          style={[styles.pillButton, styles.startPill]}
          activeOpacity={0.6}
        >
          <Text style={[styles.pillText, { color: '#00D2FF' }]}>START</Text>
        </TouchableOpacity>
      </View>

      {/* Main Controls: D-PAD on Left, ACTION BUTTONS on Right */}
      <View style={styles.controlsRow}>
        {/* Directional D-Pad */}
        <View style={styles.dpadContainer}>
          {/* UP */}
          <TouchableOpacity
            onPress={() => triggerHaptic('UP')}
            style={[styles.dpadBtn, styles.dpadUp]}
            activeOpacity={0.5}
          >
            <Ionicons name="caret-up" size={20} color="#00F59B" />
          </TouchableOpacity>

          {/* LEFT & RIGHT ROW */}
          <View style={styles.dpadMiddleRow}>
            <TouchableOpacity
              onPress={() => triggerHaptic('LEFT')}
              style={[styles.dpadBtn, styles.dpadLeft]}
              activeOpacity={0.5}
            >
              <Ionicons name="caret-back" size={20} color="#00F59B" />
            </TouchableOpacity>

            <View style={styles.dpadCenter}>
              <View style={styles.dpadCenterDot} />
            </View>

            <TouchableOpacity
              onPress={() => triggerHaptic('RIGHT')}
              style={[styles.dpadBtn, styles.dpadRight]}
              activeOpacity={0.5}
            >
              <Ionicons name="caret-forward" size={20} color="#00F59B" />
            </TouchableOpacity>
          </View>

          {/* DOWN */}
          <TouchableOpacity
            onPress={() => triggerHaptic('DOWN')}
            style={[styles.dpadBtn, styles.dpadDown]}
            activeOpacity={0.5}
          >
            <Ionicons name="caret-down" size={20} color="#00F59B" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons: Diamond Layout (Y, X, B, A) */}
        <View style={styles.actionPadContainer}>
          {/* X Button (Top) */}
          <TouchableOpacity
            onPress={() => triggerHaptic('X')}
            style={[styles.actionBtn, styles.btnX]}
            activeOpacity={0.5}
          >
            <Text style={styles.actionBtnText}>X</Text>
          </TouchableOpacity>

          <View style={styles.actionMiddleRow}>
            {/* Y Button (Left) */}
            <TouchableOpacity
              onPress={() => triggerHaptic('Y')}
              style={[styles.actionBtn, styles.btnY]}
              activeOpacity={0.5}
            >
              <Text style={styles.actionBtnText}>Y</Text>
            </TouchableOpacity>

            {/* Spacer */}
            <View style={{ width: 14 }} />

            {/* A Button (Right) */}
            <TouchableOpacity
              onPress={() => triggerHaptic('A')}
              style={[styles.actionBtn, styles.btnA]}
              activeOpacity={0.5}
            >
              <Text style={[styles.actionBtnText, { color: '#00F59B' }]}>A</Text>
            </TouchableOpacity>
          </View>

          {/* B Button (Bottom) */}
          <TouchableOpacity
            onPress={() => triggerHaptic('B')}
            style={[styles.actionBtn, styles.btnB]}
            activeOpacity={0.5}
          >
            <Text style={[styles.actionBtnText, { color: '#FF3366' }]}>B</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c0e18',
    borderTopWidth: 1,
    borderTopColor: '#1e2235',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  pillButton: {
    backgroundColor: '#161926',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262c42',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  savePill: {
    borderColor: '#00F59B44',
    backgroundColor: '#00F59B11',
  },
  startPill: {
    borderColor: '#00D2FF44',
  },
  pillText: {
    color: '#8e96aa',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  // D-PAD
  dpadContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#171a28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#282f48',
  },
  dpadUp: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
  },
  dpadDown: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 0,
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderRightWidth: 0,
  },
  dpadRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderLeftWidth: 0,
  },
  dpadCenter: {
    width: 44,
    height: 44,
    backgroundColor: '#121420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#202538',
  },
  // ACTION BUTTONS
  actionPadContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#171a28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  btnA: {
    borderColor: '#00F59B',
    backgroundColor: '#00F59B15',
  },
  btnB: {
    borderColor: '#FF3366',
    backgroundColor: '#FF336615',
  },
  btnX: {
    borderColor: '#00D2FF',
    backgroundColor: '#00D2FF15',
  },
  btnY: {
    borderColor: '#FFCC00',
    backgroundColor: '#FFCC0015',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
});

