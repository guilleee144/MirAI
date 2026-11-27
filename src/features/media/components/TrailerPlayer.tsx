// src/features/media/components/TrailerPlayer.tsx
// Full-screen modal that plays a Steam trailer with the native player (ExoPlayer on Android).
// The Video element only exists while the modal is open, so closing it stops playback.
import { useState } from 'react'
import { ActivityIndicator, Dimensions, Linking, Modal, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import Video from 'react-native-video'
import type { StoreTrailer } from '@/services/steamStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface TrailerPlayerProps {
  trailer: StoreTrailer
  /** Steam store page, offered if the trailer cannot be played. */
  fallbackUrl: string
  onClose: () => void
}

export function TrailerPlayer({ trailer, fallbackUrl, onClose }: TrailerPlayerProps) {
  const [isBuffering, setIsBuffering] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <View style={{ width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16, backgroundColor: '#000' }}>
          {!hasError && (
            <Video
              source={{ uri: trailer.videoUrl, type: trailer.videoType }}
              style={{ width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16 }}
              resizeMode="contain"
              controls
              onLoad={() => setIsBuffering(false)}
              onBuffer={({ isBuffering: buffering }) => setIsBuffering(buffering)}
              onError={() => setHasError(true)}
            />
          )}

          {isBuffering && !hasError && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#6C5CE7" size="large" />
            </View>
          )}

          {hasError && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#B8C1D1', fontSize: 14, textAlign: 'center', marginBottom: 14 }}>Couldn't play this trailer.</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(fallbackUrl).catch(() => undefined)}
                style={{ backgroundColor: '#6C5CE7', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Open in Steam</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            position: 'absolute',
            top: (StatusBar.currentHeight ?? 0) + 16,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}
