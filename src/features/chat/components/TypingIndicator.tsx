// src/features/chat/components/TypingIndicator.tsx
// Three softly pulsing dots. Uses core Animated with the native driver, so it
// stays smooth and needs no extra dependency.
import { useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const CYCLE_MS = 1200
const PULSE_MS = 300

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: PULSE_MS, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: PULSE_MS, useNativeDriver: true }),
        Animated.delay(CYCLE_MS - 2 * PULSE_MS - delay),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [delay, opacity])

  return <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#B8C1D1', opacity }} />
}

export function TypingIndicator() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginVertical: 4 }}>
      <LinearGradient
        colors={['#6C5CE7', '#00D1FF']}
        style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2 }}
      >
        <Text style={{ color: '#fff', fontSize: 13 }}>◎</Text>
      </LinearGradient>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          backgroundColor: '#141826',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  )
}
