// src/features/profile/screens/ProfileScreen.tsx
// XP, level and both taste charts are derived from the user's library (see profileStats.ts).
import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { AniListLogo, SteamLogo } from '@/components/ui/ConnectionLogos'
import { TasteRadar } from '@/components/ui/TasteRadar'
import { syncConnections } from '@/features/connections/services/syncConnections'
import { fetchProfileItems } from '../profileData'
import {
  XP_RULES,
  computeTaste,
  computeXp,
  getGameHours,
  getLevelInfo,
  getRank,
  hasRadar,
  isMissingGenres,
  type ProfileItem,
  type RadarDatum,
} from '../profileStats'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

// Genre data arrived after the first imports: re-sync once per app launch to fill it in.
let genreBackfillStarted = false

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_GAP = 10
const TASTE_CARD_PADDING = 12
const RADAR_SIZE = Math.floor((SCREEN_WIDTH - 40 - CARD_GAP) / 2) - TASTE_CARD_PADDING * 2

function formatNumber(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#141826', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
      <Text style={{ color, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 4, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

function ConnectionCard({ name, logo, connected }: { name: string; logo: ReactNode; connected: boolean }) {
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

function TasteCard({
  title,
  subtitle,
  data,
  color,
  emptyText,
  actionLabel,
  onAction,
}: {
  title: string
  subtitle: string
  data: RadarDatum[]
  color: string
  emptyText: string
  actionLabel: string
  onAction: () => void
}) {
  const hasData = hasRadar(data)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#141826',
        borderRadius: 20,
        padding: TASTE_CARD_PADDING,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 2, marginBottom: 6 }}>{subtitle}</Text>

      {hasData ? (
        <>
          <TasteRadar data={data} size={RADAR_SIZE} color={color} />
          <Text style={{ color: '#B8C1D1', fontSize: 11, textAlign: 'center' }} numberOfLines={2}>
            Top: {data.slice(0, 2).map((datum) => datum.label).join(' · ')}
          </Text>
        </>
      ) : (
        <View style={{ height: RADAR_SIZE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <Text style={{ color: '#7B8496', fontSize: 12, textAlign: 'center', lineHeight: 17, marginBottom: 12 }}>{emptyText}</Text>
          <TouchableOpacity onPress={onAction} activeOpacity={0.8}>
            <View style={{ borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: `${color}22`, borderWidth: 1, borderColor: `${color}55` }}>
              <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{actionLabel}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

function XpRow({ label, detail, xp, color }: { label: string; detail: string; xp: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{label}</Text>
          <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 1 }}>{detail}</Text>
        </View>
      </View>
      <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{formatNumber(xp)} XP</Text>
    </View>
  )
}

export function ProfileScreen() {
  const { user, signOut } = useAuth()
  const navigation = useNavigation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [items, setItems] = useState<ProfileItem[]>([])
  const [onboardingGenres, setOnboardingGenres] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isXpOpen, setIsXpOpen] = useState(false)

  // Runs on every focus so changes made elsewhere (AniList/Steam import, edit
  // profile) show up when you come back. Only the first load shows the spinner.
  const loadProfile = useCallback(async () => {
    if (!user) return

    const [{ data: profileData }, { data: tasteData }, profileItems] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_taste').select('genres').eq('user_id', user.id).maybeSingle(),
      fetchProfileItems(user.id),
    ])

    setProfile(profileData)
    setItems(profileItems)
    setOnboardingGenres((tasteData?.genres as Record<string, number> | null) ?? {})
    setIsLoading(false)

    // Keep the stored XP / level in step with the derived ones (other features read them).
    const summary = computeXp(profileItems)
    const { level } = getLevelInfo(summary.total)
    if (profileData && (profileData.xp !== summary.total || profileData.level !== level)) {
      supabase
        .from('profiles')
        .update({ xp: summary.total, level })
        .eq('id', user.id)
        .then(() => undefined)
    }

    // Titles imported before genres were stored: one background re-sync fills them in.
    const isConnected = !!profileData?.anilist_username || !!profileData?.steam_id
    if (!genreBackfillStarted && isConnected && profileItems.some(isMissingGenres)) {
      genreBackfillStarted = true
      syncConnections(user.id)
        .then(async (result) => {
          if (result.attempted > 0) setItems(await fetchProfileItems(user.id))
        })
        .catch(() => undefined)
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [loadProfile])
  )

  const xp = useMemo(() => computeXp(items), [items])
  const levelInfo = useMemo(() => getLevelInfo(xp.total), [xp.total])
  const taste = useMemo(() => computeTaste(items, onboardingGenres), [items, onboardingGenres])
  const gamesPlayed = useMemo(() => items.filter((item) => item.content_type === 'game' && getGameHours(item) > 0).length, [items])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C5CE7" size="large" />
      </View>
    )
  }

  const steamConnected = !!profile?.steam_id
  const anilistConnected = !!profile?.anilist_username
  const username = profile?.username ?? user?.user_metadata?.['username'] ?? 'User'
  const xpProgress = Math.min((levelInfo.xpIntoLevel / levelInfo.xpForNext) * 100, 100)

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>My Profile</Text>
            <Text style={{ color: '#7B8496', fontSize: 14, marginTop: 4 }}>Your anime, manga & gaming journey</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile' as never)} style={{ marginTop: 4 }}>
            <View style={{ backgroundColor: '#141826', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: '#B8C1D1', fontSize: 13 }}>Edit ✎</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar + level */}
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
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{username.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{username}</Text>
            <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>
              Level {levelInfo.level} · {getRank(levelInfo.level)}
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsXpOpen((open) => !open)} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: '#7B8496', fontSize: 11 }}>{formatNumber(levelInfo.xpIntoLevel)} XP</Text>
                <Text style={{ color: '#7B8496', fontSize: 11 }}>{formatNumber(levelInfo.xpForNext)} XP</Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <View style={{ height: 4, width: `${xpProgress}%`, borderRadius: 2, backgroundColor: '#6C5CE7' }} />
              </View>
              <Text style={{ color: '#6C5CE7', fontSize: 11, marginTop: 6 }}>{isXpOpen ? 'Hide details ▴' : 'How XP works ▾'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* XP breakdown */}
        {isXpOpen && (
          <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
            <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Total XP</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{formatNumber(xp.total)}</Text>
              </View>
              <XpRow label="Anime" detail={`${formatNumber(xp.anime.amount)} episodes · ${xp.anime.completed} completed`} xp={xp.anime.xp} color="#6C5CE7" />
              <XpRow label="Manga" detail={`${formatNumber(xp.manga.amount)} chapters · ${xp.manga.completed} completed`} xp={xp.manga.xp} color="#00D1FF" />
              <XpRow label="Games" detail={`${formatNumber(xp.games.amount)} hours · ${xp.games.completed} completed`} xp={xp.games.xp} color="#2EE59D" />
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 }} />
              <Text style={{ color: '#7B8496', fontSize: 11, lineHeight: 17 }}>
                {XP_RULES.episode} XP per episode · {XP_RULES.chapter} XP per chapter · {XP_RULES.gameHour} XP per hour played · +{XP_RULES.completed} XP per completed title · +{XP_RULES.rated} XP per rating. It updates by itself when AniList and Steam sync.
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard value={xp.anime.completed} label="Anime Watched" color="#6C5CE7" />
            <StatCard value={xp.manga.completed} label="Manga Read" color="#00D1FF" />
            <StatCard value={gamesPlayed} label="Games Played" color="#2EE59D" />
          </View>
        </View>

        {/* Taste: one chart for anime & manga, one for games */}
        <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Your taste</Text>
          <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
            <TasteCard
              title="Anime & Manga"
              subtitle={taste.animeMangaSource === 'activity' ? 'From your lists' : 'From your picks'}
              data={taste.animeManga}
              color="#6C5CE7"
              emptyText="Add anime or manga to see your taste"
              actionLabel={anilistConnected ? 'Open AniList' : 'Connect AniList'}
              onAction={() => navigation.navigate('ConnectAniList' as never)}
            />
            <TasteCard
              title="Games"
              subtitle="From your playtime"
              data={taste.games}
              color="#2EE59D"
              emptyText={steamConnected ? 'Sync your Steam library to see your taste' : 'Connect Steam to see your taste'}
              actionLabel={steamConnected ? 'Open Steam' : 'Connect Steam'}
              onAction={() => navigation.navigate('ConnectSteam' as never)}
            />
          </View>
        </View>

        {/* Connections */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Connections</Text>
          <View style={{ gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ConnectAniList' as never)}>
              <ConnectionCard name="AniList" logo={<AniListLogo size={40} />} connected={anilistConnected} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ConnectSteam' as never)}>
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
