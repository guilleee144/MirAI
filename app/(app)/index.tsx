// app/(app)/index.tsx
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useAuth } from '@/providers/AuthProvider'

const MOODS = [
  { id: 'energetic', label: 'Energetic', color: '#FFB347' },
  { id: 'calm', label: 'Calm', color: '#00D1FF' },
  { id: 'excited', label: 'Excited', color: '#6C5CE7' },
  { id: 'intense', label: 'Intense', color: '#FF6B6B' },
  { id: 'happy', label: 'Happy', color: '#2EE59D' },
]

const TOP_PICKS = [
  { id: '1', title: 'Solo Leveling', score: 9.4, gradient: ['#6C5CE7', '#0B0F17'] as const },
  { id: '2', title: 'Chainsaw Man', score: 8.9, gradient: ['#FF6B6B', '#0B0F17'] as const },
  { id: '3', title: 'Cyberpunk\nEdgerunners', score: 9.1, gradient: ['#00D1FF', '#0B0F17'] as const },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const username = user?.user_metadata?.['username'] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 8,
        }}>
          <View>
            <Text style={{ color: '#7B8496', fontSize: 13 }}>
              {greeting}, {username} 👋
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 }}>
              MirAI
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile' as any)}>
            <LinearGradient
              colors={['#6C5CE7', '#00D1FF']}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Companion card */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <TouchableOpacity onPress={() => router.push('/(app)/chat' as any)} activeOpacity={0.9}>
            <LinearGradient
              colors={['rgba(108,92,231,0.7)', 'rgba(0,209,255,0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(108,92,231,0.4)' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>MirAI</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
                    Based on your mood, I found some perfect recommendations for you.
                  </Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Let's explore ✨</Text>
                  </View>
                </View>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 16, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 36 }}>◎</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Mood selector */}
        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#B8C1D1', fontSize: 13 }}>Your current mood</Text>
            <Text style={{ color: '#7B8496', fontSize: 11 }}>7-day overview</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {MOODS.map((mood) => (
                <TouchableOpacity key={mood.id} activeOpacity={0.8}>
                  <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mood.color }} />
                    <Text style={{ color: '#B8C1D1', fontSize: 13 }}>{mood.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Quick actions */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Anime', emoji: '▶', color: '#6C5CE7', bg: 'rgba(108,92,231,0.15)' },
              { label: 'Manga', emoji: '📖', color: '#00D1FF', bg: 'rgba(0,209,255,0.1)' },
              { label: 'Games', emoji: '🎮', color: '#2EE59D', bg: 'rgba(46,229,157,0.1)' },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={{ flex: 1 }} activeOpacity={0.8} onPress={() => router.push('/(app)/discover' as any)}>
                <View style={{ backgroundColor: item.bg, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  <Text style={{ color: item.color, fontSize: 13, fontWeight: '600' }}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top picks */}
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Top picks for you</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/discover' as any)}>
              <Text style={{ color: '#6C5CE7', fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {TOP_PICKS.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.85}>
                <View style={{ width: 130, height: 190, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <LinearGradient colors={item.gradient} style={{ flex: 1, padding: 12, justifyContent: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: '#FFB347', fontSize: 10 }}>★</Text>
                      <Text style={{ color: '#B8C1D1', fontSize: 10 }}>{item.score}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent activity */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 14 }}>Recent activity</Text>
          <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: '#7B8496', fontSize: 14, textAlign: 'center' }}>
              Start tracking anime, manga and games to see your activity here.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(app)/discover' as any)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#6C5CE7', fontSize: 14, fontWeight: '600' }}>Discover content →</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}