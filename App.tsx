import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { AppNavigator } from './src/navigation/AppNavigator';
import { setupPlayer, PlaybackService } from './src/services/trackPlayerService';
import { usePlayerStore } from './src/stores/usePlayerStore';
import { colors, typography } from './src/theme';

// Register the playback service
TrackPlayer.registerPlaybackService(() => PlaybackService);

export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const ready = await setupPlayer();
        if (ready) {
          // Load persisted state from MMKV
          usePlayerStore.getState().loadPersistedState();
          setIsPlayerReady(true);
        } else {
          setError('Failed to initialize audio player');
        }
      } catch (err: any) {
        setError(err.message || 'Initialization failed');
      }
    }
    init();
  }, []);

  // Update position from Track Player periodically
  useEffect(() => {
    if (!isPlayerReady) return;

    const interval = setInterval(async () => {
      try {
        const position = await TrackPlayer.getPosition();
        const duration = await TrackPlayer.getDuration();
        const state = await TrackPlayer.getPlaybackState();

        usePlayerStore.getState().setPosition(position);
        usePlayerStore.getState().setDuration(duration);

        const isPlaying = state.state === 'playing';
        if (usePlayerStore.getState().isPlaying !== isPlaying) {
          usePlayerStore.getState().setIsPlaying(isPlaying);
        }
      } catch {
        // Player not ready yet
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayerReady]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubtext}>
          Please restart the app
        </Text>
      </View>
    );
  }

  if (!isPlayerReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
