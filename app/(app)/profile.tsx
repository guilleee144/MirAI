// app/(app)/profile.tsx
import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { AniListLogo, MyAnimeListLogo, SteamLogo } from '@/components/ui/ConnectionLogos'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserTaste = Database['public']['Tables']['user_taste']['Row']

const RADAR_SIZE = 200
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = 75

function getRadarPoint(angle: number, value: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  const r = (value / 100) * radius
  return { x: RADAR_CENTER + r * Math.cos(rad), y: RADAR_CENTER + r * Math.sin(rad) }
}

function TasteRadar({ genres }: { genres: Record<string, number> }) {
  const entries = Object.entries(genres).slice(0, 6)
  if (entries.length < 3) return null
  const angleStep = 360 / entries.length
  const points = entries.map(([_, value], i) => getRadarPoint(i * angleStep, value, RADAR_RADIUS))
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
      {[25, 50, 75, 100].map(level => {
        const gp = entries.map((_, i) => getRadarPoint(i * angleStep, level, RADAR_RADIUS))
        return <Polygon key={level} points={gp.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}
      {entries.map((_, i) => {
        const outer = getRadarPoint(i * angleStep, 100, RADAR_RADIUS)
        return <Line key={i} x1={RADAR_CENTER} y1={RADAR_CENTER} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}
      <Polygon points={pointsStr} fill="rgba(108,92,231,0.25)" stroke="#6C5CE7" strokeWidth="2" />
      {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#6C5CE7" />)}
      {entries.map(([label], i) => {
        const pos = getRadarPoint(i * angleStep, 120, RADAR_RADIUS)
        return <SvgText key={i} x={pos.x} y={pos.y} fill="#B8C1D1" fontSize="9" textAnchor="middle" alignmentBaseline="middle">{label.charAt(0).toUpperCase() + label.slice(1)}</SvgText>
      })}
    </Svg>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#141826', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
      <Text style={{ color, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 4, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

function ConnectionCard({ name, logo, connected }: { name: string; logo: React.ReactNode; connected: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#141826', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {logo}
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>{name}</Text>
      </View>
      <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, backgroundColor: connected ? 'rgba(46,229,157,0.12)' : 'rgba(255,255,255,0.06)' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: connected ? '#2EE59D' : '#7B8496' }}>
          {connected ? 'Connected' : 'Connect'}
        </Text>
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [taste, setTaste] = useState<UserTaste | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [steamConnected, setSteamConnected] = useState(false)
  const [anilistConnected, setAnilistConnected] = useState(false)
  const [animeCount, setAnimeCount] = useState(0)
  const [mangaCount, setMangaCount] = useState(0)
  const [gamesCount, setGamesCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
  }, [user?.id])

  const loadProfile = async () => {
    if (!user) return
    setIsLoading(true)

    const [
      { data: profileData },
      { data: tasteData },
      { data: steamData },
      { data: anilistData },
      { count: animeC },
      { count: mangaC },
      { count: gamesC },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_taste').select('*').eq('user_id', user.id).single(),
      supabase.from('tracking').select('id').eq('user_id', user.id).eq('content_type', 'game').limit(1),
      supabase.from('tracking').select('id').eq('user_id', user.id).in('content_type', ['anime', 'manga']).limit(1),
      supabase.from('tracking').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('content_type', 'anime').eq('status', 'completed'),
      supabase.from('tracking').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('content_type', 'manga').eq('status', 'completed'),
      supabase.from('tracking').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('content_type', 'game'),
    ])

    setProfile(profileData)
    setTaste(tasteData)
    setSteamConnected((steamData?.length ?? 0) > 0)
    setAnilistConnected((anilistData?.length ?? 0) > 0)
    setAnimeCount(animeC ?? 0)
    setMangaCount(mangaC ?? 0)
    setGamesCount(gamesC ?? 0)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C5CE7" size="large" />
      </View>
    )
  }

  const username = profile?.username ?? user?.user_metadata?.['username'] ?? 'User'
  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const xpForNext = level * 500
  const xpProgress = Math.min((xp / xpForNext) * 100, 100)
  const genres = (taste?.genres as Record<string, number> | null) ?? {}

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>My Profile</Text>
            <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>Your anime, manga & gaming journey</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/edit-profile' as any)} style={{ marginTop: 4 }}>
            <View style={{ backgroundColor: '#141826', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: '#B8C1D1', fontSize: 13 }}>Edit ✎</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
              style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(108,92,231,0.4)' }}
            />
          ) : (
            <LinearGradient
              colors={['#6C5CE7', '#00D1FF']}
              style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{username}</Text>
            <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>Level {level} · Anime Fanatic</Text>
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: '#7B8496', fontSize: 11 }}>{xp} XP</Text>
                <Text style={{ color: '#7B8496', fontSize: 11 }}>{xpForNext} XP</Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <View style={{ height: 4, width: `${xpProgress}%`, borderRadius: 2, backgroundColor: '#6C5CE7' }} />
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard value={animeCount} label="Anime Watched" color="#6C5CE7" />
            <StatCard value={mangaCount} label="Manga Read" color="#00D1FF" />
            <StatCard value={gamesCount} label="Games Played" color="#2EE59D" />
          </View>
        </View>

        {/* Taste Radar */}
        {Object.keys(genres).length >= 3 && (
          <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Your taste</Text>
            <View style={{ backgroundColor: '#141826', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <TasteRadar genres={genres} />
            </View>
          </View>
        )}

        {/* Connections */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Connections</Text>
          <View style={{ gap: 10 }}>
            <TouchableOpacity onPress={() => router.push('/(app)/connect-anilist' as any)}>
              <ConnectionCard name="AniList" logo={<AniListLogo size={40} />} connected={anilistConnected} />
            </TouchableOpacity>
            <ConnectionCard name="MyAnimeList" logo={<MyAnimeListLogo size={40} />} connected={false} />
            <TouchableOpacity onPress={() => router.push('/(app)/connect-steam' as any)}>
              <ConnectionCard name="Steam" logo={<SteamLogo size={40} />} connected={steamConnected} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <TouchableOpacity onPress={signOut} activeOpacity={0.8}>
            <View style={{ backgroundColor: 'rgba(255,107,107,0.08)', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)' }}>
              <Text style={{ color: '#FF6B6B', fontSize: 15, fontWeight: '600' }}>Sign out</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}