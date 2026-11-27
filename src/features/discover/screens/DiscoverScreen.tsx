// src/features/discover/screens/DiscoverScreen.tsx
// Anime + manga come from AniList, games from the Steam Store.
import { useState, type ReactNode } from 'react'
import { useNavigation } from '@react-navigation/native'
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTrendingAnime, useTrendingManga, useSearchMedia } from '@/features/discover/hooks/useAniList'
import { useStoreRow, useSearchGames } from '@/features/discover/hooks/useSteamStore'
import { GameCard, GameRow } from '@/features/discover/components/GameCard'
import { getTitle, formatScore, type AniListMedia } from '@/services/anilist'
import { useDebounce } from '@/hooks/useDebounce'

type Tab = 'foryou' | 'anime' | 'manga' | 'games'

const TABS: { id: Tab; label: string }[] = [
  { id: 'foryou', label: 'For you' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'games', label: 'Games' },
]

function MediaCard({ media }: { media: AniListMedia }) {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('MediaDetail' as never, { id: String(media.id), type: media.type } as never)}
    >
      <View
        style={{ width: 130, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {media.coverImage.large ? (
          <Image source={{ uri: media.coverImage.large }} style={{ width: 130, height: 190 }} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#1B2133', '#0B0F17']} style={{ width: 130, height: 190 }} />
        )}
        <View style={{ padding: 8, backgroundColor: '#141826' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
            {getTitle(media)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Text style={{ color: '#FFB347', fontSize: 10 }}>★</Text>
            <Text style={{ color: '#7B8496', fontSize: 10 }}>{formatScore(media.averageScore)}</Text>
            {media.genres[0] && (
              <Text style={{ color: '#7B8496', fontSize: 10 }} numberOfLines={1}>
                · {media.genres[0]}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function MediaRow({
  title,
  data,
  isLoading,
  listType,
}: {
  title: string
  data: AniListMedia[] | undefined
  isLoading: boolean
  listType: string
}) {
  const navigation = useNavigation()

  return (
    <View style={{ marginTop: 28 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ListAll' as never, { type: listType } as never)}>
          <Text style={{ color: '#6C5CE7', fontSize: 13 }}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ height: 190, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {data?.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

function SearchSection({ title, isLoading, isEmpty, children }: { title: string; isLoading: boolean; isEmpty: boolean; children: ReactNode }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: '#B8C1D1', fontSize: 14, paddingHorizontal: 20, marginBottom: 14 }}>{title}</Text>
      {isLoading ? (
        <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" />
        </View>
      ) : isEmpty ? (
        <Text style={{ color: '#7B8496', fontSize: 13, paddingHorizontal: 20 }}>No results</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {children}
        </ScrollView>
      )}
    </View>
  )
}

export function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('foryou')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 400)
  const isSearching = debouncedSearch.length >= 2

  const showAnime = activeTab === 'foryou' || activeTab === 'anime'
  const showManga = activeTab === 'manga'
  const showGames = activeTab === 'foryou' || activeTab === 'games'

  const { data: trendingAnime, isLoading: loadingAnime } = useTrendingAnime(10)
  const { data: trendingManga, isLoading: loadingManga } = useTrendingManga(10)
  const isGamesTab = activeTab === 'games'
  const topSellers = useStoreRow('topsellers', showGames && !isSearching)
  const newReleases = useStoreRow('new', isGamesTab && !isSearching)
  const specials = useStoreRow('specials', isGamesTab && !isSearching)
  const upcoming = useStoreRow('upcoming', isGamesTab && !isSearching)

  const { data: mediaResults, isLoading: loadingMediaSearch } = useSearchMedia(debouncedSearch, activeTab === 'manga' ? 'MANGA' : 'ANIME')
  const { data: gameResults, isLoading: loadingGameSearch } = useSearchGames(isSearching && showGames ? debouncedSearch : '')

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>Discover</Text>
          <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>Find your next obsession</Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#141826',
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
              gap: 10,
            }}
          >
            <Text style={{ color: '#7B8496', fontSize: 16 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: '#fff', fontSize: 15 }}
              placeholder="Search anime, manga, games..."
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} activeOpacity={0.8}>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor: active ? '#6C5CE7' : '#141826',
                    borderWidth: 1,
                    borderColor: active ? '#6C5CE7' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ color: active ? '#fff' : '#7B8496', fontSize: 14, fontWeight: active ? '600' : '400' }}>{tab.label}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Search results */}
        {isSearching && (
          <>
            {activeTab !== 'games' && (
              <SearchSection
                title={`${activeTab === 'manga' ? 'Manga' : 'Anime'} results for "${debouncedSearch}"`}
                isLoading={loadingMediaSearch}
                isEmpty={!mediaResults?.media.length}
              >
                {mediaResults?.media.map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </SearchSection>
            )}
            {showGames && (
              <SearchSection title={`Games for "${debouncedSearch}"`} isLoading={loadingGameSearch} isEmpty={!gameResults?.length}>
                {gameResults?.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </SearchSection>
            )}
          </>
        )}

        {/* Browse */}
        {!isSearching && (
          <>
            {showAnime && (
              <MediaRow title="Trending Anime" data={trendingAnime?.media} isLoading={loadingAnime} listType="trending-anime" />
            )}
            {(activeTab === 'foryou' || showManga) && (
              <MediaRow title="Trending Manga" data={trendingManga?.media} isLoading={loadingManga} listType="trending-manga" />
            )}
            {activeTab === 'foryou' && (
              <GameRow title="Popular Games" category="topsellers" data={topSellers.data} isLoading={topSellers.isLoading} isError={topSellers.isError} />
            )}
            {activeTab === 'games' && (
              <>
                <GameRow title="Top Sellers" category="topsellers" data={topSellers.data} isLoading={topSellers.isLoading} isError={topSellers.isError} />
                <GameRow title="New & Trending" category="new" data={newReleases.data} isLoading={newReleases.isLoading} isError={newReleases.isError} />
                <GameRow title="On Sale" category="specials" data={specials.data} isLoading={specials.isLoading} isError={specials.isError} />
                <GameRow title="Coming Soon" category="upcoming" data={upcoming.data} isLoading={upcoming.isLoading} isError={upcoming.isError} />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}
