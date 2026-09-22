// src/features/library/screens/LibraryScreen.tsx
// Migrated from app/(app)/library/index.tsx.
// useFocusEffect from expo-router -> same name/signature from
// @react-navigation/native, a genuine drop-in replacement.
import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/supabase'

type TrackingItem = Database['public']['Tables']['tracking']['Row']
type ContentType = 'all' | 'anime' | 'manga' | 'game'
type StatusFilter = 'all' | 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  watching: { label: 'Watching', color: '#00D1FF' },
  completed: { label: 'Completed', color: '#2EE59D' },
  plan_to_watch: { label: 'Plan to watch', color: '#7B8496' },
  on_hold: { label: 'On hold', color: '#FFB347' },
  dropped: { label: 'Dropped', color: '#FF6B6B' },
}

const CONTENT_TABS: { id: ContentType; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '◈' },
  { id: 'anime', label: 'Anime', emoji: '▶' },
  { id: 'manga', label: 'Manga', emoji: '📖' },
  { id: 'game', label: 'Games', emoji: '🎮' },
]

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Done' },
  { id: 'plan_to_watch', label: 'Planning' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
]

function LibraryCard({ item, onPress }: { item: TrackingItem; onPress: () => void }) {
  const status = STATUS_LABELS[item.status ?? 'plan_to_watch']
  const metadata = item.metadata as Record<string, any> | null

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1, margin: 6 }}>
      <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#141826', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        {item.cover_image ? (
          <Image
            source={{ uri: item.cover_image }}
            style={{ width: '100%', aspectRatio: item.content_type === 'game' ? 16 / 9 : 2 / 3 }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#1B2133', '#0B0F17']}
            style={{ width: '100%', aspectRatio: item.content_type === 'game' ? 16 / 9 : 2 / 3 }}
          />
        )}
        <View style={{ padding: 8 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginBottom: 4 }} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: `${status.color}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: status.color, fontSize: 9, fontWeight: '600' }}>{status.label}</Text>
            </View>
            {item.content_type === 'game' && metadata?.playtime_hours > 0 && (
              <Text style={{ color: '#7B8496', fontSize: 9 }}>{metadata.playtime_hours}h</Text>
            )}
            {item.rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ color: '#FFB347', fontSize: 9 }}>★</Text>
                <Text style={{ color: '#7B8496', fontSize: 9 }}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export function LibraryScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [items, setItems] = useState<TrackingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeType, setActiveType] = useState<ContentType>('all')
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all')

  const loadLibrary = useCallback(async () => {
    if (!user) return
    setIsLoading(true)

    const { data } = await supabase
      .from('tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    setItems(data ?? [])
    setIsLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      loadLibrary()
    }, [user, loadLibrary])
  )

  const filtered = items.filter((item) => {
    const typeMatch = activeType === 'all' || item.content_type === activeType
    const statusMatch = activeStatus === 'all' || item.status === activeStatus
    return typeMatch && statusMatch
  })

  const stats = {
    anime: items.filter((i) => i.content_type === 'anime').length,
    manga: items.filter((i) => i.content_type === 'manga').length,
    games: items.filter((i) => i.content_type === 'game').length,
    completed: items.filter((i) => i.status === 'completed').length,
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.1)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>My Library</Text>
          <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>Your anime, manga & gaming collection</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            {[
              { label: 'Anime', value: stats.anime, color: '#6C5CE7' },
              { label: 'Manga', value: stats.manga, color: '#00D1FF' },
              { label: 'Games', value: stats.games, color: '#2EE59D' },
              { label: 'Completed', value: stats.completed, color: '#FFB347' },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{ flex: 1, backgroundColor: '#141826', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <Text style={{ color: stat.color, fontSize: 18, fontWeight: '800' }}>{stat.value}</Text>
                <Text style={{ color: '#7B8496', fontSize: 10, marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: '#0B0F17', paddingBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}>
            {CONTENT_TABS.map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => setActiveType(tab.id)} activeOpacity={0.8}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor: activeType === tab.id ? '#6C5CE7' : '#141826',
                    borderWidth: 1,
                    borderColor: activeType === tab.id ? '#6C5CE7' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{tab.emoji}</Text>
                  <Text style={{ color: activeType === tab.id ? '#fff' : '#7B8496', fontSize: 13, fontWeight: activeType === tab.id ? '600' : '400' }}>
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}>
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => setActiveStatus(tab.id)} activeOpacity={0.8}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 100,
                    backgroundColor: activeStatus === tab.id ? 'rgba(108,92,231,0.2)' : 'transparent',
                    borderWidth: 1,
                    borderColor: activeStatus === tab.id ? 'rgba(108,92,231,0.5)' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ color: activeStatus === tab.id ? '#8B7FF0' : '#7B8496', fontSize: 12, fontWeight: activeStatus === tab.id ? '600' : '400' }}>
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#6C5CE7" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>
              {activeType === 'game' ? '🎮' : activeType === 'manga' ? '📖' : activeType === 'anime' ? '▶' : '◈'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
              Nothing here yet
            </Text>
            <Text style={{ color: '#7B8496', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              {activeType === 'game' ? 'Connect your Steam account to import your games' : 'Start discovering and adding content to your library'}
            </Text>
            <TouchableOpacity
              onPress={() =>
                activeType === 'game'
                  ? navigation.navigate('ConnectSteam' as never)
                  : navigation.navigate('Discover' as never)
              }
              style={{ marginTop: 20 }}
            >
              <LinearGradient colors={['#6C5CE7', '#8B7FF0']} style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {activeType === 'game' ? 'Connect Steam' : 'Discover content'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            <Text style={{ color: '#7B8496', fontSize: 12, paddingHorizontal: 6, marginBottom: 8 }}>
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {filtered.map((item) => (
                <View key={item.id} style={{ width: '33.33%' }}>
                  <LibraryCard
                    item={item}
                    onPress={() => {
                      if (item.content_type !== 'game') {
                        navigation.navigate('MediaDetail' as never, {
                          id: item.external_id,
                          type: item.content_type.toUpperCase(),
                        } as never)
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}
