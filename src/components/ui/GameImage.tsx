// src/components/ui/GameImage.tsx
// Game cover that survives broken URLs: tries each source in order and only shows
// the placeholder when every one of them fails.
import { useEffect, useState } from 'react'
import { Image, Text, View, type ImageStyle, type ViewStyle } from 'react-native'

interface GameImageProps {
  sources: string[]
  style: ImageStyle
}

export function GameImage({ sources, style }: GameImageProps) {
  const [index, setIndex] = useState(0)
  const signature = sources.join('|')

  // New game in a recycled card → start from the first source again.
  useEffect(() => {
    setIndex(0)
  }, [signature])

  if (index >= sources.length) {
    return (
      <View style={[style as ViewStyle, { backgroundColor: '#1B2133', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 22, opacity: 0.4 }}>🎮</Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri: sources[index] }}
      style={[{ backgroundColor: '#1B2133' }, style]}
      resizeMode="cover"
      onError={() => setIndex((current) => current + 1)}
    />
  )
}
