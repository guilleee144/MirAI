// src/features/discover/screens/GameListScreen.tsx
// "See all" for games. Registered as 'GameList' in AppStack. Loads 30 games per page.
import { useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '@/app/navigation/types'
import { GameCard } from '@/features/discover/components/GameCard'
import { useStoreList } from '@/features/discover/hooks/useSteamStore'
import { GAME_LIST_CONFIG, type StoreGame } from '@/services/steamStore'

const GAP = 12
const SIDE_PADDING = 20
const CARD_WIDTH = Math.floor((Dimensions.get('window').width - SIDE_PADDING * 2 - GAP) / 2)

type Props = NativeStackScreenProps<AppStackParamList, 'GameList'>

export function GameListScreen({ route, navigation }: Props) {
  const category = route.params?.category ?? 'topsellers'
  const config = GAME_LIST_CONFIG[category]
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useStoreList(category)

  // Pages can overlap by a game or two; keep each game once.
  const games = useMemo(() => {
    const seen = new Set<number>()
    const unique: StoreGame[] = []
    for (const page of data?.pages ?? []) {
      for (const game of page.games) {
        if (seen.has(game.id)) continue
        seen.add(game.id)
        unique.push(game)
      }
    }
    return unique
  }, [data])

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.1)', 'transparent']}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <View style={{ paddingTop: 56, paddingHorizontal: SIDE_PADDING, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>{config.title}</Text>
          <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>{config.subtitle}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" size="large" />
        </View>
      ) : isError && games.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#7B8496', textAlign: 'center', marginBottom: 16 }}>Couldn't load games right now.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <LinearGradient colors={['#6C5CE7', '#8B7FF0']} style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Try again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(game) => String(game.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: SIDE_PADDING }}
          contentContainerStyle={{ paddingBottom: 40, gap: GAP }}
          renderItem={({ item }) => <GameCard game={item} width={CARD_WIDTH} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color="#6C5CE7" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
