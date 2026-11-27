// src/features/media/screens/GameDetailScreen.tsx
// Detail page for a game found in Discover. Registered as 'GameDetail' in AppStack.
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '@/app/navigation/types'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { GameImage } from '@/components/ui/GameImage'
import { GameMedia } from '@/features/media/components/GameMedia'
import { useStoreGameDetail } from '@/features/discover/hooks/useSteamStore'
import { getStatusLabel, STATUS_COLORS } from '@/features/library/constants'
import { getPlaytimeHours } from '@/features/library/libraryStats'
import type { StoreGameDetail } from '@/services/steamStore'

const { width } = Dimensions.get('window')
const HERO_HEIGHT = Math.round((width * 215) / 460)

type Props = NativeStackScreenProps<AppStackParamList, 'GameDetail'>

/** The user's tracking row for this game, if they already have it in the library. */
function useLibraryEntry(appId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['tracking', 'game', user?.id, appId],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking')
        .select('*')
        .eq('user_id', user!.id)
        .eq('content_type', 'game')
        .eq('external_id', appId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
  })
}

function useAddToLibrary(game: StoreGameDetail | null | undefined, appId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!user?.id || !game) return
      // ignoreDuplicates: never overwrite a row the Steam sync already filled in.
      const { error } = await supabase.from('tracking').upsert(
        {
          user_id: user.id,
          content_type: 'game' as const,
          external_id: appId,
          title: game.name,
          cover_image: game.image,
          status: 'plan_to_watch' as const,
          progress: 0,
          metadata: { steam_appid: game.id, source: 'discover' },
        },
        { onConflict: 'user_id,content_type,external_id', ignoreDuplicates: true }
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracking', 'game', user?.id, appId] }),
  })
}

function Badge({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <View style={{ backgroundColor: background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  )
}

export function GameDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const { data: game, isLoading, isError } = useStoreGameDetail(Number(id))
  const { data: entry } = useLibraryEntry(id)
  const addToLibrary = useAddToLibrary(game, id)

  const backButton = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        position: 'absolute',
        top: 56,
        left: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(11,15,23,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C5CE7" size="large" />
        {backButton}
      </View>
    )
  }

  if (!game) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ color: '#7B8496', textAlign: 'center' }}>
          {isError ? "Couldn't load this game right now." : 'This game is not available in the store.'}
        </Text>
        {backButton}
      </View>
    )
  }

  const inLibrary = !!entry
  const entryStatus = entry?.status ?? 'plan_to_watch'
  const entryHours = entry ? getPlaytimeHours(entry) : 0

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ height: HERO_HEIGHT + 40 }}>
          <GameImage sources={game.imageSources} style={{ width, height: HERO_HEIGHT + 40 }} />
          <LinearGradient
            colors={['transparent', 'rgba(11,15,23,0.7)', '#0B0F17']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
          />
          {backButton}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 }}>{game.name}</Text>
          {game.developers.length > 0 && (
            <Text style={{ color: '#B8C1D1', fontSize: 13, marginBottom: 12 }}>{game.developers.join(', ')}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {game.price && (
              <Badge
                label={game.discountPercent > 0 ? `${game.price} · -${game.discountPercent}%` : game.price}
                color="#2EE59D"
                background="rgba(46,229,157,0.12)"
              />
            )}
            {game.metacriticScore !== null && (
              <Badge label={`Metacritic ${game.metacriticScore}`} color="#FFB347" background="rgba(255,179,71,0.15)" />
            )}
            {game.releaseDate && (
              <Badge
                label={game.comingSoon ? `Coming ${game.releaseDate}` : game.releaseDate}
                color="#8B7FF0"
                background="rgba(108,92,231,0.15)"
              />
            )}
          </View>

          {/* Library action */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {inLibrary ? (
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: '#141826',
                  borderWidth: 1,
                  borderColor: `${STATUS_COLORS[entryStatus]}55`,
                }}
              >
                <Text style={{ color: STATUS_COLORS[entryStatus], fontSize: 14, fontWeight: '600' }}>
                  In your library · {getStatusLabel('game', entryStatus)}
                  {entryHours > 0 ? ` · ${entryHours}h` : ''}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85} disabled={addToLibrary.isPending} onPress={() => addToLibrary.mutate()}>
                <LinearGradient
                  colors={['#6C5CE7', '#8B7FF0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                >
                  {addToLibrary.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>+ Add to backlog</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://store.steampowered.com/app/${game.id}`)}
              activeOpacity={0.8}
              style={{
                borderRadius: 12,
                paddingHorizontal: 16,
                backgroundColor: '#141826',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '600' }}>Steam ↗</Text>
            </TouchableOpacity>
          </View>
          {addToLibrary.isError && (
            <Text style={{ color: '#FF6B6B', fontSize: 12, marginTop: -14, marginBottom: 16 }}>Couldn't add it, try again.</Text>
          )}

          <GameMedia trailer={game.trailer} screenshots={game.screenshots} />

          {game.genres.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Genres</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {game.genres.map((genre) => (
                  <View
                    key={genre}
                    style={{ backgroundColor: 'rgba(108,92,231,0.12)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 }}
                  >
                    <Text style={{ color: '#8B7FF0', fontSize: 13 }}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!!game.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>About</Text>
              <Text style={{ color: '#B8C1D1', fontSize: 14, lineHeight: 22 }}>{game.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
