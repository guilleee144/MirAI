// src/features/onboarding/screens/WelcomeScreen.tsx
// Migrated from app/(auth)/onboarding/welcome.tsx.
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OnboardingStackParamList } from '@/app/navigation/types'

const { height } = Dimensions.get('window')

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.2)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,209,255,0.08)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.4 }}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ marginBottom: 40 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              backgroundColor: '#141826',
              borderWidth: 1,
              borderColor: 'rgba(108,92,231,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinearGradient
              colors={['#6C5CE7', '#00D1FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff' }}>M</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -2 }}>MirAI</Text>
          <Text
            style={{
              fontSize: 13,
              color: '#7B8496',
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            未来 · Future
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 17, color: '#B8C1D1', textAlign: 'center', lineHeight: 26, maxWidth: 300 }}>
            Your AI companion for anime, manga and gaming. Remembers you. Understands you.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 64 }}>
          {['AI Memory', 'Smart Recs', 'Mood Aware', 'AniList Sync'].map((f) => (
            <View
              key={f}
              style={{
                backgroundColor: 'rgba(108,92,231,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(108,92,231,0.25)',
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: '#8B7FF0', fontSize: 13, fontWeight: '500' }}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={{ width: '100%' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Taste')} activeOpacity={0.85}>
            <LinearGradient
              colors={['#6C5CE7', '#8B7FF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Get started →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
