// src/features/media/components/GameMedia.tsx
// Trailer + screenshot gallery for a game. Tapping a screenshot opens a full-screen,
// swipeable viewer; the trailer plays in an in-app player.
import { useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, FlatList, Dimensions, StatusBar } from 'react-native'
import { TrailerPlayer } from '@/features/media/components/TrailerPlayer'
import type { StoreScreenshot, StoreTrailer } from '@/services/steamStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const THUMB_WIDTH = 240
const THUMB_HEIGHT = 135

interface GameMediaProps {
  gameId: number
  trailer: StoreTrailer | null
  screenshots: StoreScreenshot[]
}

function ScreenshotViewer({ screenshots, startIndex, onClose }: { screenshots: StoreScreenshot[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex)
  const listRef = useRef<FlatList<StoreScreenshot>>(null)

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' }}>
        <FlatList
          ref={listRef}
          data={screenshots}
          keyExtractor={(shot) => shot.full}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
          onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center' }}>
              <Image source={{ uri: item.full }} style={{ width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16 }} resizeMode="contain" />
            </View>
          )}
        />

        <View style={{ position: 'absolute', top: (StatusBar.currentHeight ?? 0) + 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: '#B8C1D1', fontSize: 14, fontWeight: '600' }}>
            {index + 1} / {screenshots.length}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export function GameMedia({ gameId, trailer, screenshots }: GameMediaProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  if (!trailer && screenshots.length === 0) return null

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Media</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }} style={{ marginHorizontal: -20 }}>
        {trailer && (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setIsTrailerOpen(true)}>
            <View style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1B2133' }}>
              <Image source={{ uri: trailer.thumbnail }} style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }} resizeMode="cover" />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,15,23,0.35)' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(108,92,231,0.9)', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 }}>
                  <Text style={{ color: '#fff', fontSize: 18 }}>▶</Text>
                </View>
              </View>
              <View style={{ position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(11,15,23,0.75)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>TRAILER</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {screenshots.map((shot, i) => (
          <TouchableOpacity key={shot.full} activeOpacity={0.85} onPress={() => setViewerIndex(i)}>
            <Image
              source={{ uri: shot.thumb }}
              style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1B2133' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isTrailerOpen && trailer && (
        <TrailerPlayer trailer={trailer} fallbackUrl={`https://store.steampowered.com/app/${gameId}`} onClose={() => setIsTrailerOpen(false)} />
      )}

      {viewerIndex !== null && <ScreenshotViewer screenshots={screenshots} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
    </View>
  )
}
