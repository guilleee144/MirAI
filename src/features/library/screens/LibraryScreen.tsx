// src/features/library/screens/LibraryScreen.tsx
// Anime, manga and games live in separate sections: stats, statuses and wording
// all belong to the selected section, nothing is mixed.
import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { EMPTY_STATES, getStatusLabel, LIBRARY_TABS, STATUS_FILTER_ORDER, type LibraryType, type StatusFilter } from '../constants'
import { getLibraryStats, getPlaytimeHours, type TrackingItem } from '../libraryStats'
import { useLibraryData } from '../hooks/useLibraryData'
import { LibraryCard } from '../components/LibraryCard'

export function LibraryScreen() {
  const navigation = useNavigation()
  const { items, isLoading, isSyncing, refresh } = useLibraryData()
  const [activeType, setActiveType] = useState<LibraryType>('anime')
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all')
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)

  const itemsByType = useMemo(() => {
    const grouped: Record<LibraryType, TrackingItem[]> = { anime: [], manga: [], game: [] }
    for (const item of items) grouped[item.content_type].push(item)
    grouped.game.sort((a, b) => getPlaytimeHours(b) - getPlaytimeHours(a))
    return grouped
  }, [items])

  // First load only: if there is no anime, open on the first section that has something.
  const didAutoSelect = useRef(false)
  useEffect(() => {
    if (isLoading || didAutoSelect.current) return
    didAutoSelect.current = true
    if (itemsByType.anime.length === 0) {
      const firstWithItems = LIBRARY_TABS.find((tab) => itemsByType[tab.id].length > 0)
      if (firstWithItems) setActiveType(firstWithItems.id)
    }
  }, [isLoading, itemsByType])

  const sectionItems = itemsByType[activeType]
  const visibleItems = activeStatus === 'all' ? sectionItems : sectionItems.filter((i) => i.status === activeStatus)
  const stats = getLibraryStats(sectionItems, activeType)
  const isGames = activeType === 'game'
  const emptyState = EMPTY_STATES[activeType]

  const selectType = (type: LibraryType) => {
    setActiveType(type)
    setActiveStatus('all')
  }

  const handlePullRefresh = async () => {
    setIsPullRefreshing(true)
    await refresh()
    setIsPullRefreshing(false)
  }

  const openItem = (item: TrackingItem) => {
    if (item.content_type === 'game') return
    navigation.navigate('MediaDetail' as never, { id: item.external_id, type: item.content_type.toUpperCase() } as never)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.1)', 'transparent']}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={isPullRefreshing} onRefresh={handlePullRefresh} tintColor="#6C5CE7" colors={['#6C5CE7']} />}
      >
        {/* Title + stats of the selected section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>My Library</Text>
            {/* Always rendered (only its opacity changes) so showing it never moves the layout. */}
            <View
              pointerEvents="none"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: 80, opacity: isSyncing && !isPullRefreshing ? 1 : 0 }}
            >
              <ActivityIndicator size="small" color="#6C5CE7" />
              <Text style={{ color: '#7B8496', fontSize: 12 }}>Syncing</Text>
            </View>
          </View>
          <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>
            {isGames ? 'Your games, synced with Steam' : 'Your lists, synced with AniList'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={{ flex: 1, backgroundColor: '#141826', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <Text style={{ color: stat.color, fontSize: 18, fontWeight: '800' }}>{stat.value}</Text>
                <Text style={{ color: '#7B8496', fontSize: 10, marginTop: 2 }} numberOfLines={1}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sticky: section tabs + status filters */}
        <View style={{ backgroundColor: '#0B0F17', paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}>
            {LIBRARY_TABS.map((tab) => {
              const active = activeType === tab.id
              return (
                <TouchableOpacity key={tab.id} onPress={() => selectType(tab.id)} activeOpacity={0.8} style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 9,
                      borderRadius: 100,
                      backgroundColor: active ? '#6C5CE7' : '#141826',
                      borderWidth: 1,
                      borderColor: active ? '#6C5CE7' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{tab.icon}</Text>
                    <Text style={{ color: active ? '#fff' : '#7B8496', fontSize: 13, fontWeight: active ? '600' : '400' }}>{tab.label}</Text>
                    <Text style={{ color: active ? 'rgba(255,255,255,0.7)' : '#4F586B', fontSize: 11 }}>{itemsByType[tab.id].length}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}>
            {(['all', ...STATUS_FILTER_ORDER] as StatusFilter[]).map((status) => {
              const active = activeStatus === status
              return (
                <TouchableOpacity key={status} onPress={() => setActiveStatus(status)} activeOpacity={0.8}>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 100,
                      backgroundColor: active ? 'rgba(108,92,231,0.2)' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? 'rgba(108,92,231,0.5)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Text style={{ color: active ? '#8B7FF0' : '#7B8496', fontSize: 12, fontWeight: active ? '600' : '400' }}>
                      {status === 'all' ? 'All' : getStatusLabel(activeType, status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#6C5CE7" size="large" />
          </View>
        ) : sectionItems.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>{emptyState.emoji}</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>{emptyState.title}</Text>
            <Text style={{ color: '#7B8496', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{emptyState.description}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate((emptyState.action === 'connect-steam' ? 'ConnectSteam' : 'ConnectAniList') as never)}
              style={{ marginTop: 20 }}
            >
              <LinearGradient colors={['#6C5CE7', '#8B7FF0']} style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {emptyState.action === 'connect-steam' ? 'Connect Steam' : 'Connect AniList'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {!isGames && (
              <TouchableOpacity onPress={() => navigation.navigate('Discover' as never)} style={{ marginTop: 14 }}>
                <Text style={{ color: '#6C5CE7', fontSize: 14, fontWeight: '600' }}>Discover content →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : visibleItems.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ color: '#7B8496', fontSize: 14 }}>Nothing with this status</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            <Text style={{ color: '#7B8496', fontSize: 12, paddingHorizontal: 6, marginBottom: 8 }}>
              {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {visibleItems.map((item) => (
                <View key={item.id} style={{ width: isGames ? '50%' : '33.33%' }}>
                  <LibraryCard item={item} onPress={() => openItem(item)} />
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
