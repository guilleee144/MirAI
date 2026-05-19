// app/(app)/discover.tsx
import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTrendingAnime, useTrendingManga, useSearchMedia } from '@/features/discover/hooks/useAniList'
import { getTitle, formatScore, type AniListMedia } from '@/services/anilist'
import { useDebounce } from '@/hooks/useDebounce'

type Tab = 'foryou' | 'anime' | 'manga'

function MediaCard({ media }: { media: AniListMedia }) {
  const router = useRouter()
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(app)/media/${media.id}?type=${media.type}` as any)}
    >
      <View style={{ width: 130, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        {media.coverImage.large ? (
          <Image
            source={{ uri: media.coverImage.large }}
            style={{ width: 130, height: 190 }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#1B2133', '#0B0F17']}
            style={{ width: 130, height: 190 }}
          />
        )}
        <View style={{ padding: 8, backgroundColor: '#141826' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
            {getTitle(media)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Text style={{ color: '#FFB347', fontSize: 10 }}>★</Text>
            <Text style={{ color: '#7B8496', fontSize: 10 }}>{formatScore(media.averageScore)}</Text>
            {media.genres[0] && (
              <Text style={{ color: '#7B8496', fontSize: 10 }} numberOfLines={1}>· {media.genres[0]}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function MediaRow({ title, data, isLoading, listType }: {
  title: string
  data: AniListMedia[] | undefined
  isLoading: boolean
  listType: string
}) {
  const router = useRouter()

  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <TouchableOpacity onPress={() => router.push(`/(app)/list/${listType}` as any)}>
          <Text style={{ color: '#6C5CE7', fontSize: 13 }}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ height: 190, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {data?.map((item) => <MediaCard key={item.id} media={item} />)}
        </ScrollView>
      )}
    </View>
  )
}

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('foryou')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 400)

  const { data: trendingAnime, isLoading: loadingAnime } = useTrendingAnime(10)
  const { data: trendingManga, isLoading: loadingManga } = useTrendingManga(10)
  const { data: searchResults, isLoading: loadingSearch } = useSearchMedia(
    debouncedSearch,
    activeTab === 'manga' ? 'MANGA' : 'ANIME'
  )

  const isSearching = debouncedSearch.length >= 2

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>Discover</Text>
          <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>Find your next obsession</Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#141826', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 10 }}>
            <Text style={{ color: '#7B8496', fontSize: 16 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: '#fff', fontSize: 15 }}
              placeholder="Search anime, manga..."
              placeholderTextColor="#7B8496"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: '#7B8496', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 }}>
          {(['foryou', 'anime', 'manga'] as Tab[]).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: activeTab === tab ? '#6C5CE7' : '#141826', borderWidth: 1, borderColor: activeTab === tab ? '#6C5CE7' : 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: activeTab === tab ? '#fff' : '#7B8496', fontSize: 14, fontWeight: activeTab === tab ? '600' : '400' }}>
                  {tab === 'foryou' ? 'For you' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search results */}
        {isSearching && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: '#B8C1D1', fontSize: 14, paddingHorizontal: 20, marginBottom: 14 }}>
              Results for "{debouncedSearch}"
            </Text>
            {loadingSearch ? (
              <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#6C5CE7" />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {searchResults?.media.map((item) => <MediaCard key={item.id} media={item} />)}
              </ScrollView>
            )}
          </View>
        )}

        {/* Content */}
        {!isSearching && (
          <>
            {(activeTab === 'foryou' || activeTab === 'anime') && (
              <MediaRow title="Trending Anime" data={trendingAnime?.media} isLoading={loadingAnime} listType="trending-anime" />
            )}
            {(activeTab === 'foryou' || activeTab === 'manga') && (
              <MediaRow title="Trending Manga" data={trendingManga?.media} isLoading={loadingManga} listType="trending-manga" />
            )}
          </>
        )}

      </ScrollView>
    </View>
  )
}