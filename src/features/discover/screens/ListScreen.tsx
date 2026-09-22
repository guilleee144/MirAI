// src/features/discover/screens/ListScreen.tsx
// Migrated from app/(app)/list/[type].tsx. Registered as 'ListAll' in AppStack.
import { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useQuery } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '@/app/navigation/types'
import { getTrendingAnime, getTrendingManga, getTopAnime, getTitle, formatScore, type AniListMedia } from '@/services/anilist'

type ListType = 'trending-anime' | 'trending-manga' | 'top-anime'

const LIST_CONFIG: Record<ListType, { title: string; subtitle: string }> = {
  'trending-anime': { title: 'Trending Anime', subtitle: 'Most popular right now' },
  'trending-manga': { title: 'Trending Manga', subtitle: 'Most read right now' },
  'top-anime': { title: 'Top Rated Anime', subtitle: 'All time best' },
}

function MediaGridCard({ media, onPress }: { media: AniListMedia; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1, margin: 6 }}>
      <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <Image source={{ uri: media.coverImage.large }} style={{ width: '100%', aspectRatio: 2 / 3 }} resizeMode="cover" />
        <View style={{ padding: 8, backgroundColor: '#141826' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }} numberOfLines={2}>
            {getTitle(media)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ color: '#FFB347', fontSize: 10 }}>★</Text>
            <Text style={{ color: '#7B8496', fontSize: 10 }}>{formatScore(media.averageScore)}</Text>
          </View>
          {media.genres[0] && (
            <View
              style={{
                backgroundColor: 'rgba(108,92,231,0.12)',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                alignSelf: 'flex-start',
                marginTop: 4,
              }}
            >
              <Text style={{ color: '#8B7FF0', fontSize: 9 }}>{media.genres[0]}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

type Props = NativeStackScreenProps<AppStackParamList, 'ListAll'>

export function ListScreen({ route, navigation }: Props) {
  const [page, setPage] = useState(1)
  const [allMedia, setAllMedia] = useState<AniListMedia[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)

  const listType = (route.params?.type as ListType) ?? 'trending-anime'
  const config = LIST_CONFIG[listType] ?? LIST_CONFIG['trending-anime']

  const fetchFn = listType === 'trending-anime' ? getTrendingAnime : listType === 'trending-manga' ? getTrendingManga : getTopAnime

  const { isLoading, isFetching } = useQuery({
    queryKey: ['list', listType, page],
    queryFn: async () => {
      const result = await fetchFn(page, 20)
      setAllMedia((prev) => (page === 1 ? result.media : [...prev, ...result.media]))
      setHasNextPage(result.pageInfo.hasNextPage)
      return result
    },
    staleTime: 1000 * 60 * 10,
  })

  const loadMore = useCallback(() => {
    if (!isFetching && hasNextPage) {
      setPage((prev) => prev + 1)
    }
  }, [isFetching, hasNextPage])

  const renderItem = useCallback(
    ({ item }: { item: AniListMedia }) => (
      <MediaGridCard media={item} onPress={() => navigation.push('MediaDetail', { id: String(item.id), type: item.type })} />
    ),
    [navigation]
  )

  const renderFooter = () => {
    if (!isFetching) return null
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator color="#6C5CE7" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.1)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#141826',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>{config.title}</Text>
          <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>{config.subtitle}</Text>
        </View>
      </View>

      {isLoading && allMedia.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" size="large" />
        </View>
      ) : (
        <FlatList
          data={allMedia}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
