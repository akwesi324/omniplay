import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Game, UserProfile } from '../types/game';
import VirtualGamepad from './VirtualGamepad';
import { StorageService } from '../services/storageService';

let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview not loaded on native', e);
  }
}

interface GamePlayerModalProps {
  game: Game | null;
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onXpGained?: (xp: number) => void;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({
  game,
  visible,
  user,
  onClose,
  onXpGained,
}) => {
  const webViewRef = useRef<any>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showController, setShowController] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Session timer and XP awards
  useEffect(() => {
    if (!visible || !game) {
      setSessionSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        // Reward 15 XP every 30 seconds
        if (next > 0 && next % 30 === 0 && onXpGained) {
          onXpGained(15);
          showToast('+15 XP Earned! 🎮');
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, game]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleControl = (action: 'BTN_DOWN' | 'BTN_UP', btn: string) => {
    if (!game) return;

    if (action === 'BTN_DOWN') {
      if (btn === 'SAVE') {
        saveState();
        return;
      }
      if (btn === 'SELECT') {
        setShowController((prev) => !prev);
        showToast(showController ? 'Gamepad Hidden' : 'Gamepad Visible');
        return;
      }
    }

    const payload = JSON.stringify({ type: action, btn });

    if (Platform.OS === 'web') {
      const iframe = document.getElementById('omniplay-game-frame') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(payload, '*');
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.postMessage(payload);
        webViewRef.current.injectJavaScript(`
          (function() {
            try {
              var payload = ${JSON.stringify(payload)};
              var event = new MessageEvent('message', { data: payload });
              window.dispatchEvent(event);
              document.dispatchEvent(event);
            } catch(e) {}
          })();
          true;
        `);
      }
    }
  };

  const saveState = async () => {
    if (!game || !user) {
      showToast('Log in to save state!');
      return;
    }
    await StorageService.saveGameState({
      gameId: game.id,
      timestamp: new Date().toISOString(),
      levelReached: 1,
      highScore: 100 + sessionSeconds * 10,
      stateData: JSON.stringify({ checkpoint: `Time: ${formatTime(sessionSeconds)}` }),
    });
    showToast('💾 Game State Saved!');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!game) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* HUD Top Bar */}
        <View style={styles.hudBar}>
          <TouchableOpacity style={styles.exitBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.exitBtnText}>✕ EXIT</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.gameTitle} numberOfLines={1}>
              {game.title}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.originBadge, getOriginBadgeStyle(game.origin)]}>
                <Text style={styles.originBadgeText}>{game.origin.toUpperCase()}</Text>
              </View>
              <Text style={styles.timerText}>⏱ {formatTime(sessionSeconds)}</Text>
              <Text style={styles.fpsText}>🟢 60 FPS</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.togglePadBtn}
            onPress={() => setShowController((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.togglePadText}>{showController ? '🎮 ON' : '🎮 OFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <Animated.View style={[styles.toastContainer, { opacity: toastAnim }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        {/* Game Execution Viewport */}
        <View style={styles.viewport}>
          {Platform.OS === 'web' ? (
            <iframe
              id="omniplay-game-frame"
              srcDoc={game.embeddedHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000000',
              }}
              title={game.title}
            />
          ) : (
            WebView && (
              <WebView
                ref={webViewRef}
                source={{ html: game.embeddedHtml }}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                allowsInlineMediaPlayback={true}
                scalesPageToFit={true}
                scrollEnabled={false}
                bounces={false}
              />
            )
          )}
        </View>

        {/* Console Controller Pad */}
        {showController && (
          <View style={styles.controllerContainer}>
            <VirtualGamepad
              onButtonPress={(btn: any) => handleControl('BTN_DOWN', btn)}
              onSaveState={saveState}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const getOriginBadgeStyle = (origin: string) => {
  switch (origin) {
    case 'Off-Store Preserved':
      return { backgroundColor: '#FF3366' };
    case 'Retro Arcade':
      return { backgroundColor: '#00D2FF' };
    case 'App Store Classic':
      return { backgroundColor: '#00F59B' };
    default:
      return { backgroundColor: '#7928CA' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B10',
    flexDirection: 'column',
  },
  hudBar: {
    height: 56,
    backgroundColor: '#12141F',
    borderBottomWidth: 1,
    borderBottomColor: '#202436',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  exitBtn: {
    backgroundColor: '#202436',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333852',
  },
  exitBtnText: {
    color: '#FF3366',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  gameTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  originBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  originBadgeText: {
    color: '#0A0B10',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  timerText: {
    color: '#9E9E9E',
    fontSize: 10,
    fontWeight: '600',
  },
  fpsText: {
    color: '#00F59B',
    fontSize: 10,
    fontWeight: '700',
  },
  togglePadBtn: {
    backgroundColor: '#1E2333',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00D2FF44',
  },
  togglePadText: {
    color: '#00D2FF',
    fontWeight: '700',
    fontSize: 11,
  },
  toastContainer: {
    position: 'absolute',
    top: 68,
    alignSelf: 'center',
    backgroundColor: '#00F59B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#00F59B',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  toastText: {
    color: '#0A0B10',
    fontWeight: '900',
    fontSize: 12,
  },
  viewport: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controllerContainer: {
    height: 250,
    backgroundColor: '#0B0D14',
    borderTopWidth: 2,
    borderTopColor: '#1A1E2E',
  },
});
