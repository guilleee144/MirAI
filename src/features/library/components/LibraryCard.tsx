// src/features/library/components/LibraryCard.tsx
import { memo } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { getStatusLabel, STATUS_COLORS } from '../constants'
import { getPlaytimeHours, type TrackingItem } from '../libraryStats'

function LibraryCardBase({ item, onPress }: { item: TrackingItem; onPress: () => void }) {
  const isGame = item.content_type === 'game'
  const statusKey = item.status ?? 'plan_to_watch'
  const color = STATUS_COLORS[statusKey]
  const aspectRatio = isGame ? 16 / 9 : 2 / 3

  const hours = isGame ? getPlaytimeHours(item) : 0
  const showProgress = !isGame && !!item.progress && item.progress > 0 && statusKey !== 'completed' && statusKey !== 'plan_to_watch'
  const progressLabel = `${item.content_type === 'manga' ? 'Ch' : 'Ep'} ${item.progress}`

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1, margin: 6 }}>
      <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#141826', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        {item.cover_image ? (
          <Image source={{ uri: item.cover_image }} style={{ width: '100%', aspectRatio }} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#1B2133', '#0B0F17']} style={{ width: '100%', aspectRatio }} />
        )}
        <View style={{ padding: 8 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: `${color}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color, fontSize: 9, fontWeight: '600' }}>{getStatusLabel(item.content_type, item.status)}</Text>
            </View>
            {isGame && hours > 0 && <Text style={{ color: '#B8C1D1', fontSize: 10, fontWeight: '600' }}>{hours}h</Text>}
            {!isGame && !!item.rating && item.rating > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ color: '#FFB347', fontSize: 9 }}>★</Text>
                <Text style={{ color: '#7B8496', fontSize: 9 }}>{item.rating}</Text>
              </View>
            )}
          </View>
          {showProgress && <Text style={{ color: '#7B8496', fontSize: 9, marginTop: 4 }}>{progressLabel}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export const LibraryCard = memo(LibraryCardBase)
