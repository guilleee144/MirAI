// src/features/media/screens/MediaDetailScreen.tsx
// Migrated from app/(app)/media/[id].tsx. Registered as 'MediaDetail' in AppStack.
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '@/app/navigation/types'
import { useMediaById } from '@/features/discover/hooks/useAniList'
import { getTitle, formatScore, type AniListMedia } from '@/services/anilist'

const { width, height } = Dimensions.get('window')

type Props = NativeStackScreenProps<AppStackParamList, 'MediaDetail'>

export function MediaDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const { data: media, isLoading } = useMediaById(Number(id))

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C5CE7" size="large" />
      </View>
    )
  }

  if (!media) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#7B8496' }}>Not found</Text>
      </View>
    )
  }

  const title = getTitle(media)
  const score = formatScore(media.averageScore)
  const studio = media.studios.nodes[0]?.name

  const statusLabel: Record<string, string> = {
    FINISHED: 'Finished',
    RELEASING: 'Airing',
    NOT_YET_RELEASED: 'Upcoming',
    CANCELLED: 'Cancelled',
    HIATUS: 'On Hiatus',
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Banner / Cover hero */}
        <View style={{ height: height * 0.45, position: 'relative' }}>
          {media.bannerImage ? (
            <Image source={{ uri: media.bannerImage }} style={{ width, height: height * 0.45 }} resizeMode="cover" />
          ) : (
            <Image source={{ uri: media.coverImage.extraLarge }} style={{ width, height: height * 0.45 }} resizeMode="cover" blurRadius={8} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(11,15,23,0.6)', '#0B0F17']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.3 }}
          />

          {/* Back button */}
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
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
          {/* Cover + title row */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
            <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Image source={{ uri: media.coverImage.large }} style={{ width: 100, height: 150 }} resizeMode="cover" />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 }}>{title}</Text>
              {media.title.native && <Text style={{ color: '#7B8496', fontSize: 12, marginBottom: 8 }}>{media.title.native}</Text>}
              {studio && <Text style={{ color: '#B8C1D1', fontSize: 13, marginBottom: 10 }}>{studio}</Text>}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: 'rgba(255,179,71,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: '#FFB347', fontSize: 12 }}>★</Text>
                  <Text style={{ color: '#FFB347', fontSize: 12, fontWeight: '700' }}>{score}</Text>
                </View>
                {media.status && (
                  <View style={{ backgroundColor: 'rgba(46,229,157,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#2EE59D', fontSize: 12 }}>{statusLabel[media.status] ?? media.status}</Text>
                  </View>
                )}
                {media.format && (
                  <View style={{ backgroundColor: 'rgba(108,92,231,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#8B7FF0', fontSize: 12 }}>{media.format}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', backgroundColor: '#141826', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            {media.episodes && (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{media.episodes}</Text>
                <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 2 }}>Episodes</Text>
              </View>
            )}
            {media.chapters && (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{media.chapters}</Text>
                <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 2 }}>Chapters</Text>
              </View>
            )}
            {media.volumes && (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{media.volumes}</Text>
                <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 2 }}>Volumes</Text>
              </View>
            )}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{(media.popularity / 1000).toFixed(0)}K</Text>
              <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 2 }}>Popularity</Text>
            </View>
            {media.seasonYear && (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{media.seasonYear}</Text>
                <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 2 }}>Year</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85}>
              <LinearGradient
                colors={['#6C5CE7', '#8B7FF0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>+ Add to list</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#141826',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18 }}>♡</Text>
            </TouchableOpacity>
          </View>

          {/* Genres */}
          {media.genres.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Genres</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {media.genres.map((genre) => (
                  <View key={genre} style={{ backgroundColor: 'rgba(108,92,231,0.12)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ color: '#8B7FF0', fontSize: 13 }}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {media.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Synopsis</Text>
              <Text style={{ color: '#B8C1D1', fontSize: 14, lineHeight: 22 }}>{media.description.replace(/<[^>]*>/g, '')}</Text>
            </View>
          )}

          {/* Recommendations */}
          {(media as any).recommendations?.nodes?.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>You might also like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {(media as any).recommendations.nodes
                  .filter((n: any) => n.mediaRecommendation)
                  .slice(0, 10)
                  .map((node: any) => {
                    const rec: AniListMedia = node.mediaRecommendation
                    return (
                      <TouchableOpacity
                        key={rec.id}
                        activeOpacity={0.85}
                        onPress={() => navigation.push('MediaDetail', { id: String(rec.id), type: rec.type })}
                      >
                        <View style={{ width: 110, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                          <Image source={{ uri: rec.coverImage.large }} style={{ width: 110, height: 160 }} resizeMode="cover" />
                          <View style={{ padding: 6, backgroundColor: '#141826' }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
                              {getTitle(rec)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                              <Text style={{ color: '#FFB347', fontSize: 9 }}>★</Text>
                              <Text style={{ color: '#7B8496', fontSize: 9 }}>{formatScore(rec.averageScore)}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
