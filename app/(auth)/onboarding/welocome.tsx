// app/(auth)/onboarding/welcome.tsx
import { useEffect } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const titleOpacity = useSharedValue(0)
  const titleY = useSharedValue(20)
  const subtitleOpacity = useSharedValue(0)
  const btnOpacity = useSharedValue(0)
  const floatY = useSharedValue(0)

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 800 })
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) })

    // Title
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }))
    titleY.value = withDelay(400, withTiming(0, { duration: 600 }))

    // Subtitle
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }))

    // Button
    btnOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }))

    // Float loop
    floatY.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    )
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: floatY.value }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }))

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }))

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }))

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      {/* Background glows */}
      <LinearGradient
        colors={['rgba(108,92,231,0.2)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,209,255,0.08)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.4 }}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

        {/* Logo */}
        <Animated.View style={[logoStyle, { marginBottom: 40 }]}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            backgroundColor: '#141826',
            borderWidth: 1,
            borderColor: 'rgba(108,92,231,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LinearGradient
              colors={['#6C5CE7', '#00D1FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff' }}>M</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[titleStyle, { alignItems: 'center', marginBottom: 16 }]}>
          <Text style={{
            fontSize: 48,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: -2,
          }}>
            MirAI
          </Text>
          <Text style={{
            fontSize: 13,
            color: '#7B8496',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            未来 · Future
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[subtitleStyle, { alignItems: 'center', marginBottom: 64 }]}>
          <Text style={{
            fontSize: 17,
            color: '#B8C1D1',
            textAlign: 'center',
            lineHeight: 26,
            maxWidth: 300,
          }}>
            Your AI companion for anime, manga and gaming. Remembers you. Understands you.
          </Text>
        </Animated.View>

        {/* Features pills */}
        <Animated.View style={[subtitleStyle, {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 64,
        }]}>
          {['AI Memory', 'Smart Recs', 'Mood Aware', 'AniList Sync'].map((f) => (
            <View key={f} style={{
              backgroundColor: 'rgba(108,92,231,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(108,92,231,0.25)',
              borderRadius: 100,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}>
              <Text style={{ color: '#8B7FF0', fontSize: 13, fontWeight: '500' }}>{f}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View style={[btnStyle, { width: '100%' }]}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding/taste' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6C5CE7', '#8B7FF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Get started →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  )
}