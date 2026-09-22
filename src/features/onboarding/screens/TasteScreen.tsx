// src/features/onboarding/screens/TasteScreen.tsx
// Migrated from app/(auth)/onboarding/taste.tsx.
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { OnboardingStackParamList } from '@/app/navigation/types'

const GENRES = [
  { id: 'action', label: 'Action', emoji: '⚡' },
  { id: 'drama', label: 'Drama', emoji: '🎭' },
  { id: 'fantasy', label: 'Fantasy', emoji: '✨' },
  { id: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { id: 'horror', label: 'Horror', emoji: '👁' },
  { id: 'romance', label: 'Romance', emoji: '🌸' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍' },
  { id: 'psychological', label: 'Psychological', emoji: '🧠' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺' },
  { id: 'slice-of-life', label: 'Slice of Life', emoji: '☕' },
  { id: 'sports', label: 'Sports', emoji: '🏆' },
  { id: 'supernatural', label: 'Supernatural', emoji: '👻' },
]

const MOODS = [
  { id: 'intense', label: 'Intense & gripping', color: '#FF6B6B' },
  { id: 'calm', label: 'Calm & relaxing', color: '#00D1FF' },
  { id: 'excited', label: 'Hype & exciting', color: '#6C5CE7' },
  { id: 'emotional', label: 'Emotional & deep', color: '#FFB347' },
  { id: 'funny', label: 'Fun & lighthearted', color: '#2EE59D' },
  { id: 'dark', label: 'Dark & complex', color: '#B8C1D1' },
]

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Taste'>

export function TasteScreen({ navigation }: Props) {
  const { user } = useAuth()
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const handleContinue = async () => {
    if (selectedGenres.length < 3) {
      Alert.alert('Select at least 3 genres', 'Help MirAI understand your taste better.')
      return
    }

    if (!user) return
    setIsLoading(true)

    const genreMap = selectedGenres.reduce<Record<string, number>>((acc, g) => {
      acc[g] = 80
      return acc
    }, {})

    const moodMap = selectedMoods.reduce<Record<string, number>>((acc, m) => {
      acc[m] = 80
      return acc
    }, {})

    const { error } = await supabase.from('user_taste').upsert({
      user_id: user.id,
      genres: genreMap,
      moods: moodMap,
    })

    setIsLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    navigation.navigate('Connect')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{ color: '#7B8496', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}
          >
            Step 1 of 2
          </Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>
            What do you love?
          </Text>
          <Text style={{ color: '#B8C1D1', fontSize: 15, lineHeight: 22 }}>
            Pick at least 3 genres. MirAI will use this to find content you'll actually enjoy.
          </Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Genres</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
          {GENRES.map((genre) => {
            const selected = selectedGenres.includes(genre.id)
            return (
              <TouchableOpacity key={genre.id} onPress={() => toggleGenre(genre.id)} activeOpacity={0.75}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 100,
                    backgroundColor: selected ? 'rgba(108,92,231,0.2)' : '#141826',
                    borderWidth: 1,
                    borderColor: selected ? '#6C5CE7' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{genre.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: selected ? '#8B7FF0' : '#B8C1D1' }}>
                    {genre.label}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
          What mood do you usually prefer?
        </Text>
        <View style={{ gap: 10, marginBottom: 48 }}>
          {MOODS.map((mood) => {
            const selected = selectedMoods.includes(mood.id)
            return (
              <TouchableOpacity key={mood.id} onPress={() => toggleMood(mood.id)} activeOpacity={0.75}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: selected ? 'rgba(108,92,231,0.12)' : '#141826',
                    borderWidth: 1,
                    borderColor: selected ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: mood.color }} />
                    <Text
                      style={{
                        fontSize: 15,
                        color: selected ? '#fff' : '#B8C1D1',
                        fontWeight: selected ? '500' : '400',
                      }}
                    >
                      {mood.label}
                    </Text>
                  </View>
                  {selected && <Text style={{ color: '#6C5CE7', fontSize: 16 }}>✓</Text>}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={{ color: '#7B8496', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
          {selectedGenres.length} genres selected{' '}
          {selectedGenres.length < 3 ? `(${3 - selectedGenres.length} more needed)` : '✓'}
        </Text>

        <TouchableOpacity onPress={handleContinue} disabled={isLoading || selectedGenres.length < 3} activeOpacity={0.85}>
          <LinearGradient
            colors={selectedGenres.length >= 3 ? ['#6C5CE7', '#8B7FF0'] : ['#1B2133', '#1B2133']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: selectedGenres.length >= 3 ? '#fff' : '#7B8496',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Continue →
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
